---
"@sereno-ds/ui": minor
---

New `DateRangePicker`: pick a period, a start and an end date (#162).

A text-field-styled trigger shows the range and opens the same calendar `DatePicker` and `DateTimePicker` use, with the range drawn on it: the two ends picked, the days between as a continuous band, and, once the first end is picked, the stretch to the day under the pointer **or the keyboard cursor**, so the interval is seen growing before the second click.

```tsx
<DateRangePicker label="Report period" value={range} onChange={setRange} />
// value: { start: '2026-06-10', end: '2026-06-18' }   no value: { start: '', end: '' }
```

- **Value:** `{ start, end }`, two ISO `YYYY-MM-DD` dates (`DateRange` is exported), `{ start: '', end: '' }` for none. `value` / `defaultValue` / `onChange` like the other fields. `onChange` fires with a **complete** range (`start` already the earlier of the two) or with the empty one on clear, never with half of a range.
- **Selection:** the first click sets the start and the calendar stays open; the second sets the end and closes it. The two swap when the second is earlier, and a second click on the same day is a period of one day. Escape closes without committing; the next open starts a new pick. The pick survives a month change, so a range may span months or years.
- **Same as `DatePicker`:** `min` / `max`, `onMonthChange`, `dayDots`, `renderDay`, `locale` (`pt-BR` default), `ref.focus()`, and the same placement (inline, or portalled out of a Dialog). In `renderDay`, `selected` is true on both ends.
- **Text:** the field shows each end like `DatePicker` does, joined with the separator the locale itself uses for a range. A line inside the calendar says what to pick next ("Select the start date" / "Select the end date") as a polite live region. The start, the end and the days between also say so to a screen reader, since the band is only a picture.
- **Windows High Contrast:** the two ends are picked days with the heavy border; the days between are told by a line above and a line below (dashed for the stretch of a pick in progress), never by a fill, because the browser draws a box behind the letters in that mode.

`@sereno-ds/ui/styles.css` has the new rules (the band is a `::before` on the day button, with `data-in-range`, `data-range-edge="start" | "end"`, `data-preview` and `data-preview-end` for the stylesheet to read), so it is required for the band, as the rest of the calendar already was. Nothing changes for `DatePicker` or `DateTimePicker`: the calendar only draws a range when it is given one.
