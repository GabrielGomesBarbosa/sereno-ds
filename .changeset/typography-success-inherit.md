---
"@sereno-ds/ui": minor
---

`Typography` gets two new values for `color`: `success` and `inherit` (SS-452).

`Typography` paints its color inline, so a color class passed to it never wins, and an app that wanted green text (a satisfied rule) or text that follows its parent (a colored strip) had to put `style={{ color: 'inherit' }}` on the `Typography` and the real color on a parent. Both are now a value of `color`.

- **`color="success"`** is `var(--status-success-fg)`, the text green of the success tone (`#7FD9AC` in the dark theme, `--green-700` in the light one). For a rule that is met or a state that is confirmed, next to a green icon.
- **`color="inherit"`** is `color: inherit`, with no token behind it: the text takes the color of its parent. For text on a colored strip (the strip sets its own foreground and the text follows it), or whose color is the parent's to set. The contrast is then the parent's to keep.
- **`TypographyColor`** (exported from the package) includes both.

Contrast of `success` (WCAG AA for small text is 4.5:1): light theme 5.91:1 on `--bg-surface`, 4.99:1 on `--bg-canvas`, 4.63:1 on `--bg-subtle`, 5.01:1 on the success tone background; dark theme 9.66:1, 10.72:1, 7.83:1 and 7.31:1. One pairing falls short: the light theme on `--bg-sunken` is 4.41:1, so do not put `success` text there.

Only added to: every existing color and every variant's default still paints exactly what it did (a test per color and per variant says so), and the `style` you pass still has the last word.
