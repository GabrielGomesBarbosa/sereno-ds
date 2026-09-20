import { defineConfig } from 'tsup';

/**
 * The token layer is CSS-first (see the `.css` files at the package root,
 * published as-is via `exports` — no build step for them). This only builds
 * the small JS/TS surface (`src/breakpoints.ts` today) for values a CSS
 * custom property can't serve on its own, e.g. inside a `@media` query.
 */
export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.d.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  dts: { compilerOptions: { incremental: false, composite: false, tsBuildInfoFile: null } },
  bundle: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
