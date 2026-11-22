'use client';

import { Button, Card, EmptyState } from '@sereno-ds/ui';
import { BarChart3, CalendarCheck, Users } from 'lucide-react';
import * as React from 'react';

function EmptyStateBasico() {
  return (
    <div style={{ maxWidth: 460 }}>
      <EmptyState icon={<CalendarCheck size={22} strokeWidth={1.75} />} title="No bookings today" description="A good time to review your services." />
    </div>
  );
}

function EmptyStateComAcao() {
  return (
    <div style={{ maxWidth: 460 }}>
      <EmptyState
        icon={<Users size={22} strokeWidth={1.75} />}
        title="No clients yet"
        description="Your clients show up here after the first booking."
        action={<Button size="sm">Share my link</Button>}
      />
    </div>
  );
}

function EmptyStateCompact() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Card padding="none">
        <EmptyState compact icon={<BarChart3 size={22} strokeWidth={1.75} />} title="Reports coming soon" description="Revenue and occupancy charts aren't defined yet." />
      </Card>
    </div>
  );
}

export const emptyStateDemos: Record<string, React.FC> = { basic: EmptyStateBasico, 'with-action': EmptyStateComAcao, compact: EmptyStateCompact };
