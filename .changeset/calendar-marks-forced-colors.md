---
"@sereno-ds/ui": minor
---

The dots under a calendar day and the swatches of `CalendarLegend` are drawn in Windows High Contrast (forced colors), each tone as its own shape (#157, part of the forced-colors work of #135).

In forced colors the browser turns a plain background colour into the colour of the page and drops every `box-shadow`. The tone dots of `dayDots` (`DateTimePicker`, `DatePicker`) and the dots and the ring for today in a `CalendarLegend` were only a plain fill and a shadow, so none of them was drawn: a person using the mode saw the days and a legend with words only, and lost which days have bookings. On the picked day it was worse, because its dot is white on a primary fill that the mode also removes. Measured with the browser's emulation on the docs pages, before: the 11 dots of the "day dots" example and the 3 today swatches had no fill and no border; now all are drawn.

`styles.css` has new rules in its `@media (forced-colors: active)` block: the dot is drawn in the text colour (on the picked day too), and, since the tone colours are not available, each tone is its own shape, the same one in the calendar and in the legend: `brand` a filled circle, `success` a ring, `warning` a filled square, `error` a filled diamond, `info` a hollow square. The swatch for today gets the same thin border the day for today has. Nothing applies outside forced colors, and the pictures of the normal mode are identical to before (all the reference images of the visual tests).

What changes for an app:

- **`@sereno-ds/ui/styles.css` is now required for the dots** (the calendar already needed it): a dot's fill and corners moved from inline styles to the `.sereno-dtp-dot` class, because an inline `background` or `border-radius` would beat the forced-colors rule that redraws it. The class is on every dot (`data-tone` says which tone it is), and the legend's swatch for today has `.sereno-dtp-ring`. Without the import a dot is not drawn.
- The docs' `forced` Playwright project checks the dots and the swatches (its second test per page) and fails when a dot has no fill and no border, a today swatch has no border, or two tones in one example look alike. While writing it I found that its "no fill" test read `rgb(0, 0, 0)` as transparent, because it matched any colour ending in `, 0)`; it now matches only `rgba(` with an alpha of 0.
