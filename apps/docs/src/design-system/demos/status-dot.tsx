'use client';

import { StatusDot } from '@sereno-ds/ui';
import * as React from 'react';
import { dotRow, row } from './_shared';

function StatusDotTons() {
  return (
    <div style={{ ...row, gap: 20 }}>
      <span style={dotRow}>
        <StatusDot tone="success" /> Open
      </span>
      <span style={dotRow}>
        <StatusDot tone="warning" /> Closing soon
      </span>
      <span style={dotRow}>
        <StatusDot tone="error" /> Closed
      </span>
      <span style={dotRow}>
        <StatusDot tone="info" /> On a call
      </span>
      <span style={dotRow}>
        <StatusDot tone="neutral" /> Unknown
      </span>
    </div>
  );
}

function StatusDotPulso() {
  return (
    <div style={{ ...row, gap: 20 }}>
      <span style={dotRow}>
        Ana Ramos <StatusDot tone="success" pulse label="Online" />
      </span>
      <span style={dotRow}>
        <StatusDot tone="warning" pulse /> Closing soon
      </span>
      <span style={dotRow}>
        <StatusDot tone="error" pulse /> Needs attention
      </span>
    </div>
  );
}

function StatusDotTamanhos() {
  return (
    <div style={{ ...row, gap: 20 }}>
      <span style={dotRow}>
        <StatusDot tone="success" size="sm" /> sm (5px)
      </span>
      <span style={dotRow}>
        <StatusDot tone="success" size="md" /> md (6px)
      </span>
    </div>
  );
}

export const statusDotDemos: Record<string, React.FC> = { tones: StatusDotTons, pulse: StatusDotPulso, sizes: StatusDotTamanhos };
