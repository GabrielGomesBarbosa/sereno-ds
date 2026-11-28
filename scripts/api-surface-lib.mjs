/**
 * The pure part of the API-surface check (#170): turn the committed snapshots of what the packages make public into a
 * verdict on a pull request. Plain Node, no dependency, so `npm run test:scripts` runs its tests before `npm ci`.
 *
 * What is a "surface": the text of a snapshot, line by line. Two snapshots are compared as sets of lines (with counts), so
 * a line that is gone, or changed, counts as REMOVED (a break: code that used it may not compile or work), and a line that
 * is only new counts as ADDED (an addition). A change that only touches comments is neither.
 */

export const LEVELS = ['patch', 'minor', 'major'];

/** The comments of a stylesheet are text for people: a class named in one is not a hook. */
export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every custom property the token files declare (`--name:`), once each, sorted. Values are not part of the surface. */
export function tokenNames(cssTexts) {
  const names = new Set();
  for (const css of cssTexts) {
    for (const m of stripCssComments(css).matchAll(/(?:^|[;{\s])(--[a-zA-Z0-9_-]+)\s*:/g)) names.add(m[1]);
  }
  return [...names].sort();
}

/**
 * The hooks an app can write a rule against: every `sereno-*` class the stylesheet defines and every `data-*` attribute it
 * reads in a selector. One line each (`class sereno-btn`, `attr data-active`), once each, sorted.
 */
export function styleHooks(css) {
  const code = stripCssComments(css);
  const lines = new Set();
  for (const m of code.matchAll(/\.(sereno-[a-zA-Z0-9_-]+)/g)) lines.add(`class ${m[1]}`);
  for (const m of code.matchAll(/\[(data-[a-zA-Z0-9_-]+)/g)) lines.add(`attr ${m[1]}`);
  return [...lines].sort();
}

/**
 * The lines of a snapshot that count. Comments and blank lines are dropped (`commentPrefix`: the report marks `// @public
 * (undocumented)` and the like, which change when someone writes a doc comment and say nothing about the API).
 *
 * With `qualify`, a line inside a declaration is joined to the declaration's own line (the last one that starts in column 0),
 * so a property moved from one interface to another is a removal and an addition, not a no-op: both lines read the same
 * apart from where they live.
 */
export function surfaceLines(text, { commentPrefix, qualify = false } = {}) {
  const out = [];
  let owner = '';
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    if (commentPrefix && line.trim().startsWith(commentPrefix)) continue;
    if (!qualify) {
      out.push(line.trim());
      continue;
    }
    if (/^\S/.test(line)) {
      if (line === '}') continue; // the end of a declaration is not a line of the API
      owner = line;
      out.push(line);
    } else {
      out.push(`${owner} :: ${line}`);
    }
  }
  return out;
}

/** The lines of `base` that `head` no longer has (with counts), and the lines of `head` that `base` did not have. */
export function diffSurface(baseLines, headLines) {
  const count = (lines) => {
    const m = new Map();
    for (const l of lines) m.set(l, (m.get(l) ?? 0) + 1);
    return m;
  };
  const base = count(baseLines);
  const head = count(headLines);
  const removed = [];
  const added = [];
  for (const [line, n] of base) for (let i = 0; i < n - (head.get(line) ?? 0); i++) removed.push(line);
  for (const [line, n] of head) for (let i = 0; i < n - (base.get(line) ?? 0); i++) added.push(line);
  return { removed, added };
}

/** `breaking` when anything was removed or changed, `additive` when lines were only added, `none` otherwise. */
export function classify({ removed, added }) {
  if (removed.length) return 'breaking';
  if (added.length) return 'additive';
  return 'none';
}

/**
 * The changeset level a change needs (docs/api-stability.md). Before 1.0 a caret range does not accept the next minor, so a
 * break and an addition are both `minor`; after it, a break is `major` and an addition `minor`.
 */
export function requiredLevel(kind, version) {
  if (kind === 'none') return null;
  const major = Number(String(version).split('.')[0]);
  return kind === 'breaking' && major >= 1 ? 'major' : 'minor';
}

/** `{ '@sereno-ds/ui': 'minor' }` from the front matter of a changeset file. */
export function parseChangeset(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^\s*["']?([^"':]+)["']?\s*:\s*(patch|minor|major)\s*$/.exec(line);
    if (kv) out[kv[1]] = kv[2];
  }
  return out;
}

/** The highest level any of the changesets gives any of the packages, or `null` when there is none. */
export function highestLevel(changesets, packages) {
  let best = -1;
  for (const cs of changesets) {
    for (const [pkg, level] of Object.entries(cs)) {
      if (packages.includes(pkg)) best = Math.max(best, LEVELS.indexOf(level));
    }
  }
  return best < 0 ? null : LEVELS[best];
}

/**
 * The verdict on a pull request. `surfaces`: `{ name, kind, removed, added }` for each snapshot that has a baseline.
 * `changesets`: the parsed changesets the PR adds or edits. `packages`: the names a changeset may name (the two packages
 * are versioned together, so a changeset for either counts).
 */
export function verdict({ surfaces, version, changesets, packages }) {
  const problems = [];
  let need = null;
  for (const s of surfaces) {
    const level = requiredLevel(s.kind, version);
    if (!level) continue;
    if (need === null || LEVELS.indexOf(level) > LEVELS.indexOf(need)) need = level;
  }
  const have = highestLevel(changesets, packages);
  if (need && (have === null || LEVELS.indexOf(have) < LEVELS.indexOf(need))) {
    for (const s of surfaces) {
      if (s.kind === 'none') continue;
      problems.push(`${s.name}: ${s.removed.length} line(s) removed or changed, ${s.added.length} added: ${s.kind === 'breaking' ? 'a break' : 'an addition'}.`);
    }
    problems.push(
      have === null
        ? `The public surface changed and the PR has no changeset: add one of at least \`${need}\` (\`npm run changeset\`).`
        : `The public surface changed and the PR's changeset is \`${have}\`: it needs at least \`${need}\`.`,
    );
  }
  return { ok: problems.length === 0, need, have, problems };
}
