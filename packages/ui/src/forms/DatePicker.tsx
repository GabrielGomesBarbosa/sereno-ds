'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { useIsoLayoutEffect } from '../_internal/useIsoLayoutEffect';
import { useMenuPlacement } from '../_internal/useMenuPlacement';
import { CalendarGrid } from './_internal/CalendarGrid';
import type { CalendarDayContext, CalendarDayDots } from './_internal/calendarDots';
import { parseISODate as parseISO, toISODate as toISO } from './_internal/calendarRange';
import { fieldBoxStyle } from './_internal/fieldBoxStyle';

const TEXT = {
  'pt-BR': { placeholder: 'Selecionar data', dialogLabel: 'Escolher data', clearLabel: 'Limpar data' },
  en: { placeholder: 'Pick a date', dialogLabel: 'Choose a date', clearLabel: 'Clear date' },
} as const;

/**
 * The widest a calendar gets once it leaves the field's own width, i.e. when portalled out of a Dialog. Its
 * cells are square, so it is as tall as it is wide: at the width of a wide dialog field it would be a
 * 450px-tall slab that covers the field and half the window. Inline it is untouched (still the field's width).
 */
const PORTALLED_MAX_WIDTH = 320;

/** What a keyboard can reach inside `root`, in tab order (the calendar's roving day has `tabindex="0"`, the others `-1`). */
function tabbables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex]')).filter((el) => el.tabIndex >= 0);
}

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

  const [open, setOpen] = React.useState(false);
  // The month currently shown in the popover - resets to the value's month
  // (or today's) every time the popover opens, via the conditional mount
  // below; CalendarGrid itself only takes year/month as its *initial* view.
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsed?.month ?? now.getMonth());

  const rootRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const generatedId = React.useId();
  const rid = id || generatedId;

  React.useImperativeHandle(ref, () => ({ focus: () => triggerRef.current?.focus() }), []);

  // Where the calendar sits. Normally a plain `position: absolute` child of
  // `rootRef` (itself `position: relative`) - the same "inline" strategy
  // Select's panel uses for its common case, and the same one DateTimePicker's
  // own month/year popover already uses. The browser glues it to the trigger
  // through *any* scroll (page or a nested overflow container) for free - no JS
  // measuring position, no listening for scroll/resize, and critically, it
  // never has to close on scroll the way a `position: fixed` popover computed
  // once would (that was tried first here and didn't hold up - see PR history).
  //
  // The one place that fails is inside a `position: fixed` container (a
  // Dialog): its body scrolls and clips an inline child, cutting the calendar
  // off. There `useMenuPlacement` answers 'fixed' (what Select and
  // Autocomplete already do) and the calendar is portalled to <body> at the
  // field's viewport rect, closing if the field moves. Outside a dialog nothing
  // changes: still inline, still below the field, never flipped (the hook's
  // `above` / `maxH` are not used at all: see `fitTop` for the portalled case).
  // `itemCount` is just the hook's height estimate; a calendar is not a list.
  const place = useMenuPlacement({
    open,
    anchorRef: boxRef,
    panelRef: popoverRef,
    itemCount: 8,
    onDismiss: () => setOpen(false),
  });
  const portalled = open && place?.strategy === 'fixed';

  // The hook picks "below" or "above" from a rough guess at the height, which suits a list capped at 288px but not
  // a calendar (about as tall as it is wide). So once the portalled calendar is on screen it is measured and kept
  // inside the window: under the field if it fits, else above it, else as far up as it needs (over the field rather
  // than cut off). The month changes the row count, hence the dependencies. Runs before paint: no visible jump.
  const [fitTop, setFitTop] = React.useState<number | null>(null);
  useIsoLayoutEffect(() => {
    const popover = popoverRef.current;
    const box = boxRef.current;
    if (!portalled || !popover || !box) return;
    const GAP = 6;
    const EDGE = 8;
    const field = box.getBoundingClientRect();
    const height = popover.offsetHeight;
    const viewport = window.innerHeight || document.documentElement.clientHeight || 900;
    const below = field.bottom + GAP;
    const above = field.top - GAP - height;
    setFitTop(below + height <= viewport - EDGE ? below : above >= EDGE ? above : Math.max(EDGE, viewport - EDGE - height));
  }, [portalled, place, viewYear, viewMonth]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      // The portalled calendar is outside `rootRef` in the DOM but still part of the field.
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); // handled: a Dialog around the field keeps its own Esc for the next press
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

  // Inline, the calendar follows the field in the DOM, so Tab walks field -> calendar -> next field on its
  // own. Portalled to the end of <body> it does not, so the focus is handed over by hand to keep that order.
  const onBoxKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || e.shiftKey || !portalled) return;
    const controls = tabbables(e.currentTarget);
    if (e.target !== controls[controls.length - 1]) return; // not the control the calendar follows
    const first = tabbables(popoverRef.current)[0];
    if (!first) return;
    e.preventDefault();
    first.focus();
  };

  const onPopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const controls = tabbables(boxRef.current);
    const field = controls[controls.length - 1]; // the control the calendar follows in the DOM
    const inside = tabbables(e.currentTarget);
    if (e.shiftKey && e.target === inside[0]) {
      e.preventDefault();
      field?.focus();
    } else if (!e.shiftKey && e.target === inside[inside.length - 1]) {
      // Not prevented on purpose: with the focus back on the field the Tab goes on to whatever follows it.
      setOpen(false);
      field?.focus();
    }
  };

  // One popover, two positions (see `useMenuPlacement` above): the calendar and its look are the same.
  const renderPopover = (position: React.CSSProperties) => (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={label || copy.dialogLabel}
      tabIndex={-1}
      onKeyDown={portalled ? onPopoverKeyDown : undefined}
      style={sx({
        ...position,
        // The 7-column grid needs some floor width to stay readable -
        // a narrow field (e.g. a compact "Data" next to "Motivo")
        // would otherwise squeeze it. `left`/`right: 0` already
        // matches the trigger's own width for anything wider.
        minWidth: 272,
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
          onMonthChange?.(y, m);
        }}
        renderDay={renderDay}
        dayDots={dayDots}
        dayDotLabel={dayDotLabel}
        onSelectDate={commit}
        squareCells
        trimEmptyRows
        locale={locale}
      />
    </div>
  );

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle} preserveHelperSpace={preserveHelperSpace}>
      <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
        {/* The bordered box lives on this wrapper `div`, not on a `<button>`
 - the open-trigger and the clear (×) button are real, independent
            sibling buttons inside it, since a button can't nest another. */}
        <div ref={boxRef} onKeyDown={onBoxKeyDown} style={fieldBoxStyle(size, !!error, open, disabled)}>
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

        {open && place?.strategy === 'inline' &&
          renderPopover({ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20 })}
        {open && place?.strategy === 'fixed' &&
          createPortal(
            renderPopover({
              position: 'fixed',
              top: fitTop ?? place.top, // `fitTop` is measured (see above); the hook's guess only holds the first, unpainted render
              left: place.left,
              width: Math.min(place.width, PORTALLED_MAX_WIDTH),
              boxSizing: 'border-box',
              zIndex: 1100, // above the Dialog (1000), level with Select / Autocomplete's portalled lists
            }),
            document.body,
          )}
      </div>
    </Field>
  );
});

DatePicker.displayName = 'DatePicker';
