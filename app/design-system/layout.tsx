import type { Metadata } from 'next';
import Link from 'next/link';
import { Sidebar } from '@/design-system/Sidebar';
import { ScrollPanel } from '@/design-system/ScrollPanel';
import { MobileNav } from '@/design-system/MobileNav';
import { DS_VERSION } from '@/design-system/version';
import { ThemeToggle } from '@/theme/ThemeToggle';

// The showcase is for the team/investors, not for search engines (SS-39 §D.13).
export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ds-root">
      <header className="ds-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <MobileNav />
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-lg)',
              letterSpacing: '-0.03em',
              color: 'var(--text-brand)',
              textDecoration: 'none',
            }}
          >
            Sereno
          </Link>
          <span className="ds-header-sub" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Design System
          </span>
          <span
            className="ds-header-ver"
            title="Design System version"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
            }}
          >
            v{DS_VERSION}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            href="/demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 'var(--control-height-sm)',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-control)',
              background: 'var(--bg-brand-soft)',
              color: 'var(--text-brand)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View app
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="ds-body">
        <aside className="ds-aside">
          <Sidebar />
        </aside>
        <ScrollPanel>{children}</ScrollPanel>
      </div>
    </div>
  );
}
