'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button, IconButton } from '@sereno-ds/ui';

export interface WhatsAppButtonProps {
  /** Any format — non-digits are stripped. Must include the country code (e.g. "+55 11 99999-8888"). */
  phone: string;
  /** Pre-filled message text. */
  message?: string;
  /** Visible label. Icon-only (a round IconButton) when omitted. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

function waUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}` + (message ? `?text=${encodeURIComponent(message)}` : '');
}

/**
 * Quick action that opens a WhatsApp chat with a client or professional in a
 * new tab — the product's own communication channel (reminders,
 * confirmations and cancellations already go out over WhatsApp; see
 * BookingFlow, AgendaView). A `<button onClick>` rather than a real
 * `<a href>` on purpose: it needs the same `disabled` affordance as every
 * other DS control when there's no phone on file, which a plain anchor
 * can't fake convincingly for keyboard/AT users.
 */
export function WhatsAppButton({ phone, message, label, size = 'md', disabled = false }: WhatsAppButtonProps) {
  const off = disabled || !phone;
  const open = () => {
    if (off) return;
    window.open(waUrl(phone, message), '_blank', 'noopener,noreferrer');
  };

  if (label) {
    return (
      <Button variant="secondary" size={size} iconLeft={<MessageCircle size={16} strokeWidth={1.75} />} onClick={open} disabled={off}>
        {label}
      </Button>
    );
  }
  return (
    <IconButton label="Conversar no WhatsApp" size={size} onClick={open} disabled={off}>
      <MessageCircle size={18} strokeWidth={1.75} />
    </IconButton>
  );
}
