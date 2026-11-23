import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const dateRangePickerMeta: ComponentMeta = {
  slug: 'date-range-picker',
  name: 'DateRangePicker',
  category: 'forms',
  summary: 'A period: a start and an end date, no time. A text-field-styled trigger opens the same calendar as `DatePicker`, with the range drawn on it.',
  props: [
    R('label / hint / error / required', 'string / boolean', 'Same label contract as Input, including the `aria-invalid` / `aria-describedby` wiring on the trigger. `required` draws the asterisk only: the trigger is a button, which cannot carry `aria-required`.'),
    R('placeholder', 'string', 'Trigger text with no value.', "'Selecionar período'"),
    R('size', "'sm' | 'md' | 'lg'", '', "'md'"),
    R('value / defaultValue', '{ start: string; end: string }', 'Two ISO `"YYYY-MM-DD"` dates: controlled / uncontrolled, same contract as every other field. `{ start: \'\', end: \'\' }` is no value. A range with only one end set shows as no value.'),
    R('onChange', '(value: { start: string; end: string }) => void', 'Fires with the **complete** range once the second end is picked (`start` already the earlier of the two), and with `{ start: \'\', end: \'\' }` on clear. Never with half of a range: the first click only starts the pick.'),
    R('min / max', 'string', 'ISO date bounds, the same as `DatePicker`\'s: every day outside is struck through and unclickable, and the calendar cannot be navigated outside it.'),
    R('onMonthChange', '(year, month) => void', 'Fires when the month on screen changes (the arrows, or the month / year popover), with the 0-indexed month. The popover opens on the month the range starts in, or on the current one. Refresh `dayDots` / `renderDay` here.'),
    R('dayDots', 'number[] | Record<number, { tone?, label? }>', 'Dots under the days, the same as `DatePicker`\'s: day numbers of the month on screen, or an object keyed by day for a per-dot `tone` or `label`. The dot turns to the primary foreground on both ends of the range.'),
    R('renderDay', '(day, { selected, today, unavailable }) => ReactNode', 'Content under each day number, the same as `DatePicker`\'s. `selected` is true on both ends of the range (and on the far end of a pick in progress): content under them must use the primary foreground. When this or `dayDots` is set, the day cells grow taller to hold it.'),
    R('dayDotLabel', 'string', 'What a screen reader says for a dot with no `label` of its own.', "'com marcador' / 'marked'"),
    R('disabled', 'boolean', '', 'false'),
    R('clearLabel', 'string', 'aria-label for the clear (×) button that appears once a value is set.', 'locale-dependent'),
    R(
      'locale',
      "'pt-BR' | 'en'",
      "The real Sereno product always renders pt-BR, `'en'` exists for an English-speaking docs/demo audience, not for the product itself.",
      "'pt-BR'",
    ),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<DateRangePicker
  label="Report period"
  value={range}
  onChange={setRange}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        'The first click sets the start and the calendar stays open; the second sets the end and closes it. The two swap when the second click is earlier, and a second click on the same day is a period of one day. While the first end is picked, the days from it to the pointer **or the keyboard cursor** are drawn as the interval, so it is seen growing before the second click. A line in the calendar says what to pick next, as a polite live region. The trigger shows the range with the separator of the locale; a clear (×) button appears once there is one. Shown with `locale="en"`: the real product always renders pt-BR.',
      code: `<DateRangePicker label="Report period" value={range} onChange={setRange} locale="en" />`,
    },
    {
      id: 'across-months',
      title: 'Across months',
      description:
        'A range may span months or years: the dates are ISO strings, so nothing special is needed. The pick in progress survives a month change, so the second end can be in another month than the first. The popover opens on the month the range starts in.',
      code: `<DateRangePicker
  label="Away"
  value={away}
  onChange={setAway}
  locale="en"
/>`,
    },
    {
      id: 'bounded',
      title: 'Bounded',
      description:
        '`min` / `max` strike every day outside the bounds (unclickable) and stop the calendar from navigating past them, exactly as in `DatePicker`. A struck day cannot start the pick or end it.',
      code: `<DateRangePicker
  label="Book between"
  hint="Only until the end of July."
  min={start}
  max={end}
  value={range}
  onChange={setRange}
  locale="en"
/>`,
    },
    {
      id: 'markers',
      title: 'Marking days',
      description:
        'The same `dayDots` as `DatePicker`: a dot under the days where something happens, kept visible on both ends of the range. `onMonthChange` tells you when the month moves, to refresh the days.',
      code: `<DateRangePicker
  label="Reschedule block"
  value={range}
  onChange={setRange}
  dayDots={dots}
  dayDotLabel="has bookings"
  onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
  locale="en"
/>`,
    },
    {
      id: 'in-dialog',
      title: 'Inside a Dialog',
      description:
        'The calendar is drawn over the dialog, not clipped by it, the same as `DatePicker`\'s. `Esc` closes the calendar first (without committing a half-picked range), and the dialog on the next press.',
      code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <Dialog.Body>
    <DateRangePicker label="Time off" value={range} onChange={setRange} />
  </Dialog.Body>
</Dialog>`,
    },
    {
      id: 'states',
      title: 'Error and disabled',
      description: 'The same label, hint and error contract as every field. `disabled` cannot be opened and hides the clear button.',
      code: `<DateRangePicker label="Period" error="Pick a period." />
<DateRangePicker label="Period" disabled defaultValue={range} />`,
    },
  ],
  guidelines: {
    do: [
      'A period with no time of day: a report range, a run of days off, a filter on a finance screen.',
      '`min` / `max` instead of validating the picked period after the fact.',
      'Treat `onChange` as the moment the period is complete: it never fires for a half-picked one.',
    ],
    dont: [
      'A single date: that is `DatePicker`. A date and a time: `DateTimePicker`.',
      'Presets such as "last 7 days": put your own buttons next to it and set the value.',
      'Setting `locale="en"` in the real product. Sereno is pt-BR only; the prop exists for this docs site.',
    ],
  },
};
