'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { sx } from '../_internal/style';
import { useInteract } from '../core/Button';

export interface SidebarNavSubItem {
  value: string;
  label: string;
  count?: number;
}

export interface SidebarNavItem {
  value: string;
  label: string;
  /** A Lucide icon passed as a node — sized by the caller. */
  icon?: React.ReactNode;
  count?: number;
  /** Second-level items. A parent with children toggles them; it is not a destination itself. */
  children?: SidebarNavSubItem[];
}

export interface SidebarNavSection {
  /** Small uppercase heading above the block. Omit for an unlabelled group — the divider still shows. */
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  sections: SidebarNavSection[];
  value?: string;
  onChange?: (value: string) => void;
  /** Controlled collapse (icon-only rail). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Show the collapse toggle in the footer. */
  collapsible?: boolean;
  /** Brand / logo slot at the top. */
  header?: React.ReactNode;
  /** Persistent slot pinned to the bottom (user card, plan nudge). Hidden while collapsed. */
  footer?: React.ReactNode;
  labels?: { expand?: string; collapse?: string };
}

const EXPANDED = 248;
const COLLAPSED = 72;

const groupHead = sx({
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-bold)',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  padding: '10px var(--space-3) 4px',
});

const countPill = (active: boolean) =>
  sx({
    marginLeft: 'auto',
    flex: '0 0 auto',
    fontSize: 'var(--text-2xs)',
    fontWeight: 'var(--weight-bold)',
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: '999px',
    // A bordered chip so it stays legible over the row's hover / active fill.
    background: 'var(--bg-surface)',
    color: active ? 'var(--text-brand)' : 'var(--text-muted)',
    boxShadow: 'inset 0 0 0 1px ' + (active ? 'var(--border-brand)' : 'var(--border-default)'),
  });

/**
 * Desktop primary navigation — the counterpart to `BottomNav`. Grouped sections
 * with dividers, an optional second level per item, and a collapse toggle that
 * drops it to a 72px icon rail. Controlled: `value` / `onChange` for the active
 * destination, `collapsed` / `onCollapsedChange` for the rail state.
 */
export function SidebarNav({
  sections,
  value,
  onChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  header,
  footer,
  labels,
  style,
  ...rest
}: SidebarNavProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = (c: boolean) => {
    if (collapsedProp === undefined) setInternalCollapsed(c);
    onCollapsedChange?.(c);
  };

  // Custom hover tooltip for the collapsed rail — portalled so the rail's own
  // overflow clipping can't hide it.
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);
  const [tip, setTip] = React.useState<{ label: string; top: number; left: number } | null>(null);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drop a stale tip when the rail expands
    if (!collapsed) setTip(null);
  }, [collapsed]);
  const showTip = (label: string, r: DOMRect) => setTip({ label, top: r.top + r.height / 2, left: r.right + 10 });
  const hideTip = () => setTip(null);

  // Expanded: the second level is an inline accordion (seeded open on the active
  // branch, user-toggled after). Collapsed: it's a hover flyout instead.
  const [openSet, setOpenSet] = React.useState<Set<string>>(() => {
    const parent = sections.flatMap((s) => s.items).find((it) => it.children?.some((c) => c.value === value))?.value;
    return new Set(parent ? [parent] : []);
  });
  const toggleAccordion = (v: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  const [flyout, setFlyout] = React.useState<string | null>(null);
  const flyoutTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openFlyout = (v: string) => {
    clearTimeout(flyoutTimer.current);
    setFlyout(v);
  };
  const closeFlyoutSoon = () => {
    clearTimeout(flyoutTimer.current);
    flyoutTimer.current = setTimeout(() => setFlyout(null), 140);
  };
  const closeFlyoutNow = () => {
    clearTimeout(flyoutTimer.current);
    setFlyout(null);
  };
  React.useEffect(() => () => clearTimeout(flyoutTimer.current), []);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drop a stale flyout when the rail expands
    if (!collapsed) setFlyout(null);
  }, [collapsed]);

  const handleSelect = (v: string) => {
    clearTimeout(flyoutTimer.current);
    setFlyout(null);
    onChange?.(v);
  };

  // The collapse control straddles the sidebar's right edge, level with the logo.
  const toggleLabel = collapsed ? labels?.expand ?? 'Expand' : labels?.collapse ?? 'Collapse';
  const toggleBtn = collapsible ? (
    <button
      type="button"
      className="sereno-sidenav-btn sereno-sidenav-toggle"
      aria-label={toggleLabel}
      aria-pressed={collapsed}
      title={toggleLabel}
      onClick={() => setCollapsed(!collapsed)}
      style={sx({
        position: 'absolute',
        top: 'calc(var(--sidenav-header-h, 56px) / 2)',
        right: -13,
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: '999px',
        border: 'var(--border-width-hairline) solid var(--border-default)',
        background: 'var(--bg-surface)',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'var(--transition-control)',
      })}
    >
      <ChevronLeft
        size={15}
        strokeWidth={2}
        style={{ transition: 'transform var(--duration-normal) var(--ease-out)', transform: collapsed ? 'rotate(180deg)' : 'none' }}
      />
    </button>
  ) : null;

  return (
    <nav
      {...rest}
      style={sx({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width: collapsed ? COLLAPSED : EXPANDED,
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: 'var(--border-width-hairline) solid var(--border-default)',
        transition: 'width var(--duration-normal) var(--ease-out)',
        ...style,
      })}
    >
      {toggleBtn}

      {header !== undefined && (
        <div
          style={sx({
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            height: 'var(--sidenav-header-h, 56px)',
            padding: collapsed ? '0' : '0 var(--space-4)',
          })}
        >
          <div style={sx({ minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'center' })}>{header}</div>
        </div>
      )}

      <div
        className="sereno-sidenav"
        style={sx({
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        {sections.map((section, i) => (
          <div
            key={section.label ?? i}
            style={sx({
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginTop: i ? 'var(--space-2)' : 0,
              paddingTop: i ? 'var(--space-2)' : 0,
              borderTop: i ? 'var(--border-width-hairline) solid var(--border-subtle)' : 'none',
            })}
          >
            {section.label && !collapsed && <span style={groupHead}>{section.label}</span>}
            {section.items.map((item) => (
              <ItemRow
                key={item.value}
                item={item}
                collapsed={collapsed}
                activeValue={value}
                open={collapsed ? flyout === item.value : openSet.has(item.value)}
                onToggle={() =>
                  collapsed
                    ? flyout === item.value
                      ? setFlyout(null)
                      : openFlyout(item.value)
                    : toggleAccordion(item.value)
                }
                onFlyoutEnter={() => openFlyout(item.value)}
                onFlyoutLeave={closeFlyoutSoon}
                onFlyoutClose={closeFlyoutNow}
                onSelect={handleSelect}
                onTip={showTip}
                onTipHide={hideTip}
              />
            ))}
          </div>
        ))}
      </div>

      {footer && !collapsed && (
        <div
          style={sx({
            borderTop: 'var(--border-width-hairline) solid var(--border-subtle)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          })}
        >
          {footer}
        </div>
      )}

      {mounted &&
        tip &&
        createPortal(
          <div
            role="tooltip"
            style={sx({
              position: 'fixed',
              top: tip.top,
              left: tip.left,
              transform: 'translateY(-50%)',
              padding: '5px 9px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-inverse)',
              color: 'var(--text-inverse)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 1000,
              animation: 'sereno-fade-in var(--duration-fast) var(--ease-out)',
            })}
          >
            <span
              aria-hidden
              style={sx({
                position: 'absolute',
                left: -3,
                top: '50%',
                width: 6,
                height: 6,
                background: 'var(--bg-inverse)',
                transform: 'translateY(-50%) rotate(45deg)',
                borderRadius: 1,
              })}
            />
            {tip.label}
          </div>,
          document.body,
        )}
    </nav>
  );
}

function ItemRow({
  item,
  collapsed,
  activeValue,
  open,
  onToggle,
  onFlyoutEnter,
  onFlyoutLeave,
  onFlyoutClose,
  onSelect,
  onTip,
  onTipHide,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
  activeValue?: string;
  /** Accordion-open when expanded, flyout-open when collapsed. */
  open: boolean;
  onToggle: () => void;
  onFlyoutEnter: () => void;
  onFlyoutLeave: () => void;
  onFlyoutClose: () => void;
  onSelect?: (value: string) => void;
  onTip: (label: string, rect: DOMRect) => void;
  onTipHide: () => void;
}) {
  const st = useInteract(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const hasChildren = !!item.children?.length;
  const selfActive = activeValue === item.value && !hasChildren;
  const childActive = hasChildren && item.children!.some((c) => c.value === activeValue);
  const highlight = selfActive || (collapsed && childActive);
  const railFlyout = collapsed && hasChildren;

  return (
    <div style={sx({ display: 'flex', flexDirection: 'column' })}>
      <button
        ref={btnRef}
        type="button"
        className="sereno-sidenav-btn"
        aria-label={collapsed ? item.label : undefined}
        aria-current={selfActive ? 'page' : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onClick={() => {
          onTipHide();
          if (hasChildren) onToggle();
          else onSelect?.(item.value);
        }}
        {...st.handlers}
        onMouseEnter={(e) => {
          st.handlers.onMouseEnter?.(e);
          if (!collapsed) return;
          if (railFlyout) onFlyoutEnter();
          else onTip(item.label, e.currentTarget.getBoundingClientRect());
        }}
        onMouseLeave={(e) => {
          st.handlers.onMouseLeave?.(e);
          if (railFlyout) onFlyoutLeave();
          else onTipHide();
        }}
        style={sx({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          width: '100%',
          height: 40,
          padding: collapsed ? 0 : '0 var(--space-3)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          border: 'none',
          borderRadius: 'var(--radius-control)',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: highlight || childActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
          background: highlight ? 'var(--bg-brand-soft)' : open || st.hover ? 'var(--interactive-ghost-hover)' : 'transparent',
          color: highlight || childActive ? 'var(--text-brand)' : 'var(--text-secondary)',
          transition: 'var(--transition-control)',
        })}
      >
        {item.icon && (
          <span style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' })}>
            {item.icon}
          </span>
        )}
        {collapsed && (item.count !== undefined || childActive) && (
          <span
            aria-hidden
            style={sx({
              position: 'absolute',
              top: 7,
              right: 12,
              width: 6,
              height: 6,
              borderRadius: '999px',
              background: 'var(--interactive-accent)',
            })}
          />
        )}
        {!collapsed && (
          <>
            <span style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{item.label}</span>
            {item.count !== undefined && <span style={countPill(highlight)}>{item.count}</span>}
            {hasChildren && (
              <ChevronDown
                size={16}
                strokeWidth={2}
                style={{ flex: '0 0 auto', transition: 'transform var(--duration-fast) var(--ease-standard)', transform: open ? 'rotate(180deg)' : 'none' }}
              />
            )}
          </>
        )}
      </button>

      {/* Expanded: inline accordion. */}
      {hasChildren && !collapsed && open && (
        <div
          style={sx({
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            margin: '2px 0 2px 19px',
            paddingLeft: 'var(--space-3)',
            borderLeft: 'var(--border-width-hairline) solid var(--border-default)',
          })}
        >
          {item.children!.map((sub) => (
            <SubRow key={sub.value} sub={sub} active={activeValue === sub.value} onSelect={onSelect} />
          ))}
        </div>
      )}

      {/* Collapsed rail: hover flyout. */}
      {railFlyout && open && (
        <SubmenuPopover
          anchorRef={btnRef}
          parentLabel={item.label}
          items={item.children!}
          activeValue={activeValue}
          onSelect={onSelect}
          onMouseEnter={onFlyoutEnter}
          onMouseLeave={onFlyoutLeave}
          onClose={onFlyoutClose}
        />
      )}
    </div>
  );
}

function SubmenuPopover({
  anchorRef,
  parentLabel,
  items,
  activeValue,
  onSelect,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  parentLabel: string;
  items: SidebarNavSubItem[];
  activeValue?: string;
  onSelect?: (value: string) => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const p = el.getBoundingClientRect();
    let left = a.right + 8;
    if (left + p.width > window.innerWidth - 8) left = Math.max(8, a.left - p.width - 8);
    let top = a.top;
    if (top + p.height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - 8 - p.height);
    setPos({ top, left });
  }, [anchorRef]);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !anchorRef.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={parentLabel}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={sx({
        position: 'fixed',
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        minWidth: 208,
        padding: 'var(--space-1)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 0 0 1px var(--border-default), var(--shadow-lg)',
        zIndex: 1000,
        animation: 'sereno-fade-in var(--duration-fast) var(--ease-out)',
      })}
    >
      <div
        style={sx({
          padding: '6px var(--space-2) 4px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-2xs)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        })}
      >
        {parentLabel}
      </div>
      {items.map((sub) => (
        <SubRow key={sub.value} sub={sub} active={activeValue === sub.value} onSelect={onSelect} />
      ))}
    </div>,
    document.body,
  );
}

function SubRow({ sub, active, onSelect }: { sub: SidebarNavSubItem; active: boolean; onSelect?: (value: string) => void }) {
  const st = useInteract(false);
  return (
    <button
      type="button"
      className="sereno-sidenav-btn"
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect?.(sub.value)}
      {...st.handlers}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        height: 34,
        padding: '0 var(--space-2)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        background: active ? 'var(--bg-brand-soft)' : st.hover ? 'var(--interactive-ghost-hover)' : 'transparent',
        color: active ? 'var(--text-brand)' : 'var(--text-secondary)',
        transition: 'var(--transition-control)',
      })}
    >
      <span style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{sub.label}</span>
      {sub.count !== undefined && <span style={countPill(active)}>{sub.count}</span>}
    </button>
  );
}

