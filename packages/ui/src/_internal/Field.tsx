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
  /**
   * Reserve the hint/error row's height even when there's nothing to show —
   * keeps the field's own height stable as `error`/`hint` come and go (e.g.
   * several fields in a form invalidating at once), instead of every field
   * growing the moment a message appears. Off by default: most fields don't
   * need the empty gap when there's nothing under them.
   */
  preserveHelperSpace?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Field({ label, hint, error, required, htmlFor, counter, preserveHelperSpace = false, children, style }: FieldProps) {
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
      {(error || hint || counter || preserveHelperSpace) && (
        <div
          style={sx({
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            // One line's worth of height, reserved up front — so text
            // appearing/disappearing never changes the row's own size.
            minHeight: preserveHelperSpace ? 'calc(var(--text-xs) * 1.45)' : undefined,
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