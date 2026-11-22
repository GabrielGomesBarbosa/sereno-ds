# Testing

Two layers, for two different kinds of mistake:

| Layer | Catches | Tool | Runs where |
|---|---|---|---|
| **Behavior tests** | a component that does the wrong thing: a click that does nothing, a key that does not move the focus, a state that does not change, a missing label | Vitest, Testing Library, user-event, jest-axe (in jsdom) | `npm test`, in CI |
| **Visual regression tests** | a component that **looks** different: one pixel of colour, spacing, border, font, shadow, in any theme, at phone width, on hover, pressed, on focus, when it opens | Playwright, in a pinned Docker image | `npm run test:visual`, in CI |

They do not replace each other. jsdom has no layout, no `:hover`, no `:focus-visible` and no real theme, so a
behavior test passes while a padding changes by 2 px; and a screenshot cannot tell that a click handler is wired
to the wrong thing.

## Behavior tests

```bash
npm test                              # every workspace (turbo run test)
npm run test -w @sereno-ds/ui         # only the components
npm run test:watch -w @sereno-ds/ui   # re-runs on save
```

- **Where:** next to each component, `packages/ui/src/<category>/<Component>.test.tsx` (the component's own
  behavior), plus `packages/ui/src/_internal/*.test.ts(x)` for the shared hooks and helpers. The demo app has its
  own in `apps/demo`.
- **Setup:** `packages/ui/vitest.config.ts` (jsdom, globals), `packages/ui/src/test/setup.ts`.
- **The smoke test** (`packages/ui/src/test/components.smoke.test.tsx`) renders **every** exported component once
  from the `CASES` map, checks it is exported, runs an interaction, and runs **jest-axe** (accessibility) on it.
  **A new component adds its case there**: one line buys three checks.
- **How to write one:** query like a person does (`getByRole`, `getByLabelText`), drive it with `user-event` (or
  `fireEvent` for an event `user-event` does not model), assert what a person would see or hear
  (text, `aria-*`, focus), not how it is built.
- **What jsdom cannot test** goes to the visual layer below: anything about layout, `:hover`, `:focus-visible`,
  the theme, a media query, or how something is drawn.

## Visual regression tests (pixel by pixel)

**No pixel may differ in a way a person could see**: the test allows `maxDiffPixels: 0` (not a single pixel over
the limit) and the per-pixel limit is the rounding noise described in [The one tolerance](#the-one-tolerance).
When the change is on purpose (a new feature, a design decision), a person looks at the new pixels on screen,
approves them, and the reference images are updated and committed with the change that caused them.

### What it checks

It opens the **static build of the docs** (`apps/docs/out`) and screenshots the live demo of **every example of
every component** (the list comes from the catalog, `apps/docs/src/design-system/catalog`, so a new component or
example is picked up with no test code):

| Project | Viewport | What |
|---|---|---|
| `light` | 1280 px wide, light theme | the default state of every example, **plus** a hover image and a keyboard-focus image of each interactive element (up to 6 per example), a **pressed** image of the first 3 buttons (mouse button held down), **plus** what each trigger opens (a list, a menu, a calendar, a dialog, a toast; up to 3 per example) |
| `dark` | 1280 px wide, dark theme | the default state of every example |
| `mobile` | 375 px wide, light theme | the default state of every example |

The images are in `apps/docs/e2e/__screenshots__/<project>/<component>--<example>[--hover-N|--focus-N|--open-N].png`.
Open any of them to see exactly what is guarded.

The tests live in `apps/docs/e2e/visual.spec.ts` and the settings in `apps/docs/playwright.config.ts`. The demos
are marked with `data-example-preview` (`apps/docs/src/design-system/ExampleSection.tsx`), which is what the tests
photograph.

### Why Docker, and why arm64

Pixel-exact only works if the references and the comparison are made in **the same environment**: the font
smoothing, the Chromium build and even the CPU architecture change the anti-aliasing by a colour level. So both
happen in the **pinned Playwright image** (`mcr.microsoft.com/playwright:v1.65.1-noble`):

- locally, `scripts/visual.sh` runs it with `docker run`;
- in CI, the `visual` job of `.github/workflows/ci.yml` runs the same image as a job container, on an **arm64**
  runner (`ubuntu-24.04-arm`) so the architecture is the same as the Docker of an Apple Silicon Mac.

Consequences you should know about:

- **Docker has to be running** to run these tests on your machine (everything else in the repo works without it).
  The image is about 3.6 GB and is pulled on the first run.
- The script forces `--platform linux/arm64`. On an Apple Silicon Mac that is native; on an Intel machine it runs
  emulated (slow, but the same pixels). A reference made with an x86 image would **not** match the arm64 CI.
- **The image tag, `@playwright/test` in `apps/docs/package.json` and the CI image must move together.** Upgrading
  Playwright changes the Chromium, so every reference is regenerated and reviewed in that PR.

### Commands

```bash
npm run test:visual            # build the docs, compare with the references (what CI does)
npm run test:visual:update     # build the docs, REWRITE the references (only after a person approved the pixels)
```

Both run `npm run build:docs` first, because the tests read `apps/docs/out`. To run a part of it while working,
use the script directly (arguments go to Playwright) after a build:

```bash
npm run build:docs
bash scripts/visual.sh --project=light -g "forms/select"            # one component page
bash scripts/visual.sh --project=light --update-snapshots -g "core/button"
```

### When a test fails

1. **See what changed.** Locally: `apps/docs/e2e-report/index.html` (open it in a browser) and
   `apps/docs/test-results/<test>/<image>-{expected,actual,diff}.png`. In CI: the **`visual-differences`**
   artifact of the failed run holds the same folders.
2. **Decide.** Is the difference what the change was supposed to do?
   - **No:** it is a regression. Fix the code. Do not touch the references.
   - **Yes (a feature, a design decision):** look at it **on screen** (`npm run dev`, the component's docs
     page) and have it approved by the person who owns the design. Only then:
3. **Update the references:** `npm run test:visual:update`, review the changed images in the PR (they are collapsed
   by default in GitHub's diff, `.gitattributes` marks them as generated; open the files you care about), and
   commit them **in the same PR** as the change.

Never update the references just to make a red build green.

A consequence worth knowing: **adding an example to a page adds its own pictures and changes none of the
others.** If a PR that only adds an example makes older pictures fail, something is leaking between examples and
that is a bug in the test, not a reason to refresh them.

### Adding a component or an example

Add it to the docs catalog and write its demo as you always do (see `AGENTS.md`). The tests find it, and `npm run test:visual:update` creates its images. Review them: a demo that
looks wrong should be fixed before its picture becomes the reference.

### How the pixels are kept stable

A visual test that fails at random is worse than none, so the suite is built to be deterministic, and each of these
rules was needed:

- **Nothing scrolls.** The docs scroll inside a panel, and a scroll offset with a fractional part moves every
  element by a fraction of a pixel, which changed the anti-aliasing of rounded corners by one colour level between
  two runs of the same code. The window is made as tall as the page, so every element keeps the position the
  layout gave it.
- **The window height is even.** A dialog is centred in the window, at (window height - dialog height) / 2. The
  window is as tall as the page, so adding an example to a page changes it by any number of pixels, and with an odd
  height the dialog lands on a half pixel: its text and borders are snapped to whole pixels, but its icons are not,
  and they changed by a few pixels in the open-dialog pictures of the same page. With an even height the position
  depends on the dialog only. (Found by running the suite on the PR that adds an example to the Dialog page.)
- **Each example is pinned to a whole pixel.** An example sits at a fractional position that is the sum of the
  heights of everything above it on the page, so adding an example above it (or changing one by half a pixel)
  would move every picture below by half a pixel and fail them, though their components did not change. Before
  each picture the section is nudged by that fraction (`pin()` in the spec), so a picture depends on its example
  and on nothing else. (Found by running the suite on a PR that adds an example to the Dialog page.)
- **A dialog or a toast is photographed on a plain background.** They open far from the demo, over whatever the
  page has at that spot, which changes with every edit of the page; the rest of the page is hidden (`hidePageBehind()`)
  so the overlay is the only thing in the picture.
- **Hover, pressed and focus pictures wait 250 ms**, for what is driven by a timer and not by a transition: a
  tooltip that appears after a delay (the sidebar's labels) or a flyout that closes after one.
- **The clock is frozen** (`2026-06-15`), because the calendars mark "today".
- **Transitions and animations are off in the page** (an injected stylesheet, `SETTLED` in the spec), not only at
  the moment of the picture. Playwright's `animations: 'disabled'` finishes animations when the picture is taken,
  but a CSS transition still running at that moment (the longest in the system is 340 to 420 ms, and every hover
  starts one) was caught part of the way on some runs: a thin icon one or two colour levels off, never the same
  one twice. With no transitions there is no "part of the way". Text selection and the caret are off too (pressing
  a card and letting go elsewhere would otherwise select its text).
- **The fonts are loaded** before the first picture (`document.fonts.ready`; the fonts are local files, see
  `fonts/README.md`) and the page is hydrated.
- **One image, one fresh page** for what opens something: after each opening the page is reloaded, so nothing is
  left open or scrolled for the next picture.
- **The input mode is reset.** After a keyboard-focus picture the browser is left thinking the last input was the
  keyboard, and then the next thing a click focuses may or may not show its focus ring. This was a real flaky
  image (found by opening the same menu with and without a keyboard focus before it: two different pictures, one
  of them chosen at random). Now a click on the demo's inert padding gives the mouse mode back, and the pointer is
  taken away from what a click just opened before it is photographed.
- **Every opening starts on a freshly loaded page**, with nothing focused, hovered or scrolled by what came before.
- **No retries** (`retries: 0`): a retry would hide a flaky pixel instead of showing it.
- A disabled trigger opens nothing, so it gets no hover, focus or open image (its default image already shows it).

#### The one tolerance

`threshold: 0.01` is the only thing that is not bit-exact, and it is there on purpose. Even with everything above,
about 0.3% of the images (the edge of a rounded corner, the last column of a crop) came out **one colour level**
apart between two runs of the same code, in the same image, on the same machine: an element that sits on a half
pixel can be drawn with a coverage that differs by 1/64 of a pixel of layout. Nobody can see that, and it made the
suite fail at random, which teaches people to ignore a red build.

`0.01` is Playwright's per-pixel colour-distance limit (the YIQ formula of `pixelmatch`). In practice a pixel passes
if it moved by up to about **2 or 3 levels (of 255) in green, 4 in red and 7 in blue**, which are the rounding
differences, and fails from there on, whichever way the colour moved. A different colour token, a 1 px shift of an
edge, a changed border, shadow, font or radius all move pixels by far more than that and fail. `maxDiffPixels: 0`
stays: not one pixel may be over the limit.

The suite was checked for stability by running the comparison several times in a row on unchanged code (see the
PR), and for sensitivity by breaking a colour, a spacing, a border and a hover colour on purpose and watching the
right images fail.

### What it does not cover

- **How a page behaves in a short window.** Pages are shot in a window as tall as the page (that is what makes them
  stable), so a dialog's `max-height` against a short screen, or a list that has to scroll because there is no room,
  are checked by hand or by behavior tests, not by these pictures.
- **Animations in motion.** Hover, pressed, focus and open are covered, each as a settled state; the frames of
  an animation or a transition are not (they are turned off on purpose).
- **Browsers other than Chromium.** Safari and Firefox rendering is checked by hand (the iPhone, on the docs).
- **Real content of an app.** These are the DS demos; a product screen built on the DS is the app's to test.

### Size and time

**1282 reference images, 9.0 MB** in the repository (light 966, dark 158, mobile 158), all PNGs; `.gitattributes` marks
them as generated so GitHub collapses them in a PR's diff. A full run is about 5 minutes with 4 browsers in
parallel (111 tests: one per component page, in each of the 3 projects); a single component page takes a few
seconds. Each reference is small (a demo, or a button with a margin around it), so a change to one component
rewrites only its own pictures.
