'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { sx } from '../_internal/style';

/**
 * Action menu / dropdown — a `trigger` you supply plus a portalled panel of
 * items. Same mechanics as `Select`: `position: fixed` panel measured off the
 * trigger, flips up when there's no room, closes on outside pointerdown / `Escape`
 * / selection, and returns focus to the trigger. `role="menu"` with arrow-key
 * roving. Needs the `sereno-pop` keyframe from `@sereno/ui/styles.css`.
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
  /** Structured rows. Omit when using the `children` render function. */
  items?: MenuEntry[];
  /** Rich panel content — receives `close`. Mutually exclusive with `items`. */
  children?: (close: () => void) => React.ReactNode;
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

type Place = { top: number; left: number; width: number; above: boolean; maxH: number };

export function Menu({ trigger, items, children, label, align = 'end', width, disabled, open: openProp, onOpenChange }: MenuProps) {
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

  const itemIndexes = React.useMemo(() => (items ?? []).map((e, i) => (isItem(e) && !e.disabled ? i : -1)).filter((i) => i >= 0), [items]);

  const close = React.useCallback(
    (refocus = true) => {
      setOpen(false);
      setActiveIndex(-1);
      if (refocus) {
        const btn = anchorRef.current?.querySelector<HTMLElement>('button, [role="button"], a, [tabindex]');
        btn?.focus({ preventScroll: true });
      }
    },
    [setOpen],
  );

  // Measure + place the panel while open. Re-runs on scroll/resize; closes if the
  // trigger scrolls away (mirrors Select's fixed strategy).
  React.useLayoutEffect(() => {
    if (!open || !mounted) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const measure = () => {
      const r = anchor.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth || 360;
      const vh = window.innerHeight || document.documentElement.clientHeight || 640;
      const roomBelow = vh - r.bottom - GUTTER;
      const roomAbove = r.top - GUTTER;
      const panelH = panelRef.current?.scrollHeight ?? 240;
      const above = roomBelow < Math.min(panelH, 200) && roomAbove > roomBelow;
      const maxH = Math.max(120, Math.round((above ? roomAbove : roomBelow) - GAP));

      const w =
        typeof width === 'number'
          ? width
          : width
            ? (panelRef.current?.offsetWidth ?? 220)
            : Math.min(Math.max(180, panelRef.current?.scrollWidth ?? 200), vw - GUTTER * 2);
      let left = align === 'end' ? r.right - w : r.left;
      left = Math.min(Math.max(GUTTER, left), vw - GUTTER - w);
      const top = above ? Math.max(GUTTER, r.top - GAP - Math.min(panelH, maxH)) : r.bottom + GAP;
      return { top, left, width: w, above, maxH };
    };

    setPlace(measure());
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

  // Move focus into the panel on open. The active row starts at the first item
  // (see `effectiveActive`) and only becomes explicit state once the user arrows.
  React.useEffect(() => {
    if (open && mounted) panelRef.current?.focus({ preventScroll: true });
  }, [open, mounted]);

  const effectiveActive = activeIndex >= 0 ? activeIndex : itemIndexes[0] ?? -1;

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
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActiveIndex(itemIndexes[Math.min(pos + 1, itemIndexes.length - 1)] ?? itemIndexes[0]);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActiveIndex(itemIndexes[Math.max(pos - 1, 0)] ?? itemIndexes[itemIndexes.length - 1]);
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      setActiveIndex(itemIndexes[0]);
    } else if (ev.key === 'End') {
      ev.preventDefault();
      setActiveIndex(itemIndexes[itemIndexes.length - 1]);
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      activate(effectiveActive);
    }
  };

  const toggle = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const triggerEl = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    onClick: (e: React.MouseEvent) => {
      (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
      toggle();
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    'data-menu-open': open || undefined,
  });

  const panelStyle = (p: Place): React.CSSProperties =>
    sx({
      position: 'fixed',
      top: p.top,
      left: p.left,
      width: p.width,
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

  /* eslint-disable react-hooks/refs -- the `children` render function receives `close`, a stable
     useCallback that reads the anchor ref only when a consumer invokes it from an event handler —
     never during this render. */
  return (
    <span ref={anchorRef} style={sx({ display: 'inline-flex', position: 'relative' })}>
      {triggerEl}
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
                  const active = i === effectiveActive;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="menuitem"
                      disabled={entry.disabled}
                      onMouseEnter={() => !entry.disabled && setActiveIndex(i)}
                      onClick={() => activate(i)}
                      style={sx({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: active && !entry.disabled ? 'var(--bg-subtle)' : 'transparent',
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
