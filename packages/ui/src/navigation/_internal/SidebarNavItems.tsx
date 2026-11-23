'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { sx } from '../../_internal/style';
import { ParentDisabledContext, type SidebarNavContextValue, useSidebarNavContext } from './sidebarNavContext';
import { SubmenuPopover } from './SidebarSubmenuPopover';

export interface SidebarNavSectionProps {
  /** Small uppercase heading above the block. Omit for an unlabelled group - the divider still shows. */
  label?: string;
  children: React.ReactNode;
}

export interface SidebarNavItemProps {
  value: string;
  label: string;
  /** A Lucide icon passed as a node - sized by the caller. */
  icon?: React.ReactNode;
  count?: number;
  /** Render this leaf as a real link (routing, new-tab, SSR-active) via `linkComponent`. Ignored while `disabled`. */
  href?: string;
  /**
   * Not selectable - e.g. a feature locked behind a higher plan. Inherits the
   * root's `disabled` when unset; an explicit `false` opts back in under a
   * disabled root.
   *
   * `aria-disabled` (not the native attribute), so the row is still in the
   * accessibility tree and a screen reader finds it - but it leaves the Tab
   * order (a locked area shouldn't cost a dead tab stop per item), a click
   * never fires `onChange`, `href` never navigates (it renders as a `<button>`,
   * never a link), and a parent `Item` doesn't toggle its accordion or open its
   * rail flyout. It can still be the current page: `value` pointing at it keeps
   * `aria-current` and the active look, just muted.
   */
  disabled?: boolean;
  /** `SidebarNav.SubItem`s - a second level. Present ⇒ this item is not a destination itself, it toggles them. */
  children?: React.ReactNode;
}

export interface SidebarNavSubItemProps {
  value: string;
  label: string;
  count?: number;
  /** Not selectable. Inherits from its parent `Item` (which inherits the root); an explicit value wins. Same contract as `SidebarNav.Item`'s `disabled`. */
  disabled?: boolean;
  /** Set by the parent `Item` when rendering this into the collapsed rail's flyout popover - not for consumers to pass. */
  compact?: boolean;
}

const groupHead = sx({
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-bold)',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  // Read text, not a disabled control: `--text-disabled` is exempt from WCAG contrast only on an inactive component, and
  // it gave this 11 px label 2.5:1 (#155). `--text-muted` is the quietest colour that still passes 4.5:1 on the surface.
  color: 'var(--text-muted)',
  // No top padding: the section's own top gap is the section break; this hugs its items.
  padding: '0 var(--space-3) var(--space-2)',
});

const countPill = (active: boolean, disabled = false) =>
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
    color: disabled ? 'var(--text-disabled)' : active ? 'var(--text-brand)' : 'var(--text-muted)',
    boxShadow: 'inset 0 0 0 1px ' + (disabled ? 'var(--border-subtle)' : active ? 'var(--border-brand)' : 'var(--border-default)'),
  });

/** The `value`s of a node's `SidebarNav.SubItem` children - used for "does this branch hold the active leaf". */
function childValuesOf(children: React.ReactNode): string[] {
  const out: string[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ value?: unknown }>(child) && typeof child.props.value === 'string') out.push(child.props.value);
  });
  return out;
}

/**
 * Shows `label` as a tooltip beside `row`. On the icon-only rail every label is
 * hidden (`labelEl` is null), so it always shows; expanded, only when the
 * ellipsis is actually cutting the text off - a short label gets no redundant tooltip.
 */
function showLabelTip(row: HTMLElement, labelEl: HTMLElement | null, label: string, showTip: SidebarNavContextValue['showTip']) {
  if (labelEl && labelEl.scrollWidth <= labelEl.clientWidth) return;
  showTip(label, row.getBoundingClientRect());
}

/** Keyboard focus only - a mouse click focuses the row too, but the pointer is already showing (or has dismissed) the tip. */
function isKeyboardFocus(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return false;
  }
}

export function Section({ label, children }: SidebarNavSectionProps) {
  const { collapsed } = useSidebarNavContext('Section');
  return (
    <div className="sereno-sidenav-section" style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
      {label && !collapsed && <span style={groupHead}>{label}</span>}
      {children}
    </div>
  );
}

export function Item({ value, label, icon, count, href, disabled: disabledProp, children }: SidebarNavItemProps) {
  const {
    value: activeValue,
    disabled: rootDisabled,
    select,
    collapsed,
    linkComponent,
    flyoutValue,
    openFlyout,
    closeFlyoutSoon,
    closeFlyoutNow,
    showTip,
    hideTip,
  } = useSidebarNavContext('Item');
  // Its own `disabled` wins - including an explicit `false` under a disabled root.
  const disabled = disabledProp ?? rootDisabled;
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const hasChildren = React.Children.count(children) > 0;
  const childVals = hasChildren ? childValuesOf(children) : [];
  // Still the current page while disabled (a locked area can be showing you where you are) - just muted.
  const selfActive = activeValue === value && !hasChildren;
  const childActive = hasChildren && childVals.includes(activeValue ?? '');
  const highlight = selfActive || (collapsed && childActive);
  // A disabled parent has nothing to open: no rail flyout (it falls back to the plain label tooltip).
  const railFlyout = collapsed && hasChildren && !disabled;
  // A disabled item is never a real link - `href` must not navigate.
  const asLink = !hasChildren && !!href && !!linkComponent && !disabled;
  const Link = linkComponent ?? 'a';

  // Expanded: an inline accordion, local per-item and seeded open once (on
  // mount) for the branch holding the active child - that seed still applies
  // while disabled, so the "you are here" branch stays visible (it just can't
  // be toggled). Collapsed: a hover flyout instead - that one is cross-item
  // (only one open at a time), so it lives in the root's flyoutValue, not
  // here, and a disabled parent never opens it.
  const [localOpen, setLocalOpen] = React.useState(() => childActive);
  const open = collapsed ? !disabled && flyoutValue === value : localOpen;

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
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    fontWeight: highlight || childActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
    // The fill and its hover value, as custom properties `.sereno-sidenav-btn` (styles.css) switches between on `:hover`
    // (SS-577). The current page keeps its own fill under the pointer, and a disabled row has no hover value.
    '--sd-bg': highlight ? 'var(--bg-brand-soft)' : open ? 'var(--interactive-ghost-hover)' : 'transparent',
    '--sd-bg-hover': highlight || disabled ? undefined : 'var(--interactive-ghost-hover)',
    color: disabled ? 'var(--text-disabled)' : highlight || childActive ? 'var(--text-brand)' : 'var(--text-secondary)',
    transition: 'var(--transition-control)',
  });

  const inner = (
    <>
      {icon && (
        <span style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' })}>{icon}</span>
      )}
      {collapsed && !disabled && (count !== undefined || childActive) && (
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
          <span ref={labelRef} style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
            {label}
          </span>
          {count !== undefined && <span style={countPill(highlight, disabled)}>{count}</span>}
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
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (railFlyout) openFlyout(value);
      else showLabelTip(e.currentTarget, labelRef.current, label, showTip);
    },
    onMouseLeave: () => {
      if (railFlyout) closeFlyoutSoon();
      else hideTip();
    },
    // Keyboard parity with hover - on the rail a Tab stop is otherwise just an unlabelled icon.
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      if (isKeyboardFocus(e.currentTarget)) showLabelTip(e.currentTarget, labelRef.current, label, showTip);
    },
    onBlur: () => hideTip(),
    // Dismissible without moving the pointer or focus (WCAG 1.4.13).
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') hideTip();
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
          className="sereno-sidenav-btn sereno-sidenav-row"
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
          className="sereno-sidenav-btn sereno-sidenav-row"
          aria-label={collapsed ? label : undefined}
          aria-current={selfActive ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? open : undefined}
          onClick={() => {
            if (disabled) return;
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
          <ParentDisabledContext.Provider value={disabled}>{children}</ParentDisabledContext.Provider>
        </div>
      )}

      {/* Collapsed rail: hover flyout. */}
      {railFlyout && open && (
        <SubmenuPopover anchorRef={btnRef} label={label} icon={icon} onClose={closeFlyoutNow} onMouseEnter={() => openFlyout(value)} onMouseLeave={closeFlyoutSoon}>
          <ParentDisabledContext.Provider value={disabled}>{compactChildren}</ParentDisabledContext.Provider>
        </SubmenuPopover>
      )}
    </div>
  );
}

export function SubItem({ value, label, count, disabled: disabledProp, compact = false }: SidebarNavSubItemProps) {
  const { value: activeValue, disabled: rootDisabled, select, showTip, hideTip } = useSidebarNavContext('SubItem');
  const parentDisabled = React.useContext(ParentDisabledContext);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  // Its own `disabled` wins, then its parent Item's (already resolved against the root), then the root's.
  const disabled = disabledProp ?? parentDisabled ?? rootDisabled;
  const active = activeValue === value;
  return (
    <button
      type="button"
      className="sereno-sidenav-btn sereno-sidenav-row"
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={() => {
        hideTip();
        if (!disabled) select(value);
      }}
      onMouseEnter={(e) => showLabelTip(e.currentTarget, labelRef.current, label, showTip)}
      onMouseLeave={() => hideTip()}
      onFocus={(e) => {
        if (isKeyboardFocus(e.currentTarget)) showLabelTip(e.currentTarget, labelRef.current, label, showTip);
      }}
      onBlur={() => hideTip()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hideTip();
      }}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        height: compact ? 32 : 34,
        padding: '0 var(--space-2)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        '--sd-bg': active ? 'var(--bg-brand-soft)' : 'transparent',
        '--sd-bg-hover': active || disabled ? undefined : 'var(--interactive-ghost-hover)',
        color: disabled ? 'var(--text-disabled)' : active ? 'var(--text-brand)' : 'var(--text-secondary)',
        transition: 'var(--transition-control)',
      })}
    >
      <span ref={labelRef} style={sx({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
        {label}
      </span>
      {count !== undefined && <span style={countPill(active, disabled)}>{count}</span>}
    </button>
  );
}
