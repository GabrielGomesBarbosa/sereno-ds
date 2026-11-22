'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { sx } from '../_internal/style';
import { SidebarNavContext, type SidebarNavContextValue } from './_internal/sidebarNavContext';
import { Item, Section, SubItem } from './_internal/SidebarNavItems';

export type { SidebarNavItemProps, SidebarNavSectionProps, SidebarNavSubItemProps } from './_internal/SidebarNavItems';

/**
 * Desktop primary navigation - a **compound component**, the counterpart to
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
 * `Item` is not a destination once it has `SubItem` children - it toggles
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
  /**
   * Disables every `Item` / `SubItem` at once - a gated area, an account that
   * isn't active yet. An item can still opt back in with its own
   * `disabled={false}` (e.g. a "Help" link that must stay reachable). Only the
   * destinations are affected: the collapse toggle, `header` and `footer` stay
   * live, since they aren't navigation.
   */
  disabled?: boolean;
  children: React.ReactNode;
}

const EXPANDED = 248;
const COLLAPSED = 72;

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
  disabled = false,
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

  // Custom hover tooltip for the collapsed rail - portalled so the rail's own
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

  const ctx: SidebarNavContextValue = { value, disabled, select, collapsed, linkComponent, flyoutValue, openFlyout, closeFlyoutSoon, closeFlyoutNow, showTip, hideTip };

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
        // Fill, ink and border come from the `--sd-*` values (the hover is the `:hover` rule of
        // `.sereno-sidenav-toggle`); set inline they would beat that rule and the hover would never show.
        '--sd-bg': 'var(--bg-surface)',
        '--sd-bg-hover': 'var(--interactive-secondary-hover)',
        '--sd-fg': 'var(--text-secondary)',
        '--sd-fg-hover': 'var(--text-primary)',
        '--sd-bd': 'var(--border-default)',
        '--sd-bd-hover': 'var(--border-strong)',
        borderWidth: 'var(--border-width-hairline)',
        borderStyle: 'solid',
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

export const SidebarNav = Object.assign(SidebarNavRoot, { Section, Item, SubItem });
