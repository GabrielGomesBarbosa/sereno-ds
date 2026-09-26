'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { sx } from '../_internal/style';

/**
 * Action menu / dropdown — a `trigger` you supply plus a portalled panel of
 * items. Same mechanics as `Select`: `position: fixed` panel measured off the
 * trigger, flips up when there's no room, closes on outside pointerdown / `Escape`
 * / selection, and returns focus to the trigger. `role="menu"` with arrow-key
 * roving. Needs the `sereno-pop` keyframe from `@sereno-ds/ui/styles.css`.
 *
 * Opened with a click or tap, no row is highlighted until the pointer enters one
 * or the user arrows. Opened from the keyboard (Enter, Space or ArrowDown on the
 * trigger; ArrowUp for the last row) the first enabled row is active, with a
 * focus ring, so Enter acts straight away.
 *
 * ```tsx
 * <Menu
 *   trigger={<IconButton label="Conta"><User /></IconButton>}
 *   items={[
 *     { label: 'Configurações', icon: <Settings />, onClick: openSettings },
 *     { separator: true },
 *     { label: 'Sair', icon: <LogOut />, tone: 'danger', onClick: signOut },
 *   ]}
 * />
 * ```
 *
 * For a rich popover (a notifications list, say) pass a render function instead
 * of `items` — it receives `close`:
 * `<Menu trigger={…}>{(close) => <NotificationList onDone={close} />}</Menu>`
 */

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** `danger` paints the row in the error colour (destructive action). */
  tone?: 'default' | 'danger';
  /** Keep the menu open after activating (e.g. a toggle row). Default `false`. */
  keepOpen?: boolean;
}
/** A hairline rule between groups. */
export interface MenuSeparator {
  separator: true;
}
/** A non-interactive group caption. */
export interface MenuHeading {
  heading: string;
}
export type MenuEntry = MenuItem | MenuSeparator | MenuHeading;

const isItem = (e: MenuEntry): e is MenuItem => !('separator' in e) && !('heading' in e);

export interface MenuProps {
  /** The clickable element that opens the menu (an `IconButton`, `Button`, avatar button…). */
  trigger: React.ReactElement;
  /** Overlaid on the trigger — a notification count, a status dot. Sits in a
   *  `pointer-events: none` layer so a click still opens the menu. */
  adornment?: React.ReactNode;
  /** Structured rows. Omit when using the `children` render function. */
  items?: MenuEntry[];
  /** Rich panel content — receives `close`. Mutually exclusive with `items`. */
  children?: (close: () => void) => React.ReactNode;
  /** A block above the `items` — a name + email, a title. Not part of the keyboard roving. */
  header?: React.ReactNode;
  /** Accessible name for the panel, and a heading row when `items` is used. */
  label?: string;
  /** Which trigger edge the panel lines up with. Default `end` (right). */
  align?: 'start' | 'end';
  /** Panel width. Number → px; string → any CSS length. Default: fits the content (min 180). */
  width?: number | string;
  disabled?: boolean;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const GAP = 6;
const GUTTER = 12;

/** `left` is clamped so the panel is always fully on screen; `above` picks the
 *  vertical edge. On a narrow (phone) viewport `right` is set too — the panel
 *  spans the gutters (centred, full-width) instead of hanging off the trigger. */
type Place = { top?: number; bottom?: number; left: number; right?: number; above: boolean; maxH: number };

/** Phone-width viewport (`--bp-sm`). Width only — not `pointer: coarse`, which a
 *  trackpad / touch laptop reports on a full-size screen. */
const PHONE_W = 560;

export function Menu({ trigger, adornment, items, children, header, label, align = 'end', width, disabled, open: openProp, onOpenChange }: MenuProps) {
  const rid = React.useId();
  const menuId = `${rid}-menu`;
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const isControlled = openProp !== undefined;
  const [openState, setOpenState] = React.useState(false);
  const open = isControlled ? openProp! : openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);

  const [place, setPlace] = React.useState<Place | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  // How the user is driving the menu. `pointer` (opened by a click or tap, or the mouse
  // entered a row): nothing is highlighted until a row is hovered or arrowed to. `keyboard`
  // (anything else): the first row is active so Enter works straight away, and the active
  // row gets a focus ring. Unknown opens (a screen reader, the parent forcing `open`) take
  // the keyboard side, the one that stays operable without a pointer.
  const [inputMode, setInputMode] = React.useState<'pointer' | 'keyboard'>('keyboard');

  // A fresh open never inherits the last session's row or mode, whichever way it closed
  // (Escape, outside click, the trigger, the parent). Adjusted during render, not in an effect.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setActiveIndex(-1);
      setInputMode('keyboard');
    }
  }

  const itemIndexes = React.useMemo(() => (items ?? []).map((e, i) => (isItem(e) && !e.disabled ? i : -1)).filter((i) => i >= 0), [items]);

  const close = React.useCallback(
    (refocus = true) => {
      setOpen(false);
      if (refocus) {
        const btn = anchorRef.current?.querySelector<HTMLElement>('button, [role="button"], a, [tabindex]');
        btn?.focus({ preventScroll: true });
      }
    },
    [setOpen],
  );

  // Measure + place the panel while open. `left` is clamped to keep the whole
  // panel on screen (it can't just right-anchor — on a phone a 360px panel off a
  // trigger 300px from the left would run off the edge). Re-runs on scroll/resize;
  // closes if the trigger scrolls away (mirrors Select's fixed strategy). A
  // microtask re-measure picks up the real panel box once it's in the DOM.
  React.useLayoutEffect(() => {
    if (!open || !mounted) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const measure = (): Place => {
      const r = anchor.getBoundingClientRect();
      // Fall back to a *desktop* width when unmeasurable — never full-width a
      // menu just because a reading came back 0 (a real phone always reports).
      const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
      const vh = window.innerHeight || document.documentElement.clientHeight || 768;
      const roomBelow = vh - r.bottom - GUTTER;
      const roomAbove = r.top - GUTTER;
      const panelH = panelRef.current?.scrollHeight ?? 240;
      const above = roomBelow < Math.min(panelH, 200) && roomAbove > roomBelow;
      const maxH = Math.max(120, Math.round((above ? roomAbove : roomBelow) - GAP));
      const vert: Pick<Place, 'top' | 'bottom'> = above ? { bottom: Math.max(GUTTER, vh - r.top + GAP) } : { top: r.bottom + GAP };

      // Phone-width: span the gutters — centred, full-width — rather than hang off the trigger.
      if (vw <= PHONE_W) return { left: GUTTER, right: GUTTER, ...vert, above, maxH };

      const panelW = Math.min(panelRef.current?.offsetWidth || (typeof width === 'number' ? width : 240), vw - GUTTER * 2);
      const wanted = align === 'end' ? r.right - panelW : r.left;
      const left = Math.min(Math.max(GUTTER, wanted), vw - GUTTER - panelW);
      return { left, ...vert, above, maxH };
    };

    setPlace(measure());
    const raf = window.setTimeout(() => setPlace(measure()), 0); // real height now that the panel is in the DOM
    const anchorTop = anchor.getBoundingClientRect().top;
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      if (Math.abs(anchor.getBoundingClientRect().top - anchorTop) > 1) close(false);
      else setPlace(measure());
    };
    const onResize = () => setPlace(measure());
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(raf);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, mounted, align, width, close]);

  // Outside pointerdown closes.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      close(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, close]);

  // Move focus into the panel on open. Which row starts active depends on how it
  // was opened (see `effectiveActive`). The panel only mounts once `place` is measured,
  // so on the first open of an instance this has to wait for it (`placed`), or the
  // focus stays on the trigger and the arrow keys / Enter never reach the panel.
  // Leave it be if something inside already took focus (an `autoFocus` field in a rich panel).
  const placed = place !== null;
  React.useEffect(() => {
    const panel = panelRef.current;
    if (open && mounted && placed && panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
  }, [open, mounted, placed]);

  // Opened by a pointer, no row is active until one is hovered or arrowed to, so the
  // panel never looks hovered under a cursor that is still on the trigger.
  const effectiveActive = activeIndex >= 0 ? activeIndex : inputMode === 'pointer' ? -1 : itemIndexes[0] ?? -1;

  const activate = (i: number) => {
    const e = (items ?? [])[i];
    if (!e || !isItem(e) || e.disabled) return;
    e.onClick?.();
    if (!e.keepOpen) close();
  };

  const roverKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
      return;
    }
    if (ev.key === 'Tab') {
      close(false);
      return;
    }
    if (!items) return;
    const pos = itemIndexes.indexOf(effectiveActive);
    const last = itemIndexes[itemIndexes.length - 1];
    let next: number | undefined;
    if (ev.key === 'ArrowDown') next = itemIndexes[Math.min(pos + 1, itemIndexes.length - 1)];
    // From "nothing active" (pointer open) ArrowUp goes to the last row, like on the trigger.
    else if (ev.key === 'ArrowUp') next = pos < 0 ? last : itemIndexes[Math.max(pos - 1, 0)];
    else if (ev.key === 'Home') next = itemIndexes[0];
    else if (ev.key === 'End') next = last;
    else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      activate(effectiveActive);
      return;
    } else return;
    ev.preventDefault();
    setInputMode('keyboard');
    if (next !== undefined) setActiveIndex(next);
  };

  // `viaPointer` picks the starting state (see `inputMode`).
  const toggle = (viaPointer: boolean) => {
    if (disabled) return;
    if (!open) setInputMode(viaPointer ? 'pointer' : 'keyboard');
    setOpen(!open);
  };

  const triggerEl = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    onClick: (e: React.MouseEvent) => {
      (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
      // A real click or tap carries a click count (`detail` >= 1). Enter / Space on the
      // trigger, a screen reader and `element.click()` all report 0.
      toggle((e?.detail ?? 0) > 0);
    },
    // Menu button pattern: ArrowDown opens on the first row, ArrowUp on the last.
    onKeyDown: (e: React.KeyboardEvent) => {
      (trigger.props as { onKeyDown?: (e: React.KeyboardEvent) => void }).onKeyDown?.(e);
      if (e.defaultPrevented || disabled || open || !items) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      setInputMode('keyboard');
      setActiveIndex(e.key === 'ArrowUp' ? itemIndexes[itemIndexes.length - 1] ?? -1 : -1);
      setOpen(true);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    'data-menu-open': open || undefined,
  });

  const panelStyle = (p: Place): React.CSSProperties => {
    const full = p.right != null; // phone: left+right span the gutters, width is implied
    return sx({
      position: 'fixed',
      top: p.top,
      bottom: p.bottom,
      left: p.left,
      right: p.right,
      width: full ? undefined : width ?? 'max-content',
      minWidth: full ? undefined : width ?? 180,
      maxWidth: full ? undefined : `calc(100vw - ${GUTTER * 2}px)`,
      maxHeight: p.maxH,
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      background: 'var(--bg-surface)',
      border: 'var(--border-width-hairline) solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: items ? 'var(--space-1)' : 0,
      outline: 'none',
      transformOrigin: p.above ? 'bottom' : 'top',
      animation: 'sereno-pop var(--duration-fast) var(--ease-out)',
    });
  };

  /* eslint-disable react-hooks/refs -- the `children` render function receives `close`, a stable
     useCallback that reads the anchor ref only when a consumer invokes it from an event handler —
     never during this render. */
  return (
    <span ref={anchorRef} style={sx({ display: 'inline-flex', position: 'relative' })}>
      {triggerEl}
      {adornment != null && <span style={sx({ position: 'absolute', inset: 0, pointerEvents: 'none' })}>{adornment}</span>}
      {open &&
        mounted &&
        place &&
        createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role={items ? 'menu' : 'dialog'}
            aria-label={label}
            aria-modal={items ? undefined : true}
            tabIndex={-1}
            onKeyDown={roverKeyDown}
            style={panelStyle(place)}
          >
            {header && (
              <div
                style={sx({
                  flex: '0 0 auto',
                  padding: 'var(--space-3) var(--space-4)',
                  margin: items ? 'calc(var(--space-1) * -1) calc(var(--space-1) * -1) var(--space-1)' : 0,
                  borderBottom: 'var(--border-width-hairline) solid var(--border-subtle)',
                  fontFamily: 'var(--font-body)',
                })}
              >
                {header}
              </div>
            )}
            {items ? (
              <>
                {label && (
                  <div
                    style={sx({
                      padding: 'var(--space-2) var(--space-3) var(--space-1)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-2xs)',
                      fontWeight: 'var(--weight-bold)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    })}
                  >
                    {label}
                  </div>
                )}
                {items.map((entry, i) => {
                  if ('separator' in entry) {
                    return <div key={i} role="separator" style={sx({ height: 1, margin: 'var(--space-1) 0', background: 'var(--border-subtle)' })} />;
                  }
                  if ('heading' in entry) {
                    return (
                      <div
                        key={i}
                        style={sx({
                          padding: 'var(--space-2) var(--space-3) var(--space-1)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-2xs)',
                          fontWeight: 'var(--weight-bold)',
                          letterSpacing: 'var(--tracking-caps)',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                        })}
                      >
                        {entry.heading}
                      </div>
                    );
                  }
                  const danger = entry.tone === 'danger';
                  const active = i === effectiveActive && !entry.disabled;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="menuitem"
                      disabled={entry.disabled}
                      data-active={active || undefined}
                      onMouseEnter={() => {
                        if (entry.disabled) return;
                        setActiveIndex(i);
                        setInputMode('pointer');
                      }}
                      // Hover ends with the pointer, so the fill must not stay behind on the last
                      // row it crossed. A row the keyboard moved to is left alone.
                      onMouseLeave={() => {
                        if (inputMode === 'pointer') setActiveIndex((a) => (a === i ? -1 : a));
                      }}
                      onClick={() => activate(i)}
                      style={sx({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: active ? 'var(--bg-subtle)' : 'transparent',
                        // The active row is not the DOM-focused element (the panel is), so mark it for keyboard users.
                        boxShadow: active && inputMode === 'keyboard' ? 'var(--focus-ring)' : 'none',
                        color: entry.disabled
                          ? 'var(--text-disabled)'
                          : danger
                            ? 'var(--status-error-fg)'
                            : 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        textAlign: 'left',
                        cursor: entry.disabled ? 'not-allowed' : 'pointer',
                      })}
                    >
                      {entry.icon && <span style={sx({ display: 'flex', flex: '0 0 auto' })}>{entry.icon}</span>}
                      <span style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{entry.label}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              children?.(close)
            )}
          </div>,
          document.body,
        )}
    </span>
  );
  /* eslint-enable react-hooks/refs */
}
