---
"@sereno-ds/ui": patch
---

`EmptyState` and `Dialog.Header` now render their title/description through
`Typography` (SS-265) instead of hand-rolled inline styles — no visible or
API change, just one fewer place reconstructing the same font combos by
hand. Left untouched: `Alert`/`Toast`, whose title/description
deliberately inherit `currentColor` from a tone-colored container, and
every interactive control (`Button`, `IconButton`, `Badge`), whose color
is computed per-state from tokens outside `Typography`'s fixed set.
