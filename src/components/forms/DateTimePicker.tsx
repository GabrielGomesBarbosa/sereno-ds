'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

export interface TimeSlot {
  value: string;
  disabled?: boolean;
}

/**
 * Month calendar plus available time slots — the heart of the public booking flow.
 * Day names and month names render in pt-BR.
 */
export interface DateTimePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Defaults to the current month. */
  year?: number;
  /** 0-indexed month. */
  month?: number;
  selectedDate?: number;
  /** Slot labels ("09:00") or objects with `disabled`. */
  times?: (string | TimeSlot)[];
  selectedTime?: string;
  /** Day numbers with no availability — struck through and unclickable. */
  unavailable?: number[];
  onSelectDate?: (day: number) => void;
  onSelectTime?: (time: string) => void;
  timeLabel?: string;
}

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function daysIn(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function DateTimePicker({
  year,
  month,
  selectedDate,
  times = [],
  selectedTime,
  unavailable = [],
  onSelectDate,
  onSelectTime,
  timeLabel = 'Horários disponíveis',
  style,
  ...rest
}: DateTimePickerProps) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const total = daysIn(y, m);
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  return (
    <div
      {...rest}
      style={sx({
        background: 'var(--bg-surface)',
        border: 'var(--border-width-hairline) solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      })}
    >
      <div style={sx({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' })}>
        <span style={sx({ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', textTransform: 'capitalize' })}>
          {MONTHS[m]} {y}
        </span>
      </div>
      <div style={sx({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 'var(--space-1)', marginBottom: 'var(--space-1)' })}>
        {DOW.map((d, i) => (
          <span
            key={i}
            style={sx({
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-muted)',
              letterSpacing: 'var(--tracking-caps)',
            })}
          >
            {d}
          </span>
        ))}
      </div>
      <div style={sx({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 'var(--space-1)' })}>
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const off = unavailable.includes(d);
          const sel = selectedDate === d;
          return (
            <button
              key={i}
              type="button"
              disabled={off}
              onClick={() => onSelectDate && onSelectDate(d)}
              style={sx({
                height: 38,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: off ? 'not-allowed' : 'pointer',
                background: sel ? 'var(--interactive-primary)' : 'transparent',
                color: sel ? 'var(--interactive-primary-fg)' : off ? 'var(--text-disabled)' : 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: sel ? 'var(--weight-bold)' : 'var(--weight-medium)',
                textDecoration: off ? 'line-through' : 'none',
                transition: 'var(--transition-control)',
                outline: 'none',
              })}
            >
              {d}
            </button>
          );
        })}
      </div>
      {times.length > 0 && (
        <div style={sx({ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: 'var(--border-width-hairline) solid var(--border-subtle)' })}>
          <div
            style={sx({
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-secondary)',
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-3)',
            })}
          >
            {timeLabel}
          </div>
          <div style={sx({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(76px,1fr))', gap: 'var(--space-2)' })}>
            {times.map((t) => {
              const val = typeof t === 'string' ? t : t.value;
              const dis = typeof t === 'object' && t.disabled;
              const sel = selectedTime === val;
              return (
                <button
                  key={val}
                  type="button"
                  disabled={dis}
                  onClick={() => onSelectTime && onSelectTime(val)}
                  style={sx({
                    height: 'var(--control-height-md)',
                    borderRadius: 'var(--radius-control)',
                    cursor: dis ? 'not-allowed' : 'pointer',
                    border: 'var(--border-width-hairline) solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                    background: sel ? 'var(--interactive-accent)' : dis ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
                    color: sel ? 'var(--interactive-accent-fg)' : dis ? 'var(--interactive-disabled-fg)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    transition: 'var(--transition-control)',
                    outline: 'none',
                  })}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}