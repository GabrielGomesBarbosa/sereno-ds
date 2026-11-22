import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const statCardMeta: ComponentMeta = {
  slug: 'stat-card',
  name: 'StatCard',
  category: 'core',
  summary: 'A figure on a dashboard: a small label, the number big, one line of context and, if it helps, a thin "how full" bar. Built on `Card`, so it follows the theme and the rest of the surface.',
  props: [
    R('label', 'string', 'The small line above the number: what is being counted.'),
    R('value', 'ReactNode', 'The number, or a short text. Any node, so a formatted price or a `Badge` fits. Shown large, in tabular figures, so a row of cards lines its digits up.'),
    R('hint', 'string', 'One line of context under the number ("3 confirmed", "vs last week").'),
    R('tone', "'default' | 'neutral' | 'success' | 'warning' | 'error' | 'info'", '`default` is the plain card. `neutral` is a quieter one (a tinted fill, no shadow) for figures that are background. The four status tones are the same names `Badge`, `Alert` and `Toast` use: the card gets a ring in the tone\'s color and the label and number take its text color. The hint stays secondary, so the tone does not tint every line.', "'default'"),
    R('progress', '{ percent: number; label?: string }', 'A thin bar under the number, for "how full" (a day\'s grid, a quota). `percent` is 0 to 100; anything outside is held to it. `label` names the bar for a screen reader, and without it the bar takes the card\'s `label`. The fill is the primary color, or the tone\'s text color in a status tone.'),
    R('loading', 'boolean', 'The data has not arrived: the label, the number and the hint become placeholders that take the same room as the real text, so nothing jumps when it arrives. It mirrors the props you pass, so give `hint` and `progress` while loading too if the loaded card will have them. Marks the card `aria-busy`.', 'false'),
    R('className / style / …', '-', 'Passed to the `Card` (it is a `div`). Your `style` comes last.'),
  ],
  code: `<StatCard
  label="Appointments today"
  value={12}
  hint="3 confirmed, 2 pending"
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Label, number, hint. Put three or four in a grid at the top of a screen: each card is one figure.',
      code: `<StatCard label="Today" value={12} hint="3 confirmed, 2 pending" />
<StatCard label="This week" value={48} hint="6 more than last week" />
<StatCard label="Revenue" value="R$ 4.320" hint="Closed this month" />`,
    },
    {
      id: 'tones',
      title: 'Tones',
      description:
        'The status tones draw a ring in the tone and color the label and the number with its text color (all of them pass AA on the card, in both themes). Use one when the number *means* something: pending piling up is `warning`, a failure count above zero is `error`. `neutral` is for a figure that is only background. Keep most cards `default`: when everything is highlighted, nothing is.',
      code: `<StatCard label="Default" value={12} hint="Plain card" />
<StatCard tone="neutral" label="Neutral" value={12} hint="Quieter, for background figures" />
<StatCard tone="success" label="Confirmed" value={9} hint="All set" />
<StatCard tone="warning" label="Pending" value={5} hint="Waiting for a reply" />
<StatCard tone="error" label="Cancelled" value={2} hint="This week" />
<StatCard tone="info" label="New clients" value={7} hint="Joined this month" />`,
    },
    {
      id: 'progress',
      title: 'With a progress bar',
      description:
        '`progress` draws a thin bar for how full something is, here the day\'s grid. It is a real `progressbar` (`aria-valuenow`), named by its own `label` or, without one, by the card\'s. It takes the tone\'s color too.',
      code: `<StatCard
  label="Grid occupancy"
  value="75%"
  hint="6 of 8 slots taken"
  progress={{ percent: 75, label: 'Occupied slots' }}
/>
<StatCard
  tone="warning"
  label="Grid occupancy"
  value="95%"
  hint="Almost full"
  progress={{ percent: 95 }}
/>`,
    },
    {
      id: 'loading',
      title: 'Loading',
      description:
        '`loading` swaps the label, the number and the hint for placeholders that hold the same height as the real lines, so the grid does not move when the data arrives. Pass the same props while loading (a placeholder `hint`, the `progress`) so the card has the same lines before and after. Toggle it to see the card keep its size.',
      code: `<StatCard
  loading={isLoading}
  label="Appointments today"
  value={data?.today ?? 0}
  hint="3 confirmed, 2 pending"
/>`,
    },
  ],
  guidelines: {
    do: [
      'One figure per card, in a grid of three or four at the top of a screen.',
      'A `hint` that says what the number is made of or compared to ("3 confirmed", "vs last week").',
      'A status `tone` only when the number means something; the rest stay `default`.',
      'The same props while `loading`, so the card keeps its lines and nothing jumps.',
      'A `progress` bar only for a share of a whole (slots taken, quota used).',
    ],
    dont: [
      'Two figures in one card: that is two cards.',
      'A tone on every card: the one that matters stops standing out.',
      'A sentence in `value`: it is the big number, not the copy.',
      'A progress bar for something that is not a share of a whole.',
      'Colouring the card yourself: a status tone is the tone, and `style` is for layout.',
    ],
  },
};
