/**
 * Fails when the banner (apps/docs/app/opengraph-image.png, the README banner and link-share card of the Design
 * System) was made for a different number of components than the catalogue has now. The number is typed nowhere by
 * hand: `npm run gen:banner` reads it from the catalogue and writes it into the alt text next to the picture, and this
 * script compares that alt text with the catalogue (one file per component in apps/docs/src/design-system/catalog/).
 * It once said "30" for months after the library had 37. Fix: `npm run gen:banner`, then commit the two files.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PNG = join(ROOT, 'apps/docs/app/opengraph-image.png');
const ALT = join(ROOT, 'apps/docs/app/opengraph-image.alt.txt');
const CATALOG = join(ROOT, 'apps/docs/src/design-system/catalog');

const fail = (message) => {
  console.error(`check-banner: ${message}\n  Fix: run \`npm run gen:banner\` (needs Docker) and commit apps/docs/app/opengraph-image.png and .alt.txt.`);
  process.exit(1);
};

const components = readdirSync(CATALOG).filter((f) => f.endsWith('.ts') && !f.startsWith('_')).length;
if (!existsSync(PNG)) fail('apps/docs/app/opengraph-image.png is missing.');
if (!existsSync(ALT)) fail('apps/docs/app/opengraph-image.alt.txt is missing.');
const said = readFileSync(ALT, 'utf8').match(/(\d+) token-driven/);
if (!said) fail('the alt text does not say how many components the banner was made for.');
if (Number(said[1]) !== components) {
  fail(`the banner says ${said[1]} components, the catalogue has ${components}.`);
}
console.log(`check-banner: ok (${components} components, the banner agrees).`);
