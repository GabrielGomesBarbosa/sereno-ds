'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { AlertTriangle, Bell, CalendarCheck, ChevronDown, LogOut, Moon, Settings, Sun, UserPlus, Wallet } from 'lucide-react';
import { Avatar, Button, IconButton, Menu, type MenuEntry } from '@sereno-ds/ui';
import { NOTIFICATIONS } from '@/lib/mock';
import { cardTitle, vcol, useMediaQuery } from './shared';

// ── TopBar menus ────────────────────────────────────────────────────────────────
const NOTIF_ICON: Record<(typeof NOTIFICATIONS)[number]['kind'], React.ReactNode> = {
  booking: <CalendarCheck size={16} strokeWidth={1.75} />,
  payment: <Wallet size={16} strokeWidth={1.75} />,
  client: <UserPlus size={16} strokeWidth={1.75} />,
  alert: <AlertTriangle size={16} strokeWidth={1.75} />,
};
const NOTIF_TONE: Record<(typeof NOTIFICATIONS)[number]['kind'], string> = {
  booking: 'var(--status-info-fg)',
  payment: 'var(--status-success-fg)',
  client: 'var(--text-brand)',
  alert: 'var(--status-warning-fg)',
};

export function NotificationsMenu({ onToast }: { onToast: (m: string) => void }) {
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const unread = items.filter((n) => n.unread).length;

  return (
    <Menu
      trigger={
        <IconButton label="Notificações">
          <Bell size={18} strokeWidth={1.75} />
        </IconButton>
      }
      adornment={
        unread > 0 ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: 'var(--status-error-fg)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '16px',
              textAlign: 'center',
              boxShadow: '0 0 0 2px var(--bg-surface)',
            }}
          >
            {unread}
          </span>
        ) : null
      }
      label="Notificações"
      width={360}
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Notificações</span>
          {unread > 0 && (
            <Button variant="link" size="sm" onClick={() => setItems((xs) => xs.map((n) => ({ ...n, unread: false })))}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
      }
    >
      {(close) => (
        <>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {items.map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderTop: i ? '1px solid var(--border-subtle)' : 'none',
                  background: n.unread ? 'var(--bg-brand-soft)' : 'transparent',
                }}
              >
                <span style={{ flex: '0 0 auto', color: NOTIF_TONE[n.kind], marginTop: 1 }}>{NOTIF_ICON[n.kind]}</span>
                <div style={{ ...vcol('2px'), minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</span>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            fullWidth
            style={{ borderTop: '1px solid var(--border-subtle)', borderRadius: 0, color: 'var(--text-secondary)' }}
            onClick={() => {
              close();
              onToast('Central de notificações — em breve.');
            }}
          >
            Ver todas
          </Button>
        </>
      )}
    </Menu>
  );
}

export function UserMenu({ onNavigate, onToast }: { onNavigate: (v: string) => void; onToast: (m: string) => void }) {
  // On mobile the standalone TopBar theme toggle is dropped for space — it lives here instead.
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const items: MenuEntry[] = [
    ...(isNarrow
      ? [
          {
            label: isDark ? 'Tema claro' : 'Tema escuro',
            icon: isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />,
            onClick: () => setTheme(isDark ? 'light' : 'dark'),
            keepOpen: true,
          } satisfies MenuEntry,
        ]
      : []),
    { label: 'Configurações', icon: <Settings size={16} strokeWidth={1.75} />, onClick: () => onNavigate('config:perfil') },
    { label: 'Sair', icon: <LogOut size={16} strokeWidth={1.75} />, tone: 'danger', onClick: () => onToast('Você saiu da sua conta.') },
  ];

  return (
    <Menu
      width={220}
      trigger={
        <button type="button" className="dash-user-trigger">
          <Avatar name="Ana Beatriz Ramos" size="sm" />
          <span className="dash-user-name">Ana Beatriz</span>
          <ChevronDown size={16} strokeWidth={2} />
        </button>
      }
      header={
        <>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Ana Beatriz Ramos</div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>ana.ramos@email.com</div>
        </>
      }
      items={items}
    />
  );
}
