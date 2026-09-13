# @sereno-ds/ui

## 0.25.7

### Patch Changes

- f736499: `Card` gains real keyboard semantics (SS-228) when used as its own control —
  `interactive` + `onClick` together now render `role="button"`, `tabIndex={0}`
  and a focus ring, with Enter/Space activating it, matching native button
  behavior. Found live: a clickable `Card` (e.g. `ServiceCard` in the booking
  flow) rendered as a plain, unfocusable `<div>` — reachable by mouse only.
  An `interactive` `Card` with no `onClick` (styling borrowed from an outer
  `<Link>`/`<button>`) is unaffected, on purpose — giving it its own tabIndex
  would nest one focusable control inside another.
- f736499: Fixes two remaining spots (SS-228) where an inline `outline: 'none'` had no
  visible substitute — the same bug already fixed on the DateTimePicker day
  grid and Tabs, found by auditing every other inline `outline: 'none'` left
  in the package: `DateTimePicker`'s time-slot buttons, and `BottomNav.Item`.
  Both now suppress the outline via a CSS class instead, with a
  `:focus-visible` rule at the same specificity re-enabling it.

## 0.25.6

### Patch Changes

- 8b313e0: `Tabs.Tab`'s `count` badge now uses `--text-secondary` instead of
  `--text-muted` for its inactive-tab color — on `--bg-subtle` (the
  `underline` variant's inactive badge background) `--text-muted` lands at
  ~4.27:1, under the 4.5:1 body-text minimum (WCAG AA), a violation of the
  Tokens page's own documented rule for that pair ("`--text-muted` on
  `--bg-subtle`/`--bg-sunken` — large text only; use `--text-secondary` for
  body copy"). Also now matches the inactive tab label's own color, which was
  already `--text-secondary`. Part of the SS-227 accessibility audit (SS-230).
- 1c4ea39: `Tabs` gains proper keyboard navigation (SS-228) — until now `Tabs.Tab` had
  `role="tab"`/`role="tablist"` but no keyboard support behind it: every tab
  was its own Tab stop, no arrow-key movement, and (independently) its focus
  ring was suppressed with nothing replacing it. Now: only the active tab is
  ever `tabIndex={0}` (Tab enters/leaves the whole strip in one stop), Left/Right
  move focus between tabs and select them (matching the existing "click selects
  immediately" contract), wrapping at the ends; Home/End jump to the first/last
  tab. Matches the WAI-ARIA Tabs (automatic activation) pattern.

## 0.25.5

### Patch Changes

- 8cfbf98: `Select` gains an `aria-label` prop — its trigger is a real `<button>` (a
  labelable element, so an associated `label` already worked correctly), but
  without a visible `label` at all it had no accessible name. Caught in
  `WeeklyScheduleEditor` (`apps/demo`): the per-day start/end time `Select`s
  had neither `label` nor `aria-label`, so a screen reader announced a bare,
  unnamed combobox. Part of the SS-227 accessibility audit (SS-229).

## 0.25.4

### Patch Changes

- 0293985: `DateTimePicker`'s day grid now uses roving tabindex instead of every day
  being its own Tab stop — Tab enters/leaves the whole grid in one stop, and
  arrow keys move the cursor by day (←/→) or week (↑/↓), crossing month
  boundaries on overflow. Home/End move within the current week row;
  PageUp/PageDown step the month. An `unavailable` day stays focusable
  (`aria-disabled`, not the native `disabled`, which can't receive focus at
  all) so the cursor can land on it without being able to select it. Part of
  the SS-227 accessibility audit (SS-228) — calendars were flagged as the
  hardest keyboard-navigation case in the whole component set.

## 0.25.3

### Patch Changes

- 81dc8dc: `ToastProvider` now announces through two persistent, visually-hidden
  `aria-live` regions (`polite` for success/warning/info/neutral, `assertive`
  for the `error` tone) instead of relying only on `role="status"`/`role="alert"`
  on the freshly-mounted toast card. A live region only reliably announces a
  _change_ to already-present content — a node that mounts fresh with its text
  already inside it (what every toast card does) isn't consistently announced
  across browsers/screen readers. Part of the SS-227 accessibility audit
  (SS-229). `Alert` needed no change — it already uses the correct
  `role="status"`/`"alert"` pattern, and (unlike `ToastProvider`) has no owned
  mount lifecycle to attach a persistent announcer to.

## 0.25.2

### Patch Changes

- 360b9a0: `Dialog` now traps `Tab`/`Shift+Tab` inside the panel while open (it
  previously let keyboard focus escape into the page behind it) and restores
  focus to whatever triggered it once closed. Every consumer gets this for
  free — `AvatarUpload`'s crop/camera dialogs included. Part of the SS-227
  accessibility audit (SS-231).

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
