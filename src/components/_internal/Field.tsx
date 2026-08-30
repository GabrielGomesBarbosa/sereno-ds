'use client';

import * as React from 'react';
import { sx } from './style';

/** Label + hint/error wrapper shared by Input, Textarea and Select. */
export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  /** Right-aligned node on the hint row (e.g. a character counter). */
  counter?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Field({ label, hint, error, required, htmlFor, counter, children, style }: FieldProps) {
  return (
    <div style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style })}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={sx({
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-snug)',
          })}
        >
          {label}
          {required && <span style={sx({ color: 'var(--interactive-error)', marginLeft: 3 })}>*</span>}
        </label>
      )}
      {children}
      {(error || hint || counter) && (
        <div
          style={sx({
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            justifyContent: error || hint ? 'space-between' : 'flex-end',
          })}
        >
          {(error || hint) && (
            <span
              style={sx({
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                lineHeight: 1.45,
                color: error ? 'var(--interactive-error)' : 'var(--text-muted)',
              })}
            >
              {error || hint}
            </span>
          )}
          {counter}
        </div>
      )}
    </div>
  );
}