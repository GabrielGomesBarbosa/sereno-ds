#!/usr/bin/env bash
# Runs the pixel tests (apps/docs/e2e) inside the pinned Playwright image, the one `ci.yml` uses, so the
# font smoothing is the same as in CI. Usage: scripts/visual.sh [playwright args...]
#   npm run test:visual            compare with the references
#   npm run test:visual:update     refresh the references (only after a human approved the new pixels)
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE="mcr.microsoft.com/playwright:v1.65.1-noble" # keep in step with @playwright/test in apps/docs/package.json
[ -d apps/docs/out ] || { echo "apps/docs/out is missing: run 'npm run build -w docs' first" >&2; exit 1; }
# linux/arm64 on purpose: the CI runner is arm64 too, and the same pixels need the same CPU architecture
# (on an Intel machine it runs emulated: slow, but the same pixels).
exec docker run --rm --platform linux/arm64 --ipc=host -e CI=1 -v "$PWD":/work -w /work/apps/docs "$IMAGE" npx playwright test "$@"
