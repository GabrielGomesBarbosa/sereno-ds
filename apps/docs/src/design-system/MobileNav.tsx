'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { IconButton } from '@sereno-ds/ui';
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

  // Lock the document scroll while the drawer is open (on mobile the page itself
  // scrolls now, so the content behind the scrim would otherwise move).
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = { html: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
    };
  }, [open]);

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
            <span className="ds-drawer-close">
              <IconButton label="Close menu" variant="ghost" onClick={() => setOpen(false)}>
                <X size={20} strokeWidth={1.75} />
              </IconButton>
            </span>
            <div className="ds-drawer-body">
              <Sidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
}
