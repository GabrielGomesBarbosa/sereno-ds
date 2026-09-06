'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarNav, type SidebarNavSection } from '@sereno/ui';
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

function Mark({ size = 24 }: { size?: number }) {
  const gid = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Sereno" style={{ display: 'block', flex: '0 0 auto' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7d8bdf" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <path d="M10.5 16.5l3.7 3.7L22 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      sections={SECTIONS}
      value={active}
      linkComponent={Link}
      collapsible={false}
      header={
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mark size={24} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>
        </span>
      }
      style={{ width: '100%', height: '100%' }}
    />
  );
}
