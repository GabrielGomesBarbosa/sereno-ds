'use client';

import * as React from 'react';
import { Button, Checkbox, Dialog, Input, Select } from '@sereno-ds/ui';
import { col, row } from './_shared';

function DialogCenter() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Dialog.Header title="Cancel booking?" description="The client will be notified via WhatsApp and the slot frees up." />
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Back
          </Button>
          <Button variant="error" onClick={() => setOpen(false)}>
            Cancel booking
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DialogSheet() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <Dialog open={open} variant="sheet" onClose={() => setOpen(false)}>
        <Dialog.Header title="Filter calendar" description="Choose the period and the booking status." />
        <Dialog.Footer>
          <Button variant="accent" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

const DIALOG_SIZES = ['sm', 'md', 'lg', 'xl'] as const;

function DialogSizes() {
  const [size, setSize] = React.useState<(typeof DIALOG_SIZES)[number] | null>(null);
  return (
    <div style={row}>
      {DIALOG_SIZES.map((s) => (
        <Button key={s} variant="secondary" onClick={() => setSize(s)}>
          {s}
        </Button>
      ))}
      <Dialog open={size !== null} size={size ?? 'sm'} onClose={() => setSize(null)}>
        <Dialog.Header
          title={`size="${size ?? 'sm'}"`}
          description="The centered modal caps at a fixed max-width per size and still shrinks to fit narrow screens."
        />
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => setSize(null)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DialogDividers() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} dividers size="md" onClose={() => setOpen(false)}>
        <Dialog.Header title="Terms of service">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <div style={{ ...col, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} style={{ margin: 0 }}>
                {i + 1}. Cras mattis consectetur purus sit amet fermentum. Morbi leo risus, porta ac
                consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl
                consectetur et. Donec ullamcorper nulla non metus auctor fringilla.
              </p>
            ))}
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Decline
          </Button>
          <Button onClick={() => setOpen(false)}>Accept</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DialogForm() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>New booking</Button>
      <Dialog open={open} size="md" onClose={() => setOpen(false)}>
        <Dialog.Header title="New booking" description="Forms sit inside a Dialog without ceremony, inputs, selects and checkboxes all work.">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <div style={col}>
            <Input label="Client" placeholder="Full name" />
            <Select
              label="Service"
              placeholder="Pick one"
              options={[
                { value: 'assessment', label: 'First assessment (60 min)' },
                { value: 'session', label: 'Therapy session (50 min)' },
                { value: 'followup', label: 'Follow-up (30 min)' },
              ]}
            />
            <Select
              label="Professional"
              placeholder="Pick one"
              options={[
                'Ana Beatriz Ramos',
                'Bruno Katsumata',
                'Carla Nogueira',
                'Diego Martins',
                'Elisa Fontanella',
                'Helena Prado',
                'Igor Salvatori',
                'Júlia Menezes',
                'Lucas Andrade',
                'Marina Okafor',
                'Nina Vasconcelos',
                'Otávio Ribeiro',
                'Paula Sciarra',
                'Rafael Bittencourt',
              ].map((n) => ({ value: n.toLowerCase().split(' ')[0], label: n }))}
            />
            <Checkbox label="Notify the client on WhatsApp" defaultChecked />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DialogFullscreen() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open full screen</Button>
      <Dialog open={open} variant="fullscreen" dividers onClose={() => setOpen(false)}>
        <Dialog.Header title="Edit availability" description="Fills the viewport: for immersive, multi-section flows on any screen size.">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <div style={{ ...col, maxWidth: 560 }}>
            <Input label="Working hours" placeholder="09:00 – 18:00" />
            <Select
              label="Days off"
              placeholder="Pick days"
              options={[
                { value: 'sat', label: 'Saturday' },
                { value: 'sun', label: 'Sunday' },
                { value: 'mon', label: 'Monday' },
              ]}
            />
            <Input label="Notes" placeholder="Visible to clients" />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Discard
          </Button>
          <Button onClick={() => setOpen(false)}>Save changes</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DialogRequired() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Leave editor</Button>
      <Dialog open={open} dismissible={false} onClose={() => setOpen(false)}>
        <Dialog.Header title="Discard 3 unsaved changes?" description="A scrim click and Escape are off here, pick one. There is still a way out on the left." />
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Keep editing
          </Button>
          <Button variant="error" onClick={() => setOpen(false)}>
            Discard
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export const dialogDemos: Record<string, React.FC> = {
    center: DialogCenter,
    sheet: DialogSheet,
    sizes: DialogSizes,
    dividers: DialogDividers,
    form: DialogForm,
    fullscreen: DialogFullscreen,
    dismissible: DialogRequired,
  };
