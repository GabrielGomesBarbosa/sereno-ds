---
"@sereno-ds/ui": patch
---

`Card` gains real keyboard semantics (SS-228) when used as its own control —
`interactive` + `onClick` together now render `role="button"`, `tabIndex={0}`
and a focus ring, with Enter/Space activating it, matching native button
behavior. Found live: a clickable `Card` (e.g. `ServiceCard` in the booking
flow) rendered as a plain, unfocusable `<div>` — reachable by mouse only.
An `interactive` `Card` with no `onClick` (styling borrowed from an outer
`<Link>`/`<button>`) is unaffected, on purpose — giving it its own tabIndex
would nest one focusable control inside another.
