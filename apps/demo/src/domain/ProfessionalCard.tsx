'use client';

import * as React from 'react';
import { Card, Avatar, Typography } from '@sereno-ds/ui';
import { sx } from './sx';

/** Identity card for a professional — public directory, booking header, team lists. */
export interface ProfessionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** e.g. "Psicóloga clínica". */
  specialty?: string;
  /** Professional registration, e.g. "CRP 06/123456". */
  credential?: string;
  location?: string;
  /** Pre-formatted, e.g. "4,9 (128)". */
  rating?: string;
  photo?: string;
  selected?: boolean;
  onSelect?: () => void;
  /** Trailing element, usually a Button. */
  action?: React.ReactNode;
}

export function ProfessionalCard({ name, specialty, credential, location, rating, photo, selected = false, onSelect, action, style, ...rest }: ProfessionalCardProps) {
  return (
    <Card
      interactive={!!onSelect}
      selected={selected}
      padding="md"
      onClick={onSelect}
      style={sx({ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', ...style })}
      {...rest}
    >
      <Avatar name={name} src={photo} size="lg" />
      <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 })}>
        <Typography variant="h3">{name}</Typography>
        {specialty && <Typography variant="bodySm">{specialty}</Typography>}
        <div style={sx({ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 2 })}>
          {credential && <Typography variant="caption">{credential}</Typography>}
          {location && <Typography variant="caption">{location}</Typography>}
          {rating && (
            <Typography variant="caption" color="brand" style={{ fontWeight: 'var(--weight-semibold)' }}>
              {rating}
            </Typography>
          )}
        </div>
      </div>
      {action}
    </Card>
  );
}