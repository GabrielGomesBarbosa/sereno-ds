---
"@sereno-ds/tokens": minor
---

Adds `@sereno-ds/tokens/breakpoints` (SS-272) — a typed
`{ sm: 560, md: 768, lg: 1024, xl: 1280 }` mirroring `--bp-*` in
`spacing.css`, for the one thing a CSS custom property can't do on its
own: feed a `@media` query (Tailwind's `@theme`, a `matchMedia` call, a
React Native breakpoint check). A build-time script cross-checks the two
against each other, so they can't silently drift apart across a release
the way a hand-copied literal in a consuming app could.

First real slice of SS-71 (converting the token layer to JS/TS for
React Native) — scoped down to just breakpoints, for an immediate web
need, rather than waiting on that epic's full theme-object conversion.

Everything else in this package stays CSS-only on purpose: baking a
Tailwind-specific `@theme` generator (or similar) into `@sereno-ds/tokens`
would couple a tool-agnostic package to one consumer's build tool: this
package doesn't otherwise know or care what CSS framework, if any, sits
on top of it.
