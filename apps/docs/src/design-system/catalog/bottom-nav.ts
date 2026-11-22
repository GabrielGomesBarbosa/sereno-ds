import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const bottomNavMeta: ComponentMeta = {
  slug: 'bottom-nav',
  name: 'BottomNav',
  category: 'navigation',
  summary: 'Mobile primary navigation: a **compound component**. 3 to 5 destinations, 64px, translucent blurred surface.',
  props: [
    R('value / onChange', 'string / (value) => void', 'Active destination and callback. Lives on the root: `BottomNav.Item` reads it from context.'),
    R('BottomNav.Item · value / label / icon', 'string / string / ReactNode', 'This destination’s identity, label, and icon.'),
    R('BottomNav.Item · badge', 'boolean', 'An accent dot on the icon corner, "there’s something new here".'),
  ],
  code: `<BottomNav value={tab} onChange={setTab}>
  <BottomNav.Item value="agenda" label="Calendar" icon={<Calendar size={22} />} />
  <BottomNav.Item value="clientes" label="Clients" icon={<Users size={22} />} badge />
</BottomNav>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: '22px icon per item. The active one is in `text-brand`. Use 3 to 5 destinations.',
      code: `<BottomNav value={tab} onChange={setTab}>
  <BottomNav.Item value="agenda" label="Calendar" icon={<Calendar size={22} />} />
  <BottomNav.Item value="clientes" label="Clients" icon={<Users size={22} />} />
  <BottomNav.Item value="servicos" label="Services" icon={<Sparkles size={22} />} />
</BottomNav>`,
    },
    {
      id: 'with-badge',
      title: 'With badge',
      description: '`badge` puts an accent dot on the icon corner, for "there’s something new here".',
      code: `<BottomNav.Item value="agenda" label="Calendar" icon={<Calendar size={22} />} />
<BottomNav.Item value="clientes" label="Clients" icon={<Users size={22} />} badge />`,
    },
  ],
  guidelines: {
    do: ['3 to 5 destinations.', 'The label always visible below the icon.'],
    dont: ['More than 5 items.', 'Using it on desktop; that is the sidebar’s job.'],
  },
};
