import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const datePickerMeta: ComponentMeta = {
  slug: 'date-picker',
  name: 'DatePicker',
  category: 'forms',
  summary: 'A single date, no time, no slots; that’s `DateTimePicker`. A text-field-styled trigger opens the same calendar grid in a popover.',
  props: [
    R('label / hint / error / required', 'string / boolean', 'Same label contract as Input, including the `aria-invalid` / `aria-describedby` wiring on the trigger. `required` draws the asterisk only: the trigger is a button, which cannot carry `aria-required`.'),
    R('placeholder', 'string', 'Trigger text with no value.', "'Selecionar data'"),
    R('size', "'sm' | 'md' | 'lg'", '', "'md'"),
    R('value / defaultValue', 'string', 'ISO `"YYYY-MM-DD"`: controlled / uncontrolled, same contract as every other field.'),
    R('onChange', '(value: string) => void', 'Fires with the new ISO date on pick.'),
    R('min / max', 'string', 'ISO date bounds. Every day outside the range is struck through and unclickable, and the calendar cannot be navigated outside it: the previous-month (next-month) arrow disables in the first (last) month, PageUp / PageDown and the arrow keys stop at the edge, and the month / year popover disables every month and year out of range. A value or a starting month outside the range opens on the nearest month inside it.'),
    R('onMonthChange', '(year, month) => void', 'Fires when the month on screen changes (the arrows, or the month / year popover), with the 0-indexed month. Not when the popover opens: it opens on the month of the value, or on the current one. Refresh `dayDots` / `renderDay` here.'),
    R('dayDots', 'number[] | Record<number, { tone?, label? }>', 'Dots under the days, the same as `DateTimePicker`\'s: day numbers of the month on screen (`[3, 17]`), or an object keyed by day for a per-dot `tone` or `label`. The dot turns to the primary foreground on the selected day.'),
    R('renderDay', '(day, { selected, today, unavailable }) => ReactNode', 'Content under each day number, the same as `DateTimePicker`\'s. When this or `dayDots` is set, the day cells grow taller to hold it.'),
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
  code: `<DatePicker
  label="Date of birth"
  value={date}
  onChange={setDate}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        'Value is a plain ISO `"YYYY-MM-DD"` string, same shape `<input type="date">` uses, drops into a form the same way, themed instead of the browser\'s own date picker. A clear (×) button appears once a value is set. Shown here with `locale="en"`: the real product always renders pt-BR.',
      code: `<DatePicker label="Date of birth" value={date} onChange={setDate} locale="en" />`,
    },
    {
      id: 'range',
      title: 'Bounded range',
      description:
        '`min` / `max` strike every day outside the range (unclickable) and stop the calendar from navigating past them, so there is no month to wander into where nothing can be picked.',
      code: `<DatePicker
  label="Schedule for"
  hint="Only the next 30 days."
  min={today}
  max={in30Days}
  value={date}
  onChange={setDate}
  locale="en"
/>`,
    },
    {
      id: 'markers',
      title: 'Marking days',
      description:
        'The same `dayDots` as `DateTimePicker`: a dot under the days where something happens, kept visible on the selected day. The popover opens on the month of the value (or the current month), and `onMonthChange` tells you when it moves, to refresh the days.',
      code: `<DatePicker
  label="Reschedule to"
  value={date}
  onChange={setDate}
  dayDots={dots}
  dayDotLabel="has bookings"
  onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
  locale="en"
/>`,
    },
  ],
  guidelines: {
    do: [
      'A single date with no time component, birth date, a deadline, a one-off blocked day.',
      '`min` / `max` instead of validating the picked date after the fact.',
    ],
    dont: [
      'A date **and** a time in the same control; that’s `DateTimePicker`.',
      'Multiple dates or a range picker: not this component\'s job.',
      'Setting `locale="en"` in the real product. Sereno is pt-BR only; the prop exists for this docs site.',
    ],
  },
};
