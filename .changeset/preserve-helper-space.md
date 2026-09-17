---
"@sereno-ds/ui": minor
---

Adds `preserveHelperSpace?: boolean` (SS-258) to `Input`, `Textarea`, `Select`,
`DatePicker`, `FileUpload` and `AvatarUpload` — reserves the hint/error row's
height even when neither is set, instead of the row only existing once there's
something to show.

Without it, a form where several fields invalidate at once (e.g. submitted
empty) grows every field's height in the same instant, jumping the whole
layout under the user. With `preserveHelperSpace` on, the space is already
there — the error just fills a slot that was reserved from the start.

Off by default: existing usage is unaffected, and most fields don't need the
extra reserved gap when there's nothing under them.
