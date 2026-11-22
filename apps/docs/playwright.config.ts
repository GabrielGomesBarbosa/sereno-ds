import { defineConfig } from '@playwright/test';

/**
 * Pixel-by-pixel regression tests of every component (SS-579).
 *
 * They run against the **static build** of the docs (`apps/docs/out`) and screenshot the live demo of
 * each example. Any pixel that differs fails the test (see `expect.toHaveScreenshot` below for the one
 * rounding tolerance there is).
 *
 * They only make sense in ONE environment: font smoothing differs between macOS and Linux, so a reference
 * image made on a Mac would fail in CI by a few pixels. Both the references and the comparison are made
 * in the pinned Playwright Docker image (`scripts/visual.sh`, and the `visual` job of `ci.yml`).
 * Run them with `npm run test:visual`; refresh the references (only after a human looked at the new
 * pixels and approved them) with `npm run test:visual:update`.
 */
export default defineConfig({
  testDir: './e2e',
  // One folder of references per project (light / dark / mobile): `<name>.png`.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0, // a retry would hide a flaky pixel instead of showing it
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  outputDir: 'test-results',
  // One test per component page, and a page with many examples opens many things (each on a fresh page).
  timeout: 300_000,
  expect: {
    // `maxDiffPixels: 0`: not one pixel may be over the limit. `threshold: 0.01` is that limit: a rounding
    // difference of 1 or 2 (of 255) in a colour channel is ignored, a change a person could notice fails (about
    // 3 levels of green, 4 of red, 7 of blue). Why not 0: an element that sits on a half pixel can be drawn one
    // colour level apart between two runs of the same code (the edge of a rounded corner, 1/64 of a pixel of
    // layout); no person can see it, and it made the suite fail at random. See docs/testing.md.
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0.01, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: 'http://localhost:4173',
    actionTimeout: 10_000, // a stuck click must fail with its name, not eat the whole test timeout
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  webServer: {
    command: 'npx serve -l 4173 out',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    // The pixel tests: three looks of the same pages.
    { name: 'light', testIgnore: /forced-colors|a11y/, use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' } },
    { name: 'dark', testIgnore: /forced-colors|a11y/, use: { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' } },
    { name: 'mobile', testIgnore: /forced-colors|a11y/, use: { viewport: { width: 375, height: 812 }, colorScheme: 'light' } },
    // Windows High Contrast (#135): not a pixel test, it checks that every focusable element still shows a focus
    // indicator when the browser forces system colours and drops box-shadows (e2e/forced-colors.spec.ts).
    { name: 'forced', testMatch: /forced-colors\.spec\.ts/, use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light', forcedColors: 'active' } },
    // axe on every docs page, in the two themes (#142, e2e/a11y.spec.ts): fails on a WCAG 2.x A or AA violation that is not in
    // e2e/a11y-baseline.json. Not a pixel test either: no reference images.
    { name: 'axe-light', testMatch: /a11y\.spec\.ts/, use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' } },
    { name: 'axe-dark', testMatch: /a11y\.spec\.ts/, use: { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' } },
  ],
});
