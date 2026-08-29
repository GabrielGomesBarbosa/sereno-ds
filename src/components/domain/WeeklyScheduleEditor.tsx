'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Switch } from '../forms/Switch';
import { Select } from '../forms/Select';

export interface DaySchedule {
  enabled: boolean;
  /** "HH:MM", 24h, on the 30-minute grid (07:00–21:00). */
  start: string;
  end: string;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WeekSchedule = Record<DayKey, DaySchedule>;

/**
 * Recurring weekly availability editor: one row per weekday with an on/off Switch,
 * start/end Selects, plus a buffer Select and a plain-language summary.
 * Lives in the professional's Settings view and in onboarding step 3.
 * Controlled via `value`/`onChange`, or uncontrolled from `defaultValue`.
 */
export interface WeeklyScheduleEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: WeekSchedule;
  defaultValue?: WeekSchedule;
  onChange?: (next: WeekSchedule) => void;
  /** Buffer minutes as a string: '0' | '5' | '10' | '15' | '30'. */
  buffer?: string;
  defaultBuffer?: string;
  onBufferChange?: (minutes: string) => void;
  /** Show the "Você atende Seg, Ter…" recap line. Default true. */
  showSummary?: boolean;
}

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Segunda', short: 'Seg' },
  { key: 'tue', label: 'Terça', short: 'Ter' },
  { key: 'wed', label: 'Quarta', short: 'Qua' },
  { key: 'thu', label: 'Quinta', short: 'Qui' },
  { key: 'fri', label: 'Sexta', short: 'Sex' },
  { key: 'sat', label: 'Sábado', short: 'Sáb' },
  { key: 'sun', label: 'Domingo', short: 'Dom' },
];

const HOURS = Array.from({ length: 29 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
});
const HOUR_OPTS = HOURS.map((v) => ({ value: v, label: v }));
const BUFFER_OPTS = [
  { value: '0', label: 'Sem intervalo' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
];

const DEFAULT: WeekSchedule = {
  mon: { enabled: true, start: '09:00', end: '18:00' },
  tue: { enabled: true, start: '09:00', end: '18:00' },
  wed: { enabled: true, start: '09:00', end: '18:00' },
  thu: { enabled: true, start: '09:00', end: '18:00' },
  fri: { enabled: true, start: '09:00', end: '17:00' },
  sat: { enabled: false, start: '09:00', end: '13:00' },
  sun: { enabled: false, start: '09:00', end: '13:00' },
};

export function WeeklyScheduleEditor({
  value,
  defaultValue,
  buffer,
  defaultBuffer = '10',
  onChange,
  onBufferChange,
  showSummary = true,
  className,
  style,
  ...rest
}: WeeklyScheduleEditorProps) {
  const [inner, setInner] = React.useState<WeekSchedule>(defaultValue || DEFAULT);
  const [innerBuf, setInnerBuf] = React.useState(defaultBuffer);
  const days = value || inner;
  const buf = buffer !== undefined ? buffer : innerBuf;
  const setDays = (next: WeekSchedule) => {
    if (!value) setInner(next);
    if (onChange) onChange(next);
  };
  const setBuf = (v: string) => {
    if (buffer === undefined) setInnerBuf(v);
    if (onBufferChange) onBufferChange(v);
  };
  const patch = (k: DayKey, p: Partial<DaySchedule>) => setDays({ ...days, [k]: { ...days[k], ...p } });
  const active = DAYS.filter((d) => days[d.key] && days[d.key].enabled);
  const invalid = (k: DayKey) => days[k].enabled && HOURS.indexOf(days[k].end) <= HOURS.indexOf(days[k].start);

  return (
    <div
      {...rest}
      className={['sereno-week-editor', className].filter(Boolean).join(' ')}
      style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style })}
    >
      <div style={sx({ display: 'flex', flexDirection: 'column' })}>
        {DAYS.map((d, i) => {
          const row = days[d.key] || { enabled: false, start: '09:00', end: '18:00' };
          const bad = invalid(d.key);
          return (
            <div
              key={d.key}
              className="sereno-week-row"
              style={sx({
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-3) 0',
                borderTop: i ? 'var(--border-width-hairline) solid var(--border-subtle)' : 'none',
                opacity: row.enabled ? 1 : 0.62,
                transition: 'opacity var(--duration-normal) var(--ease-standard)',
              })}
            >
              <Switch label={d.label} checked={row.enabled} onChange={(e) => patch(d.key, { enabled: e.target.checked })} />
              {row.enabled ? (
                <div className="sereno-week-times" style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>
                  <Select options={HOUR_OPTS} value={row.start} size="sm" onValueChange={(v) => patch(d.key, { start: v })} containerStyle={{ width: 104 }} />
                  <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' })}>até</span>
                  <Select
                    options={HOUR_OPTS}
                    value={row.end}
                    size="sm"
                    onValueChange={(v) => patch(d.key, { end: v })}
                    containerStyle={{ width: 104 }}
                    error={bad ? 'O fim precisa ser depois do início.' : undefined}
                  />
                </div>
              ) : (
                <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' })}>Sem atendimento</span>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={sx({
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'flex-end',
          paddingTop: 'var(--space-3)',
          borderTop: 'var(--border-width-hairline) solid var(--border-subtle)',
        })}
      >
        <Select
          label="Intervalo entre atendimentos"
          options={BUFFER_OPTS}
          value={buf}
          onValueChange={(v) => setBuf(v)}
          hint="Tempo livre reservado depois de cada sessão."
          containerStyle={{ width: '100%', maxWidth: 220 }}
        />
      </div>
      {showSummary && (
        <div
          style={sx({
            background: 'var(--bg-brand-soft)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-3) var(--space-4)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          })}
        >
          {active.length === 0
            ? 'Nenhum dia ativo — seu link público não vai mostrar horários.'
            : 'Você atende ' + active.map((d) => d.short).join(', ') + (buf !== '0' ? ', com ' + buf + ' min de intervalo entre atendimentos.' : '.')}
        </div>
      )}
    </div>
  );
}