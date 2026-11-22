'use client';

import * as React from 'react';
import { Calendar, Search, Sparkles, Users } from 'lucide-react';
import { BottomNav } from '@sereno-ds/ui';
import { BodyLines, PhoneFrame, screenBody } from './_shared';

function labelOf(items: { value: string; label: string }[], v: string) {
  return items.find((i) => i.value === v)?.label ?? v;
}

function BottomNavBasico() {
  const [tab, setTab] = React.useState('agenda');
  const items = [
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} /> },
    { value: 'servicos', label: 'Services', icon: <Sparkles size={22} strokeWidth={1.75} /> },
  ];
  return (
    <PhoneFrame>
      <div style={{ ...screenBody, minHeight: 140 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{labelOf(items, tab)}</span>
        <BodyLines />
      </div>
      <BottomNav value={tab} onChange={setTab}>
        {items.map((it) => (
          <BottomNav.Item key={it.value} value={it.value} label={it.label} icon={it.icon} />
        ))}
      </BottomNav>
    </PhoneFrame>
  );
}

function BottomNavBadge() {
  const [tab, setTab] = React.useState('agenda');
  const items = [
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} />, badge: true },
    { value: 'search', label: 'Search', icon: <Search size={22} strokeWidth={1.75} /> },
  ];
  return (
    <PhoneFrame>
      <div style={{ ...screenBody, minHeight: 140 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{labelOf(items, tab)}</span>
        <BodyLines />
      </div>
      <BottomNav value={tab} onChange={setTab}>
        {items.map((it) => (
          <BottomNav.Item key={it.value} value={it.value} label={it.label} icon={it.icon} badge={it.badge} />
        ))}
      </BottomNav>
    </PhoneFrame>
  );
}

export const bottomNavDemos: Record<string, React.FC> = { basic: BottomNavBasico, 'with-badge': BottomNavBadge };
