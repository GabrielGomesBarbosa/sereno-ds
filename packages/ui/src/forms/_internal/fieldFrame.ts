/**
 * The frame of a text-like field (the row of `Input`, the `Textarea`, the box of `Select`, `DatePicker` and
 * `Autocomplete`): its border colour and its focus ring are CSS, not component state (SS-582).
 *
 * The component declares the colours as custom properties on the element and the `.sereno-field` rules of
 * `styles.css` switch between them, so a field holds no `focus` state (before: a `useState` and an
 * `onFocus` / `onBlur` pair per instance, re-rendering the field on every focus and blur):
 *
 * - `--sd-bd`: the border colour at rest.
 * - `--sd-bd-active`: the border colour while the field is active (focused, or its popup is open).
 * - `--sd-ring-active`: the `box-shadow` while active.
 *
 * An error keeps its border in both states and has no ring.
 */
export function fieldFrameVars(error: boolean): Record<string, string> {
  return error
    ? { '--sd-bd': 'var(--interactive-error)', '--sd-bd-active': 'var(--interactive-error)', '--sd-ring-active': 'none' }
    : { '--sd-bd': 'var(--border-default)', '--sd-bd-active': 'var(--border-focus)', '--sd-ring-active': 'var(--focus-ring)' };
}

/**
 * For a box that is active because something is open (a `Select` or `DatePicker` popup, an `Autocomplete`
 * list), not because it has the focus: the class that carries the frame rules, plus `data-active` while open.
 * The focus itself needs nothing from the component, `styles.css` reads it from the `:focus` of the field.
 */
export function fieldBoxProps(open: boolean): { className: string; 'data-active'?: '' } {
  return open ? { className: 'sereno-field', 'data-active': '' } : { className: 'sereno-field' };
}
