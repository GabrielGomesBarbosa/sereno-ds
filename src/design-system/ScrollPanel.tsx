'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

/**
 * The content column is its own scroll container (fixed app-shell), so Next's
 * default "scroll to top on navigation" — which targets the document — doesn't
 * reach it. Reset this panel to the top whenever the route changes.
 */
export function ScrollPanel({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLElement>(null);
  const pathname = usePathname();
  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <main ref={ref} className="ds-main">
      {children}
    </main>
  );
}
