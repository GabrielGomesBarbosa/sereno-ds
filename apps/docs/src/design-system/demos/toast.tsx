'use client';

import { Button, Select, Toast, ToastProvider, useToast } from '@sereno-ds/ui';
import { Check } from 'lucide-react';
import * as React from 'react';
import { col, row } from './_shared';

function ToastTons() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <Toast tone="success" title="Booking cancelled" description="The client was notified via WhatsApp." icon={<Check size={18} strokeWidth={1.75} />} />
      <Toast tone="neutral" title="Link copied" />
    </div>
  );
}

function ToastComAcao() {
  const [toast, setToast] = React.useState(true);
  return (
    <div style={{ maxWidth: 420 }}>
      {toast ? (
        <Toast
          tone="success"
          title="Service removed"
          action={
            <Button variant="link" size="sm">
              Undo
            </Button>
          }
          onClose={() => setToast(false)}
        />
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setToast(true)}>
          Show again
        </Button>
      )}
    </div>
  );
}

const TOAST_POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

function ToastSistemaBotoes() {
  const { toast, dismiss } = useToast();
  return (
    <div style={{ ...row, gap: 'var(--space-3)' }}>
      <Button size="sm" onClick={() => toast.success('Booking confirmed', { description: 'The client was notified via WhatsApp.' })}>
        Success
      </Button>
      <Button size="sm" variant="secondary" onClick={() => toast.error('Payment failed', { description: 'The card was declined.' })}>
        Error
      </Button>
      <Button size="sm" variant="secondary" onClick={() => toast('Link copied')}>
        Neutral
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast.info('Sync in progress', {
            duration: 0,
            action: (
              <Button variant="link" size="sm">
                View
              </Button>
            ),
          })
        }
      >
        Persistent + action
      </Button>
      <Button size="sm" variant="link" onClick={() => dismiss()}>
        Dismiss all
      </Button>
    </div>
  );
}

function ToastSistema() {
  const [position, setPosition] = React.useState<(typeof TOAST_POSITIONS)[number]>('bottom-right');
  return (
    <div style={{ ...col, gap: 'var(--space-4)' }}>
      <div style={{ maxWidth: 220 }}>
        <Select
          label="Position"
          value={position}
          onValueChange={(v) => setPosition(v as (typeof TOAST_POSITIONS)[number])}
          options={TOAST_POSITIONS.map((p) => ({ value: p, label: p }))}
        />
      </div>
      <ToastProvider key={position} position={position} duration={5000}>
        <ToastSistemaBotoes />
      </ToastProvider>
    </div>
  );
}

export const toastDemos: Record<string, React.FC> = { tones: ToastTons, 'with-action': ToastComAcao, system: ToastSistema };
