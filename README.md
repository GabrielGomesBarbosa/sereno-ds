<div align="center">

# Sereno Design System

Token-driven React primitives for the Sereno scheduling platform — native dark mode,
no UI base library, one live preview per component.

[![npm @sereno-ds/ui](https://img.shields.io/npm/v/@sereno-ds/ui?label=%40sereno-ds%2Fui&color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@sereno-ds/ui)
[![npm @sereno-ds/tokens](https://img.shields.io/npm/v/@sereno-ds/tokens?label=%40sereno-ds%2Ftokens&color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@sereno-ds/tokens)
[![CI](https://github.com/GabrielGomesBarbosa/sereno-ds/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrielGomesBarbosa/sereno-ds/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/GabrielGomesBarbosa/sereno-ds?color=8B5CF6)](./LICENSE)

![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)
![No UI base lib](https://img.shields.io/badge/UI%20base-none-8B5CF6)

**[Design System ↗](https://docs-production-2f40.up.railway.app)** &nbsp;·&nbsp;
**[Live demo ↗](https://demo-production-bfd0.up.railway.app)** &nbsp;·&nbsp;
[Workspaces](#workspaces) &nbsp;·&nbsp;
[Components](#components) &nbsp;·&nbsp;
[Getting started](#getting-started) &nbsp;·&nbsp;
[Contributing](#contributing)

[![Sereno Design System](https://docs-production-2f40.up.railway.app/opengraph-image.png)](https://docs-production-2f40.up.railway.app)

</div>

---

The visual / front-end layer of **Sereno**, a scheduling platform for independent
health & beauty professionals in Brazil: the Design System, a navigable showcase,
and three real product screens on mocked data — no backend, everything static.

## Workspaces

npm workspaces + Turborepo.

| Path | Name | What |
|---|---|---|
| `packages/tokens` | [`@sereno-ds/tokens`](https://www.npmjs.com/package/@sereno-ds/tokens) | the token layer — `*.css` (light × dark) + a `tokens.css` barrel |
| `packages/ui` | [`@sereno-ds/ui`](https://www.npmjs.com/package/@sereno-ds/ui) | **30 React primitives** + `src/styles.css` + `_internal/` + `theme/` (`ThemeProvider` / `ThemeToggle`) — token-driven inline styles, native dark mode, no Radix / MUI / Tailwind |
| `apps/docs` | [`docs`](https://docs-production-2f40.up.railway.app) | the `/design-system` showcase (Next 16, `output: 'export'`) — MUI-doc-style page per component: live preview, "show code", Do / Don't, "on this page" rail, prev/next, versioned header |
| `apps/demo` | [`demo`](https://demo-production-bfd0.up.railway.app) | `/demo` hub + `/agendar/[slug]` (public booking) + `/dashboard/[[...slug]]` + `/onboarding` + `src/screens/` + `src/lib/mock.ts` — fully responsive, components reflow |

- **`@sereno-ds/ui` / `@sereno-ds/tokens` are consumed as source** through the workspace
  link (`transpilePackages`) — a real package build lands in SS-156.
- The component stylesheet (`@keyframes`, `:checked` / `:focus-visible`,
  `::-webkit-scrollbar`, one responsive reflow) is
  **`packages/ui/src/styles.css`** — load it once at the app root. Each app's
  `globals.css` does `@import "@sereno-ds/tokens/tokens.css"` then
  `@import "@sereno-ds/ui/styles.css"`, then only its own shell rules.
- Icons: `lucide-react` passed to components as props (a `peerDependency`).
- Fonts: `next/font/google` per app; the `--font-*` CSS vars are the `@sereno-ds/ui`
  contract.

## Getting started

```bash
npm install @sereno-ds/ui @sereno-ds/tokens
```

```tsx
import '@sereno-ds/tokens/tokens.css';
import '@sereno-ds/ui/styles.css';
import { Button, Card, ThemeProvider } from '@sereno-ds/ui';

export default function App() {
  return (
    <ThemeProvider>
      <Card padding="lg">
        <Button variant="accent">Confirm booking</Button>
      </Card>
    </ThemeProvider>
  );
}
```

Browse every primitive — props, live preview, code, Do / Don't — on the
**[Design System site](https://docs-production-2f40.up.railway.app)**.

### Developing this monorepo

```bash
npm install
npm run dev          # turbo run dev — docs on :3001, demo on :3002
npm run build        # turbo run build — each app writes its own out/
npm run lint         # turbo run lint
npm run typecheck    # turbo run typecheck
```

`npm run build` must be green: **docs = 36 routes** (28 component pages + tokens +
overview + robots) and **demo = 48 routes** (hub + 3 `/agendar` slugs + all 36
`/dashboard` nav destinations + onboarding + robots + sitemap) — both counts move
as components / nav items are added, treat them as a sanity check, not a fixed
target.

## Components

| Category | Components |
|---|---|
| **core** (9) | `Avatar` · `Badge` · `Brand` · `Button` · `Card` · `IconButton` · `Menu` · `Table` · `Typography` |
| **forms** (11) | `AvatarUpload` · `Checkbox` · `DatePicker` · `DateTimePicker` · `FileUpload` · `Input` · `Radio` · `SearchInput` · `Select` · `Switch` · `Textarea` |
| **navigation** (5) | `BottomNav` · `SidebarNav` · `Stepper` · `Tabs` · `TopBar` |
| **feedback** (5) | `Alert` · `Dialog` · `EmptyState` · `Skeleton` · `Toast` |
| **theme** (2) | `ThemeProvider` · `ThemeToggle` |

Product-domain cards (`ServiceCard`, `ProfessionalCard`, `AppointmentCard`,
`WeeklyScheduleEditor`) are **not** in `@sereno-ds/ui` — they encode Sereno's
domain, not reusable UI. They live in `apps/demo/src/domain/` as a reference for
building product components on top of the DS.

`Table`, `Tabs`, `SidebarNav`, `BottomNav`, `Stepper`, `Dialog` and `TopBar`
are **compound components** — a root plus dot-notated sub-parts composed as
JSX (`<Dialog.Header>`, `<Tabs.Tab>`, …), not a config array/prop. Runnable
examples in [`packages/ui/README.md`](./packages/ui/README.md#compound-components);
the full pattern (including why `Select` / `DateTimePicker` stay a plain
config-prop API — SS-225) is in [`AGENTS.md`](./AGENTS.md).

## Layout

<details>
<summary>Full directory tree</summary>

```
packages/
  tokens/   *.css + tokens.css barrel + package.json (exports the .css)
  ui/
    src/
      index.ts            the barrel
      core/ forms/ navigation/ feedback/   the 30 primitives
      _internal/           Field, CharCount, mask, style helpers
      theme/               ThemeProvider + ThemeToggle
      styles.css           keyframes + :checked / scrollbar / reflow rules
apps/
  docs/
    app/                   layout.tsx (fonts + ThemeProvider), globals.css, design-system/**, page.tsx (landing), robots.ts
    src/design-system/     catalog, demos, ComponentView, DocPage, Sidebar, Shell, version.ts + CHANGELOG.md
  demo/
    app/                   layout.tsx, globals.css, agendar/[slug]/, dashboard/, onboarding/, robots.ts, sitemap.ts
    src/screens/           BookingFlow, Onboarding, Dashboard/ (one file per view)
    src/domain/            ServiceCard, ProfessionalCard, AppointmentCard, WeeklyScheduleEditor — product cards built on @sereno-ds/ui
    src/lib/mock.ts        mocked data for the 3 screens
turbo.json                 build / lint / typecheck / dev tasks
tsconfig.base.json         shared compiler options (each workspace extends it)
```

</details>

## Contributing

The full workflow (Jira task per change, branch naming, PR + squash merge,
version bump rules, tag + release) is in [`AGENTS.md`](./AGENTS.md) — the
project's agent-instructions file (`CLAUDE.md` just points to it). In short: no
direct push to `main` — every change goes through a PR, and `npm run lint && npm run build`
must be green.

## Versioning & releases

**One version** — `packages/ui` + `packages/tokens` `package.json` (lockstep).
That number publishes to npm and is what the `/design-system` header shows (it
reads `@sereno-ds/ui/package.json`). Managed with **Changesets**: a PR that changes
a component / token adds a `.changeset/*.md` (`npm run changeset`); showcase- or
demo-only PRs add nothing and bump nothing. `npm run version-packages` cuts the
bump + `packages/ui/CHANGELOG.md`; `npm run release` publishes. Tags:
`@sereno-ds/ui@X.Y.Z` — see
[Releases](https://github.com/GabrielGomesBarbosa/sereno-ds/releases).
`apps/docs/src/design-system/CHANGELOG.md` is the hand-written narrative.

## Deploy

**Railway**, static. Both apps ship as `output: 'export'` and are served with
`serve` — two services (`docs`, `demo`) from this repo, build `npm run build:docs`
/ `build:demo`, start `npm run serve:docs` / `serve:demo`. One domain per service,
deployed from `main`; no per-PR previews. Setup and route checklist in
[`docs/deploy.md`](./docs/deploy.md).

## License

[MIT](./LICENSE) © [Gabriel Gomes Barbosa](https://github.com/GabrielGomesBarbosa)
