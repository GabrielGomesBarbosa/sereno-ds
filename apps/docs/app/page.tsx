import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { Accessibility, ArrowRight, Ban, ExternalLink, Feather, Layers, ListChecks, MonitorSmartphone, MoonStar, Package, Palette, Server } from 'lucide-react';
import { Brand, Card, ThemeToggle, Typography } from '@sereno-ds/ui';
import { DS_VERSION } from '@/design-system/version';
import { ComponentGallery } from '@/home/ComponentGallery';
import { HeroPreview } from '@/home/HeroPreview';
import { GithubMark, NextMark, ReactMark } from '@/home/tech';
import { CopyCode } from '@/home/CopyCode';

const REPO = 'https://github.com/GabrielGomesBarbosa/sereno-ds';
const NPM_UI = 'https://www.npmjs.com/package/@sereno-ds/ui';
const NPM_TOKENS = 'https://www.npmjs.com/package/@sereno-ds/tokens';

// The demo is a separate app (apps/demo). SS-158 sets NEXT_PUBLIC_DEMO_URL for
// the deployed build; locally it runs on :3002.
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? 'http://localhost:3002';

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
  { icon: <MonitorSmartphone size={20} strokeWidth={1.75} />, title: 'Responsive UI', body: 'Adapts to the pointer, not just the width — Select opens as a bottom sheet on touch, Dialog as a slide-up, the dashboard re-homes its nav.' },
  { icon: <Accessibility size={20} strokeWidth={1.75} />, title: 'Keyboard & focus', body: 'Real focus rings, `:focus-visible`, roving tabindex where it matters — on every control.' },
  { icon: <ListChecks size={20} strokeWidth={1.75} />, title: 'WCAG 2.1 AA audited', body: 'Every primitive checked for contrast, keyboard access, screen readers and focus management — real issues found and fixed, not a badge.' },
  { icon: <Layers size={20} strokeWidth={1.75} />, title: '30 primitives, 5 categories', body: 'Core, forms, navigation, feedback and the scheduling-domain cards — a live preview for each.' },
  { icon: <Feather size={20} strokeWidth={1.75} />, title: 'Zero runtime', body: 'No CSS-in-JS engine. Plain inline styles reading `var(--token)` — nothing ships but the components.' },
  { icon: <Server size={20} strokeWidth={1.75} />, title: 'RSC-ready', body: "Each primitive keeps its own `'use client'` boundary — server components import them freely; only what's interactive hydrates." },
];

const EYEBROW_OVERRIDE: CSSProperties = { fontWeight: 'var(--weight-bold)', letterSpacing: '0.1em' };

const code: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85em',
  padding: '0.12em 0.4em',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-subtle)',
  color: 'var(--text-primary)',
};

/** Renders `backtick` spans in a plain string as styled <code>. */
function withCode(text: string): ReactNode[] {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i} style={code}>{part}</code> : part));
}

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

export default function Home() {
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
          gap: 'var(--space-11)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--topbar-height)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Brand variant="lockup" size={26} />
            <a
              href={NPM_UI}
              target="_blank"
              rel="noopener noreferrer"
              title="@sereno-ds/ui on npm"
              aria-label="@sereno-ds/ui on npm"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                textDecoration: 'none',
              }}
            >
              v{DS_VERSION}
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
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
            <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
              Sereno · Design System
            </Typography>
            <Typography variant="display" style={{ letterSpacing: '-0.035em', lineHeight: 1.04 }}>
              The UI behind Sereno, as a system.
            </Typography>
            <Typography variant="body" color="secondary" style={{ fontSize: 'var(--text-lg)', lineHeight: 1.6, maxWidth: 460 }}>
              30 token-driven React primitives — native dark mode, no UI base library, one live preview per component.
            </Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <Typography as="span" variant="bodySm" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ReactMark size={18} /> React 18 &amp; 19
              </Typography>
              <Typography as="span" variant="bodySm" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <NextMark size={18} /> Next.js App Router
              </Typography>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
              <Link href="/design-system" style={cta(true)}>
                Open the Design System <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" style={cta(false)}>
                See the app <ExternalLink size={16} strokeWidth={2} />
              </a>
            </div>
            <CopyCode code="import { Button, Card } from '@sereno-ds/ui'">
              <span style={{ opacity: 0.6 }}>import</span> {'{ Button, Card }'} <span style={{ opacity: 0.6 }}>from</span>{' '}
              <span style={{ color: 'var(--accent-300, #8ee3d3)' }}>&apos;@sereno-ds/ui&apos;</span>
            </CopyCode>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroPreview />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
            What it is
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--bg-brand-soft)', color: 'var(--text-brand)' }}>{f.icon}</span>
                <Typography as="h2" variant="h3" style={{ letterSpacing: 'normal', lineHeight: 'normal', margin: 'var(--space-1) 0 0' }}>
                  {f.title}
                </Typography>
                <Typography variant="bodySm" style={{ lineHeight: 1.55 }}>
                  {withCode(f.body)}
                </Typography>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
              The primitives
            </Typography>
            <Link href="/design-system" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-brand)', textDecoration: 'none' }}>
              Browse all 30 <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
          <ComponentGallery />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Link href="/design-system" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
                Components
              </Typography>
              <Typography variant="h2" style={{ letterSpacing: 'normal' }}>
                Open the Design System
              </Typography>
              <Typography variant="bodySm" style={{ lineHeight: 1.55 }}>
                Every primitive across 5 categories, the tokens page in light &times; dark, and a page per component — live preview, code, do and don&rsquo;t.
              </Typography>
            </Card>
          </Link>
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Card padding="lg" interactive style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Typography as="span" variant="eyebrow" style={EYEBROW_OVERRIDE}>
                Product
              </Typography>
              <Typography variant="h2" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', letterSpacing: 'normal' }}>
                See the app <ExternalLink size={15} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
              </Typography>
              <Typography variant="bodySm" style={{ lineHeight: 1.55 }}>
                The three real screens — public booking flow, professional dashboard and onboarding — built from these primitives, on mocked data.
              </Typography>
            </Card>
          </a>
        </section>

        <Typography as="footer" variant="caption" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Brand variant="symbol" size={16} mono />
            Sereno Design System · v{DS_VERSION}
          </span>
          <a href={REPO} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <GithubMark size={14} /> GitHub
          </a>
          <a href={NPM_UI} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Package size={14} strokeWidth={1.75} /> npm · ui
          </a>
          <a href={NPM_TOKENS} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Package size={14} strokeWidth={1.75} /> npm · tokens
          </a>
        </Typography>
      </div>
    </main>
  );
}
