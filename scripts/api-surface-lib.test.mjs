import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, diffSurface, highestLevel, parseChangeset, requiredLevel, styleHooks, surfaceLines, tokenNames, verdict } from './api-surface-lib.mjs';

const REPORT = `## API Report File for "@sereno-ds/ui"

\`\`\`ts

// @public (undocumented)
export function Alert(input: AlertProps): React_2.JSX.Element;

// @public
export interface AlertProps extends React_2.HTMLAttributes<HTMLDivElement> {
    action?: React_2.ReactNode;
    // (undocumented)
    title?: string;
    tone?: 'info' | 'success';
}

// @public
export interface ToastProps {
    title: string;
}

\`\`\`
`;
const lines = (t) => surfaceLines(t, { commentPrefix: '//', qualify: true });
const kindOf = (a, b) => classify(diffSurface(lines(a), lines(b)));

test('the same report is no change, and comment-only changes are no change', () => {
  assert.equal(kindOf(REPORT, REPORT), 'none');
  const documented = REPORT.replace('// @public (undocumented)', '// @public').replace('    // (undocumented)\n', '');
  assert.equal(kindOf(REPORT, documented), 'none');
});

test('a prop that is gone is a break', () => {
  assert.equal(kindOf(REPORT, REPORT.replace('    action?: React_2.ReactNode;\n', '')), 'breaking');
});

test('a prop that is only added is an addition', () => {
  assert.equal(kindOf(REPORT, REPORT.replace("    tone?: 'info' | 'success';\n", "    tone?: 'info' | 'success';\n    size?: 'sm' | 'md';\n")), 'additive');
});

test('a prop that changes (optional to required, a narrower type) is a break: the old line is gone', () => {
  assert.equal(kindOf(REPORT, REPORT.replace('action?: React_2.ReactNode;', 'action: React_2.ReactNode;')), 'breaking');
  assert.equal(kindOf(REPORT, REPORT.replace("'info' | 'success'", "'info'")), 'breaking');
});

test('a prop moved to another interface is a removal and an addition, not a no-op', () => {
  // `tone` leaves AlertProps and arrives in ToastProps: the same line of text, in another place
  const moved = REPORT.replace("    tone?: 'info' | 'success';\n", '').replace('    title: string;\n}', "    title: string;\n    tone?: 'info' | 'success';\n}");
  assert.notEqual(moved, REPORT);
  const diff = diffSurface(lines(REPORT), lines(moved));
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.added.length, 1);
  assert.equal(classify(diff), 'breaking');
});

test('a whole export that is gone is a break; a new one is an addition', () => {
  assert.equal(kindOf(REPORT, REPORT.replace(/\/\/ @public\nexport interface ToastProps \{\n {4}title: string;\n\}\n\n/, '')), 'breaking');
  assert.equal(kindOf(REPORT, REPORT.replace('```\n', '```\n').replace('\n```\n', '\nexport const X: number;\n\n```\n')), 'additive');
});

test('the same line twice in one interface: losing one of them is seen (counts, not a set)', () => {
  const a = lines('export interface A {\n    x: string;\n    x: string;\n}\n');
  const b = lines('export interface A {\n    x: string;\n}\n');
  assert.equal(classify(diffSurface(a, b)), 'breaking');
});

test('token names: every custom property declared, values ignored, comments ignored, once each, sorted', () => {
  const css = `/* --not-a-token: red */\n:root{--b:1;--a: 2}\n[data-theme="dark"]{--a:3; --c : 4}\n.x{color:var(--a)}`;
  assert.deepEqual(tokenNames([css]), ['--a', '--b', '--c']);
  assert.deepEqual(tokenNames([':root{--z:1}', ':root{--y:1}']), ['--y', '--z']);
});

test('style hooks: the sereno-* classes and the data-* attributes read in selectors, comments ignored', () => {
  const css = `/* .sereno-only-in-a-comment [data-comment] */\n.sereno-btn:hover{} .sereno-btn.sereno-big{}\n.sereno-dtp-days button[data-in-range]::before{}\n@media (forced-colors: active){ .sereno-switch[data-state='on']{} }\n.other{}`;
  assert.deepEqual(styleHooks(css), ['attr data-in-range', 'attr data-state', 'class sereno-big', 'class sereno-btn', 'class sereno-dtp-days', 'class sereno-switch']);
});

test('the level a change needs: 0.x is minor for both kinds, 1.x is major for a break', () => {
  assert.equal(requiredLevel('none', '0.51.0'), null);
  assert.equal(requiredLevel('additive', '0.51.0'), 'minor');
  assert.equal(requiredLevel('breaking', '0.51.0'), 'minor');
  assert.equal(requiredLevel('additive', '1.4.0'), 'minor');
  assert.equal(requiredLevel('breaking', '1.4.0'), 'major');
  assert.equal(requiredLevel('breaking', '2.0.0'), 'major');
});

test('a changeset is read from its front matter', () => {
  assert.deepEqual(parseChangeset('---\n"@sereno-ds/ui": minor\n"@sereno-ds/tokens": patch\n---\n\nText: major\n'), { '@sereno-ds/ui': 'minor', '@sereno-ds/tokens': 'patch' });
  assert.deepEqual(parseChangeset('no front matter'), {});
  assert.equal(highestLevel([{ '@sereno-ds/ui': 'patch' }, { '@sereno-ds/tokens': 'major' }, { other: 'major' }], ['@sereno-ds/ui', '@sereno-ds/tokens']), 'major');
  assert.equal(highestLevel([], ['@sereno-ds/ui']), null);
  assert.equal(highestLevel([{ other: 'major' }], ['@sereno-ds/ui']), null);
});

const PKGS = ['@sereno-ds/ui', '@sereno-ds/tokens'];
const surface = (kind) => ({ name: 'packages/ui/etc/ui.api.md', kind, removed: kind === 'breaking' ? ['x'] : [], added: kind === 'additive' ? ['y'] : [] });

test('verdict: no change needs nothing', () => {
  assert.equal(verdict({ surfaces: [surface('none')], version: '0.51.0', changesets: [], packages: PKGS }).ok, true);
});

test('verdict: a changed surface with no changeset fails, naming the level', () => {
  const v = verdict({ surfaces: [surface('breaking')], version: '0.51.0', changesets: [], packages: PKGS });
  assert.equal(v.ok, false);
  assert.equal(v.need, 'minor');
  assert.match(v.problems.join('\n'), /no changeset: add one of at least `minor`/);
});

test('verdict: a changeset of a lower level fails; of the right level or higher passes', () => {
  const low = verdict({ surfaces: [surface('additive')], version: '0.51.0', changesets: [{ '@sereno-ds/ui': 'patch' }], packages: PKGS });
  assert.equal(low.ok, false);
  assert.match(low.problems.join('\n'), /changeset is `patch`: it needs at least `minor`/);
  assert.equal(verdict({ surfaces: [surface('additive')], version: '0.51.0', changesets: [{ '@sereno-ds/ui': 'minor' }], packages: PKGS }).ok, true);
  assert.equal(verdict({ surfaces: [surface('additive')], version: '0.51.0', changesets: [{ '@sereno-ds/tokens': 'major' }], packages: PKGS }).ok, true);
});

test('verdict: after 1.0 a break needs a major, an addition a minor', () => {
  assert.equal(verdict({ surfaces: [surface('breaking')], version: '1.2.0', changesets: [{ '@sereno-ds/ui': 'minor' }], packages: PKGS }).ok, false);
  assert.equal(verdict({ surfaces: [surface('breaking')], version: '1.2.0', changesets: [{ '@sereno-ds/ui': 'major' }], packages: PKGS }).ok, true);
  assert.equal(verdict({ surfaces: [surface('additive')], version: '1.2.0', changesets: [{ '@sereno-ds/ui': 'minor' }], packages: PKGS }).ok, true);
});

test('verdict: the highest level over several surfaces decides', () => {
  const v = verdict({ surfaces: [surface('additive'), { ...surface('breaking'), name: 'tokens' }], version: '1.0.0', changesets: [{ '@sereno-ds/ui': 'minor' }], packages: PKGS });
  assert.equal(v.need, 'major');
  assert.equal(v.ok, false);
});
