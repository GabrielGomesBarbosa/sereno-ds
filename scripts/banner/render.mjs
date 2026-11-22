/**
 * Step 2 of `npm run gen:banner`: photographs scripts/.banner/banner.html (written by build-banner.tsx) into
 * apps/docs/app/opengraph-image.png and copies the alt text next to it. It runs inside the pinned Playwright image
 * (see scripts/banner.sh), so the fonts are smoothed the same way on every machine, like the pixel tests.
 *
 * The picture is 1200x630 CSS pixels taken at device scale factor 2 (a 2400x1260 PNG): sharp on the README of a
 * high-density screen, and still the 1200x630 card that link previews expect.
 */
import { chromium } from '@playwright/test';
import { copyFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PAGE = join(ROOT, 'scripts', '.banner', 'banner.html');
const OUT = join(ROOT, 'apps', 'docs', 'app', 'opengraph-image.png');
const ALT_OUT = join(ROOT, 'apps', 'docs', 'app', 'opengraph-image.alt.txt');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(PAGE).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300); // let the card settle (the Tabs underline measures itself after mount)
await page.locator('#banner').screenshot({ path: OUT, animations: 'disabled' });
await browser.close();

copyFileSync(join(ROOT, 'scripts', '.banner', 'alt.txt'), ALT_OUT);
console.log(`apps/docs/app/opengraph-image.png  ${(statSync(OUT).size / 1024).toFixed(0)} KB`);
