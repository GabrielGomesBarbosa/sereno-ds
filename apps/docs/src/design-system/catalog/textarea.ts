import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const textareaMeta: ComponentMeta = {
  slug: 'textarea',
  name: 'Textarea',
  category: 'forms',
  summary: 'Multi-line field for booking notes and service descriptions.',
  props: [
    R('label / hint / error / required', 'string / string / string / boolean', 'Same label contract as Input, including the `aria-invalid` / `aria-describedby` / `aria-required` wiring and a merged `aria-describedby`.'),
    R('rows', 'number', 'Initial height in lines.', '4'),
    R('showCount', 'boolean', 'Show a `n / max` character counter on the hint row. Implied when `maxLength` is set. It counts the field\'s real value, also when a form library or code writes it (`reset()`, `setValue()`, `el.value = …`).', 'false'),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<Textarea label="Any notes?" rows={3} hint="Optional." />`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Same label/hint/error contract as `Input`. `rows` sets the initial height; the field is vertically resizable.',
      code: `<Textarea label="Any notes?" rows={3} hint="Optional." />`,
    },
    {
      id: 'count',
      title: 'Character counter',
      description: 'Set `maxLength` (or pass `showCount`) for a `n / max` counter on the hint row, handy for notes with a ceiling. It turns red at the limit. It counts the field\'s real value, so a saved note put in by react-hook-form\'s `reset()` counts too.',
      code: `<Textarea label="Any notes?" rows={3} maxLength={140} hint="Optional." />`,
    },
    {
      id: 'error',
      title: 'With error',
      description: '`error` replaces `hint` and turns the border red.',
      code: `<Textarea
  label="Service description"
  rows={3}
  error="The description needs at least 20 characters."
/>`,
    },
  ],
  guidelines: {
    do: ['Use for booking notes and service descriptions.', 'Set `rows` to the expected length (3 for notes).'],
    dont: ['A textarea for a short one-line value, use `Input`.'],
  },
};
