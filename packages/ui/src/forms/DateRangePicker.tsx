'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { CalendarGrid } from './_internal/CalendarGrid';
import type { CalendarDayContext, CalendarDayDots } from './_internal/calendarDots';
import { parseISODate as parseISO, toISODate as toISO } from './_internal/calendarRange';
import { DatePopoverField } from './_internal/DatePopoverField';

const TEXT = {
  'pt-BR': {
    placeholder: 'Selecionar período',
    dialogLabel: 'Escolher período',
    clearLabel: 'Limpar período',
    pickStart: 'Escolha a data inicial',
    pickEnd: 'Escolha a data final',
  },
  en: {
    placeholder: 'Pick a period',
    dialogLabel: 'Choose a period',
    clearLabel: 'Clear period',
    pickStart: 'Select the start date',
    pickEnd: 'Select the end date',
  },
} as const;

/**
 * A period: two ISO "YYYY-MM-DD" dates, `start` never after `end`. `{ start: '', end: '' }` is no value, the same
 * "empty string is nothing" the other fields use.
 */
export interface DateRange {
  start: string;
  end: string;
}

const EMPTY: DateRange = { start: '', end: '' };

/**
 * Imperative handle exposed via `ref`: the trigger is a `<button>` and the value plain state, so there is no native
 * element to read a value from. `focus()` covers `setFocus()`-on-error; read the value from `value` / `onChange`.
 */
export interface DateRangePickerHandle {
  focus: () => void;
}

export interface DateRangePickerProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Defaults to the `locale`-appropriate text ("Selecionar período" / "Pick a period"). */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Controlled value. A range with only one end set shows as no value. */
  value?: DateRange;
  /** Uncontrolled initial value. */
  defaultValue?: DateRange;
  /**
   * Fires with the **complete** range once the second end is picked (`start` already the earlier of the two), and with
   * `{ start: '', end: '' }` on clear. Never with a half-picked range: the first click only starts the pick.
   */
  onChange?: (value: DateRange) => void;
  /**
   * Earliest selectable date, ISO "YYYY-MM-DD", the same as `DatePicker`'s: every earlier day is struck through and the
   * calendar cannot be navigated before it.
   */
  min?: string;
  /** Latest selectable date, ISO "YYYY-MM-DD". The mirror image of `min`. */
  max?: string;
  /** Fires when the month on screen changes, with the new year and the 0-indexed month. Refresh `dayDots` / `renderDay` here. */
  onMonthChange?: (year: number, month: number) => void;
  /** Content under each day number, the same as `DatePicker`'s. `selected` is true on both ends of the range. */
  renderDay?: (day: number, context: CalendarDayContext) => React.ReactNode;
  /** The days that get a dot under their number, the same as `DatePicker`'s. Day numbers of the month on screen. */
  dayDots?: CalendarDayDots;
  /** What a screen reader says for a dot with no `label` of its own. Defaults to the `locale`-appropriate text. */
  dayDotLabel?: string;
  id?: string;
  containerStyle?: React.CSSProperties;
  /** aria-label for the clear (x) button. Defaults to the `locale`-appropriate text. */
  clearLabel?: string;
  /**
   * The real Sereno product always renders pt-BR - this only exists so the docs showcase can demo an English-speaking
   * consumer without forking the component. Default stays `'pt-BR'`.
   */
  locale?: 'pt-BR' | 'en';
  /** Reserve the hint/error row's height even with neither set. */
  preserveHelperSpace?: boolean;
}

/**
 * The range as the trigger shows it, or `''` when it is not a complete range. Each end is formatted exactly like the
 * `DatePicker` does ("10/05/2026"), and the two are joined with the separator the locale itself uses for a range:
 * `formatRange` would do both, but it drops the zero of a day or month in `en` ("10/5/2026"), and then the two pickers
 * would not show a date the same way. The separator comes from the browser, so no dash is written here.
 */
function formatDisplay(range: DateRange, locale: 'pt-BR' | 'en'): string {
  const a = parseISO(range.start);
  const b = parseISO(range.end);
  if (!a || !b) return '';
  const from = new Date(a.year, a.month, a.day);
  const to = new Date(b.year, b.month, b.day);
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (lo.getTime() === hi.getTime()) return fmt.format(lo);
  const separator = fmt.formatRangeToParts?.(lo, hi).find((p) => p.source === 'shared' && p.type === 'literal')?.value ?? ' - ';
  return fmt.format(lo) + separator + fmt.format(hi);
}

/**
 * Field for picking a **period**, a start and an end date, no time. A text-field-styled trigger showing the range opens
 * the same calendar `DatePicker` and `DateTimePicker` use, with the range drawn on it: the two ends picked, the days
 * between as a band, and, once the first end is picked, the stretch to the day under the pointer or the keyboard cursor,
 * so the interval is seen growing before the second click.
 *
 * The first click sets the start, the second sets the end (the two swap when the second is earlier), and the calendar
 * closes on the second. A second click on the same day is a period of one day. Escape closes without committing.
 * `onChange` fires with a complete range or, on clear, an empty one, never with half of one. A line inside the calendar
 * says what to pick next, as a polite live region.
 *
 * Everything around the calendar (the trigger, the clear button, where the popover sits, Escape, the outside press) is
 * `DatePopoverField`, shared with `DatePicker`.
 */
export const DateRangePicker = React.forwardRef<DateRangePickerHandle, DateRangePickerProps>(function DateRangePicker(
  {
    label,
    hint,
    error,
    required,
    placeholder,
    size = 'md',
    disabled = false,
    value,
    defaultValue,
    onChange,
    min,
    max,
    onMonthChange,
    renderDay,
    dayDots,
    dayDotLabel,
    id,
    containerStyle,
    clearLabel,
    locale = 'pt-BR',
    preserveHelperSpace,
  },
  ref,
) {
  const copy = TEXT[locale];
  const [inner, setInner] = React.useState<DateRange>(defaultValue ?? EMPTY);
  const current = value !== undefined ? value : inner;
  const start = parseISO(current.start);
  const now = React.useMemo(() => new Date(), []);

  // The first click of a pick in progress, as an ISO date; '' when there is none. It lives here, not in the calendar:
  // the calendar remounts on every open, and a pick that survives a month change is a pick of this field.
  const [anchor, setAnchor] = React.useState('');
  // The month shown: the one the range starts in, or today's, every time the popover opens.
  const [viewYear, setViewYear] = React.useState(start?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(start?.month ?? now.getMonth());

  const clear = () => {
    if (value === undefined) setInner(EMPTY);
    onChange?.(EMPTY);
  };

  return (
    <DatePopoverField
      ref={ref}
      label={label}
      hint={hint}
      error={error}
      required={required}
      size={size}
      disabled={disabled}
      id={id}
      containerStyle={containerStyle}
      preserveHelperSpace={preserveHelperSpace}
      text={formatDisplay(current, locale)}
      placeholder={placeholder ?? copy.placeholder}
      clearLabel={clearLabel ?? copy.clearLabel}
      dialogLabel={copy.dialogLabel}
      onClear={clear}
      onOpen={() => {
        setAnchor('');
        setViewYear(start?.year ?? now.getFullYear());
        setViewMonth(start?.month ?? now.getMonth());
      }}
      layoutKey={`${viewYear}-${viewMonth}`}
    >
      {({ close }) => (
        <>
          {/* What to pick next. Polite, so the change from the start to the end is announced without cutting in. */}
          <div
            role="status"
            aria-live="polite"
            style={sx({
              textAlign: 'center',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            })}
          >
            {anchor ? copy.pickEnd : copy.pickStart}
          </div>
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            range={anchor ? { start: anchor } : current}
            min={min}
            max={max}
            onMonthChange={(y, m) => {
              setViewYear(y);
              setViewMonth(m);
              onMonthChange?.(y, m);
            }}
            renderDay={renderDay}
            dayDots={dayDots}
            dayDotLabel={dayDotLabel}
            onSelectDate={(day) => {
              const iso = toISO(viewYear, viewMonth, day);
              if (!anchor) {
                setAnchor(iso); // the first end: the pick starts, the calendar stays open
                return;
              }
              const next: DateRange = iso < anchor ? { start: iso, end: anchor } : { start: anchor, end: iso };
              if (value === undefined) setInner(next);
              onChange?.(next);
              setAnchor('');
              close();
            }}
            squareCells
            trimEmptyRows
            locale={locale}
          />
        </>
      )}
    </DatePopoverField>
  );
});

DateRangePicker.displayName = 'DateRangePicker';
