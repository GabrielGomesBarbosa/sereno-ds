'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Typography } from '../core/Typography';

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
      <Typography as="span" variant="h1" style={{ fontSize: 'var(--text-lg)' }}>
        {title}
      </Typography>
      {description && (
        <Typography as="span" variant="bodySm" style={{ maxWidth: 340 }}>
          {description}
        </Typography>
      )}
      {action && <div style={sx({ marginTop: 'var(--space-2)' })}>{action}</div>}
    </div>
  );
}