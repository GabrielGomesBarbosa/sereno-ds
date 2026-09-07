import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

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
  },
});
