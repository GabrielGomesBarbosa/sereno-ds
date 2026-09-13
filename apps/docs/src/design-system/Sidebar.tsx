'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand, SidebarNav } from '@sereno-ds/ui';
import { CATEGORIES, COMPONENTS } from './catalog';

/**
 * The showcase's own left nav — the SidebarNav component rendering real links.
 * No collapse toggle here: this catalogue has no per-item icons, so a collapsed
 * icon rail would have nothing to show.
 */
export function Sidebar() {
  const pathname = usePathname();
  const active = pathname.replace(/\/$/, '') || '/design-system';
  return (
    <SidebarNav
      value={active}
      linkComponent={Link}
      collapsible={false}
      header={
        <Link href="/" aria-label="Sereno — home" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          <Brand variant="lockup" size={28} />
        </Link>
      }
      style={{ width: '100%', height: '100%' }}
    >
      <SidebarNav.Section>
        <SidebarNav.Item value="/design-system" label="Overview" href="/design-system" />
        <SidebarNav.Item value="/design-system/tokens" label="Tokens" href="/design-system/tokens" />
      </SidebarNav.Section>
      {CATEGORIES.map((cat) => (
        <SidebarNav.Section key={cat.id} label={cat.label}>
          {COMPONENTS.filter((c) => c.category === cat.id).map((c) => {
            const href = `/design-system/${c.category}/${c.slug}`;
            return <SidebarNav.Item key={href} value={href} label={c.name} href={href} />;
          })}
        </SidebarNav.Section>
      ))}
    </SidebarNav>
  );
}
