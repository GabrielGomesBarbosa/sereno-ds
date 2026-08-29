'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Friendly placeholder for empty agendas, client lists and search results. */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false, style, ...rest }: EmptyStateProps) {
  return (
    <div
      {...rest}
      style={sx({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-3)',
        padding: compact ? 'var(--space-6)' : 'var(--space-9) var(--space-6)',
        ...style,
      })}
    >
      {icon && (
        <span
          style={sx({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-brand-soft)',
            color: 'var(--text-brand)',
            marginBottom: 2,
          })}
        >
          {icon}
        </span>
      )}
      <span
        style={sx({
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--text-primary)',
        })}
      >
        {title}
      </span>
      {description && (
        <span
          style={sx({
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-normal)',
            maxWidth: 340,
          })}
        >
          {description}
        </span>
      )}
      {action && <div style={sx({ marginTop: 'var(--space-2)' })}>{action}</div>}
    </div>
  );
}