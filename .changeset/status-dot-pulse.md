---
"@sereno-ds/ui": minor
---

New component `StatusDot`, and `Badge` gets `pulse` (SS-516).

A live state ("Open now", "Online") is usually a colored dot with a soft ring that pulses out of it. `Badge` already had the dot; there was no pulse, and no dot without the pill.

- **`StatusDot`**: `tone` (`success`, `warning`, `error`, `info`, `neutral`: the same words `Badge`, `Alert` and `Toast` use), `size` (`sm` 5px and `md` 6px, the two dot sizes of `Badge`), `pulse` and `label`. Without a `label` the dot is decorative and the text next to it says the status; with one it is an image with that name.
- **`pulse`**: a translucent ring in the tone's color grows and fades behind the dot. It is off by default, an opt-in for a state that is live, and not for a list. The ring is invisible at rest and is hidden outright when the user asks for reduced motion (`prefers-reduced-motion`). It adds a `sereno-ping` animation to `styles.css`.
- **`Badge pulse`**: the dot of a `Badge` pulses (only with `dot`). Exported types: `StatusDotProps`, `StatusDotTone`, `StatusDotSize`.

Only added to: a `Badge` without `pulse` renders exactly what it did, down to the markup of its dot (a test per tone and size says so). `Badge` now takes the color of its dot from `StatusDot`, which has the same tokens.
