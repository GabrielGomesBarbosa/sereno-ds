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
| `packages/ui` | `@sereno/ui` | **28 React primitives** + `src/styles.css` + `_internal/` + `theme/` (`ThemeProvider` / `ThemeToggle`) — token-driven inline styles, native dark mode, no Radix / MUI / Tailwind |
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
| **core** (7) | `Avatar` · `Badge` · `Brand` · `Button` · `Card` · `IconButton` · `Table` |
| **forms** (10) | `AvatarUpload` · `Checkbox` · `DateTimePicker` · `FileUpload` · `Input` · `Radio` · `SearchInput` · `Select` · `Switch` · `Textarea` |
| **navigation** (5) | `BottomNav` · `SidebarNav` · `Stepper` · `Tabs` · `TopBar` |
| **feedback** (5) | `Alert` · `Dialog` · `EmptyState` · `Skeleton` · `Toast` |
| **theme** (2) | `ThemeProvider` · `ThemeToggle` |

Product-domain cards (`ServiceCard`, `ProfessionalCard`, `AppointmentCard`,
`WeeklyScheduleEditor`) are **not** in `@sereno/ui` — they encode Sereno's
domain, not reusable UI. They live in `apps/demo/src/domain/` as a reference for
building product components on top of the DS.

## Getting started

```bash
npm install
npm run dev          # turbo run dev — docs on :3000, demo on :3001
npm run build        # turbo run build — each app writes its own out/
npm run lint         # turbo run lint
npm run typecheck    # turbo run typecheck
```

`npm run build` must be green: **docs ≈ 32 routes** (25 component pages + tokens +
overview + robots) and **demo ≈ 12 routes** (hub + 3 `/agendar` slugs + dashboard
+ onboarding + robots + sitemap).

## Layout

```
packages/
  tokens/   *.css + tokens.css barrel + package.json (exports the .css)
  ui/
    src/
      index.ts            the barrel
      core/ forms/ navigation/ feedback/   the 28 primitives
      _internal/           Field, CharCount, mask, style helpers
      theme/               ThemeProvider + ThemeToggle
      styles.css           keyframes + :checked / scrollbar / reflow rules
apps/
  docs/
    app/                   layout.tsx (fonts + ThemeProvider), globals.css, design-system/**, page.tsx (landing), robots.ts
    src/design-system/     catalog, demos, ComponentView, DocPage, Sidebar, Shell, version.ts + CHANGELOG.md
  demo/
    app/                   layout.tsx, globals.css, agendar/[slug]/, dashboard/, onboarding/, robots.ts, sitemap.ts
    src/screens/           BookingFlow, Dashboard, Onboarding
    src/domain/            ServiceCard, ProfessionalCard, AppointmentCard, WeeklyScheduleEditor — product cards built on @sereno/ui
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

**One version** — `packages/ui` + `packages/tokens` `package.json` (lockstep).
That number publishes to npm and is what the `/design-system` header shows (it
reads `@sereno/ui/package.json`). Managed with **Changesets**: a PR that changes
a component / token adds a `.changeset/*.md` (`npm run changeset`); showcase- or
demo-only PRs add nothing and bump nothing. `npm run version-packages` cuts the
bump + `packages/ui/CHANGELOG.md`; `npm run release` publishes. Tags:
`@sereno/ui@X.Y.Z` — see
[Releases](https://github.com/GabrielGomesBarbosa/sereno-ds/releases).
`apps/docs/src/design-system/CHANGELOG.md` is the hand-written narrative.

## Deploy

**Railway**, static. Both apps ship as `output: 'export'` and are served with
`serve` — two services (`docs`, `demo`) from this repo, build `npm run build:docs`
/ `build:demo`, start `npm run serve:docs` / `serve:demo`. One domain per service,
deployed from `main`; no per-PR previews. Setup and route checklist in
[`docs/deploy.md`](./docs/deploy.md).
