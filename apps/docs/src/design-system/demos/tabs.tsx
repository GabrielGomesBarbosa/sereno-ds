'use client';

import * as React from 'react';
import { Tabs } from '@sereno-ds/ui';

const TAB_ITEMS = [
  { value: 'agenda', label: 'Calendar' },
  { value: 'clientes', label: 'Clients' },
  { value: 'servicos', label: 'Services' },
];

const tabPanel: React.CSSProperties = {
  marginTop: 'var(--space-4)',
  padding: 'var(--space-4)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-subtle)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-secondary)',
};

function TabsUnderline() {
  const [v, setV] = React.useState('agenda');
  return (
    <div>
      <Tabs value={v} onChange={setV}>
        <Tabs.List>
          {TAB_ITEMS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {TAB_ITEMS.map((t) => (
          <Tabs.Panel key={t.value} value={t.value} style={tabPanel}>
            The “{t.label}” section: your screen renders this, keyed off the active value.
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

function TabsPill() {
  const items = [
    { value: 'today', label: 'Today', count: 5 },
    { value: 'semana', label: 'Week', count: 23 },
    { value: 'mes', label: 'Month' },
  ];
  const [v, setV] = React.useState('today');
  return (
    <div>
      <Tabs variant="pill" value={v} onChange={setV}>
        <Tabs.List>
          {items.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} count={t.count}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {items.map((t) => (
          <Tabs.Panel key={t.value} value={t.value} style={tabPanel}>
            Showing: {t.label}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

function TabsFullWidth() {
  const [v, setV] = React.useState('agenda');
  return (
    <div style={{ maxWidth: 360 }}>
      <Tabs fullWidth value={v} onChange={setV}>
        <Tabs.List>
          {TAB_ITEMS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {TAB_ITEMS.map((t) => (
          <Tabs.Panel key={t.value} value={t.value} style={tabPanel}>
            {t.label}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

const MANY_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'agenda', label: 'Calendar' },
  { value: 'clientes', label: 'Clients' },
  { value: 'servicos', label: 'Services' },
  { value: 'financeiro', label: 'Billing' },
  { value: 'relatorios', label: 'Reports' },
  { value: 'integracoes', label: 'Integrations' },
  { value: 'config', label: 'Settings' },
];

function TabsOverflow() {
  const [v, setV] = React.useState('overview');
  return (
    <div style={{ maxWidth: 380 }}>
      <Tabs value={v} onChange={setV}>
        <Tabs.List>
          {MANY_TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {MANY_TABS.map((t) => (
          <Tabs.Panel key={t.value} value={t.value} style={tabPanel}>
            {t.label}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

export const tabsDemos: Record<string, React.FC> = { underline: TabsUnderline, pill: TabsPill, 'full-width': TabsFullWidth, overflow: TabsOverflow };
