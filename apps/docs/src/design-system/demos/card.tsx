'use client';

import * as React from 'react';
import { Badge, Card } from '@sereno-ds/ui';
import { Check } from 'lucide-react';
import { row } from './_shared';

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--text-primary)',
  margin: 0,
};

const cardText: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.55,
  color: 'var(--text-secondary)',
  margin: '6px 0 0',
};

function CardPadding() {
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {(['sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p} style={{ width: 244 }}>
          <Badge tone="neutral" size="sm">
            padding {p}
          </Badge>
          <h4 style={{ ...cardTitle, marginTop: 'var(--space-3)' }}>Weekly summary</h4>
          <p style={cardText}>You saw 18 clients this week: 3 more than last week. Two Friday slots are still open.</p>
        </Card>
      ))}
    </div>
  );
}

function CardElevacao() {
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((e) => (
        <Card key={e} elevation={e} style={{ width: 216 }}>
          <h4 style={cardTitle}>elevation {e}</h4>
          <p style={cardText}>Short, diffuse shadow. Never stack two levels of it.</p>
        </Card>
      ))}
    </div>
  );
}

function CardInterativo() {
  const [picked, setPicked] = React.useState<string>('year');
  const plans = [
    { id: 'month', name: 'Monthly', price: 'R$ 49 / mo', note: 'Billed every month. Cancel anytime.' },
    { id: 'year', name: 'Yearly', price: 'R$ 39 / mo', note: 'Billed once a year: two months free.' },
  ];
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {plans.map((p) => (
        <Card key={p.id} interactive selected={picked === p.id} onClick={() => setPicked(p.id)} style={{ width: 256 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <h4 style={cardTitle}>{p.name}</h4>
            {picked === p.id && <Check size={18} color="var(--text-brand)" strokeWidth={2.5} />}
          </div>
          <p style={{ ...cardText, marginTop: 4 }}>{p.note}</p>
          <div
            style={{
              marginTop: 'var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
            }}
          >
            {p.price}
          </div>
        </Card>
      ))}
    </div>
  );
}

export const cardDemos: Record<string, React.FC> = { padding: CardPadding, elevation: CardElevacao, interactive: CardInterativo };
