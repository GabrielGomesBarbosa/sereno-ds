---
"@sereno-ds/ui": minor
---

The month calendar tells `renderDay` about the day, can draw its own dots, marks today, and comes with a legend (SS-474).

An app that drew a dot under the days with bookings had to work out which day was selected by itself, to turn the dot to `--interactive-primary-fg` (on the selected day the cell is filled with the primary color, so a primary dot vanished), and to build the legend by hand. All of that now lives in the calendar.

- **`renderDay(day, context)`**: the second argument is `{ selected, today, unavailable }` (type `CalendarDayContext`). `unavailable` is true for a day listed in `unavailable` and for one outside `min` / `max`. A `(day) =>` that ignores it keeps working.
- **`dayDots`** on `DateTimePicker` and `DatePicker`: day numbers (`[3, 17]`) or an object keyed by day (`{ 3: { tone: 'warning', label: 'Pending' } }`), with `tone` one of `brand`, `success`, `warning`, `error`, `info` (status tokens, never a loose color). The calendar places the 6px dot under the number, turns it to `--interactive-primary-fg` on the selected day and fades it on a day that cannot be picked. Each dot is named for a screen reader (`label`, else `dayDotLabel`, else "com marcador" / "marked"). Day numbers of the month on screen, like `unavailable`: refresh them in `onMonthChange`. It shares the slot under the number with `renderDay`.
- **Today is marked**: a thin inset ring in `--border-brand` on today's cell (3.17:1 against the card in the light theme and 3.47:1 in the dark one, where `--border-strong` would be 1.63:1), and `aria-current="date"`. No ring when today is the selected day (the fill says it). This is the one visual change to a calendar that uses none of the new props; it applies to `DateTimePicker` and `DatePicker` alike.
- **`DatePicker`** gains `renderDay`, `dayDots`, `dayDotLabel` and `onMonthChange` (`(year, month) => void`, fired on each step, not when the popover opens), so a consumer can tell which month is on screen.
- **`CalendarLegend`**: `items={[{ label, dot?, outline? }]}`. Draws the same dot (`dot: true` or a tone) and the same ring (`outline`) as the calendar, from the same functions, as a centered list that wraps on a narrow screen.
- Types exported: `CalendarDayContext`, `CalendarDayDot`, `CalendarDayDots`, `CalendarDotTone`, `CalendarLegendProps`, `CalendarLegendItem`.

Only added to: with no `dayDots` and no `renderDay`, a day is its number and nothing else, at the same height as before. With either set, the cells grow to 48px, as `renderDay` always did.
