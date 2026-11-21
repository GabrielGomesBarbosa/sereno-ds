'use client';

import { Brand } from '@sereno-ds/ui';
import * as React from 'react';
import { row } from './_shared';

function BrandVariantes() {
  return (
    <div style={{ ...row, gap: 32 }}>
      <Brand variant="symbol" size={40} />
      <Brand variant="lockup" size={28} />
      <Brand variant="lockup-vertical" size={40} />
    </div>
  );
}

function BrandMono() {
  return (
    <div style={{ ...row, gap: 32 }}>
      <span style={{ color: 'var(--text-primary)' }}>
        <Brand variant="lockup" size={28} mono />
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        <Brand variant="lockup" size={28} mono />
      </span>
    </div>
  );
}

function BrandTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'flex-end', gap: 24 }}>
      <Brand variant="symbol" size={16} />
      <Brand variant="symbol" size={24} />
      <Brand variant="symbol" size={32} />
      <Brand variant="symbol" size={48} />
    </div>
  );
}

export const brandDemos: Record<string, React.FC> = { variants: BrandVariantes, mono: BrandMono, sizes: BrandTamanhos };
