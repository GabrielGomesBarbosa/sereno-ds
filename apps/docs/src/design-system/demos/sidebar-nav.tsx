'use client';

import * as React from 'react';
import {
  BarChart3,
  Calendar,
  CalendarOff,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { Avatar, Brand, SidebarNav, Switch } from '@sereno-ds/ui';
import { BodyLines, R, col } from './_shared';

interface SideSubItem {
  value: string;
  label: string;
  count?: number;
}

interface SideItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  children?: SideSubItem[];
}

interface SideSection {
  label?: string;
  items: SideItem[];
}

const SIDE_SECTIONS: SideSection[] = [
  {
    label: 'Workspace',
    items: [
      { value: 'agenda', label: 'Calendar', icon: <Calendar size={18} strokeWidth={1.75} /> },
      { value: 'clients', label: 'Clients', icon: <Users size={18} strokeWidth={1.75} />, count: 12 },
      { value: 'services', label: 'Services', icon: <Sparkles size={18} strokeWidth={1.75} /> },
      { value: 'waitlist', label: 'Waiting list and cancellations', icon: <CalendarOff size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        value: 'finance',
        label: 'Finance',
        icon: <Wallet size={18} strokeWidth={1.75} />,
        children: [
          { value: 'finance:incoming', label: 'Incoming' },
          { value: 'finance:payouts', label: 'Payouts', count: 3 },
          { value: 'finance:invoices', label: 'Invoices' },
        ],
      },
      { value: 'reports', label: 'Reports', icon: <BarChart3 size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    label: 'Account',
    items: [{ value: 'settings', label: 'Settings', icon: <Settings size={18} strokeWidth={1.75} /> }],
  },
];

function SideFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        height: 460,
        maxWidth: 640,
        borderRadius: R,
        boxShadow: '0 0 0 1px var(--border-default)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
      }}
    >
      {children}
    </div>
  );
}

function Wordmark({ compact }: { compact?: boolean }) {
  return compact ? <Brand variant="symbol" size={22} /> : <Brand variant="lockup" size={20} />;
}

function SideUser() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0 var(--space-1)' }}>
      <Avatar name="Emma Johnson" size="sm" />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Emma Johnson
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>Owner</span>
      </div>
    </div>
  );
}

function SidePane({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--bg-canvas)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
      <BodyLines />
    </div>
  );
}

function sidePaneLabel(v: string) {
  for (const it of SIDE_SECTIONS.flatMap((s) => s.items)) {
    if (it.value === v) return it.label;
    const sub = it.children?.find((c) => c.value === v);
    if (sub) return `${it.label} · ${sub.label}`;
  }
  return v;
}

/** `SIDE_SECTIONS` mapped to `SidebarNav`'s compound children - shared by both demos below. */
function SideSections() {
  return (
    <>
      {SIDE_SECTIONS.map((section, i) => (
        <SidebarNav.Section key={section.label ?? i} label={section.label}>
          {section.items.map((item) => (
            <SidebarNav.Item key={item.value} value={item.value} label={item.label} icon={item.icon} count={item.count}>
              {item.children?.map((sub) => (
                <SidebarNav.SubItem key={sub.value} value={sub.value} label={sub.label} count={sub.count} />
              ))}
            </SidebarNav.Item>
          ))}
        </SidebarNav.Section>
      ))}
    </>
  );
}

function SidebarNavBasico() {
  const [view, setView] = React.useState('finance:payouts');
  return (
    <SideFrame>
      <SidebarNav collapsible={false} value={view} onChange={setView} header={<Wordmark />}>
        <SideSections />
      </SidebarNav>
      <SidePane label={sidePaneLabel(view)} />
    </SideFrame>
  );
}

function SidebarNavColapsavel() {
  const [view, setView] = React.useState('agenda');
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SideFrame>
      <SidebarNav
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        labels={{ expand: 'Expand', collapse: 'Collapse' }}
        value={view}
        onChange={setView}
        header={<Wordmark compact={collapsed} />}
        footer={<SideUser />}
      >
        <SideSections />
      </SidebarNav>
      <SidePane label={sidePaneLabel(view)} />
    </SideFrame>
  );
}

function SidebarNavDesabilitado() {
  const [view, setView] = React.useState('agenda');
  const [locked, setLocked] = React.useState(false);
  return (
    <div style={col}>
      <Switch
        label="Lock the whole menu"
        description="Sets disabled on the root. Settings opts back in with its own disabled={false}."
        checked={locked}
        onChange={(e) => setLocked(e.target.checked)}
      />
      <SideFrame>
        <SidebarNav collapsible={false} value={view} onChange={setView} disabled={locked} header={<Wordmark />}>
          <SidebarNav.Section label="Workspace">
            <SidebarNav.Item value="agenda" label="Calendar" icon={<Calendar size={18} strokeWidth={1.75} />} />
            <SidebarNav.Item value="clients" label="Clients" icon={<Users size={18} strokeWidth={1.75} />} count={12} />
            <SidebarNav.Item value="services" label="Services" icon={<Sparkles size={18} strokeWidth={1.75} />} />
          </SidebarNav.Section>
          <SidebarNav.Section label="Management">
            <SidebarNav.Item value="finance" label="Finance" icon={<Wallet size={18} strokeWidth={1.75} />}>
              <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
              <SidebarNav.SubItem value="finance:invoices" label="Invoices" disabled />
            </SidebarNav.Item>
            <SidebarNav.Item value="reports" label="Reports" icon={<BarChart3 size={18} strokeWidth={1.75} />} disabled />
          </SidebarNav.Section>
          <SidebarNav.Section label="Account">
            <SidebarNav.Item value="settings" label="Settings" icon={<Settings size={18} strokeWidth={1.75} />} disabled={false} />
          </SidebarNav.Section>
        </SidebarNav>
        <SidePane label={sidePaneLabel(view)} />
      </SideFrame>
    </div>
  );
}

export const sidebarNavDemos: Record<string, React.FC> = { basic: SidebarNavBasico, collapsible: SidebarNavColapsavel, disabled: SidebarNavDesabilitado };
