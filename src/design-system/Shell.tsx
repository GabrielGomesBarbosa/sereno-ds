import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { ScrollPanel } from './ScrollPanel';
import { MobileNav } from './MobileNav';
import { DS_VERSION } from './version';
import { ThemeToggle } from '@/theme/ThemeToggle';

/**
 * Shell — same structure as the dashboard: a full-height sidebar on the left,
 * and a header that only spans the content column ("starts after the sidebar").
 */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ds-root">
      <aside className="ds-aside">
        <Sidebar />
      </aside>

      <div className="ds-content">
        <header className="ds-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
            <MobileNav />
            <span className="ds-header-sub" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
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
            <ThemeToggle variant="ghost" />
          </div>
        </header>

        <ScrollPanel>{children}</ScrollPanel>
      </div>
    </div>
  );
}
