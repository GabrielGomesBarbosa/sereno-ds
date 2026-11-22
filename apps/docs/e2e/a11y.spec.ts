import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMPONENTS, examplesFor } from '../src/design-system/catalog';

/**
 * axe on every docs page (#142, part of #135). The `axe-light` and `axe-dark` projects run this file in the real browser
 * (colour contrast needs real colours and layout, which the `jest-axe` unit tests cannot have) and fail on any violation of
 * WCAG 2.x A and AA that is not in `a11y-baseline.json`.
 *
 * What is scanned: the demos (`[data-example-preview]`, never the docs shell) and what each demo's triggers open (a list, a
 * menu, a calendar, a dialog), moved with the arrow key like the forced-colors test does. One test per page and per theme.
 *
 * The baseline is the list of violations that already exist, so the job is green on day one. It works in both directions:
 *   - a violation that is not in the file fails the test (fix it, or add it with a `reason` or an `issue`);
 *   - an entry that is no longer found fails it too (it was fixed: delete the entry).
 * Each entry says why it is there, and the last test of this file checks that none is left without a reason.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
/** What a trigger opens. */
const POPUPS = '[role=listbox], [role=menu], [role=dialog], .sereno-dtp-pop';
const ENABLED = ':not([disabled]):not([aria-disabled=true])';
/** At most this many triggers per example, like the pixel suite: the first ones are the variants. */
const MAX_OPEN_PER_EXAMPLE = 3;

type Scheme = 'light' | 'dark';
interface Entry {
  /** `<category>/<slug>` of the docs page. */
  page: string;
  schemes: Scheme[];
  /** The axe rule id, e.g. `color-contrast`. */
  rule: string;
  /** The CSS selector axe reports for the element. */
  target: string;
  /** Why it is not fixed yet: what is wrong and what the fix is. */
  reason?: string;
  /** Or the GitHub issue that tracks it. */
  issue?: number;
}
interface Found {
  rule: string;
  impact: string;
  help: string;
  helpUrl: string;
  target: string;
  html: string;
}

const BASELINE_FILE = resolve(__dirname, 'a11y-baseline.json');
const baseline: Entry[] = (JSON.parse(readFileSync(BASELINE_FILE, 'utf8')) as { entries: Entry[] }).entries;
const keyOf = (rule: string, target: string) => `${rule} :: ${target}`;

async function scan(page: Page, include: string): Promise<Found[]> {
  const results = await new AxeBuilder({ page }).include(include).withTags(TAGS).analyze();
  return results.violations.flatMap((v) =>
    v.nodes.map((n) => ({
      rule: v.id,
      impact: v.impact ?? 'unknown',
      help: v.help,
      helpUrl: v.helpUrl,
      target: n.target.join(' >>> '),
      html: n.html.replace(/\s+/g, ' ').slice(0, 140),
    })),
  );
}

async function openPage(page: Page, path: string) {
  await page.goto(path);
  await page.locator('[data-example-preview]').first().waitFor();
  await page.waitForTimeout(300); // hydration of the client demos
}

for (const meta of COMPONENTS) {
  test(`${meta.category}/${meta.slug}`, async ({ page }, testInfo) => {
    const scheme = testInfo.project.name.replace('axe-', '') as Scheme;
    const name = `${meta.category}/${meta.slug}`;
    const path = `/design-system/${meta.category}/${meta.slug}/`;
    const found = new Map<string, Found>();
    const add = (list: Found[]) => list.forEach((f) => found.set(keyOf(f.rule, f.target), f));

    await openPage(page, path);
    add(await scan(page, '[data-example-preview]'));

    // what the demos open: each trigger on a freshly loaded page, with the cursor moved by the arrow key
    for (const ex of examplesFor(meta)) {
      const triggerSel = `section#${ex.id} [data-example-preview] :is([aria-haspopup], [aria-expanded])${ENABLED}`;
      const count = Math.min(await page.locator(triggerSel).count(), MAX_OPEN_PER_EXAMPLE);
      for (let j = 0; j < count; j++) {
        await openPage(page, path);
        const trigger = page.locator(triggerSel).nth(j);
        if (!(await trigger.isVisible())) continue;
        await trigger.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(150);
        if ((await page.locator(POPUPS).count()) === 0) continue; // it opened nothing we know how to scan
        add(await scan(page, POPUPS));
      }
    }

    const expected = baseline.filter((e) => e.page === name && e.schemes.includes(scheme));
    const known = new Set(expected.map((e) => keyOf(e.rule, e.target)));
    const fresh = [...found.values()].filter((f) => !known.has(keyOf(f.rule, f.target)));
    const fixed = expected.filter((e) => !found.has(keyOf(e.rule, e.target)));

    const describeNew = (f: Found) =>
      [
        `${f.rule} (${f.impact}): ${f.help}`,
        `    element: ${f.target}`,
        `    html: ${f.html}`,
        `    ${f.helpUrl}`,
        `    to accept it for now, add to e2e/a11y-baseline.json: ${JSON.stringify({ page: name, schemes: [scheme], rule: f.rule, target: f.target, reason: '<what is wrong and what the fix is>' })}`,
      ].join('\n');
    expect(fresh.map(describeNew), `new accessibility violations on ${name} (${scheme}): fix them, or add them to the baseline with a reason`).toEqual([]);
    expect(
      fixed.map((e) => `${e.rule} :: ${e.target}`),
      `entries of a11y-baseline.json that axe no longer finds on ${name} (${scheme}): it was fixed, delete the entry (or, if it is still there in the other theme, remove "${scheme}" from its schemes)`,
    ).toEqual([]);
  });
}

test('the baseline: every entry says why it is there, names a real page and is listed once', () => {
  const pages = new Set(COMPONENTS.map((m) => `${m.category}/${m.slug}`));
  const seen = new Set<string>();
  const problems: string[] = [];
  for (const e of baseline) {
    const id = `${e.page} ${e.rule} ${e.target}`;
    if (!pages.has(e.page)) problems.push(`${id}: no such docs page`);
    if (!e.schemes?.length || e.schemes.some((s) => s !== 'light' && s !== 'dark')) problems.push(`${id}: schemes must be "light" and/or "dark"`);
    if (!(typeof e.reason === 'string' && e.reason.trim().length >= 20) && !Number.isInteger(e.issue)) problems.push(`${id}: needs a reason (what is wrong, what the fix is) or an issue number`);
    const key = `${e.page} ${keyOf(e.rule, e.target)}`;
    if (seen.has(key)) problems.push(`${id}: listed twice`);
    seen.add(key);
  }
  expect(problems).toEqual([]);
});
