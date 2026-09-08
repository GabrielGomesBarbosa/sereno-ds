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

## Step 2 — Service `docs` (the showcase)

Railway auto-detects the monorepo and stages a `docs` service. Open it →
**Settings**:

| Field | Value | Why |
|---|---|---|
| **Root Directory** | `/` | The build is a Turborepo monorepo build from the repo root — `@sereno-ds/tokens` / `@sereno-ds/ui` build first (`^build`). An app subdir can't build alone. This is why it's `/`, not `/apps/docs`. |
| **Build Command** | `npm run build:docs` | = `turbo run build --filter=docs` |
| **Start Command** | `npm run serve:docs` | = `serve apps/docs/out -l $PORT` |
| **Healthcheck Path** | `/` | Confirm it returns 200 before moving on. |
| **Watch Paths** (optional) | `apps/docs/**`, `packages/**`, `turbo.json`, `package*.json` | So a demo-only change doesn't rebuild docs. |

Then **Settings → Networking → Generate Domain** (e.g.
`docs-production-xxxx.up.railway.app`, HTTPS automatic). Note this URL.

## Step 3 — Service `demo` (the demo app)

The monorepo detection stages a `demo` service in the same project (or add it
with **+ New → GitHub Repo** → same repo). Open it → **Settings**:

| Field | Value |
|---|---|
| **Root Directory** | `/` |
| **Build Command** | `npm run build:demo` |
| **Start Command** | `npm run serve:demo` |
| **Healthcheck Path** | `/` |
| **Watch Paths** (optional) | `apps/demo/**`, `packages/**`, `turbo.json`, `package*.json` |

**Networking → Generate Domain**. Note this URL too.

## Step 4 — Origins (build-time env vars)

Each app reads its **own** public origin for `metadataBase`, `sitemap.xml` and
`robots.txt`, and the **other** app's origin for the cross-app links. All four are
`NEXT_PUBLIC_*`, **baked into the bundle at `next build`** — with Nixpacks a plain
service variable set before the deploy is enough (no Dockerfile `ARG`). Reference
the generated domains directly:

| Service | Variable | Value |
|---|---|---|
| `docs` | `NEXT_PUBLIC_DS_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` — its own origin (metadata, sitemap) |
| `docs` | `NEXT_PUBLIC_DEMO_URL` | `https://${{demo.RAILWAY_PUBLIC_DOMAIN}}` — the demo, for "See the app" |
| `demo` | `NEXT_PUBLIC_DEMO_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` — its own origin (metadata, sitemap, robots) |
| `demo` | `NEXT_PUBLIC_DS_URL` | `https://${{docs.RAILWAY_PUBLIC_DOMAIN}}` — the showcase, for "Design System" |

Order: both services exist → both domains generated → set the four variables →
**Redeploy both** (values bake in at build). Without them everything falls back to
`http://localhost:3000` / `:3001`.

No `NODE_VERSION` pin is needed — Railway's Node 20+ is fine.

## Step 5 — Verify

For each service, once the deploy is green:

- `GET /` → 200
- `docs`: `/design-system/`, `/design-system/core/button/`, `/robots.txt`,
  `/icon.svg`, `/apple-icon.png`, `/opengraph-image.png` → 200
- `demo`: `/`, `/agendar/ana-ramos/`, `/dashboard/`, `/onboarding/`,
  `/robots.txt`, `/sitemap.xml` → 200 — and `sitemap.xml` / `robots.txt` must
  carry the **Railway** origin, not `localhost` or a stale host
- an unknown path → 404
- toggle dark mode; check the cross-app "See the app" / "Design System" buttons
  open the other service.

This is SS-186. When both pass, tell me the two URLs.

## Step 6 — Netlify cutover (SS-185, done)

`netlify.toml` and every Netlify reference (`README.md`, `CLAUDE.md`,
`.gitignore`, `eslint.config`, plus the repo description / homepage / topics on
GitHub) were removed once both Railway services were green. Deleting the Netlify
**site** itself is a manual step in the Netlify dashboard.

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
