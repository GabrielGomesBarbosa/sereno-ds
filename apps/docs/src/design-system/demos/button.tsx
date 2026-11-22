'use client';

import { Button } from '@sereno-ds/ui';
import { Check, ChevronRight, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { row } from './_shared';

function ButtonBasico() {
  return (
    <div style={row}>
      <Button>Save</Button>
      <Button variant="accent">Confirm booking</Button>
      <Button variant="secondary">Back</Button>
    </div>
  );
}

function ButtonVariantes() {
  return (
    <div style={row}>
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}

function ButtonSemantic() {
  return (
    <div style={row}>
      <Button variant="success" iconLeft={<Check size={16} strokeWidth={1.75} />}>
        Approve
      </Button>
      <Button variant="warning">Review flags</Button>
      <Button variant="error" iconLeft={<Trash2 size={16} strokeWidth={1.75} />}>
        Delete account
      </Button>
    </div>
  );
}

function ButtonTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'baseline' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XL</Button>
    </div>
  );
}

function ButtonComIcone() {
  return (
    <div style={row}>
      <Button iconLeft={<Plus size={16} strokeWidth={1.75} />}>New service</Button>
      <Button variant="secondary" iconRight={<ChevronRight size={16} strokeWidth={1.75} />}>
        Next
      </Button>
    </div>
  );
}

function ButtonEstados() {
  return (
    <div style={row}>
      <Button loading>Sending</Button>
      <Button disabled>Unavailable</Button>
    </div>
  );
}

function ButtonFullWidth() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <Button variant="accent" size="lg" fullWidth>
        Confirm booking
      </Button>
    </div>
  );
}

export const buttonDemos: Record<string, React.FC> = {
    basic: ButtonBasico,
    variants: ButtonVariantes,
    semantic: ButtonSemantic,
    sizes: ButtonTamanhos,
    'with-icon': ButtonComIcone,
    states: ButtonEstados,
    'full-width': ButtonFullWidth,
  };
