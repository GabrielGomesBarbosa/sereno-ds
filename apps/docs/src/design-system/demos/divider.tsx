'use client';

import { Card, Divider } from '@sereno-ds/ui';
import * as React from 'react';
import { col, dotRow } from './_shared';

function DividerBasico() {
  return (
    <Card style={{ maxWidth: 380, ...col, gap: 'var(--space-3)' }}>
      <span style={dotRow}>Weekly summary</span>
      <Divider />
      <span style={dotRow}>Upcoming bookings</span>
      <Divider variant="strong" />
      <span style={dotRow}>Open slots</span>
    </Card>
  );
}

function DividerNaPagina() {
  return (
    <div style={{ background: 'var(--bg-canvas)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', maxWidth: 380, ...col, gap: 'var(--space-3)' }}>
      <span style={dotRow}>default (subtle)</span>
      <Divider />
      <span style={dotRow}>strong</span>
      <Divider variant="strong" />
    </div>
  );
}

function DividerDecorativo() {
  const rows = ['Monday 09:00 · Ana Ramos', 'Monday 10:30 · Bruno Lima', 'Monday 14:00 · Carla Dias'];
  return (
    <Card padding="none" style={{ maxWidth: 380 }}>
      {rows.map((r, i) => (
        <React.Fragment key={r}>
          {i > 0 && <Divider decorative />}
          <div style={{ padding: 'var(--space-3) var(--space-4)', ...dotRow }}>{r}</div>
        </React.Fragment>
      ))}
    </Card>
  );
}

export const dividerDemos: Record<string, React.FC> = { basic: DividerBasico, 'on-page': DividerNaPagina, decorative: DividerDecorativo };
