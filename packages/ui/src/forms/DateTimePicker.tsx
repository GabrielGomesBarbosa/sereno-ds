'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { CalendarGrid } from './_internal/CalendarGrid';

export interface TimeSlot {
  value: string;
  /** Hard-blocked — unclickable regardless of `capacity`/`booked`. */
  disabled?: boolean;
  /** Total spots this slot holds — a group session, a class. Omit for a
   *  plain 1:1 slot with no capacity tracking (the original contract). */
  capacity?: number;
  /** How many are already booked into it. */
  booked?: number;
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
  /**
   * Slot labels ("09:00") or `TimeSlot` objects. A slot with `capacity` set
   * shows "booked/capacity" and switches to a full/overbook-warning look
   * once reached (SS-64) — still pickable unless also `disabled`, since a
   * full slot and a *blocked* one are different things: the first is a
   * deliberate "yes, overbook it" the caller can still choose to allow.
   */
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
              const capacity = typeof t === 'object' ? t.capacity : undefined;
              const booked = typeof t === 'object' ? (t.booked ?? 0) : 0;
              // Full ≠ blocked: a full slot is still pickable (a deliberate
              // overbook) unless the caller *also* set `disabled` — that's
              // the actual hard "no" (SS-64).
              const full = capacity !== undefined && booked >= capacity;
              const sel = selectedTime === val;
              const vagasLabel = capacity !== undefined ? `${booked} de ${capacity} vagas` : undefined;
              return (
                <button
                  key={val}
                  type="button"
                  disabled={dis}
                  aria-label={vagasLabel ? `${val} — ${full ? 'lotado, ' : ''}${vagasLabel}` : undefined}
                  onClick={() => onSelectTime && onSelectTime(val)}
                  className="sereno-dtp-time"
                  style={sx({
                    height: capacity !== undefined ? 'auto' : 'var(--control-height-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: capacity !== undefined ? 'var(--space-2) 0' : 0,
                    borderRadius: 'var(--radius-control)',
                    cursor: dis ? 'not-allowed' : 'pointer',
                    border:
                      'var(--border-width-hairline) solid ' +
                      (sel ? 'transparent' : full && !dis ? 'var(--interactive-warning)' : 'var(--border-default)'),
                    background: sel
                      ? 'var(--interactive-accent)'
                      : dis
                        ? 'var(--interactive-disabled-bg)'
                        : full
                          ? 'var(--status-warning-bg)'
                          : 'var(--bg-surface)',
                    color: sel
                      ? 'var(--interactive-accent-fg)'
                      : dis
                        ? 'var(--interactive-disabled-fg)'
                        : full
                          ? 'var(--status-warning-fg)'
                          : 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    transition: 'var(--transition-control)',
                    // Not inline outline:none — see .sereno-dtp-time in styles.css.
                  })}
                >
                  <span aria-hidden={!!vagasLabel}>{val}</span>
                  {vagasLabel && (
                    <span
                      aria-hidden
                      style={sx({
                        fontSize: 'var(--text-2xs)',
                        fontWeight: 'var(--weight-medium)',
                        color: sel ? 'inherit' : full ? 'var(--status-warning-fg)' : 'var(--text-muted)',
                        opacity: sel ? 0.85 : 1,
                      })}
                    >
                      {full ? 'Lotado' : vagasLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
