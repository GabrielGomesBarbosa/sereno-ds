# Sereno — Design System + showcase

![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![output: export](https://img.shields.io/badge/output-export%20(static)-555)
![No UI base lib](https://img.shields.io/badge/UI%20base-none-8B5CF6)
[![Live on Netlify](https://img.shields.io/badge/live-Netlify-00C7B7?logo=netlify&logoColor=white)](https://sereno-ds.netlify.app)

The visual / front-end layer of **Sereno**, a scheduling platform for independent
health & beauty professionals in Brazil. This repo is the Design System plus a
navigable showcase and three real product screens — no backend, everything static.

## ▶ Live

| | |
|---|---|
| **Showcase** | <https://sereno-ds.netlify.app/design-system/> |
| Tokens (light × dark) | <https://sereno-ds.netlify.app/design-system/tokens/> |
| Product screens | <https://sereno-ds.netlify.app/demo/> |

## What's inside

- **28 React primitives** in `src/components/` — 25 ported 1:1 from the approved
  Design System, plus `FileUpload` (SS-49), `AvatarUpload` (SS-146) and `SearchInput` (SS-50), net-new. Token-driven (CSS custom
  properties), inline styles, native dark mode. No Radix / MUI / Tailwind.
- **Tokens** in `app/styles/tokens/*.css` — colours (light × dark), type scale,
  spacing, breakpoints, icon sizes, radii, elevation, motion.
- **Navigable showcase** (`/design-system`) — MUI-doc-style page per component:
  live preview, named examples with "show code", a Do / Don't block, an
  "on this page" rail, prev/next nav, and a versioned header.
- **3 product screens** on mocked data — `/agendar/[slug]` (public booking flow,
  mobile-first), `/dashboard` (professional dashboard), `/onboarding` (3-step
  wizard). Fully responsive; components reflow.
- Fonts via `next/font/google` (self-hosted), icons via `lucide-react` as props —
  no CDNs. Basic SEO (`robots`, `sitemap`, per-route metadata); `/design-system`
  is `noindex`.

> Showcase / navigation pages (`/`, `/demo`, `/design-system`) are in English;
> the product screens keep their pt-BR copy.

## Components

| Category | Components |
|---|---|
| **core** (5) | `Avatar` · `Badge` · `Button` · `Card` · `IconButton` |
| **forms** (7) | `Checkbox` · `DateTimePicker` · `Input` · `Radio` · `Select` · `Switch` · `Textarea` |
| **navigation** (4) | `BottomNav` · `Stepper` · `Tabs` · `TopBar` |
| **domain** (4) | `AppointmentCard` · `ProfessionalCard` · `ServiceCard` · `WeeklyScheduleEditor` |
| **feedback** (5) | `Alert` · `Dialog` · `EmptyState` · `Skeleton` · `Toast` |

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Output | `output: 'export'` (static) → deployed to Netlify (`out/`) |
| Fonts | Inter + Manrope via `next/font/google` (self-hosted, no CDN) |
| Icons | `lucide-react` (passed to components as props) |
| Theme | `next-themes` writing `data-theme` on `<html>` |
| UI base | none — components are built from scratch |

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production build + static export to out/
npm run lint     # ESLint
```

`npm run build` must produce `out/` with no error — 42 routes: the 28 component
pages, the tokens page, the 3 product screens (3 slugs for `/agendar`), plus
`/`, `/demo`, `robots.txt`, `sitemap.xml`.

## Project layout

```
app/                       routes (App Router)
  layout.tsx               fonts, ThemeProvider, base metadata / OG
  globals.css              imports tokens + keyframes + .sereno-check/.sereno-radio rules
  styles/tokens/*.css      Design System tokens (values untouched)
  design-system/           showcase — sidebar layout, [category]/[slug], tokens (noindex)
  agendar/[slug]/          public booking flow (generateStaticParams from the mocks)
  dashboard/ onboarding/   product screens
  demo/  page.tsx          the demo hub, the landing
  robots.ts  sitemap.ts    basic SEO
src/
  components/              28 .tsx primitives + index.ts (barrel) + _internal/ helpers
  screens/                 BookingFlow, Dashboard, Onboarding (client components)
  design-system/           catalog, demos, ComponentView, Sidebar, version.ts + CHANGELOG.md
  theme/                   ThemeProvider + ThemeToggle
  lib/mock.ts              mocked data for the 3 screens
```

## Contributing

The full workflow (Jira task per change, branch naming, PR + squash merge,
version bump rules, tag + release) is in [`CLAUDE.md`](./CLAUDE.md) under
**Workflow (required)**. In short: no direct push to `main` — every change goes
through a PR.

## Versioning & releases

The DS version lives in `src/design-system/version.ts` and shows in the top bar of
`/` and `/design-system`. Every PR that touches `app/`, `src/` or `app/styles/`
bumps it and adds a `src/design-system/CHANGELOG.md` entry (pre-1.0: `patch` =
fix/tweak, `minor` = feature / structure / breaking). After each merge a GitHub
release `vX.Y.Z` is cut from that CHANGELOG section — see
[Releases](https://github.com/GabrielGomesBarbosa/sereno-ds/releases).

## Deploy (Netlify)

`netlify.toml` sets `command = "npm run build"` and `publish = "out"`. Connect the
repo in Netlify (free plan): every push to `main` deploys, pull requests get a
preview. It is a static export — if Netlify offers the **Next.js Runtime** plugin,
decline it.
