---
"@sereno-ds/ui": patch
---

Inside a `Dialog`, `Esc` with a popup open now closes only the popup (SS-573).

SS-571 fixed this for `Select` (and `Autocomplete` was born right), but `DatePicker`, `Menu` and the clear-on-Esc of `SearchInput` still closed the whole Dialog on the first press, taking what the user had filled in with it. The root was in the `Dialog`, which closed on any `Esc` without looking at whether something had already used it. It now ignores an `Esc` that is `defaultPrevented`, so the first press closes the popup and the next one closes the Dialog. `DatePicker` now says it handled the key (the others already did). New components follow the same rule, written in `AGENTS.md`.
