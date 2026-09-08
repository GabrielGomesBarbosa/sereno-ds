'use client';

import * as React from 'react';
import { Bell, Calendar, Search } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Card, Checkbox, IconButton, Input, Radio, Skeleton, Switch, Tabs } from '@sereno-ds/ui';

const row: React.CSSProperties = { display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' };
const cell: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' };
const tag: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/** A live spread of primitives from every category — a real preview, not a screenshot. */
export function ComponentGallery() {
  const [tab, setTab] = React.useState('week');
  const [checks, setChecks] = React.useState({ a: true, b: false });
  const [mode, setMode] = React.useState('online');
  const [notify, setNotify] = React.useState(true);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
      <Card padding="lg" style={cell}>
        <span style={tag}>Actions</span>
        <div style={row}>
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="accent">Accent</Button>
          <Button size="sm" variant="secondary">Secondary</Button>
        </div>
        <div style={row}>
          <Button size="sm" variant="ghost">Ghost</Button>
          <IconButton label="Search" size="sm">
            <Search size={16} strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Notifications" size="sm" variant="secondary">
            <Bell size={16} strokeWidth={1.75} />
          </IconButton>
        </div>
      </Card>

      <Card padding="lg" style={cell}>
        <span style={tag}>Status</span>
        <div style={row}>
          <Badge tone="success">Confirmed</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="error">Cancelled</Badge>
          <Badge tone="info">Online</Badge>
        </div>
        <div style={{ display: 'flex', marginTop: 'var(--space-1)' }}>
          {['Ana Ramos', 'Carlos Dias', 'Helena Costa', 'Rafael Alves'].map((n, i) => (
            <span key={n} style={{ marginLeft: i ? -10 : 0 }}>
              <Avatar name={n} size="sm" />
            </span>
          ))}
        </div>
      </Card>

      <Card padding="lg" style={cell}>
        <span style={tag}>Forms</span>
        <Input placeholder="Search clients" iconLeft={<Search size={16} strokeWidth={1.75} />} />
        <div style={row}>
          <Checkbox label="Confirmed" checked={checks.a} onChange={(e) => setChecks((c) => ({ ...c, a: e.target.checked }))} />
          <Checkbox label="No-show" checked={checks.b} onChange={(e) => setChecks((c) => ({ ...c, b: e.target.checked }))} />
        </div>
        <div style={row}>
          <Radio name="mode" label="Online" checked={mode === 'online'} onChange={() => setMode('online')} />
          <Radio name="mode" label="In person" checked={mode === 'person'} onChange={() => setMode('person')} />
        </div>
        <Switch label="Email digest" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
      </Card>

      <Card padding="lg" style={cell}>
        <span style={tag}>Navigation</span>
        <Tabs items={TABS} value={tab} onChange={setTab} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <Calendar size={16} strokeWidth={1.75} /> Showing the {tab === 'today' ? 'day' : tab}
        </div>
      </Card>

      <Card padding="lg" style={cell}>
        <span style={tag}>Feedback</span>
        <Alert tone="info" title="3 open slots on Friday">
          Two after 4pm — a good window for follow-ups.
        </Alert>
      </Card>

      <Card padding="lg" style={cell}>
        <span style={tag}>Loading</span>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Skeleton variant="avatar" />
          <Skeleton variant="text" lines={2} style={{ flex: 1 }} />
        </div>
        <Skeleton variant="block" height={72} />
      </Card>
    </div>
  );
}
