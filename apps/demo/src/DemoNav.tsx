'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from '@sereno/ui';

// Demo-harness chrome — not part of the product. A fixed pill so any screen
// can get back to the hub or jump to another screen.
const SCREENS = [
  { href: '/agendar/ana-ramos', label: 'Booking', match: '/agendar' },
  { href: '/dashboard', label: 'Dashboard', match: '/dashboard' },
  { href: '/onboarding', label: 'Onboarding', match: '/onboarding' },
];

const linkBase: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-pill)',
  textDecoration: 'none',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

export function DemoNav() {
  const pathname = usePathname() || '';

  return (
    <nav
      aria-label="Demo screens"
      style={{
        position: 'fixed',
        right: 'var(--space-4)',
        bottom: 'var(--space-4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        maxWidth: 'calc(100vw - var(--space-6))',
        overflowX: 'auto',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-pill)',
        background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <Link
        href="/"
        aria-label="Demo hub"
        style={{ ...linkBase, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}
      >
        <Brand variant="symbol" size={16} />
        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Demo
        </span>
      </Link>

      <span aria-hidden style={{ flex: '0 0 auto', width: 1, height: 18, background: 'var(--border-default)' }} />

      {SCREENS.map((s) => {
        const active = pathname.startsWith(s.match);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? 'page' : undefined}
            style={{
              ...linkBase,
              color: active ? 'var(--text-brand)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-brand-soft)' : 'transparent',
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
