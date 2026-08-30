import type { Metadata } from 'next';
import { CalendarClock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tokens · Design System',
  robots: { index: false, follow: false },
};

const SURFACES = [
  ['--bg-canvas', 'Canvas'],
  ['--bg-surface', 'Surface'],
  ['--bg-subtle', 'Subtle'],
  ['--bg-sunken', 'Sunken'],
  ['--bg-brand-soft', 'Brand soft'],
  ['--bg-accent-soft', 'Accent soft'],
  ['--bg-inverse', 'Inverse'],
];
const TEXTS = [
  ['--text-primary', 'Primary'],
  ['--text-secondary', 'Secondary'],
  ['--text-muted', 'Muted'],
  ['--text-brand', 'Brand'],
  ['--text-accent', 'Accent'],
];
const INTERACTIVE = [
  ['--interactive-primary', 'Primary'],
  ['--interactive-accent', 'Accent'],
  ['--interactive-success', 'Success'],
  ['--interactive-warning', 'Warning'],
  ['--interactive-error', 'Error'],
  ['--border-default', 'Border'],
  ['--border-strong', 'Border strong'],
];
const STATUS = [
  ['--status-success-bg', '--status-success-fg', 'success'],
  ['--status-warning-bg', '--status-warning-fg', 'warning'],
  ['--status-error-bg', '--status-error-fg', 'error'],
  ['--status-neutral-bg', '--status-neutral-fg', 'neutral'],
  ['--status-info-bg', '--status-info-fg', 'info'],
];

const TYPE_SCALE: [string, string][] = [
  ['--text-5xl', '48'],
  ['--text-4xl', '38'],
  ['--text-3xl', '31'],
  ['--text-2xl', '25'],
  ['--text-xl', '21'],
  ['--text-lg', '18'],
  ['--text-md', '16'],
  ['--text-base', '15'],
  ['--text-sm', '13'],
  ['--text-xs', '12'],
  ['--text-2xs', '11'],
];

const SPACE_SCALE: [string, string][] = [
  ['--space-1', '4'],
  ['--space-2', '8'],
  ['--space-3', '12'],
  ['--space-4', '16'],
  ['--space-5', '20'],
  ['--space-6', '24'],
  ['--space-7', '32'],
  ['--space-8', '40'],
  ['--space-9', '48'],
  ['--space-10', '64'],
];

const CONTAINERS: [string, string, string][] = [
  ['--container-narrow', '480', 'Focused single-column flow (booking card)'],
  ['--container-content', '760', 'Reading width — docs, forms, marketing'],
  ['--container-app', '1240', 'Full app shell (dashboard)'],
];

const BREAKPOINTS: [string, string][] = [
  ['--bp-sm', '560'],
  ['--bp-md', '768'],
  ['--bp-lg', '1024'],
  ['--bp-xl', '1280'],
];

const ICON_SIZES: [string, string][] = [
  ['--icon-xs', '14'],
  ['--icon-sm', '16'],
  ['--icon-md', '18'],
  ['--icon-lg', '20'],
  ['--icon-xl', '24'],
];

const label: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: 0,
};

const note: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  margin: 0,
  maxWidth: 560,
};

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.92em',
  color: 'var(--text-primary)',
};

const sublabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  margin: 0,
};

function Swatch({ varName, name }: { varName: string; name: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ height: 56, borderRadius: 'var(--radius-md)', background: `var(${varName})`, border: '1px solid var(--border-default)' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{varName}</span>
      </div>
    </div>
  );
}

function ThemePanel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={label}>Surfaces</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
          {SURFACES.map(([v, n]) => (
            <Swatch key={v} varName={v} name={n} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={label}>Interactive & borders</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
          {INTERACTIVE.map(([v, n]) => (
            <Swatch key={v} varName={v} name={n} />
          ))}
        </div>
        <p style={note}>
          Solid fills for <code style={mono}>Button</code> / <code style={mono}>IconButton</code>. No <code style={mono}>--interactive-info</code>:
          on an action, &ldquo;info&rdquo; is the brand indigo, i.e. <code style={mono}>--interactive-primary</code>.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={label}>Text</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TEXTS.map(([v, n]) => (
            <span key={v} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: `var(${v})`, fontWeight: 600 }}>
              {n} — {v}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={label}>Status tones</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {STATUS.map(([bg, fg, n]) => (
            <span
              key={n}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: 'var(--radius-chip)',
                background: `var(${bg})`,
                color: `var(${fg})`,
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            >
              {n}
            </span>
          ))}
        </div>
        <p style={note}>
          The five-word tone family — <code style={mono}>success</code>, <code style={mono}>warning</code>, <code style={mono}>error</code>,{' '}
          <code style={mono}>info</code>, <code style={mono}>neutral</code> — shared by <code style={mono}>Badge</code>, <code style={mono}>Alert</code>{' '}
          and <code style={mono}>Toast</code>. Each has <code style={mono}>-bg</code>, <code style={mono}>-fg</code> and <code style={mono}>-dot</code> tokens.
        </p>
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 980 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
          Tokens
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 620 }}>
          Semantic aliases in both themes, the type scale (ratio ~1.22, 15px base) and the spacing scale (4px base). Every component
          reads only these tokens.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={label}>Colours — light × dark</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          <ThemePanel theme="light" />
          <ThemePanel theme="dark" />
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={label}>Type scale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
          {TYPE_SCALE.map(([v, px]) => (
            <div key={v} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 132, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
                {v} · {px}px
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: `var(${v})`, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.15, minWidth: 0, overflowWrap: 'anywhere' }}>
                Confirmed
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={label}>Spacing scale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {SPACE_SCALE.map(([v, px]) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 132, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
                {v} · {px}px
              </span>
              <span style={{ display: 'block', height: 16, width: `var(${v})`, background: 'var(--interactive-primary)', borderRadius: 'var(--radius-xs)' }} />
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={label}>Grid &amp; iconography</h2>
        <p style={note}>
          There is no column-grid system: layout is flex / CSS grid, kept within one of three max content widths. The
          breakpoints are the fixed set of widths where the layout switches between phone, tablet and desktop.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={sublabel}>Content widths</p>
          {CONTAINERS.map(([v, px, use]) => (
            <div key={v} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', minWidth: 210 }}>
                {v} · {px}px
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{use}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={sublabel}>Breakpoints</p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {BREAKPOINTS.map(([v, px]) => (
              <span
                key={v}
                style={{
                  display: 'inline-flex',
                  gap: 6,
                  alignItems: 'baseline',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-chip)',
                  background: 'var(--bg-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                }}
              >
                {v}
                <span style={{ color: 'var(--text-muted)' }}>{px}px</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={sublabel}>Icon sizes</p>
          <p style={note}>
            <code style={mono}>lucide-react</code> at <code style={mono}>strokeWidth&#123;1.75&#125;</code>. <code style={mono}>sm</code>/
            <code style={mono}>md</code> controls use 16, <code style={mono}>lg</code> uses 18, standalone icons 20.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {ICON_SIZES.map(([v, px]) => (
              <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <CalendarClock size={Number(px)} strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                  {v.replace('--icon-', '')} · {px}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
