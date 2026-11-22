import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const calendarLegendMeta: ComponentMeta = {
  slug: 'calendar-legend',
  name: 'CalendarLegend',
  category: 'forms',
  summary: 'The footer that explains what a calendar marks: the dots under the days and the ring around today. Draws the same dot and the same ring the calendar does.',
  props: [
    R('items', '{ label: string; dot?: boolean | tone; outline?: boolean }[]', 'One entry per thing the calendar marks. `dot` draws the filled dot of `dayDots` (`true` is the primary color; a tone picks `success`, `warning`, `error` or `info`). `outline` draws the thin ring around today; with `dot` as well, the dot sits inside the ring. An item with neither is just its label.'),
    R('className / style / …', '-', 'Passed to the list (a `ul`). Your `style` comes last. It centers and wraps, so it fits a narrow screen.'),
  ],
  code: `<CalendarLegend
  items={[
    { label: 'Has bookings', dot: true },
    { label: 'Today', outline: true },
  ]}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'A dot for each tone of `dayDots` you use, and the ring for today. The swatches are hidden from a screen reader, which gets the labels as a list.',
      code: `<CalendarLegend
  items={[
    { label: 'Has bookings', dot: true },
    { label: 'Pending', dot: 'warning' },
    { label: 'Today', outline: true },
  ]}
/>`,
    },
    {
      id: 'with-calendar',
      title: 'Under a calendar',
      description: 'Put it right under the `DateTimePicker`, with one item per thing the calendar marks, so the same marks are explained the same way on every screen.',
      code: `<DateTimePicker dayDots={dots} onMonthChange={refresh} selectedDate={day} onSelectDate={setDay} />
<CalendarLegend
  items={[
    { label: 'Has bookings', dot: true },
    { label: 'Pending', dot: 'warning' },
    { label: 'Today', outline: true },
  ]}
/>`,
    },
  ],
  guidelines: {
    do: [
      'A legend for every calendar that marks anything, with one item per mark.',
      'The same tones in the legend as in `dayDots`, so a dot means the same thing in both.',
    ],
    dont: [
      'Explaining a mark the calendar does not draw: an item for a ring or a color that is not on screen.',
      'A legend with more than three or four items: too many marks is the calendar\'s problem, not the legend\'s.',
    ],
  },
};
