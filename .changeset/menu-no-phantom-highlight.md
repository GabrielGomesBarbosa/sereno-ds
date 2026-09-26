---
"@sereno-ds/ui": patch
---

`Menu` no longer opens with the first row highlighted when it is opened with
the mouse (SS-306). The first enabled row was always treated as active, which
has the same look as hover, so a click on the trigger produced a "hovered" row
under a cursor that never touched the panel.

- **Opened by a click or tap**: no row is highlighted until the pointer enters
  one or the user presses an arrow key. ArrowDown from there goes to the first
  row and ArrowUp to the last.
- **Hover no longer sticks**: the highlight used to stay on the last row the
  pointer crossed, even after the mouse left the menu. It now goes away with the
  pointer. A row the keyboard moved to is left alone.
- **Opened from the keyboard** (Enter or Space on the trigger, a screen reader,
  or a parent forcing `open`): unchanged, the first enabled row is active so
  Enter acts straight away. The active row now also gets a focus ring, since
  the fill alone can no longer tell keyboard navigation from hover. Hovering a
  row takes over and drops the ring.
- **New on the trigger**: ArrowDown opens the menu on the first row and ArrowUp
  on the last (the menu button pattern). A trigger's own `onKeyDown` still runs
  first and can `preventDefault` to opt out.
- **Fix, first open**: the panel now receives focus on the very first open of a
  `Menu` instance too. It used to stay on the trigger until the second open, so
  the arrow keys and Enter did nothing. An `autoFocus` field inside a rich panel
  keeps its focus.
- A fresh open never inherits the previous open's active row, whichever way the
  menu was closed.
- Each row exposes `data-active` while it is the active one.
