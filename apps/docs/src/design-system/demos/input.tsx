'use client';

import { Button, Input } from '@sereno-ds/ui';
import { Lock, Mail, Phone } from 'lucide-react';
import * as React from 'react';
import { fieldCol, row } from './_shared';

function InputBasico() {
  return (
    <div style={fieldCol}>
      <Input label="Full name" placeholder="Marina Alves" />
      <Input label="WhatsApp" required hint="We'll send the confirmation here." placeholder="(11) 90000-0000" />
    </div>
  );
}

function InputIconeSufixo() {
  return (
    <div style={fieldCol}>
      <Input label="WhatsApp" iconLeft={<Phone size={16} strokeWidth={1.75} />} placeholder="(11) 90000-0000" />
      <Input label="Duration" suffix="min" defaultValue="50" />
      <Input label="Price" prefix="R$" placeholder="0,00" />
    </div>
  );
}

function InputMascaras() {
  const [phone, setPhone] = React.useState('');
  const [cpf, setCpf] = React.useState('');
  const [cep, setCep] = React.useState('');
  const [price, setPrice] = React.useState('');
  return (
    <div style={fieldCol}>
      <Input label="WhatsApp" mask="phone" iconLeft={<Phone size={16} strokeWidth={1.75} />} placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
      <Input label="CPF" mask="cpf" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.currentTarget.value)} />
      <Input label="CEP" mask="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.currentTarget.value)} />
      <Input label="Price" mask="currency" prefix="R$" placeholder="0,00" value={price} onChange={(e) => setPrice(e.currentTarget.value)} />
    </div>
  );
}

function InputSenha() {
  return (
    <div style={fieldCol}>
      <Input label="Password" type="password" iconLeft={<Lock size={16} strokeWidth={1.75} />} defaultValue="sereno123" />
      <Input label="New password" type="password" hint="At least 8 characters." placeholder="••••••••" />
    </div>
  );
}

function InputContador() {
  const [bio, setBio] = React.useState('Psicóloga clínica, abordagem TCC.');
  return (
    <div style={fieldCol}>
      <Input label="Headline" maxLength={60} value={bio} onChange={(e) => setBio(e.currentTarget.value)} />
    </div>
  );
}

function InputContadorPorCodigo() {
  // Uncontrolled, filled from outside: what react-hook-form's reset() / setValue() do.
  const ref = React.useRef<HTMLInputElement>(null);
  const fill = (v: string) => {
    if (ref.current) ref.current.value = v;
  };
  return (
    <div style={fieldCol}>
      <Input label="Headline" maxLength={60} ref={ref} placeholder="Empty until filled from code" />
      <div style={row}>
        <Button size="sm" variant="secondary" onClick={() => fill('Psicóloga clínica, abordagem TCC.')}>
          Fill from code
        </Button>
        <Button size="sm" variant="ghost" onClick={() => fill('')}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function InputEstados() {
  return (
    <div style={fieldCol}>
      <Input label="Email" iconLeft={<Mail size={16} strokeWidth={1.75} />} error="Enter a valid email." defaultValue="marina@" />
      <Input label="Registration" defaultValue="CRP 06/123456" disabled />
    </div>
  );
}

function InputTamanhos() {
  return (
    <div style={fieldCol}>
      <Input label="Field" size="sm" placeholder="sm" />
      <Input label="Field" size="md" placeholder="md" />
      <Input label="Field" size="lg" placeholder="lg" />
    </div>
  );
}

function InputSemLayoutShift() {
  return (
    <div style={fieldCol}>
      <Input label="Email" required error="This field is required." preserveHelperSpace />
      <Input label="Password" type="password" required error="This field is required." preserveHelperSpace />
    </div>
  );
}

export const inputDemos: Record<string, React.FC> = {
    basic: InputBasico,
    'icon-suffix': InputIconeSufixo,
    masked: InputMascaras,
    password: InputSenha,
    count: InputContador,
    'count-from-code': InputContadorPorCodigo,
    states: InputEstados,
    sizes: InputTamanhos,
    'no-layout-shift': InputSemLayoutShift,
  };
