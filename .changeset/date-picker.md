---
"@sereno-ds/ui": minor
---

Adds `DatePicker` (SS-243) — a single-date field (no time, no slots; that's
`DateTimePicker`'s job). A text-field-styled trigger opens the same calendar
grid `DateTimePicker` uses in a popover, with `value`/`defaultValue` +
`onChange` as a plain ISO `"YYYY-MM-DD"` string — drops in wherever
`<input type="date">` would go, themed and in pt-BR instead of the
browser's own. Supports `min`/`max` date bounds.

Internally, the calendar body (header, month/year jump, the roving-tabindex
day grid) is extracted into a shared `CalendarGrid`, used by both
`DateTimePicker` (unchanged behavior — verified against its existing test
suite) and the new `DatePicker`. Also extracts `Select`'s field-box trigger
styling into a shared helper, reused by `DatePicker`'s own trigger.
