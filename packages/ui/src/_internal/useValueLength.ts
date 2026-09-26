import * as React from 'react';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

type TextField = HTMLInputElement | HTMLTextAreaElement;

/** The descriptor `el.value` resolves to today: the element's own (React's value
 *  tracker installs one on every input) or the one on its prototype chain. */
function valueDescriptor(el: TextField): PropertyDescriptor | undefined {
  for (let o: object | null = el; o; o = Object.getPrototypeOf(o)) {
    const d = Object.getOwnPropertyDescriptor(o, 'value');
    if (d) return d;
  }
  return undefined;
}

/**
 * Length of an uncontrolled text field's value, read from the element itself, for
 * the `n / max` counter of `Input` and `Textarea`.
 *
 * `onChange` only fires for typing. A form library (react-hook-form's `register()`
 * on mount, `reset()`, `setValue()`) or plain code writes `el.value = …` straight
 * to the DOM instead: no event, and no prop to render from. So the count is
 * derived from the element and kept fresh three ways, none of them polling:
 *
 * - after every render (a changed `defaultValue`, or anything else that re-renders);
 * - the `input` / `change` events (typing, autofill) and the form's `reset` (native `form.reset()`);
 * - a wrapper on the element's own `value` setter, the only way to see a write that
 *   fires no event and causes no render. It calls straight through to the setter it
 *   found (React's tracker included) and is taken off again on cleanup.
 *
 * Pass `enabled: false` for a controlled field (its count comes from `value`) or one
 * with no counter; nothing is attached then. `initial` is the count to render before
 * the element exists (SSR, first paint).
 */
export function useValueLength(ref: React.RefObject<TextField | null>, enabled: boolean, initial: number): number {
  const [length, setLength] = React.useState(initial);

  // Every render: a cheap read that only sets state when the count really differs.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    // An uncontrolled field's value lives in the DOM, not in React: this is where it is read back.
    if (enabled && el && el.value.length !== length) setLength(el.value.length);
  });

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      if (live) setLength(el.value.length);
    };
    // A native reset restores the value only after its event has been dispatched.
    const onReset = () => {
      clearTimeout(timer);
      timer = setTimeout(sync, 0);
    };

    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
    const form = el.form;
    form?.addEventListener('reset', onReset);

    const own = Object.getOwnPropertyDescriptor(el, 'value');
    const base = own ?? valueDescriptor(el);
    let unwrap: (() => void) | undefined;
    if (base?.get && base.set) {
      const { get, set } = base;
      const wrapper: PropertyDescriptor = {
        configurable: true,
        enumerable: base.enumerable,
        get(this: TextField) {
          return get.call(this);
        },
        set(this: TextField, next: string) {
          set.call(this, next);
          sync();
        },
      };
      try {
        Object.defineProperty(el, 'value', wrapper);
        unwrap = () => {
          // Something may have wrapped ours since (a test library, say): leave the
          // chain intact then, `live` already makes ours inert.
          if (Object.getOwnPropertyDescriptor(el, 'value')?.set !== wrapper.set) return;
          if (own) Object.defineProperty(el, 'value', own);
          else Reflect.deleteProperty(el, 'value');
        };
      } catch {
        /* a non-configurable own `value`: fall back to the events above */
      }
    }

    return () => {
      live = false;
      clearTimeout(timer);
      el.removeEventListener('input', sync);
      el.removeEventListener('change', sync);
      form?.removeEventListener('reset', onReset);
      unwrap?.();
    };
  }, [ref, enabled]);

  return length;
}
