'use client';

import * as React from 'react';
import { Button, Stepper } from '@sereno-ds/ui';
import { BodyLines, col } from './_shared';

const STEP_ITEMS = [
  { value: 'perfil', label: 'Your profile' },
  { value: 'servico', label: 'First service' },
  { value: 'grade', label: 'Your schedule' },
  { value: 'review', label: 'Review & finish' },
];

function StepperWizard({
  variant,
  clickable,
  stepLabel,
}: {
  variant?: 'bar' | 'dots';
  clickable?: boolean;
  stepLabel?: (c: number, t: number) => React.ReactNode;
}) {
  const [step, setStep] = React.useState(0);
  const last = STEP_ITEMS.length - 1;
  return (
    <div style={{ ...col, maxWidth: variant === 'dots' ? 340 : 460 }}>
      <Stepper current={step} variant={variant} onStepClick={clickable ? setStep : undefined} stepLabel={stepLabel}>
        {STEP_ITEMS.map((s) => (
          <Stepper.Step key={s.value} value={s.value} label={s.label} />
        ))}
      </Stepper>
      <div
        style={{
          marginTop: 'var(--space-1)',
          padding: 'var(--space-4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          minHeight: 92,
        }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
          {STEP_ITEMS[step].label}
        </span>
        <BodyLines />
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button size="sm" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setStep((s) => (s === last ? 0 : s + 1))}>
          {step === last ? 'Start over' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function StepperBar() {
  return <StepperWizard variant="bar" />;
}

function StepperDots() {
  return <StepperWizard variant="dots" />;
}

function StepperClicavel() {
  return <StepperWizard variant="bar" clickable />;
}

function StepperContador() {
  return <StepperWizard variant="bar" stepLabel={(c, t) => `${c} / ${t}`} />;
}

export const stepperDemos: Record<string, React.FC> = { bar: StepperBar, dots: StepperDots, clickable: StepperClicavel, 'step-label': StepperContador };
