/**
 * Regenerates the raster brand assets that Next.js picks up as metadata files:
 *
 *   apps/{docs,demo}/app/opengraph-image.png   1200x630  (link share card)
 *   apps/{docs,demo}/app/apple-icon.png         180x180  (iOS home screen)
 *
 * They are committed PNGs (not `opengraph-image.tsx` routes) on purpose: with
 * `output: 'export'` the dynamic routes emit extensionless files that a static
 * host won't serve as `image/png`. A committed `.png` is copied verbatim and
 * gets the right content-type anywhere.
 *
 * Source of truth for the mark: the water-drop from `Brand` (SS-202).
 * Run: `npm run gen:brand-images` (from the repo root).
 */
import { ImageResponse } from 'next/og.js';
import { createElement as h } from 'react';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const DROP = 'M24 3 C 22 7.5 8 22 8 31.5 C 8 39 15 45 24 45 C 33 45 40 39 40 31.5 C 40 22 26 7.5 24 3 Z';

/** The gradient water-drop as an inline SVG element. */
function Mark(size) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 48 48' },
    h(
      'defs',
      null,
      h(
        'linearGradient',
        { id: 'drop', x1: '0', y1: '3', x2: '0', y2: '45', gradientUnits: 'userSpaceOnUse' },
        h('stop', { offset: '0', stopColor: '#7d8bdf' }),
        h('stop', { offset: '1', stopColor: '#4f46e5' }),
      ),
    ),
    h('path', { d: DROP, fill: 'url(#drop)' }),
  );
}

function OpenGraph({ kicker, tagline, footer }) {
  const box = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 96,
    background: 'radial-gradient(1100px 640px at 28% -10%, #241f4d 0%, #0d0e12 62%)',
    color: '#f4f4f6',
    fontFamily: 'sans-serif',
  };
  return h(
    'div',
    { style: box },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center' } },
      Mark(116),
      h('span', { style: { marginLeft: 30, fontSize: 108, fontWeight: 600, letterSpacing: -4 } }, 'sereno'),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h('span', { style: { fontSize: 47, fontWeight: 700, color: '#a5b4fc', letterSpacing: -1 } }, kicker),
      h('span', { style: { marginTop: 14, fontSize: 31, color: '#9ca3af', letterSpacing: -0.3 } }, tagline),
    ),
    h('div', { style: { display: 'flex', fontSize: 24, color: '#6b7280' } }, footer),
  );
}

function AppleIcon() {
  return h(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
      },
    },
    Mark(118),
  );
}

async function render(element, size, outPath) {
  const res = new ImageResponse(element, size);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`  ${outPath.replace(ROOT + '/', '')}  ${buf.length.toLocaleString()} B`);
}

const OG = { width: 1200, height: 630 };
const ICON = { width: 180, height: 180 };

await render(
  OpenGraph({
    kicker: 'Design System',
    tagline: '30 token-driven React primitives · native dark mode · no UI base library',
    footer: 'github.com/GabrielGomesBarbosa/sereno-ds',
  }),
  OG,
  join(ROOT, 'apps/docs/app/opengraph-image.png'),
);
await render(AppleIcon(), ICON, join(ROOT, 'apps/docs/app/apple-icon.png'));

await render(
  OpenGraph({
    kicker: 'Design System · Demo',
    tagline: 'Booking flow, dashboard and onboarding — product screens built with @sereno/ui',
    footer: 'github.com/GabrielGomesBarbosa/sereno-ds',
  }),
  OG,
  join(ROOT, 'apps/demo/app/opengraph-image.png'),
);
await render(AppleIcon(), ICON, join(ROOT, 'apps/demo/app/apple-icon.png'));

console.log('done.');
