import { test, expect, type Locator } from '@playwright/test';
import { COMPONENTS, examplesFor } from '../src/design-system/catalog';

/**
 * Forced colors / Windows High Contrast (#135). The `forced` project runs this file with `forcedColors: 'active'`: the
 * browser swaps every authored colour for a system one and drops every `box-shadow`, which is what used to leave a
 * Button, an Input or a Switch with no visible focus (WCAG 2.4.7).
 *
 * It is not a pixel test: for each example of each component page it focuses the first interactive elements from the
 * keyboard and checks that SOMETHING is drawn, an `outline` on the element or, for a text box, on the frame around it.
 * So there are no reference images to keep, and a new component with a shadow-only ring fails here at once.
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
