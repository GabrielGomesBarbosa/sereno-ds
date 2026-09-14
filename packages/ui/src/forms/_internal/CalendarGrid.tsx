'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { sx } from '../../_internal/style';
import { IconButton } from '../../core/IconButton';

/**
 * The month calendar body — header (‹ / › month nav + a month/year jump
 * popover) and the day grid with roving-tabindex keyboard navigation
 * (SS-228). Shared by `DateTimePicker` (rendered inline, with an optional
 * time-slot list under it) and `DatePicker` (rendered inside its own
 * trigger+popover shell) — extracted so neither has to duplicate the
 * keyboard-grid math (SS-243). See `DateTimePicker`'s own doc comment for
 * the full behavior description; this component owns exactly the same
 * state and logic it always has, just without the outer card chrome or
 * the time-slot section, neither of which any of this depends on.
 */
export interface CalendarGridProps {
  year?: number;
  month?: number;
  selectedDate?: number;
  unavailable?: number[];
  onSelectDate?: (day: number) => void;
  onMonthChange?: (year: number, month: number) => void;
  renderDay?: (day: number) => React.ReactNode;
  /**
   * Day cells are perfect squares (`aspect-ratio`) instead of a fixed pixel
   * height — `DatePicker` (SS-243) opts into this since its popover can be
   * narrower than `DateTimePicker`'s own card, where a fixed height was
   * already tuned and shipped. Ignored when `renderDay` is set — that case
   * always needs the extra fixed height for its own content.
   */
  squareCells?: boolean;
  /**
   * Drop wholly-blank trailing rows instead of always padding to 6 (SS-243)
   * — `DateTimePicker` needs the fixed 6 rows so its *always-visible* card
   * never jumps height as you navigate months; `DatePicker`'s popover opens
   * and closes anyway, so a variable height per month reads better than a
   * dead empty row (e.g. a 30-day month starting on Sunday only needs 5).
   */
  trimEmptyRows?: boolean;
  /**
   * The product itself (Sereno's real booking app) always renders pt-BR —
   * this only exists so the docs showcase can demo an English-speaking
   * consumer without forking the component. Default stays `'pt-BR'`.
   */
  locale?: 'pt-BR' | 'en';
}

const I18N = {
  'pt-BR': {
    dow: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    monthsShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    prevMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    prevYear: 'Ano anterior',
    prevYears: 'Anos anteriores',
    nextYear: 'Próximo ano',
    nextYears: 'Próximos anos',
    pickerLabel: 'Escolher mês e ano',
  },
  en: {
    dow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    prevYear: 'Previous year',
    prevYears: 'Previous years',
    nextYear: 'Next year',
    nextYears: 'Next years',
    pickerLabel: 'Choose month and year',
  },
} as const;

function daysIn(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function CalendarGrid({
  year,
  month,
  selectedDate,
  unavailable = [],
  onSelectDate,
  onMonthChange,
  renderDay,
  squareCells = false,
  trimEmptyRows = false,
  locale = 'pt-BR',
}: CalendarGridProps) {
  const t = I18N[locale];
  const now = React.useMemo(() => new Date(), []);
  // One integer for the visible month — `year*12 + month`. Keeps ‹ / › arithmetic
  // (and rapid clicks) correct across year boundaries with no Date() juggling.
  // `year` / `month` are the *initial* view; the component then owns it. A
  // consumer that needs to reset the view (DatePicker, on reopen) remounts
  // this component instead — see its own comment.
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
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Roving tabindex for the day grid: only one cell is ever in the Tab
  // order (below), so Tab enters/leaves the whole grid in one stop instead
  // of one per day. `activeDay` is the day-of-month that cell represents —
  // clamped to the visible month's length at render (below), since it
  // persists across a month change (‹ / › or an arrow-key crossing) where
  // the same day number may no longer exist (e.g. the 31st, into February).
  const [activeDay, setActiveDay] = React.useState(() => {
    if (selectedDate) return selectedDate;
    const todayIndex = now.getFullYear() * 12 + now.getMonth();
    return todayIndex === initialIndex ? now.getDate() : 1;
  });
  // Set right before a keyboard move changes activeDay/viewIndex; consumed
  // by the layout effect below to focus the new cell once it's in the DOM —
  // never on an unrelated render (a prop change, a re-render from the
  // parent) or the initial mount.
  const shouldFocusDayRef = React.useRef(false);

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
  if (trimEmptyRows) {
    while (cells.length > 7 && cells.slice(-7).every((c) => c === null)) cells.length -= 7;
  }
  // A plain day cell is a perfect square via aspect-ratio when `squareCells`
  // is set — its height then tracks the grid's actual column width (SS-243:
  // DatePicker's popover can be narrower than DateTimePicker's own card)
  // instead of a fixed guess that only looks square at one particular width.
  // `renderDay` needs literal extra height for its own content underneath
  // the day number regardless, so that case always keeps a fixed height.
  const cellSizing: React.CSSProperties = renderDay ? { height: 48 } : squareCells ? { aspectRatio: '1' } : { height: 38 };
  const years = Array.from({ length: 12 }, (_, i) => yearBase + i);
  const rovingDay = Math.min(Math.max(1, activeDay), total);

  // Arrow keys move the roving cursor by real calendar days — crossing into
  // the adjacent month's grid when they overflow the visible one, rather
  // than stopping dead at the edge. Home/End stay within the current week
  // row; PageUp/PageDown step the month (reusing the same ‹ / › state
  // change, so onMonthChange fires identically either way).
  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    switch (e.key) {
      case 'ArrowRight':
        delta = 1;
        break;
      case 'ArrowLeft':
        delta = -1;
        break;
      case 'ArrowDown':
        delta = 7;
        break;
      case 'ArrowUp':
        delta = -7;
        break;
      case 'Home': {
        e.preventDefault();
        const row = Math.floor((first + rovingDay - 1) / 7);
        shouldFocusDayRef.current = true;
        setActiveDay(Math.max(1, row * 7 - first + 1));
        return;
      }
      case 'End': {
        e.preventDefault();
        const row = Math.floor((first + rovingDay - 1) / 7);
        shouldFocusDayRef.current = true;
        setActiveDay(Math.min(total, row * 7 + 7 - first));
        return;
      }
      case 'PageUp':
        e.preventDefault();
        shouldFocusDayRef.current = true;
        setViewIndex((i) => i - 1);
        return;
      case 'PageDown':
        e.preventDefault();
        shouldFocusDayRef.current = true;
        setViewIndex((i) => i + 1);
        return;
      default:
        return;
    }
    e.preventDefault();
    const next = new Date(viewYear, viewMonth, rovingDay + delta);
    const nextViewIndex = next.getFullYear() * 12 + next.getMonth();
    shouldFocusDayRef.current = true;
    if (nextViewIndex !== viewIndex) setViewIndex(nextViewIndex);
    setActiveDay(next.getDate());
  };

  // Runs after the grid above (keyed on viewIndex, so a month change remounts
  // it) has committed the DOM for the new activeDay/viewIndex — only then
  // does the target cell actually exist to focus.
  React.useLayoutEffect(() => {
    if (!shouldFocusDayRef.current) return;
    shouldFocusDayRef.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${rovingDay}"]`)?.focus();
  }, [viewIndex, rovingDay]);

  return (
    <div ref={rootRef}>
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
        <IconButton label={t.prevMonth} size="sm" onClick={() => setViewIndex((i) => i - 1)}>
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
          {t.months[viewMonth]} {viewYear}
          <ChevronDown size={15} strokeWidth={2} style={{ opacity: 0.6 }} />
        </button>

        <IconButton label={t.nextMonth} size="sm" onClick={() => setViewIndex((i) => i + 1)}>
          <ChevronRight size={18} strokeWidth={1.75} />
        </IconButton>

        {open && (
          <div
            ref={popRef}
            role="dialog"
            aria-label={t.pickerLabel}
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
                label={picker === 'month' ? t.prevYear : t.prevYears}
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
                label={picker === 'month' ? t.nextYear : t.nextYears}
                size="sm"
                onClick={() => (picker === 'month' ? setViewIndex((i) => i + 12) : setYearBase((b) => b + 12))}
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </IconButton>
            </div>

            <div className="sereno-dtp-grid" style={sx({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-1)' })}>
              {picker === 'month'
                ? t.monthsShort.map((mo, i) => (
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
        {t.dow.map((d, i) => (
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
      <div
        key={viewIndex}
        ref={gridRef}
        onKeyDown={onGridKeyDown}
        className="sereno-dtp-days"
        style={sx({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 'var(--space-1)' })}
      >
        {cells.map((d, i) => {
          // Blank cells still take the row height so the 6-row grid can't collapse.
          if (d === null) return <span key={i} aria-hidden style={cellSizing} />;
          const off = unavailable.includes(d);
          const sel = selectedDate === d && viewIndex === selectionIndex;
          const extra = renderDay?.(d);
          return (
            <button
              key={i}
              type="button"
              data-day={d}
              // Not the native `disabled` — an unavailable day stays a real,
              // focusable stop on the roving cursor (aria-disabled only) so
              // arrow-key navigation can still land on it and the user can
              // tell it exists, matching the WAI-ARIA date-grid pattern. A
              // truly `disabled` button can't receive focus at all, which
              // would make the roving tabindex below silently break.
              aria-disabled={off || undefined}
              tabIndex={d === rovingDay ? 0 : -1}
              aria-pressed={sel}
              onClick={() => {
                if (off) return;
                setSelectionIndex(viewIndex);
                // Keep the roving cursor in sync with a mouse pick too — a
                // click already moves real DOM focus onto this button
                // natively, so without this the *next* arrow press would
                // jump from wherever the keyboard cursor was left instead
                // of from the day the user can see is focused/selected.
                setActiveDay(d);
                onSelectDate?.(d);
              }}
              style={sx({
                ...cellSizing,
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
                // Not inline outline:none — that would always beat the
                // .sereno-dtp-days:focus-visible rule below no matter what
                // it says (inline style always outranks a class selector).
                // Suppressed as a class rule instead, same specificity as
                // the :focus-visible override that re-enables it.
              })}
            >
              <span>{d}</span>
              {renderDay ? <span style={sx({ display: 'flex', minHeight: 12, lineHeight: 1 })}>{extra}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
