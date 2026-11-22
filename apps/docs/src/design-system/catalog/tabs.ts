import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const tabsMeta: ComponentMeta = {
  slug: 'tabs',
  name: 'Tabs',
  category: 'navigation',
  summary: 'Horizontal section switcher: a **compound component**. `underline` for page-level sections, `pill` for filters inside a panel. `Tabs.Panel` is optional; your screen can render its own content instead, keyed off `value`.',
  props: [
    R('value / onChange', 'string / (value) => void', 'Active tab and callback. Lives on the root: every subcomponent reads it from context.'),
    R('variant', "'underline' | 'pill'", 'Visual style.', "'underline'"),
    R('fullWidth', 'boolean', 'Distributes the tabs evenly.', 'false'),
    R('Tabs.Tab · value', 'string', 'This tab’s identity: compared against the root `value`.'),
    R('Tabs.Tab · icon / count', 'ReactNode / number', 'Leading icon and a trailing chip (a count, a badge number).'),
    R('Tabs.Panel · value', 'string', 'Renders its children only while it matches the active `value`; otherwise renders nothing.'),
  ],
  code: `<Tabs variant="pill" value={filter} onChange={setFilter}>
  <Tabs.List>
    <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
    <Tabs.Tab value="semana" count={23}>Week</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
  examples: [
    {
      id: 'underline',
      title: 'Underline',
      description: 'For page-level sections. The active tab is in `text-brand` with an underline. `Tabs.Panel` renders the matching content: optional, your screen can do this itself instead.',
      code: `<Tabs value={view} onChange={setView}>
  <Tabs.List>
    <Tabs.Tab value="agenda">Calendar</Tabs.Tab>
    <Tabs.Tab value="clientes">Clients</Tabs.Tab>
    <Tabs.Tab value="servicos">Services</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="agenda">…</Tabs.Panel>
  <Tabs.Panel value="clientes">…</Tabs.Panel>
  <Tabs.Panel value="servicos">…</Tabs.Panel>
</Tabs>`,
    },
    {
      id: 'pill',
      title: 'Pill',
      description: 'For filters inside a panel. The group hugs its content; it never stretches to fill the container. `count` becomes a chip next to the label.',
      code: `<Tabs variant="pill" value={filter} onChange={setFilter}>
  <Tabs.List>
    <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
    <Tabs.Tab value="semana" count={23}>Week</Tabs.Tab>
    <Tabs.Tab value="mes">Month</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
    },
    {
      id: 'full-width',
      title: 'Full width',
      description: '`fullWidth` distributes the tabs evenly: good for 2–3 sections in a narrow panel.',
      code: `<Tabs fullWidth value={v} onChange={setV}>
  <Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab>
    <Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
    },
    {
      id: 'overflow',
      title: 'Overflow',
      description: 'When the tabs are wider than the container the strip scrolls horizontally (no wrapping, no squishing) and a chevron appears on whichever side has more. Picking a tab scrolls it into view.',
      code: `<Tabs value={v} onChange={setV}>
  <Tabs.List>
    {MANY_TABS.map((t) => <Tabs.Tab key={t.value} value={t.value}>{t.label}</Tabs.Tab>)}
  </Tabs.List>
</Tabs> {/* the strip scrolls on its own */}`,
    },
  ],
  guidelines: {
    do: [
      '`underline` = page sections. `pill` = filters in a panel.',
      '`count` only when the number helps a decision.',
      'Let it scroll for a long strip, don’t wrap tabs onto two lines.',
    ],
    dont: ['A stretched `pill` taking the full width (unless `fullWidth`).', 'A dozen tabs where a `Select` or side navigation would read better.'],
  },
};
