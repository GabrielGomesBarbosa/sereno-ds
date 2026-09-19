'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Table, Typography } from '@sereno-ds/ui';
import { type ComponentMeta, adjacentComponents, examplesFor } from './catalog';
import { ExampleSection, InlineCode } from './ExampleSection';
import { TableOfContents } from './TableOfContents';

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
          <Typography as="span" variant="eyebrow" style={{ fontWeight: 'var(--weight-bold)' }}>
            {meta.category}
          </Typography>
          <Typography variant="h1" style={{ fontWeight: 'var(--weight-extrabold)' }}>
            {meta.name}
          </Typography>
          <Typography variant="body" color="secondary" style={{ fontSize: 'var(--text-md)', lineHeight: 1.6, maxWidth: 620 }}>
            <InlineCode text={meta.summary} />
          </Typography>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
          {examples.map((ex) => (
            <ExampleSection key={ex.id} slug={meta.slug} example={ex} />
          ))}

          {meta.guidelines && (
            <section id="usage" style={{ scrollMarginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Typography variant="h2" style={{ letterSpacing: '-0.01em' }}>
                Usage
              </Typography>
              <div className="cv-guidelines">
                <GuidelineList tone="do" items={meta.guidelines.do} />
                <GuidelineList tone="dont" items={meta.guidelines.dont} />
              </div>
            </section>
          )}

          <section id="props" style={{ scrollMarginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Typography variant="h2" style={{ letterSpacing: '-0.01em' }}>
              Props
            </Typography>
            <Table caption={`${meta.name} props`} minWidth={520}>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Prop</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Default</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {meta.props.map((p) => (
                  <Table.Row key={p.name}>
                    <Table.Cell style={{ ...propCell, fontWeight: 600 }}>{p.name}</Table.Cell>
                    <Table.Cell wrap style={{ ...propCell, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-brand)' }}>
                      {p.type}
                    </Table.Cell>
                    <Table.Cell style={{ ...propCell, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {p.default ?? '—'}
                    </Table.Cell>
                    <Table.Cell wrap style={{ ...propCell, color: 'var(--text-secondary)' }}>
                      <InlineCode text={p.description} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </section>
        </div>

        <nav className="cv-prevnext">
          {prev ? (
            <Link href={`/design-system/${prev.category}/${prev.slug}`} style={prevNextLink}>
              <ArrowLeft size={16} strokeWidth={1.75} />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography as="span" variant="caption" style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)' }}>
                  Previous
                </Typography>
                <Typography as="span" variant="h3" color="brand" style={{ fontSize: 'var(--text-base)', letterSpacing: 'normal', lineHeight: 'normal' }}>
                  {prev.name}
                </Typography>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/design-system/${next.category}/${next.slug}`} style={{ ...prevNextLink, justifyContent: 'flex-end', textAlign: 'right' }}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography as="span" variant="caption" style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)' }}>
                  Next
                </Typography>
                <Typography as="span" variant="h3" color="brand" style={{ fontSize: 'var(--text-base)', letterSpacing: 'normal', lineHeight: 'normal' }}>
                  {next.name}
                </Typography>
              </span>
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          )}
        </nav>
      </article>

      <TableOfContents items={toc} />
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
      <Typography
        as="span"
        variant="eyebrow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: '0.04em',
          color: isDo ? 'var(--status-success-fg)' : 'var(--status-error-fg)',
        }}
      >
        {isDo ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
        {isDo ? 'Do' : "Don't"}
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <Typography as="li" key={i} variant="bodySm" color="primary" style={{ lineHeight: 1.55 }}>
            <InlineCode text={it} />
          </Typography>
        ))}
      </ul>
    </div>
  );
}

// Props rows read better top-aligned — the DS Table cell default is middle.
const propCell: React.CSSProperties = { verticalAlign: 'top', lineHeight: 1.5 };
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
