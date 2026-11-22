import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const dividerMeta: ComponentMeta = {
  slug: 'divider',
  name: 'Divider',
  category: 'core',
  summary: 'A horizontal line between two stretches of content. `default` is the subtle hairline; `strong` is a firmer one for a page background.',
  props: [
    R('variant', "'default' | 'strong'", '`default` is `--border-subtle`, the hairline of a list or a card. `strong` is `--border-strong`: firmer, for the page background where the subtle one nearly disappears. Firmer, not high contrast: `strong` is 1.63:1 against a card and 1.38:1 against the page in the light theme (1.83:1 and 2.03:1 in the dark one), which is right for a separator and short of what the edge of a control would need.', "'default'"),
    R('decorative', 'boolean', 'Hides the line from a screen reader (`role="none"`). For the lines between rows that repeat, so the reader does not announce a separator after every one. Without it the line is a separator, which is right between two sections.', 'false'),
    R('className / style / …', '-', 'Passed to the `hr`. Your `style` comes last. It has no margin of its own: the space around it is yours (a `gap` on the parent, or a `style`).'),
  ],
  code: `<Divider />
<Divider variant="strong" />`,
  examples: [
    {
      id: 'basic',
      title: 'Default and strong',
      description: 'Inside a card the subtle hairline is enough. `strong` is the same line, firmer. Spacing is yours: here a `gap` on the parent.',
      code: `<Card>
  <p>Weekly summary</p>
  <Divider />
  <p>Upcoming bookings</p>
  <Divider variant="strong" />
  <p>Open slots</p>
</Card>`,
    },
    {
      id: 'on-page',
      title: 'On the page background',
      description: 'Outside a card, on the page itself, the subtle hairline is about the color of the background: in the light theme it is even a shade lighter than the page, so the first line below does not show at all. The `strong` one does show, as a quiet line. That is the case `strong` is for.',
      code: `<div style={{ background: 'var(--bg-canvas)', padding: 'var(--space-5)' }}>
  <Divider />
  <Divider variant="strong" />
</div>`,
    },
    {
      id: 'decorative',
      title: 'Between repeated rows',
      description: 'Rows of a list repeat, and a screen reader would announce a separator after every one. `decorative` takes the line out of what it reads; the rows are the content.',
      code: `<Divider decorative />`,
    },
  ],
  guidelines: {
    do: [
      '`default` inside cards and lists; `strong` on the page background.',
      '`decorative` between rows that repeat.',
      'Space around it with a `gap` on the parent or a `style`: it has no margin of its own.',
    ],
    dont: [
      'Expecting `strong` to be high contrast: it is firmer, not 3:1.',
      'A divider between every field of a form: let the spacing separate them.',
      'A divider as the edge of a control: that is a border, with the contrast a control needs.',
    ],
  },
};
