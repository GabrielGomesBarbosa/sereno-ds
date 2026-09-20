---
"@sereno-ds/ui": patch
---

Fixes `Input` and `Textarea` never resetting their focus ring when a
caller passes its own `onBlur` — a plain `{...rest}` spread after the
internal `onBlur={() => setFocus(false)}` let the caller's handler
silently replace it instead of composing with it, the same class of bug
`onChange` was already protected against. This blocked every
`react-hook-form` `register()` integration (`register()` always injects
its own `onBlur`), since the border would get stuck on
`var(--border-focus)` after the first blur. `onFocus` had the identical
gap and is fixed the same way. Pre-existing — not introduced by SS-268's
`forwardRef` change, just found while adopting it.
