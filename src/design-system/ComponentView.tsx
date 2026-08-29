'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { type ComponentMeta, adjacentComponents, examplesFor } from './catalog';
import { ExampleSection, InlineCode } from './ExampleSection';

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: 0,
};
const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-xl)',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: 'var(--text-primary)',
  margin: 0,
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ComponentView({ meta }: { meta: ComponentMeta }) {
  const examples = examplesFor(meta);
  const { prev, next } = adjacentComponents(meta.slug);

  const toc: { id: string; label: string }[] = [
    ...examples.map((e) => ({ id: e.id, label: e.title })),
    ...(meta.guidelines ? [{ id: 'usage', label: 'Usage' }] : []),
    { id: 'props', label: 'Props' },
  ];

  return (
    <div className="cv-layout">
      <article className="cv-article">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          <span style={sectionLabel}>{meta.category}</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {meta.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 620 }}>
            <InlineCode text={meta.summary} />
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
          {examples.map((ex) => (
            <ExampleSection key={ex.id} slug={meta.slug} example={ex} />
          ))}

          {meta.guidelines && (
            <section id="usage" style={{ scrollMarginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h2 style={h2}>Usage</h2>
              <div className="cv-guidelines">
                <GuidelineList tone="do" items={meta.guidelines.do} />
                <GuidelineList tone="dont" items={meta.guidelines.dont} />
              </div>
            </section>
          )}

          <section id="props" style={{ scrollMarginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h2 style={h2}>Props</h2>
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left' }}>
                      <th style={th}>Prop</th>
                      <th style={th}>Type</th>
                      <th style={th}>Default</th>
                      <th style={th}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meta.props.map((p) => (
                      <tr key={p.name} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-brand)' }}>{p.type}</td>
                        <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {p.default ?? '—'}
                        </td>
                        <td style={{ ...td, color: 'var(--text-secondary)' }}>{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <nav className="cv-prevnext">
          {prev ? (
            <Link href={`/design-system/${prev.category}/${prev.slug}`} style={prevNextLink}>
              <ArrowLeft size={16} strokeWidth={1.75} />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={prevNextKicker}>Previous</span>
                <span style={prevNextName}>{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/design-system/${next.category}/${next.slug}`} style={{ ...prevNextLink, textAlign: 'right' }}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={prevNextKicker}>Next</span>
                <span style={prevNextName}>{next.name}</span>
              </span>
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          )}
        </nav>
      </article>

      <aside className="cv-toc">
        <span style={{ ...sectionLabel, marginBottom: 'var(--space-2)', display: 'block' }}>On this page</span>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {toc.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => scrollToId(t.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function GuidelineList({ tone, items }: { tone: 'do' | 'dont'; items: string[] }) {
  const isDo = tone === 'do';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid ' + (isDo ? 'var(--status-success-dot)' : 'var(--status-error-dot)'),
        background: isDo ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: isDo ? 'var(--status-success-fg)' : 'var(--status-error-fg)',
        }}
      >
        {isDo ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
        {isDo ? 'Do' : "Don't"}
      </span>
      <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-primary)' }}>
            <InlineCode text={it} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};
const td: React.CSSProperties = { padding: 'var(--space-3) var(--space-4)', verticalAlign: 'top', lineHeight: 1.5 };
const prevNextLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-card)',
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  textDecoration: 'none',
};
const prevNextKicker: React.CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 600 };
const prevNextName: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-brand)' };
