'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Opt-in control for consents and multi-select filters. Host must include the `.sereno-check:checked` and `.sereno-check:indeterminate` rules (see globals.css). */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  /** Secondary line under the label. */
  description?: string;
  /** Mixed state — some but not all children selected. Visual only; a form still submits it as unchecked. */
  indeterminate?: boolean;
  /** Box size. `sm` (16px) for dense filter lists; `md` (20px) everywhere else. */
  size?: 'sm' | 'md';
}

export function Checkbox({ label, description, checked, defaultChecked, disabled, indeterminate, size = 'md', onChange, style, ...rest }: CheckboxProps) {
  const [hover, setHover] = React.useState(false);
  const box = size === 'sm' ? 16 : 20;
  const ref = React.useRef<HTMLInputElement>(null);
  // `indeterminate` is a DOM property, not an attribute — set it imperatively, and
  // re-assert on every render so a `checked` change never leaves it stale.
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  });
  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sx({ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...style })}
    >
      <span style={sx({ position: 'relative', display: 'inline-flex', flex: '0 0 auto', marginTop: size === 'sm' ? 3 : 1 })}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          {...rest}
          data-size={size}
          className="sereno-check"
          style={sx({
            appearance: 'none',
            width: box,
            height: box,
            margin: 0,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width-emphasis) solid ' + (hover && !disabled ? 'var(--border-brand)' : 'var(--border-strong)'),
            // `backgroundColor`, not `background` — the shorthand would set an inline
            // `background-size: auto` that overrides the `:checked` glyph scaling.
            backgroundColor: 'var(--bg-surface)',
            cursor: 'inherit',
            transition: 'var(--transition-control)',
          })}
        />
      </span>
      <span style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
        {label && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.35 })}>{label}</span>}
        {description && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.45 })}>{description}</span>
        )}
      </span>
    </label>
  );
}