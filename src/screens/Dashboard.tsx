'use client';

import * as React from 'react';
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Copy,
  Download,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Wallet,
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
  Switch,
  Tabs,
  Toast,
  WeeklyScheduleEditor,
} from '@/components';
import {
  CLIENTS,
  CLIENT_STATUS_LABEL,
  DASHBOARD_STATS,
  DEFAULT_WEEK,
  SERVICES_BY_SLUG,
  TODAY_APPOINTMENTS,
  UNAVAILABLE_DAYS,
} from '@/lib/mock';

type View = 'agenda' | 'clientes' | 'servicos' | 'financeiro' | 'config';

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} strokeWidth={1.75} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={18} strokeWidth={1.75} /> },
  { id: 'servicos', label: 'Serviços', icon: <Sparkles size={18} strokeWidth={1.75} /> },
  { id: 'financeiro', label: 'Financeiro', icon: <Wallet size={18} strokeWidth={1.75} /> },
  { id: 'config', label: 'Configurações', icon: <Settings size={18} strokeWidth={1.75} /> },
];

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

export function Dashboard() {
  const [view, setView] = React.useState<View>('agenda');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100dvh' }}>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-5) var(--space-3)', minHeight: '100%' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: 'var(--text-brand)', padding: '0 var(--space-2)' }}>Sereno</span>
            <nav style={vcol('2px')}>
              {NAV.map((n) => {
                const on = view === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setView(n.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '10px var(--space-3)',
                      border: 'none',
                      borderRadius: 'var(--radius-control)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: on ? 'var(--bg-brand-soft)' : 'transparent',
                      color: on ? 'var(--text-brand)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      fontWeight: on ? 600 : 500,
                      transition: 'var(--transition-control)',
                    }}
                  >
                    {n.icon}
                    {n.label}
                  </button>
                );
              })}
            </nav>
            <div style={{ marginTop: 'auto', ...vcol('var(--space-3)') }}>
              <Card padding="sm" elevation="none" style={{ background: 'var(--bg-accent-soft)', border: '1px solid transparent', ...vcol('6px') }}>
                <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Plano gratuito</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>18 de 20 agendamentos usados este mês.</span>
                <Button variant="accent" size="sm" fullWidth style={{ marginTop: 4 }} onClick={() => setToast('Redirecionando para os planos…')}>
                  Assinar agora
                </Button>
              </Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2)' }}>
                <Avatar name="Ana Beatriz Ramos" size="sm" />
                <div style={{ ...vcol('0'), minWidth: 0 }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ana Beatriz</span>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>Psicóloga clínica</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="dash-main" style={{ maxWidth: 'var(--container-app)' }}>
          {view === 'agenda' && <AgendaView onCancel={() => setDialogOpen(true)} />}
          {view === 'clientes' && <ClientesView />}
          {view === 'servicos' && <ServicosView />}
          {view === 'financeiro' && <FinanceiroView />}
          {view === 'config' && <ConfigView />}
        </main>
      </div>

      <div className="dash-bottomnav">
        <nav
          style={{
            display: 'flex',
            height: 'var(--bottom-nav-height)',
            background: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          {NAV.map((n) => {
            const on = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: on ? 'var(--text-brand)' : 'var(--text-muted)',
                }}
              >
                {n.icon}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', fontWeight: on ? 600 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

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
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'var(--space-6)', display: 'flex', justifyContent: 'center', zIndex: 80, padding: '0 var(--space-4)' }}>
          <Toast tone="success" title={toast} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

function ViewHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <h1 style={{ ...cardTitle, fontSize: 'var(--text-2xl)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
      {action}
    </div>
  );
}

function AgendaView({ onCancel }: { onCancel: () => void }) {
  const [filter, setFilter] = React.useState('hoje');
  const [limitShown, setLimitShown] = React.useState(true);
  const [acceptOnline, setAcceptOnline] = React.useState(true);

  return (
    <div style={vcol('var(--space-5)')}>
      <ViewHeader title="Agenda" action={<Button iconLeft={<Plus size={18} strokeWidth={1.75} />}>Novo agendamento</Button>} />

      {limitShown && (
        <Alert
          tone="info"
          title="Você usou 18 de 20 agendamentos deste mês"
          icon={<Wallet size={18} strokeWidth={1.75} />}
          onDismiss={() => setLimitShown(false)}
          action={<Button variant="accent" size="sm">Assinar agora</Button>}
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
        <div style={vcol('var(--space-3)')}>
          <Tabs
            variant="pill"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'hoje', label: 'Hoje', count: 5 },
              { value: 'semana', label: 'Semana', count: 23 },
              { value: 'mes', label: 'Mês' },
            ]}
          />
          {TODAY_APPOINTMENTS.map((a) => (
            <AppointmentCard
              key={a.time}
              time={a.time}
              date={a.date}
              client={a.client}
              service={a.service}
              channel={a.channel}
              status={a.status}
              actions={
                <div style={{ display: 'flex', gap: 4 }}>
                  {a.status === 'pending' && <Button size="sm">Confirmar</Button>}
                  <IconButton label="Cancelar" onClick={onCancel}>
                    <ChevronRight size={18} strokeWidth={1.75} />
                  </IconButton>
                </div>
              }
            />
          ))}
        </div>
        <div style={vcol('var(--space-4)')} className="dash-agenda-aside">
          <DateTimePicker year={2026} month={7} selectedDate={24} unavailable={UNAVAILABLE_DAYS} />
          <Card padding="md" style={vcol('var(--space-3)')}>
            <span style={{ ...cardTitle, fontSize: 'var(--text-base)' }}>Seu link público</span>
            <Input defaultValue="sereno.app/ana-ramos" readOnly suffix={<Copy size={16} strokeWidth={1.75} />} />
            <Switch label="Aceitar agendamentos online" checked={acceptOnline} onChange={(e) => setAcceptOnline(e.target.checked)} />
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
      <ViewHeader title="Clientes" action={<Button variant="secondary" iconLeft={<Download size={18} strokeWidth={1.75} />}>Exportar</Button>} />
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
      <ViewHeader title="Seus serviços" action={<Button iconLeft={<Plus size={18} strokeWidth={1.75} />}>Novo serviço</Button>} />
      {SERVICES_BY_SLUG['ana-ramos'].map((s) => (
        <ServiceCard key={s.id} name={s.name} duration={s.duration} price={s.price} description={s.description} tag={s.tag} />
      ))}
    </div>
  );
}

function FinanceiroView() {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <ViewHeader title="Financeiro" />
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Stat label="Recebido em agosto" value="R$ 4.180" />
        <Stat label="A receber" value="R$ 860" delta="4 atendimentos" />
        <Stat label="Ticket médio" value="R$ 196" />
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

function ConfigView() {
  const [week, setWeek] = React.useState(DEFAULT_WEEK);
  const [buffer, setBuffer] = React.useState('10');
  const [r24, setR24] = React.useState(true);
  const [r1, setR1] = React.useState(true);
  const [daily, setDaily] = React.useState(false);

  return (
    <div style={{ ...vcol('var(--space-4)'), maxWidth: 600 }}>
      <ViewHeader title="Configurações" />
      <Card padding="md" style={vcol('var(--space-4)')}>
        <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Perfil público</span>
        <Input label="Nome exibido" defaultValue="Ana Beatriz Ramos" />
        <Input label="Registro profissional" defaultValue="CRP 06/123456" />
        <Select label="Fuso horário" defaultValue="sp" options={[{ value: 'sp', label: 'Brasília (GMT-3)' }, { value: 'mao', label: 'Manaus (GMT-4)' }]} />
      </Card>
      <Card padding="md" style={vcol('var(--space-4)')}>
        <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Grade horária</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: -8 }}>Só os horários dentro da sua grade aparecem no link público.</span>
        <WeeklyScheduleEditor value={week} buffer={buffer} onChange={setWeek} onBufferChange={setBuffer} />
      </Card>
      <Card padding="md" style={vcol('var(--space-4)')}>
        <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Lembretes e avisos</span>
        <Switch label="Lembrete 24h antes" description="Enviado por WhatsApp ao cliente." checked={r24} onChange={(e) => setR24(e.target.checked)} />
        <Switch label="Lembrete 1h antes" checked={r1} onChange={(e) => setR1(e.target.checked)} />
        <Switch label="Resumo diário por e-mail" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
      </Card>
      <Card padding="md" style={vcol('var(--space-3)')}>
        <span style={{ ...cardTitle, fontSize: 'var(--text-lg)' }}>Encerrar conta</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Seus agendamentos futuros serão cancelados e os clientes avisados.</span>
        <Button variant="error" style={{ alignSelf: 'flex-start' }}>
          Excluir conta
        </Button>
      </Card>
    </div>
  );
}
