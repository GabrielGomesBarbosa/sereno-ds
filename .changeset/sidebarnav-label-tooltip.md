---
"@sereno-ds/ui": minor
---

`SidebarNav` shows the full label in a tooltip when the row is too narrow to
fit it (SS-289). A long label is cut with an ellipsis ("Programa de
indica…") and there was no way to read the rest; hovering or tabbing onto it
now shows the text in the same tooltip the icon-only rail already used.

- **Only when it is actually cut** — measured (`scrollWidth > clientWidth`) at
  the moment of hover/focus, so a label that fits gets no redundant tooltip.
  Applies to `Item` and `SubItem`, disabled ones included.
- **Keyboard parity**: `:focus-visible` shows it too, and on the icon-only rail
  keyboard focus now shows the label as well (that tooltip was hover-only, so
  a Tab stop there was an unlabelled icon). A mouse click focuses the row too
  but doesn't re-show it. `Esc` dismisses it without moving focus or the
  pointer (WCAG 1.4.13); a click or blur hides it.
- No API change.
