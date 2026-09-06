# Sereno — Design System monorepo

![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)
![No UI base lib](https://img.shields.io/badge/UI%20base-none-8B5CF6)

The visual / front-end layer of **Sereno**, a scheduling platform for independent
health & beauty professionals in Brazil: the Design System, a navigable showcase,
and three real product screens on mocked data — no backend, everything static.

Being turned into a publishable package — Epic **SS-153**.

## Workspaces

npm workspaces + Turborepo.

| Path | Name | What |
|---|---|---|
| `packages/tokens` | `@sereno/tokens` | the token layer — `*.css` (light × dark) + a `tokens.css` barrel |
| `packages/ui` | `@sereno/ui` | **31 React primitives** + `src/styles.css` + `_internal/` + `theme/` (`ThemeProvider` / `ThemeToggle`) — token-driven inline styles, native dark mode, no Radix / MUI / Tailwind |
| `apps/docs` | `docs` | the `/design-system` showcase (Next 16, `output: 'export'`) — MUI-doc-style page per component: live preview, "show code", Do / Don't, "on this page" rail, prev/next, versioned header |
| `apps/demo` | `demo` | `/demo` hub + `/agendar/[slug]` (public booking) + `/dashboard` + `/onboarding` + `src/screens/` + `src/lib/mock.ts` — fully responsive, components reflow |

- **`@sereno/ui` / `@sereno/tokens` are consumed as source** through the workspace
  link (`transpilePackages`) — a real package build lands in SS-156.
- The component stylesheet (`@keyframes`, `:checked` / `:focus-visible`,
  `::-webkit-scrollbar`, one responsive reflow) is
  **`packages/ui/src/styles.css`** — load it once at the app root. Each app's
  `globals.css` does `@import "@sereno/tokens/tokens.css"` then
  `@import "@sereno/ui/styles.css"`, then only its own shell rules.
- Icons: `lucide-react` passed to components as props (a `peerDependency`).
- Fonts: `next/font/google` per app; the `--font-*` CSS vars are the `@sereno/ui`
  contract.

## Components

| Category | Components |
|---|---|
| **core** (5) | `Avatar` · `Badge` · `Button` · `Card` · `IconButton` |
| **forms** (10) | `AvatarUpload` · `Checkbox` · `DateTimePicker` · `FileUpload` · `Input` · `Radio` · `SearchInput` · `Select` · `Switch` · `Textarea` |
| **navigation** (5) | `BottomNav` · `SidebarNav` · `Stepper` · `Tabs` · `TopBar` |
| **domain** (4) | `AppointmentCard` · `ProfessionalCard` · `ServiceCard` · `WeeklyScheduleEditor` |
| **feedback** (5) | `Alert` · `Dialog` · `EmptyState` · `Skeleton` · `Toast` |
| **theme** (2) | `ThemeProvider` · `ThemeToggle` |

## Getting started

```bash
npm install
npm run dev          # turbo run dev — docs on :3000, demo on :3001
npm run build        # turbo run build — each app writes its own out/
npm run lint         # turbo run lint
npm run typecheck    # turbo run typecheck
```

`npm run build` must be green: **docs ≈ 36 routes** (29 component pages + tokens +
overview + robots) and **demo ≈ 12 routes** (hub + 3 `/agendar` slugs + dashboard
+ onboarding + robots + sitemap).

## Layout

```
packages/
  tokens/   *.css + tokens.css barrel + package.json (exports the .css)
  ui/
    src/
      index.ts            the barrel
      core/ forms/ navigation/ feedback/ domain/   the 31 primitives
      _internal/           Field, CharCount, mask, style helpers
      theme/               ThemeProvider + ThemeToggle
      styles.css           keyframes + :checked / scrollbar / reflow rules
apps/
  docs/
    app/                   layout.tsx (fonts + ThemeProvider), globals.css, design-system/**, page.tsx (landing), robots.ts
    src/design-system/     catalog, demos, ComponentView, DocPage, Sidebar, Shell, version.ts + CHANGELOG.md
  demo/
    app/                   layout.tsx, globals.css, demo/, agendar/[slug]/, dashboard/, onboarding/, robots.ts, sitemap.ts
    src/screens/           BookingFlow, Dashboard, Onboarding
    src/lib/mock.ts        mocked data for the 3 screens
turbo.json                 build / lint / typecheck / dev tasks
tsconfig.base.json         shared compiler options (each workspace extends it)
```

## Contributing

The full workflow (Jira task per change, branch naming, PR + squash merge,
version bump rules, tag + release) is in [`CLAUDE.md`](./CLAUDE.md). In short: no
direct push to `main` — every change goes through a PR, and `npm run lint && npm run build`
must be green.

## Versioning & releases

The **showcase** version lives in `apps/docs/src/design-system/version.ts` and
shows in the `/design-system` header. Every PR that touches `packages/` or `apps/`
bumps it and adds an `apps/docs/src/design-system/CHANGELOG.md` entry (pre-1.0:
`patch` = fix/tweak, `minor` = feature / structure / breaking). After each merge a
GitHub release `vX.Y.Z` is cut — see
[Releases](https://github.com/GabrielGomesBarbosa/sereno-ds/releases).
The `@sereno/ui` / `@sereno/tokens` package versions get their own line (changesets)
in SS-199 — for now they track the showcase version.

## Deploy

**Stopgap until SS-158 (Railway).** `netlify.toml` builds and publishes
**`apps/docs` only** (`npm run build -- --filter=docs`, `publish = apps/docs/out`).
`apps/demo` is not deployed anywhere in the meantime — run it locally.
