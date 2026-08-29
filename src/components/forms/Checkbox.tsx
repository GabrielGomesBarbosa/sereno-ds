'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Opt-in control for consents and multi-select filters. Host must include the `.sereno-check:checked` rule (see globals.css). */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  /** Secondary line under the label. */
  description?: string;
}

export function Checkbox({ label, description, checked, defaultChecked, disabled, onChange, style, ...rest }: CheckboxProps) {
  const [hover, setHover] = React.useState(false);
  const on = checked !== undefined ? checked : undefined;
  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sx({ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...style })}
    >
      <span style={sx({ position: 'relative', display: 'inline-flex', flex: '0 0 auto', marginTop: 1 })}>
        <input
          type="checkbox"
          checked={on}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          {...rest}
          className="sereno-check"
          style={sx({
            appearance: 'none',
            width: 20,
            height: 20,
            margin: 0,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width-emphasis) solid ' + (hover && !disabled ? 'var(--border-brand)' : 'var(--border-strong)'),
            background: 'var(--bg-surface)',
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