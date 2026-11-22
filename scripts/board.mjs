#!/usr/bin/env node
/**
 * The Sereno DS board from the terminal, with the one-at-a-time rule enforced.
 *
 *   npm run board -- status                          what is on the board, by Status
 *   npm run board -- move 135 "In Progress"          move the card of issue #135
 *   npm run board -- move 136 "In Progress" --force  start a second thing (see below)
 *   npm run board -- move 135 "To Test" --dry-run    say what it would do, change nothing
 *
 * The board (https://github.com/users/GabrielGomesBarbosa/projects/5) has no limit on a column, so
 * this is where the rule of `AGENTS.md` is kept: one thing at a time, so `move` refuses to put a second
 * parent issue in `In Progress`. A sub-issue may enter it only while its own parent is there. The one
 * exception is two things that are totally distinct, and that is a deliberate `--force`, after telling
 * the human. Everything else (any other column) moves freely.
 *
 * It only calls `gh` (logged in, with the `project` scope). The rule itself is `inProgressViolation`,
 * a pure function with its own tests (`scripts/board.test.mjs`).
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const OWNER = 'GabrielGomesBarbosa';
const REPO = 'sereno-ds';
const PROJECT = 5;
const IN_PROGRESS = 'In Progress';

/**
 * Why `target` may not enter `In Progress`, or `null` when it may.
 *
 * @param {{ number: number, status?: string | null }[]} items  the issues on the board
 * @param {{ number: number, parent: number | null }} target  the issue being moved, and its parent issue
 * @param {Map<number, number | null>} parents  the parent issue of every issue on the board
 */
export function inProgressViolation(items, target, parents) {
  const others = items.filter((i) => i.status === IN_PROGRESS && i.number !== target.number);
  if (target.parent == null) {
    const active = others.filter((i) => (parents.get(i.number) ?? null) == null);
    return active.length
      ? `${list(active)} already ${active.length === 1 ? 'is' : 'are'} In Progress: the board holds one parent issue at a time. Finish it, or move it back, first.`
      : null;
  }
  const parentActive = items.some((i) => i.number === target.parent && i.status === IN_PROGRESS);
  return parentActive ? null : `#${target.parent} (its parent) is not In Progress: move the parent first, a sub-issue only starts under an active parent.`;
}

const list = (items) => items.map((i) => `#${i.number}`).join(', ');

const gh = (args) => JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
const project = (...rest) => ['project', ...rest, '--owner', OWNER];

/**
 * The cards of this repository's issues. A board can also hold pull requests, drafts and issues of other
 * repositories; their numbers mean something else here, so they are left out (and never looked up as issues).
 */
export function repoIssues(items) {
  return items
    .filter((i) => i.content?.type === 'Issue' && i.content.repository === `${OWNER}/${REPO}`)
    .map((i) => ({ id: i.id, number: i.content.number, status: i.status ?? null, title: i.title }));
}

function readBoard() {
  const board = repoIssues(gh([...project('item-list', String(PROJECT)), '--format', 'json', '--limit', '200']).items);
  // The parent of every issue, in one GraphQL call (an item's JSON does not carry it).
  const fields = board.map((i) => `i${i.number}: issue(number: ${i.number}) { parent { number } }`).join(' ');
  const res = gh(['api', 'graphql', '-f', `query=query { repository(owner: "${OWNER}", name: "${REPO}") { ${fields} } }`]);
  const parents = new Map(board.map((i) => [i.number, res.data.repository[`i${i.number}`]?.parent?.number ?? null]));
  return { board, parents };
}

function status() {
  const { board, parents } = readBoard();
  const by = new Map();
  for (const i of board) by.set(i.status ?? '(no status)', [...(by.get(i.status ?? '(no status)') ?? []), i]);
  for (const [name, rows] of by) {
    console.log(`${name} (${rows.length})`);
    for (const i of rows) console.log(`  #${i.number}${parents.get(i.number) ? ` (sub-issue of #${parents.get(i.number)})` : ''}  ${i.title}`);
  }
}

function move(numberArg, statusArg, { force, dryRun }) {
  const number = Number(numberArg);
  if (!Number.isInteger(number) || !statusArg) throw new Error('usage: npm run board -- move <issue number> "<status>" [--force] [--dry-run]');
  const { board, parents } = readBoard();
  const item = board.find((i) => i.number === number);
  if (!item) throw new Error(`#${number} is not on the board (is it an issue of ${REPO}?)`);

  const field = gh([...project('field-list', String(PROJECT)), '--format', 'json']).fields.find((f) => f.name === 'Status');
  const option = field.options.find((o) => o.name.toLowerCase() === statusArg.toLowerCase());
  if (!option) throw new Error(`no Status called "${statusArg}". Options: ${field.options.map((o) => o.name).join(', ')}`);

  if (option.name === IN_PROGRESS) {
    const why = inProgressViolation(board, { number, parent: parents.get(number) ?? null }, parents);
    if (why && !force) throw new Error(`refused: ${why}\nOnly for two totally distinct things: tell the human, then add --force.`);
    if (why) console.warn(`forced, against the rule: ${why}`);
  }
  if (dryRun) return console.log(`(dry run) #${number} would move to ${option.name}`);
  const projectId = gh([...project('view', String(PROJECT)), '--format', 'json']).id;
  execFileSync('gh', ['project', 'item-edit', '--project-id', projectId, '--id', item.id, '--field-id', field.id, '--single-select-option-id', option.id], { encoding: 'utf8' });
  console.log(`#${number} -> ${option.name}`);
}

// Run only as a command, not when the tests import `inProgressViolation`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === 'status') status();
    else if (cmd === 'move') {
      const flags = rest.filter((a) => a.startsWith('--'));
      const args = rest.filter((a) => !a.startsWith('--'));
      const unknown = flags.filter((f) => f !== '--force' && f !== '--dry-run');
      if (unknown.length) throw new Error(`unknown option ${unknown.join(', ')} (--force, --dry-run)`);
      move(args[0], args.slice(1).join(' '), { force: flags.includes('--force'), dryRun: flags.includes('--dry-run') });
    } else throw new Error('usage: npm run board -- status | move <issue number> "<status>" [--force] [--dry-run]');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
