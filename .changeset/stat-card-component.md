---
"@sereno-ds/ui": minor
---

New component: `StatCard`, a figure on a dashboard (SS-475).

Apps that show indicators at the top of a screen ("Appointments today", "Pending this week") put one together from `Card`, `Typography` and `Skeleton` each time. It is now one component, with the lines, the sizes and the loading state decided once.

- **`label`** (the eyebrow), **`value`** (any node, large, in tabular figures) and **`hint`** (one line of context under it).
- **`tone`**: `default`, `neutral` (a quieter, tinted card with no shadow) and the status tones `success`, `warning`, `error`, `info` (the names `Badge`, `Alert` and `Toast` use). A status tone draws a ring in the tone's `--status-*-dot` and colors the label and the number with its `--status-*-fg`; the hint stays secondary.
- **`progress`**: `{ percent, label? }`, a thin bar with `role="progressbar"`. `percent` is held to 0 to 100; without a `label` the bar takes the card's. The fill is the primary color, or the tone's text color.
- **`loading`**: the label, the number and the hint become placeholders (`Skeleton`) that hold the same height as the real lines, so nothing jumps when the data arrives. It mirrors the props you pass. The card is `aria-busy`.
- Built on `Card`: `className`, `style` and the rest go to it, and your `style` comes last.

Contrast (WCAG AA is 4.5:1 for small text, 3:1 for large text and for graphics): the status text colors are 5.91:1 or more on the card in both themes (light: success 5.91, warning 6.26, error 6.20, info 6.46; dark: 9.66, 9.69, 7.99, 10.16). The bar fill uses the text color of the tone, not its dot, because the dot is a hair under 3:1 against the track in the light theme. `neutral` uses a secondary label, since the muted one is 4.27:1 on its fill in the light theme.

The primitive count goes from 31 to 33 (this and `CalendarLegend`).
