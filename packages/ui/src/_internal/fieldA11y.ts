import type * as React from 'react';

/**
 * The `id` of the hint / error line `Field` renders for the control whose own id is
 * `controlId`. `Field` stamps it on the line and `fieldA11y` points the control at it, both
 * through this one function, so the two can never drift apart.
 */
export function fieldMessageId(controlId: string): string {
  return `${controlId}-message`;
}

/**
 * The `id` of the `<label>` `Field` renders for the control whose own id is `controlId`, so a
 * control whose `<label for>` cannot reach it (the hidden file input of `FileUpload` and
 * `AvatarUpload`) can still be named by it through `aria-labelledby`.
 */
export function fieldLabelId(controlId: string): string {
  return `${controlId}-label`;
}

export interface FieldA11yInput {
  hint?: string;
  error?: string;
  /** The consumer's own `aria-describedby`, kept (never replaced). */
  describedBy?: string;
  /** The consumer's own `aria-invalid`, used only when there is no `error` to say so. */
  invalid?: React.AriaAttributes['aria-invalid'];
  /**
   * The field is required. Pass it only for a control whose role supports `aria-required`
   * (a text box, a combobox): on a button it is invalid ARIA, and axe flags it.
   */
  required?: boolean;
  /** The consumer's own `aria-required`, used only when `required` is not set. */
  ariaRequired?: React.AriaAttributes['aria-required'];
}

/**
 * The attributes that tie a form control to its `Field`, so a screen reader says the control
 * is required and invalid, and reads the error (or the hint), when it takes focus:
 *
 * - `aria-invalid` is `true` when there is an `error`, and otherwise whatever the consumer
 *   passed (nothing, by default, so a valid field has no attribute at all).
 * - `aria-describedby` lists the message's id while there is an `error` or a `hint` (the
 *   error already replaces the hint, so it is one id either way), then the consumer's own
 *   ids. Absent when there is nothing to point at.
 * - `aria-required` is `true` when `required` is set, and otherwise whatever the consumer
 *   passed. It is `aria-required`, not the native `required`, so the browser's own form
 *   validation is not switched on.
 *
 * Spread the result on the element that takes focus, after any `{...rest}`.
 */
export function fieldA11y(controlId: string, { hint, error, describedBy, invalid, required, ariaRequired }: FieldA11yInput) {
  const ids = [error || hint ? fieldMessageId(controlId) : '', describedBy?.trim() ?? ''].filter(Boolean).join(' ');
  return {
    'aria-invalid': error ? true : invalid,
    'aria-describedby': ids || undefined,
    'aria-required': required ? true : ariaRequired,
  } as const;
}
