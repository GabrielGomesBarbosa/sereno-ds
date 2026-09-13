# @sereno-ds/ui

## 0.25.1

### Patch Changes

- 88d896b: `Switch` now applies `aria-label` to its `role="switch"` element — wrapping
  it in a `<label>` only associates text for _native_ labelable form controls,
  so a `Switch` with a `label` (or without one at all) previously announced
  with no accessible name to screen readers. Caught by the new axe-powered
  test suite (SS-232). New optional `aria-label` prop for label-less usage;
  existing `label` usage now gets the fix for free, no API change needed.

## 0.25.0

### Minor Changes

- 42d1d84: `SidebarNav`, `BottomNav`, `Stepper`, `Dialog` and `TopBar` are now compound
  components (SS-213), matching `Table` / `Tabs`. **Breaking** (pre-1.0, no
  external consumer yet — PO decision 2026-09-12): the old config-array /
  config-prop APIs are gone.

  - `SidebarNav` — sections/items are no longer a data prop; compose
    `SidebarNav.Section` / `SidebarNav.Item` / `SidebarNav.SubItem` as children.
  - `BottomNav` — an `items` array is now `BottomNav.Item` children.
  - `Stepper` — a `steps: string[]` prop is now `Stepper.Step` children (each
    taking its own `label`).
  - `Dialog` — `title` / `description` / `footer` / `showClose` props are gone.
    Compose `Dialog.Header` (`title` / `description` still live here, plus
    `children` for extra content or `Dialog.Close`), `Dialog.Body` and
    `Dialog.Footer`. Nothing renders a close button unless you place
    `<Dialog.Close />` yourself.
  - `TopBar` — `leading` / `actions` config props are now `TopBar.Leading` /
    `TopBar.Title` / `TopBar.Actions` children, each an independent optional
    slot.

  `Select` and `DateTimePicker` were evaluated for the same treatment (SS-225)
  and intentionally kept on their config-prop API (`options`, `times`) — see
  `AGENTS.md` for the reasoning.

  See each component's own JSDoc (or the showcase) for the full new shape.

## 0.24.0

### Minor Changes

- 93e57f0: New `ToastProvider` + `useToast()` — the toast _system_ on top of the
  presentational `Toast`. Wrap the app once in `<ToastProvider position=… max=…
duration=…>`; call `const { toast, dismiss } = useToast()` anywhere below it.

  - `toast('Link copied')` / `toast.success('Saved', { description })` /
    `toast.error(…)` / `toast.warning` / `toast.info` — each returns an id.
  - Portalled fixed viewport, all six `position`s (`top`/`bottom` × `left`/`center`/`right`),
    newest nearest the edge.
  - A countdown bar on each timed toast; it and the auto-dismiss timer pause
    together while the toast is hovered or focused. `duration` defaults to
    4000 ms; `duration: 0` keeps it until `dismiss(id)`.
  - Stack caps at `max` (default 3) — the oldest drops.
  - `dismiss()` with no id clears all. Error toasts announce as `role="alert"`.

  `Toast` gains an opt-in `progress={{ ms, paused }}` prop for that bar (the
  provider wires it). Adds the `sereno-toast-*` keyframes to
  `@sereno-ds/ui/styles.css`.

- e1f3d2f: New `Menu` — action menu / dropdown (SS-178). A `trigger` you supply plus a
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

- 40c9daf: `Stepper` no longer embeds pt-BR copy. The counter (was a hardcoded
  `Passo N de M`) now comes from `stepLabel?: (current, total) => ReactNode` —
  default `Step N of M` (English; the DS ships no localised text). Return `null`
  to drop the counter and show only the step label. Consumers in another language
  pass their own: `stepLabel={(c, t) => \`Passo \${c} de \${t}\`}`.
- aeacb5f: **`Dialog`** now portals to `<body>` and is fixed to the viewport, so it always
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

### Patch Changes

- 93e57f0: `Alert` and `Toast` — the dismiss control is now a proper 28px icon button (a
  Lucide `X`, hover/focus states) instead of a bare `×` glyph with no hit area.

  Also adds dedicated behavioural tests for `Alert`, `Toast` and `Skeleton`
  (SS-61 / SS-62) — test files, not shipped.

- 15abfb6: `TopBar`: the subtitle now truncates with an ellipsis like the title instead of
  wrapping to multiple lines and blowing out the bar height on narrow screens.
  `subtitle` also accepts `React.ReactNode` now (not just `string`), so consumers
  can pass a `<time>` element or CSS-swapped responsive text.
- 72fd370: `Select` — the touch bottom sheet now locks page scroll while it's open (the
  page was still scrollable behind it), and the list uses `overscroll-behavior:
contain` so reaching its end doesn't scroll the page.

  `Dialog` — the header ✕ is larger and higher-contrast, and grows further on
  `variant="fullscreen"` (40px, on a faint chip) where it's the only way out.
