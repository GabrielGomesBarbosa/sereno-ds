import type { Metadata } from 'next';

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
            <div key={v} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 96, flex: '0 0 auto' }}>
                {v} · {px}px
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: `var(${v})`, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.15 }}>
                Confirmed appointment
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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 96, flex: '0 0 auto' }}>
                {v} · {px}px
              </span>
              <span style={{ display: 'block', height: 16, width: `var(${v})`, background: 'var(--interactive-primary)', borderRadius: 'var(--radius-xs)' }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
