---
"@sereno-ds/ui": minor
---

New `Menu` — action menu / dropdown (SS-178). A `trigger` you supply plus a
portalled panel, same mechanics as `Select`: `position: fixed` panel anchored to
the trigger, flips up when there's no room, closes on outside pointerdown /
`Escape` / selection, and returns focus to the trigger.

- `items` — `{ label, icon?, onClick, disabled?, tone?: 'default' | 'danger', keepOpen? }`,
  `{ separator: true }`, `{ heading }`. `role="menu"` / `menuitem`, arrow-key
  roving (Home/End, disabled rows skipped), `Enter` / `Space` to activate.
- `children` render function — a rich panel (notifications list, a form) instead
  of `items`; it receives `close` and the panel is a `role="dialog"`.
- `header` — a block above the items (a name + email, a title).
- `adornment` — overlaid on the trigger (a notification count, a status dot) in a
  `pointer-events: none` layer.
- `align` (`start` / `end`), `width`, `disabled`, and a controlled
  `open` / `onOpenChange` pair.
