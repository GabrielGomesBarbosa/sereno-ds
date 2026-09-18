---
"@sereno-ds/ui": minor
---

Adds `error?: string` (SS-259) to `Checkbox` and `Radio` — replaces
`description` and tints the box/circle border red, same contract as
`Input`'s `error`. Neither control had any validation state before; only a
static `description` line.

`Switch` intentionally does not get this — it's documented as an
instant-apply settings toggle, never inside a form that needs validation, so
there's no "invalid" state for it to have.

Also adds `preserveHelperSpace?: boolean` to both (default `false`), the
same layout-shift-prevention mechanism `Input`/`Textarea`/`Select`/
`DatePicker`/`FileUpload`/`AvatarUpload` got in SS-258.
