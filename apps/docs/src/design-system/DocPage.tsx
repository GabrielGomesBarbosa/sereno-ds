'use client';

import * as React from 'react';
import { TableOfContents } from './TableOfContents';

/**
 * The same three-column shell the component pages use (`.cv-layout`): the nav is
 * flush left (outside), the article is centred, and a sticky "On this page" index
 * sits flush right. Overview and Tokens render through this so every page in the
 * showcase has the same chrome.
 */

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: 0,
};

export interface DocPageProps {
  kicker?: string;
  title: string;
  intro?: React.ReactNode;
  toc: { id: string; label: string }[];
  children: React.ReactNode;
}

export function DocPage({ kicker, title, intro, toc, children }: DocPageProps) {
  return (
    <div className="cv-layout">
      <article className="cv-article">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {kicker && <span style={sectionLabel}>{kicker}</span>}
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
            {title}
          </h1>
          {intro && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                maxWidth: 620,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {intro}
            </div>
          )}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>{children}</div>
      </article>

      <TableOfContents items={toc} />
    </div>
  );
}
