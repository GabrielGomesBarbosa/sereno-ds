---
"@sereno/ui": minor
---

**`Dialog`** now portals to `<body>` and is fixed to the viewport, so it always
covers the whole screen instead of being trapped inside the nearest scrolling or
positioned ancestor. While open it locks page scroll, closes on `Escape`, and
moves focus into the panel.

New props: `size` (`sm` / `md` / `lg` / `xl` max-width), `dividers` (hairline
rules with an independently scrolling body), `showClose` (header ✕),
`dismissible` (set `false` to drop the scrim-click and Escape shortcuts for a
choice the user must make explicitly), and `variant="fullscreen"`. `width` still
works as an explicit override. No breaking changes.

**`Select`** — clicking the field `<label>` no longer opens the menu (only
clicking the box, or keyboard); the label still focuses the control. Inside a
`Dialog` the menu is portalled so the modal can't clip it; everywhere else it
stays an in-place child, glued to the field through scroll with no jitter.
