import type { CSSProperties } from 'react';
import { sx } from '../../_internal/style';

export type FieldBoxSize = 'sm' | 'md' | 'lg';

export const CONTROL_HEIGHT: Record<FieldBoxSize, string> = {
  sm: 'var(--control-height-sm)',
  md: 'var(--control-height-md)',
  lg: 'var(--control-height-lg)',
};

/**
 * The bordered field-box chrome shared by any control whose trigger looks
 * like a text field but opens something else on click — `Select`'s
 * `<button role="combobox">`, `DatePicker`'s calendar trigger (SS-243).
 * Not for `Input`/`Textarea` themselves — those style their own `<input>`/
 * `<textarea>` directly, with no separate "trigger vs. panel" split.
 */
export function fieldBoxStyle(size: FieldBoxSize, error: boolean, open: boolean, disabled: boolean): CSSProperties {
  const active = open && !error;
  return sx({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    height: CONTROL_HEIGHT[size],
    // Longhand (not the `padding` shorthand) so callers can override one side
    // — e.g. NativeSelect's right pad — without React leaving the others blank.
    paddingTop: 0,
    paddingRight: 'var(--space-3)',
    paddingBottom: 0,
    paddingLeft: 'var(--space-3)',
    borderRadius: 'var(--radius-control)',
    background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
    border: 'var(--border-width-hairline) solid ' + (error ? 'var(--interactive-error)' : open ? 'var(--border-focus)' : 'var(--border-default)'),
    boxShadow: active ? 'var(--focus-ring)' : 'none',
    fontFamily: 'var(--font-body)',
    fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
    color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-control)',
    textAlign: 'left',
  });
}
