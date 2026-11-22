import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const buttonMeta: ComponentMeta = {
  slug: 'button',
  name: 'Button',
  category: 'core',
  summary: 'Primary action control. `primary` for navigation-level commitment, `accent` for the one conversion action on a screen.',
  props: [
    R('variant', "'primary' | 'accent' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'error'", 'Visual role. One `accent` per screen; the semantic fills only when the colour IS the message.', "'primary'"),
    R('size', "'sm' | 'md' | 'lg' | 'xl'", 'Control height. lg/xl are the mobile default (≥44px tap target).', "'md'"),
    R('fullWidth', 'boolean', 'Stretches to 100% of the container.', 'false'),
    R('loading', 'boolean', 'Shows a spinner and blocks interaction.', 'false'),
    R('disabled', 'boolean', 'Disabled fill and text, not-allowed cursor.', 'false'),
    R('iconLeft / iconRight', 'React.ReactNode', 'A Lucide icon passed as a React node.'),
  ],
  code: `<Button variant="accent" size="lg" iconLeft={<Check size={18} />}>
  Confirm booking
</Button>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: '`primary` is the default, for navigation-level commitment. `accent` marks the one conversion action on the screen; `secondary` is the supporting action next to it.',
      code: `<Button>Save</Button>
<Button variant="accent">Confirm booking</Button>
<Button variant="secondary">Back</Button>`,
    },
    {
      id: 'variants',
      title: 'Variants',
      description: 'Role variants: `ghost` for tertiary actions in bars; `link` only for inline navigation inside a run of text.',
      code: `<Button variant="primary">Primary</Button>
<Button variant="accent">Accent</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
    },
    {
      id: 'semantic',
      title: 'Semantic fills',
      description: 'Use `success` · `warning` · `error` only when the button colour IS the message, a destructive confirm, an approve step. Same words as `Badge` / `Alert` / `Toast`. There is no `info` fill: in Sereno that is the brand indigo, i.e. `primary`.',
      code: `<Button variant="success" iconLeft={<Check size={16} />}>Approve</Button>
<Button variant="warning">Review flags</Button>
<Button variant="error" iconLeft={<Trash2 size={16} />}>Delete account</Button>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm` and `md` on desktop; `lg` and `xl` are the mobile default; they guarantee the 44px tap target.',
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">XL</Button>`,
    },
    {
      id: 'with-icon',
      title: 'With icon',
      description: 'Pass any React node in `iconLeft` / `iconRight`. Use `lucide-react` icons at a `size` that matches the text (16 in `sm`/`md`, 18 in `lg`).',
      code: `<Button iconLeft={<Plus size={16} />}>New service</Button>
<Button variant="secondary" iconRight={<ChevronRight size={16} />}>
  Next
</Button>`,
    },
    {
      id: 'states',
      title: 'Loading and disabled',
      description: '`loading` swaps the left icon for a spinner and blocks clicks, use it on async actions. `disabled` uses its own fill and text (never just opacity).',
      code: `<Button loading>Sending</Button>
<Button disabled>Unavailable</Button>`,
    },
    {
      id: 'full-width',
      title: 'Full width',
      description: '`fullWidth` stretches the button to 100% of its container, used by the fixed footer actions on mobile.',
      code: `<Button variant="accent" size="lg" fullWidth>
  Confirm booking
</Button>`,
    },
  ],
  guidelines: {
    do: [
      'Use a single `accent` action per screen, the main conversion ("Confirm booking", "Subscribe now").',
      'Sentence-case label, verb in the infinitive: "Confirm booking", "Add service".',
      '`lg` or `xl` on mobile and in fixed footer actions.',
      'Turn on `loading` for async actions; it blocks the double click and communicates progress.',
    ],
    dont: [
      'Two `accent` buttons competing on the same screen.',
      '`ghost` on a tinted surface (the grey hover looks muddy), use `secondary`.',
      'All-caps, a period, or "!" in the label.',
      '`link` for the primary action; it is only for inline navigation inside text.',
      'Scattering `success`/`warning`/`error` fills. Most buttons carry role (`primary`/`accent`/`secondary`); a semantic fill is only for the case where the colour itself is the warning, a destructive confirm, an approve step.',
    ],
  },
};
