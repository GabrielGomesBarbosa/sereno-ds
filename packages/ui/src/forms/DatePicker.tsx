'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { CalendarGrid } from './_internal/CalendarGrid';
import { fieldBoxStyle } from './_internal/fieldBoxStyle';

export interface DatePickerProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Controlled value, ISO "YYYY-MM-DD". */
  value?: string;
  /** Uncontrolled initial value, ISO "YYYY-MM-DD". */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Earliest selectable date, ISO "YYYY-MM-DD" — every day before it is unavailable. */
  min?: string;
  /** Latest selectable date, ISO "YYYY-MM-DD" — every day after it is unavailable. */
  max?: string;
  id?: string;
  containerStyle?: React.CSSProperties;
}

interface YMD {
  year: number;
  month: number;
  day: number;
}

function parseISO(iso: string | undefined): YMD | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

function toISO(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplay(iso: string): string {
  const d = parseISO(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d.year, d.month, d.day));
}

function daysIn(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Every day of (year, month) that falls before `min` or after `max`. */
function unavailableForMonth(year: number, month: number, min?: string, max?: string): number[] {
  if (!min && !max) return [];
  const minD = parseISO(min);
  const maxD = parseISO(max);
  const out: number[] = [];
  const total = daysIn(year, month);
  for (let day = 1; day <= total; day++) {
    if (minD && year * 372 + month * 31 + day < minD.year * 372 + minD.month * 31 + minD.day) {
      out.push(day);
      continue;
    }
    if (maxD && year * 372 + month * 31 + day > maxD.year * 372 + maxD.month * 31 + maxD.day) {
      out.push(day);
    }
  }
  return out;
}

/**
 * Field for picking a single date — no time, no slots (`DateTimePicker`'s
 * job). A text-field-styled trigger showing the selected date opens a
 * popover with the same calendar grid `DateTimePicker` uses (roving
 * tabindex, month/year jump — see `./_internal/CalendarGrid`), so the two
 * share every bit of calendar behavior (SS-243).
 *
 * Value contract matches the rest of the forms package: `value` /
 * `defaultValue` + `onChange(value)`, a plain ISO "YYYY-MM-DD" string —
 * drops in wherever `<input type="date">` would go, but themed and in
 * pt-BR instead of the browser's own (English, unstyled) date picker.
 */
export function DatePicker({
  label,
  hint,
  error,
  required,
  placeholder = 'Selecionar data',
  size = 'md',
  disabled = false,
  value,
  defaultValue,
  onChange,
  min,
  max,
  id,
  containerStyle,
}: DatePickerProps) {
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const iso = value !== undefined ? value : inner;
  const parsed = parseISO(iso);
  const now = React.useMemo(() => new Date(), []);

  const [open, setOpen] = React.useState(false);
  // The month currently shown in the popover — resets to the value's month
  // (or today's) every time the popover opens, via the conditional mount
  // below; CalendarGrid itself only takes year/month as its *initial* view.
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsed?.month ?? now.getMonth());

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const generatedId = React.useId();
  const rid = id || generatedId;

  // A plain `position: absolute` child of `rootRef` (itself `position:
  // relative`) — the same "inline" strategy Select's panel uses for its
  // common case, and the same one DateTimePicker's own month/year popover
  // already uses. The browser glues it to the trigger through *any* scroll
  // (page or a nested overflow container) for free — no JS measuring
  // position, no listening for scroll/resize, and critically, it never has
  // to close on scroll the way a `position: fixed` popover computed once
  // would (that was tried first here and didn't hold up — see PR history).
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const openPopover = () => {
    if (disabled) return;
    setViewYear(parsed?.year ?? now.getFullYear());
    setViewMonth(parsed?.month ?? now.getMonth());
    setOpen(true);
  };

  const commit = (day: number) => {
    const next = toISO(viewYear, viewMonth, day);
    if (value === undefined) setInner(next);
    onChange?.(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const unavailable = React.useMemo(() => unavailableForMonth(viewYear, viewMonth, min, max), [viewYear, viewMonth, min, max]);

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle}>
      <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
        <button
          ref={triggerRef}
          id={rid}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openPopover())}
          style={fieldBoxStyle(size, !!error, open, disabled)}
        >
          <CalendarIcon size={16} strokeWidth={1.75} style={{ flex: '0 0 auto', opacity: 0.7 }} />
          <span
            style={sx({
              flex: 1,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: iso ? 'inherit' : 'var(--text-muted)',
            })}
          >
            {iso ? formatDisplay(iso) : placeholder}
          </span>
        </button>

        {open && (
          <div
            role="dialog"
            aria-label={label || 'Escolher data'}
            tabIndex={-1}
            style={sx({
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              // The 7-column grid needs some floor width to stay readable —
              // a narrow field (e.g. a compact "Data" next to "Motivo")
              // would otherwise squeeze it. `left`/`right: 0` already
              // matches the trigger's own width for anything wider.
              minWidth: 272,
              zIndex: 20,
              background: 'var(--bg-surface)',
              border: 'var(--border-width-hairline) solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-3)',
              outline: 'none',
            })}
          >
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selectedDate={parsed && parsed.year === viewYear && parsed.month === viewMonth ? parsed.day : undefined}
              unavailable={unavailable}
              onMonthChange={(y, m) => {
                setViewYear(y);
                setViewMonth(m);
              }}
              onSelectDate={commit}
              squareCells
              trimEmptyRows
            />
          </div>
        )}
      </div>
    </Field>
  );
}
