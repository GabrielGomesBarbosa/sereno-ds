# Deploy — Railway (static)

Both apps ship as **static exports** (`output: 'export'`). No Node server runs in
production — Railway builds with Nixpacks (auto-detected, no Dockerfile) and
serves the pre-built `out/` folder with [`serve`](https://www.npmjs.com/package/serve)
(a root **`dependency`**, so it survives prod pruning). The showcase and demo have
zero server logic; a runtime (`next start`) would cost a live Node process for
nothing. If the real Sereno product (auth + DB, epic SS-104) is built, that's a
separate app that would use runtime.

General Railway reference: <https://docs.google.com/document/d/1LnXLinMpm6XKu_Vzt1vCKS7YV8Z8ZBiGbGn3xjpZ_fA> — this file is the Sereno-specific instance of it.

---

## Step 1 — Plan, project + spend cap

**Plan — Hobby ($5/mo) is enough.** It includes $5 of monthly usage credit. Both
services are tiny static file servers (`serve` on a built `out/`) — low RAM,
~zero CPU when idle — so they fit inside that credit. Pro (team seats, huge
per-service limits, 30-day logs, higher SLA) is for the real runtime product
later (SS-104), not this. After the trial expires there's no free tier, so Hobby
is the floor.

1. Railway → **New Project → Deploy from GitHub repo** → authorize Railway on the
   GitHub account → pick `GabrielGomesBarbosa/sereno-ds`, branch `main`. This
   creates the first service.
2. Workspace/account **Billing → set a monthly spend cap** now (Railway bills by
   CPU/memory/network usage, not a flat fee). Do this before deploying — avoids a
   surprise invoice. On Hobby, set the **usage limit** so it hard-stops instead
   of billing overage.
3. Optional: flip each service to **Serverless** (service Settings — it sleeps
   when idle and wakes on the next request, a few seconds of cold start). Fine
   for a showcase/demo and keeps usage well under the included $5.

## Step 2 — Service `sereno-ds` (the docs / showcase)

Rename the auto-created service to `sereno-ds` (**Settings → Service Name**), then
**Settings**:

| Field | Value | Why |
|---|---|---|
| **Root Directory** | `/` | The build is a Turborepo monorepo build from the repo root — `@sereno/tokens` / `@sereno/ui` build first (`^build`). An app subdir can't build alone. This is why it's `/`, not `/apps/docs`. |
| **Build Command** | `npm run build:docs` | = `turbo run build --filter=docs` |
| **Start Command** | `npm run serve:docs` | = `serve apps/docs/out -l $PORT` |
| **Healthcheck Path** | `/` | Confirm it returns 200 before moving on. |
| **Watch Paths** (optional) | `apps/docs/**`, `packages/**`, `turbo.json`, `package*.json` | So a demo-only change doesn't rebuild docs. |

Then **Settings → Networking → Generate Domain**. You get something like
`sereno-ds-production.up.railway.app`, HTTPS automatic. Note this URL.

## Step 3 — Service `sereno-demo` (the demo app)

In the **same project**: **+ New → GitHub Repo** → same repo. Rename it
`sereno-demo`, then **Settings**:

| Field | Value |
|---|---|
| **Root Directory** | `/` |
| **Build Command** | `npm run build:demo` |
| **Start Command** | `npm run serve:demo` |
| **Healthcheck Path** | `/` |
| **Watch Paths** (optional) | `apps/demo/**`, `packages/**`, `turbo.json`, `package*.json` |

**Networking → Generate Domain**. Note this URL too.

## Step 4 — Cross-app URLs (build-time env vars)

The landing links between the two apps via `NEXT_PUBLIC_DS_URL` /
`NEXT_PUBLIC_DEMO_URL` (SS-156). `NEXT_PUBLIC_*` is **baked into the client
bundle at `next build`** — with Nixpacks a plain **service variable set before
the deploy** is enough (the Dockerfile `ARG` dance the general guide mentions
does not apply here).

| Service | Variable | Value |
|---|---|---|
| `sereno-ds` | `NEXT_PUBLIC_DEMO_URL` | the `sereno-demo` public URL (with `https://`, no trailing slash) |
| `sereno-demo` | `NEXT_PUBLIC_DS_URL` | the `sereno-ds` public URL |

Order: both services exist → both domains generated → set each variable →
**Redeploy both** (so the new values get baked in). Without them the links fall
back to `http://localhost:3000` / `:3001`.

Nothing else carries over from Netlify — `NODE_VERSION` isn't needed (Railway's
Node 20+ is fine).

## Step 5 — Verify (before the Netlify cutover)

For each service, once the deploy is green:

- `GET /` → 200
- `sereno-ds`: `/design-system/`, `/design-system/core/button/`, `/robots.txt`,
  `/icon.svg`, `/apple-icon.png`, `/opengraph-image.png` → 200
- `sereno-demo`: `/`, `/agendar/ana-ramos/`, `/dashboard/`, `/onboarding/`,
  `/robots.txt`, `/sitemap.xml` → 200
- an unknown path → 404
- toggle dark mode; check the cross-app "See the app" / "Design System" buttons
  open the other service.

This is SS-186. When both pass, tell me the two URLs.

## Step 6 — Netlify cutover (SS-185, I do this)

Once Railway is confirmed green: remove `netlify.toml`, delete the Netlify site,
swap the README status badge, drop Netlify mentions from `README.md` /
`CLAUDE.md`. `netlify.toml` stays until then as the stopgap.

## Gotchas

- **The Hobby $5 credit is workspace-wide, not per project.** An idle project
  still burns it if a service stays online — e.g. an always-on Postgres in
  another project can be $3–5/mo on its own. Pause what you're not using, or set
  the usage limit knowing the Sereno services share the pool.
- **502 "Application failed to respond"** with the deploy otherwise "successful":
  check the **service logs first** — it's almost always a boot error (a missing
  env var, wrong start command), not networking.
- **`NEXT_PUBLIC_*` shows `undefined` / links go to localhost in prod**: the
  variable wasn't set before the build, or the service wasn't redeployed after
  setting it. It's build-time, not runtime.
- **`PORT`**: Railway injects it; our `serve` scripts read `$PORT`. Never hardcode
  a port in a Railway command.
- **No per-PR previews** (SS-184): Railway PR environments are paid per open PR —
  skipped for now. Test locally (`npm run dev`) and on the branch before merge.
