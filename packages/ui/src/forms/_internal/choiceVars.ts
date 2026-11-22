/**
 * The border colours of the box of a `Checkbox` or `Radio`, as the custom properties `.sereno-check` and
 * `.sereno-radio` (styles.css) read: `--sd-bd` at rest and `--sd-bd-hover` while the pointer is on the row. An error
 * keeps its own colour in both, so a hover does not hide it. Nothing is set without an error: the stylesheet's
 * fallbacks (the strong border, then the brand one) are the idle and hover colours.
 */
export function choiceVars(error: string | undefined): Record<string, string> {
  return error ? { '--sd-bd': 'var(--interactive-error)', '--sd-bd-hover': 'var(--interactive-error)' } : {};
}
