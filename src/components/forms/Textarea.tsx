'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';

/** Multi-line field for booking notes and service descriptions. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  containerStyle?: React.CSSProperties;
}

export function Textarea({ label, hint, error, required, rows = 4, disabled, id, style, containerStyle, ...rest }: TextareaProps) {
  const [focus, setFocus] = React.useState(false);
  // SSR-stable id (the DS source used Math.random(), which breaks hydration).
  const autoId = React.useId();
  const rid = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle}>
      <textarea
        id={rid}
        rows={rows}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...rest}
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