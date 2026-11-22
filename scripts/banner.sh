#!/usr/bin/env bash
# Regenerates the link-share card / README banner of the Design System: apps/docs/app/opengraph-image.png (+ its alt text).
#   npm run gen:banner
# Step 1 runs on this machine: esbuild bundles scripts/banner/build-banner.tsx (the page, made of the catalogue and the real
# components; @sereno-ds/ui is ESM-only, so it is run by Node as ESM instead of through tsx) and Node writes the HTML.
# Step 2 photographs that page inside the same pinned Playwright image the pixel tests use, so the fonts come out the
# same everywhere.
# Needs: Docker, and `npm run build -w @sereno-ds/ui` once (the page renders the built components).
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE="mcr.microsoft.com/playwright:v1.65.1-noble" # keep in step with @playwright/test in apps/docs/package.json
[ -d packages/ui/dist ] || { echo "packages/ui/dist is missing: run 'npm run build -w @sereno-ds/ui' first" >&2; exit 1; }
mkdir -p scripts/.banner
npx esbuild scripts/banner/build-banner.tsx --bundle --platform=node --format=esm --jsx=automatic --packages=external \
  --outfile=scripts/.banner/build-banner.mjs --log-level=error
node scripts/.banner/build-banner.mjs
docker run --rm --platform linux/arm64 -v "$PWD":/work -w /work "$IMAGE" node scripts/banner/render.mjs
