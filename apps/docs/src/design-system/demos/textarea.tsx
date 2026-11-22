'use client';

import { Textarea } from '@sereno-ds/ui';
import * as React from 'react';

function TextareaBasico() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Any notes?" rows={3} hint="Optional." placeholder="e.g. first time in therapy." />
    </div>
  );
}

function TextareaErro() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Service description" rows={3} error="The description needs at least 20 characters." defaultValue="Session." />
    </div>
  );
}

function TextareaContador() {
  const [note, setNote] = React.useState('First time in therapy.');
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Any notes?" rows={3} maxLength={140} hint="Optional." value={note} onChange={(e) => setNote(e.currentTarget.value)} />
    </div>
  );
}

export const textareaDemos: Record<string, React.FC> = { basic: TextareaBasico, count: TextareaContador, error: TextareaErro };
