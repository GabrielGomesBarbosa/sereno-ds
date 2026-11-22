---
"@sereno-ds/ui": minor
---

Keyboard focus is visible in Windows High Contrast (forced colors), and the `Switch` is drawn there (#140, part of #135).

In forced colors the browser swaps every authored colour for a system one and drops every `box-shadow`, so the focus ring of `Button`, `IconButton`, a clickable `Card`, `ActionCard`, `Switch`, `Input`, `Textarea` and `Autocomplete` (all drawn as a shadow) vanished, and the `Switch`, which is a coloured track and thumb, was not drawn at all. Measured with the browser's forced-colors emulation: before, 23 of the 37 component pages had a focusable element with no visible indicator; now none does.

`styles.css` has a new `@media (forced-colors: active)` block: a `Highlight` outline where the ring is a shadow, and a framed track with system fills for the `Switch`. Nothing in it applies outside forced colors, and the pictures of the normal mode are identical to before (all the reference images of the visual tests).

What changes for an app:

- **`@sereno-ds/ui/styles.css` is now required for `Switch`** (the other controls already needed it): the track fill is `background: var(--sd-bg)` in the stylesheet and the thumb has the class `sereno-switch-thumb`, instead of both being inline. Without the import the track has no fill.
- `Button`, `IconButton`, a clickable `Card`, `ActionCard` and `Textarea` no longer set `outline: none` inline; the same `outline: none` is now in their rule in `styles.css`. The look is the same, and an `outline` rule of yours now wins by coming later (before, it lost to the inline value).
- A new `forced` project in the docs' Playwright suite fails when a focusable element has no visible indicator in forced colors.
