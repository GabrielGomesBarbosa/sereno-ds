# Sereno DS — changelog

Version shown in the `/design-system` header. Source: `src/design-system/version.ts`.

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
