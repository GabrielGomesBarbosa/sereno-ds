'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Card, Switch, Tabs } from '@sereno-ds/ui';

const FLOW = [
  { value: 'service', label: 'Service' },
  { value: 'time', label: 'Time' },
  { value: 'confirm', label: 'Confirm' },
];

/**
 * A few real primitives, wired up — the same thing the product screens do,
 * shown next to the hero copy as proof rather than a screenshot.
 */
export function HeroPreview() {
  const [step, setStep] = React.useState('confirm');
  const [reminder, setReminder] = React.useState(true);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <Alert
        tone="success"
        style={{ position: 'absolute', right: -12, top: -28, maxWidth: 260, boxShadow: 'var(--shadow-lg)', zIndex: 2 }}
      >
        Booking confirmed with Ana.
      </Alert>

      <Card padding="lg" elevation="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Avatar name="Ana Ramos" size="md" status="confirmed" />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Ana Ramos</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Clinical psychologist</span>
          </div>
          <Badge tone="success" size="sm" style={{ marginLeft: 'auto' }}>
            Confirmed
          </Badge>
        </div>

        <Tabs items={FLOW} value={step} onChange={setStep} fullWidth />

        <Switch label="WhatsApp reminder" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="lg" style={{ flex: '0 0 auto' }}>
            Back
          </Button>
          <Button variant="accent" size="lg" fullWidth iconLeft={<Check size={18} strokeWidth={2} />}>
            Confirm booking
          </Button>
        </div>
      </Card>
    </div>
  );
}
