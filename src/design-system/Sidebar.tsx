'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarNav, type SidebarNavSection } from '@/components';
import { CATEGORIES, COMPONENTS } from './catalog';

const SECTIONS: SidebarNavSection[] = [
  {
    items: [
      { value: '/design-system', label: 'Overview', href: '/design-system' },
      { value: '/design-system/tokens', label: 'Tokens', href: '/design-system/tokens' },
    ],
  },
  ...CATEGORIES.map((cat) => ({
    label: cat.label,
    items: COMPONENTS.filter((c) => c.category === cat.id).map((c) => {
      const href = `/design-system/${c.category}/${c.slug}`;
      return { value: href, label: c.name, href };
    }),
  })),
];

/** The showcase's own left nav — the SidebarNav component, rendering real links. */
export function Sidebar() {
  const pathname = usePathname();
  const active = pathname.replace(/\/$/, '') || '/design-system';
  return (
    <SidebarNav
      sections={SECTIONS}
      value={active}
      collapsible={false}
      linkComponent={Link}
      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
    />
  );
}
