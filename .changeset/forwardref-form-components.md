---
"@sereno-ds/ui": minor
---

Every form component now forwards `ref` to its underlying element (SS-268)
— purely additive, no prop changes, nothing breaks for existing consumers.
Enables `react-hook-form`'s uncontrolled `register()` (no `Controller`
needed) for `Input`, `Textarea`, `Checkbox`, `Radio`, `SearchInput`,
`FileUpload` and `AvatarUpload`: each wraps a single native element whose
`onChange` already matches the `(event: ChangeEvent) => void` shape
`register()` expects.

The remaining four don't get the same win, regardless of `ref` — their
`onChange`/`onValueChange` hands back a plain value (a string or boolean),
not a `ChangeEvent`, which is what actually blocks a raw `register()`
spread, not a missing ref:

- `Select` — `ref` reaches the hidden mirror `<input type="hidden">`
  (rendered when `name` is set), good for `getValues()` / `trigger()` /
  `setFocus()`, but still needs `Controller` for change-driven validation.
- `DatePicker` — no native element at all; `ref` exposes
  `DatePickerHandle` (`{ focus() }`) via `useImperativeHandle` instead of a
  raw DOM node.
- `DateTimePicker` — not a single-value field to begin with (`selectedDate`
  / `selectedTime` are separate, parent-owned props with their own
  callbacks); `ref` reaches the root `<div>` for plain DOM access.
- `Switch` — no native form element (`role="switch"` on a `<span>`); `ref`
  only gives `.focus()`. Already documented as never belonging in a form
  with a Save action.

New shared internal `_internal/mergeRefs.ts` combines a forwarded `ref`
with a component's own internal one (the password-reveal focus in `Input`,
the `indeterminate` DOM property in `Checkbox`) without either clobbering
the other.
