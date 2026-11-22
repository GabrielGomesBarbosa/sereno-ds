'use client';

import * as React from 'react';
import { Switch } from '@sereno-ds/ui';
import { col } from './_shared';

function SwitchBasico() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch label="24h reminder" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Switch label="Daily email digest" description="Sent at 7am with the day's agenda." checked={b} onChange={(e) => setB(e.target.checked)} />
    </div>
  );
}

function SwitchSettings() {
  const [s, setS] = React.useState({ online: true, whats: true, reminders: false, digest: false });
  const set = (k: keyof typeof s) => (e: { target: { checked: boolean } }) => setS((v) => ({ ...v, [k]: e.target.checked }));
  return (
    <div style={{ ...col, gap: 20, maxWidth: 420 }}>
      <Switch label="Accept online bookings" description="Your public link takes new appointments." checked={s.online} onChange={set('online')} />
      <Switch label="WhatsApp notifications" description="A message on every new booking or cancellation." checked={s.whats} onChange={set('whats')} />
      <Switch label="Client reminders" description="Sent to the client 24h and 1h before." checked={s.reminders} onChange={set('reminders')} />
      <Switch label="Daily agenda email" description="At 7am, the day's appointments." checked={s.digest} onChange={set('digest')} />
    </div>
  );
}

function SwitchEstados() {
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch label="Paid-plan feature (off)" disabled />
      <Switch label="Locked on" checked disabled />
    </div>
  );
}

function SwitchTamanhos() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(true);
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch size="sm" label="Small track" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Switch label="Medium track (default)" checked={b} onChange={(e) => setB(e.target.checked)} />
    </div>
  );
}

export const switchDemos: Record<string, React.FC> = { basic: SwitchBasico, settings: SwitchSettings, states: SwitchEstados, sizes: SwitchTamanhos };
