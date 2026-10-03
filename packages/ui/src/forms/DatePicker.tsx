'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { CalendarGrid } from './_internal/CalendarGrid';
import { parseISODate as parseISO, toISODate as toISO } from './_internal/calendarRange';
import { fieldBoxStyle } from './_internal/fieldBoxStyle';

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

  const [open, setOpen] = React.useState(false);
  // The month currently shown in the popover - resets to the value's month
  // (or today's) every time the popover opens, via the conditional mount
  // below; CalendarGrid itself only takes year/month as its *initial* view.
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsed?.month ?? now.getMonth());

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const generatedId = React.useId();
  const rid = id || generatedId;

  React.useImperativeHandle(ref, () => ({ focus: () => triggerRef.current?.focus() }), []);

  // A plain `position: absolute` child of `rootRef` (itself `position:
  // relative`) - the same "inline" strategy Select's panel uses for its
  // common case, and the same one DateTimePicker's own month/year popover
  // already uses. The browser glues it to the trigger through *any* scroll
  // (page or a nested overflow container) for free - no JS measuring
  // position, no listening for scroll/resize, and critically, it never has
  // to close on scroll the way a `position: fixed` popover computed once
  // would (that was tried first here and didn't hold up - see PR history).
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

  const clear = () => {
    if (value === undefined) setInner('');
    onChange?.('');
    triggerRef.current?.focus();
  };


  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle} preserveHelperSpace={preserveHelperSpace}>
      <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
        {/* The bordered box lives on this wrapper `div`, not on a `<button>`
 - the open-trigger and the clear (×) button are real, independent
            sibling buttons inside it, since a button can't nest another. */}
        <div style={fieldBoxStyle(size, !!error, open, disabled)}>
          <button
            ref={triggerRef}
            id={rid}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            // Ties the trigger to the hint / error line below, so they are read when it takes focus.
            {...fieldA11y(rid, { hint, error })}
            onClick={() => (open ? setOpen(false) : openPopover())}
            style={sx({
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              border: 'none',
              background: 'transparent',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'inherit',
              textAlign: 'left',
            })}
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
              {iso ? formatDisplay(iso, locale) : (placeholder ?? copy.placeholder)}
            </span>
          </button>
          {iso && !disabled && (
            <button
              type="button"
              aria-label={clearLabel ?? copy.clearLabel}
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              style={sx({
                flex: '0 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: -4,
                padding: 4,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              })}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        {open && (
          <div
            role="dialog"
            aria-label={label || copy.dialogLabel}
            tabIndex={-1}
            style={sx({
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              // The 7-column grid needs some floor width to stay readable -
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
              min={min}
              max={max}
              onMonthChange={(y, m) => {
                setViewYear(y);
                setViewMonth(m);
              }}
              onSelectDate={commit}
              squareCells
              trimEmptyRows
              locale={locale}
            />
          </div>
        )}
      </div>
    </Field>
  );
});

DatePicker.displayName = 'DatePicker';
