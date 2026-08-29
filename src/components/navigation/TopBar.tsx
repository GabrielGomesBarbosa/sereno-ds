'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Sticky page header: back/leading slot, title + subtitle, trailing actions. 60px tall, blurred translucent. */
export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  /** Usually a back IconButton or the wordmark. */
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  /** Drops the blur/border for hero headers. */
  transparent?: boolean;
}

export function TopBar({ title, subtitle, leading, actions, sticky = true, transparent = false, style, ...rest }: TopBarProps) {
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
      {leading}
      <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 })}>
        {title && (
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
            {title}
          </span>
        )}
        {subtitle && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>{subtitle}</span>}
      </div>
      {actions && <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>{actions}</div>}
    </header>
  );
}