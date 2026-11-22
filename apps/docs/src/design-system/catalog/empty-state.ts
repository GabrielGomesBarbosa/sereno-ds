import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const emptyStateMeta: ComponentMeta = {
  slug: 'empty-state',
  name: 'EmptyState',
  category: 'feedback',
  summary: 'Friendly placeholder for empty agendas, client lists and search results.',
  props: [
    R('icon', 'React.ReactNode', 'A Lucide glyph in a brand-soft badge.'),
    R('title', 'string', 'Title (required).'),
    R('description', 'string', 'Supporting text.'),
    R('action', 'React.ReactNode', 'Primary action, usually a Button.'),
    R('compact', 'boolean', 'Reduces the vertical padding.', 'false'),
  ],
  code: `<EmptyState
  icon={<CalendarCheck size={22} />}
  title="No bookings today"
  description="A good time to review your services."
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'An `icon` in a brand-soft badge, a `title` (required) and a `description` that suggests the next step, no dwelling on the emptiness.',
      code: `<EmptyState
  icon={<CalendarCheck size={22} />}
  title="No bookings today"
  description="A good time to review your services."
/>`,
    },
    {
      id: 'with-action',
      title: 'With action',
      description: '`action` is the primary action out of the empty state.',
      code: `<EmptyState
  icon={<Users size={22} />}
  title="No clients yet"
  description="Your clients show up here after the first booking."
  action={<Button size="sm">Share my link</Button>}
/>`,
    },
    {
      id: 'compact',
      title: 'Compact',
      description: '`compact` reduces the vertical padding: for inside a card, not the whole screen.',
      code: `<EmptyState compact icon={<BarChart3 size={22} />}
  title="Reports coming soon" />`,
    },
  ],
  guidelines: {
    do: ['A tone that points to the next step: "A good time to review your services."'],
    dont: ['"Que vazio por aqui…": no dwelling on the empty state.', 'A generic vector illustration.'],
  },
};
