'use client';

import * as React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  CalendarOff,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Gift,
  Heart,
  LifeBuoy,
  Link2,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Percent,
  Plus,
  Rss,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Target,
  Ticket,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import {
  Alert,
  AppointmentCard,
  Avatar,
  Badge,
  Button,
  Card,
  DateTimePicker,
  Dialog,
  EmptyState,
  IconButton,
  Input,
  SearchInput,
  Select,
  ServiceCard,
  SidebarNav,
  type SidebarNavSection,
  Switch,
  Tabs,
  Toast,
  TopBar,
  WeeklyScheduleEditor,
} from '@sereno/ui';
import { ThemeToggle } from '@sereno/ui';
import {
  AGENDA_SCHEDULE,
  CLIENTS,
  CLIENT_STATUS_LABEL,
  DASHBOARD_STATS,
  DEFAULT_WEEK,
  NOTIFICATIONS,
  SERVICES_BY_SLUG,
  UNAVAILABLE_DAYS,
  type Appointment,
} from '@/lib/mock';

const si = (icon: React.ReactNode) => icon;
const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    label: 'Atendimento',
    items: [
      { value: 'agenda', label: 'Agenda', icon: si(<Calendar size={18} strokeWidth={1.75} />) },
      { value: 'clientes', label: 'Clientes', icon: si(<Users size={18} strokeWidth={1.75} />), count: 128 },
      { value: 'servicos', label: 'Serviços', icon: si(<Sparkles size={18} strokeWidth={1.75} />) },
      { value: 'mensagens', label: 'Mensagens', icon: si(<MessageSquare size={18} strokeWidth={1.75} />), count: 3 },
      { value: 'fila', label: 'Fila de espera', icon: si(<Clock size={18} strokeWidth={1.75} />), count: 2 },
      { value: 'prontuarios', label: 'Prontuários', icon: si(<FileText size={18} strokeWidth={1.75} />) },
      { value: 'bloqueios', label: 'Bloqueios', icon: si(<CalendarOff size={18} strokeWidth={1.75} />) },
    ],
  },
  {
    label: 'Gestão',
    items: [
      {
        value: 'financeiro',
        label: 'Financeiro',
        icon: si(<Wallet size={18} strokeWidth={1.75} />),
        children: [
          { value: 'financeiro:resumo', label: 'Resumo do mês' },
          { value: 'financeiro:receber', label: 'A receber', count: 4 },
          { value: 'financeiro:pagamentos', label: 'Pagamentos' },
          { value: 'financeiro:repasses', label: 'Repasses' },
          { value: 'financeiro:notas', label: 'Notas fiscais' },
        ],
      },
      { value: 'comissoes', label: 'Comissões', icon: si(<Percent size={18} strokeWidth={1.75} />) },
      { value: 'estoque', label: 'Estoque', icon: si(<Package size={18} strokeWidth={1.75} />) },
      { value: 'metas', label: 'Metas', icon: si(<Target size={18} strokeWidth={1.75} />) },
      { value: 'relatorios', label: 'Relatórios', icon: si(<BarChart3 size={18} strokeWidth={1.75} />) },
      { value: 'avaliacoes', label: 'Avaliações', icon: si(<Star size={18} strokeWidth={1.75} />), count: 12 },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { value: 'link-publico', label: 'Link público', icon: si(<Link2 size={18} strokeWidth={1.75} />) },
      { value: 'campanhas', label: 'Campanhas', icon: si(<Megaphone size={18} strokeWidth={1.75} />) },
      { value: 'cupons', label: 'Cupons', icon: si(<Ticket size={18} strokeWidth={1.75} />) },
      { value: 'indicacoes', label: 'Programa de indicação', icon: si(<Gift size={18} strokeWidth={1.75} />) },
      { value: 'fidelidade', label: 'Fidelidade', icon: si(<Heart size={18} strokeWidth={1.75} />) },
      { value: 'redes', label: 'Redes sociais', icon: si(<Share2 size={18} strokeWidth={1.75} />) },
    ],
  },
  {
    label: 'Conta',
    items: [
      { value: 'equipe', label: 'Equipe', icon: si(<UserCog size={18} strokeWidth={1.75} />), count: 4 },
      {
        value: 'config',
        label: 'Configurações',
        icon: si(<Settings size={18} strokeWidth={1.75} />),
        children: [
          { value: 'config:perfil', label: 'Perfil público' },
          { value: 'config:grade', label: 'Grade horária' },
          { value: 'config:lembretes', label: 'Lembretes' },
          { value: 'config:notificacoes', label: 'Notificações' },
          { value: 'config:integracoes', label: 'Integrações' },
          { value: 'config:cobranca', label: 'Plano e cobrança' },
          { value: 'config:dominio', label: 'Domínio próprio' },
        ],
      },
      { value: 'novidades', label: 'Novidades', icon: si(<Rss size={18} strokeWidth={1.75} />) },
      { value: 'ajuda', label: 'Ajuda e suporte', icon: si(<LifeBuoy size={18} strokeWidth={1.75} />) },
    ],
  },
];

const KNOWN_BASES = new Set(['agenda', 'clientes', 'servicos', 'financeiro', 'relatorios', 'config']);
const KNOWN_CONFIG = new Set(['perfil', 'grade', 'lembretes']);
const KNOWN_FINANCE = new Set(['resumo', 'receber']);

/** Page title from the nav data: leaf → its label, child → `Parent · Child`. */
function titleForView(v: string): string {
  for (const s of SIDEBAR_SECTIONS) {
    for (const it of s.items) {
      if (it.value === v) return it.label;
      const c = it.children?.find((ch) => ch.value === v);
      if (c) return `${it.label} · ${c.label}`;
    }
  }
  return 'Sereno';
}

/** Placeholder brand mark — swap for the real asset when there is one. */
function SerenoMark({ size = 28 }: { size?: number }) {
  // Unique per instance: a shared gradient id breaks when the first holder is display:none.
  const gid = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Sereno" style={{ display: 'block', flex: '0 0 auto' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7d8bdf" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <path d="M10.5 16.5l3.7 3.7L22 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setMatches(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' };
const vcol = (gap: string): React.CSSProperties => ({ display: 'flex', flexDirection: 'column', gap });
const bigNumber: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-3xl)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
  lineHeight: 1.1,
};

function Stat({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: 'up' }) {
  return (
    <Card padding="md" style={{ minWidth: 0, ...vcol('4px') }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <span style={bigNumber}>{value}</span>
      {delta && <span style={{ fontSize: 'var(--text-xs)', color: tone === 'up' ? 'var(--status-success-fg)' : 'var(--text-muted)', fontWeight: 500 }}>{delta}</span>}
    </Card>
  );
}

// ── TopBar menus ────────────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 0 0 1px var(--border-default), var(--shadow-lg)',
  zIndex: 50,
  overflow: 'hidden',
};

function useDismiss(open: boolean, close: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-menu-root]')) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
}

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

function NotificationsMenu({ onToast }: { onToast: (m: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close);
  const unread = items.filter((n) => n.unread).length;

  return (
    <span data-menu-root style={{ position: 'relative', display: 'inline-flex' }}>
      <IconButton label="Notificações" onClick={() => setOpen((o) => !o)}>
        <Bell size={18} strokeWidth={1.75} />
      </IconButton>
      {unread > 0 && (
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
      )}
      {open && (
        <div style={{ ...panelStyle, width: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Notificações</span>
            {unread > 0 && (
              <button
                type="button"
                className="dash-menu-btn"
                onClick={() => setItems((xs) => xs.map((n) => ({ ...n, unread: false })))}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-brand)', borderRadius: 'var(--radius-sm)', padding: '4px 6px' }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
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
          <button
            type="button"
            className="dash-menu-btn"
            onClick={() => {
              setOpen(false);
              onToast('Central de notificações — em breve.');
            }}
            style={{
              width: '100%',
              border: 'none',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              padding: 'var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Ver todas
          </button>
        </div>
      )}
    </span>
  );
}

function UserMenu({ onNavigate, onToast }: { onNavigate: (v: string) => void; onToast: (m: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close);
  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)',
    textAlign: 'left',
  };

  return (
    <span data-menu-root style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          border: 'none',
          background: open ? 'var(--interactive-secondary-hover)' : 'transparent',
          cursor: 'pointer',
          padding: '4px 6px 4px 4px',
          borderRadius: 'var(--radius-pill)',
        }}
      >
        <Avatar name="Ana Beatriz Ramos" size="sm" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }} className="dash-user-name">
          Ana Beatriz
        </span>
        <ChevronDown size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', transition: 'transform var(--duration-fast) var(--ease-standard)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ ...panelStyle, width: 220 }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Ana Beatriz Ramos</div>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>ana.ramos@email.com</div>
          </div>
          <button type="button" className="dash-menu-btn" style={row} onClick={() => { setOpen(false); onNavigate('config:perfil'); }}>
            <Settings size={16} strokeWidth={1.75} /> Configurações
          </button>
          <button type="button" className="dash-menu-btn" style={{ ...row, color: 'var(--status-error-fg)' }} onClick={() => { setOpen(false); onToast('Você saiu da sua conta.'); }}>
            <LogOut size={16} strokeWidth={1.75} /> Sair
          </button>
        </div>
      )}
    </span>
  );
}

export function Dashboard() {
  const [view, setView] = React.useState<string>('agenda');
  const [navCollapsed, setNavCollapsed] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerRender, setDrawerRender] = React.useState(false);
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const openDrawer = () => {
    setDrawerRender(true);
    setDrawerOpen(true);
  };

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Nav drawer (mobile/tablet): lock scroll + Esc to close; auto-close on desktop.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);
  React.useEffect(() => {
    // the persistent sidebar is back — drop the drawer with no exit animation
    const resetDrawer = () => {
      setDrawerOpen(false);
      setDrawerRender(false);
    };
    if (!isNarrow) resetDrawer();
  }, [isNarrow]);
  React.useEffect(() => {
    // unmount after the slide-out animation
    if (drawerOpen || !drawerRender) return;
    const unmount = () => setDrawerRender(false);
    const t = window.setTimeout(unmount, 260);
    return () => window.clearTimeout(t);
  }, [drawerOpen, drawerRender]);

  const go = (v: string) => {
    setView(v);
    setDrawerOpen(false);
  };

  const [base, sub] = view.split(':') as [string, string | undefined];
  const pageTitle = titleForView(view);

  const brandFull = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <SerenoMark size={24} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>
    </span>
  );
  const planFooter = (
    <Card padding="sm" elevation="none" style={{ background: 'var(--bg-accent-soft)', ...vcol('6px') }}>
      <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Plano gratuito</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>18 de 20 agendamentos usados este mês.</span>
      <Button variant="accent" size="sm" fullWidth style={{ marginTop: 4 }} onClick={() => setToast('Redirecionando para os planos…')}>
        Assinar agora
      </Button>
    </Card>
  );

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100dvh', ['--dash-header-h' as string]: '74px' } as React.CSSProperties}>
      <div className="dash-shell" style={{ '--dash-sb-w': navCollapsed ? '72px' : '248px' } as React.CSSProperties}>
        <div className="dash-sidebar">
          <SidebarNav
            value={view}
            onChange={setView}
            collapsed={navCollapsed}
            onCollapsedChange={setNavCollapsed}
            labels={{ expand: 'Expandir', collapse: 'Recolher' }}
            sections={SIDEBAR_SECTIONS}
            style={{ ['--sidenav-header-h' as string]: 'var(--dash-header-h)' } as React.CSSProperties}
            header={navCollapsed ? <SerenoMark size={30} /> : brandFull}
            footer={planFooter}
          />
        </div>

        <div className="dash-content">
          <TopBar
            title={pageTitle}
            subtitle={base === 'agenda' ? (isNarrow ? 'Seg, 24 de agosto' : 'Segunda-feira, 24 de agosto') : undefined}
            leading={
              <span className="dash-topbar-lead">
                <IconButton label="Abrir menu" variant="ghost" onClick={openDrawer}>
                  <Menu size={20} strokeWidth={1.75} />
                </IconButton>
                <SerenoMark size={26} />
              </span>
            }
            style={{
              height: 'var(--dash-header-h)',
              flex: '0 0 auto',
              background: 'var(--bg-surface)',
              backdropFilter: 'none',
              // Align the bar's content to the centered .dash-main column (its
              // max-width gutter + its own inner padding).
              paddingInline: 'max(var(--dash-gutter), calc((100% - var(--container-app)) / 2 + var(--dash-gutter)))',
            }}
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ThemeToggle variant="ghost" />
                <NotificationsMenu onToast={setToast} />
                <span style={{ width: 1, height: 24, background: 'var(--border-default)', margin: '0 var(--space-1)' }} />
                <UserMenu onNavigate={setView} onToast={setToast} />
              </div>
            }
          />
          <main className="dash-main">
            {base === 'agenda' && <AgendaView onCancel={() => setDialogOpen(true)} onToast={setToast} />}
            {base === 'clientes' && <ClientesView />}
            {base === 'servicos' && <ServicosView />}
            {base === 'financeiro' && <FinanceiroView section={sub ?? 'resumo'} title={pageTitle} />}
            {base === 'relatorios' && <RelatoriosView />}
            {base === 'config' && <ConfigView section={sub ?? 'perfil'} title={pageTitle} />}
            {!KNOWN_BASES.has(base) && <ComingSoonView title={pageTitle} />}
          </main>
        </div>
      </div>

      {isNarrow && drawerRender && (
        <>
          <div className="dash-drawer-scrim" data-closing={!drawerOpen || undefined} onClick={() => setDrawerOpen(false)} />
          <aside className="dash-drawer" aria-label="Menu" data-closing={!drawerOpen || undefined}>
            <span className="dash-drawer-close">
              <IconButton label="Fechar menu" variant="ghost" onClick={() => setDrawerOpen(false)}>
                <X size={20} strokeWidth={1.75} />
              </IconButton>
            </span>
            <SidebarNav
              collapsible={false}
              value={view}
              onChange={go}
              sections={SIDEBAR_SECTIONS}
              header={brandFull}
              footer={planFooter}
              style={{ width: '100%', borderRight: 'none', ['--sidenav-header-h' as string]: 'var(--dash-header-h)' } as React.CSSProperties}
            />
          </aside>
        </>
      )}

      {dialogOpen && (
        <Dialog
          title="Cancelar agendamento?"
          description="A cliente será avisada por WhatsApp e o horário volta a ficar livre."
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Voltar
              </Button>
              <Button
                variant="error"
                onClick={() => {
                  setDialogOpen(false);
                  setToast('Agendamento cancelado. A cliente foi avisada.');
                }}
              >
                Cancelar agendamento
              </Button>
            </>
          }
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            left: 'var(--space-4)',
            right: 'var(--space-4)',
            top: 'calc(var(--dash-header-h, var(--topbar-height)) + var(--space-3))',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 90,
            pointerEvents: 'none', // wrapper spans the width but must not block clicks
          }}
        >
          <Toast tone="success" title={toast} onClose={() => setToast(null)} style={{ pointerEvents: 'auto' }} />
        </div>
      )}
    </div>
  );
}

function ViewHeader({ title, action }: { title?: string; action?: React.ReactNode }) {
  if (!title && !action) return null;
  return (
    <div style={{ display: 'flex', justifyContent: title ? 'space-between' : 'flex-end', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      {title && <h2 style={{ ...cardTitle, fontSize: 'var(--text-lg)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>}
      {action}
    </div>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function AppointmentRow({ a, onCancel, onToast }: { a: Appointment; onCancel: () => void; onToast: (m: string) => void }) {
  const first = a.client.split(' ')[0];
  return (
    <AppointmentCard
      time={a.time}
      date={a.date}
      client={a.client}
      service={a.service}
      channel={a.channel}
      status={a.status}
      actions={
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {a.status === 'pending' && (
            <Button size="sm" onClick={() => onToast(`Agendamento com ${first} confirmado.`)}>
              Confirmar
            </Button>
          )}
          {a.status === 'confirmed' && a.channel === 'Online' && (
            <Button size="sm" variant="secondary" iconLeft={<Video size={16} strokeWidth={1.75} />} onClick={() => onToast('Abrindo a sala de vídeo…')}>
              Entrar
            </Button>
          )}
          {a.status === 'cancelled' ? (
            <Button size="sm" variant="ghost" onClick={() => onToast(`Reagendando com ${first}…`)}>
              Reagendar
            </Button>
          ) : a.status !== 'completed' ? (
            <IconButton label="Cancelar" onClick={onCancel}>
              <X size={18} strokeWidth={1.75} />
            </IconButton>
          ) : null}
        </div>
      }
    />
  );
}

function DayBlock({ g, onCancel, onToast }: { g: (typeof AGENDA_SCHEDULE)[number]; onCancel: () => void; onToast: (m: string) => void }) {
  return (
    <div style={vcol('var(--space-3)')}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>{g.relative ?? g.weekday}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {(g.relative ? `${g.weekday}, ${g.date}` : g.date) + ' · ' + plural(g.items.length, 'atendimento', 'atendimentos')}
        </span>
      </div>
      {g.items.map((a) => (
        <AppointmentRow key={g.key + a.time} a={a} onCancel={onCancel} onToast={onToast} />
      ))}
    </div>
  );
}

function AgendaView({ onCancel, onToast }: { onCancel: () => void; onToast: (m: string) => void }) {
  const [filter, setFilter] = React.useState('hoje');
  const [limitShown, setLimitShown] = React.useState(true);
  const [acceptOnline, setAcceptOnline] = React.useState(true);

  const weekCount = AGENDA_SCHEDULE.reduce((n, g) => n + g.items.length, 0);
  const groups = filter === 'hoje' ? AGENDA_SCHEDULE.slice(0, 1) : AGENDA_SCHEDULE;
  const next = AGENDA_SCHEDULE[0].items.find((a) => a.status === 'confirmed' || a.status === 'pending');

  return (
    <div style={vcol('var(--space-5)')}>
      <ViewHeader action={<Button iconLeft={<Plus size={18} strokeWidth={1.75} />}>Novo agendamento</Button>} />

      {limitShown && (
        <Alert
          tone="info"
          title="Você usou 18 de 20 agendamentos deste mês"
          icon={<Wallet size={18} strokeWidth={1.75} />}
          onDismiss={() => setLimitShown(false)}
          action={
            <Button variant="accent" size="sm">
              Assinar agora
            </Button>
          }
        >
          No plano gratuito o limite renova no dia 1º.
        </Alert>
      )}

      <div className="dash-stats">
        {DASHBOARD_STATS.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} delta={s.delta} tone={'tone' in s ? s.tone : undefined} />
        ))}
      </div>

      <div className="dash-agenda-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--space-5)', alignItems: 'start' }}>
        <div style={vcol('var(--space-5)')}>
          <Tabs
            variant="pill"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'hoje', label: 'Hoje', count: AGENDA_SCHEDULE[0].items.length },
              { value: 'semana', label: 'Semana', count: weekCount },
              { value: 'mes', label: 'Mês' },
            ]}
          />
          {groups.map((g) => (
            <DayBlock key={g.key} g={g} onCancel={onCancel} onToast={onToast} />
          ))}
        </div>
        <div style={vcol('var(--space-4)')} className="dash-agenda-aside">
          {next && (
            <Card padding="md" style={vcol('var(--space-3)')}>
              <span style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Próximo atendimento</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Avatar name={next.client} size="sm" />
                <div style={{ ...vcol('2px'), minWidth: 0 }}>
                  <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>
                    {next.time} · {next.client}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {next.service} · {next.channel}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="secondary" fullWidth onClick={() => onToast(`Abrindo o atendimento de ${next.client.split(' ')[0]}…`)}>
                Ver detalhes
              </Button>
            </Card>
          )}
          <DateTimePicker year={2026} month={7} selectedDate={24} unavailable={UNAVAILABLE_DAYS} />
          <Card padding="md" style={vcol('var(--space-3)')}>
            <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>Seu link público</span>
            <Input
              defaultValue="sereno.app/ana-ramos"
              readOnly
              suffix={
                <button
                  type="button"
                  className="ds-affix-btn"
                  aria-label="Copiar link"
                  onClick={() => onToast('Link copiado para a área de transferência.')}
                  style={{ display: 'inline-flex', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  <Copy size={16} strokeWidth={1.75} />
                </button>
              }
            />
            <Switch
              label="Aceitar agendamentos online"
              checked={acceptOnline}
              onChange={(e) => {
                setAcceptOnline(e.target.checked);
                onToast(e.target.checked ? 'Seu link voltou a aceitar agendamentos.' : 'Seu link está pausado para novos agendamentos.');
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClientesView() {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();
  const rows = q ? CLIENTS.filter((c) => c.name.toLowerCase().includes(q)) : CLIENTS;
  return (
    <div style={vcol('var(--space-4)')}>
      <ViewHeader action={<Button variant="secondary" iconLeft={<Download size={18} strokeWidth={1.75} />}>Exportar</Button>} />
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar cliente"
          clearLabel="Limpar busca"
          onSearch={setQuery}
          onValueChange={setQuery}
          containerStyle={{ flex: 1, minWidth: 220, maxWidth: 340 }}
        />
        <Select defaultValue="all" options={[{ value: 'all', label: 'Todos os status' }, { value: 'ativo', label: 'Ativos' }]} containerStyle={{ width: 200 }} />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Search size={22} strokeWidth={1.75} />} title="Nenhum cliente encontrado" description={`Nada para "${query.trim()}". Tente outro nome.`} />
      ) : (
        <Card padding="none">
          {rows.map((c, i) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <Avatar name={c.name} size="md" />
              <div style={{ flex: 1, minWidth: 0, ...vcol('2px') }}>
                <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>{c.name}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {c.sessions} · {c.last}
                </span>
              </div>
              <Badge tone={c.status}>{CLIENT_STATUS_LABEL[c.status]}</Badge>
              <IconButton label="Abrir">
                <ChevronRight size={18} strokeWidth={1.75} />
              </IconButton>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ServicosView() {
  return (
    <div style={{ ...vcol('var(--space-4)'), maxWidth: 720 }}>
      <ViewHeader action={<Button iconLeft={<Plus size={18} strokeWidth={1.75} />}>Novo serviço</Button>} />
      {SERVICES_BY_SLUG['ana-ramos'].map((s) => (
        <ServiceCard key={s.id} name={s.name} duration={s.duration} price={s.price} description={s.description} tag={s.tag} />
      ))}
    </div>
  );
}

const PENDING_PAYMENTS = CLIENTS.slice(0, 4).map((c, i) => ({
  name: c.name,
  service: i % 2 ? 'Primeira consulta' : 'Sessão de psicoterapia',
  amount: i % 2 ? 'R$ 220' : 'R$ 180',
  due: ['vence hoje', 'vence em 2 dias', 'vence em 5 dias', 'atrasado 3 dias'][i],
  late: i === 3,
}));

function ComingSoon({ label }: { label: string }) {
  return (
    <Card padding="none">
      <EmptyState
        icon={<Sparkles size={22} strokeWidth={1.75} />}
        title={`${label} — em breve`}
        description="Esta área ainda não faz parte deste design system; entra quando o fluxo for definido."
      />
    </Card>
  );
}
function ComingSoonView({ title }: { title: string }) {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <ComingSoon label={title} />
    </div>
  );
}

function FinanceiroView({ section, title }: { section: string; title: string }) {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Stat label="Recebido em agosto" value="R$ 4.180" delta="+12% vs. julho" tone="up" />
        <Stat label="A receber" value="R$ 860" delta="4 atendimentos" />
        <Stat label="Ticket médio" value="R$ 196" />
      </div>
      {!KNOWN_FINANCE.has(section) ? (
        <ComingSoon label={title} />
      ) : section === 'resumo' ? (
        <Card padding="none">
          <EmptyState
            icon={<BarChart3 size={22} strokeWidth={1.75} />}
            title="Gráficos de receita em breve"
            description="Os gráficos de receita e ocupação ainda não fazem parte deste design system — deixado propositalmente em branco."
          />
        </Card>
      ) : (
        <>
          <ViewHeader title="Pagamentos pendentes" />
          <Card padding="none">
            {PENDING_PAYMENTS.map((p, i) => (
              <div
                key={p.name}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <Avatar name={p.name} size="md" />
                <div style={{ flex: 1, minWidth: 0, ...vcol('2px') }}>
                  <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>{p.name}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{p.service}</span>
                </div>
                <div style={{ ...vcol('2px'), alignItems: 'flex-end' }}>
                  <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>{p.amount}</span>
                  <Badge tone={p.late ? 'error' : 'warning'}>{p.due}</Badge>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

function RelatoriosView() {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Stat label="Atendimentos no mês" value="72" delta="+8 vs. julho" tone="up" />
        <Stat label="Taxa de comparecimento" value="94%" />
        <Stat label="Novos clientes" value="11" />
      </div>
      <Card padding="none">
        <EmptyState
          icon={<BarChart3 size={22} strokeWidth={1.75} />}
          title="Relatórios em breve"
          description="Gráficos de receita e ocupação ainda não foram definidos neste design system — deixado propositalmente em branco."
        />
      </Card>
    </div>
  );
}

function ConfigView({ section, title }: { section: string; title: string }) {
  const [week, setWeek] = React.useState(DEFAULT_WEEK);
  const [buffer, setBuffer] = React.useState('10');
  const [r24, setR24] = React.useState(true);
  const [r1, setR1] = React.useState(true);
  const [daily, setDaily] = React.useState(false);

  if (!KNOWN_CONFIG.has(section)) {
    return (
      <div style={{ ...vcol('var(--space-4)'), maxWidth: 600 }}>
        <ComingSoon label={title} />
      </div>
    );
  }

  return (
    <div style={{ ...vcol('var(--space-4)'), maxWidth: 600 }}>
      {section === 'perfil' && (
        <>
          <Card padding="md" style={vcol('var(--space-4)')}>
            <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Perfil público</span>
            <Input label="Nome exibido" defaultValue="Ana Beatriz Ramos" />
            <Input label="Registro profissional" defaultValue="CRP 06/123456" />
            <Select label="Fuso horário" defaultValue="sp" options={[{ value: 'sp', label: 'Brasília (GMT-3)' }, { value: 'mao', label: 'Manaus (GMT-4)' }]} />
          </Card>
          <Card padding="md" style={vcol('var(--space-3)')}>
            <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Encerrar conta</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Seus agendamentos futuros serão cancelados e os clientes avisados.</span>
            <Button variant="error" style={{ alignSelf: 'flex-start' }}>
              Excluir conta
            </Button>
          </Card>
        </>
      )}
      {section === 'grade' && (
        <Card padding="md" style={vcol('var(--space-4)')}>
          <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Grade horária</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: -8 }}>Só os horários dentro da sua grade aparecem no link público.</span>
          <WeeklyScheduleEditor value={week} buffer={buffer} onChange={setWeek} onBufferChange={setBuffer} />
        </Card>
      )}
      {section === 'lembretes' && (
        <Card padding="md" style={vcol('var(--space-4)')}>
          <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Lembretes e avisos</span>
          <Switch label="Lembrete 24h antes" description="Enviado por WhatsApp ao cliente." checked={r24} onChange={(e) => setR24(e.target.checked)} />
          <Switch label="Lembrete 1h antes" checked={r1} onChange={(e) => setR1(e.target.checked)} />
          <Switch label="Resumo diário por e-mail" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
        </Card>
      )}
    </div>
  );
}
