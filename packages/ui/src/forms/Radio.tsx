'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Single-choice control for mutually exclusive options (payment method, appointment format).
 * Group by giving every option the same `name`. Visually matched to `Checkbox` — same 20px
 * box, same hover and label/description rhythm — differing only in the pill radius and dot.
 * Host must include the `.sereno-radio:checked` rule (see globals.css).
 *
 * Wrap every group in a `<fieldset>` / `<legend>` — `name` alone makes the browser treat
 * the options as one native group (arrow keys move between them, only one can be checked),
 * but without a `<legend>` a screen reader has no accessible name for what the choice is
 * between, only "Online, radio button, 1 of 3" with no context.
 */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  /** Secondary line under the label. Replaced by `error` when present. */
  description?: string;
  /** Error message — tints the circle and the secondary line red. Replaces `description`. */
  error?: string;
  /** Circle size. `sm` (16px) for dense lists; `md` (20px) everywhere else. Matches `Checkbox`. */
  size?: 'sm' | 'md';
  /**
   * Reserve the description/error row's height even with neither set — keeps
   * the row stable as `error` comes and goes (SS-259, same mechanism as
   * `Input`'s `preserveHelperSpace`). Off by default.
   */
  preserveHelperSpace?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, error, checked, defaultChecked, disabled, size = 'md', preserveHelperSpace = false, onChange, style, ...rest },
  ref,
) {
  const [hover, setHover] = React.useState(false);
  const box = size === 'sm' ? 16 : 20;
  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sx({ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...style })}
    >
      <span style={sx({ position: 'relative', display: 'inline-flex', flex: '0 0 auto', marginTop: size === 'sm' ? 3 : 1 })}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          {...rest}
          data-size={size}
          className="sereno-radio"
          style={sx({
            appearance: 'none',
            width: box,
            height: box,
            margin: 0,
            borderRadius: 'var(--radius-pill)',
            border: 'var(--border-width-emphasis) solid ' + (error ? 'var(--interactive-error)' : hover && !disabled ? 'var(--border-brand)' : 'var(--border-strong)'),
            backgroundColor: 'var(--bg-surface)',
            cursor: 'inherit',
            transition: 'var(--transition-control)',
          })}
        />
      </span>
      <span style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
        {label && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.35 })}>{label}</span>}
        {(description || error || preserveHelperSpace) && (
          <span
            style={sx({
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: error ? 'var(--interactive-error)' : 'var(--text-muted)',
              lineHeight: 1.45,
              minHeight: preserveHelperSpace ? 'calc(var(--text-xs) * 1.45)' : undefined,
            })}
          >
            {error || description}
          </span>
        )}
      </span>
    </label>
  );
});

Radio.displayName = 'Radio';