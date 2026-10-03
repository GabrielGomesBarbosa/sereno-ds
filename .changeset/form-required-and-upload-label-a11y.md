---
"@sereno-ds/ui": patch
---

`required` now reaches assistive technology, and a `FileUpload` drop zone is named by its label (SS-329).

- **`required` is announced.** It used to draw an asterisk in the label and nothing else, so a screen reader read a stray "*" and never said the field was required. `Input`, `Textarea` and `Select` now set `aria-required="true"` and hide the asterisk from assistive technology (it stays on screen). It is `aria-required`, not the native `required`, so the browser's own form validation is not switched on, as before. A consumer `aria-required` stands when the field is not `required`.
- **`DatePicker`, `FileUpload` and `AvatarUpload` are unchanged** for `required`: their focusable control is a button, which cannot carry `aria-required` (axe flags it), so the asterisk stays as their only cue and is still read.
- **`FileUpload`'s drop zone is named by the field label.** The label pointed at the hidden file input, which is out of the accessibility tree, so the zone was only its own prompt ("Drag a file here, or click to choose"), whatever the upload was for. With a `label` the accessible name is now the label followed by the prompt ("Document Drag a file here, or click to choose"). With no `label` it is the prompt, as before. If your tests find the zone by its exact accessible name and you pass a `label`, match the prompt as a regular expression or by role and the label.
- `AvatarUpload`'s pencil keeps its name: its own label already says what it does.

Not changed: announcing an error the moment it appears. The field still does not announce it; focusing the first invalid field on submit reads it, and a form that validates on blur can announce with one `aria-live="polite"` region of its own (now in the `Input` guidelines).
