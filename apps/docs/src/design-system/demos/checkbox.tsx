'use client';

import * as React from 'react';
import { Checkbox } from '@sereno-ds/ui';
import { col, legendStyle } from './_shared';

function CheckboxBasico() {
  const [a, setA] = React.useState(false);
  const [b, setB] = React.useState(true);
  const [c, setC] = React.useState(true);
  return (
    <div style={col}>
      <Checkbox label="I accept the terms" checked={a} onChange={(e) => setA(e.currentTarget.checked)} />
      <Checkbox label="Subscribe to the newsletter" checked={b} onChange={(e) => setB(e.currentTarget.checked)} />
      <Checkbox
        label="Send me WhatsApp reminders"
        description="Sent 24h and 1h before the session."
        checked={c}
        onChange={(e) => setC(e.currentTarget.checked)}
      />
    </div>
  );
}

function CheckboxEstados() {
  return (
    <div style={col}>
      <Checkbox label="Unavailable on the free plan" disabled />
      <Checkbox label="Included on every plan" disabled defaultChecked />
    </div>
  );
}

const CHANNELS = ['WhatsApp', 'Email', 'SMS'];

function CheckboxIndeterminado() {
  const [on, setOn] = React.useState([true, false, false]);
  const all = on.every(Boolean);
  const none = on.every((v) => !v);
  return (
    <div style={col}>
      <Checkbox label="All channels" checked={all} indeterminate={!all && !none} onChange={(e) => setOn(CHANNELS.map(() => e.target.checked))} />
      <div style={{ ...col, paddingLeft: 32 }}>
        {CHANNELS.map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={on[i]}
            onChange={(e) => {
              const v = e.target.checked;
              setOn((s) => s.map((old, j) => (j === i ? v : old)));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CheckboxTamanhos() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(true);
  return (
    <div style={col}>
      <Checkbox size="sm" label="Small (16px)" checked={a} onChange={(e) => setA(e.currentTarget.checked)} />
      <Checkbox label="Medium (20px, default)" checked={b} onChange={(e) => setB(e.currentTarget.checked)} />
    </div>
  );
}

function CheckboxErro() {
  return (
    <div style={col}>
      <Checkbox label="I accept the terms" error="You must accept the terms to continue." />
    </div>
  );
}

function CheckboxGrupo() {
  const OPTS = ['Psychology', 'Nutrition', 'Physiotherapy', 'Speech therapy'];
  const [sel, setSel] = React.useState<string[]>(['Psychology', 'Nutrition']);
  const toggle = (o: string) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, ...col }}>
      <legend style={legendStyle}>Filter by specialty</legend>
      {OPTS.map((o) => (
        <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
      ))}
    </fieldset>
  );
}

function CheckboxHorizontal() {
  const OPTS = ['WhatsApp', 'Email', 'SMS'];
  const [sel, setSel] = React.useState<string[]>(['WhatsApp']);
  const toggle = (o: string) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, width: '100%', ...col }}>
      <legend style={legendStyle}>Preferred contact channels</legend>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', width: '100%' }}>
        {OPTS.map((o) => (
          <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
        ))}
      </div>
    </fieldset>
  );
}

export const checkboxDemos: Record<string, React.FC> = {
    basic: CheckboxBasico,
    states: CheckboxEstados,
    indeterminate: CheckboxIndeterminado,
    sizes: CheckboxTamanhos,
    error: CheckboxErro,
    group: CheckboxGrupo,
    horizontal: CheckboxHorizontal,
  };
