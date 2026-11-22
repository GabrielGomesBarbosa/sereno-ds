'use client';

import * as React from 'react';
import { Radio } from '@sereno-ds/ui';
import { col, legendStyle } from './_shared';

function RadioVertical() {
  const [v, setV] = React.useState('online');
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, width: '100%', ...col }}>
      <legend style={legendStyle}>Appointment format</legend>
      <Radio name="fmt-v" label="Online" description="By video call." checked={v === 'online'} onChange={() => setV('online')} />
      <Radio name="fmt-v" label="In person" description="At the office, in Pinheiros." checked={v === 'inperson'} onChange={() => setV('inperson')} />
      <Radio name="fmt-v" label="Hybrid" description="First session in person, the rest online." checked={v === 'hybrid'} onChange={() => setV('hybrid')} />
    </fieldset>
  );
}

function RadioHorizontal() {
  const [v, setV] = React.useState('30');
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, width: '100%', ...col }}>
      <legend style={legendStyle}>Session duration</legend>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', width: '100%' }}>
        {['30', '45', '60'].map((m) => (
          <Radio key={m} name="dur-h" label={`${m} min`} checked={v === m} onChange={() => setV(m)} />
        ))}
      </div>
    </fieldset>
  );
}

function RadioEstados() {
  return (
    <div style={col}>
      <fieldset style={{ border: 'none', margin: 0, padding: 0, ...col }}>
        <legend style={legendStyle}>Plan</legend>
        <Radio name="plan-d" label="Free" defaultChecked />
        <Radio name="plan-d" label="Pro (coming soon)" disabled />
      </fieldset>
      <Radio name="plan2-d" label="Locked selection" disabled defaultChecked />
    </div>
  );
}

function RadioTamanhos() {
  const [v, setV] = React.useState('a');
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, width: '100%', ...col }}>
      <legend style={legendStyle}>Box size</legend>
      <Radio name="sz" size="sm" label="Small (16px)" checked={v === 'a'} onChange={() => setV('a')} />
      <Radio name="sz" label="Medium (20px, default)" checked={v === 'b'} onChange={() => setV('b')} />
    </fieldset>
  );
}

function RadioErro() {
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, width: '100%', ...col }}>
      <legend style={legendStyle}>Payment method</legend>
      <Radio name="pay-error" label="Credit card" />
      <Radio name="pay-error" label="Pix" />
      <Radio name="pay-error" label="Bank transfer" error="Select a payment method." />
    </fieldset>
  );
}

export const radioDemos: Record<string, React.FC> = { vertical: RadioVertical, horizontal: RadioHorizontal, states: RadioEstados, sizes: RadioTamanhos, error: RadioErro };
