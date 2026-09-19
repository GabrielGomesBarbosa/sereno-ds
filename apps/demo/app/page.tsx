import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Brand, Card, ThemeToggle, Typography } from '@sereno-ds/ui';

// The Design System lives in a separate app (apps/docs). SS-158 sets
// NEXT_PUBLIC_DS_URL for the deployed build; locally it runs on :3001.
const DS_URL = process.env.NEXT_PUBLIC_DS_URL ?? 'http://localhost:3001';

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
  {
    href: '/kiosk',
    kicker: 'Waiting room',
    title: 'Call panel',
    body: 'A screen mounted in the waiting room announcing who’s up next — a ticket code and a time, bank-panel style, no client-identifying data at all.',
  },
];

const EYEBROW_OVERRIDE: CSSProperties = { fontWeight: 'var(--weight-bold)', letterSpacing: '0.1em' };

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
          <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
            Sereno · Demo
          </Typography>
          <Typography variant="display" style={{ letterSpacing: '-0.035em', lineHeight: 1.05 }}>
            The Sereno app, built on the Design System.
          </Typography>
          <Typography variant="body" color="secondary" style={{ fontSize: 'var(--text-lg)', lineHeight: 1.6, maxWidth: 520 }}>
            Four real product screens — a public booking flow, the professional dashboard, onboarding and a reception kiosk — assembled from{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em', padding: '0.12em 0.4em', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>@sereno-ds/ui</code>{' '}
            primitives and navigable end to end on mocked data.
          </Typography>
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
          <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
            The screens
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {SCREENS.map((s) => (
              <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
                <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
                    {s.kicker}
                  </Typography>
                  <Typography variant="h2" style={{ fontSize: 'var(--text-lg)', letterSpacing: 'normal' }}>
                    {s.title}
                  </Typography>
                  <Typography variant="bodySm" style={{ lineHeight: 1.55 }}>
                    {s.body}
                  </Typography>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Typography as="footer" variant="caption" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Brand variant="symbol" size={16} mono />
            Sereno · built with the Design System
          </span>
          <a href={DS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            Design System <ExternalLink size={13} strokeWidth={2} />
          </a>
        </Typography>
      </div>
    </main>
  );
}
