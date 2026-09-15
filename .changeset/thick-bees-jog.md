---
"@sereno-ds/ui": patch
---

Fix `dist/**/*.js` relative imports missing `.js` extensions (SS-252). tsup's `bundle: false` mode never rewrote them, which is valid per bundler resolution (Next/webpack/Vite) but violates the Node ESM spec — breaking plain Node, ts-node, and Vitest consumers with `Cannot find module` errors. A postbuild step now adds the missing extensions.
