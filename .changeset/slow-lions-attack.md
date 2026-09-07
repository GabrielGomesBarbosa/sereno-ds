---
"@sereno/ui": minor
---

**`Dialog`** now portals to `<body>` and is fixed to the viewport, so it always
covers the whole screen instead of being trapped inside the nearest scrolling or
positioned ancestor. While open it locks page scroll, closes on `Escape`, and
moves focus into the panel.

New props: `size` (`sm` / `md` / `lg` / `xl` max-width), `dividers` (hairline
rules with an independently scrolling body), `showClose` (header ✕), and
`variant="fullscreen"`. `width` still works as an explicit override. No breaking
changes.

**`Select`** — clicking the field `<label>` no longer opens the menu (only
clicking the box, or keyboard). The label still focuses the control, as any form
label does.
