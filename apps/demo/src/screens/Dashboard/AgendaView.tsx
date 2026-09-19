'use client';

import * as React from 'react';
import { Copy, Plus, Video, Wallet, X } from 'lucide-react';
import { Alert, Avatar, Button, Card, DateTimePicker, Dialog, IconButton, Input, Switch, Tabs, Typography } from '@sereno-ds/ui';
import { AppointmentCard } from '@/domain/AppointmentCard';
import { AGENDA_SCHEDULE, DASHBOARD_STATS, UNAVAILABLE_DAYS, bookingCountsOf, weekendsOf, type Appointment } from '@/lib/mock';
import { vcol, Stat, StatRow, ViewHeader } from './shared';

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

export function AgendaView({ onToast }: { onToast: (m: string) => void }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
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

      <StatRow>
        {DASHBOARD_STATS.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} delta={s.delta} tone={'tone' in s ? s.tone : undefined} />
        ))}
      </StatRow>

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
            <DayBlock key={g.key} g={g} onCancel={() => setDialogOpen(true)} onToast={onToast} />
          ))}
        </div>
        <div style={vcol('var(--space-4)')} className="dash-agenda-aside">
          {next && (
            <Card padding="md" style={vcol('var(--space-3)')}>
              <Typography variant="eyebrow" style={{ letterSpacing: '0.05em' }}>
                Próximo atendimento
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Avatar name={next.client} size="sm" />
                <div style={{ ...vcol('2px'), minWidth: 0 }}>
                  <Typography variant="h3" style={{ fontSize: 'var(--text-base)' }}>
                    {next.time} · {next.client}
                  </Typography>
                  <Typography variant="bodySm">
                    {next.service} · {next.channel}
                  </Typography>
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
            <Typography variant="h3" style={{ fontSize: 'var(--text-base)' }}>
              Seu link público
            </Typography>
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

      {dialogOpen && (
        <Dialog onClose={() => setDialogOpen(false)}>
          <Dialog.Header title="Cancelar agendamento?" description="A cliente será avisada por WhatsApp e o horário volta a ficar livre." />
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="error"
              onClick={() => {
                setDialogOpen(false);
                onToast('Agendamento cancelado. A cliente foi avisada.');
              }}
            >
              Cancelar agendamento
            </Button>
          </Dialog.Footer>
        </Dialog>
      )}
    </div>
  );
}
