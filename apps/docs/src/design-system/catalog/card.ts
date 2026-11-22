import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const cardMeta: ComponentMeta = {
  slug: 'card',
  name: 'Card',
  category: 'core',
  summary: 'Neutral surface: a crisp 1px ring + an optional soft lift + 14px radius. The base of every list row and panel.',
  props: [
    R('padding', "'none' | 'sm' | 'md' | 'lg'", 'Inner spacing.', "'md'"),
    R('elevation', "'none' | 'sm' | 'md' | 'lg'", 'Drop-shadow under the ring: `none` = ring only, `sm` a whisper. Never stack two.', "'sm'"),
    R('interactive', 'boolean', 'Adds hover lift, press scale and pointer cursor.', 'false'),
    R('selected', 'boolean', 'Brand ring for a chosen option.', 'false'),
  ],
  code: `<Card interactive selected={picked} onClick={() => setPicked(true)}>
  Card content
</Card>`,
  examples: [
    {
      id: 'padding',
      title: 'Padding',
      description: '`none` for list rows that own their own spacing; `sm`/`md`/`lg` for panels.',
      code: `<Card padding="sm">
  <Badge tone="neutral" size="sm">padding sm</Badge>
  <h4>Weekly summary</h4>
  <p>You saw 18 clients this week…</p>
</Card>
<Card padding="md">…</Card>
<Card padding="lg">…</Card>`,
    },
    {
      id: 'elevation',
      title: 'Elevation',
      description: 'Short, diffuse shadows. **Never stack two levels**: a card inside a card drops to `elevation="none"`.',
      code: `<Card elevation="none">…</Card>
<Card elevation="sm">…</Card>
<Card elevation="md">…</Card>
<Card elevation="lg">…</Card>`,
    },
    {
      id: 'interactive',
      title: 'Interactive and selected',
      description: '`interactive` adds hover lift + press scale. `selected` marks the choice with a brand ring on all four sides, never a left-edge stripe.',
      code: `<Card interactive selected={plan === 'year'} onClick={() => setPlan('year')}>
  <h4>Yearly</h4>
  <p>Billed once a year, two months free.</p>
  <strong>R$ 39 / mo</strong>
</Card>`,
    },
  ],
  guidelines: {
    do: [
      'A card inside a card → the inner one goes to `elevation="none"`.',
      'Use `interactive` only when the whole card is clickable.',
      'Selection = `selected` (border on all 4 sides + ring).',
    ],
    dont: ['Stacking two shadows.', 'A coloured left border to indicate selection.'],
  },
};
