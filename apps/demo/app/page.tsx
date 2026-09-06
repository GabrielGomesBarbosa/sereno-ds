import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Brand, Card, ThemeToggle } from '@sereno/ui';

// The Design System lives in a separate app (apps/docs). SS-158 sets
// NEXT_PUBLIC_DS_URL for the deployed build; locally it runs on :3000.
const DS_URL = process.env.NEXT_PUBLIC_DS_URL ?? 'http://localhost:3000';

// Title / description / OG all come from the root layout (SS-204) — this is `/`.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const SCREENS = [
  {
    href: '/agendar/ana-ramos',
    kicker: 'Public flow',
    title: 'Client booking',
    body: "The client opens the professional's link, picks a service, a date and a time, leaves their details and confirms. Mobile-first, no sign-up.",
  },
  {
    href: '/dashboard',
    kicker: 'Signed-in area',
    title: 'Professional dashboard',
    body: "The day's agenda, clients, service catalog, finance and settings — including the weekly schedule.",
  },
  {
    href: '/onboarding',
    kicker: 'First run',
    title: '3-step onboarding',
    body: 'Profile, first service and weekly schedule. At the end, the public link already accepts bookings.',
  },
];

const eyebrow: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

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

export default function DemoHome() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: [
          'radial-gradient(72rem 38rem at 50% -14rem, color-mix(in srgb, var(--interactive-primary) 24%, transparent), transparent 64%)',
          'radial-gradient(46rem 34rem at 104% 2%, color-mix(in srgb, var(--interactive-primary) 13%, transparent), transparent 58%)',
          'radial-gradient(42rem 32rem at -6% 26%, color-mix(in srgb, var(--interactive-primary) 10%, transparent), transparent 60%)',
          'var(--bg-canvas)',
        ].join(', '),
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--container-app)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop) var(--space-11)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-10)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', height: 'var(--topbar-height)' }}>
          <Link href="/" aria-label="Sereno" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Brand variant="lockup" size={26} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <a
              href={DS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
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
              Design System <ExternalLink size={14} strokeWidth={2} />
            </a>
            <ThemeToggle variant="ghost" />
          </div>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', paddingTop: 'var(--space-6)', maxWidth: 720 }}>
          <span style={eyebrow}>Sereno · Demo</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-5xl)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            The Sereno app, built on the Design System.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 520 }}>
            Three real product screens — a public booking flow, the professional dashboard and onboarding — assembled from{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em', padding: '0.12em 0.4em', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>@sereno/ui</code>{' '}
            primitives and navigable end to end on mocked data.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
            <Link href="/agendar/ana-ramos" style={cta(true)}>
              Start with the booking flow <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <a href={DS_URL} target="_blank" rel="noopener noreferrer" style={cta(false)}>
              Open the Design System <ExternalLink size={16} strokeWidth={2} />
            </a>
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <span style={eyebrow}>The screens</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {SCREENS.map((s) => (
              <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
                <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={eyebrow}>{s.kicker}</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.title}</h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>{s.body}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <footer style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Brand variant="symbol" size={16} mono />
            Sereno · built with the Design System
          </span>
          <a href={DS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            Design System <ExternalLink size={13} strokeWidth={2} />
          </a>
        </footer>
      </div>
    </main>
  );
}
