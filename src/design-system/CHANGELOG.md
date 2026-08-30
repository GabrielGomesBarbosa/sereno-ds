# Sereno DS — changelog

Version shown in the `/design-system` header. Source: `src/design-system/version.ts`.

## 0.11.0 — Checkbox & Radio: indeterminate, size, fuller examples (SS-47)

- `Checkbox` gains an **`indeterminate`** prop — the mixed state for a "select
  all" parent. It's a DOM property (not an attribute), so the component sets it
  imperatively via a ref; you just pass the boolean. New
  `.sereno-check:indeterminate` global rule (dash icon, same fill as `:checked`).
- `Checkbox` and `Radio` gain a matching **`size`** prop — `sm` (16px) for dense
  filter lists, `md` (20px) default. The check glyph now scales with the box
  (`background-size: 70%`); `.sereno-radio[data-size=sm]` tightens the dot.
- Checkbox showcase 2 → 5 examples: **Basic**, **Disabled** (plain + locked-on),
  **Indeterminate** (parent + indented children), **Sizes**, **Group**
  (`<fieldset>` / `<legend>` multi-select).
- Radio showcase 1 → 4 examples: **Vertical** (3 options), **Horizontal**
  (label-only row), **Disabled**, **Sizes**.
- Still *not* adding MUI's per-instance `color` — the box is one brand colour on
  purpose (Don't list).

## 0.10.2 — /design-system scrolls the document on mobile (SS-143)

- Replaces the v0.10.1 `KeyboardReveal` shim with the structural fix. At ≤900px
  the showcase drops the fixed app-shell: `.ds-root` / `.ds-body` / `.ds-main`
  go back to normal flow (no `100dvh` lock, no nested `overflow:auto`), and
  `.ds-header` becomes `position: sticky`. The document is the scroller now, so
  iOS Safari **and Brave** reveal a focused field above the software keyboard
  natively — fluid, like `/onboarding`. Zero JS.
- `ScrollPanel` also resets `window` scroll on route change; `MobileNav` locks
  body scroll while the drawer is open (the old `overflow:hidden` shell did that
  implicitly).
- `app/_shell/KeyboardReveal.tsx` **removed**. Desktop unchanged.
- `/agendar` (mobile) still has a nested scroller + sticky footer — same fix is
  a follow-up.

## 0.10.1 — Brave iOS keyboard reveal (SS-142)

- `app/_shell/KeyboardReveal.tsx` — an app-shell workaround, **not** part of the
  component library. `/design-system` and `/agendar` (mobile) scroll inside a
  nested `overflow: auto` container; iOS Safari / Chrome reveal a focused field
  above the software keyboard in that setup but Brave for iOS does not. On
  `focusin` of a text control at `pointer: coarse`, after the keyboard settles,
  it `scrollIntoView({ block: 'center' })` — but only when the field is actually
  covered, so it is a no-op everywhere else (Safari, Chrome, desktop). Mounted
  once in `app/layout.tsx`. No dependency; `src/components/**` untouched.

## 0.10.0 — Input: masks, prefix, password reveal, counter (SS-46, SS-141)

- `Input` gains a **`mask`** prop — hand-rolled, no dependency
  (`src/components/_internal/mask.ts`). Presets: `phone` (switches 8/9-digit),
  `cpf`, `cep`, `currency` (digits read as cents → `1.234,56`); or a custom
  `#`-per-digit pattern. It also sets `inputMode` and `maxLength`. `onChange`
  receives the formatted value in `e.currentTarget.value`. Known limit: the
  caret jumps to the end after re-format (fine for forward typing; no
  caret-preservation yet).
- `Input` gains a **`prefix`** prop — leading text adornment (`R$`, `@`, `+55`),
  the mirror of `suffix`. Neither is part of the value. `mask="currency"` now
  outputs the plain number and is paired with `prefix="R$"`, so the stored
  value stays a number string.
- New **Masked** example + `prefix` in the "Icon, prefix and suffix" example on
  the Input page.
- Wired into the product screens: `BookingFlow` WhatsApp field (`mask="phone"`),
  `Onboarding` price field (`mask="currency"` + `prefix="R$"`).
- `Input` with **`type="password"`** now shows a show/hide **eye toggle** at the
  end of the field (`Eye` / `EyeOff`, `.ds-affix-btn`). It swaps the input `type`,
  keeps focus, and flips `aria-label` between "Mostrar senha" / "Ocultar senha".
  When both apply, the eye wins over `suffix`.
- **Character counter** on `Input` and `Textarea`: set `maxLength` (or pass
  `showCount`) for an `n / max` readout on the hint row — right-aligned, tabular
  figures, turns `--interactive-error` at the limit. `Field` gained a `counter`
  slot; shared `_internal/CharCount.tsx`.
- **iOS / WebKit focus-zoom fix**: text controls are forced to 16px at
  `(pointer: coarse), (max-width: 768px)` so mobile Safari / Brave stop zooming
  the viewport on focus. The viewport meta stays pinch-zoomable (a11y).
- New **Password** and **Character counter** examples on the Input page, a
  **Character counter** example on Textarea.
- Showcase polish: Overview cards render the backticks in each component summary
  as inline `code` (were literal); the "Next" prev/next card is now right-aligned
  to mirror "Previous".

## 0.9.0 — colour contrast pass (SS-45)

Full WCAG 2.1 AA audit of every meaningful text/bg and non-text pair, light and
dark. Token value changes (hues kept, lightness nudged):

- `--text-muted` darkened in light (`neutral-500` → `#616A7B`), lightened in dark
  (`#828B9C` → `#909AAD`) — was < 4.5:1 as body text.
- `--text-accent` (light) → `accent-700`; failed AA on white.
- `--interactive-accent-fg` (light) is now **dark teal instead of white** — white
  on the vivid turquoise fill was 3.0:1. The accent CTA now has dark-on-bright
  text, matching dark mode.
- `--interactive-success` (light) → `green-600`, `--interactive-warning` (light)
  → `#9C6414` — white label was < 4.5:1 on the old fills.
- `--status-success-fg` / `--status-warning-fg` (light) → new `green-700` /
  `amber-700` steps; badge text was < 4.5:1.
- Dark `--interactive-primary` ladder moved one step lighter (`brand-400` fill)
  so the near-black label clears AA.
- New **Contrast (WCAG 2.1 AA)** section on the Tokens page: worst-case ratio per
  group light × dark, plus the documented exemptions (disabled text, decorative
  resting borders, muted-on-tinted-surface = large text only).

## 0.8.3

- Foundations: added `--icon-{xs,sm,md,lg,xl}` (14–24px, the lucide `strokeWidth 1.75`
  convention) and `--bp-{sm,md,lg,xl}` breakpoint tokens. New **Grid & iconography**
  section on the Tokens page (containers, breakpoints, icon sizes). Closes the
  spacing / grid / iconography foundation.
- The `/design-system` version chip is now visible on mobile too (only the
  "Design System" sub-label is dropped at ≤900px).

## 0.8.2

- The DS version chip now shows in the top bar of `/` (the landing), not only
  `/design-system`.
- Landing (`/`) and the demo hub (`/demo`) are now in English, matching the
  showcase. The product screens (`/agendar`, `/dashboard`, `/onboarding`) keep
  their pt-BR copy.
- README rewritten in English.

## 0.8.1

- SEO: `/dashboard` and `/onboarding` now set their own `openGraph` title / url
  (they were falling back to the site default). `/` and `/agendar/[slug]` were
  already correct.

## 0.8.0 — breaking (`Select`)

- **`Select` is no longer a styled native `<select>` on desktop.** On pointer
  devices it renders a hand-rolled listbox: token-styled panel in a portal,
  positioned under the trigger (flips up when there is no room), selected row
  checked, full keyboard (`↑ ↓`, `Home` / `End`, type-ahead, `Enter`, `Esc`,
  `Tab`), `role="combobox"` + `role="listbox"` with `aria-activedescendant`.
  Page scrolling is **locked while the menu is open** (the native-select / Radix
  Select convention) — the list's own overflow still scrolls.
- On **touch devices** (`pointer: coarse`) it falls back to the native
  `<select>` — the OS picker is the better experience with a finger. Same API.
- **API change:** `value` / `defaultValue` + `onValueChange(value: string)` —
  a plain string, not a DOM event. `SelectOption` gains `disabled?`. `placeholder`
  and `name` (mirrored to a hidden input) are new. Swept every call site
  (`Onboarding`, `WeeklyScheduleEditor`, `Dashboard`).
- No new dependency — hand-rolled, consistent with `DateTimePicker`.

## 0.7.0

- **Semantic fills on the action components.** `Button` and `IconButton` gain
  `success` · `warning` · `error` variants, driven by new
  `--interactive-{success,warning,error}` tokens (light + dark). Same three words
  as `Badge` / `Alert` / `Toast`. There is no `info` fill — in Sereno that is the
  brand indigo, i.e. `primary`.
- `Button` variant `destructive` is removed. Use `variant="error"` (a destructive
  confirm is where the colour itself is the message).
- Token rename finished: every `--interactive-danger-*` is now
  `--interactive-error-*` (forms, dialogs, tokens page).
- New component-page sections: **Semantic fills** on Button and IconButton.
- Tokens page: the **Interactive & borders** row now shows `success` / `warning`
  (and a note that there is no `--interactive-info`), Surfaces gains `--bg-sunken`,
  and the renamed **Status tones** block spells out the five-word family.
- All `/design-system` demos and code samples are in English; the product screens
  stay pt-BR.
- Sidebar: hover and the active item no longer read as the same state — active is a
  brand-tinted wash + blue bar + blue label, hover is a plain neutral wash, and the
  focus ring is a tidy inset outline instead of a floating halo.

## 0.6.0 — breaking

- **Unified semantic tone vocabulary** across `Badge`, `Alert` and `Toast`:
  `success · warning · error · info · neutral` — the same five words everywhere.
  Token groups renamed: `--status-confirmed-*` → `--status-success-*`,
  `--status-pending-*` → `--status-warning-*`, `--status-cancelled-*` → `--status-error-*`,
  `--status-completed-*` → `--status-neutral-*`.
- `Badge.tone` no longer accepts the booking-lifecycle names (`confirmed`, `pending`…).
- `AppointmentCard` and `Avatar` keep their domain `status` prop and map to a semantic
  tone internally.
- Documentation (`/design-system`) is now in English; the product screens stay pt-BR.
- MUI-style sidebar: vertical guide line + left accent bar on the active item.

## 0.5.1

- All 25 components have example sections + a Usage block (not just Button).
- IconButton: added the `disabled` example; note that there are only three variants
  (ghost / secondary / primary), no semantic tones. *(Superseded in 0.7.0.)*

## 0.5.0

- MUI-style component pages: named example sections with "Show code", a **Usage**
  block (Do / Don't), an "On this page" rail and previous/next navigation.
- Button fully on the new format; the rest fall back to a single "Example" section.
- DS version visible in the header.

## 0.4.0

- Responsiveness pass: `/agendar` (mobile → contained card → 2-column card),
  `/dashboard` (BottomNav → sidebar), `/onboarding` (grids stack), `/design-system`
  (drawer on mobile).
- Components hardened to reflow: `Tabs` (pill hugs its content, legible counter),
  `AppointmentCard`, `Badge` (neutral became an outline chip), `Avatar`,
  `WeeklyScheduleEditor`.

## 0.3.0

- `/design-system` becomes a fixed app-shell (header does not scroll; sidebar and
  content are independent panels); full-bleed; component preview on a white surface.
- Reworked the light-theme background scale (`--bg-canvas` and friends) to give
  contrast to `secondary` and to tinted panels. Text / brand / status hues untouched.

## 0.2.0

- Landing reduced to two doors (Design System / App); product screens moved to `/demo`.

## 0.1.0

- Initial build: 25 components ported to `.tsx`, tokens, a navigable showcase,
  3 product screens, basic SEO. (card SS-39, Phases A–E)
