import Link from 'next/link';
import { CATEGORIES, COMPONENTS } from '@/design-system/catalog';
import { DocPage, docSectionAnchor } from '@/design-system/DocPage';
import { InlineCode } from '@/design-system/ExampleSection';

export default function DesignSystemOverview() {
  const toc = CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label }));

  return (
    <DocPage
      title="Sereno Design System"
      toc={toc}
      intro={
        <>
          <p style={{ margin: 0 }}>
            25 token-driven React primitives for the Sereno scheduling platform. Minimal, clean, native dark mode. Every component
            below has a live preview, a props table and usage examples — toggle the theme in the top-right to see light and dark.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link href="/design-system/tokens" style={pill}>
              View tokens
            </Link>
            <Link href="/design-system/core/button" style={pill}>
              Start with Button
            </Link>
          </div>
        </>
      }
    >
      {CATEGORIES.map((cat) => (
        <section key={cat.id} id={cat.id} style={{ ...docSectionAnchor, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{cat.label}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>{cat.blurb}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {COMPONENTS.filter((c) => c.category === cat.id).map((c) => (
              <Link
                key={c.slug}
                href={`/design-system/${c.category}/${c.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 'var(--space-4)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <InlineCode text={c.summary} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </DocPage>
  );
}

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 'var(--control-height-md)',
  padding: '0 var(--space-4)',
  borderRadius: 'var(--radius-pill)',
  background: 'var(--bg-brand-soft)',
  color: 'var(--text-brand)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  textDecoration: 'none',
};
