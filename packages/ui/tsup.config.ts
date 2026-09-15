import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'tsup';
import { fixEsmExtensions } from './scripts/fix-esm-extensions.mjs';

/**
 * `bundle: false` keeps the source module structure in `dist/`, so each
 * component keeps its own `'use client'` boundary (RSC-friendly) and consumers
 * tree-shake per file. `styles.css` is copied verbatim — it's the one required
 * stylesheet (see README / SS-154).
 */
export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}', '!src/test/**'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  dts: { compilerOptions: { incremental: false, composite: false, tsBuildInfoFile: null } },
  bundle: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  async onSuccess() {
    await copyFile('src/styles.css', 'dist/styles.css');
    // esbuild's per-file transpile (bundle: false) never rewrites import
    // specifiers, so relative ones keep the extensionless form they have in
    // source — invalid per the Node ESM spec. Bundler resolution tolerates
    // it; Node's native resolver (Vitest, plain Node) doesn't.
    await fixEsmExtensions(path.resolve(import.meta.dirname, 'dist'));
  },
});
