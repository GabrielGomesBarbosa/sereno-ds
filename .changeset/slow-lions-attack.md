---
"@sereno-ds/ui": minor
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

**`Select`** — the hand-rolled listbox is now used on every device (the native
`<select>` fallback is gone). On a mouse it's an anchored dropdown — an in-place
child glued to the field through scroll with no jitter, or portalled + fixed when
inside a `Dialog` so the modal can't clip it. On touch it opens as a **bottom
sheet** with finger-sized rows. Clicking the field `<label>` no longer opens the
menu (only clicking the box, or the keyboard); the label still focuses the
control.
