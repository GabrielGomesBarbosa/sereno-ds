/**
 * Step 1 of `npm run gen:banner`: writes the page that gets photographed into the link-share card of the
 * Design System site and the banner of the README (apps/docs/app/opengraph-image.png, 1200x630).
 *
 * The page is not a drawing: the right-hand card is `HeroPreview` from the docs home, i.e. the real
 * `@sereno-ds/ui` components rendered on the real tokens and the real fonts, and the number in the headline is
 * `COMPONENTS.length` of the catalogue, so the banner cannot drift away from the library the way a hand-written
 * "30 token-driven..." did. Step 2 (`render.mjs`, run in the pinned Playwright image) takes the picture.
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Brand } from '@sereno-ds/ui';
import { COMPONENTS } from '../../apps/docs/src/design-system/catalog.ts';
import { HeroPreview } from '../../apps/docs/src/home/HeroPreview.tsx';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = join(ROOT, 'scripts', '.banner');
const COUNT = COMPONENTS.length;

const LINES = ['Native dark mode. No UI base library.', 'One live preview per component.'];
const TAGLINE = LINES.join(' ');
/** What a screen reader (and the og:image:alt tag) says about the picture. */
export const ALT = `Sereno Design System: ${COUNT} token-driven React primitives. ${TAGLINE} A booking card built with the library is shown next to the text.`;

const brand = renderToStaticMarkup(<Brand variant="lockup" size={54} />);
const preview = renderToStaticMarkup(<HeroPreview />);

const css = `
@font-face { font-family: 'Inter'; src: url('../../fonts/Inter-latin.woff2') format('woff2'); font-weight: 400 700; font-style: normal; }
@font-face { font-family: 'Manrope'; src: url('../../fonts/Manrope-latin.woff2') format('woff2'); font-weight: 500 800; font-style: normal; }
@font-face { font-family: 'JetBrains Mono'; src: url('../../fonts/JetBrainsMono-latin.woff2') format('woff2'); font-weight: 400 500; font-style: normal; }
:root { --font-inter: 'Inter'; --font-manrope: 'Manrope'; --font-jetbrains-mono: 'JetBrains Mono'; }

html, body { margin: 0; padding: 0; background: #0b0d12; }
.banner {
  position: relative; width: 1200px; height: 630px; overflow: hidden;
  background:
    radial-gradient(820px 560px at 6% -12%, color-mix(in srgb, var(--brand-500) 36%, transparent), transparent 64%),
    radial-gradient(720px 520px at 100% 108%, color-mix(in srgb, var(--accent-500) 26%, transparent), transparent 64%),
    var(--bg-canvas);
  font-family: var(--font-body); color: var(--text-primary); -webkit-font-smoothing: antialiased;
}
/* A faint dot grid that fades out away from the text, so the left side has texture without competing with it. */
.grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(color-mix(in srgb, white 14%, transparent) 1px, transparent 1.2px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 70% 80% at 28% 42%, #000 15%, transparent 78%);
          mask-image: radial-gradient(ellipse 70% 80% at 28% 42%, #000 15%, transparent 78%);
}
.copy { position: absolute; left: 76px; top: 66px; width: 590px; display: flex; flex-direction: column; }
.eyebrow {
  align-self: flex-start; margin-top: 46px; padding: 7px 14px; border-radius: 999px;
  font-family: var(--font-body); font-size: 15px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
  color: var(--brand-300); background: color-mix(in srgb, var(--brand-500) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand-400) 38%, transparent);
}
h1 {
  margin: 22px 0 0; font-family: var(--font-display); font-weight: 800; font-size: 62px; line-height: 1.05; letter-spacing: -0.035em;
  color: var(--text-primary);
}
h1 .num {
  background: linear-gradient(118deg, var(--brand-300) 0%, var(--accent-400) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sub { margin: 24px 0 0; font-size: 24px; line-height: 1.55; color: var(--text-secondary); }
.foot { position: absolute; left: 76px; bottom: 58px; display: flex; align-items: center; gap: 22px; }
.install {
  display: inline-flex; align-items: center; gap: 10px; height: 46px; padding: 0 20px; border-radius: 12px;
  font-family: var(--font-mono); font-size: 19px; color: var(--text-primary);
  background: color-mix(in srgb, white 6%, var(--bg-canvas));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, white 13%, transparent);
}
.install b { color: var(--accent-400); font-weight: 500; }
.repo { font-size: 18px; color: var(--text-muted); letter-spacing: .005em; }
.stage { position: absolute; right: 88px; top: 196px; width: 400px; transform: scale(1.1); transform-origin: 100% 50%; }
/* A soft pool of brand colour behind the card, so it reads as lit rather than pasted on. */
.stage::before {
  content: ''; position: absolute; inset: -70px -60px; z-index: -1;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--brand-500) 38%, transparent), transparent);
  filter: blur(6px);
}
`;

const html = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8" />
<title>Sereno Design System banner</title>
<link rel="stylesheet" href="../../packages/tokens/tokens.css" />
<link rel="stylesheet" href="../../packages/ui/src/styles.css" />
<style>${css}</style>
</head>
<body>
<div class="banner" id="banner">
  <div class="grid"></div>
  <div class="copy">
    ${brand}
    <span class="eyebrow">Design System</span>
    <h1><span class="num">${COUNT}</span> token-driven<br />React primitives</h1>
    <p class="sub">${LINES[0]}<br />${LINES[1]}</p>
  </div>
  <div class="foot">
    <span class="install"><b>$</b> npm i @sereno-ds/ui</span>
    <span class="repo">github.com/GabrielGomesBarbosa/sereno-ds</span>
  </div>
  <div class="stage">${preview}</div>
</div>
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'banner.html'), html);
writeFileSync(join(OUT_DIR, 'alt.txt'), ALT + '\n');
console.log(`banner page written: ${COUNT} components -> scripts/.banner/banner.html`);
