'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { sx } from '../_internal/style';
import { useInteract } from '../core/Button';

/**
 * Desktop primary navigation — a **compound component**, the counterpart to
 * `BottomNav`. Grouped sections with dividers, an optional second level per
 * item, and a collapse toggle that drops it to a 72px icon rail.
 *
 * ```tsx
 * <SidebarNav value={view} onChange={setView} header={<Wordmark />}>
 *   <SidebarNav.Section label="Workspace">
 *     <SidebarNav.Item value="agenda" label="Calendar" icon={<Calendar size={18} />} />
 *     <SidebarNav.Item value="finance" label="Finance" icon={<Wallet size={18} />}>
 *       <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
 *       <SidebarNav.SubItem value="finance:payouts" label="Payouts" count={3} />
 *     </SidebarNav.Item>
 *   </SidebarNav.Section>
 * </SidebarNav>
 * ```
 *
 * `Item` is not a destination once it has `SubItem` children — it toggles
 * them instead (an inline accordion when expanded, a hover flyout on the
 * collapsed rail).
 */
export interface SidebarNavProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
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
  /** Component used to render items that carry `href` (e.g. Next's `Link`). Defaults to `'a'`. */
  linkComponent?: React.ElementType;
  children: React.ReactNode;
}

export interface SidebarNavSectionProps {
  /** Small uppercase heading above the block. Omit for an unlabelled group — the divider still shows. */
  label?: string;
  children: React.ReactNode;
}

export interface SidebarNavItemProps {
  value: string;
  label: string;
  /** A Lucide icon passed as a node — sized by the caller. */
  icon?: React.ReactNode;
  count?: number;
  /** Render this leaf as a real link (routing, new-tab, SSR-active) via `linkComponent`. */
  href?: string;
  /** `SidebarNav.SubItem`s — a second level. Present ⇒ this item is not a destination itself, it toggles them. */
  children?: React.ReactNode;
}

export interface SidebarNavSubItemProps {
  value: string;
  label: string;
  count?: number;
  /** Set by the parent `Item` when rendering this into the collapsed rail's flyout popover — not for consumers to pass. */
  compact?: boolean;
}

interface SidebarNavContextValue {
  value?: string;
  /** Closes any open flyout, then calls the root's `onChange`. What `Item` / `SubItem` call on click. */
  select: (value: string) => void;
  collapsed: boolean;
  linkComponent?: React.ElementType;
  /** Which item's collapsed-rail flyout is open, if any — single, cross-item (opening one closes another). */
  flyoutValue: string | null;
  openFlyout: (value: string) => void;
  closeFlyoutSoon: () => void;
  closeFlyoutNow: () => void;
  showTip: (label: string, rect: DOMRect) => void;
  hideTip: () => void;
}

const EXPANDED = 248;
const COLLAPSED = 72;

const groupHead = sx({
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-bold)',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'var(--text-disabled)',
  // No top padding: the section's own top gap is the section break; this hugs its items.
  padding: '0 var(--space-3) var(--space-2)',
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

const SidebarNavContext = React.createContext<SidebarNavContextValue | null>(null);

function useSidebarNavContext(component: string): SidebarNavContextValue {
  const ctx = React.useContext(SidebarNavContext);
  if (!ctx) throw new Error(`<SidebarNav.${component}> must be rendered inside <SidebarNav>.`);
  return ctx;
}

/** The `value`s of a node's `SidebarNav.SubItem` children — used for "does this branch hold the active leaf". */
function childValuesOf(children: React.ReactNode): string[] {
  const out: string[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ value?: unknown }>(child) && typeof child.props.value === 'string') out.push(child.props.value);
  });
  return out;
}

function SidebarNavRoot({
  value,
  onChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  header,
  footer,
  labels,
  linkComponent,
  children,
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

  // Single cross-item flyout for the collapsed rail (only one open at a time).
  const [flyoutValue, setFlyoutValue] = React.useState<string | null>(null);
  const flyoutTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openFlyout = (v: string) => {
    clearTimeout(flyoutTimer.current);
    setFlyoutValue(v);
  };
  const closeFlyoutSoon = () => {
    clearTimeout(flyoutTimer.current);
    flyoutTimer.current = setTimeout(() => setFlyoutValue(null), 140);
  };
  const closeFlyoutNow = () => {
    clearTimeout(flyoutTimer.current);
    setFlyoutValue(null);
  };
  React.useEffect(() => () => clearTimeout(flyoutTimer.current), []);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drop a stale flyout when the rail expands
    if (!collapsed) setFlyoutValue(null);
  }, [collapsed]);

  const select = (v: string) => {
    closeFlyoutNow();
    onChange?.(v);
  };

  const ctx: SidebarNavContextValue = { value, select, collapsed, linkComponent, flyoutValue, openFlyout, closeFlyoutSoon, closeFlyoutNow, showTip, hideTip };

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
    <SidebarNavContext.Provider value={ctx}>
      <nav
        {...rest}
        className={['sereno-sidenav-root', rest.className].filter(Boolean).join(' ')}
        data-collapsed={collapsed ? '' : undefined}
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
          {children}
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
    </SidebarNavContext.Provider>
  );
}

function Section({ label, children }: SidebarNavSectionProps) {
  const { collapsed } = useSidebarNavContext('Section');
  return (
    <div className="sereno-sidenav-section" style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
      {label && !collapsed && <span style={groupHead}>{label}</span>}
      {children}
    </div>
  );
}

function Item({ value, label, icon, count, href, children }: SidebarNavItemProps) {
  const { value: activeValue, select, collapsed, linkComponent, flyoutValue, openFlyout, closeFlyoutSoon, closeFlyoutNow, showTip, hideTip } =
    useSidebarNavContext('Item');
  const st = useInteract(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const hasChildren = React.Children.count(children) > 0;
  const childVals = hasChildren ? childValuesOf(children) : [];
  const selfActive = activeValue === value && !hasChildren;
  const childActive = hasChildren && childVals.includes(activeValue ?? '');
  const highlight = selfActive || (collapsed && childActive);
  const railFlyout = collapsed && hasChildren;
  const asLink = !hasChildren && !!href && !!linkComponent;
  const Link = linkComponent ?? 'a';

  // Expanded: an inline accordion, local per-item and seeded open once (on
  // mount) for the branch holding the active child. Collapsed: a hover
  // flyout instead — that one is cross-item (only one open at a time), so it
  // lives in the root's flyoutValue, not here.
  const [localOpen, setLocalOpen] = React.useState(() => childActive);
  const open = collapsed ? flyoutValue === value : localOpen;

  const onToggle = () => {
    if (collapsed) {
      if (flyoutValue === value) closeFlyoutNow();
      else openFlyout(value);
    } else {
      setLocalOpen((o) => !o);
    }
  };

  const rowStyle = sx({
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
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    fontWeight: highlight || childActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
    background: highlight ? 'var(--bg-brand-soft)' : open || st.hover ? 'var(--interactive-ghost-hover)' : 'transparent',
    color: highlight || childActive ? 'var(--text-brand)' : 'var(--text-secondary)',
    transition: 'var(--transition-control)',
  });

  const inner = (
    <>
      {icon && (
        <span style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' })}>{icon}</span>
      )}
      {collapsed && (count !== undefined || childActive) && (
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
          <span style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{label}</span>
          {count !== undefined && <span style={countPill(highlight)}>{count}</span>}
          {hasChildren && (
            <ChevronDown
              size={16}
              strokeWidth={2}
              style={{ flex: '0 0 auto', transition: 'transform var(--duration-fast) var(--ease-standard)', transform: open ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </>
      )}
    </>
  );

  const hoverHandlers = {
    ...st.handlers,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      st.handlers.onMouseEnter?.(e);
      if (!collapsed) return;
      if (railFlyout) openFlyout(value);
      else showTip(label, e.currentTarget.getBoundingClientRect());
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      st.handlers.onMouseLeave?.(e);
      if (railFlyout) closeFlyoutSoon();
      else hideTip();
    },
  };

  // The flyout popover reuses the same SubItem elements, just 2px shorter to
  // read as a compact menu rather than the accordion's own row height.
  const compactChildren = React.Children.map(children, (child) =>
    React.isValidElement<SidebarNavSubItemProps>(child) ? React.cloneElement(child, { compact: true }) : child,
  );

  return (
    <div style={sx({ display: 'flex', flexDirection: 'column' })}>
      {asLink ? (
        <Link
          href={href}
          className="sereno-sidenav-btn"
          aria-label={collapsed ? label : undefined}
          aria-current={selfActive ? 'page' : undefined}
          onClick={() => {
            hideTip();
            select(value);
          }}
          {...hoverHandlers}
          style={rowStyle}
        >
          {inner}
        </Link>
      ) : (
        <button
          ref={btnRef}
          type="button"
          className="sereno-sidenav-btn"
          aria-label={collapsed ? label : undefined}
          aria-current={selfActive ? 'page' : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? open : undefined}
          onClick={() => {
            hideTip();
            if (hasChildren) onToggle();
            else select(value);
          }}
          {...hoverHandlers}
          style={rowStyle}
        >
          {inner}
        </button>
      )}

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
          {children}
        </div>
      )}

      {/* Collapsed rail: hover flyout. */}
      {railFlyout && open && (
        <SubmenuPopover anchorRef={btnRef} label={label} icon={icon} onClose={closeFlyoutNow} onMouseEnter={() => openFlyout(value)} onMouseLeave={closeFlyoutSoon}>
          {compactChildren}
        </SubmenuPopover>
      )}
    </div>
  );
}

function SubItem({ value, label, count, compact = false }: SidebarNavSubItemProps) {
  const { value: activeValue, select } = useSidebarNavContext('SubItem');
  const active = activeValue === value;
  const st = useInteract(false);
  return (
    <button
      type="button"
      className="sereno-sidenav-btn"
      aria-current={active ? 'page' : undefined}
      onClick={() => select(value)}
      {...st.handlers}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        height: compact ? 32 : 34,
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
      <span style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{label}</span>
      {count !== undefined && <span style={countPill(active)}>{count}</span>}
    </button>
  );
}

function SubmenuPopover({
  anchorRef,
  label,
  icon,
  children,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; caret: number | null } | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const p = el.getBoundingClientRect();
    let left = a.right + 10;
    let onRight = true;
    if (left + p.width > window.innerWidth - 8) {
      left = Math.max(8, a.left - p.width - 10);
      onRight = false;
    }
    let top = a.top - 4;
    if (top + p.height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - 8 - p.height);
    const caret = onRight ? a.top + a.height / 2 - top : null;
    setPos({ top, left, caret });
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
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={sx({
        position: 'fixed',
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        minWidth: 196,
        maxWidth: 264,
        padding: 5,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 0 0 1px var(--border-default), var(--shadow-lg)',
        zIndex: 1000,
        animation: 'sereno-flyout-in var(--duration-fast) var(--ease-out)',
      })}
    >
      {pos?.caret != null && (
        <span
          aria-hidden
          style={sx({
            position: 'absolute',
            left: -4,
            top: pos.caret,
            width: 8,
            height: 8,
            background: 'var(--bg-surface)',
            borderLeft: 'var(--border-width-hairline) solid var(--border-default)',
            borderBottom: 'var(--border-width-hairline) solid var(--border-default)',
            transform: 'translateY(-50%) rotate(45deg)',
            borderBottomLeftRadius: 2,
          })}
        />
      )}

      <div
        style={sx({
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '5px 8px 8px',
          marginBottom: 4,
          borderBottom: 'var(--border-width-hairline) solid var(--border-subtle)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
        })}
      >
        {icon && (
          <span
            style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' })}
          >
            {icon}
          </span>
        )}
        <span style={sx({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{label}</span>
      </div>

      <div style={sx({ display: 'flex', flexDirection: 'column', gap: 1 })}>{children}</div>
    </div>,
    document.body,
  );
}

export const SidebarNav = Object.assign(SidebarNavRoot, { Section, Item, SubItem });
