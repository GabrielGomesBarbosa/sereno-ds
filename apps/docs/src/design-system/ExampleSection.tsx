'use client';

import * as React from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import type { Example } from './catalog';
import { DEMOS } from './demos';

const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-xl)',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: 'var(--text-primary)',
  margin: 0,
};
const caption: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  margin: 0,
  maxWidth: 620,
};
const toolBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

export function ExampleSection({ slug, example }: { slug: string; example: Example }) {
  const [showCode, setShowCode] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const Demo = DEMOS[slug]?.[example.id];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id={example.id} style={{ scrollMarginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h2 style={h2}>{example.title}</h2>
      {example.description && (
        <p style={caption}>
          <InlineCode text={example.description} />
        </p>
      )}

      {/* No clip on the card: a live example may pop out a Select / DateTimePicker
          panel. Only the code/toolbar chrome below is clipped, for tidy corners. */}
      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)' }}>
        <div style={{ padding: 'var(--space-7)' }}>{Demo ? <Demo /> : <em style={{ color: 'var(--text-muted)' }}>No preview.</em>}</div>

        <div style={{ overflow: 'hidden', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-1)',
            padding: '4px var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-canvas)',
          }}
        >
          <button type="button" style={toolBtn} onClick={() => setShowCode((v) => !v)} aria-expanded={showCode}>
            <ChevronDown size={14} strokeWidth={2} style={{ transform: showCode ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-standard)' }} />
            {showCode ? 'Hide code' : 'Show code'}
          </button>
          <button type="button" style={toolBtn} onClick={copy}>
            {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {showCode && (
          <pre
            style={{
              margin: 0,
              padding: 'var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-sunken)',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
            }}
          >
            <code>{example.code}</code>
          </pre>
        )}
        </div>
      </div>
    </section>
  );
}

/** Render `backtick` spans in an authored caption as inline <code>. */
/** Minimal inline markdown: `code` and **bold**. */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`')) {
          return (
            <code key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92em', color: 'var(--text-brand)' }}>
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}
