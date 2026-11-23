import { test, expect, type Locator, type Page } from '@playwright/test';
import { COMPONENTS, examplesFor } from '../src/design-system/catalog';

/**
 * Forced colors / Windows High Contrast (#135). The `forced` project runs this file with `forcedColors: 'active'`: the
 * browser swaps every authored colour for a system one and drops every `box-shadow`, which is what used to leave a
 * Button, an Input or a Switch with no visible focus (WCAG 2.4.7).
 *
 * It is not a pixel test: for each example of each component page it focuses the first interactive elements from the
 * keyboard and checks that SOMETHING is drawn, an `outline` on the element or, for a text box, on the frame around it.
 * So there are no reference images to keep, and a new component with a shadow-only ring fails here at once.
 *
 * A second test per page covers the STATES (#141): a current page, a selected tab, a checked box... that is told only by a
 * fill or a shadow is lost in this mode. Each element that says it is current, selected, checked or pressed must look
 * different from an unmarked sibling of the same kind (the text colour and a heavier font do not count, see `look`). The same
 * test covers the MARKS of a calendar (#157): the dot under a day and the swatches of `CalendarLegend` are plain fills, which
 * forced colors turns into the page colour, so each must still be drawn, and the tones must still be told apart by shape.
 *
 * A third test per page does the same INSIDE what a trigger opens (a list, a menu, a calendar): the option the keyboard is on
 * (`aria-activedescendant`, or `data-active` in a menu), the selected one, the day that is today.
 */

/** Elements a person can tab to, inside a demo (the same list as the pixel suite). */
const INTERACTIVE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([type=hidden]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[role=button]:not([aria-disabled=true])',
  '[role=tab]:not([aria-disabled=true])',
  '[role=switch]:not([aria-disabled=true])',
  '[role=checkbox]:not([aria-disabled=true])',
  '[role=radio]:not([aria-disabled=true])',
  '[role=combobox]:not([aria-disabled=true])',
].join(', ');

/** At most this many elements per example, like the pixel suite: bounded, and the first ones are the variants. */
const MAX_PER_EXAMPLE = 6;

/**
 * Elements that have no focus indicator of their own on purpose, each with the reason. Empty is the goal: an entry
 * here is a component a keyboard user cannot follow.
 */
const ALLOWED_WITHOUT_INDICATOR = new Set<string>([]);

/** What a person sees of the focus: an outline of the element, or of the field frame it sits in. */
function drawnIndicator(el: Element): 'own' | 'frame' | null {
  const drawn = (e: Element) => {
    const c = getComputedStyle(e);
    return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0;
  };
  if (drawn(el)) return 'own';
  const frame = el.closest('.sereno-field');
  return frame && drawn(frame) ? 'frame' : null;
}

async function describe(item: Locator) {
  return item.evaluate((el) => {
    const role = el.getAttribute('role');
    const name = el.getAttribute('aria-label') || (el.textContent ?? '').trim().slice(0, 24);
    return `${el.tagName.toLowerCase()}${role ? `[role=${role}]` : ''}${name ? ` "${name}"` : ''}`;
  });
}

for (const meta of COMPONENTS) {
  test(`${meta.category}/${meta.slug}`, async ({ page }) => {
    await page.goto(`/design-system/${meta.category}/${meta.slug}/`);
    await page.locator('[data-example-preview]').first().waitFor();
    await page.waitForTimeout(300); // hydration of the client demos

    const missing: string[] = [];
    for (const ex of examplesFor(meta)) {
      const items = page.locator(`section#${ex.id} [data-example-preview]`).locator(INTERACTIVE);
      const count = Math.min(await items.count(), MAX_PER_EXAMPLE);
      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        if (!(await item.isVisible())) continue;
        await page.keyboard.press('Tab'); // keyboard modality, so :focus-visible applies to what is focused next
        await item.focus();
        if (!(await item.evaluate((el) => el.matches(':focus')))) continue; // something stole the focus (a popup): not this one
        const found = await item.evaluate(drawnIndicator);
        const label = `${meta.slug}/${ex.id}: ${await describe(item)}`;
        if (!found && !ALLOWED_WITHOUT_INDICATOR.has(label)) missing.push(label);
      }
    }
    expect(missing, 'focusable elements with no visible focus indicator in forced colors').toEqual([]);
  });
}

/** What marks an element as being in a state the user must be able to see. */
const STATE = [
  "[aria-current]:not([aria-current='false'])",
  '[aria-selected=true]',
  '[aria-checked=true]',
  '[aria-pressed=true]',
  '[data-current]',
  '[data-selected]',
  '[data-in-range]', // a day between the two ends of a range (#166)
  'input:checked',
  'input:indeterminate',
].join(', ');

/**
 * What a person can see of an element apart from its words: the fill, the edges, an underline, a mark drawn after it. The
 * text colour and the weight are left out on purpose: forced colors rewrites the first, and the second is too faint to be
 * the only cue. A table row is seen through its first cell (the row itself paints nothing). An icon inside counts (it is
 * drawn in the text colour, which forced colors keeps readable).
 */
function look(el: Element) {
  const target = el.tagName === 'TR' ? (el.querySelector('td') ?? el) : el;
  const c = getComputedStyle(target);
  const after = getComputedStyle(target, '::after');
  // The band of a range is drawn by a ::before (#166). Only its border counts: the pseudo-element exists in this mode with or
  // without a forced-colors rule (its `content` is there either way), and its fill is the page colour, so a border is the cue.
  const before = getComputedStyle(target, '::before');
  // A fill of the surface colour (Canvas, ButtonFace) is the page showing through: forced colors turns a `--bg-subtle` or a
  // primary fill into one of them, and an element that was transparent stays transparent, so the two have different
  // computed values and look the same. Only a fill in another system colour (Highlight, GrayText...) is a cue.
  const probe = (name: string) => {
    const p = document.createElement('i');
    p.style.backgroundColor = name;
    document.body.appendChild(p);
    const v = getComputedStyle(p).backgroundColor;
    p.remove();
    return v;
  };
  const surface = new Set([probe('Canvas'), probe('ButtonFace')]);
  // Any colour with no opacity (forced colors keeps its RGB: rgba(255, 255, 255, 0)). It must start with `rgba(`: an opaque colour is
  // `rgb(r, g, b)`, and `rgb(0, 0, 0)` (CanvasText) also ends in ", 0)", which a looser pattern read as "no fill" (found in #157).
  const clear = /^rgba\(.*, 0\)$/.test(c.backgroundColor);
  const fill = clear || surface.has(c.backgroundColor) ? 'surface' : c.backgroundColor;
  return [
    fill, c.borderTopColor, c.borderTopWidth, c.borderBottomColor, c.borderBottomWidth, c.borderLeftWidth,
    c.outlineStyle, c.textDecorationLine, after.content, after.borderRightWidth, before.borderTopWidth,
    target.querySelectorAll('svg').length, // a drawn mark inside (the check of a selected option) is a cue too
  ].join('|');
}

/**
 * In the page: every element of `roots` that is in a state (`state`, or the active option of a combobox, or the active item of
 * a menu) and looks like its unmarked siblings. Siblings first (the days of one grid, the options of one list); when there
 * are none of the same tag, every unmarked element of the same kind in the root (a nav item nested in a list).
 */
async function lostIn(page: Page, roots: string, state: string, what: string): Promise<string[]> {
  return page.evaluate(
    ({ roots, state, what, lookSrc }) => {
      const look = new Function(`return (${lookSrc})`)() as (e: Element) => string;
      // the option a combobox is "on" is not DOM-focused: it is named by `aria-activedescendant`
      const active = new Set<Element>();
      document.querySelectorAll('[aria-activedescendant]').forEach((c) => {
        const t = document.getElementById(c.getAttribute('aria-activedescendant') ?? '');
        if (t) active.add(t);
      });
      document.querySelectorAll('[role=menuitem][data-active]').forEach((e) => active.add(e));
      const marked = (o: Element) => o.matches(state) || active.has(o);
      const out: string[] = [];
      document.querySelectorAll(roots).forEach((root, n) => {
        const targets = new Set<Element>(root.querySelectorAll(state));
        active.forEach((a) => root.contains(a) && targets.add(a));
        targets.forEach((el) => {
          const kind = (o: Element) => o.tagName + ((o as HTMLInputElement).type ?? '') + (o.getAttribute('role') ?? '');
          const siblings = [...(el.parentElement?.children ?? [])].filter((o) => o !== el && o.tagName === el.tagName && !marked(o));
          const wider = [...root.querySelectorAll(el.tagName.toLowerCase())].filter((o) => o !== el && !marked(o) && kind(o) === kind(el));
          const others = siblings.length ? siblings : wider;
          if (!others.length) return; // nothing unmarked to compare with
          if (others.every((o) => look(o) === look(el))) {
            const name = el.getAttribute('aria-label') || (el.textContent ?? '').trim().slice(0, 24);
            const why = active.has(el) && !el.matches(state) ? ' (the active one)' : '';
            out.push(`${what} ${n}: ${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} "${name}"${why}`);
          }
        });
      });
      return out;
    },
    { roots, state, what, lookSrc: look.toString() },
  );
}

/**
 * In the page: the marks of a calendar that forced colors would leave undrawn (#157). A dot is the 6 px `aria-hidden` circle under a
 * day of a calendar grid or in a legend, found by what it is and not by a class, so the check does not depend on the fix; the
 * swatch of today is the 12 px square in a legend. Reports a dot with no fill and no border, a swatch with no border, and two tones
 * in the same example that look alike (the legend explains which dot means what, and the colour is gone in this mode).
 */
async function marksLost(page: Page): Promise<{ problems: string[]; dots: number; rings: number }> {
  return page.evaluate(() => {
    const out: string[] = [];
    let dotCount = 0;
    let ringCount = 0;
    const probe = (name: string) => {
      const p = document.createElement('i');
      p.style.backgroundColor = name;
      document.body.appendChild(p);
      const v = getComputedStyle(p).backgroundColor;
      p.remove();
      return v;
    };
    const surface = new Set([probe('Canvas'), probe('ButtonFace')]);
    const size = (e: Element) => {
      const r = e.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    };
    const filled = (c: CSSStyleDeclaration) => !/^rgba\(.*, 0\)$/.test(c.backgroundColor) && !surface.has(c.backgroundColor);
    const bordered = (c: CSSStyleDeclaration) => c.borderTopStyle !== 'none' && parseFloat(c.borderTopWidth) > 0 && !/^rgba\(.*, 0\)$/.test(c.borderTopColor);
    document.querySelectorAll('[data-example-preview]').forEach((root, n) => {
      const dots = [...root.querySelectorAll('.sereno-dtp-days button span[aria-hidden], [role=list] li span[aria-hidden] span')].filter((e) => size(e) === '6x6' || size(e) === '8x8');
      const rings = [...root.querySelectorAll('[role=list] li span[aria-hidden] > span')].filter((e) => size(e) === '12x12');
      dotCount += dots.length;
      ringCount += rings.length;
      const looks = new Map<string, string>();
      dots.forEach((d) => {
        const c = getComputedStyle(d);
        const tone = d.getAttribute('data-tone') ?? 'no-tone';
        if (!filled(c) && !bordered(c)) out.push(`example ${n}: a ${tone} dot is not drawn (no fill, no border)`);
        // the shape: a fill or a hollow ring, its corners, its turn
        const shape = [filled(c) ? 'fill' : 'hollow', c.borderTopLeftRadius, c.transform].join('|');
        const seen = looks.get(tone);
        if (seen === undefined) looks.set(tone, shape);
        else if (seen !== shape) out.push(`example ${n}: two ${tone} dots are drawn differently`);
      });
      const byShape = new Map<string, string>();
      looks.forEach((shape, tone) => {
        const other = byShape.get(shape);
        if (other !== undefined) out.push(`example ${n}: the ${tone} dot and the ${other} dot look alike`);
        else byShape.set(shape, tone);
      });
      rings.forEach((r) => {
        if (!bordered(getComputedStyle(r))) out.push(`example ${n}: the legend swatch of today is not drawn (no border)`);
      });
    });
    return { problems: out, dots: dotCount, rings: ringCount };
  });
}

for (const meta of COMPONENTS) {
  test(`${meta.category}/${meta.slug}: current, selected and checked states, and the marks of a calendar, are visible`, async ({ page }) => {
    await page.goto(`/design-system/${meta.category}/${meta.slug}/`);
    await page.locator('[data-example-preview]').first().waitFor();
    await page.waitForTimeout(300);
    const lost = await lostIn(page, '[data-example-preview]', STATE, 'example');
    expect(lost, 'elements in a state that looks like their unmarked siblings in forced colors').toEqual([]);
    const marks = await marksLost(page);
    // the check finds dots by what they are: make sure it does find them where they are known to be, so it cannot pass by looking at nothing
    if (meta.slug === 'date-time-picker' || meta.slug === 'calendar-legend') expect(marks.dots, 'dots found on the page').toBeGreaterThan(0);
    if (meta.slug === 'calendar-legend') expect(marks.rings, 'today swatches found on the page').toBeGreaterThan(0);
    expect(marks.problems, 'calendar dots and legend swatches that are not drawn, or tones that look alike, in forced colors').toEqual([]);
  });
}

/** What a trigger opens: a list, a menu, a dialog (the calendar of a date picker), the month and year picker. */
const POPUPS = '[role=listbox], [role=menu], [role=dialog], .sereno-dtp-pop';
const ENABLED = ':not([disabled]):not([aria-disabled=true])';
/** At most this many triggers per example, like the pixel suite. */
const MAX_OPEN_PER_EXAMPLE = 3;

for (const meta of COMPONENTS) {
  test(`${meta.category}/${meta.slug}: states inside what opens are visible`, async ({ page }) => {
    const lost: string[] = [];
    for (const ex of examplesFor(meta)) {
      const triggerSel = `section#${ex.id} [data-example-preview] :is([aria-haspopup], [aria-expanded])${ENABLED}`;
      const count = await (async () => {
        await page.goto(`/design-system/${meta.category}/${meta.slug}/`);
        await page.locator('[data-example-preview]').first().waitFor();
        await page.waitForTimeout(300);
        return Math.min(await page.locator(triggerSel).count(), MAX_OPEN_PER_EXAMPLE);
      })();
      for (let j = 0; j < count; j++) {
        // each opening on a freshly loaded page: nothing focused or left open by what came before
        await page.goto(`/design-system/${meta.category}/${meta.slug}/`);
        await page.locator('[data-example-preview]').first().waitFor();
        await page.waitForTimeout(300);
        const trigger = page.locator(triggerSel).nth(j);
        if (!(await trigger.isVisible())) continue;
        await trigger.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown'); // the keyboard puts the cursor on an option or a menu item
        await page.waitForTimeout(150);
        const found = await lostIn(page, POPUPS, STATE, 'popup');
        lost.push(...found.map((f) => `${ex.id} #${j}: ${f}`));
      }
    }
    expect(lost, 'elements in a state, inside what a trigger opens, that look like their unmarked siblings in forced colors').toEqual([]);
  });
}

/**
 * A range being picked (#166): after the first click the days from it to the pointer are the provisional stretch. It is the
 * one state the pixel tests do not photograph (it needs a click and a hover), and its band is a pseudo-element that exists
 * only if a rule gives it `content`: the first version had none for the days in the middle, which nothing noticed. In this
 * mode the band is a line above and below, so each day of the stretch must have one, and the far end a dashed border.
 */
test('forms/date-range-picker: the stretch to the pointer is drawn while the first end is picked', async ({ page }) => {
  await page.goto('/design-system/forms/date-range-picker/');
  await page.locator('[data-example-preview]').first().waitFor();
  await page.waitForTimeout(300);
  await page.locator('section#basic [data-example-preview] [aria-haspopup]').first().click();
  const dialog = page.locator('[role=dialog]');
  await dialog.locator('[data-day="9"]').click();
  await dialog.locator('[data-day="14"]').hover();
  await page.waitForTimeout(200);
  const drawn = await page.evaluate(() =>
    [10, 11, 12, 13].map((n) => {
      const b = document.querySelector(`[role=dialog] [data-day="${n}"]`)!;
      const c = getComputedStyle(b, '::before');
      // `content` too: the browser reports the declared border of a pseudo-element that is never generated (no `content`)
      return `${n}: ${c.content} ${c.borderTopWidth} ${c.borderTopStyle}`;
    }),
  );
  expect(drawn, 'days between the first end and the pointer: a line above and below').toEqual(['10: "" 1px dashed', '11: "" 1px dashed', '12: "" 1px dashed', '13: "" 1px dashed']);
  const end = await page.evaluate(() => {
    const c = getComputedStyle(document.querySelector('[role=dialog] [data-day="14"]')!);
    return `${c.borderTopWidth} ${c.borderTopStyle}`;
  });
  expect(end, 'the far end, not picked yet: a dashed border').toBe('2px dashed');
});
