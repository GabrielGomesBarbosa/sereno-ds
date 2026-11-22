'use client';

import { Badge } from '@sereno-ds/ui';
import * as React from 'react';
import { row } from './_shared';

function BadgeCiclo() {
  return (
    <div style={row}>
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="error">Cancelled</Badge>
      <Badge tone="info">Online</Badge>
      <Badge tone="neutral">Completed</Badge>
    </div>
  );
}

function BadgeGenericos() {
  return (
    <div style={row}>
      <Badge tone="info" dot={false}>
        Online
      </Badge>
      <Badge tone="neutral" dot={false}>
        São Paulo
      </Badge>
    </div>
  );
}

function BadgeTamanhos() {
  return (
    <div style={row}>
      <Badge tone="success" size="sm">
        Confirmed
      </Badge>
      <Badge tone="success" size="md">
        Confirmed
      </Badge>
    </div>
  );
}

function BadgePulso() {
  return (
    <div style={row}>
      <Badge tone="success" pulse>
        Open now
      </Badge>
      <Badge tone="warning" pulse>
        Closing soon
      </Badge>
      <Badge tone="info" size="sm" pulse>
        Online
      </Badge>
    </div>
  );
}

export const badgeDemos: Record<string, React.FC> = { tones: BadgeCiclo, labels: BadgeGenericos, sizes: BadgeTamanhos, pulse: BadgePulso };
