'use client';

import {
  Button,
  IconButton,
  Menu,
  type MenuEntry,
  ToastProvider,
  useToast,
} from '@sereno-ds/ui';
import {
  Bell,
  CalendarClock,
  ChevronDown,
  Copy,
  MoreHorizontal,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import * as React from 'react';

function MenuBasico() {
  const { toast } = useToast();
  return (
    <Menu
      trigger={
        <Button variant="secondary" iconRight={<ChevronDown size={16} strokeWidth={1.75} />}>
          Actions
        </Button>
      }
      label="Appointment"
      items={[
        { label: 'Reschedule', icon: <CalendarClock size={16} strokeWidth={1.75} />, onClick: () => toast('Rescheduling…') },
        { label: 'Duplicate', icon: <Copy size={16} strokeWidth={1.75} />, onClick: () => toast('Duplicated') },
        { separator: true },
        { label: 'Cancel appointment', icon: <X size={16} strokeWidth={1.75} />, tone: 'danger', onClick: () => toast.error('Appointment cancelled') },
      ]}
    />
  );
}

function MenuBasicoWrap() {
  return (
    <ToastProvider>
      <MenuBasico />
    </ToastProvider>
  );
}

function MenuDangerDisabled() {
  const items: MenuEntry[] = [
    { label: 'Edit', icon: <Settings size={16} strokeWidth={1.75} />, onClick: () => {} },
    { label: 'Archive', disabled: true },
    { separator: true },
    { label: 'Delete', icon: <Trash2 size={16} strokeWidth={1.75} />, tone: 'danger', onClick: () => {} },
  ];
  return (
    <Menu trigger={<IconButton label="More"><MoreHorizontal size={18} strokeWidth={1.75} /></IconButton>} label="Service" items={items} align="start" />
  );
}

const MENU_NOTIFS = [
  { title: 'Marina Alves confirmou o horário de amanhã', time: 'há 5 min' },
  { title: 'Pagamento de R$ 180 recebido', time: 'há 1 h' },
  { title: 'Novo cliente: Helena Costa', time: 'ontem' },
];

function MenuRico() {
  return (
    <Menu
      trigger={<IconButton label="Notificações"><Bell size={18} strokeWidth={1.75} /></IconButton>}
      label="Notificações"
      width={300}
    >
      {(close) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            Notificações
          </div>
          {MENU_NOTIFS.map((n) => (
            <div key={n.title} style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
            </div>
          ))}
          <button
            type="button"
            onClick={close}
            style={{ padding: 'var(--space-3)', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            Ver todas
          </button>
        </div>
      )}
    </Menu>
  );
}

export const menuDemos: Record<string, React.FC> = { basic: MenuBasicoWrap, 'danger-disabled': MenuDangerDisabled, rich: MenuRico };
