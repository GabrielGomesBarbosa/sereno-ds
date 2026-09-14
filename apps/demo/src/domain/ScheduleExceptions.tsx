'use client';

import * as React from 'react';
import { CalendarOff, Trash2 } from 'lucide-react';
import { Button, EmptyState, IconButton, Input } from '@sereno-ds/ui';
import { sx } from './sx';

export interface DateException {
  /** ISO date, "YYYY-MM-DD" — always a specific day, never a range. */
  date: string;
  /** Short reason shown next to the date, e.g. "Feriado", "Viagem". */
  reason?: string;
}

/**
 * One-off blocks on top of the recurring grid (`WeeklyScheduleEditor`) —
 * a holiday, a trip, a personal day — without touching the weekly pattern
 * itself. Lives in the dashboard's "Bloqueios" destination.
 * Controlled via `value`/`onChange`, or uncontrolled from `defaultValue`.
 */
export interface ScheduleExceptionsProps {
  value?: DateException[];
  defaultValue?: DateException[];
  onChange?: (next: DateException[]) => void;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(iso: string): string {
  const d = parseISODate(iso);
  const s = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ScheduleExceptions({ value, defaultValue, onChange }: ScheduleExceptionsProps) {
  const [inner, setInner] = React.useState<DateException[]>(defaultValue || []);
  const list = value || inner;
  const set = (next: DateException[]) => {
    if (!value) setInner(next);
    onChange?.(next);
  };

  const [date, setDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const min = todayISO();
  const duplicate = date !== '' && list.some((e) => e.date === date);
  const canAdd = date !== '' && !duplicate;

  const add = () => {
    if (!canAdd) return;
    set([...list, { date, reason: reason.trim() || undefined }].sort((a, b) => a.date.localeCompare(b.date)));
    setDate('');
    setReason('');
  };
  const remove = (target: string) => set(list.filter((e) => e.date !== target));

  return (
    <div style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' })}>
      <div
        style={sx({
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-card)',
        })}
      >
        <div style={sx({ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexWrap: 'wrap' })}>
          <Input
            label="Data"
            type="date"
            min={min}
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            error={duplicate ? 'Essa data já está bloqueada.' : undefined}
            containerStyle={{ width: 176 }}
          />
          <Input
            label="Motivo"
            hint="Opcional"
            placeholder="Feriado, viagem…"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            containerStyle={{ flex: 1, minWidth: 180 }}
          />
        </div>
        <Button onClick={add} disabled={!canAdd} style={{ alignSelf: 'flex-end' }}>
          Bloquear data
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={22} strokeWidth={1.75} />}
          title="Nenhuma data bloqueada"
          description="Sua grade horária normal vale para todos os dias — bloqueie aqui só as exceções."
        />
      ) : (
        <div style={sx({ display: 'flex', flexDirection: 'column' })}>
          {list.map((e, i) => (
            <div
              key={e.date}
              style={sx({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) 0',
                borderTop: i ? 'var(--border-width-hairline) solid var(--border-subtle)' : 'none',
              })}
            >
              <div style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
                <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' })}>
                  {formatDate(e.date)}
                </span>
                {e.reason && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>{e.reason}</span>}
              </div>
              <IconButton label={`Remover bloqueio de ${formatDate(e.date)}`} variant="error" size="sm" onClick={() => remove(e.date)}>
                <Trash2 size={16} strokeWidth={1.75} />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
