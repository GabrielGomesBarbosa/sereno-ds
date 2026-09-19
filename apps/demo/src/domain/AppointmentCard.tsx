'use client';

import * as React from 'react';
import { Card, Badge, Avatar, Typography } from '@sereno-ds/ui';
import { sx } from './sx';

/**
 * A booking in the professional's agenda: time block, client, service, lifecycle badge.
 */
export interface AppointmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  client: string;
  service?: string;
  /** "14:30" — rendered large in the brand-soft time block. */
  time: string;
  /** Short date under the time, e.g. "seg, 24". */
  date?: string;
  /** Booking lifecycle — a domain concept, mapped to a semantic Badge tone internally. */
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  /** "Online" / "Presencial". */
  channel?: string;
  /** Trailing controls, usually IconButtons. */
  actions?: React.ReactNode;
  compact?: boolean;
}

type Status = NonNullable<AppointmentCardProps['status']>;

const LABEL: Record<Status, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

const STATUS_TONE: Record<Status, 'success' | 'warning' | 'error' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'neutral',
};

export function AppointmentCard({ client, service, time, date, status = 'confirmed', channel, actions, compact = false, style, ...rest }: AppointmentCardProps) {
  return (
    <Card padding={compact ? 'sm' : 'md'} style={sx({ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3) var(--space-4)', alignItems: 'center', ...style })} {...rest}>
      <div
        style={sx({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 62,
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-brand-soft)',
        })}
      >
        <Typography
          as="span"
          variant="h2"
          color="brand"
          style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)' }}
        >
          {time}
        </Typography>
        {date && (
          <Typography as="span" variant="caption" color="brand" style={{ fontSize: 'var(--text-2xs)', opacity: 0.8 }}>
            {date}
          </Typography>
        )}
      </div>
      <div style={sx({ flex: '1 1 140px', minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4 })}>
        <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>
          <Avatar name={client} size="xs" />
          <Typography as="span" variant="h3" truncate style={{ fontSize: 'var(--text-base)' }}>
            {client}
          </Typography>
        </div>
        <div style={sx({ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' })}>
          {service && <Typography variant="bodySm">{service}</Typography>}
          {channel && <Typography variant="caption">· {channel}</Typography>}
        </div>
      </div>
      <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' })}>
        <Badge tone={STATUS_TONE[status]}>{LABEL[status]}</Badge>
        {actions}
      </div>
    </Card>
  );
}