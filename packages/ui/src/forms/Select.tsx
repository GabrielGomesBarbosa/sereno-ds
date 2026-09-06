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

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);

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

  // Position the portalled panel against the trigger. Writes `transform`
  // straight to the node rather than through React state: on scroll this runs
  // per frame, and a `setState` round-trip lands a frame late so the panel
  // visibly trails the field ("sambando"). `coords` is still set so a later
  // React render (keyboard nav) doesn't snap back to a stale position.
  const position = React.useCallback(() => {
    const t = triggerRef.current;
    const p = panelRef.current;
    if (!t || !p) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (!vh) return; // hidden / detached viewport — nothing sensible to compute
    const r = t.getBoundingClientRect();
    // Trigger scrolled out of view — close rather than leave a stray panel.
    if (r.bottom <= 0 || r.top >= vh) {
      setOpen(false);
      return;
    }
    const panelH = p.offsetHeight || 240;
    const gap = 6;
    const spaceBelow = vh - r.bottom;
    const placeAbove = spaceBelow < panelH + gap + 8 && r.top - gap - 8 > spaceBelow;
    const top = placeAbove ? Math.max(8, r.top - gap - panelH) : r.bottom + gap;
    const left = r.left;
    const width = r.width;
    p.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    p.style.width = `${width}px`;
    p.style.visibility = 'visible';
    setCoords({ top, left, width });
  }, []);

  useIsoLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    position();

    const inPanel = (n: EventTarget | null) => !!panelRef.current?.contains(n as Node);
    // The page stays free to scroll while the menu is open (like MUI's popper,
    // not a native <select>); the panel tracks the trigger frame-for-frame,
    // coalesced to one update per frame.
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        position();
      });
    };
    const onScroll = (e: Event) => {
      if (inPanel(e.target)) return; // the list's own overflow scroll
      schedule();
    };
    // Arrow / PageUp-Down / Home / End / Space drive the listbox from the
    // focused trigger, which preventDefaults them — this only guards anything
    // that reaches the document while the trigger isn't the key target.
    const SCROLL_KEYS = new Set(['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar']);
    const blockKeys = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key) && !inPanel(e.target) && !triggerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    // `scroll` doesn't bubble — capture phase catches a scroll on any ancestor.
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', schedule);
    document.addEventListener('keydown', blockKeys, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('keydown', blockKeys, true);
    };
  }, [open, position]);

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
    <>
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
        onMouseDown={(e) => {
          // Take focus without the browser scrolling us into view (which would
          // trip the close-on-scroll handler the instant the menu opens).
          e.preventDefault();
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={() => (open ? closeMenu(false) : openMenu())}
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

      {open && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={panelRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              style={sx({
                position: 'fixed',
                top: 0,
                left: 0,
                transform: coords
                  ? `translate3d(${Math.round(coords.left)}px, ${Math.round(coords.top)}px, 0)`
                  : 'translate3d(0, -9999px, 0)',
                willChange: 'transform',
                width: coords ? coords.width : 220,
                visibility: coords ? 'visible' : 'hidden',
                minWidth: 160,
                maxHeight: 288,
                overflowY: 'auto',
                margin: 0,
                padding: 'var(--space-1)',
                listStyle: 'none',
                background: 'var(--bg-surface)',
                border: 'var(--border-width-hairline) solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
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
          )
        : null}
    </>
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
