'use client';

import * as React from 'react';
import { CalendarGrid } from './_internal/CalendarGrid';
import type { CalendarDayContext, CalendarDayDots } from './_internal/calendarDots';
import { parseISODate as parseISO, toISODate as toISO } from './_internal/calendarRange';
import { DatePopoverField } from './_internal/DatePopoverField';

const TEXT = {
  'pt-BR': { placeholder: 'Selecionar data', dialogLabel: 'Escolher data', clearLabel: 'Limpar data' },
  en: { placeholder: 'Pick a date', dialogLabel: 'Choose a date', clearLabel: 'Clear date' },
} as const;

/**
 * Imperative handle exposed via `ref` - there's no single native element
 * underneath (the trigger is a `<button>`, the value a plain ISO string in
 * React state), so `ref` can't hand back something `.value`-readable the way
 * a real `<input>` would. `focus()` is real and covers `setFocus()`-on-error;
 * reading the current value still means the `value`/`onChange` props, not the
 * ref. `onChange(value: string)` also isn't a `ChangeEvent`, so a plain
 * `{...register(name)}` spread won't work regardless - use `Controller`.
 */
export interface DatePickerHandle {
  focus: () => void;
}

export interface DatePickerProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Defaults to the `locale`-appropriate text ("Selecionar data" / "Pick a date"). */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Controlled value, ISO "YYYY-MM-DD". */
  value?: string;
  /** Uncontrolled initial value, ISO "YYYY-MM-DD". */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Earliest selectable date, ISO "YYYY-MM-DD". Every day before it is struck through, and the
   * calendar cannot be navigated to an earlier month or year (the previous-month arrow disables,
   * PageUp and the arrow keys stop at the edge, the month / year popover disables what is out of
   * range). An initial value or month before it opens on `min`'s month.
   */
  min?: string;
  /** Latest selectable date, ISO "YYYY-MM-DD". The mirror image of `min`: later days are struck through and later months and years cannot be reached. */
  max?: string;
  /**
   * Fires when the month on screen changes (the arrows, or the month / year popover), with the
   * new year and the 0-indexed month. Not when the popover opens: it opens on the month of the
   * value, or on the current one. Refresh `dayDots` / `renderDay` here.
   */
  onMonthChange?: (year: number, month: number) => void;
  /**
   * Content under each day number (a count, a note), the same as `DateTimePicker`'s. The second
   * argument says whether the day is `selected`, `today` or `unavailable`. When set, the day cells
   * grow taller to hold it.
   */
  renderDay?: (day: number, context: CalendarDayContext) => React.ReactNode;
  /**
   * The days that get a dot under their number, the same as `DateTimePicker`'s: day numbers
   * (`[3, 17]`), or an object keyed by day number for a per-dot `tone` or `label`. Day numbers of
   * the month on screen, so refresh them in `onMonthChange`.
   */
  dayDots?: CalendarDayDots;
  /** What a screen reader says for a dot with no `label` of its own. Defaults to the `locale`-appropriate text. */
  dayDotLabel?: string;
  id?: string;
  containerStyle?: React.CSSProperties;
  /** aria-label for the clear (×) button. Defaults to the `locale`-appropriate text. */
  clearLabel?: string;
  /**
   * The real Sereno product always renders pt-BR - this only exists so the
   * docs showcase can demo an English-speaking consumer without forking the
   * component. Default stays `'pt-BR'`.
   */
  locale?: 'pt-BR' | 'en';
  /** Reserve the hint/error row's height even with neither set - stops the
   *  field from growing the moment a validation message appears. */
  preserveHelperSpace?: boolean;
}

function formatDisplay(iso: string, locale: 'pt-BR' | 'en'): string {
  const d = parseISO(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(d.year, d.month, d.day),
  );
}

/**
 * Field for picking a single date - no time, no slots (`DateTimePicker`'s
 * job). A text-field-styled trigger showing the selected date opens a
 * popover with the same calendar grid `DateTimePicker` uses (roving
 * tabindex, month/year jump - see `./_internal/CalendarGrid`), so the two
 * share every bit of calendar behavior (SS-243).
 *
 * Value contract matches the rest of the forms package: `value` /
 * `defaultValue` + `onChange(value)`, a plain ISO "YYYY-MM-DD" string -
 * drops in wherever `<input type="date">` would go, but themed instead of
 * the browser's own, and in pt-BR by default (the real Sereno product
 * always uses it; `locale="en"` exists only for docs/demo purposes). A
 * clear (×) button appears once a value is set.
 */
export const DatePicker = React.forwardRef<DatePickerHandle, DatePickerProps>(function DatePicker(
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
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const iso = value !== undefined ? value : inner;
  const parsed = parseISO(iso);
  const now = React.useMemo(() => new Date(), []);

  // The month currently shown in the popover - resets to the value's month
  // (or today's) every time the popover opens, via the conditional mount
  // of the calendar in `DatePopoverField`; CalendarGrid itself only takes
  // year/month as its *initial* view.
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsed?.month ?? now.getMonth());

  const clear = () => {
    if (value === undefined) setInner('');
    onChange?.('');
  };

  // The trigger, the clear button and the popover (inline under the field, or portalled out of a Dialog) are
  // `DatePopoverField`, shared with `DateRangePicker`; what is left here is what one date means.
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
      text={iso ? formatDisplay(iso, locale) : ''}
      placeholder={placeholder ?? copy.placeholder}
      clearLabel={clearLabel ?? copy.clearLabel}
      dialogLabel={copy.dialogLabel}
      onClear={clear}
      onOpen={() => {
        setViewYear(parsed?.year ?? now.getFullYear());
        setViewMonth(parsed?.month ?? now.getMonth());
      }}
      layoutKey={`${viewYear}-${viewMonth}`}
    >
      {({ close }) => (
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          selectedDate={parsed && parsed.year === viewYear && parsed.month === viewMonth ? parsed.day : undefined}
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
            const next = toISO(viewYear, viewMonth, day);
            if (value === undefined) setInner(next);
            onChange?.(next);
            close();
          }}
          squareCells
          trimEmptyRows
          locale={locale}
        />
      )}
    </DatePopoverField>
  );
});

DatePicker.displayName = 'DatePicker';
