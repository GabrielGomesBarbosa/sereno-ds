'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { srOnlyStyle } from '../_internal/srOnly';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { useIsoLayoutEffect } from '../_internal/useIsoLayoutEffect';
import { useLatest } from '../_internal/useLatest';
import { useCoarsePointer } from '../_internal/useCoarsePointer';
import { useMenuPlacement } from '../_internal/useMenuPlacement';
import { revealInList, useRevealActive } from '../_internal/useRevealActive';
import { MenuOption, menuListStyle, menuRowPadY, menuSurfaceStyle } from '../_internal/MenuOption';
import { fieldBoxStyle } from './_internal/fieldBoxStyle';

export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Every string the component says. Defaults come from `locale`; pass `labels` to change some. */
export interface AutocompleteLabels {
  /** Placeholder of the text box while nothing is chosen. */
  placeholder: string;
  /** aria-label of the clear (×) button. */
  clear: string;
  /** aria-label of the chevron button while the list is closed. */
  open: string;
  /** aria-label of the chevron button while the list is open. */
  close: string;
  /** What a screen reader hears while `loading` (the list itself shows only a spinner). */
  loading: string;
  /** The row shown when no option is left to show. */
  empty: string;
  /** What a screen reader hears when the list changes size. */
  results: (count: number) => string;
}

const TEXT: Record<'pt-BR' | 'en', AutocompleteLabels> = {
  'pt-BR': {
    placeholder: 'Buscar…',
    clear: 'Limpar seleção',
    open: 'Abrir lista',
    close: 'Fechar lista',
    loading: 'Carregando…',
    empty: 'Nenhum resultado',
    results: (n) => (n === 1 ? '1 resultado' : n + ' resultados'),
  },
  en: {
    placeholder: 'Search…',
    clear: 'Clear selection',
    open: 'Open list',
    close: 'Close list',
    loading: 'Loading…',
    empty: 'No results',
    results: (n) => (n === 1 ? '1 result' : n + ' results'),
  },
};

/**
 * Single choice from a list you search by typing. Like `Select`, but the box is a text field: type
 * to narrow the list, pick one row, and the value is that row. For a list too long to scroll
 * (past ~12 options), or one the server searches and pages (a thousand clients, fifty at a time).
 *
 * The value is the chosen option itself, `{ value, label }`, and it carries its own label. The
 * box shows `value.label` whether or not that option is in `options` right now, which is what
 * keeps the label when the page it came from is no longer loaded. `options` is only what the list
 * shows. `onValueChange` gives the option (or `null` when cleared), not a string.
 *
 * Two kinds of search, one prop apart:
 *  - the default filters `options` itself, as you type (case and accents ignored);
 *  - `filter={false}` leaves the list alone and tells you what was typed (`onSearch`, debounced),
 *    for a list the server already filtered.
 *
 * It is a text box, not free text: what is typed never becomes the value. Leaving the box puts the
 * chosen label back.
 */
export interface AutocompleteProps {
  label?: string;
  hint?: string;
  /** Error message; also turns the control red. */
  error?: string;
  required?: boolean;
  /** What the list shows now. Appending rows while it is open is fine: the list keeps its scroll. */
  options?: AutocompleteOption[];
  /** Controlled value: the chosen option, or `null` for none. */
  value?: AutocompleteOption | null;
  /** Uncontrolled initial value. */
  defaultValue?: AutocompleteOption | null;
  /** The chosen option, or `null` when the value is cleared. */
  onValueChange?: (option: AutocompleteOption | null) => void;
  /**
   * How typing narrows `options`. `true` (default): keep the rows whose label contains the text,
   * ignoring case and accents. `false`: show `options` as they are (the server did the filtering).
   * A function decides per row.
   */
  filter?: boolean | ((option: AutocompleteOption, query: string) => boolean);
  /**
   * The text to search for changed: fired as the user types (after `debounce`) and with `''` once
   * the box goes back to showing the chosen label (pick, clear, leave, Esc). Never with the label
   * itself, so it is safe to run the query here. Use it with `filter={false}`.
   */
  onSearch?: (query: string) => void;
  /** Debounce for `onSearch` while typing, in ms. */
  debounce?: number;
  /** The list is waiting for rows: a spinner under them (or alone), the list marked busy, and a screen reader told. */
  loading?: boolean;
  /**
   * The list was scrolled to within about five rows of its end. Fires once per list size, never
   * while `loading`. Pass it only while there is a next page, so a list that is complete asks for nothing.
   */
  onReachEnd?: () => void;
  /** The list opened or closed. For a list that loads when it opens. */
  onOpenChange?: (open: boolean) => void;
  /** A × button, and an emptied box clears the value. */
  clearable?: boolean;
  /** Shown in muted text while nothing is chosen. Defaults to the `locale` text. */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Form field name - mirrored to a hidden input so the chosen value can be submitted. */
  name?: string;
  id?: string;
  containerStyle?: React.CSSProperties;
  /**
   * Accessible name for the text box. Only needed when there's no visible `label`. Takes
   * precedence over `label` if both are set - don't pass both.
   */
  'aria-label'?: string;
  /** Reserve the hint/error row's height even with neither set - stops the field from growing
   *  the moment a validation message appears. */
  preserveHelperSpace?: boolean;
  /** Language of the built-in texts. */
  locale?: 'pt-BR' | 'en';
  /** Override any built-in text. */
  labels?: Partial<AutocompleteLabels>;
}

/** How close to the end of the list, in rows, `onReachEnd` fires. */
const REACH_ROWS = 5;

const MARKS = /[̀-ͯ]/g;
const plain = (s: string) => s.normalize('NFD').replace(MARKS, '').toLowerCase();

function narrow(
  options: AutocompleteOption[],
  filter: AutocompleteProps['filter'],
  query: string,
): AutocompleteOption[] {
  if (filter === false) return options;
  const q = query.trim();
  if (!q) return options;
  if (typeof filter === 'function') return options.filter((o) => filter(o, query));
  const needle = plain(q);
  return options.filter((o) => plain(o.label).includes(needle));
}

/**
 * `ref` reaches the hidden `<input type="hidden">` that mirrors the chosen value (rendered only
 * when `name` is set - pass it, as `register()` does), the same as `Select`. A plain
 * `{...register(name)}` spread still won't validate on change: wire it through `Controller`, or
 * call the registered `onChange` yourself from `onValueChange`.
 */
export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(function Autocomplete(
  {
    label,
    hint,
    error,
    required,
    options = [],
    value: valueProp,
    defaultValue,
    onValueChange,
    filter = true,
    onSearch,
    debounce = 250,
    loading = false,
    onReachEnd,
    onOpenChange,
    clearable = true,
    placeholder,
    size = 'md',
    disabled,
    name,
    id,
    containerStyle,
    'aria-label': ariaLabel,
    preserveHelperSpace,
    locale = 'pt-BR',
    labels,
  },
  ref,
) {
  const reactId = React.useId();
  const rid = id || reactId;
  const listboxId = `${rid}-listbox`;
  const copy: AutocompleteLabels = { ...TEXT[locale], ...labels };
  const coarse = useCoarsePointer();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // ── value: the chosen option, with its own label ──
  const isControlled = valueProp !== undefined;
  const [inner, setInner] = React.useState<AutocompleteOption | null>(defaultValue ?? null);
  const value = isControlled ? valueProp : inner;
  const valueLabel = value?.label ?? '';

  // ── the text box: the chosen label, until the user types (`draft`) ──
  const [draft, setDraft] = React.useState<string | null>(null);
  const text = draft ?? valueLabel;
  const query = draft ?? '';

  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  // The active row is the chosen one only because the list opened on it, not because the user went
  // there: set by opening, cleared by the first thing the user does to the highlight.
  const activeFromOpen = React.useRef(false);
  const pick = (key: string | null) => {
    activeFromOpen.current = false;
    setActiveKey(key);
  };

  const visible = React.useMemo(() => narrow(options, filter, query), [options, filter, query]);
  const activeIndex = activeKey === null ? -1 : visible.findIndex((o) => o.value === activeKey && !o.disabled);
  const activeId = activeIndex >= 0 ? `${rid}-opt-${activeIndex}` : null;

  const rows = visible.length;
  const status = loading ? copy.loading : rows === 0 ? copy.empty : null;

  // ── open / close, told to the app once per change ──
  const onOpenChangeRef = useLatest(onOpenChange);
  const toldOpen = React.useRef(false);
  React.useEffect(() => {
    if (toldOpen.current === open) return;
    toldOpen.current = open;
    onOpenChangeRef.current?.(open);
  }, [open, onOpenChangeRef]);

  // ── search: told to the app when the query changes, debounced while typing ──
  const onSearchRef = useLatest(onSearch);
  const searchTimer = React.useRef<number | undefined>(undefined);
  const toldQuery = React.useRef('');
  React.useEffect(() => () => window.clearTimeout(searchTimer.current), []);
  const search = (q: string, immediate: boolean) => {
    window.clearTimeout(searchTimer.current);
    const run = () => {
      if (q === toldQuery.current) return;
      toldQuery.current = q;
      onSearchRef.current?.(q);
    };
    if (immediate) run();
    else searchTimer.current = window.setTimeout(run, debounce);
  };

  /** The box goes back to the chosen label: closes the list, drops what was typed, resets the query. */
  const settle = () => {
    setOpen(false);
    setDraft(null);
    search('', true);
  };

  const place = useMenuPlacement({
    open,
    anchorRef: boxRef,
    panelRef,
    itemCount: rows + (status ? 1 : 0),
    onDismiss: () => settle(),
  });
  // The chosen row can arrive after the list opened (a list that loads when it opens, on the page around
  // the chosen row). It is brought into view then, unless the user has already scrolled the list away
  // from the top: a user paging down for the next page is not carried off to a row that just landed.
  useRevealActive(open, activeId, place, revealInList, (el) => !activeFromOpen.current || (el.parentElement?.scrollTop ?? 0) === 0);

  // ── pagination: ask for more once the list is near its end ──
  const onReachEndRef = useLatest(onReachEnd);
  const askedFor = React.useRef<string | null>(null);
  // What the list is, for "once per size": a new search that happens to return as many rows is a new list.
  const shape = options.length + '|' + (options[0]?.value ?? '') + '|' + (options[options.length - 1]?.value ?? '');
  useIsoLayoutEffect(() => {
    if (!open) {
      askedFor.current = null;
      return;
    }
    const list = listRef.current;
    if (!list || rows === 0) return;
    const check = () => {
      if (loading || !onReachEndRef.current || askedFor.current === shape) return;
      const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
      if (remaining > (list.scrollHeight / rows) * REACH_ROWS) return;
      askedFor.current = shape;
      onReachEndRef.current();
    };
    check();
    list.addEventListener('scroll', check, { passive: true });
    return () => list.removeEventListener('scroll', check);
  }, [open, loading, shape, place, rows, onReachEndRef]);

  // A new search starts at the top.
  const firstValue = options[0]?.value;
  useIsoLayoutEffect(() => {
    if (draft !== null && listRef.current) listRef.current.scrollTop = 0;
  }, [draft, firstValue]);

  // iOS keeps the keyboard (and the field) up when you tap on plain page: close on any press outside.
  const settleRef = useLatest(settle);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (boxRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      settleRef.current();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, settleRef]);

  // ── choosing ──
  const firstEnabledKey = () => visible.find((o) => !o.disabled)?.value ?? null;
  const lastEnabledKey = () => {
    for (let i = rows - 1; i >= 0; i--) if (!visible[i].disabled) return visible[i].value;
    return null;
  };
  const move = (dir: 1 | -1) => {
    let i = activeIndex < 0 ? (dir === 1 ? -1 : rows) : activeIndex;
    for (let step = 0; step < rows; step++) {
      i += dir;
      if (i < 0 || i >= rows) return; // the ends are walls, not a loop: a paged list has no "wrap"
      if (!visible[i].disabled) {
        pick(visible[i].value);
        return;
      }
    }
  };

  const choose = (o: AutocompleteOption) => {
    if (o.disabled) return;
    if (!isControlled) setInner(o);
    onValueChange?.(o);
    setOpen(false);
    setDraft(null);
    search('', true);
    // On a phone the keyboard goes with the choice.
    if (coarse) inputRef.current?.blur();
  };
  const clear = () => {
    if (value) {
      if (!isControlled) setInner(null);
      onValueChange?.(null);
    }
    setDraft(''); // empty at once, even if the app takes a moment to take the value away
    search('', true);
    inputRef.current?.focus();
  };

  const selectedKey = value?.value;
  // Opening starts on the chosen row. If it is not in the list *yet* because the list is empty (it
  // loads when it opens), it stays the active one so it is revealed when it arrives. With rows on screen
  // that do not include it, it is not chased: the list is not moved under the user later.
  const startKey = (fallback: string | null) =>
    selectedKey !== undefined && (rows === 0 || visible.some((o) => o.value === selectedKey)) ? selectedKey : fallback;
  const openFromPointer = () => {
    activeFromOpen.current = true;
    setActiveKey(startKey(null));
    setOpen(true);
  };
  const openFromKey = () => {
    activeFromOpen.current = true;
    setActiveKey(startKey(firstEnabledKey()));
    setOpen(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.currentTarget.value;
    setDraft(next);
    // Filtering here, the first match is ready for Enter. A server search has not answered yet:
    // an Enter now would pick a row of the old answer, so nothing is active until the user moves.
    pick(filter === false ? null : narrow(options, filter, next).find((o) => !o.disabled)?.value ?? null);
    setOpen(true);
    if (next === '' && clearable && value) {
      if (!isControlled) setInner(null);
      onValueChange?.(null);
    }
    search(next, false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || e.nativeEvent.isComposing) return; // an IME is still composing the text
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openFromKey();
        else move(1);
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openFromKey();
        else move(-1);
        return;
      case 'Home':
      case 'End':
        if (open) {
          e.preventDefault();
          pick(e.key === 'Home' ? firstEnabledKey() : lastEnabledKey());
        }
        return;
      case 'Enter':
        // Closed: let the form have its Enter. Open: it is for the list, never a submit.
        if (open) {
          e.preventDefault();
          if (activeIndex >= 0) choose(visible[activeIndex]);
        }
        return;
      case 'Escape':
        if (open) {
          e.preventDefault();
          // Only the list closes: a Dialog around the field keeps its own Esc for the next press.
          // (`stopImmediate...` too: React may listen on `document`, where the Dialog listens as well.)
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          settle();
        }
        return;
      default:
    }
  };

  // Select the text on the way in, so typing replaces the label instead of appending to it. The click
  // that gave the focus would put the caret back, hence the second select.
  const selectOnClick = React.useRef(false);

  const fieldAria = fieldA11y(rid, { hint, error, required });
  const rowPadY = menuRowPadY(coarse, size);
  const fontSize = size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)';
  const showClear = clearable && !disabled && text !== '';

  const list = (
    <div
      ref={panelRef}
      // Keeps the focus in the text box: pressing the list (or its scrollbar) must not blur it.
      onMouseDown={(e) => e.preventDefault()}
      style={sx({
        ...menuSurfaceStyle(size),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: place?.maxH,
        ...(place?.strategy === 'fixed'
          ? {
              position: 'fixed',
              top: place.top,
              left: place.left,
              width: place.width,
              ...(place.above ? { transform: 'translateY(-100%)' } : null),
              zIndex: 1100,
            }
          : {
              position: 'absolute',
              left: 0,
              right: 0,
              ...(place?.above ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
              zIndex: 100,
            }),
      })}
    >
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel ?? label}
        aria-busy={loading || undefined}
        tabIndex={-1}
        style={sx({
          ...menuListStyle,
          position: 'relative', // so an option's offsetTop is measured from the list
          flex: '1 1 auto',
          minHeight: 0,
          padding: rows ? 'var(--space-1)' : 0,
          overscrollBehavior: 'contain', // don't chain the list's scroll to the page
        })}
      >
        {visible.map((o, i) => (
          <MenuOption
            key={o.value}
            id={`${rid}-opt-${i}`}
            label={o.label}
            selected={o.value === selectedKey}
            active={i === activeIndex}
            disabled={o.disabled}
            coarse={coarse}
            padY={rowPadY}
            // Pointer *move*, not enter: a list that scrolls under a still mouse (the keyboard
            // revealing a row) must not hand the highlight to whatever slid beneath it.
            onPointerMove={() => !o.disabled && pick(o.value)}
            onClick={() => choose(o)}
          />
        ))}
      </ul>
      {status && (
        // Loading is a lone spinner, no text and no rule above it: a screen reader gets the words from the
        // live region below, and this is for the eye. "No results" is the same row with words.
        <div
          aria-hidden="true"
          style={sx({
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: coarse ? 44 : undefined,
            padding: 'var(--space-3)',
            color: 'var(--text-muted)',
            fontSize: coarse ? 'var(--text-base)' : 'var(--text-sm)',
          })}
        >
          {loading ? (
            <span
              style={sx({
                flex: '0 0 auto',
                width: 18,
                height: 18,
                borderRadius: '999px',
                border: '2px solid var(--border-default)',
                borderTopColor: 'var(--text-brand)',
                animation: 'sereno-spin .7s linear infinite',
              })}
            />
          ) : (
            status
          )}
        </div>
      )}
    </div>
  );

  return (
    <Field label={label} hint={hint} error={error} required={required} requiredExposed htmlFor={rid} style={containerStyle} preserveHelperSpace={preserveHelperSpace}>
      <div style={sx({ position: 'relative', width: '100%' })}>
        <div
          ref={boxRef}
          // The padding around the text is part of the field: pressing it puts the caret in the box.
          onMouseDown={(e) => {
            if (e.target === inputRef.current || disabled) return;
            e.preventDefault();
            inputRef.current?.focus();
          }}
          style={sx({ ...fieldBoxStyle(size, !!error, focused || open, !!disabled), cursor: disabled ? 'not-allowed' : 'text' })}
        >
          <input
            ref={inputRef}
            id={rid}
            type="text"
            role="combobox"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={open && activeId ? activeId : undefined}
            aria-label={ariaLabel}
            {...fieldAria}
            // A text box that looks like a name or an address draws the browser's autofill and the
            // password managers. Best effort: Chrome ignores `autoComplete="off"`, and Bitwarden only
            // honors its attribute when the user turned that option on.
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            disabled={disabled}
            placeholder={placeholder ?? copy.placeholder}
            value={text}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={(e) => {
              setFocused(true);
              selectOnClick.current = true;
              e.currentTarget.select();
            }}
            onBlur={(e) => {
              setFocused(false);
              if (boxRef.current?.contains(e.relatedTarget as Node | null)) return;
              settle();
            }}
            onClick={(e) => {
              const el = e.currentTarget;
              if (selectOnClick.current && el.selectionStart === el.selectionEnd) el.select();
              selectOnClick.current = false;
              if (!open) openFromPointer();
            }}
            style={sx({
              flex: 1,
              minWidth: 0,
              margin: 0,
              padding: 0, // reset the UA input padding - the box's own padding insets it
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize,
              lineHeight: 1.2,
              textOverflow: 'ellipsis',
              color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
            })}
          />
          {showClear && (
            <button
              type="button"
              className="ds-affix-btn"
              tabIndex={-1}
              aria-label={copy.clear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            className="ds-affix-btn"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? copy.close : copy.open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              inputRef.current?.focus({ preventScroll: true });
              if (open) settle();
              else openFromPointer();
            }}
            style={sx({
              transition: 'transform var(--duration-fast) var(--ease-standard)',
              transform: open ? 'rotate(180deg)' : 'none',
            })}
          >
            <ChevronDown size={16} strokeWidth={1.75} />
          </button>
        </div>

        {open && place && place.strategy === 'inline' && list}
        {open && place && place.strategy === 'fixed' && createPortal(list, document.body)}

        {/* Always rendered, so the change of its text is what a screen reader announces. */}
        <div role="status" aria-live="polite" style={srOnlyStyle}>
          {open ? (loading ? copy.loading : rows === 0 ? copy.empty : copy.results(rows)) : ''}
        </div>
      </div>
      {name && <input ref={ref} type="hidden" name={name} value={value?.value ?? ''} />}
    </Field>
  );
});

Autocomplete.displayName = 'Autocomplete';
