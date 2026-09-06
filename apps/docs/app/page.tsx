import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Brand, Card, ThemeToggle } from '@sereno/ui';
import { DS_VERSION } from '@/design-system/version';

const pageTitle = 'Sereno Design System';
const pageDescription =
  '30 token-driven React primitives with native dark mode and no UI base library — a navigable showcase plus three real product screens on mocked data.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: '/' },
  openGraph: { title: pageTitle, description: pageDescription, url: '/' },
};

const STATS: [string, string][] = [
  ['30', 'primitives'],
  ['5', 'categories'],
  ['light × dark', 'every token'],
];

const PILLARS: { title: string; body: string }[] = [
  {
    title: 'Token-driven',
    body: 'Every value is a CSS custom property. Light and dark are the same components reading a different set of tokens — no variant, no theme prop.',
  },
  {
    title: 'No base library',
    body: 'No Radix, MUI or Tailwind. Inline styles, built from scratch, so the surface is exactly what the design system says — nothing more.',
  },
  {
    title: 'One system, two apps',
    body: 'The showcase and three real product screens — booking, dashboard, onboarding — consume the very same primitives from @sereno/ui.',
  },
];

const cta = (primary: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  height: 'var(--control-height-lg)',
  padding: '0 var(--space-5)',
  borderRadius: 'var(--radius-control)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-md)',
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  ...(primary
    ? { background: 'var(--interactive-primary)', color: 'var(--interactive-primary-fg)' }
    : { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'inset 0 0 0 1px var(--border-default)' }),
});

const label: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

export default function Home() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-canvas)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--container-content)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop) var(--space-11)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-10)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--topbar-height)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Brand variant="lockup" size={26} />
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

        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-5)' }}>
          <Brand variant="symbol" size={64} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              margin: 0,
              maxWidth: 640,
            }}
          >
            The Sereno Design System
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 560 }}>
            30 token-driven React primitives for the Sereno scheduling platform — native dark mode, no UI base library, one live preview per component.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Link href="/design-system" style={cta(true)}>
              Open the Design System
            </Link>
            <Link href="/demo" style={cta(false)}>
              See the app
            </Link>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          {STATS.map(([value, name]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 'var(--space-4)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</span>
              <span style={label}>{name}</span>
            </div>
          ))}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <span style={label}>What it is</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {PILLARS.map((p) => (
              <Card key={p.title} padding="lg">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>{p.title}</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{p.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Link href="/design-system" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%' }}>
              <span style={label}>Components</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-2) 0' }}>Open the Design System</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                Every primitive across 5 categories, the tokens page in light × dark, and a navigable page per component — live preview, code, do and don&rsquo;t.
              </p>
            </Card>
          </Link>
          <Link href="/demo" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%' }}>
              <span style={label}>Product</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-2) 0' }}>See the app</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                The three real screens — public booking flow, professional dashboard and onboarding — built from these primitives and navigable on mocked data.
              </p>
            </Card>
          </Link>
        </section>

        <footer style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}>
          <Brand variant="symbol" size={16} mono />
          <span>Sereno Design System · v{DS_VERSION}</span>
        </footer>
      </div>
    </main>
  );
}
