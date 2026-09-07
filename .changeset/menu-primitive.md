---
"@sereno/ui": minor
---

New `Menu` — action menu / dropdown (SS-178). A `trigger` you supply plus a
portalled panel, same mechanics as `Select`: `position: fixed` panel measured
off the trigger, flips up when there's no room, closes on outside pointerdown /
`Escape` / selection, and returns focus to the trigger.

- `items` — `{ label, icon?, onClick, disabled?, tone?: 'default' | 'danger', keepOpen? }`,
  `{ separator: true }`, `{ heading }`. `role="menu"` / `menuitem`, arrow-key
  roving (Home/End, disabled rows skipped), `Enter` / `Space` to activate.
- `children` render function — a rich panel (notifications list, a form) instead
  of `items`; it receives `close` and the panel is a `role="dialog"`.
- `align` (`start` / `end`), `width`, `disabled`, and a controlled
  `open` / `onOpenChange` pair.

Replaces the hand-rolled popovers in the demo dashboard (`NotificationsMenu` /
`UserMenu`) — done in SS-180.
