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
  Menu as MenuIcon,
  MessageSquare,
  Moon,
  Package,
  Percent,
  Plus,
  Rss,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Sun,
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
  Avatar,
  Badge,
  Brand,
  Button,
  Card,
  DateTimePicker,
  Dialog,
  EmptyState,
  IconButton,
  Input,
  Menu,
  type MenuEntry,
  SearchInput,
  Select,
  SidebarNav,
  type SidebarNavSection,
  Switch,
  Table,
  type TableSort,
  Tabs,
  ToastProvider,
  TopBar,
  useToast,
} from '@sereno-ds/ui';
import { ThemeToggle } from '@sereno-ds/ui';
import { useTheme } from 'next-themes';
import { AppointmentCard } from '@/domain/AppointmentCard';
import { ServiceCard } from '@/domain/ServiceCard';
import { WeeklyScheduleEditor } from '@/domain/WeeklyScheduleEditor';
import {
  AGENDA_SCHEDULE,
  CLIENTS,
  CLIENT_STATUS_LABEL,
  DASHBOARD_STATS,
  DEFAULT_WEEK,
  NOTIFICATIONS,
  SERVICES_BY_SLUG,
  UNAVAILABLE_DAYS,
  bookingCountsOf,
  weekendsOf,
  type Appointment,
  type ClientRow,
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

/** Today's date, pt-BR — `short` picks the abbreviated weekday ("Seg" vs "Segunda-feira"). */
function todayLabel(short: boolean): string {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: short ? 'short' : 'long',
    day: 'numeric',
    month: 'long',
  });
  const clean = s.replace(/\./g, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
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

function UserMenu({ onNavigate, onToast }: { onNavigate: (v: string) => void; onToast: (m: string) => void }) {
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

function DashboardShell() {
  const { toast } = useToast();
  const notify = React.useCallback((m: string) => toast.success(m), [toast]);
  const [view, setView] = React.useState<string>('agenda');
  const [navCollapsed, setNavCollapsed] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerRender, setDrawerRender] = React.useState(false);
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const openDrawer = () => {
    setDrawerRender(true);
    setDrawerOpen(true);
  };

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

  const brandFull = <Brand variant="lockup" size={22} />;
  const planFooter = (
    <Card padding="sm" elevation="none" style={{ background: 'var(--bg-accent-soft)', ...vcol('6px') }}>
      <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Plano gratuito</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>18 de 20 agendamentos usados este mês.</span>
      <Button variant="accent" size="sm" fullWidth style={{ marginTop: 4 }} onClick={() => notify('Redirecionando para os planos…')}>
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
            header={navCollapsed ? <Brand variant="symbol" size={26} /> : brandFull}
            footer={planFooter}
          />
        </div>

        <div className="dash-content">
          <TopBar
            title={pageTitle}
            subtitle={
              base === 'agenda' ? (
                <>
                  <span className="dash-date-full">{todayLabel(false)}</span>
                  <span className="dash-date-short">{todayLabel(true)}</span>
                </>
              ) : undefined
            }
            leading={
              <span className="dash-topbar-lead">
                <IconButton label="Abrir menu" variant="ghost" onClick={openDrawer}>
                  <MenuIcon size={20} strokeWidth={1.75} />
                </IconButton>
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
                {/* Hidden via CSS (not JS) below 900px so it can't flash on reload — the
                    toggle moves into the avatar menu there. See .dash-topbar-theme. */}
                <span className="dash-topbar-theme">
                  <ThemeToggle variant="ghost" />
                </span>
                <NotificationsMenu onToast={notify} />
                <span style={{ width: 1, height: 24, background: 'var(--border-default)', margin: '0 var(--space-1)' }} />
                <UserMenu onNavigate={setView} onToast={notify} />
              </div>
            }
          />
          <main className="dash-main">
            {base === 'agenda' && <AgendaView onCancel={() => setDialogOpen(true)} onToast={notify} />}
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
                  notify('Agendamento cancelado. A cliente foi avisada.');
                }}
              >
                Cancelar agendamento
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

export function Dashboard() {
  return (
    <ToastProvider position="top-right">
      <DashboardShell />
    </ToastProvider>
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
  const [calOff, setCalOff] = React.useState(UNAVAILABLE_DAYS);
  const [calCounts, setCalCounts] = React.useState(() => bookingCountsOf(2026, 7));

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
          <Tabs variant="pill" value={filter} onChange={setFilter}>
            <Tabs.List>
              <Tabs.Tab value="hoje" count={AGENDA_SCHEDULE[0].items.length}>
                Hoje
              </Tabs.Tab>
              <Tabs.Tab value="semana" count={weekCount}>
                Semana
              </Tabs.Tab>
              <Tabs.Tab value="mes">Mês</Tabs.Tab>
              <Tabs.Tab value="ano">Ano</Tabs.Tab>
              <Tabs.Tab value="personalizado">Personalizado</Tabs.Tab>
            </Tabs.List>
          </Tabs>
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
          <DateTimePicker
            year={2026}
            month={7}
            selectedDate={24}
            unavailable={calOff}
            onMonthChange={(y, m) => {
              setCalOff(weekendsOf(y, m));
              setCalCounts(bookingCountsOf(y, m));
            }}
            renderDay={(d) => (calCounts[d] ? <span className="dash-cal-count">{calCounts[d]}</span> : null)}
          />
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
  const [sort, setSort] = React.useState<TableSort | null>({ key: 'name', direction: 'asc' });
  const [openClient, setOpenClient] = React.useState<ClientRow | null>(null);
  const q = query.trim().toLowerCase();

  // The DS never reorders the rows — the screen sorts and hands the result back.
  const rows = React.useMemo(() => {
    const filtered = q ? CLIENTS.filter((c) => c.name.toLowerCase().includes(q)) : [...CLIENTS];
    if (!sort) return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof ClientRow;
    return [...filtered].sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'pt-BR') * dir);
  }, [q, sort]);

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
        <Table caption="Clientes" minWidth={460}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Cliente</Table.HeaderCell>
              <Table.HeaderCell>Histórico</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell srOnly width={44}>Abrir</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((c) => (
              <Table.Row key={c.name} selected={c.name === openClient?.name} onClick={() => setOpenClient(c)}>
                <Table.Cell>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Avatar name={c.name} size="sm" />
                    <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{c.name}</span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.sessions} · {c.last}</span>
                </Table.Cell>
                <Table.Cell>
                  <Badge tone={c.status}>{CLIENT_STATUS_LABEL[c.status]}</Badge>
                </Table.Cell>
                <Table.Cell align="right">
                  <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', verticalAlign: 'middle' }} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {openClient && <ClientDetailDialog client={openClient} onClose={() => setOpenClient(null)} />}
    </div>
  );
}

/**
 * A client's profile — Tabs' real-world use case for the `underline`
 * variant: page-level sections inside one view, not a filter. `Tabs.Panel`
 * does the section switch here instead of the screen hand-rolling it.
 */
function ClientDetailDialog({ client, onClose }: { client: ClientRow; onClose: () => void }) {
  const [tab, setTab] = React.useState('geral');

  const history = React.useMemo(() => AGENDA_SCHEDULE.flatMap((g) => g.items.filter((a) => a.client === client.name)), [client.name]);

  return (
    <Dialog size="lg" title={client.name} description={CLIENT_STATUS_LABEL[client.status]} dividers showClose onClose={onClose}>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="geral">Visão geral</Tabs.Tab>
          <Tabs.Tab value="historico" count={history.length || undefined}>
            Histórico
          </Tabs.Tab>
          <Tabs.Tab value="documentos">Documentos</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="geral" style={{ paddingTop: 'var(--space-4)' }}>
          <div style={vcol('var(--space-3)')}>
            <Card padding="md" style={vcol('var(--space-2)')}>
              {[
                ['Sessões', client.sessions],
                ['Última atividade', client.last],
                ['Status', CLIENT_STATUS_LABEL[client.status]],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{value}</span>
                </div>
              ))}
            </Card>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="historico" style={{ paddingTop: 'var(--space-4)' }}>
          {history.length === 0 ? (
            <EmptyState icon={<Clock size={22} strokeWidth={1.75} />} title="Sem sessões registradas" description="Essa semana de exemplo não tem nenhuma sessão para este cliente." />
          ) : (
            <div style={vcol('var(--space-2)')}>
              {history.map((a, i) => (
                <AppointmentCard key={a.date + a.time + i} compact client={a.client} service={a.service} time={a.time} date={a.date} channel={a.channel} status={a.status} />
              ))}
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="documentos" style={{ paddingTop: 'var(--space-4)' }}>
          <ComingSoon label="Documentos" />
        </Tabs.Panel>
      </Tabs>
    </Dialog>
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
    <div style={vcol('var(--space-5)')}>
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
          <Table caption="Pagamentos pendentes" minWidth={440}>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Cliente</Table.HeaderCell>
                <Table.HeaderCell align="right">Valor</Table.HeaderCell>
                <Table.HeaderCell>Vencimento</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {PENDING_PAYMENTS.map((p) => (
                <Table.Row key={p.name}>
                  <Table.Cell>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Avatar name={p.name} size="sm" />
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{p.name}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{p.service}</span>
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{p.amount}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge tone={p.late ? 'error' : 'warning'}>{p.due}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
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
