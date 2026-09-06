import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@sereno/ui';
import { DS_VERSION } from '@/design-system/version';

const pageTitle = 'Sereno — Design System & product showcase';
const pageDescription =
  'The 25 approved React primitives with a navigable live showcase, plus the three real product screens running on mocked data.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: '/' },
  openGraph: { title: pageTitle, description: pageDescription, url: '/' },
};

const ENTRIES = [
  {
    href: '/design-system',
    kicker: 'Components',
    title: 'Open the Design System',
    body: 'The 25 React primitives, the tokens page (light × dark) and a navigable showcase with a live preview of every component.',
  },
  {
    href: '/demo',
    kicker: 'Product',
    title: 'See the app',
    body: 'The three real screens — public booking flow, professional dashboard and onboarding — navigable on mocked data.',
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', maxWidth: 'var(--container-content)', margin: '0 auto', padding: '0 var(--gutter-desktop)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--topbar-height)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>
            <span
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
          <ThemeToggle />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-7)', padding: 'var(--space-9) 0 var(--space-11)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
              Sereno
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 520 }}>
              Design System and showcase for Sereno — a scheduling platform for independent health &amp; beauty professionals.
              Pick where to start.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {ENTRIES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-5)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {e.kicker}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{e.title}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{e.body}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
