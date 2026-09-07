'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { sx } from '../_internal/style';
import { IconButton } from '../core/IconButton';

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

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

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
  onMonthChange,
  renderDay,
  timeLabel = 'Horários disponíveis',
  style,
  ...rest
}: DateTimePickerProps) {
  const now = React.useMemo(() => new Date(), []);
  // One integer for the visible month — `year*12 + month`. Keeps ‹ / › arithmetic
  // (and rapid clicks) correct across year boundaries with no Date() juggling.
  // `year` / `month` are the *initial* view; the component owns it after mount
  // (re-mount with a `key` to force a different start).
  const initialIndex = (year ?? now.getFullYear()) * 12 + (month ?? now.getMonth());
  const [viewIndex, setViewIndex] = React.useState(initialIndex);
  const viewYear = Math.floor(viewIndex / 12);
  const viewMonth = viewIndex % 12;
  // `selectedDate` is only a day number, so remember which month that pick was
  // made in — the highlight shows only there, never on the same day of another
  // month you navigate to.
  const [selectionIndex, setSelectionIndex] = React.useState(initialIndex);
  const [open, setOpen] = React.useState(false);
  const [picker, setPicker] = React.useState<'month' | 'year'>('month');
  const [yearBase, setYearBase] = React.useState(() => (year ?? now.getFullYear()) - 5);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);

  // Notify on navigation — never on mount, always with the settled value.
  const onMonthChangeRef = React.useRef(onMonthChange);
  React.useEffect(() => {
    onMonthChangeRef.current = onMonthChange;
  });
  const didMount = React.useRef(false);
  React.useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    onMonthChangeRef.current?.(Math.floor(viewIndex / 12), viewIndex % 12);
  }, [viewIndex]);

  // close on outside pointer; move focus into the popover on open
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPicker('month');
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    const id = requestAnimationFrame(() => popRef.current?.focus());
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      cancelAnimationFrame(id);
    };
  }, [open]);

  const closePopover = React.useCallback(() => {
    setOpen(false);
    setPicker('month');
    titleRef.current?.focus();
  }, []);
  const toggleOpen = React.useCallback(() => {
    setOpen((v) => {
      if (v) setPicker('month');
      return !v;
    });
  }, []);

  const first = new Date(viewYear, viewMonth, 1).getDay();
  const total = daysIn(viewYear, viewMonth);
  // Always 6 rows (42 cells) so the calendar's height never shifts between
  // months — trailing blanks pad it out and carry the cell height too.
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length < 42) cells.push(null);
  const cellH = renderDay ? 48 : 38;
  const years = Array.from({ length: 12 }, (_, i) => yearBase + i);

  return (
    <div
      {...rest}
      ref={rootRef}
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
      <div
        style={sx({
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 'var(--space-1)',
          marginBottom: 'var(--space-3)',
        })}
      >
        <IconButton label="Mês anterior" size="sm" onClick={() => setViewIndex((i) => i - 1)}>
          <ChevronLeft size={18} strokeWidth={1.75} />
        </IconButton>

        <button
          ref={titleRef}
          type="button"
          className="sereno-dtp-title"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggleOpen}
          style={sx({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            margin: '0 auto',
            padding: '4px 8px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            textTransform: 'capitalize',
          })}
        >
          {MONTHS[viewMonth]} {viewYear}
          <ChevronDown size={15} strokeWidth={2} style={{ opacity: 0.6 }} />
        </button>

        <IconButton label="Próximo mês" size="sm" onClick={() => setViewIndex((i) => i + 1)}>
          <ChevronRight size={18} strokeWidth={1.75} />
        </IconButton>

        {open && (
          <div
            ref={popRef}
            role="dialog"
            aria-label="Escolher mês e ano"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                closePopover();
              }
            }}
            className="sereno-dtp-pop"
            style={sx({
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              width: 248,
              maxWidth: 'calc(100vw - 24px)',
              background: 'var(--bg-surface)',
              border: 'var(--border-width-hairline) solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-3)',
              outline: 'none',
            })}
          >
            <div
              style={sx({
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                marginBottom: 'var(--space-2)',
              })}
            >
              <IconButton
                label={picker === 'month' ? 'Ano anterior' : 'Anos anteriores'}
                size="sm"
                onClick={() => (picker === 'month' ? setViewIndex((i) => i - 12) : setYearBase((b) => b - 12))}
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </IconButton>

              {picker === 'month' ? (
                <button
                  type="button"
                  className="sereno-dtp-title"
                  onClick={() => {
                    setYearBase(viewYear - 5);
                    setPicker('year');
                  }}
                  style={sx({
                    margin: '0 auto',
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--text-primary)',
                  })}
                >
                  {viewYear}
                </button>
              ) : (
                <span
                  style={sx({
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-secondary)',
                  })}
                >
                  {years[0]}–{years[11]}
                </span>
              )}

              <IconButton
                label={picker === 'month' ? 'Próximo ano' : 'Próximos anos'}
                size="sm"
                onClick={() => (picker === 'month' ? setViewIndex((i) => i + 12) : setYearBase((b) => b + 12))}
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </IconButton>
            </div>

            <div className="sereno-dtp-grid" style={sx({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-1)' })}>
              {picker === 'month'
                ? MONTHS_SHORT.map((mo, i) => (
                    <button
                      key={mo}
                      type="button"
                      data-current={i === viewMonth || undefined}
                      aria-current={i === viewMonth ? 'true' : undefined}
                      onClick={() => {
                        setViewIndex(viewYear * 12 + i);
                        closePopover();
                      }}
                    >
                      {mo}
                    </button>
                  ))
                : years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      data-current={y === viewYear || undefined}
                      aria-current={y === viewYear ? 'true' : undefined}
                      onClick={() => {
                        setViewIndex(y * 12 + viewMonth);
                        setPicker('month');
                      }}
                    >
                      {y}
                    </button>
                  ))}
            </div>
          </div>
        )}
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
      {/* keyed on the month so cells remount cleanly — no bg transition when a
          slot morphs from one day to another on navigation. */}
      <div key={viewIndex} style={sx({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 'var(--space-1)' })}>
        {cells.map((d, i) => {
          // Blank cells still take the row height so the 6-row grid can't collapse.
          if (d === null) return <span key={i} aria-hidden style={{ height: cellH }} />;
          const off = unavailable.includes(d);
          const sel = selectedDate === d && viewIndex === selectionIndex;
          const extra = renderDay?.(d);
          return (
            <button
              key={i}
              type="button"
              disabled={off}
              aria-pressed={sel}
              onClick={() => {
                setSelectionIndex(viewIndex);
                onSelectDate?.(d);
              }}
              style={sx({
                height: cellH,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                padding: 0,
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
              <span>{d}</span>
              {renderDay ? <span style={sx({ display: 'flex', minHeight: 12, lineHeight: 1 })}>{extra}</span> : null}
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
