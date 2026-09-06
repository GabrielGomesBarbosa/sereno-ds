import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@sereno/ui';

const pageTitle = 'App — demo screens';
const pageDescription =
  'The three real screens of the Sereno platform, built with the Design System and navigable on mocked data.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: '/demo' },
  openGraph: { title: pageTitle, description: pageDescription, url: '/demo', images: ['/opengraph-image.png'] },
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

export default function DemoHub() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-canvas)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          height: 'var(--topbar-height)',
          padding: '0 var(--gutter-desktop)',
          background: 'color-mix(in srgb, var(--bg-surface) 88%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)', textDecoration: 'none' }}
          >
            Sereno
          </Link>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>App</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            href="/design-system"
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
            Design System
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div
        style={{
          maxWidth: 'var(--container-content)',
          margin: '0 auto',
          padding: 'var(--space-9) var(--gutter-desktop) var(--space-11)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-7)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Demo screens
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 560 }}>
            The three real product screens, built with the Design System primitives and navigable end to end on mocked data.
          </p>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {SCREENS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
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
                {s.kicker}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{s.body}</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
