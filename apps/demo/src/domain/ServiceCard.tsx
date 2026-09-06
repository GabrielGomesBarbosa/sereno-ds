'use client';

import * as React from 'react';
import { Card, Badge } from '@sereno/ui';
import { sx } from './sx';

/**
 * One bookable service in the public flow and in the professional's catalogue.
 */
export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Human duration, e.g. "50 min". */
  duration?: string;
  /** Pre-formatted BRL string, e.g. "R$ 180". */
  price?: string;
  description?: string;
  /** Small info badge, e.g. "Online" or "Primeira sessão". */
  tag?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function ServiceCard({ name, duration, price, description, tag, selected = false, onSelect, style, ...rest }: ServiceCardProps) {
  return (
    <Card
      interactive={!!onSelect}
      selected={selected}
      padding="md"
      onClick={onSelect}
      style={sx({ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', ...style })}
      {...rest}
    >
      <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 })}>
        <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' })}>
          <span
            style={sx({
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-snug)',
            })}
          >
            {name}
          </span>
          {tag && (
            <Badge tone="info" size="sm" dot={false}>
              {tag}
            </Badge>
          )}
        </div>
        {description && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' })}>
            {description}
          </span>
        )}
      </div>
      {(price || duration) && (
        <div style={sx({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, whiteSpace: 'nowrap' })}>
          {price && (
            <span
              style={sx({
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
              })}
            >
              {price}
            </span>
          )}
          {duration && (
            <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' })}>{duration}</span>
          )}
        </div>
      )}
    </Card>
  );
}