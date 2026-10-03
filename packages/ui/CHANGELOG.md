# @sereno-ds/ui

## 0.36.3

### Patch Changes

- a7d3334: `required` now reaches assistive technology, and a `FileUpload` drop zone is named by its label (SS-329).

  - **`required` is announced.** It used to draw an asterisk in the label and nothing else, so a screen reader read a stray "\*" and never said the field was required. `Input`, `Textarea` and `Select` now set `aria-required="true"` and hide the asterisk from assistive technology (it stays on screen). It is `aria-required`, not the native `required`, so the browser's own form validation is not switched on, as before. A consumer `aria-required` stands when the field is not `required`.
  - **`DatePicker`, `FileUpload` and `AvatarUpload` are unchanged** for `required`: their focusable control is a button, which cannot carry `aria-required` (axe flags it), so the asterisk stays as their only cue and is still read.
  - **`FileUpload`'s drop zone is named by the field label.** The label pointed at the hidden file input, which is out of the accessibility tree, so the zone was only its own prompt ("Drag a file here, or click to choose"), whatever the upload was for. With a `label` the accessible name is now the label followed by the prompt ("Document Drag a file here, or click to choose"). With no `label` it is the prompt, as before. If your tests find the zone by its exact accessible name and you pass a `label`, match the prompt as a regular expression or by role and the label.
  - `AvatarUpload`'s pencil keeps its name: its own label already says what it does.

  Not changed: announcing an error the moment it appears. The field still does not announce it; focusing the first invalid field on submit reads it, and a form that validates on blur can announce with one `aria-live="polite"` region of its own (now in the `Input` guidelines).

## 0.36.2

### Patch Changes

- 5c43361: Form fields now tell assistive technology when they are invalid, and read their error or hint with the field (SS-328).

  Until now a field with an `error` showed the message in red, but a screen reader got nothing: no "invalid" and no message, because the message line had no `id` and no control pointed at it. The hint was not read either.

  - **`aria-invalid` and `aria-describedby` on the control that takes focus.** With an `error` the control gets `aria-invalid="true"` and `aria-describedby` pointing at the message line, so a screen reader reads "invalid" and the error when the field is focused (what a form library does on a failed submit, focusing the first invalid field). With only a `hint`, `aria-describedby` points at the hint and there is no `aria-invalid`. With neither, no attribute is added. The error still replaces the hint.
  - **Covers every control built on `Field`:** `Input`, `Textarea`, `Select` (the combobox trigger), `DatePicker` (the trigger), `FileUpload` (the drop zone, and Replace once a file is chosen) and `AvatarUpload` (the pencil button), since the file input itself is hidden. A single file rejected for its type or size counts as an error; the "skipped N" note of a `multiple` upload does not.
  - **Your own `aria-describedby` is kept**, next to the message and never replaced, on `Input` and `Textarea` (the controls that take one). A consumer `aria-invalid` stands when there is no `error`; an `error` always wins.
  - **`Checkbox` gets `aria-invalid`** with an `error`. Its message sits inside its own label, so it is already part of the name and no `aria-describedby` is added (it would be read twice). `Radio` is unchanged: ARIA has no invalid state for a single radio, only for a `radiogroup`.
  - Nothing visual changes: the reserved helper height, the colours and the "error replaces hint" rule are as they were.

  Not included: announcing an error the moment it appears (`aria-live`), which needs a care of its own when many fields invalidate at once.

## 0.36.1

### Patch Changes

- fa46db1: `AvatarUpload`: the crop dialog's footer no longer wraps with a lone, small "Salvar" pushed to the right (SS-326).

  With three actions (Retake, Cancel, Save) and pt-BR labels ("Tirar outra", "Cancelar", "Gravar"), the row needs about 384px and the crop dialog gave it 358px, so the last button, the primary one, dropped to a second line by itself.

  - **Wider dialogs**: the crop dialog goes from 400px to 440px, so the three pt-BR buttons share one line with room to spare, and the camera dialog (352px) matches it, since a shot goes straight from one to the other and the dialog should not change size between the steps. Every other `Dialog` is untouched.
  - **One dialog for the whole photo flow**: the camera, the crop and Retake are now steps of a single `Dialog` whose title, image area and buttons swap, instead of one dialog closing and another opening. The panel no longer replays its pop-in between steps, keeps its size and position, and focus stays inside it (it used to be handed back to the page and pulled in again). The camera is switched off as soon as the dialog leaves that step. Behaviour and props of `AvatarUpload` are unchanged.
  - **New `Dialog.Footer` prop `fill`** (off by default, so no existing dialog changes): the buttons share the row and grow to fill it, and each line if they wrap, instead of hugging the right edge. A wrap on a phone now reads as intended: at 375px it is two buttons on the first line and a full-width primary below, at 320px a full-width first button and the other two below, never a small primary alone at the right. Buttons keep their 40px height and are still the real `Button`, no `size="sm"`.
  - The crop footer turns `fill` on only when there are three actions (after a camera shot). A library pick has two and stays right-aligned as before.
  - Use `fill` on any footer with long or translated labels, or three or more actions.

## 0.36.0

### Minor Changes

- 50bcef8: New **`Pagination`** component (SS-325): page navigation for a long list or a `Table`.
  The `Table` never paginates for you, so there was nothing to put under it.

  - **Controlled**: `page` (1-based), `pageCount`, `onPageChange`. You slice the rows and
    compute the count; the DS only renders the control.
  - **Stable width**: the run of page numbers keeps the same number of slots wherever the
    current page is (an ellipsis takes the room of a page button), so it does not jump as
    you page. An ellipsis only ever hides two or more pages. `siblingCount` and
    `boundaryCount` tune the window; `showEdges` adds first / last buttons.
  - **Built from the DS's own control**: every button is an `IconButton`, page numbers
    included, so they are fixed squares (`size` `sm` / `md` / `lg` = 32 / 40 / 48px) and
    "9" and "10" take the same room. Also `disabled`.
  - **Accessible from the start**: a named `<nav>`, `aria-current="page"` on the current
    page, accessible names ("Page 3"), previous / next disabled at the ends, and a polite
    "Page X of Y" announcement after a change.
  - **Phone-friendly**: under 560px (`--bp-sm`) the numbers fold away and it becomes
    previous / "Page X of Y" / next. This is the one bit of new CSS, in `styles.css`.
  - **Localisable**: English by default, every string overridable through `labels`.

## 0.35.0

### Minor Changes

- e8993ae: `AvatarUpload`: add `allowCamera?: boolean` prop (defaults to `true`).

  - When `allowCamera={false}`:
    - Omits the camera ("Take a photo") option from the action menu.
    - If no photo/logo is currently selected, clicking the trigger button opens the native file selector directly rather than showing a 1-item menu dropdown.
    - If a photo/logo is already set, clicking the trigger button opens the menu showing only the upload and remove options.
    - Useful for company/organization/brand logos where capturing a live webcam/camera photo makes no sense.

## 0.34.0

### Minor Changes

- 7d4f89f: `AvatarUpload`'s crop modal (SS-322, reported testing the schedule-system app, across
  several rounds of live testing):

  - **Fixed, the crop square not lining up with the dialog**: it used to be a fixed
    280×280 box, `alignSelf: 'center'` (doing nothing: its parent, `Dialog.Body`, is a
    plain block container, not flex or grid) inside a `margin: '0 auto'` fix that
    centered it but left it narrower than, and misaligned with, the title and the
    footer buttons either side of it. It's `width: 100%` now, exactly as wide as
    everything else in the dialog and square via `aspectRatio`, so it needs no
    separate mobile handling either.
  - **Fixed, the displayed photo not filling that square on the very first open**: the
    square's own live size drives the crop math (pan, zoom, the exported region) via a
    `ResizeObserver`, since it no longer has a fixed pixel size to key off. A plain
    `useRef` read once, in a mount effect, could still see `null` right then (`Dialog`
    renders its children only from the render _after_ its own internal `mounted` state
    flips) and never retry, leaving the crop math stuck at a smaller guess than the
    real, larger box that had already rendered onscreen: a gray gap on two edges. A
    callback ref (kept as state) is what actually fixed it; a live resize (a phone
    rotated) rescales the pan so the framed crop doesn't jump.
  - **New**: a shot taken with the camera now gets a **Retake** button on the crop
    step, back to the live camera without going through the menu again. A file picked
    from the library doesn't get it: cancelling and picking another one is already one
    click away. New `labels.retake` string (English default: "Retake").
  - The crop and camera dialogs now build their Cancel / Save / Capture / Retake
    buttons from `Button` itself, not a bespoke inline style. That style was missing
    horizontal padding entirely (invisible while `flex: 1` always stretched the button
    past its own content; real once three buttons needed to share the row, each
    sized to its own content, exposing the missing padding). The crop dialog is also a
    little wider (400 vs. camera's 352) so three real buttons have the room.
  - The math of the crop itself (zoom, pan, the export in `save()`) was checked
    separately against a test image and is correct; unrelated to this change.

## 0.33.2

### Patch Changes

- 25c18ed: The `n / max` character counter of `Input` and `Textarea` (from `maxLength` or
  `showCount`) now follows the field's real value, so it no longer shows 0 on a
  field that was filled from outside (SS-313). It only counted what went through
  `onChange`, so a value written by code never showed up until the user typed.
  That is exactly what react-hook-form does: `register()` with `defaultValues` on
  mount, `reset({ ... })` after a fetch, `setValue()`. All of them showed
  "0 / 120" on a field that already held text.

  - **Covers**: react-hook-form (`defaultValues`, `reset()`, `setValue()`), a plain
    `el.value = ...`, a native `form.reset()`, autofill and typing.
  - **How**: the count is read from the element. It is re-read after every render,
    on `input` / `change` and on the form's `reset`, and a thin wrapper on the
    element's own `value` setter catches a write that fires no event and causes no
    render. No polling. The wrapper is only put on an uncontrolled field that has a
    counter, and is taken off when it unmounts or stops counting.
  - **Unchanged**: a controlled field (`value`) still counts `value`; with a `mask`
    the counter counts the value as displayed; `maxLength` still stops typing at
    the limit; refs and caller handlers behave as before.
  - `Textarea` now keeps its merged ref stable across renders, so a form library's
    ref callback is not detached and re-attached on every render.

## 0.33.1

### Patch Changes

- 501e72d: `Menu` no longer opens with the first row highlighted when it is opened with
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

## 0.33.0

### Minor Changes

- 51a8ac3: `SidebarNav` shows the full label in a tooltip when the row is too narrow to
  fit it (SS-289). A long label is cut with an ellipsis ("Programa de
  indica…") and there was no way to read the rest; hovering or tabbing onto it
  now shows the text in the same tooltip the icon-only rail already used.

  - **Only when it is actually cut** - measured (`scrollWidth > clientWidth`) at
    the moment of hover/focus, so a label that fits gets no redundant tooltip.
    Applies to `Item` and `SubItem`, disabled ones included.
  - **Keyboard parity**: `:focus-visible` shows it too, and on the icon-only rail
    keyboard focus now shows the label as well (that tooltip was hover-only, so
    a Tab stop there was an unlabelled icon). A mouse click focuses the row too
    but doesn't re-show it. `Esc` dismisses it without moving focus or the
    pointer (WCAG 1.4.13); a click or blur hides it.
  - No API change.

## 0.32.0

### Minor Changes

- 4188c42: `SidebarNav` can now disable destinations (SS-286) - `disabled` on
  `SidebarNav.Item`, on `SidebarNav.SubItem`, and on the `SidebarNav` root to
  lock the whole menu at once. Purely additive.

  - **Root vs item**: an `Item` inherits the root's `disabled` when it doesn't
    set its own, and an explicit `disabled={false}` opts back in - a "Help"
    link can stay reachable while everything else is locked. A `SubItem`
    inherits from its parent `Item`, so an enabled parent isn't re-locked
    underneath. The collapse toggle, `header` and `footer` are not destinations
    and stay live under a disabled root.
  - **Accessibility**: `aria-disabled` (not the native attribute), so a disabled
    row is still in the accessibility tree - but it leaves the Tab order, since
    a locked menu shouldn't cost one dead tab stop per item (a whole disabled
    menu would be ~30). A click never fires `onChange`, `href` never navigates
    (a disabled item renders as a `<button>`, never through `linkComponent`), a
    disabled parent neither toggles its accordion nor opens its rail flyout
    (the plain label tooltip still shows).
  - **Current page**: a disabled item can still be the current page - `value`
    pointing at it keeps `aria-current` and the active look, just muted, and the
    branch holding a disabled current `SubItem` stays open so you can still see
    where you are.
  - **Look**: `--text-disabled`, `cursor: not-allowed`, no hover - the same
    tokens as `Menu` items.

## 0.31.0

## 0.30.1

### Patch Changes

- 9a18077: Fixes `Input` and `Textarea` never resetting their focus ring when a
  caller passes its own `onBlur` - a plain `{...rest}` spread after the
  internal `onBlur={() => setFocus(false)}` let the caller's handler
  silently replace it instead of composing with it, the same class of bug
  `onChange` was already protected against. This blocked every
  `react-hook-form` `register()` integration (`register()` always injects
  its own `onBlur`), since the border would get stuck on
  `var(--border-focus)` after the first blur. `onFocus` had the identical
  gap and is fixed the same way. Pre-existing - not introduced by SS-268's
  `forwardRef` change, just found while adopting it.

## 0.30.0

### Minor Changes

- f9bcb9f: Every form component now forwards `ref` to its underlying element (SS-268)
 - purely additive, no prop changes, nothing breaks for existing consumers.
  Enables `react-hook-form`'s uncontrolled `register()` (no `Controller`
  needed) for `Input`, `Textarea`, `Checkbox`, `Radio`, `SearchInput`,
  `FileUpload` and `AvatarUpload`: each wraps a single native element whose
  `onChange` already matches the `(event: ChangeEvent) => void` shape
  `register()` expects.

  The remaining four don't get the same win, regardless of `ref` - their
  `onChange`/`onValueChange` hands back a plain value (a string or boolean),
  not a `ChangeEvent`, which is what actually blocks a raw `register()`
  spread, not a missing ref:

  - `Select` - `ref` reaches the hidden mirror `<input type="hidden">`
    (rendered when `name` is set), good for `getValues()` / `trigger()` /
    `setFocus()`, but still needs `Controller` for change-driven validation.
  - `DatePicker` - no native element at all; `ref` exposes
    `DatePickerHandle` (`{ focus() }`) via `useImperativeHandle` instead of a
    raw DOM node.
  - `DateTimePicker` - not a single-value field to begin with (`selectedDate`
    / `selectedTime` are separate, parent-owned props with their own
    callbacks); `ref` reaches the root `<div>` for plain DOM access.
  - `Switch` - no native form element (`role="switch"` on a `<span>`); `ref`
    only gives `.focus()`. Already documented as never belonging in a form
    with a Save action.

  New shared internal `_internal/mergeRefs.ts` combines a forwarded `ref`
  with a component's own internal one (the password-reveal focus in `Input`,
  the `indeterminate` DOM property in `Checkbox`) without either clobbering
  the other.

## 0.29.1

### Patch Changes

- 4fd30c2: `EmptyState` and `Dialog.Header` now render their title/description through
  `Typography` (SS-265) instead of hand-rolled inline styles - no visible or
  API change, just one fewer place reconstructing the same font combos by
  hand. Left untouched: `Alert`/`Toast`, whose title/description
  deliberately inherit `currentColor` from a tone-colored container, and
  every interactive control (`Button`, `IconButton`, `Badge`), whose color
  is computed per-state from tokens outside `Typography`'s fixed set.

## 0.29.0

### Minor Changes

- 645f9e7: Adds `Typography` (SS-261) - the `fontFamily`/`fontSize`/`fontWeight`/
  `letterSpacing`/`lineHeight` combos every screen otherwise reconstructs by
  hand, as one component instead of a new inline style object each time.

  `variant` (`'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' |
'caption' | 'eyebrow'`) picks the look and the default semantic tag;
  `color` overrides the variant's own sensible default (every value a text
  color token, never a raw color); `as` swaps the rendered tag without
  touching the variant's styling (a heading-styled label that shouldn't enter
  the document outline); `truncate` clips to one line with an ellipsis;
  `numeric` sets tabular figures for a value that updates in place or stacks
  with others at the same position - countdowns, queue/ticket numbers,
  clocks, prices in a column.

  The variant set isn't an invented scale - it's extracted from the font
  combos already repeated across the real product app (`schedule-system`):
  page titles, card titles, secondary paragraphs, muted captions, uppercase
  eyebrow labels.

## 0.28.0

### Minor Changes

- f2dcc54: Adds `error?: string` (SS-259) to `Checkbox` and `Radio` - replaces
  `description` and tints the box/circle border red, same contract as
  `Input`'s `error`. Neither control had any validation state before; only a
  static `description` line.

  `Switch` intentionally does not get this - it's documented as an
  instant-apply settings toggle, never inside a form that needs validation, so
  there's no "invalid" state for it to have.

  Also adds `preserveHelperSpace?: boolean` to both (default `false`), the
  same layout-shift-prevention mechanism `Input`/`Textarea`/`Select`/
  `DatePicker`/`FileUpload`/`AvatarUpload` got in SS-258.

- 35f5f98: Adds `preserveHelperSpace?: boolean` (SS-258) to `Input`, `Textarea`, `Select`,
  `DatePicker`, `FileUpload` and `AvatarUpload` - reserves the hint/error row's
  height even when neither is set, instead of the row only existing once there's
  something to show.

  Without it, a form where several fields invalidate at once (e.g. submitted
  empty) grows every field's height in the same instant, jumping the whole
  layout under the user. With `preserveHelperSpace` on, the space is already
  there - the error just fills a slot that was reserved from the start.

  Off by default: existing usage is unaffected, and most fields don't need the
  extra reserved gap when there's nothing under them.

## 0.27.1

### Patch Changes

- 2b01d9d: Fix `dist/**/*.js` relative imports missing `.js` extensions (SS-252). tsup's `bundle: false` mode never rewrote them, which is valid per bundler resolution (Next/webpack/Vite) but violates the Node ESM spec - breaking plain Node, ts-node, and Vitest consumers with `Cannot find module` errors. A postbuild step now adds the missing extensions.

## 0.27.0

### Minor Changes

- 3b0b950: `DateTimePicker`'s `times` slots now support `capacity`/`booked` (SS-64), for
  group sessions and classes that hold more than one person. A slot with
  `capacity` set shows "booked de capacity vagas"; once `booked` reaches
  `capacity` it switches to a warning look and reads "Lotado" via the same
  warning tone used by `Badge`/`Alert`.

  A full slot is **not** the same as a disabled one - it stays clickable by
  default, since reaching capacity is a state the caller may still choose to
  allow (a deliberate overbook). Set `disabled: true` on top for the actual
  hard block. Slots with no `capacity` render exactly as before, unless mixed
  into a list where a sibling slot does track capacity - then they grow the
  same two-line layout with a generic "Disponível"/"Available" filler instead
  of looking short next to their neighbors. Fully backward compatible for a
  `times` list with no capacity anywhere.

  Also adds a `locale?: 'pt-BR' | 'en'` prop to `DateTimePicker`, `DatePicker`,
  and the shared internal `CalendarGrid`, defaulting to `'pt-BR'` - the real
  Sereno product always renders in Portuguese; `'en'` exists only so the docs
  showcase can demo an English-speaking consumer without forking the
  component.

  `DatePicker` also gets a clear (×) button once a value is set - there was
  previously no way to empty the field back to its placeholder short of an
  external "reset" control. Clicking it resets to `''` (calling `onChange('')`
  when controlled) and refocuses the trigger; it's hidden while `disabled`.

## 0.26.0

### Minor Changes

- 45cd576: Adds `DatePicker` (SS-243) - a single-date field (no time, no slots; that's
  `DateTimePicker`'s job). A text-field-styled trigger opens the same calendar
  grid `DateTimePicker` uses in a popover, with `value`/`defaultValue` +
  `onChange` as a plain ISO `"YYYY-MM-DD"` string - drops in wherever
  `<input type="date">` would go, themed and in pt-BR instead of the
  browser's own. Supports `min`/`max` date bounds.

  Internally, the calendar body (header, month/year jump, the roving-tabindex
  day grid) is extracted into a shared `CalendarGrid`, used by both
  `DateTimePicker` (unchanged behavior - verified against its existing test
  suite) and the new `DatePicker`. Also extracts `Select`'s field-box trigger
  styling into a shared helper, reused by `DatePicker`'s own trigger.

## 0.25.7

### Patch Changes

- f736499: `Card` gains real keyboard semantics (SS-228) when used as its own control -
  `interactive` + `onClick` together now render `role="button"`, `tabIndex={0}`
  and a focus ring, with Enter/Space activating it, matching native button
  behavior. Found live: a clickable `Card` (e.g. `ServiceCard` in the booking
  flow) rendered as a plain, unfocusable `<div>` - reachable by mouse only.
  An `interactive` `Card` with no `onClick` (styling borrowed from an outer
  `<Link>`/`<button>`) is unaffected, on purpose - giving it its own tabIndex
  would nest one focusable control inside another.
- f736499: Fixes two remaining spots (SS-228) where an inline `outline: 'none'` had no
  visible substitute - the same bug already fixed on the DateTimePicker day
  grid and Tabs, found by auditing every other inline `outline: 'none'` left
  in the package: `DateTimePicker`'s time-slot buttons, and `BottomNav.Item`.
  Both now suppress the outline via a CSS class instead, with a
  `:focus-visible` rule at the same specificity re-enabling it.

## 0.25.6

### Patch Changes

- 8b313e0: `Tabs.Tab`'s `count` badge now uses `--text-secondary` instead of
  `--text-muted` for its inactive-tab color - on `--bg-subtle` (the
  `underline` variant's inactive badge background) `--text-muted` lands at
  ~4.27:1, under the 4.5:1 body-text minimum (WCAG AA), a violation of the
  Tokens page's own documented rule for that pair ("`--text-muted` on
  `--bg-subtle`/`--bg-sunken` - large text only; use `--text-secondary` for
  body copy"). Also now matches the inactive tab label's own color, which was
  already `--text-secondary`. Part of the SS-227 accessibility audit (SS-230).
- 1c4ea39: `Tabs` gains proper keyboard navigation (SS-228) - until now `Tabs.Tab` had
  `role="tab"`/`role="tablist"` but no keyboard support behind it: every tab
  was its own Tab stop, no arrow-key movement, and (independently) its focus
  ring was suppressed with nothing replacing it. Now: only the active tab is
  ever `tabIndex={0}` (Tab enters/leaves the whole strip in one stop), Left/Right
  move focus between tabs and select them (matching the existing "click selects
  immediately" contract), wrapping at the ends; Home/End jump to the first/last
  tab. Matches the WAI-ARIA Tabs (automatic activation) pattern.

## 0.25.5

### Patch Changes

- 8cfbf98: `Select` gains an `aria-label` prop - its trigger is a real `<button>` (a
  labelable element, so an associated `label` already worked correctly), but
  without a visible `label` at all it had no accessible name. Caught in
  `WeeklyScheduleEditor` (`apps/demo`): the per-day start/end time `Select`s
  had neither `label` nor `aria-label`, so a screen reader announced a bare,
  unnamed combobox. Part of the SS-227 accessibility audit (SS-229).

## 0.25.4

### Patch Changes

- 0293985: `DateTimePicker`'s day grid now uses roving tabindex instead of every day
  being its own Tab stop - Tab enters/leaves the whole grid in one stop, and
  arrow keys move the cursor by day (←/→) or week (↑/↓), crossing month
  boundaries on overflow. Home/End move within the current week row;
  PageUp/PageDown step the month. An `unavailable` day stays focusable
  (`aria-disabled`, not the native `disabled`, which can't receive focus at
  all) so the cursor can land on it without being able to select it. Part of
  the SS-227 accessibility audit (SS-228) - calendars were flagged as the
  hardest keyboard-navigation case in the whole component set.

## 0.25.3

### Patch Changes

- 81dc8dc: `ToastProvider` now announces through two persistent, visually-hidden
  `aria-live` regions (`polite` for success/warning/info/neutral, `assertive`
  for the `error` tone) instead of relying only on `role="status"`/`role="alert"`
  on the freshly-mounted toast card. A live region only reliably announces a
  _change_ to already-present content - a node that mounts fresh with its text
  already inside it (what every toast card does) isn't consistently announced
  across browsers/screen readers. Part of the SS-227 accessibility audit
  (SS-229). `Alert` needed no change - it already uses the correct
  `role="status"`/`"alert"` pattern, and (unlike `ToastProvider`) has no owned
  mount lifecycle to attach a persistent announcer to.

## 0.25.2

### Patch Changes

- 360b9a0: `Dialog` now traps `Tab`/`Shift+Tab` inside the panel while open (it
  previously let keyboard focus escape into the page behind it) and restores
  focus to whatever triggered it once closed. Every consumer gets this for
  free - `AvatarUpload`'s crop/camera dialogs included. Part of the SS-227
  accessibility audit (SS-231).

## 0.25.1

### Patch Changes

- 88d896b: `Switch` now applies `aria-label` to its `role="switch"` element - wrapping
  it in a `<label>` only associates text for _native_ labelable form controls,
  so a `Switch` with a `label` (or without one at all) previously announced
  with no accessible name to screen readers. Caught by the new axe-powered
  test suite (SS-232). New optional `aria-label` prop for label-less usage;
  existing `label` usage now gets the fix for free, no API change needed.

## 0.25.0

### Minor Changes

- 42d1d84: `SidebarNav`, `BottomNav`, `Stepper`, `Dialog` and `TopBar` are now compound
  components (SS-213), matching `Table` / `Tabs`. **Breaking** (pre-1.0, no
  external consumer yet - PO decision 2026-09-12): the old config-array /
  config-prop APIs are gone.

  - `SidebarNav` - sections/items are no longer a data prop; compose
    `SidebarNav.Section` / `SidebarNav.Item` / `SidebarNav.SubItem` as children.
  - `BottomNav` - an `items` array is now `BottomNav.Item` children.
  - `Stepper` - a `steps: string[]` prop is now `Stepper.Step` children (each
    taking its own `label`).
  - `Dialog` - `title` / `description` / `footer` / `showClose` props are gone.
    Compose `Dialog.Header` (`title` / `description` still live here, plus
    `children` for extra content or `Dialog.Close`), `Dialog.Body` and
    `Dialog.Footer`. Nothing renders a close button unless you place
    `<Dialog.Close />` yourself.
  - `TopBar` - `leading` / `actions` config props are now `TopBar.Leading` /
    `TopBar.Title` / `TopBar.Actions` children, each an independent optional
    slot.

  `Select` and `DateTimePicker` were evaluated for the same treatment (SS-225)
  and intentionally kept on their config-prop API (`options`, `times`) - see
  `AGENTS.md` for the reasoning.

  See each component's own JSDoc (or the showcase) for the full new shape.

## 0.24.0

### Minor Changes

- 93e57f0: New `ToastProvider` + `useToast()` - the toast _system_ on top of the
  presentational `Toast`. Wrap the app once in `<ToastProvider position=… max=…
duration=…>`; call `const { toast, dismiss } = useToast()` anywhere below it.

  - `toast('Link copied')` / `toast.success('Saved', { description })` /
    `toast.error(…)` / `toast.warning` / `toast.info` - each returns an id.
  - Portalled fixed viewport, all six `position`s (`top`/`bottom` × `left`/`center`/`right`),
    newest nearest the edge.
  - A countdown bar on each timed toast; it and the auto-dismiss timer pause
    together while the toast is hovered or focused. `duration` defaults to
    4000 ms; `duration: 0` keeps it until `dismiss(id)`.
  - Stack caps at `max` (default 3) - the oldest drops.
  - `dismiss()` with no id clears all. Error toasts announce as `role="alert"`.

  `Toast` gains an opt-in `progress={{ ms, paused }}` prop for that bar (the
  provider wires it). Adds the `sereno-toast-*` keyframes to
  `@sereno-ds/ui/styles.css`.

- e1f3d2f: New `Menu` - action menu / dropdown (SS-178). A `trigger` you supply plus a
  portalled panel, same mechanics as `Select`: `position: fixed` panel anchored to
  the trigger, flips up when there's no room, closes on outside pointerdown /
  `Escape` / selection, and returns focus to the trigger.

  - `items` - `{ label, icon?, onClick, disabled?, tone?: 'default' | 'danger', keepOpen? }`,
    `{ separator: true }`, `{ heading }`. `role="menu"` / `menuitem`, arrow-key
    roving (Home/End, disabled rows skipped), `Enter` / `Space` to activate.
  - `children` render function - a rich panel (notifications list, a form) instead
    of `items`; it receives `close` and the panel is a `role="dialog"`.
  - `header` - a block above the items (a name + email, a title).
  - `adornment` - overlaid on the trigger (a notification count, a status dot) in a
    `pointer-events: none` layer.
  - `align` (`start` / `end`), `width`, `disabled`, and a controlled
    `open` / `onOpenChange` pair.

- 40c9daf: `Stepper` no longer embeds pt-BR copy. The counter (was a hardcoded
  `Passo N de M`) now comes from `stepLabel?: (current, total) => ReactNode` -
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

  **`Select`** - the hand-rolled listbox is now used on every device (the native
  `<select>` fallback is gone). On a mouse it's an anchored dropdown - an in-place
  child glued to the field through scroll with no jitter, or portalled + fixed when
  inside a `Dialog` so the modal can't clip it. On touch it opens as a **bottom
  sheet** with finger-sized rows. Clicking the field `<label>` no longer opens the
  menu (only clicking the box, or the keyboard); the label still focuses the
  control.

### Patch Changes

- 93e57f0: `Alert` and `Toast` - the dismiss control is now a proper 28px icon button (a
  Lucide `X`, hover/focus states) instead of a bare `×` glyph with no hit area.

  Also adds dedicated behavioural tests for `Alert`, `Toast` and `Skeleton`
  (SS-61 / SS-62) - test files, not shipped.

- 15abfb6: `TopBar`: the subtitle now truncates with an ellipsis like the title instead of
  wrapping to multiple lines and blowing out the bar height on narrow screens.
  `subtitle` also accepts `React.ReactNode` now (not just `string`), so consumers
  can pass a `<time>` element or CSS-swapped responsive text.
- 72fd370: `Select` - the touch bottom sheet now locks page scroll while it's open (the
  page was still scrollable behind it), and the list uses `overscroll-behavior:
contain` so reaching its end doesn't scroll the page.

  `Dialog` - the header ✕ is larger and higher-contrast, and grows further on
  `variant="fullscreen"` (40px, on a faint chip) where it's the only way out.
