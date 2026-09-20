#!/usr/bin/env node
// Fails the build if src/breakpoints.ts ever disagrees with the --bp-*
// custom properties in spacing.css. The two are hand-kept in two different
// syntaxes (CSS can't read the JS export, and CSS @media can't read the
// custom property) — this is the guard that keeps them from silently
// drifting apart across a release.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(root, '..', 'spacing.css');
const tsPath = path.join(root, '..', 'src', 'breakpoints.ts');

const css = readFileSync(cssPath, 'utf8');
const ts = readFileSync(tsPath, 'utf8');

const cssMatches = [...css.matchAll(/--bp-(\w+):(\d+)px/g)];
if (cssMatches.length === 0) {
  console.error('check-breakpoints: found no --bp-* custom properties in spacing.css — did the token names change?');
  process.exit(1);
}
const fromCss = Object.fromEntries(cssMatches.map(([, key, px]) => [key, Number(px)]));

const objMatch = ts.match(/export const breakpoints = \{([^}]+)\}/);
if (!objMatch) {
  console.error('check-breakpoints: could not find `export const breakpoints = {...}` in breakpoints.ts');
  process.exit(1);
}
const fromTs = Object.fromEntries([...objMatch[1].matchAll(/(\w+):\s*(\d+)/g)].map(([, key, px]) => [key, Number(px)]));

const keys = new Set([...Object.keys(fromCss), ...Object.keys(fromTs)]);
const mismatches = [...keys].filter((k) => fromCss[k] !== fromTs[k]);

if (mismatches.length > 0) {
  console.error('check-breakpoints: breakpoints.ts is out of sync with spacing.css:');
  for (const k of mismatches) {
    console.error(`  ${k}: spacing.css=${fromCss[k] ?? '(missing)'}px, breakpoints.ts=${fromTs[k] ?? '(missing)'}`);
  }
  process.exit(1);
}

console.log('check-breakpoints: breakpoints.ts matches spacing.css ✓');
