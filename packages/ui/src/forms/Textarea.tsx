'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { CharCount } from '../_internal/CharCount';

/** Multi-line field for booking notes and service descriptions. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  /**
   * Show a `n / max` character counter on the hint row. Implied when `maxLength`
   * is set; pass `showCount` on its own for a bare count with no ceiling.
   */
  showCount?: boolean;
  containerStyle?: React.CSSProperties;
}

export function Textarea({ label, hint, error, required, rows = 4, showCount, disabled, id, style, containerStyle, ...rest }: TextareaProps) {
  const [focus, setFocus] = React.useState(false);
  // SSR-stable id (the DS source used Math.random(), which breaks hydration).
  const autoId = React.useId();
  const rid = id || autoId;

  const max = typeof rest.maxLength === 'number' ? rest.maxLength : undefined;
  const showCounter = Boolean(showCount) || max != null;
  const [uncount, setUncount] = React.useState(() =>
    typeof rest.defaultValue === 'string' || typeof rest.defaultValue === 'number' ? String(rest.defaultValue).length : 0,
  );
  const count = rest.value !== undefined ? String(rest.value ?? '').length : uncount;
  const handleChange = showCounter
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (rest.value === undefined) setUncount(e.currentTarget.value.length);
        rest.onChange?.(e);
      }
    : rest.onChange;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={rid}
      style={containerStyle}
      counter={showCounter ? <CharCount count={count} max={max} /> : undefined}
    >
      <textarea
        id={rid}
        rows={rows}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...rest}
        onChange={handleChange}
        style={sx({
          width: '100%',
          padding: 'var(--space-3)',
          resize: 'vertical',
          borderRadius: 'var(--radius-control)',
          background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
          border: 'var(--border-width-hairline) solid ' + (error ? 'var(--interactive-error)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
          boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-normal)',
          color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
          transition: 'var(--transition-control)',
          ...style,
        })}
      />
    </Field>
  );
}