import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

afterEach(cleanup);

describe('Input: ref', () => {
  it('forwards ref to the native input, still usable for the password-reveal focus-back', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Nome" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

/**
 * The border colour and the focus ring are CSS (SS-582): the row carries `--sd-*` values and the stylesheet lights it
 * up while its text box has the focus. The field keeps no focus state, so a caller's own `onFocus` / `onBlur` (the exact
 * shape react-hook-form's `register()` injects) is never wrapped or replaced. The pixels of the ring are the visual
 * tests'; what is tested here is the contract between the component and the stylesheet.
 */
describe('Input: focus ring', () => {
  const row = (c: HTMLElement) => c.querySelector('input')!.parentElement as HTMLElement;
  const v = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

  it('the row is a field frame, with the colours of rest, active and the ring as values, and no colour set inline', () => {
    const { container } = render(<Input label="Nome" />);
    expect(row(container)).toHaveClass('sereno-field');
    expect(v(row(container), '--sd-bd')).toBe('var(--border-default)');
    expect(v(row(container), '--sd-bd-active')).toBe('var(--border-focus)');
    expect(v(row(container), '--sd-ring-active')).toBe('var(--focus-ring)');
    expect(row(container).style.borderColor).toBe(''); // the stylesheet paints it, so a state can change it
    expect(row(container).style.boxShadow).toBe('');
  });

  it('an error keeps its border while active and has no ring', () => {
    const { container } = render(<Input label="Nome" error="Obrigatório" />);
    expect(v(row(container), '--sd-bd')).toBe('var(--interactive-error)');
    expect(v(row(container), '--sd-bd-active')).toBe('var(--interactive-error)');
    expect(v(row(container), '--sd-ring-active')).toBe('none');
  });

  it('focus and blur change nothing on the row or the input: there is no focus state to render', () => {
    const { container } = render(<Input label="Nome" />);
    const input = container.querySelector('input')!;
    const before = container.innerHTML;
    fireEvent.focus(input);
    expect(container.innerHTML).toBe(before);
    fireEvent.blur(input);
    expect(container.innerHTML).toBe(before);
  });

  it('a caller onFocus and onBlur each run once, straight from the input (register() of react-hook-form injects them)', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(<Input label="Nome" onFocus={onFocus} onBlur={onBlur} />);
    const input = container.querySelector('input')!;
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

/**
 * The counter follows the element's real value. The uncontrolled path used to count
 * only what passed through `onChange`, so a value written by code (react-hook-form's
 * `register()` on mount, `reset()`, `setValue()`, a plain `el.value = …`) showed 0.
 */
describe('Input, character counter', () => {
  const counter = (c: HTMLElement) => c.querySelector('[aria-live="polite"]')?.textContent;
  const setNative = (el: HTMLInputElement, v: string) => {
    // What a real user (or the browser's autofill) does: no JS `value` setter involved.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v);
  };

  it('counts the defaultValue at mount', () => {
    const { container } = render(<Input label="Bio" maxLength={120} defaultValue="abcd" />);
    expect(counter(container)).toBe('4 / 120');
  });

  it('follows a value written by code after mount (react-hook-form reset() / setValue() / el.value = …)', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Input label="Bio" maxLength={120} ref={ref} />);
    expect(counter(container)).toBe('0 / 120');
    act(() => {
      ref.current!.value = 'Tmp Contador';
    });
    expect(counter(container)).toBe('12 / 120');
    act(() => {
      ref.current!.value = '';
    });
    expect(counter(container)).toBe('0 / 120');
  });

  it('counts a value written while the ref attaches (register() with defaultValues)', () => {
    const Form = () => {
      const register = React.useCallback((node: HTMLInputElement | null) => {
        if (node) node.value = 'Tmp Contador';
      }, []);
      return <Input label="Bio" maxLength={120} ref={register} />;
    };
    const { container } = render(<Form />);
    expect(counter(container)).toBe('12 / 120');
  });

  it('works without a max (showCount): a bare count', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Input label="Bio" showCount ref={ref} />);
    act(() => {
      ref.current!.value = 'abc';
    });
    expect(counter(container)).toBe('3');
  });

  it('typing still updates it, and the caller onChange still fires', () => {
    const onChange = vi.fn();
    const { container } = render(<Input label="Bio" maxLength={120} onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'oi tudo bem' } });
    expect(counter(container)).toBe('11 / 120');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('follows what the browser writes itself, with no JS setter and no React change (autofill)', () => {
    const { container } = render(<Input label="Bio" maxLength={120} />);
    const input = container.querySelector('input')!;
    act(() => {
      setNative(input, 'autofilled');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(counter(container)).toBe('10 / 120');
  });

  it('follows a native form.reset() back to the defaultValue', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <form>
          <Input label="Bio" maxLength={120} defaultValue="abc" />
        </form>,
      );
      const input = container.querySelector('input')!;
      act(() => {
        input.value = 'a much longer value';
      });
      expect(counter(container)).toBe('19 / 120');
      act(() => {
        container.querySelector('form')!.reset();
        vi.runAllTimers();
      });
      expect(input.value).toBe('abc');
      expect(counter(container)).toBe('3 / 120');
    } finally {
      vi.useRealTimers();
    }
  });

  it('re-reads the element on every render, even when nothing else told it (a value that changed with no setter or event)', () => {
    const { container, rerender } = render(<Input label="Bio" maxLength={120} />);
    const input = container.querySelector('input')!;
    setNative(input, 'abcd');
    expect(counter(container)).toBe('0 / 120');
    rerender(<Input label="Bio" maxLength={120} hint="now with a hint" />);
    expect(counter(container)).toBe('4 / 120');
  });

  it('controlled: counts `value`, as before', () => {
    const { container, rerender } = render(<Input label="Bio" maxLength={120} value="abcde" onChange={() => {}} />);
    expect(counter(container)).toBe('5 / 120');
    rerender(<Input label="Bio" maxLength={120} value="abcdefgh" onChange={() => {}} />);
    expect(counter(container)).toBe('8 / 120');
  });

  it('with a mask, counts the value as displayed', () => {
    const { container } = render(<Input label="CPF" mask="cpf" showCount />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '12345678901' } });
    expect(input.value).toBe('123.456.789-01');
    expect(counter(container)).toBe('14');
  });

  it('with a mask, counts a defaultValue as displayed too', () => {
    const { container } = render(<Input label="CPF" mask="cpf" showCount defaultValue="12345678901" />);
    expect(counter(container)).toBe('14');
  });

  it('maxLength still stops typing at the limit', async () => {
    const { container } = render(<Input label="Bio" maxLength={3} />);
    const input = container.querySelector('input')!;
    await userEvent.type(input, 'abcdef');
    expect(input.value).toBe('abc');
    expect(counter(container)).toBe('3 / 3');
  });

  it('stays correct under StrictMode (effects run twice)', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(
      <React.StrictMode>
        <Input label="Bio" maxLength={120} ref={ref} />
      </React.StrictMode>,
    );
    act(() => {
      ref.current!.value = 'strict';
    });
    expect(counter(container)).toBe('6 / 120');
  });

  it('writing to the field after it unmounted is harmless', () => {
    const ref = React.createRef<HTMLInputElement>();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<Input label="Bio" maxLength={120} ref={ref} />);
    const el = ref.current!;
    unmount();
    expect(() => {
      el.value = 'late';
    }).not.toThrow();
    expect(el.value).toBe('late');
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('a field with no counter renders none and takes plain writes', () => {
    const { container } = render(<Input label="Bio" defaultValue="x" />);
    const input = container.querySelector('input')!;
    expect(container.querySelector('[aria-live="polite"]')).toBeNull();
    input.value = 'plain';
    expect(input.value).toBe('plain');
  });

  it('the value setter is put back when the field stops counting', () => {
    const { container, rerender } = render(<Input label="Bio" maxLength={120} defaultValue="a" />);
    const input = container.querySelector('input')!;
    const wrapped = Object.getOwnPropertyDescriptor(input, 'value')?.set;
    rerender(<Input label="Bio" defaultValue="a" />); // counter switched off
    expect(Object.getOwnPropertyDescriptor(input, 'value')?.set).not.toBe(wrapped);
  });
});
