'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Single-choice select. On pointer devices it is a hand-rolled listbox
 * (token-styled panel, full keyboard support) so it looks the same in every
 * browser. On touch devices it falls back to the native `<select>`, whose
 * OS picker is the better experience with a finger.
 *
 * Value contract: `value` / `defaultValue` + `onValueChange(value)` — a plain
 * string, not a DOM event (this is no longer a native control on desktop).
 */
export interface SelectProps {
  label?: string;
  hint?: string;
  /** Error message; also turns the control red. */
  error?: string;
  required?: boolean;
  options?: SelectOption[];
  /** Shown when nothing is selected. Also a disabled first row in the native fallback. */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name — mirrored to a hidden input so the value can be submitted. */
  name?: string;
  id?: string;
  containerStyle?: React.CSSProperties;
}

const CONTROL_HEIGHT = {
  sm: 'var(--control-height-sm)',
  md: 'var(--control-height-md)',
  lg: 'var(--control-height-lg)',
} as const;

const OPTION_PAD_Y = { sm: 6, md: 8, lg: 10 } as const;

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/** True on touch / pen devices, where the native picker wins. SSR-safe. */
function useCoarsePointer(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(pointer: coarse)');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(pointer: coarse)').matches,
    () => false,
  );
}

function fieldBoxStyle(size: NonNullable<SelectProps['size']>, error: boolean, open: boolean, disabled: boolean): React.CSSProperties {
  const active = open && !error;
  return sx({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    height: CONTROL_HEIGHT[size],
    padding: '0 var(--space-3)',
    borderRadius: 'var(--radius-control)',
    background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
    border: 'var(--border-width-hairline) solid ' + (error ? 'var(--interactive-error)' : open ? 'var(--border-focus)' : 'var(--border-default)'),
    boxShadow: active ? 'var(--focus-ring)' : 'none',
    fontFamily: 'var(--font-body)',
    fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
    color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-control)',
    textAlign: 'left',
  });
}

// ── Native fallback (touch) ──────────────────────────────────────────────────
function NativeSelect({
  rid,
  name,
  options,
  value,
  placeholder,
  size,
  error,
  disabled,
  onCommit,
}: {
  rid: string;
  name?: string;
  options: SelectOption[];
  value: string;
  placeholder?: string;
  size: NonNullable<SelectProps['size']>;
  error: boolean;
  disabled?: boolean;
  onCommit: (v: string) => void;
}) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={sx({ position: 'relative', display: 'flex' })}>
      <select
        id={rid}
        name={name}
        disabled={disabled}
        value={value}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => onCommit(e.currentTarget.value)}
        style={sx({
          ...fieldBoxStyle(size, error, focus, !!disabled),
          appearance: 'none',
          paddingRight: 'var(--space-8)',
        })}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        style={sx({
          position: 'absolute',
          right: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          color: 'var(--text-muted)',
        })}
      >
        <ChevronDown size={16} strokeWidth={1.75} />
      </span>
    </div>
  );
}

// ── Custom listbox (pointer devices) ─────────────────────────────────────────
function CustomSelect({
  rid,
  options,
  value,
  placeholder,
  size,
  error,
  disabled,
  onCommit,
}: {
  rid: string;
  options: SelectOption[];
  value: string;
  placeholder?: string;
  size: NonNullable<SelectProps['size']>;
  error: boolean;
  disabled?: boolean;
  onCommit: (v: string) => void;
}) {
  const listboxId = `${rid}-listbox`;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLUListElement>(null);
  const typeahead = React.useRef<{ str: string; timer: number }>({ str: '', timer: 0 });
  // A <label htmlFor> forwards a fully-trusted click to this button (detail:1),
  // indistinguishable from a direct one — but its *pointerdown* landed on the
  // label, not here. So only toggle when the press actually started on the box.
  const pressedAt = React.useRef(0);

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);
  // The listbox is portalled to <body> so a Dialog / Card / overflow container
  // can't clip it. It's `position: absolute` in *document* coordinates (rect +
  // scrollX/Y), so it rides page scroll glued to the field for free — no
  // per-frame JS, no jitter. It only detaches if an inner scroller moves the
  // field, and we dismiss on that. `above`/`maxH`/`top`/`left`/`width` are
  // measured once per open (viewport room decides the side); resize dismisses.
  const [place, setPlace] = React.useState<{ above: boolean; maxH: number; top: number; left: number; width: number; fixed: boolean } | null>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const firstEnabled = () => options.findIndex((o) => !o.disabled);
  const lastEnabled = () => {
    for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
    return -1;
  };
  const nextEnabled = (from: number, dir: 1 | -1) => {
    let i = from;
    for (let step = 0; step < options.length; step++) {
      i += dir;
      if (i < 0 || i >= options.length) return from;
      if (!options[i].disabled) return i;
    }
    return from;
  };

  useIsoLayoutEffect(() => {
    if (!open) return;
    const t = triggerRef.current;
    if (!t) return;

    const GAP = 6;
    const r = t.getBoundingClientRect();
    // Non-zero fallback: if the viewport height is unknown, assume there's room
    // below rather than flipping the menu up on a bad reading.
    const vh = window.innerHeight || document.documentElement.clientHeight || 900;
    const estH = Math.min(288, options.length * 36 + 8); // rough list height, no DOM needed
    const roomBelow = vh - r.bottom - 8;
    const roomAbove = r.top - 8;
    const above = roomBelow < Math.min(estH, 200) && roomAbove > roomBelow;
    const room = (above ? roomAbove : roomBelow) - GAP;
    // A trigger inside a position:fixed container (a Dialog) is viewport-anchored
    // and doesn't scroll, so the menu is `fixed` too with no scroll offset. In
    // normal flow it's `absolute` in document coords so it rides page scroll for
    // free. Either way: no per-frame tracking.
    let fixed = false;
    for (let el: HTMLElement | null = t.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).position === 'fixed') {
        fixed = true;
        break;
      }
    }
    const sx_ = fixed ? 0 : window.scrollX;
    const sy = fixed ? 0 : window.scrollY;
    setPlace({
      fixed,
      above,
      maxH: Math.max(120, Math.min(288, Math.round(room))),
      left: r.left + sx_,
      width: r.width,
      top: (above ? r.top - GAP : r.bottom + GAP) + sy,
    });

    // The panel is document-anchored, so page scroll keeps it glued for free —
    // ignore it. The list's own scroll is fine too. Any *other* scroll means an
    // inner scroller is moving the field out from under the menu — dismiss.
    const onScroll = (e: Event) => {
      const tgt = e.target;
      if (tgt instanceof Node && panelRef.current?.contains(tgt)) return;
      if (tgt === document || tgt === document.documentElement || tgt === document.body || tgt === window) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, options.length]);

  // Close on outside pointerdown.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  // Keep the active option in view.
  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(`${rid}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, rid]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled());
    setOpen(true);
  };
  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  };
  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onCommit(o.value);
    closeMenu();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) return openMenu();
        setActiveIndex((i) => nextEnabled(i < 0 ? -1 : i, 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) return openMenu();
        setActiveIndex((i) => nextEnabled(i < 0 ? options.length : i, -1));
        return;
      case 'Home':
        if (open) {
          e.preventDefault();
          setActiveIndex(firstEnabled());
        }
        return;
      case 'End':
        if (open) {
          e.preventDefault();
          setActiveIndex(lastEnabled());
        }
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) return openMenu();
        choose(activeIndex);
        return;
      case 'Escape':
        if (open) {
          e.preventDefault();
          closeMenu();
        }
        return;
      case 'Tab':
        if (open) setOpen(false);
        return;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const ta = typeahead.current;
          ta.str += e.key.toLowerCase();
          window.clearTimeout(ta.timer);
          ta.timer = window.setTimeout(() => (ta.str = ''), 500);
          const match = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(ta.str));
          if (match >= 0) {
            if (!open) openMenu();
            setActiveIndex(match);
          }
        }
    }
  };

  const hasValue = !!selected;
  const rowPadY = OPTION_PAD_Y[size];

  return (
    <div style={sx({ position: 'relative', width: '100%' })}>
      <button
        ref={triggerRef}
        type="button"
        id={rid}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${rid}-opt-${activeIndex}` : undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPointerDown={() => {
          pressedAt.current = Date.now();
        }}
        onMouseDown={(e) => {
          // Take focus without the browser scrolling us into view.
          e.preventDefault();
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={() => {
          // Only toggle when the press started on this button — a click forwarded
          // from the field <label>, or synthesised by the keyboard, never set
          // pressedAt (keyboard is handled in onKeyDown).
          if (Date.now() - pressedAt.current > 500) return;
          pressedAt.current = 0;
          if (open) closeMenu(false);
          else openMenu();
        }}
        onKeyDown={onKeyDown}
        style={fieldBoxStyle(size, error, open, !!disabled)}
      >
        <span
          style={sx({
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: hasValue ? 'inherit' : 'var(--text-muted)',
          })}
        >
          {hasValue ? selected!.label : placeholder ?? 'Select…'}
        </span>
        <span
          aria-hidden="true"
          style={sx({
            display: 'flex',
            flex: '0 0 auto',
            color: 'var(--text-muted)',
            transition: 'transform var(--duration-fast) var(--ease-standard)',
            transform: open ? 'rotate(180deg)' : 'none',
          })}
        >
          <ChevronDown size={16} strokeWidth={1.75} />
        </span>
      </button>

      {open && mounted && place &&
        createPortal(
            <ul
              ref={panelRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              style={sx({
                position: place.fixed ? 'fixed' : 'absolute',
                top: place.top,
                left: place.left,
                width: place.width,
                ...(place.above ? { transform: 'translateY(-100%)' } : null),
                minWidth: 160,
                maxHeight: place.maxH,
                overflowY: 'auto',
                margin: 0,
                padding: 'var(--space-1)',
                listStyle: 'none',
                background: 'var(--bg-surface)',
                border: 'var(--border-width-hairline) solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1100,
                fontFamily: 'var(--font-body)',
                fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
              })}
            >
              {options.map((o, i) => {
                const isSelected = o.value === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={o.value}
                    id={`${rid}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={o.disabled || undefined}
                    onPointerEnter={() => !o.disabled && setActiveIndex(i)}
                    onClick={() => choose(i)}
                    style={sx({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-2)',
                      padding: `${rowPadY}px var(--space-3)`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: o.disabled ? 'not-allowed' : 'pointer',
                      color: o.disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
                      background: isActive && !o.disabled ? 'var(--bg-subtle)' : 'transparent',
                      fontWeight: isSelected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    })}
                  >
                    <span style={sx({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{o.label}</span>
                    {isSelected && (
                      <span style={sx({ display: 'flex', flex: '0 0 auto', color: 'var(--text-brand)' })}>
                        <Check size={16} strokeWidth={2} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>,
          document.body,
        )}
    </div>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  options = [],
  placeholder,
  size = 'md',
  disabled,
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  id,
  containerStyle,
}: SelectProps) {
  const reactId = React.useId();
  const rid = id || reactId;
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const value = isControlled ? valueProp! : internalValue;
  const coarse = useCoarsePointer();

  const commit = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle}>
      {coarse ? (
        <NativeSelect
          rid={rid}
          name={name}
          options={options}
          value={value}
          placeholder={placeholder}
          size={size}
          error={!!error}
          disabled={disabled}
          onCommit={commit}
        />
      ) : (
        <CustomSelect
          rid={rid}
          options={options}
          value={value}
          placeholder={placeholder}
          size={size}
          error={!!error}
          disabled={disabled}
          onCommit={commit}
        />
      )}
      {name && !coarse && <input type="hidden" name={name} value={value} />}
    </Field>
  );
}
