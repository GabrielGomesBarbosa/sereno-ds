import { test, expect, type Locator, type Page } from '@playwright/test';
import { COMPONENTS, examplesFor } from '../src/design-system/catalog';

/**
 * One test per component page. Each example's live demo is screenshotted (every project: light, dark and
 * mobile). In the `light` project the interactive elements of each demo are also hovered and focused
 * from the keyboard, and what they open (a list, a menu, a dialog) is screenshotted too.
 * `expect.soft`: a pixel that differs does not hide the other differences of the same page.
 */

/** The calendars mark "today": the clock is frozen so the pixels do not change with the date. */
const FIXED_TIME = new Date('2026-06-15T12:00:00.000Z');

/** Elements a person can point at or tab to, inside a demo. */
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

/** A disabled trigger opens nothing: it has no image of its own (its default state is already one). */
const ENABLED = ':not([disabled]):not([aria-disabled=true])';

/** At most this many elements per demo get a hover and a focus image: bounded, and the first ones are the variants. */
const MAX_STATES_PER_EXAMPLE = 6;
const MAX_OPEN_PER_EXAMPLE = 3;
/** The pressed state (mouse button held down on it) of the first few buttons of each example. */
const MAX_PRESS_PER_EXAMPLE = 3;
/** A button that presses without opening anything: a trigger that says it opens something would change the page. */
const PRESSABLE = 'button:not([aria-haspopup]):not([aria-expanded]), [role=button]:not([aria-haspopup]):not([aria-expanded])';

/** Pages whose demos are buttons that open something (a dialog, a toast) with no `aria-haspopup` to say so. */
const OPENS_ON_ANY_BUTTON = new Set(['dialog', 'toast']);

/**
 * The docs scroll inside a panel, and a scroll offset with a fractional part moves every element by a
 * fraction of a pixel, which changes the anti-aliasing of rounded corners and shadows by one colour level
 * (found while building this suite: the same image differed by 1 to 2 pixels between runs). So nothing may
 * scroll: the window is made as tall as the page, and every element keeps the position the layout gave it.
 */
async function fitViewportToPage(page: Page) {
  const needed = await page.evaluate(() => {
    let best = document.documentElement.scrollHeight;
    document.querySelectorAll('*').forEach((e) => {
      const s = getComputedStyle(e);
      if (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight) best = Math.max(best, e.scrollHeight);
    });
    return best;
  });
  const width = page.viewportSize()!.width;
  await page.setViewportSize({ width, height: Math.min(16000, needed + 200) });
  await page.waitForTimeout(200);
}

/**
 * Puts an example on a whole pixel. Its picture must depend on the example and on nothing else, but the example
 * sits at a fractional position that is the sum of the heights of everything above it on the page: add or
 * change an example above it by half a pixel and every picture below moves by half a pixel and fails, though
 * its component did not change (found by running the suite on a PR that adds an example to the Dialog page).
 * The section is nudged by the fraction (a margin, so the layout stays honest) so that the demo starts on a
 * whole pixel, horizontally and vertically. Call it again after every reload.
 */
async function pin(preview: Locator) {
  await preview.evaluate((el) => {
    const section = el.closest('section') as HTMLElement;
    const r = el.getBoundingClientRect();
    const fy = r.top - Math.round(r.top);
    const fx = r.left - Math.round(r.left);
    if (fy) section.style.marginTop = `${(parseFloat(section.style.marginTop) || 0) - fy}px`;
    if (fx) section.style.marginLeft = `${(parseFloat(section.style.marginLeft) || 0) - fx}px`;
  });
}

/** What opens (a list, a menu, a dialog, a toast) is photographed in a window of this height... */
const OPEN_WINDOW_HEIGHT = 1000;
/** ...with the demo this many pixels below the top of it. */
const OPEN_DEMO_TOP = 100;

/**
 * Puts the demo at the same place of a window of the same size, whatever the page has above or below it.
 *
 * Why: a popup is `position: fixed`, and the pixels of a thin icon in it (the check of a list, the arrow of a
 * calendar, the X of a dialog) depend, by a colour level or two and not always the same way, on the ABSOLUTE
 * position where it is drawn. In a window as tall as the page that position is "everything above the demo", so
 * adding an example anywhere above changed pictures of other examples by a few pixels (found by running this suite
 * on a PR that adds an example to the Dialog page: the X of two older dialogs; then measured on the menu, select,
 * date-picker and autocomplete pages by pushing the demo down by 1 to 777 px: up to a thousand pixels over the
 * limit). With the window and the place fixed the pictures are identical to the bit whatever is above.
 *
 * The docs scroll inside `main.ds-main`; room is added below so even the last example can be brought to the
 * same place, and the scroll is a whole number of pixels because the demo was pinned to one (`pin()`).
 */
async function placeInWindow(page: Page, preview: Locator) {
  const width = page.viewportSize()!.width;
  await page.setViewportSize({ width, height: OPEN_WINDOW_HEIGHT });
  await page.waitForTimeout(200);
  const top = await preview.evaluate((el, wanted) => {
    const main = document.querySelector('main.ds-main') as HTMLElement | null;
    if (main) {
      const room = document.createElement('div');
      room.style.height = '2000px';
      main.appendChild(room);
      main.scrollTop += Math.round(el.getBoundingClientRect().top) - wanted;
    }
    // Only this example is in the picture. A popup covers what is next to its demo: the docs' sidebar (it lists every
    // component, so it changes when one is added), the header (it says the version, so it changes at every release)
    // and the examples before and after this one (they change when one is added or edited). Everything of the docs
    // is hidden but this example's own section; what a popup or a dialog opens is outside it (a portal) and stays.
    document.querySelectorAll<HTMLElement>('.ds-aside, .ds-header, main.ds-main').forEach((e) => (e.style.visibility = 'hidden'));
    (el.closest('section') as HTMLElement).style.visibility = 'visible';
    return el.getBoundingClientRect().top;
  }, OPEN_DEMO_TOP);
  if (Math.abs(top - OPEN_DEMO_TOP) > 0.01) throw new Error(`placeInWindow: the demo is at ${top}px, not at ${OPEN_DEMO_TOP}px (a picture taken from here would depend on the page)`);
  await page.waitForTimeout(200);
}

/**
 * For something that opens far from the demo (a dialog, a toast): hides the rest of the page, so the picture
 * has the overlay on a plain background instead of on whatever happens to be behind it, which changes every
 * time the page above or below changes.
 */
async function hidePageBehind(page: Page) {
  await page.evaluate((overlays) => {
    Array.from(document.body.children).forEach((child) => {
      const el = child as HTMLElement;
      if (['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName)) return;
      if (el.matches(overlays) || el.querySelector(overlays) || getComputedStyle(el).position === 'fixed') return;
      el.style.visibility = 'hidden';
    });
  }, '[role=menu], [role=listbox], [role=dialog], [role=tooltip]');
  // `placeInWindow` left the example's own section visible (to show a popup with its demo): not for a picture of
  // something that stands alone.
  await page.evaluate(() => document.querySelectorAll<HTMLElement>('main.ds-main section').forEach((e) => (e.style.visibility = 'hidden')));
}

/**
 * Pictures are of settled states, so a state change must be instant. Playwright's `animations: 'disabled'`
 * finishes animations at the moment of the picture, but a CSS transition that is still running when the picture is
 * taken (the longest in the system is 340 to 420 ms; a hover starts one) is caught part of the way on some runs:
 * an icon one or two colour levels off. With no transitions there is no "part of the way". Text selection is off
 * too: pressing a card and letting go elsewhere would select its text.
 */
const SETTLED = `*, *::before, *::after {
  transition: none !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}`;

async function openComponentPage(page: Page, category: string, slug: string) {
  await page.clock.setFixedTime(FIXED_TIME);
  await page.goto(`/design-system/${category}/${slug}/`);
  await page.addStyleTag({ content: SETTLED });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-example-preview]').first().waitFor();
  await page.waitForTimeout(300); // hydration of the client demos
  await fitViewportToPage(page);
  await page.mouse.move(0, 0);
}

/** A screenshot of the viewport around `box`, with room for a ring or a shadow that spills out of it. */
async function shotAround(page: Page, box: { x: number; y: number; width: number; height: number }, name: string, pad = 14) {
  const vp = page.viewportSize()!;
  const x = Math.max(0, Math.floor(box.x - pad));
  const y = Math.max(0, Math.floor(box.y - pad));
  const right = Math.min(vp.width, Math.ceil(box.x + box.width + pad));
  const bottom = Math.min(vp.height, Math.ceil(box.y + box.height + pad));
  await expect.soft(page).toHaveScreenshot(name, { clip: { x, y, width: right - x, height: bottom - y } });
}

/** Things that open over or beside the demo: lists, menus, tooltips, dialogs. */
const OVERLAYS = '[role=menu], [role=listbox], [role=dialog], [role=tooltip]';

/** What a click opened: the overlay elements plus anything newly `position: fixed` (a toast), minus a full-screen scrim. */
async function newOverlayBoxes(page: Page, before: string[]) {
  return page.evaluate(
    ({ before, overlays }) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const seen = new Set(before);
      const boxes: { x: number; y: number; width: number; height: number }[] = [];
      const add = (e: Element) => {
        const r = e.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.width >= vw * 0.9 && r.height >= vh * 0.9) return; // the scrim, or a full-screen surface: not what we look at
        boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height });
      };
      document.querySelectorAll(overlays).forEach((e) => add(e));
      document.querySelectorAll('body *').forEach((e) => {
        if (getComputedStyle(e).position === 'fixed' && !seen.has(pathOf(e))) add(e);
      });
      function pathOf(e: Element): string {
        const parts: string[] = [];
        for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) parts.push(`${n.tagName}:${Array.prototype.indexOf.call(n.parentElement?.children ?? [], n)}`);
        return parts.join('>');
      }
      return boxes;
    },
    { before, overlays: OVERLAYS },
  );
}

async function fixedPaths(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    function pathOf(e: Element): string {
      const parts: string[] = [];
      for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) parts.push(`${n.tagName}:${Array.prototype.indexOf.call(n.parentElement?.children ?? [], n)}`);
      return parts.join('>');
    }
    document.querySelectorAll('body *').forEach((e) => {
      if (getComputedStyle(e).position === 'fixed') out.push(pathOf(e));
    });
    return out;
  });
}

type Box = { x: number; y: number; width: number; height: number };
const union = (boxes: Box[]): Box => {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const r = Math.max(...boxes.map((b) => b.x + b.width));
  const b = Math.max(...boxes.map((bx) => bx.y + bx.height));
  return { x, y, width: r - x, height: b - y };
};

/** Overlays near the demo are shown together with it; a dialog or a toast far from it, by itself (`far`). */
function frame(preview: Box, overlays: Box[]): { box: Box; far: boolean } {
  if (!overlays.length) return { box: preview, far: false };
  const o = union(overlays);
  const near = o.y < preview.y + preview.height + 200 && o.y + o.height > preview.y - 200;
  return near ? { box: union([preview, o]), far: false } : { box: o, far: true };
}

for (const meta of COMPONENTS) {
  test(`${meta.category}/${meta.slug}`, async ({ page }, testInfo) => {
    await openComponentPage(page, meta.category, meta.slug);
    const withStates = testInfo.project.name === 'light';

    for (const ex of examplesFor(meta)) {
      const preview = page.locator(`section#${ex.id} [data-example-preview]`);
      await pin(preview);
      await expect.soft(preview).toHaveScreenshot(`${meta.slug}--${ex.id}.png`);
      if (!withStates) continue;

      const items = preview.locator(INTERACTIVE);
      const count = Math.min(await items.count(), MAX_STATES_PER_EXAMPLE);
      for (let i = 0; i < count; i++) {
        const el = items.nth(i);
        if (!(await el.isVisible())) continue;

        // hover
        await el.hover();
        await page.waitForTimeout(250); // a tooltip that shows after a delay (the collapsed sidebar) has to be there
        const hoverBox = await el.boundingBox();
        if (hoverBox) await shotAround(page, hoverBox, `${meta.slug}--${ex.id}--hover-${i}.png`);
        await page.mouse.move(0, 0);

        // pressed: the mouse button held down on it, then released somewhere else so it never counts as a click
        if (i < MAX_PRESS_PER_EXAMPLE && hoverBox && (await el.evaluate((e, sel) => e.matches(sel), PRESSABLE))) {
          await page.mouse.move(hoverBox.x + hoverBox.width / 2, hoverBox.y + hoverBox.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(250);
          await shotAround(page, hoverBox, `${meta.slug}--${ex.id}--press-${i}.png`);
          await page.mouse.move(0, 0);
          await page.mouse.up();
          // The press focused it with the mouse (no ring), and `focus()` on something already focused does nothing:
          // let go of the focus so the keyboard focus below starts from nothing.
          await el.blur();
        }

        // focus from the keyboard: a key press first, so the browser treats the next focus as a keyboard one
        await page.keyboard.press('Shift');
        await el.focus();
        await page.waitForTimeout(250);
        const focusBox = await el.boundingBox();
        if (focusBox) await shotAround(page, focusBox, `${meta.slug}--${ex.id}--focus-${i}.png`);
        await el.blur();
        // Give the browser back its "the last input was the mouse" mode. A keyboard focus leaves it in the
        // keyboard one, and then the NEXT thing a click focuses may or may not show its focus ring: that was
        // a flaky pixel, found by opening the same menu with and without a keyboard focus before it.
        const area = await preview.boundingBox();
        if (area) await page.mouse.click(area.x + 4, area.y + 4); // the demo's own padding: inert
        await page.mouse.move(0, 0);
      }

      // what the demo opens: a trigger that says so (`aria-haspopup` / `aria-expanded`), or any button of a
      // page whose demos are the triggers themselves (a dialog, a toast). Each one on a fresh page.
      if (!withStates) continue;
      const triggerSel = OPENS_ON_ANY_BUTTON.has(meta.slug) ? `button${ENABLED}` : `[aria-haspopup]${ENABLED}, [aria-expanded]${ENABLED}`;
      const triggers = preview.locator(triggerSel);
      const openCount = Math.min(await triggers.count(), MAX_OPEN_PER_EXAMPLE);
      for (let j = 0; j < openCount; j++) {
        // Every opening starts on a freshly loaded page: nothing focused, hovered or scrolled by what came before.
        if (j === 0) await openComponentPage(page, meta.category, meta.slug);
        await pin(preview);
        await placeInWindow(page, preview);
        const before = await fixedPaths(page);
        const trigger = preview.locator(triggerSel).nth(j);
        if (!(await trigger.isVisible())) continue;
        await trigger.click();
        // The pointer stays where the click left it, often right over what just opened, and the browser applies
        // the hover under it at a moment that is not the same on every run: take the pointer out of the picture.
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
        const previewBox = (await preview.boundingBox())!;
        const overlays = await newOverlayBoxes(page, before);
        const shown = frame(previewBox, overlays);
        // A dialog is alone on a plain background, near the demo or not: what is behind it is the rest of the page,
        // which changes with every example added. (Only the Dialog page: the calendar popup of a date picker has
        // role=dialog too, and a toast of the docs lives inside its demo; both are photographed with it.)
        const dialogPage = meta.slug === 'dialog';
        const alone = shown.far || dialogPage;
        if (alone) await hidePageBehind(page);
        let box = shown.box;
        if (alone) {
          // a full-screen dialog is not in `overlays` (it is the window): then the picture is the whole window
          const vp = page.viewportSize()!;
          box = overlays.length ? union(overlays) : dialogPage ? { x: 0, y: 0, width: vp.width, height: vp.height } : shown.box;
        }
        await shotAround(page, box, `${meta.slug}--${ex.id}--open-${j}.png`, 8);
        // a clean page for the next one: nothing left open, nothing scrolled
        await openComponentPage(page, meta.category, meta.slug);
      }
    }
  });
}
