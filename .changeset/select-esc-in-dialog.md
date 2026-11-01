---
"@sereno-ds/ui": patch
---

`Select` inside a `Dialog`: `Esc` with the list open now closes only the list (SS-571).

The `Dialog` listens for `Esc` on `document` and does not look at whether something else already handled it, and the `Select` only called `preventDefault`, so one press closed the list and the whole Dialog, taking whatever the user had filled in with it. With the list open the `Select` now keeps the `Esc` for itself; the next press, with nothing open, reaches the Dialog as before. `Autocomplete` already behaved this way.
