'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Instant-apply toggle for settings rows (agenda online, lembretes, tema). Never use inside a form that needs Save. Host must include the `.sereno-switch` focus rule (see globals.css). */
export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Track size. `sm` for dense settings lists; `md` is the default. Matches `Checkbox` / `Radio`. */
  size?: 'sm' | 'md';
  onChange?: (e: { target: { checked: boolean } }) => void;
  style?: React.CSSProperties;
  /**
   * Accessible name for the `role="switch"` element. Wrapping it in a
   * `<label>` (below) only associates text for *native* labelable controls —
   * a custom ARIA widget still announces with no name at all otherwise (SS-232
   * caught this live via axe: `aria-toggle-field-name`). Defaults to `label`;
   * only pass this separately for a label-less switch (an icon-only row).
   */
  'aria-label'?: string;
}

const TRACK = { sm: { w: 36, h: 22, thumb: 16 }, md: { w: 44, h: 26, thumb: 20 } } as const;

/**
 * `ref` reaches the `<span role="switch">` — there's no native form element
 * underneath, so this only gives you `.focus()` (useful for
 * `setFocus()`-on-error), never `.value`/`.checked`. Switch is documented as
 * "never use inside a form that needs Save" already; it isn't a
 * `react-hook-form` `register()` candidate regardless of `ref` — use
 * `Controller` if one genuinely needs to live in a saved form.
 */
export const Switch = React.forwardRef<HTMLSpanElement, SwitchProps>(function Switch({
  label,
  description,
  checked = false,
  disabled,
  size = 'md',
  onChange,
  style,
  'aria-label': ariaLabel,
}: SwitchProps, ref) {
  const t = TRACK[size];
  const toggle = () => {
    if (!disabled && onChange) onChange({ target: { checked: !checked } });
  };
  return (
    <label
      style={sx({
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      })}
    >
      <span style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
        {label && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' })}>{label}</span>
        )}
        {description && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.45 })}>{description}</span>
        )}
      </span>
      <span
        ref={ref}
        role="switch"
        aria-checked={checked}
        aria-label={label ?? ariaLabel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? undefined : 0}
        className="sereno-switch"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
          }
        }}
        style={sx({
          position: 'relative',
          width: t.w,
          height: t.h,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--interactive-primary)' : 'var(--border-strong)',
          transition: 'background-color var(--duration-normal) var(--ease-standard)',
        })}
      >
        <span
          style={sx({
            position: 'absolute',
            top: 3,
            left: checked ? t.w - t.thumb - 3 : 3,
            width: t.thumb,
            height: t.thumb,
            borderRadius: '999px',
            background: '#fff',
            boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--duration-normal) var(--ease-gentle)',
          })}
        />
      </span>
    </label>
  );
});

Switch.displayName = 'Switch';
