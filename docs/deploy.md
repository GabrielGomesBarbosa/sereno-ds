# Deploy — Railway (static)

Both apps ship as **static exports** (`output: 'export'`). No Node server runs in
production — Railway just serves the pre-built `out/` folder with
[`serve`](https://www.npmjs.com/package/serve) (a root `dependency`, so it
survives prod pruning). The showcase and demo have zero server logic; a runtime
(`next start`) would cost a live process for nothing. If the real Sereno product
(auth + DB, epic SS-104) is built, that's a separate app that would use runtime.

## Railway setup — one project, two services

Create a Railway project connected to `GabrielGomesBarbosa/sereno-ds`, then add
**two services** in it. Both are monorepo-aware: the build runs Turborepo from
the repo root, so **Root Directory stays `/` for both** — they only differ in the
build/start command.

| Setting | `sereno-ds` (docs) | `sereno-demo` (demo) |
|---|---|---|
| Root Directory | `/` | `/` |
| Build Command | `npm run build:docs` | `npm run build:demo` |
| Start Command | `npm run serve:docs` | `npm run serve:demo` |
| Healthcheck Path | `/` | `/` |
| Watch Paths (optional) | `apps/docs/**`, `packages/**`, `turbo.json`, `package*.json` | `apps/demo/**`, `packages/**`, `turbo.json`, `package*.json` |

`build:docs` / `build:demo` are `turbo run build --filter=<app>` (builds
`@sereno/tokens` + `@sereno/ui` first via `^build`). `serve:docs` / `serve:demo`
serve `apps/<app>/out` on `$PORT`.

Railway generates a domain per service — e.g. `sereno-ds.up.railway.app` and
`sereno-demo.up.railway.app`. Custom domain later is a service setting + a DNS
CNAME; not needed now.

## Cross-app URLs — build-time env vars

The landing links between the two apps via `NEXT_PUBLIC_DS_URL` /
`NEXT_PUBLIC_DEMO_URL` (SS-156). These are **inlined at `next build`**, so they
must be set on the service **before the build**:

| Service | Variable | Value |
|---|---|---|
| docs | `NEXT_PUBLIC_DEMO_URL` | the demo service's public URL |
| demo | `NEXT_PUBLIC_DS_URL` | the docs service's public URL |

Order of operations: create both services → note the two generated URLs → set the
env var on each → redeploy both. Without them the links fall back to
`http://localhost:3000` / `:3001`.

Also carry over from Netlify: `NODE_VERSION` isn't needed (Railway's Node 20+ is
fine); no other build env was set.

## No per-PR previews (SS-184)

Railway's PR environments spin up a full paid environment per open PR. For now we
skip them — test locally (`npm run dev`) and on the branch before merge. If
preview URLs become necessary, revisit: Railway PR environments, or a GitHub
Action that builds `out/` and uploads it somewhere ephemeral.

## Netlify cutover (SS-185)

`netlify.toml` stays until both Railway services are confirmed green (SS-186
smoke test). Then: remove `netlify.toml`, delete the Netlify site, swap the
README status badge, and drop Netlify mentions from `README.md` / `CLAUDE.md`.
