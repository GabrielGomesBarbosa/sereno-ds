'use client';

import * as React from 'react';
import { Typography } from '@sereno-ds/ui';
import { TableOfContents } from './TableOfContents';

/**
 * The same three-column shell the component pages use (`.cv-layout`): the nav is
 * flush left (outside), the article is centred, and a sticky "On this page" index
 * sits flush right. Overview and Tokens render through this so every page in the
 * showcase has the same chrome.
 */

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
          {kicker && (
            <Typography as="span" variant="eyebrow" style={{ fontWeight: 'var(--weight-bold)' }}>
              {kicker}
            </Typography>
          )}
          <Typography variant="h1" style={{ fontWeight: 'var(--weight-extrabold)' }}>
            {title}
          </Typography>
          {intro && (
            <Typography
              as="div"
              variant="body"
              color="secondary"
              style={{ fontSize: 'var(--text-md)', lineHeight: 1.6, maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              {intro}
            </Typography>
          )}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>{children}</div>
      </article>

      <TableOfContents items={toc} />
    </div>
  );
}
