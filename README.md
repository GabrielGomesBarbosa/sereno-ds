# Sereno — Design System + showcase (Next.js)

The visual / front-end layer of the **Sereno** scheduling platform (a SaaS for
independent health & beauty professionals in Brazil). This repository ships three
things:

1. **Design System** — the 25 approved React primitives, ported to TypeScript in
   `src/components/`, token-driven (CSS custom properties), with native dark mode.
2. **Navigable showcase** (`/design-system`) — one page per component with a live
   preview, a props table and a usage example, plus a tokens page (light × dark).
3. **3 real product screens**, on mocked data:
   - `/agendar/[slug]` — public booking flow (mobile-first)
   - `/dashboard` — professional dashboard
   - `/onboarding` — 3-step wizard

> Reference: Jira card **SS-39**. No backend at this stage — everything is static.
> Showcase and navigation pages (`/`, `/demo`, `/design-system`) are in English;
> the product screens keep their pt-BR copy.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Output | `output: 'export'` (static) → deployed to Netlify (`out/`) |
| Fonts | Inter + Manrope via `next/font/google` (self-hosted, no CDN) |
| Icons | `lucide-react` (passed to components as props) |
| Theme | `next-themes` writing `data-theme` on `<html>` |
| UI base | none — components are built from scratch, no Radix/MUI/etc. |

## Scripts

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build + static export to out/
npm run lint     # ESLint
```

## Layout

```
app/                        routes (App Router)
  layout.tsx                fonts, ThemeProvider, base metadata/OG
  globals.css               imports tokens + keyframes + the .sereno-check/.sereno-radio rules
  styles/tokens/*.css        Design System tokens (values untouched)
  design-system/            showcase (sidebar layout, [category]/[slug], tokens) — noindex
  agendar/[slug]/           public booking flow (generateStaticParams from the mocks)
  dashboard/  onboarding/   product screens
  robots.ts  sitemap.ts     basic SEO (design-system excluded)
src/
  components/               25 .tsx primitives + index.ts (barrel) + _internal/ (helpers)
  screens/                  BookingFlow, Dashboard, Onboarding (client components)
  design-system/            catalog, demos, ComponentView, Sidebar, version + CHANGELOG
  theme/                    ThemeProvider + ThemeToggle
  lib/mock.ts               mocked data for the 3 screens
```

## Versioning

The DS carries a version (`src/design-system/version.ts`), shown in the top bar of
`/` and `/design-system`. Bump it on every change and add an entry to
`src/design-system/CHANGELOG.md`. Pre-1.0: minor = feature/structure, patch =
fix/tweak.

## Deploy (Netlify)

`netlify.toml` already sets `command = "npm run build"` and `publish = "out"`.
Connect the repository in Netlify (free plan) and every push to `main` deploys
automatically; pull requests get a deploy preview. It is a static export — if
Netlify offers the Next.js Runtime plugin, decline it.
