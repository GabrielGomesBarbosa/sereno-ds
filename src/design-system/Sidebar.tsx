'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES, COMPONENTS } from './catalog';

function NavLink({ href, label, guide = false }: { href: string; label: string; guide?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname === href + '/';
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={active ? 'ds-navlink ds-navlink--active' : 'ds-navlink'}>
      {guide && active && <span className="ds-navlink-bar" aria-hidden="true" />}
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <nav className="ds-nav">
      <div className="ds-navgroup">
        <div className="ds-navgroup-items">
          <NavLink href="/design-system" label="Overview" guide />
          <NavLink href="/design-system/tokens" label="Tokens" guide />
        </div>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat.id} className="ds-navgroup">
          <span className="ds-navgroup-head">{cat.label}</span>
          <div className="ds-navgroup-items">
            {COMPONENTS.filter((c) => c.category === cat.id).map((c) => (
              <NavLink key={c.slug} href={`/design-system/${c.category}/${c.slug}`} label={c.name} guide />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
