import type { CSSProperties } from 'react';
import { sx } from '../../_internal/style';
import { fieldFrameVars } from './fieldFrame';

export type FieldBoxSize = 'sm' | 'md' | 'lg';

export const CONTROL_HEIGHT: Record<FieldBoxSize, string> = {
  sm: 'var(--control-height-sm)',
  md: 'var(--control-height-md)',
  lg: 'var(--control-height-lg)',
};

/**
 * The bordered field-box chrome shared by any control whose trigger looks
 * like a text field but opens something else on click - `Select`'s
 * `<button role="combobox">`, `DatePicker`'s calendar trigger (SS-243),
 * `Autocomplete`'s text box.
 * Not for `Input`/`Textarea` themselves - those style their own `<input>`/
 * `<textarea>` directly, with no separate "trigger vs. panel" split.
 *
 * The border colour and the focus ring are not here: the caller spreads `fieldBoxProps(open)` for the class
 * and the open flag, and `styles.css` draws them from the `--sd-*` values this sets (see `fieldFrame.ts`).
 */
export function fieldBoxStyle(size: FieldBoxSize, error: boolean, disabled: boolean): CSSProperties {
  return sx({
    ...fieldFrameVars(error),
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    height: CONTROL_HEIGHT[size],
    // Longhand (not the `padding` shorthand) so callers can override one side,
    // e.g. NativeSelect's right pad - without React leaving the others blank.
    paddingTop: 0,
    paddingRight: 'var(--space-3)',
    paddingBottom: 0,
    paddingLeft: 'var(--space-3)',
    borderRadius: 'var(--radius-control)',
    background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
    // Width and style only: the colour is `border-color: var(--sd-bd)` in styles.css, so a state can change it.
    borderWidth: 'var(--border-width-hairline)',
    borderStyle: 'solid',
    fontFamily: 'var(--font-body)',
    fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
    color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-control)',
    textAlign: 'left',
  });
}
