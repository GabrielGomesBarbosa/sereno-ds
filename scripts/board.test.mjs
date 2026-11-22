// The one-at-a-time rule of the board (`node --test scripts/`). `AGENTS.md`: "the `In Progress`
// column holds exactly one parent issue at a time"; a sub-issue may start only under an active parent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inProgressViolation, repoIssues } from './board.mjs';

const board = (...rows) => rows.map(([number, status]) => ({ number, status }));
const parentsOf = (map = {}) => new Map(Object.entries(map).map(([k, v]) => [Number(k), v]));

test('the first parent issue may start', () => {
  const items = board([1, 'To Do'], [2, 'To Do']);
  assert.equal(inProgressViolation(items, { number: 1, parent: null }, parentsOf()), null);
});

test('a second parent issue may not start while another is In Progress', () => {
  const items = board([1, 'In Progress'], [2, 'To Do']);
  const why = inProgressViolation(items, { number: 2, parent: null }, parentsOf());
  assert.match(why, /^#1 already is In Progress/);
});

test('it names every parent that is already In Progress', () => {
  const items = board([1, 'In Progress'], [2, 'In Progress'], [3, 'To Do']);
  assert.match(inProgressViolation(items, { number: 3, parent: null }, parentsOf()), /^#1, #2 already are In Progress/);
});

test('moving the issue that is already In Progress is not a violation of itself', () => {
  const items = board([1, 'In Progress']);
  assert.equal(inProgressViolation(items, { number: 1, parent: null }, parentsOf()), null);
});

test('a sub-issue may start while its parent is In Progress, next to other sub-issues', () => {
  const items = board([1, 'In Progress'], [2, 'In Progress'], [3, 'To Do']);
  const parents = parentsOf({ 2: 1, 3: 1 });
  assert.equal(inProgressViolation(items, { number: 3, parent: 1 }, parents), null);
});

test('a sub-issue may not start under a parent that is not In Progress', () => {
  const items = board([1, 'To Do'], [2, 'To Do']);
  const why = inProgressViolation(items, { number: 2, parent: 1 }, parentsOf({ 2: 1 }));
  assert.match(why, /^#1 \(its parent\) is not In Progress/);
});

test('sub-issues In Progress do not count as a second parent', () => {
  const items = board([1, 'In Progress'], [2, 'In Progress'], [3, 'To Do']);
  // #3 is a parent-less issue; #1 is the active parent, so it is still refused,
  assert.match(inProgressViolation(items, { number: 3, parent: null }, parentsOf({ 2: 1 })), /^#1 already is/);
  // and once #1 is back in To Do, its sub-issue left over in In Progress does not block #3.
  const after = board([1, 'To Do'], [2, 'In Progress'], [3, 'To Do']);
  assert.equal(inProgressViolation(after, { number: 3, parent: null }, parentsOf({ 2: 1 })), null);
});

test('only issues of this repository count as cards: not pull requests, drafts or other repositories', () => {
  const item = (id, type, repository, number) => ({ id, status: 'To Do', title: `t${id}`, content: { type, repository, number } });
  const raw = [
    item('a', 'Issue', 'GabrielGomesBarbosa/sereno-ds', 135),
    item('b', 'PullRequest', 'GabrielGomesBarbosa/sereno-ds', 139),
    item('c', 'Issue', 'GabrielGomesBarbosa/schedule-system', 135),
    { id: 'd', title: 'a draft', content: { type: 'DraftIssue' } },
    { id: 'e', title: 'no content' },
  ];
  assert.deepEqual(repoIssues(raw), [{ id: 'a', number: 135, status: 'To Do', title: 'ta' }]);
});
