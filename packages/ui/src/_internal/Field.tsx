'use client';

import * as React from 'react';
import { sx } from './style';
import { fieldLabelId, fieldMessageId } from './fieldA11y';

/**
 * Label + hint/error wrapper shared by the form controls. The hint / error line gets an
 * `id` (see `fieldA11y`) so the control can name it in `aria-describedby`.
 */
export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  /**
   * The control says it is required itself (`aria-required`, see `fieldA11y`), so the asterisk
   * is hidden from assistive technology, which would read it as a symbol. Leave it off for a
   * control that cannot carry `aria-required` (a button): there the asterisk is all it has.
   */
  requiredExposed?: boolean;
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

export function Field({ label, hint, error, required, requiredExposed = false, htmlFor, counter, preserveHelperSpace = false, children, style }: FieldProps) {
  return (
    // No `gap` here — the label→field and field→helper gaps are deliberately
    // different sizes (below), not one uniform rhythm.
    <div style={sx({ display: 'flex', flexDirection: 'column', ...style })}>
      {label && (
        <label
          id={htmlFor ? fieldLabelId(htmlFor) : undefined}
          htmlFor={htmlFor}
          style={sx({
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-snug)',
            marginBottom: 'var(--space-2)',
          })}
        >
          {label}
          {required && (
            <span aria-hidden={requiredExposed || undefined} style={sx({ color: 'var(--interactive-error)', marginLeft: 3 })}>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {(error || hint || counter || preserveHelperSpace) && (
        <div
          style={sx({
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-1)',
            // One line's worth of height, reserved up front — so text
            // appearing/disappearing never changes the row's own size.
            minHeight: preserveHelperSpace ? 'calc(var(--text-xs) * 1.45)' : undefined,
            justifyContent: error || hint ? 'space-between' : 'flex-end',
          })}
        >
          {(error || hint) && (
            <span
              id={htmlFor ? fieldMessageId(htmlFor) : undefined}
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