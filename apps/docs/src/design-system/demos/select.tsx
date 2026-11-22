'use client';

import * as React from 'react';
import { Button, Dialog, Select } from '@sereno-ds/ui';
import { fieldCol } from './_shared';

const SEL_OPTS = [
  { value: '30 min', label: '30 min' },
  { value: '50 min', label: '50 min' },
  { value: '1h', label: '1 hour' },
];

function SelectBasico() {
  const [v, setV] = React.useState('50 min');
  return (
    <div style={{ maxWidth: 420 }}>
      <Select label="Duration" value={v} onValueChange={setV} options={SEL_OPTS} />
    </div>
  );
}

function SelectHint() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Select
        label="Time zone"
        placeholder="Choose a time zone"
        hint="Used for the times on the public link."
        options={[
          { value: 'sp', label: 'Brasília (GMT-3)' },
          { value: 'mao', label: 'Manaus (GMT-4)' },
        ]}
      />
    </div>
  );
}

function SelectDesabilitado() {
  return (
    <div style={fieldCol}>
      <Select label="Duration" defaultValue="30 min" disabled options={SEL_OPTS} />
      <Select
        label="Plan"
        defaultValue="free"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro (coming soon)', disabled: true },
        ]}
      />
    </div>
  );
}

function SelectTamanhos() {
  return (
    <div style={fieldCol}>
      <Select label="Field" size="sm" defaultValue="30 min" options={SEL_OPTS} />
      <Select label="Field" size="md" defaultValue="30 min" options={SEL_OPTS} />
      <Select label="Field" size="lg" defaultValue="30 min" options={SEL_OPTS} />
    </div>
  );
}

function SelectErro() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Select label="Duration" required placeholder="Pick a duration" error="Choose how long the session lasts." options={SEL_OPTS} />
    </div>
  );
}

const CITY_OPTS = [
  'Auckland', 'Bogotá', 'Buenos Aires', 'Cairo', 'Chicago', 'Dubai', 'Dublin',
  'Helsinki', 'Istanbul', 'Jakarta', 'Johannesburg', 'Lagos', 'Lisbon', 'London',
  'Los Angeles', 'Madrid', 'Mexico City', 'Mumbai', 'Nairobi', 'New York', 'Paris',
  'Reykjavík', 'São Paulo', 'Seoul', 'Singapore', 'Sydney', 'Tokyo', 'Toronto',
].map((c) => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }));

function SelectLista() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Select label="Home city" placeholder="Search the list" defaultValue="lisbon" options={CITY_OPTS} />
    </div>
  );
}

function SelectNoDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} size="md" onClose={() => setOpen(false)}>
        <Dialog.Header title="Pick a service" description="The list opens over the dialog. Esc closes the list first, and the dialog on the next press.">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Select
            label="Service"
            placeholder="Pick one"
            options={[
              { value: 'assessment', label: 'First assessment (60 min)' },
              { value: 'session', label: 'Therapy session (50 min)' },
              { value: 'followup', label: 'Follow-up (30 min)' },
            ]}
          />
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export const selectDemos: Record<string, React.FC> = { basic: SelectBasico, placeholder: SelectHint, error: SelectErro, disabled: SelectDesabilitado, sizes: SelectTamanhos, long: SelectLista, 'in-dialog': SelectNoDialog };
