import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  // Mirrors tsconfig.json's `paths` — most specific first, `@/*` (repo-root-relative) last.
  resolve: {
    alias: [
      { find: '@/screens', replacement: new URL('./src/screens', import.meta.url).pathname },
      { find: '@/domain', replacement: new URL('./src/domain', import.meta.url).pathname },
      { find: '@/lib', replacement: new URL('./src/lib', import.meta.url).pathname },
      { find: '@', replacement: new URL('.', import.meta.url).pathname },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
