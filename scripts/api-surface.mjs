#!/usr/bin/env node
/**
 * The public API surface of the two packages, as committed snapshots, and what a pull request may do to them (#170).
 * The contract is docs/api-stability.md; the logic that judges a change is api-surface-lib.mjs (with its tests).
 *
 *   node scripts/api-surface.mjs update                  regenerate every snapshot (the packages must be built: `npm run api:update`)
 *   node scripts/api-surface.mjs check                   fail when a committed snapshot is not the one the code produces (`npm run api:check`)
 *   node scripts/api-surface.mjs changeset --base <ref>  fail when a snapshot changed against <ref> and the PR has no changeset of the level it needs
 *
 * Four snapshots: the `api-extractor` report of each package (every exported declaration, from the built .d.ts), the token
 * names the CSS files declare, and the `sereno-*` classes and `data-*` attributes the stylesheet defines.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { classify, diffSurface, parseChangeset, styleHooks, surfaceLines, tokenNames, verdict } from './api-surface-lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const PACKAGES = ['@sereno-ds/ui', '@sereno-ds/tokens'];

/** `extractor`: made by `api-extractor` from the built types. `generated`: made here from the sources. */
const SNAPSHOTS = [
  { file: 'packages/ui/etc/ui.api.md', extractor: 'packages/ui/api-extractor.json' },
  { file: 'packages/ui/etc/ui.styles.txt', make: () => styleHooks(read('packages/ui/src/styles.css')).join('\n') + '\n' },
  { file: 'packages/tokens/etc/tokens.api.md', extractor: 'packages/tokens/api-extractor.json' },
  {
    file: 'packages/tokens/etc/tokens.names.txt',
    make: () =>
      tokenNames(
        readdirSync(path.join(ROOT, 'packages/tokens'))
          .filter((f) => f.endsWith('.css'))
          .sort()
          .map((f) => read(`packages/tokens/${f}`)),
      ).join('\n') + '\n',
  },
];

function runExtractor(config, local) {
  const bin = path.join(ROOT, 'node_modules/.bin/api-extractor');
  const args = ['run', '-c', config, ...(local ? ['--local'] : [])];
  return spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit' }).status === 0;
}

function update() {
  for (const s of SNAPSHOTS) {
    if (s.extractor) {
      if (!runExtractor(s.extractor, true)) process.exit(1);
    } else {
      writeFileSync(path.join(ROOT, s.file), s.make());
    }
    console.log(`api-surface: wrote ${s.file}`);
  }
}

function check() {
  const stale = [];
  for (const s of SNAPSHOTS) {
    if (s.extractor) {
      // Not `--local`: a report that differs from the committed one is an error, and the file is left untouched.
      if (!runExtractor(s.extractor, false)) stale.push(s.file);
    } else if (!existsSync(path.join(ROOT, s.file)) || read(s.file) !== s.make()) {
      stale.push(s.file);
    }
  }
  if (stale.length) {
    console.error(`\napi-surface: the committed snapshot is not the one the code produces: ${stale.join(', ')}\n  Run \`npm run api:update\` and commit the result; the diff is the API change, for the review.`);
    process.exit(1);
  }
  console.log(`api-surface: ok (${SNAPSHOTS.length} snapshots agree with the code).`);
}

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function changeset(base) {
  const version = JSON.parse(read('packages/ui/package.json')).version;
  const surfaces = [];
  for (const s of SNAPSHOTS) {
    let baseText;
    try {
      baseText = git('show', `${base}:${s.file}`);
    } catch {
      console.log(`api-surface: ${s.file} has no baseline on ${base} (it is new): nothing to compare.`);
      continue;
    }
    const opts = s.extractor ? { commentPrefix: '//', qualify: true } : {};
    const diff = diffSurface(surfaceLines(baseText, opts), surfaceLines(read(s.file), opts));
    surfaces.push({ name: s.file, kind: classify(diff), ...diff });
  }
  const added = git('diff', '--name-only', '--diff-filter=AM', `${base}...HEAD`, '--', '.changeset')
    .split('\n')
    .filter((f) => f.endsWith('.md') && !f.endsWith('README.md'))
    .filter((f) => existsSync(path.join(ROOT, f)));
  const changesets = added.map((f) => parseChangeset(read(f)));
  const v = verdict({ surfaces, version, changesets, packages: PACKAGES });

  for (const s of surfaces.filter((x) => x.kind !== 'none')) {
    console.log(`\n${s.name}: ${s.kind === 'breaking' ? 'BREAKING' : 'additive'} (${s.removed.length} removed or changed, ${s.added.length} added)`);
    for (const l of s.removed.slice(0, 12)) console.log(`  - ${l}`);
    for (const l of s.added.slice(0, 12)) console.log(`  + ${l}`);
    if (s.removed.length > 12 || s.added.length > 12) console.log('  ... (the diff of the file has the rest)');
  }
  if (!v.ok) {
    console.error(`\napi-surface: ${v.problems.join('\n  ')}\n  See docs/api-stability.md for what each level means.`);
    process.exit(1);
  }
  console.log(v.need ? `api-surface: ok: the surface changed (needs \`${v.need}\`) and the PR has \`${v.have}\`.` : 'api-surface: ok: the public surface did not change.');
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'update') update();
else if (cmd === 'check') check();
else if (cmd === 'changeset' && rest[0] === '--base' && rest[1]) changeset(rest[1]);
else {
  console.error('usage: api-surface.mjs update | check | changeset --base <ref>');
  process.exit(2);
}
