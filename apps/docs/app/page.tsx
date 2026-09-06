import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { Accessibility, ArrowRight, Ban, Feather, Layers, MoonStar, Palette } from 'lucide-react';
import { Brand, Card, ThemeToggle } from '@sereno/ui';
import { DS_VERSION } from '@/design-system/version';
import { HeroPreview } from '@/home/HeroPreview';
import { GithubMark, NextMark, ReactMark } from '@/home/tech';

const REPO = 'https://github.com/GabrielGomesBarbosa/sereno-ds';

const pageTitle = 'Sereno Design System';
const pageDescription =
  '30 token-driven React primitives for the Sereno scheduling platform — native dark mode, no UI base library, built for React and Next.js.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: '/' },
  openGraph: { title: pageTitle, description: pageDescription, url: '/' },
};

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <Palette size={20} strokeWidth={1.75} />, title: 'Token-driven', body: 'Every value is a CSS custom property. Light and dark are the same components on a different token set.' },
  { icon: <Ban size={20} strokeWidth={1.75} />, title: 'No base library', body: 'No Radix, MUI or Tailwind. Inline styles, built from scratch — the surface is exactly the design system.' },
  { icon: <MoonStar size={20} strokeWidth={1.75} />, title: 'Native dark mode', body: 'One `data-theme` on the root. No theme prop, no variant, no flash.' },
  { icon: <Accessibility size={20} strokeWidth={1.75} />, title: 'Keyboard & focus', body: 'Real focus rings, `:focus-visible`, roving tabindex where it matters — on every control.' },
  { icon: <Layers size={20} strokeWidth={1.75} />, title: '30 primitives, 5 categories', body: 'Core, forms, navigation, feedback and the scheduling-domain cards — a live preview for each.' },
  { icon: <Feather size={20} strokeWidth={1.75} />, title: 'Zero runtime', body: 'No CSS-in-JS engine. Plain inline styles reading `var(--token)` — nothing ships but the components.' },
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

const tech: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-secondary)',
};

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background:
          'radial-gradient(60rem 32rem at 50% -8rem, color-mix(in srgb, var(--interactive-primary) 16%, transparent), transparent 70%), var(--bg-canvas)',
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
          gap: 'var(--space-11)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <a
              href={REPO}
              aria-label="GitHub repository"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--control-height-sm)', height: 'var(--control-height-sm)', borderRadius: 'var(--radius-control)', color: 'var(--text-secondary)' }}
            >
              <GithubMark size={18} />
            </a>
            <ThemeToggle variant="ghost" />
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-9)',
            alignItems: 'center',
            paddingTop: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <span style={eyebrow}>Sereno · Design System</span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-5xl)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.04,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              The UI behind Sereno, as a system.
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 460 }}>
              30 token-driven React primitives — native dark mode, no UI base library, one live preview per component.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <span style={tech}>
                <ReactMark size={18} /> React 18 &amp; 19
              </span>
              <span style={tech}>
                <NextMark size={18} /> Next.js App Router
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
              <Link href="/design-system" style={cta(true)}>
                Open the Design System <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/demo" style={cta(false)}>
                See the app
              </Link>
            </div>
            <pre
              style={{
                margin: 'var(--space-2) 0 0',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-inverse)',
                color: 'var(--text-inverse)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                overflowX: 'auto',
              }}
            >
              <span style={{ opacity: 0.6 }}>import</span> {'{ Button, Card }'} <span style={{ opacity: 0.6 }}>from</span>{' '}
              <span style={{ color: 'var(--accent-300, #8ee3d3)' }}>&apos;@sereno/ui&apos;</span>
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroPreview />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <span style={eyebrow}>What it is</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--bg-brand-soft)', color: 'var(--text-brand)' }}>{f.icon}</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-1) 0 0' }}>{f.title}</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Link href="/design-system" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={eyebrow}>Components</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Open the Design System</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                Every primitive across 5 categories, the tokens page in light &times; dark, and a page per component — live preview, code, do and don&rsquo;t.
              </p>
            </Card>
          </Link>
          <Link href="/demo" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={eyebrow}>Product</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>See the app</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                The three real screens — public booking flow, professional dashboard and onboarding — built from these primitives, on mocked data.
              </p>
            </Card>
          </Link>
        </section>

        <footer style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Brand variant="symbol" size={16} mono />
            Sereno Design System · v{DS_VERSION}
          </span>
          <a href={REPO} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <GithubMark size={14} /> GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
