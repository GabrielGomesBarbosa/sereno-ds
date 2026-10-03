---
"@sereno-ds/ui": patch
---

Form fields now tell assistive technology when they are invalid, and read their error or hint with the field (SS-328).

Until now a field with an `error` showed the message in red, but a screen reader got nothing: no "invalid" and no message, because the message line had no `id` and no control pointed at it. The hint was not read either.

- **`aria-invalid` and `aria-describedby` on the control that takes focus.** With an `error` the control gets `aria-invalid="true"` and `aria-describedby` pointing at the message line, so a screen reader reads "invalid" and the error when the field is focused (what a form library does on a failed submit, focusing the first invalid field). With only a `hint`, `aria-describedby` points at the hint and there is no `aria-invalid`. With neither, no attribute is added. The error still replaces the hint.
- **Covers every control built on `Field`:** `Input`, `Textarea`, `Select` (the combobox trigger), `DatePicker` (the trigger), `FileUpload` (the drop zone, and Replace once a file is chosen) and `AvatarUpload` (the pencil button), since the file input itself is hidden. A single file rejected for its type or size counts as an error; the "skipped N" note of a `multiple` upload does not.
- **Your own `aria-describedby` is kept**, next to the message and never replaced, on `Input` and `Textarea` (the controls that take one). A consumer `aria-invalid` stands when there is no `error`; an `error` always wins.
- **`Checkbox` gets `aria-invalid`** with an `error`. Its message sits inside its own label, so it is already part of the name and no `aria-describedby` is added (it would be read twice). `Radio` is unchanged: ARIA has no invalid state for a single radio, only for a `radiogroup`.
- Nothing visual changes: the reserved helper height, the colours and the "error replaces hint" rule are as they were.

Not included: announcing an error the moment it appears (`aria-live`), which needs a care of its own when many fields invalidate at once.
