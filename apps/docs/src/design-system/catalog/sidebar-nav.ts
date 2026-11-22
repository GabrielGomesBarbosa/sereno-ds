import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const sidebarNavMeta: ComponentMeta = {
  slug: 'sidebar-nav',
  name: 'SidebarNav',
  category: 'navigation',
  summary:
    'Desktop primary navigation: a **compound component**, the counterpart to `BottomNav`. Grouped sections with dividers, an inline second level (a hover flyout on the rail), and an edge toggle that drops it to a 72px icon rail.',
  props: [
    R(
      'value / onChange',
      'string / (value) => void',
      'Active destination and callback. Lives on the root: every subcomponent reads it from context. An `Item` with `SubItem` children is not a destination itself; it toggles its submenu.',
    ),
    R('linkComponent', 'React.ElementType', 'Items with an `href` render through this (e.g. Next `Link`) instead of a `<button>`: routing, new-tab, SSR-active.'),
    R('collapsed / onCollapsedChange', 'boolean / (c) => void', 'Rail state. Uncontrolled via `defaultCollapsed`.', 'false'),
    R('collapsible', 'boolean', 'Show the round collapse toggle on the sidebar’s right edge.', 'true'),
    R('header', 'React.ReactNode', 'Brand / logo slot at the top.'),
    R('footer', 'React.ReactNode', 'Slot pinned to the bottom (user card, plan nudge). Hidden while collapsed.'),
    R('labels', '{ expand?, collapse? }', 'Text for the collapse toggle.'),
    R(
      'disabled',
      'boolean',
      'Disables every `Item` / `SubItem` at once, a gated area, an account that isn’t active yet. An item can opt back in with its own `disabled={false}`. The collapse toggle, `header` and `footer` stay live: they aren’t destinations.',
      'false',
    ),
    R('SidebarNav.Section · label', 'string', 'Small uppercase heading above the block. Omit for an unlabelled group: the divider still shows.'),
    R('SidebarNav.Item · value / label / icon / count', 'string / string / ReactNode / number', 'This destination’s identity, label, leading icon, and a trailing count chip.'),
    R('SidebarNav.Item · href', 'string', 'Renders this leaf through `linkComponent` instead of a `<button>`. Ignored while `disabled`.'),
    R(
      'SidebarNav.Item · disabled',
      'boolean',
      'Not selectable. Inherits the root’s `disabled` when unset; an explicit `false` opts back in. `aria-disabled` + out of the Tab order, never a link, a parent doesn’t toggle or open its flyout. Can still be the current page (`aria-current`), just muted.',
      'inherits root',
    ),
    R('SidebarNav.SubItem · value / label / count', 'string / string / number', 'A second-level destination, nested inside an `Item`.'),
    R('SidebarNav.SubItem · disabled', 'boolean', 'Not selectable. Inherits from its parent `Item`; an explicit value wins.', 'inherits parent'),
  ],
  code: `<SidebarNav value={view} onChange={setView} header={<Wordmark />} footer={<UserCard />}>
  <SidebarNav.Section label="Workspace">
    <SidebarNav.Item value="agenda" label="Calendar" icon={<Calendar size={18} />} />
    <SidebarNav.Item value="clients" label="Clients" icon={<Users size={18} />} count={12} />
  </SidebarNav.Section>
  <SidebarNav.Section label="Management">
    <SidebarNav.Item value="finance" label="Finance" icon={<Wallet size={18} />}>
      <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
      <SidebarNav.SubItem value="finance:payouts" label="Payouts" />
    </SidebarNav.Item>
  </SidebarNav.Section>
</SidebarNav>`,
  examples: [
    {
      id: 'basic',
      title: 'Groups and second level',
      description:
        'Each `SidebarNav.Section` is a divided block with an optional uppercase `label`. An `Item` with `SubItem` children is not a destination; it opens an inline second level (the branch holding the active child starts open). On the collapsed rail the same list opens as a hover flyout instead. A label the row can’t fit is cut with an ellipsis, hover or Tab onto it and the full text shows in a tooltip (only when it is actually cut; a short label gets none).',
      code: `<SidebarNav value={view} onChange={setView}>
  <SidebarNav.Section label="Workspace">
    <SidebarNav.Item value="agenda" label="Calendar" icon={<Calendar size={18} />} />
    <SidebarNav.Item value="clients" label="Clients" icon={<Users size={18} />} count={12} />
    <SidebarNav.Item value="services" label="Services" icon={<Sparkles size={18} />} />
    {/* too long for the row: ellipsis + a tooltip with the full text on hover / focus */}
    <SidebarNav.Item value="waitlist" label="Waiting list and cancellations" icon={<CalendarOff size={18} />} />
  </SidebarNav.Section>
  <SidebarNav.Section label="Management">
    <SidebarNav.Item value="finance" label="Finance" icon={<Wallet size={18} />}>
      <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
      <SidebarNav.SubItem value="finance:payouts" label="Payouts" count={3} />
    </SidebarNav.Item>
    <SidebarNav.Item value="reports" label="Reports" icon={<BarChart3 size={18} />} />
  </SidebarNav.Section>
  <SidebarNav.Section label="Account">
    <SidebarNav.Item value="settings" label="Settings" icon={<Settings size={18} />} />
  </SidebarNav.Section>
</SidebarNav>`,
    },
    {
      id: 'collapsible',
      title: 'Collapsible rail',
      description:
        'A round toggle on the sidebar’s right edge (level with the `header`) drops it to a 72px icon rail, labels hide, group headings become bare dividers, counts become a dot, and each icon gets a tooltip on hover and on keyboard focus. A parent still opens its flyout from the rail. Pass `header` (a mark shows on the rail) / `footer` (hidden on the rail).',
      code: `const [collapsed, setCollapsed] = React.useState(false);

<SidebarNav
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  labels={{ expand: 'Expand', collapse: 'Collapse' }}
  header={<Wordmark compact={collapsed} />}
  footer={<UserCard />}
  value={view}
  onChange={setView}
>
  {sections}
</SidebarNav>`,
    },
    {
      id: 'disabled',
      title: 'Disabled items',
      description:
        'Per item with `disabled` (a leaf, a `SubItem` or a whole parent), or for the whole menu with `disabled` on the root, flip the switch. An item can opt back in with `disabled={false}` (Settings stays live under the lock). A disabled row uses `aria-disabled`, leaves the Tab order, never navigates (even with an `href`), and its parent won’t open a flyout on the rail. If it is the current page it keeps `aria-current`, just muted.',
      code: `<SidebarNav value={view} onChange={setView} disabled={locked}>
  <SidebarNav.Section label="Management">
    <SidebarNav.Item value="finance" label="Finance" icon={<Wallet size={18} />}>
      <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
      <SidebarNav.SubItem value="finance:invoices" label="Invoices" disabled />
    </SidebarNav.Item>
    <SidebarNav.Item value="reports" label="Reports" icon={<BarChart3 size={18} />} disabled />
  </SidebarNav.Section>
  <SidebarNav.Section label="Account">
    {/* stays live even while the root is disabled */}
    <SidebarNav.Item value="settings" label="Settings" icon={<Settings size={18} />} disabled={false} />
  </SidebarNav.Section>
</SidebarNav>`,
    },
  ],
  guidelines: {
    do: [
      'Group into 2–4 labelled sections; keep each to ~6 items.',
      'Keep a locked destination visible but `disabled` when hiding it would confuse (a higher plan, an inactive account), and explain why somewhere near.',
      'Second level only one deep: no grandchildren.',
      'On mobile it hides; `BottomNav` takes over under 900px.',
    ],
    dont: ['A parent item that both navigates and has children.', 'More than two levels.', 'Using it as the mobile navigation.'],
  },
};
