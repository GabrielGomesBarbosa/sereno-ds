'use client';

import { ActionCard, Badge } from '@sereno-ds/ui';
import {
  Bell,
  CalendarClock,
  Lock,
  Mail,
  Pencil,
  Phone,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { col } from './_shared';

function ActionCardBasico() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <ActionCard icon={<CalendarClock size={20} />} title="Reschedule" description="Pick another day and time" onClick={() => {}} />
      <ActionCard icon={<Pencil size={20} />} title="Edit the booking" description="Change the service or the notes" onClick={() => {}} />
      <ActionCard icon={<Share2 size={20} />} title="Share the link" description="Send it to the client" onClick={() => {}} />
    </div>
  );
}

function ActionCardSelecionado() {
  const [on, setOn] = React.useState<'email' | 'sms'>('email');
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <ActionCard selected={on === 'email'} onClick={() => setOn('email')} icon={<Mail size={20} />} title="E-mail" description="A message with the details" trailing={null} />
      <ActionCard selected={on === 'sms'} onClick={() => setOn('sms')} icon={<Phone size={20} />} title="SMS" description="A short text message" trailing={null} />
    </div>
  );
}

function ActionCardVariantes() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <ActionCard icon={<Plus size={20} />} title="New booking" description="Add a client to the agenda" onClick={() => {}} />
      <ActionCard variant="primary" icon={<Sparkles size={20} />} title="Open the agenda" description="See today at a glance" onClick={() => {}} />
      <ActionCard variant="error" icon={<Trash2 size={20} />} title="Cancel the booking" description="This cannot be undone" onClick={() => {}} />
    </div>
  );
}

function ActionCardDesabilitado() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <ActionCard disabled icon={<Lock size={20} />} title="Export the report" description="Available on the yearly plan" />
    </div>
  );
}

function ActionCardFinal() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <ActionCard icon={<Wallet size={20} />} title="Payments" description="Cards and Pix" trailing={<Badge tone="warning" size="sm">Set up</Badge>} onClick={() => {}} />
      <ActionCard icon={<Bell size={20} />} title="Reminders" description="Sent the day before" trailing={null} onClick={() => {}} />
    </div>
  );
}

export const actionCardDemos: Record<string, React.FC> = { basic: ActionCardBasico, selected: ActionCardSelecionado, variants: ActionCardVariantes, disabled: ActionCardDesabilitado, trailing: ActionCardFinal };
