'use client';

import * as React from 'react';
import { Button, StatCard } from '@sereno-ds/ui';
import { col, row } from './_shared';

const statGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 };

function StatCardBasico() {
  return (
    <div style={statGrid}>
      <StatCard label="Today" value={12} hint="3 confirmed, 2 pending" />
      <StatCard label="This week" value={48} hint="6 more than last week" />
      <StatCard label="Revenue" value="R$ 4.320" hint="Closed this month" />
    </div>
  );
}

function StatCardTons() {
  return (
    <div style={statGrid}>
      <StatCard label="Default" value={12} hint="Plain card" />
      <StatCard tone="neutral" label="Neutral" value={12} hint="Quieter, for background figures" />
      <StatCard tone="success" label="Confirmed" value={9} hint="All set" />
      <StatCard tone="warning" label="Pending" value={5} hint="Waiting for a reply" />
      <StatCard tone="error" label="Cancelled" value={2} hint="This week" />
      <StatCard tone="info" label="New clients" value={7} hint="Joined this month" />
    </div>
  );
}

function StatCardProgresso() {
  return (
    <div style={statGrid}>
      <StatCard label="Grid occupancy" value="75%" hint="6 of 8 slots taken" progress={{ percent: 75, label: 'Occupied slots' }} />
      <StatCard tone="warning" label="Grid occupancy" value="95%" hint="Almost full" progress={{ percent: 95 }} />
    </div>
  );
}

function StatCardCarregando() {
  const [loading, setLoading] = React.useState(true);
  return (
    <div style={col}>
      <div style={row}>
        <Button variant="secondary" size="sm" onClick={() => setLoading((v) => !v)}>
          {loading ? 'Show the data' : 'Show loading'}
        </Button>
      </div>
      <div style={statGrid}>
        <StatCard loading={loading} label="Today" value={12} hint="3 confirmed, 2 pending" />
        <StatCard loading={loading} tone="warning" label="Pending" value={5} hint="Waiting for a reply" />
        <StatCard loading={loading} label="Grid occupancy" value="75%" hint="6 of 8 slots taken" progress={{ percent: 75 }} />
      </div>
    </div>
  );
}

export const statCardDemos: Record<string, React.FC> = { basic: StatCardBasico, tones: StatCardTons, progress: StatCardProgresso, loading: StatCardCarregando };
