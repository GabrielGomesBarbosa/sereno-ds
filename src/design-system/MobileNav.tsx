'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { IconButton } from '@/components';
import { Sidebar } from './Sidebar';

/**
 * Mobile-only navigation: a hamburger in the header that opens a slide-in drawer
 * holding the same <Sidebar/>. Desktop keeps the persistent left panel (CSS hides
 * this button and the drawer above 900px).
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes (link tap, back button…).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <span className="ds-menu-btn">
        <IconButton label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={20} strokeWidth={1.75} />
        </IconButton>
      </span>

      {open && (
        <>
          <div className="ds-drawer-scrim" onClick={() => setOpen(false)} />
          <div className="ds-drawer" role="dialog" aria-modal="true" aria-label="Design System navigation">
            <div className="ds-drawer-head">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-md)', letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>
                Sereno
              </span>
              <IconButton label="Close menu" onClick={() => setOpen(false)}>
                <X size={20} strokeWidth={1.75} />
              </IconButton>
            </div>
            <div className="ds-drawer-body">
              <Sidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
}
