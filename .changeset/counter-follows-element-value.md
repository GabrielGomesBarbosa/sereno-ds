---
"@sereno-ds/ui": patch
---

The `n / max` character counter of `Input` and `Textarea` (from `maxLength` or
`showCount`) now follows the field's real value, so it no longer shows 0 on a
field that was filled from outside (SS-313). It only counted what went through
`onChange`, so a value written by code never showed up until the user typed.
That is exactly what react-hook-form does: `register()` with `defaultValues` on
mount, `reset({ ... })` after a fetch, `setValue()`. All of them showed
"0 / 120" on a field that already held text.

- **Covers**: react-hook-form (`defaultValues`, `reset()`, `setValue()`), a plain
  `el.value = ...`, a native `form.reset()`, autofill and typing.
- **How**: the count is read from the element. It is re-read after every render,
  on `input` / `change` and on the form's `reset`, and a thin wrapper on the
  element's own `value` setter catches a write that fires no event and causes no
  render. No polling. The wrapper is only put on an uncontrolled field that has a
  counter, and is taken off when it unmounts or stops counting.
- **Unchanged**: a controlled field (`value`) still counts `value`; with a `mask`
  the counter counts the value as displayed; `maxLength` still stops typing at
  the limit; refs and caller handlers behave as before.
- `Textarea` now keeps its merged ref stable across renders, so a form library's
  ref callback is not detached and re-attached on every render.
