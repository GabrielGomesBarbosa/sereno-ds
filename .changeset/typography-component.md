---
"@sereno-ds/ui": minor
---

Adds `Typography` (SS-261) — the `fontFamily`/`fontSize`/`fontWeight`/
`letterSpacing`/`lineHeight` combos every screen otherwise reconstructs by
hand, as one component instead of a new inline style object each time.

`variant` (`'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' |
'caption' | 'eyebrow'`) picks the look and the default semantic tag;
`color` overrides the variant's own sensible default (every value a text
color token, never a raw color); `as` swaps the rendered tag without
touching the variant's styling (a heading-styled label that shouldn't enter
the document outline); `truncate` clips to one line with an ellipsis;
`numeric` sets tabular figures for a value that updates in place or stacks
with others at the same position — countdowns, queue/ticket numbers,
clocks, prices in a column.

The variant set isn't an invented scale — it's extracted from the font
combos already repeated across the real product app (`schedule-system`):
page titles, card titles, secondary paragraphs, muted captions, uppercase
eyebrow labels.
