---
"@sereno-ds/ui": minor
---

`DateTimePicker` takes `min` and `max`, and `min` / `max` now limit the calendar navigation in both `DateTimePicker` and `DatePicker` (SS-331).

Until now the calendar went to any month and year: the previous-month arrow, PageUp, the arrow keys and the month / year popover all led there, and a consumer could only strike the days of the visible month through `unavailable`. `DatePicker` already had `min` / `max`, but they only struck days.

- **`DateTimePicker` gets `min?: string` and `max?: string`** ("YYYY-MM-DD", the same names `DatePicker` has).
- **The navigation stops at the range.** In the first month the previous-month arrow is disabled (it keeps its accessible name), PageUp does nothing and the arrow keys do not cross into an earlier month. `max` is the mirror image for the next-month arrow and PageDown. In the month / year popover the months and years out of range are disabled, "Previous year" / "Previous years" disable when no valid year is left behind (and the same ahead), and the 12-year block opens inside the range. Pressing the arrow that lands on the first or last month hands focus to the title instead of dropping it to the page.
- **The days outside the range are struck through on their own**, merged with `unavailable`, so a booking page can pass today as `min` and drop its own "past days" calculation.
- **A `year` / `month` that starts outside the range moves to the nearest month inside it**, and `onMonthChange` reports that month once, at mount (it is the only time it fires at mount, so a consumer that tracks the month is not left on the one it asked for). In `DatePicker` this also means a value or an empty field outside the range opens on the nearest month inside it, and the day picked is in the month that was shown.
- **`min` / `max` that change after mount** bring the visible month back inside the range. A bound that is not a valid date is ignored; if `min` is after `max`, nothing can be navigated.

Compatible with what you have: with no `min` and no `max`, `DateTimePicker` and `DatePicker` render exactly what they did (checked byte for byte on 108 states: the arrows, the keyboard, the month / year popover and picking a day). The one change is for a `DatePicker` that already passes `min` or `max`: besides striking the days it now also stops the navigation, which is the point of the bound.
