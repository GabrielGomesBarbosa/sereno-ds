---
"@sereno-ds/ui": patch
---

`Switch` now applies `aria-label` to its `role="switch"` element — wrapping
it in a `<label>` only associates text for *native* labelable form controls,
so a `Switch` with a `label` (or without one at all) previously announced
with no accessible name to screen readers. Caught by the new axe-powered
test suite (SS-232). New optional `aria-label` prop for label-less usage;
existing `label` usage now gets the fix for free, no API change needed.
