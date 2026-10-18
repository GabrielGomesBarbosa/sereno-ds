---
"@sereno-ds/ui": minor
---

New component: `Divider`, a horizontal line with two strengths (SS-517).

The DS had no divider: apps drew their own with `border-(--border-subtle)`. `Divider` is a real `<hr>`.

- **`variant`**: `default` is `--border-subtle`, the hairline of a list or a card; `strong` is `--border-strong`, firmer, for the page background where the subtle one nearly disappears.
- **`decorative`**: hides the line from a screen reader (`role="none"`), for the lines between rows that repeat. Without it the line is a separator.
- No margin of its own (the space around it is the caller's), and `className`, `style` and the rest go to the `hr`.

Contrast, so nobody expects more than it gives: `strong` is firmer, not high contrast. It is 1.63:1 against a card and 1.38:1 against the page background in the light theme (1.83:1 and 2.03:1 in the dark one), against 1.15:1 and 1.03:1 for the subtle one in the light theme. That is right for a separator and short of the 3:1 the edge of a control would need. On the page background in the light theme the subtle one is a shade lighter than the page itself and does not show at all; `strong` shows, as a quiet line.
