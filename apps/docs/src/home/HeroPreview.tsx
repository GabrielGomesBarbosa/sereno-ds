'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Avatar, Badge, Button, Card, Stepper, Switch } from '@sereno/ui';

const STEPS = [{ label: 'Serviço' }, { label: 'Horário' }, { label: 'Confirmar' }];

/**
 * A few real primitives, wired up — the same thing the product screens do,
 * shown next to the hero copy as proof rather than a screenshot.
 */
export function HeroPreview() {
  const [step, setStep] = React.useState(2);
  const [whatsapp, setWhatsapp] = React.useState(true);

  return (
    <Card padding="lg" elevation="md" style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Avatar name="Ana Beatriz Ramos" size="md" status="confirmed" />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Ana Beatriz Ramos</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Psicóloga clínica</span>
        </div>
        <Badge tone="success" size="sm" style={{ marginLeft: 'auto' }}>
          Confirmado
        </Badge>
      </div>

      <Stepper steps={STEPS} current={step} onStepClick={setStep} />

      <Switch label="Lembrete no WhatsApp" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />

      <Button variant="accent" size="lg" fullWidth iconLeft={<Check size={18} strokeWidth={2} />}>
        Confirmar agendamento
      </Button>
    </Card>
  );
}
