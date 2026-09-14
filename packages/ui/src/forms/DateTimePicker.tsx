'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { CalendarGrid } from './_internal/CalendarGrid';

export interface TimeSlot {
  value: string;
  disabled?: boolean;
}

/**
 * Month calendar plus available time slots — the heart of the public booking flow.
 * Day names and month names render in pt-BR.
 *
 * The header navigates: ‹ / › step the month, and the centred title opens a
 * popover to jump straight to a month or year. `year` / `month` set the *initial*
 * view; the component then owns it. Pass `onMonthChange` to react to navigation
 * (e.g. fetch the new month's availability).
 *
 * The day grid uses roving tabindex (SS-228) — only one cell is ever in the
 * Tab order, so Tab enters/leaves it in one stop instead of one per day.
 * Arrow keys move by day/week and cross month boundaries on overflow;
 * Home/End move within the current week row; PageUp/PageDown step the
 * month. An `unavailable` day stays focusable (`aria-disabled`, not the
 * native `disabled` — a disabled button can't receive focus at all) so the
 * cursor can still land on it, just not select it.
 *
 * The calendar body itself (header + day grid) is `./_internal/CalendarGrid`
 * — shared with `DatePicker` (SS-243), which wraps the same grid in a
 * trigger+popover shell instead of this component's always-visible card.
 */
export interface DateTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Initial year. Defaults to the current year. */
  year?: number;
  /** Initial month, 0-indexed. Defaults to the current month. */
  month?: number;
  /** Selected day-of-month. The highlight only shows in the month it was picked
   *  in — navigating away and back to a *different* month never re-highlights it. */
  selectedDate?: number;
  /** Slot labels ("09:00") or objects with `disabled`. */
  times?: (string | TimeSlot)[];
  selectedTime?: string;
  /** Day numbers with no availability — struck through and unclickable. */
  unavailable?: number[];
  onSelectDate?: (day: number) => void;
  onSelectTime?: (time: string) => void;
  /** Fires whenever the visible month changes (arrows or the month/year popover). */
  onMonthChange?: (year: number, month: number) => void;
  /**
   * Extra content under each day number — a count badge, a dot, etc. Return
   * `null` for days with nothing to show. When set, every cell grows to keep the
   * grid even. It's the caller's job to scope this (e.g. future days only).
   */
  renderDay?: (day: number) => React.ReactNode;
  timeLabel?: string;
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
  onMonthChange,
  renderDay,
  timeLabel = 'Horários disponíveis',
  style,
  ...rest
}: DateTimePickerProps) {
  return (
    <div
      {...rest}
      style={sx({
        position: 'relative',
        background: 'var(--bg-surface)',
        border: 'var(--border-width-hairline) solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      })}
    >
      <CalendarGrid
        year={year}
        month={month}
        selectedDate={selectedDate}
        unavailable={unavailable}
        onSelectDate={onSelectDate}
        onMonthChange={onMonthChange}
        renderDay={renderDay}
      />
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
                  className="sereno-dtp-time"
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
                    // Not inline outline:none — see .sereno-dtp-time in styles.css.
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
