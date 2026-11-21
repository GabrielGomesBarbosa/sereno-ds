import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const iconButtonMeta: ComponentMeta = {
  slug: 'icon-button',
  name: 'IconButton',
  category: 'core',
  summary: 'Square icon-only control for bars, card corners and top bars. Always pass `label`.',
  props: [
    R('label', 'string', 'Accessible name: becomes aria-label and title. Required.'),
    R('variant', "'ghost' | 'secondary' | 'primary' | 'success' | 'warning' | 'error'", 'Visual role. Semantic fills follow the same words as `Badge` / `Alert`.', "'ghost'"),
    R('size', "'sm' | 'md' | 'lg'", 'Square side (32 / 40 / 48px).', "'md'"),
    R('children', 'React.ReactNode', 'The icon (Lucide 20px, stroke 1.75).'),
  ],
  code: `<IconButton label="Back">
  <ChevronLeft size={18} />
</IconButton>`,
  examples: [
    {
      id: 'variants',
      title: 'Variants',
      description: '`ghost` is the default (bars and card corners). `secondary` when you need a visible border, including on a tinted surface. `primary` for the standout action in a bar.',
      code: `<IconButton label="Back"><ChevronLeft size={18} /></IconButton>
<IconButton label="Search" variant="secondary"><Search size={18} /></IconButton>
<IconButton label="New" variant="primary"><Plus size={18} /></IconButton>`,
    },
    {
      id: 'semantic',
      title: 'Semantic fills',
      description: '`success` · `warning` · `error`: the same words as `Button` and `Badge`. Only when the colour is the message (a destructive control in a card corner). No `info`: that is `primary`.',
      code: `<IconButton label="Approve" variant="success"><Check size={18} /></IconButton>
<IconButton label="Flag" variant="warning"><Flag size={18} /></IconButton>
<IconButton label="Delete" variant="error"><Trash2 size={18} /></IconButton>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '32 / 40 / 48px sides. Even `sm` keeps an adequate tap target thanks to padding.',
      code: `<IconButton label="Previous" size="sm"><ChevronLeft size={16} /></IconButton>
<IconButton label="Previous" size="md"><ChevronLeft size={18} /></IconButton>
<IconButton label="Previous" size="lg"><ChevronLeft size={20} /></IconButton>`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Disabled fill and colour, `not-allowed` cursor: applies to every variant.',
      code: `<IconButton label="Back" disabled><ChevronLeft size={18} /></IconButton>
<IconButton label="New" variant="primary" disabled><Plus size={18} /></IconButton>`,
    },
  ],
  guidelines: {
    do: [
      'Always pass `label`; it is the `aria-label` and the `title`.',
      'Use `variant="secondary"` when the button sits on a tinted surface (the grey `ghost` hover looks muddy).',
      '`lucide-react` icon with `strokeWidth={1.75}`, 18–20px.',
      'A semantic fill (`success`/`warning`/`error`) only when the colour itself carries the meaning.',
    ],
    dont: [
      'An action that has text: use `Button` with `iconLeft`.',
      'An icon carrying meaning alone in a status, `Badge` always has a word.',
      'A semantic fill for a plain toolbar action, `ghost` · `secondary` · `primary` cover those.',
    ],
  },
};
