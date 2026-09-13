'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Sticky page header — a **compound component**. 60px tall, blurred
 * translucent. `Leading` / `Title` / `Actions` are all optional, independent
 * slots — use whichever the screen needs.
 *
 * ```tsx
 * <TopBar>
 *   <TopBar.Leading><IconButton label="Back"><ChevronLeft /></IconButton></TopBar.Leading>
 *   <TopBar.Title subtitle="Therapy session">Pick a time</TopBar.Title>
 *   <TopBar.Actions><IconButton label="Notifications"><Bell /></IconButton></TopBar.Actions>
 * </TopBar>
 * ```
 */
export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  /** Drops the blur/border for hero headers. */
  transparent?: boolean;
  children?: React.ReactNode;
}

export interface TopBarLeadingProps {
  /** Usually a back `IconButton` or the wordmark. */
  children?: React.ReactNode;
}

export interface TopBarTitleProps {
  /** Plain string in most cases; accepts nodes for e.g. a `<time>` element or a responsive date. */
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

export interface TopBarActionsProps {
  children?: React.ReactNode;
}

function TopBarRoot({ sticky = true, transparent = false, children, style, ...rest }: TopBarProps) {
  return (
    <header
      {...rest}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        height: 'var(--topbar-height)',
        padding: '0 var(--gutter-mobile)',
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 20,
        background: transparent ? 'transparent' : 'color-mix(in srgb,var(--bg-surface) 88%,transparent)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        borderBottom: transparent ? 'none' : 'var(--border-width-hairline) solid var(--border-default)',
        ...style,
      })}
    >
      {children}
    </header>
  );
}

/** No wrapper of its own — renders exactly what you give it, first in the row. */
function Leading({ children }: TopBarLeadingProps) {
  return <>{children}</>;
}

function Title({ subtitle, children }: TopBarTitleProps) {
  return (
    <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 })}>
      {children && (
        <span
          style={sx({
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {children}
        </span>
      )}
      {subtitle && (
        <span
          style={sx({
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

function Actions({ children }: TopBarActionsProps) {
  return <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>{children}</div>;
}

export const TopBar = Object.assign(TopBarRoot, { Leading, Title, Actions });
