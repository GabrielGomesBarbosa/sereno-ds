---
"@sereno-ds/ui": minor
---

Current, selected and checked states are visible in Windows High Contrast (forced colors): the current page of a `Pagination`, the current item of a `SidebarNav` and a `BottomNav`, a selected `Tab`, a selected `Table` row, a selected `Card` and `ActionCard`, the `Stepper`, and a checked `Checkbox` or `Radio` (#141, part of #135).

In forced colors the browser swaps every authored colour for a system one and drops every shadow, so a state told only by a fill or a shadow looked exactly like its unmarked neighbour. Measured with the browser's emulation, before: 8 of the 37 component pages had a marked element that looked like its siblings (every checked `Checkbox` and `Radio`, the selected `Tab`, the `Stepper`, the current `BottomNav` item...); now none does. `styles.css` has the new rules in its `@media (forced-colors: active)` block: an underline or a heavier border in the selection colour where there is text (a fill behind text makes the browser draw a box behind the letters), system fills where there is none, and a drawn check, dash or dot for the `Checkbox` and `Radio`. `Card` and `ActionCard` also get a border there, since their edge is a shadow in the normal mode. Nothing applies outside forced colors, and the pictures of the normal mode are identical to before.

What changes for an app:

- **`@sereno-ds/ui/styles.css` is now required for `Stepper`** (the other controls already needed it): each segment's fill is `background: var(--sd-bg)` in the stylesheet, with the class `sereno-step` and a `data-state` of `done`, `active` or `todo`. Without the import the segments have no fill.
- `ActionCard` no longer sets `border: none` inline; it is in its rule in `styles.css`. `Card` gets a `data-selected` attribute when `selected`.
- The docs' `forced` Playwright project has a second test per page that fails when a current, selected or checked element looks like its unmarked siblings.
- Not here yet: the active option of a `Select`, `Menu` or `Autocomplete` list and the selected day of a calendar (next).
