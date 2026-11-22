import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const dateTimePickerMeta: ComponentMeta = {
  slug: 'date-time-picker',
  name: 'DateTimePicker',
  category: 'forms',
  summary: 'Month calendar + available time slots: the heart of the public flow. Days and months render in pt-BR.',
  props: [
    R('year / month', 'number', 'The *initial* month (`month` is 0-indexed). The component then owns navigation: re-mount with a `key` to force a new start.'),
    R('selectedDate', 'number', 'Selected day.'),
    R(
      'times',
      '(string | { value, disabled, capacity, booked })[]',
      'Time-slot labels or objects. `disabled` hard-blocks it. `capacity`/`booked` show "booked de capacity vagas" and switch to a warning look once full, a full slot stays pickable (a deliberate overbook) unless also `disabled`.',
      '[]',
    ),
    R('selectedTime', 'string', 'Selected time (marked in turquoise).'),
    R('unavailable', 'number[]', 'Days with no availability: struck through and unclickable.'),
    R('min / max', 'string', 'ISO `"YYYY-MM-DD"` bounds, the same props `DatePicker` has. The calendar cannot be navigated outside them: the previous-month (next-month) arrow disables in the first (last) month, PageUp / PageDown and the arrow keys stop at the edge, and the month / year popover disables every month and year out of range. Days outside the range are struck through on their own, merged with `unavailable`, so you do not work out the past days yourself. A `year` / `month` that starts outside the range moves to the nearest month inside it, and `onMonthChange` reports that month at mount.'),
    R('onSelectDate / onSelectTime', '(v) => void', 'Selection callbacks.'),
    R('onMonthChange', '(year, month) => void', 'Fires on ‹ / › or the month/year popover, recompute `unavailable` / `renderDay` for the new month here. Also once at mount, and only then, when `min` / `max` moved the starting month.'),
    R('renderDay', '(day, { selected, today, unavailable }) => ReactNode', 'Content under each day number (a count, a note). Return `null` for nothing. Every cell grows to stay even: scope it yourself (e.g. future days only). The second argument is what the calendar already knows about the day, so you do not redo its logic: `selected` is true on the picked day (painted with the primary color, so content there needs `--interactive-primary-fg`), `today` on today, `unavailable` on a day that cannot be picked (listed in `unavailable`, or outside `min` / `max`). A `(day) =>` that ignores it keeps working.'),
    R('dayDots', 'number[] | Record<number, { tone?, label? }>', 'The days that get a dot under their number, for "something happens this day": `[3, 17]`, or an object keyed by day number when a dot needs its own `tone` (`brand`, `success`, `warning`, `error`, `info`) or `label`. The calendar places the dot and turns it to `--interactive-primary-fg` on the selected day, so it never vanishes into the fill. It fades on a day that cannot be picked. Day numbers of the month on screen, like `unavailable`: refresh them in `onMonthChange`. Shares the slot under the number with `renderDay`, and grows the cells the same way.'),
    R('dayDotLabel', 'string', 'What a screen reader says for a dot with no `label` of its own, after the day number ("3, com agendamento"). A dot is only a shape, so name what it means here.', "'com marcador' / 'marked'"),
    R('timeLabel', 'string', 'Overrides the section heading above the slots.', 'locale-dependent'),
    R(
      'locale',
      "'pt-BR' | 'en'",
      "The real Sereno product always renders pt-BR, `'en'` exists for an English-speaking docs/demo audience, not for the product itself.",
      "'pt-BR'",
    ),
  ],
  code: `<DateTimePicker
  year={2026}
  month={7}
  unavailable={[1, 2, 8, 9]}
  times={['09:00', '10:00', { value: '11:00', disabled: true }]}
  selectedDate={day}
  selectedTime={time}
  onSelectDate={setDay}
  onSelectTime={setTime}
/>`,
  examples: [
    {
      id: 'calendar',
      title: 'Calendar only',
      description:
        'Without `times`, it’s just the calendar. `month` (0-indexed) is only the *starting* view, the header navigates from there, and the grid stays 6 rows so nothing below it shifts. `onMonthChange` keeps `unavailable` in sync: here, the weekends of whatever month you land on. Today carries a thin ring (and `aria-current="date"`) in the month it belongs to, and none when it is the selected day. Shown here with `locale="en"`: the real product always renders pt-BR.',
      code: `const [off, setOff] = useState(() => weekendsOf(2026, 7));

<DateTimePicker
  year={2026}
  month={7}
  unavailable={off}
  onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
  selectedDate={day}
  onSelectDate={setDay}
  locale="en"
/>`,
    },
    {
      id: 'render-day',
      title: 'Content under each day',
      description:
        '`renderDay` drops a node under the day number, a booking count, a note. Return `null` for days with nothing. Scope it in the consumer (this one shows counts for **future** days only). Every cell grows so the grid stays even. Its second argument, `{ selected, today, unavailable }`, tells you what the calendar knows about the day. For a plain dot, use `dayDots` (next example) instead. Shown here with `locale="en"`: the real product always renders pt-BR.',
      code: `<DateTimePicker
  year={2026}
  month={7}
  onMonthChange={(y, m) => setCounts(bookingCountsOf(y, m))}
  renderDay={(day) =>
    counts[day] ? <span className="cal-count">{counts[day]}</span> : null
  }
  selectedDate={day}
  onSelectDate={setDay}
  locale="en"
/>`,
    },
    {
      id: 'day-dots',
      title: 'Dots, and a legend',
      description:
        '`dayDots` marks the days where something happens: a list of day numbers, or an object keyed by day when a dot needs its own `tone` or `label`. The calendar places the dot and turns it to the primary foreground on the selected day (here, the first marked day), so it stays visible on the fill. Refresh the days in `onMonthChange`, like `unavailable`. `CalendarLegend` under it says what the marks mean, and draws the same dot and the same ring the calendar does. This one starts on the current month, so today carries its ring. Shown here with `locale="en"`: the real product always renders pt-BR.',
      code: `const [dots, setDots] = useState(() => bookedDaysOf(year, month));

<DateTimePicker
  year={year}
  month={month}
  dayDots={dots}
  dayDotLabel="has bookings"
  onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
  selectedDate={day}
  onSelectDate={setDay}
  locale="en"
/>
<CalendarLegend
  items={[
    { label: 'Has bookings', dot: true },
    { label: 'Pending', dot: 'warning' },
    { label: 'Today', outline: true },
  ]}
/>`,
    },
    {
      id: 'with-times',
      title: 'With time slots',
      description:
        'Pass `times` as strings or `{ value, disabled }`. The selected time is the only turquoise (accent) element, the moment of decision in the flow. Shown here with `locale="en"`: the real product always renders pt-BR.',
      code: `<DateTimePicker
  year={2026}
  month={7}
  times={['09:00', '10:00', { value: '11:00', disabled: true }, '14:00', '15:00']}
  selectedDate={day}
  selectedTime={time}
  onSelectDate={setDay}
  onSelectTime={setTime}
  locale="en"
/>`,
    },
    {
      id: 'capacity',
      title: 'Capacity / overbooking',
      description:
        'Group sessions and classes hold more than one person. Set `capacity` and `booked` on a slot to show "booked of capacity spots"; once `booked` reaches `capacity` it switches to a warning look and reads "Full", but stays clickable, since a full slot is a deliberate overbook the caller can still allow. Add `disabled: true` on top for the actual hard "no". A plain slot mixed into the same list (no `capacity` at all) grows the same two-line layout with a generic "Available" filler instead of looking short next to its neighbors. Shown here with `locale="en"`: the real product always renders pt-BR ("Lotado", "de vagas"); this prop exists only for an English-speaking docs audience.',
      code: `<DateTimePicker
  year={2026}
  month={7}
  times={[
    { value: '09:00', capacity: 8, booked: 3 },
    { value: '10:00', capacity: 8, booked: 8 },
    { value: '11:00', capacity: 4, booked: 4, disabled: true },
    '14:00',
    { value: '15:00', capacity: 6, booked: 5 },
  ]}
  selectedDate={day}
  selectedTime={time}
  onSelectDate={setDay}
  onSelectTime={setTime}
  locale="en"
/>`,
    },
    {
      id: 'bounded',
      title: 'Limiting the navigation',
      description:
        '`min` / `max` stop the calendar from going past them: no walking back to a month that has nothing to book, and no popover jump to a year you cannot pick. Here `min` is the 10th of August and `max` the 20th of November: the arrow disables in each edge month, PageUp / PageDown stop, the popover greys out the months and years outside, and the days before the 10th are struck through with no `unavailable` at all. For a booking page, pass today as `min`.',
      code: `<DateTimePicker
  year={2026}
  month={7}
  min="2026-08-10"
  max="2026-11-20"
  selectedDate={day}
  onSelectDate={setDay}
  locale="en"
/>`,
    },
  ],
  guidelines: {
    do: [
      '`month` is 0-indexed and is only the *starting* view.',
      '`min` (today) on a public booking page instead of striking the past days by hand through `unavailable`: it also stops the navigation.',
      'Recompute `unavailable` / `dayDots` / `renderDay` inside `onMonthChange` so they track the visible month.',
      '`dayDots` for "something happens this day": the calendar keeps the dot visible on the selected day, so you do not.',
      'In `renderDay`, read the second argument (`selected`, `today`, `unavailable`) instead of working out the calendar\'s state yourself. On the `selected` day the fill is the primary color, so the content needs `--interactive-primary-fg`.',
      'A `CalendarLegend` under a calendar that marks anything, so the dot and the ring are explained the same way on every screen.',
      'Unavailable slots as `{ value, disabled: true }`; they keep their place in the grid.',
      'Let the accent time marker be the only one on the screen.',
      'A full (`booked >= capacity`) slot stays pickable unless you also set `disabled`; that is the real "no".',
    ],
    dont: [
      'Removing unavailable slots from the list: the grid "jumps".',
      'Putting `renderDay` counts or `dayDots` that mean "someone booked" in the public booking flow; that’s the pro’s private data.',
      'A dot hand-drawn in `renderDay` whose color you swap by guessing which day is selected: that is what `dayDots` does for you.',
      'Treating "full" as "disabled"; they mean different things; disable it explicitly when it truly can\'t be booked.',
      'Setting `locale="en"` in the real product. Sereno is pt-BR only; the prop exists for this docs site.',
    ],
  },
};
