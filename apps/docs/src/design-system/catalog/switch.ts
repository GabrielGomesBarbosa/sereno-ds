import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const switchMeta: ComponentMeta = {
  slug: 'switch',
  name: 'Switch',
  category: 'forms',
  summary: 'Instant-apply toggle for settings rows. Never inside a form that has a "Save" button.',
  props: [
    R('label', 'string', 'Label on the left.'),
    R('description', 'string', 'Secondary line below the label.'),
    R('checked', 'boolean', 'Toggle state.', 'false'),
    R('disabled', 'boolean', 'Dims the row, not-allowed cursor, drops out of the tab order.', 'false'),
    R('size', "'sm' | 'md'", 'Track size: `sm` for dense settings lists. Matches `Checkbox` / `Radio`.', "'md'"),
    R('onChange', '(e: { target: { checked: boolean } }) => void', 'Fired on toggle (click, or Space / Enter when focused).'),
  ],
  code: `<Switch
  label="Aceitar agendamentos online"
  checked={on}
  onChange={(e) => setOn(e.target.checked)}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: '`onChange` receives `{ target: { checked } }`: mirrors an input event without being one. Applies immediately, no "Save". Focusable; Space / Enter toggle.',
      code: `<Switch label="24h reminder" checked={a} onChange={(e) => setA(e.target.checked)} />
<Switch
  label="Daily email digest"
  description="Sent at 7am with the day's agenda."
  checked={b}
  onChange={(e) => setB(e.target.checked)}
/>`,
    },
    {
      id: 'settings',
      title: 'Settings list',
      description: 'The pattern Switch is for: a stack of independent, instant-apply rows, each with a `description` saying what flipping it does.',
      code: `<Switch label="Accept online bookings" description="Your public link takes new appointments." checked={s.online} onChange={set('online')} />
<Switch label="WhatsApp notifications" description="A message on every new booking or cancellation." checked={s.whats} onChange={set('whats')} />
<Switch label="Client reminders" description="Sent to the client 24h and 1h before." checked={s.reminders} onChange={set('reminders')} />`,
    },
    {
      id: 'states',
      title: 'Disabled',
      description: '`disabled` dims the row and removes it from the tab order, off or on.',
      code: `<Switch label="Paid-plan feature (off)" disabled />
<Switch label="Locked on" checked disabled />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`size="sm"` (36×22 track) for dense settings panels; `md` (44×26) is the default.',
      code: `<Switch size="sm" label="Small track" checked={a} onChange={…} />
<Switch label="Medium track (default)" checked={b} onChange={…} />`,
    },
  ],
  guidelines: {
    do: [
      'Settings rows that apply immediately (reminders, accepting bookings, theme).',
      'A `description` on every row: the label alone rarely says what "on" does.',
      '`size="sm"` in a long settings panel.',
    ],
    dont: [
      'Inside a form that only saves on "Save", use `Checkbox`.',
      'For a choice between two things; that is `Radio`, not on/off.',
    ],
  },
};
