'use client';

import * as React from 'react';
import { Card, Badge, Typography } from '@sereno-ds/ui';
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
          <Typography as="span" variant="h3">
            {name}
          </Typography>
          {tag && (
            <Badge tone="info" size="sm" dot={false}>
              {tag}
            </Badge>
          )}
        </div>
        {description && <Typography variant="bodySm">{description}</Typography>}
      </div>
      {(price || duration) && (
        <div style={sx({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, whiteSpace: 'nowrap' })}>
          {price && (
            <Typography as="span" variant="h3" style={{ letterSpacing: 'normal' }}>
              {price}
            </Typography>
          )}
          {duration && (
            <Typography as="span" variant="caption" style={{ fontWeight: 'var(--weight-medium)' }}>
              {duration}
            </Typography>
          )}
        </div>
      )}
    </Card>
  );
}