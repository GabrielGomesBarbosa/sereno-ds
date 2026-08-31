'use client';

import * as React from 'react';
import { ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
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
    background: active ? 'var(--bg-brand-soft)' : 'var(--bg-subtle)',
    color: active ? 'var(--text-brand)' : 'var(--text-muted)',
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

  // Seed the open branch from the initial active value; toggling is user-driven after that.
  const [openSet, setOpenSet] = React.useState<Set<string>>(() => {
    const parent = sections.flatMap((s) => s.items).find((it) => it.children?.some((c) => c.value === value))?.value;
    return new Set(parent ? [parent] : []);
  });
  const isOpen = (v: string) => openSet.has(v);

  const toggleGroup = (v: string) => {
    if (collapsed) {
      // No room for a submenu on the rail — open the sidebar and reveal it there.
      setCollapsed(false);
      setOpenSet((prev) => new Set(prev).add(v));
      return;
    }
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  return (
    <nav
      {...rest}
      style={sx({
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width: collapsed ? COLLAPSED : EXPANDED,
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: 'var(--border-width-hairline) solid var(--border-default)',
        ...style,
      })}
    >
      {header !== undefined && (
        <div
          style={sx({
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            minHeight: 40,
            padding: collapsed ? 'var(--space-4) 0 var(--space-2)' : 'var(--space-4) var(--space-4) var(--space-2)',
          })}
        >
          {header}
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
                open={isOpen(item.value)}
                onSelect={onChange}
                onToggle={() => toggleGroup(item.value)}
              />
            ))}
          </div>
        ))}
      </div>

      {(footer || collapsible) && (
        <div
          style={sx({
            borderTop: 'var(--border-width-hairline) solid var(--border-subtle)',
            padding: collapsed ? 'var(--space-2)' : 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          })}
        >
          {footer && !collapsed && footer}
          {collapsible && (
            <CollapseToggle
              collapsed={collapsed}
              label={collapsed ? labels?.expand ?? 'Expand' : labels?.collapse ?? 'Collapse'}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </div>
      )}
    </nav>
  );
}

function ItemRow({
  item,
  collapsed,
  activeValue,
  open,
  onSelect,
  onToggle,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
  activeValue?: string;
  open: boolean;
  onSelect?: (value: string) => void;
  onToggle: () => void;
}) {
  const st = useInteract(false);
  const hasChildren = !!item.children?.length;
  const selfActive = activeValue === item.value && !hasChildren;
  const childActive = hasChildren && item.children!.some((c) => c.value === activeValue);
  // On the rail there is no room for an open submenu, so the parent itself carries the active pill.
  const highlight = selfActive || (collapsed && childActive);

  return (
    <div style={sx({ display: 'flex', flexDirection: 'column' })}>
      <button
        type="button"
        className="sereno-sidenav-btn"
        title={collapsed ? item.label : undefined}
        aria-current={selfActive ? 'page' : undefined}
        aria-expanded={hasChildren && !collapsed ? open : undefined}
        onClick={() => (hasChildren ? onToggle() : onSelect?.(item.value))}
        {...st.handlers}
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
          background: highlight ? 'var(--bg-brand-soft)' : st.hover ? 'var(--interactive-ghost-hover)' : 'transparent',
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
    </div>
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

function CollapseToggle({ collapsed, label, onClick }: { collapsed: boolean; label: string; onClick: () => void }) {
  const st = useInteract(false);
  return (
    <button
      type="button"
      className="sereno-sidenav-btn"
      aria-label={label}
      title={collapsed ? label : undefined}
      onClick={onClick}
      {...st.handlers}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        height: 38,
        padding: collapsed ? 0 : '0 var(--space-3)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        border: 'none',
        borderRadius: 'var(--radius-control)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
        background: st.hover ? 'var(--interactive-ghost-hover)' : 'transparent',
        color: 'var(--text-muted)',
        transition: 'var(--transition-control)',
      })}
    >
      <span style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' })}>
        {collapsed ? <ChevronsRight size={18} strokeWidth={2} /> : <ChevronsLeft size={18} strokeWidth={2} />}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
