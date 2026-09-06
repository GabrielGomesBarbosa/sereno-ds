'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Card } from '../core/Card';
import { Badge } from '../core/Badge';
import { Avatar } from '../core/Avatar';

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
        <span
          style={sx({
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-extrabold)',
            color: 'var(--text-brand)',
            letterSpacing: 'var(--tracking-tight)',
          })}
        >
          {time}
        </span>
        {date && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', color: 'var(--text-brand)', opacity: 0.8 })}>{date}</span>}
      </div>
      <div style={sx({ flex: '1 1 140px', minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4 })}>
        <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>
          <Avatar name={client} size="xs" />
          <span
            style={sx({
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            {client}
          </span>
        </div>
        <div style={sx({ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' })}>
          {service && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' })}>{service}</span>}
          {channel && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>· {channel}</span>}
        </div>
      </div>
      <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' })}>
        <Badge tone={STATUS_TONE[status]}>{LABEL[status]}</Badge>
        {actions}
      </div>
    </Card>
  );
}