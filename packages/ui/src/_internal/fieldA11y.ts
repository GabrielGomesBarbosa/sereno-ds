import type * as React from 'react';

/**
 * The `id` of the hint / error line `Field` renders for the control whose own id is
 * `controlId`. `Field` stamps it on the line and `fieldA11y` points the control at it, both
 * through this one function, so the two can never drift apart.
 */
export function fieldMessageId(controlId: string): string {
  return `${controlId}-message`;
}

export interface FieldA11yInput {
  hint?: string;
  error?: string;
  /** The consumer's own `aria-describedby`, kept (never replaced). */
  describedBy?: string;
  /** The consumer's own `aria-invalid`, used only when there is no `error` to say so. */
  invalid?: React.AriaAttributes['aria-invalid'];
}

/**
 * The two attributes that tie a form control to its `Field` message, so a screen reader
 * says the control is invalid and reads the error (or the hint) when it takes focus:
 *
 * - `aria-invalid` is `true` when there is an `error`, and otherwise whatever the consumer
 *   passed (nothing, by default, so a valid field has no attribute at all).
 * - `aria-describedby` lists the message's id while there is an `error` or a `hint` (the
 *   error already replaces the hint, so it is one id either way), then the consumer's own
 *   ids. Absent when there is nothing to point at.
 *
 * Spread the result on the element that takes focus, after any `{...rest}`.
 */
export function fieldA11y(controlId: string, { hint, error, describedBy, invalid }: FieldA11yInput) {
  const ids = [error || hint ? fieldMessageId(controlId) : '', describedBy?.trim() ?? ''].filter(Boolean).join(' ');
  return {
    'aria-invalid': error ? true : invalid,
    'aria-describedby': ids || undefined,
  } as const;
}
