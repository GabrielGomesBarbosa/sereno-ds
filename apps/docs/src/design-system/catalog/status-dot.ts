import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const statusDotMeta: ComponentMeta = {
  slug: 'status-dot',
  name: 'StatusDot',
  category: 'core',
  summary: 'A small colored dot for a state, with an optional pulsing ring for one that is live. The same dot `Badge` draws before its label, for the places that have no pill around it.',
  props: [
    R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'The same words `Badge`, `Alert` and `Toast` use. `neutral` is the muted grey.', "'neutral'"),
    R('size', "'sm' | 'md'", '`sm` is 5px and `md` is 6px: the two dot sizes of `Badge`.', "'md'"),
    R('pulse', 'boolean', 'A translucent ring grows and fades around the dot, over and over. For a live state (open now, online), on one or two dots and never on a list. It does not show when the user asks for reduced motion.', 'false'),
    R('label', 'string', 'What a screen reader says for the dot (it becomes an image with that name). Without it the dot is decorative: put the meaning in the text next to it.'),
    R('className / style / …', '-', 'Passed to the dot (a `span`). Your `style` comes last.'),
  ],
  code: `<span>
  <StatusDot tone="success" pulse /> Open now
</span>`,
  examples: [
    {
      id: 'tones',
      title: 'Tones',
      description: 'The five tones, each next to the word that says what it means. A dot alone never carries the status: the text does.',
      code: `<StatusDot tone="success" /> Open
<StatusDot tone="warning" /> Closing soon
<StatusDot tone="error" /> Closed
<StatusDot tone="info" /> On a call
<StatusDot tone="neutral" /> Unknown`,
    },
    {
      id: 'pulse',
      title: 'Pulsing',
      description:
        '`pulse` adds a ring that grows and fades behind the dot, for a state that is live right now. Keep it to one or two on a screen. When the dot stands alone after a name, give it a `label` and a screen reader says "Ana Ramos, Online"; when a word beside it already says the status, leave the `label` out so it is not read twice.',
      code: `Ana Ramos <StatusDot tone="success" pulse label="Online" />
<StatusDot tone="warning" pulse /> Closing soon
<StatusDot tone="error" pulse /> Needs attention`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm` (5px) and `md` (6px), the sizes `Badge` uses. Next to body text, `md`.',
      code: `<StatusDot tone="success" size="sm" />
<StatusDot tone="success" size="md" />`,
    },
  ],
  guidelines: {
    do: [
      'A word next to the dot (or a `label`): the color alone is not the status.',
      '`pulse` only for a state that is live, on one or two dots.',
      'A `Badge` when the state is a label in its own right; a `StatusDot` when it sits beside a name or a title.',
    ],
    dont: [
      'A dot as the only sign of a state: a screen reader and a color-blind user get nothing.',
      '`pulse` on every row of a list: when everything moves, nothing is live.',
      'A dot as a button: it is not clickable.',
    ],
  },
};
