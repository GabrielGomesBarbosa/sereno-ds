'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

/**
 * On desktop the content column is its own scroll container (fixed app-shell),
 * so Next's default "scroll to top on navigation" — which targets the document —
 * doesn't reach it. On mobile (<=900px) the document scrolls instead. Reset both
 * on route change; whichever isn't the active scroller is a harmless no-op.
 */
export function ScrollPanel({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLElement>(null);
  const pathname = usePathname();
  React.useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <main ref={ref} className="ds-main">
      {children}
    </main>
  );
}
