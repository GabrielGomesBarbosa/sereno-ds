import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const badgeMeta: ComponentMeta = {
  slug: 'badge',
  name: 'Badge',
  category: 'core',
  summary: 'Small status pill. Semantic `tone`: the same five tones as Alert and Toast.',
  props: [
    R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'Semantic tone. `neutral` renders as an outlined chip.', "'neutral'"),
    R('size', "'sm' | 'md'", 'Pill size.', "'md'"),
    R('dot', 'boolean', 'Leading status dot. Keep it on for lifecycle states.', 'true'),
    R('pulse', 'boolean', 'A soft ring pulses out of the dot, for a state that is live ("Open now", "Online"). Only with `dot`. It does not show when the user asks for reduced motion. The dot is drawn by `StatusDot`, which you can also use on its own.', 'false'),
  ],
  code: `<Badge tone="success">Confirmed</Badge>`,
  examples: [
    {
      id: 'tones',
      title: 'Tones',
      description: 'The label is domain copy ("Confirmed"); the `tone` is the shared semantic word. Booking lifecycle maps as: confirmed → `success`, pending → `warning`, cancelled → `error`, completed → `neutral`.',
      code: `<Badge tone="success">Confirmed</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="error">Cancelled</Badge>
<Badge tone="info">Online</Badge>
<Badge tone="neutral">Completed</Badge>`,
    },
    {
      id: 'labels',
      title: 'As a label',
      description: 'Drop the dot with `dot={false}` for a plain label. `neutral` is an outlined chip; it reads on any background, including a tinted one.',
      code: `<Badge tone="info" dot={false}>Online</Badge>
<Badge tone="neutral" dot={false}>São Paulo</Badge>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm` (11px) for dense lists; `md` (12px) is the default.',
      code: `<Badge tone="success" size="sm">Confirmed</Badge>
<Badge tone="success" size="md">Confirmed</Badge>`,
    },
    {
      id: 'pulse',
      title: 'Live state',
      description:
        '`pulse` makes a soft ring grow and fade out of the dot, for a state that is happening right now: "Open now", "Closing soon", "Online". The text still carries the meaning, the ring is only attention. It is off by default, keep it for one or two badges on a screen (never a list), and it is gone for anyone who asks for reduced motion.',
      code: `<Badge tone="success" pulse>Open now</Badge>
<Badge tone="warning" pulse>Closing soon</Badge>
<Badge tone="info" size="sm" pulse>Online</Badge>`,
    },
  ],
  guidelines: {
    do: [
      'Use only the five semantic tones: never invent a sixth.',
      'Always with a word: a `Badge` never signals status by colour alone.',
      'Keep `dot` on for lifecycle states.',
      '`pulse` only for a state that is live right now, on one or two badges.',
    ],
    dont: [
      '`pulse` on every badge of a list: when everything moves, nothing is live.',
      'A `Badge` as a button; it is not clickable.',
      'The old lifecycle names (`confirmed`, `pending`…) as `tone`; those are gone; use the semantic tones.',
    ],
  },
};
