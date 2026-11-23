'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { sx } from '../../_internal/style';
import { Field } from '../../_internal/Field';
import { fieldA11y } from '../../_internal/fieldA11y';
import { useIsoLayoutEffect } from '../../_internal/useIsoLayoutEffect';
import { useMenuPlacement } from '../../_internal/useMenuPlacement';
import { useOutsidePress } from '../../_internal/useOutsidePress';
import { fieldBoxStyle } from './fieldBoxStyle';
import { fieldBoxProps } from './fieldFrame';

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
 * Imperative handle of a date field - there's no single native element underneath (the trigger is a `<button>`, the
 * value plain state), so `ref` can't hand back something `.value`-readable the way a real `<input>` would. `focus()` is
 * real and covers `setFocus()`-on-error.
 */
export interface DatePopoverFieldHandle {
  focus: () => void;
}

/** What the calendar inside the popover can ask of the field around it. */
export interface DatePopoverApi {
  /** Closes the popover and gives the focus back to the trigger (a pick, or Escape). */
  close: () => void;
}

export interface DatePopoverFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  id?: string;
  containerStyle?: React.CSSProperties;
  /** Reserve the hint/error row's height even with neither set. */
  preserveHelperSpace?: boolean;
  /** The value as the trigger shows it, or `''` when there is none (the placeholder shows and the clear button hides). */
  text: string;
  placeholder: string;
  /** aria-label of the clear (x) button. */
  clearLabel: string;
  /** aria-label of the popover when the field has no `label`. */
  dialogLabel: string;
  /** The clear (x) button was pressed. The field gives the focus back to the trigger. */
  onClear: () => void;
  /** The popover is about to open: reset whatever the calendar should start from (the month it opens on, a half-picked range). */
  onOpen?: () => void;
  /**
   * Anything that changes the height of the calendar (the month changes the number of rows). The popover is
   * measured again when it changes, so a portalled one stays inside the window.
   */
  layoutKey?: React.Key;
  /** The calendar. Mounted when the popover opens and unmounted when it closes, so it starts fresh every time. */
  children: (api: DatePopoverApi) => React.ReactNode;
}

/**
 * The field around a calendar, shared by `DatePicker` and `DateRangePicker`: a text-field-styled trigger showing the
 * value, a clear (x) button once there is one, and the popover that holds the calendar. It owns everything that is
 * not about dates: where the popover sits (inline under the field, or portalled out of a Dialog), the outside press,
 * Escape, and the Tab order between the field and a portalled calendar. What a pick means, and how the value is shown,
 * is the caller's.
 */
export const DatePopoverField = React.forwardRef<DatePopoverFieldHandle, DatePopoverFieldProps>(function DatePopoverField(
  { label, hint, error, required, size = 'md', disabled = false, id, containerStyle, preserveHelperSpace, text, placeholder, clearLabel, dialogLabel, onClear, onOpen, layoutKey, children },
  ref,
) {
  const [open, setOpen] = React.useState(false);

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
  // than cut off). The month changes the row count, hence `layoutKey`. Runs before paint: no visible jump.
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
  }, [portalled, place, layoutKey]);

  // A press outside the field closes the calendar. The portalled calendar is outside `rootRef` in the DOM but
  // still part of the field, so both count as inside.
  useOutsidePress(open, [rootRef, popoverRef], () => setOpen(false));
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); // handled: a Dialog around the field keeps its own Esc for the next press
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  const openPopover = () => {
    if (disabled) return;
    onOpen?.();
    setOpen(true);
  };

  const api = React.useMemo<DatePopoverApi>(
    () => ({
      close: () => {
        setOpen(false);
        triggerRef.current?.focus();
      },
    }),
    [],
  );

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
      aria-label={label || dialogLabel}
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
      {children(api)}
    </div>
  );

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle} preserveHelperSpace={preserveHelperSpace}>
      <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
        {/* The bordered box lives on this wrapper `div`, not on a `<button>`
 - the open-trigger and the clear (×) button are real, independent
            sibling buttons inside it, since a button can't nest another. */}
        <div ref={boxRef} onKeyDown={onBoxKeyDown} {...fieldBoxProps(open)} style={fieldBoxStyle(size, !!error, disabled)}>
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
                color: text ? 'inherit' : 'var(--text-muted)',
              })}
            >
              {text || placeholder}
            </span>
          </button>
          {text && !disabled && (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                triggerRef.current?.focus();
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

DatePopoverField.displayName = 'DatePopoverField';
