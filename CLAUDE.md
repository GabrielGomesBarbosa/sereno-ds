@AGENTS.md

# Sereno DS — notes for Claude

Full context and scope: Jira card **SS-39** (project SS). Read it before any large change.

## Workflow (required)

1. **Every change starts from a Jira task** (project SS). No task, no work.
2. **Ad-hoc tweak asked for in chat** → ask whether to create a new Jira task
   before touching code.
3. **One task at a time → one branch → one PR.** The branch name carries the ID:
   `feat|fix|chore|docs|refactor/SS-<id>-<slug>` (e.g. `fix/SS-123-select-scroll`).
4. **Never push or merge straight to `main`.** Everything goes through a PR whose
   body says what it contains (summary + how to test). `npm run lint && npm run build`
   must be green first. Merge with **squash**.
5. **Every PR that touches `app/`, `src/` or `app/styles/` bumps the version:**
   edit `src/design-system/version.ts` and add an entry to
   `src/design-system/CHANGELOG.md`. Pre-1.0 → `patch` = fix/tweak, `minor` =
   feature / structure / breaking (`major` is reserved for 1.0+).
6. **After the merge:**
   ```bash
   git checkout main && git pull
   gh release create vX.Y.Z --title "vX.Y.Z — <summary>" --notes "<the CHANGELOG section>"
   ```
   The tag is created with the release. This is what keeps the version history.
7. **Pure repo-meta PRs** (`CLAUDE.md`, `AGENTS.md`, `.gitignore`, `.github/`,
   `netlify.toml`, `eslint.config`) still need a task + PR, but **no version
   bump and no release**.
8. Merge to `main` → automatic Netlify deploy (once the repo is connected).

## Repo rules

- **Next.js 16 App Router + TypeScript**, `output: 'export'` (static, deployed to
  Netlify). No SSR / Node server.
- **No UI base library.** The 25 components in `src/components/` are ported 1:1
  from the approved Design System — token-driven, inline styles reading CSS custom
  properties. When editing them, preserve behaviour; do not introduce
  Radix/MUI/Tailwind.
- **Tokens** live in `app/styles/tokens/*.css`. Adjustments are made and documented
  in the file itself:
  - `typography.css` points the font families at the `next/font` variables.
  - `colors.css`: the `:root` selector is widened to `:root, [data-theme="light"]`
    (theme islands on the tokens page).
  - `colors.css`: **the light-theme background scale was revised** (product owner
    decision, 2026-08-29) — the old canvas (`#F5F7FA`) sat too close to the white
    surface and to brand-soft; now `--bg-canvas:#E8ECF3`, `--bg-subtle:#DFE4EC`,
    `--bg-sunken:#D9DFE9`, `--bg-brand-soft:brand-100`, `--bg-accent-soft:accent-100`,
    and the low-emphasis fills (`--interactive-secondary-hover/active`,
    `--interactive-ghost-hover`, `--interactive-disabled-bg`) were bumped a step.
    Text / brand / status hues untouched. Dark mode untouched.
- **Icons:** always `lucide-react` passed as a prop (`iconLeft`, `icon`,
  `children`…). Never a CDN or `data-lucide`.
- **Fonts:** `next/font/google` only. Never the Google Fonts CDN.
- **Global keyframes / states** (`sereno-spin`, `sereno-pop`, `sereno-slide-up`,
  `sereno-pulse`, `.sereno-check:checked`, `.sereno-radio:checked`) live in
  `app/globals.css` — components depend on them.
- Dynamic routes need `generateStaticParams` (static export). `robots.ts` /
  `sitemap.ts` need `export const dynamic = 'force-static'`.
- `/design-system/**` is `noindex` and stays out of the sitemap.
- Showcase / navigation pages (`/`, `/demo`, `/design-system`) are in English;
  the product screens (`/agendar`, `/dashboard`, `/onboarding`) keep their pt-BR
  copy.

## Check before commit

```bash
npm run lint && npm run build
```

`npm run build` must produce `out/` with no error — the 25 component pages plus the
3 product screens (39 routes total).
