'use client';

import * as React from 'react';
import { Button, DateRangePicker, Dialog, type DateRange } from '@sereno-ds/ui';
import { bookedDaysOf } from './_shared';

const EMPTY: DateRange = { start: '', end: '' };

// Fixed dates near the date the pixel tests freeze (15 June 2026), so the range, today and the next month are all on screen.
function DateRangePickerBasico() {
  const [range, setRange] = React.useState<DateRange>({ start: '2026-06-10', end: '2026-06-18' });
  return (
    <div style={{ maxWidth: 300 }}>
      <DateRangePicker label="Report period" value={range} onChange={setRange} locale="en" />
    </div>
  );
}

function DateRangePickerMeses() {
  const [range, setRange] = React.useState<DateRange>({ start: '2026-06-26', end: '2026-07-04' });
  return (
    <div style={{ maxWidth: 300 }}>
      <DateRangePicker label="Away" value={range} onChange={setRange} locale="en" />
    </div>
  );
}

function DateRangePickerLimites() {
  const [range, setRange] = React.useState<DateRange>(EMPTY);
  return (
    <div style={{ maxWidth: 300 }}>
      <DateRangePicker label="Book between" hint="Only until the end of July." min="2026-06-08" max="2026-07-31" value={range} onChange={setRange} locale="en" />
    </div>
  );
}

function DateRangePickerMarcadores() {
  const [range, setRange] = React.useState<DateRange>({ start: '2026-06-09', end: '2026-06-12' });
  const [dots, setDots] = React.useState(() => bookedDaysOf(2026, 5));
  return (
    <div style={{ maxWidth: 300 }}>
      <DateRangePicker
        label="Reschedule block"
        value={range}
        onChange={setRange}
        dayDots={dots}
        dayDotLabel="has bookings"
        onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
        locale="en"
      />
    </div>
  );
}

function DateRangePickerNoDialog() {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange>(EMPTY);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} size="md" onClose={() => setOpen(false)}>
        <Dialog.Header title="Request time off" description="The calendar opens over the dialog. Esc closes the calendar first, and the dialog on the next press.">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <DateRangePicker label="Time off" value={range} onChange={setRange} locale="en" />
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

function DateRangePickerEstados() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
      <DateRangePicker label="Period" error="Pick a period." locale="en" />
      <DateRangePicker label="Period" disabled defaultValue={{ start: '2026-06-10', end: '2026-06-18' }} locale="en" />
    </div>
  );
}

export const dateRangePickerDemos: Record<string, React.FC> = {
  basic: DateRangePickerBasico,
  'across-months': DateRangePickerMeses,
  bounded: DateRangePickerLimites,
  markers: DateRangePickerMarcadores,
  'in-dialog': DateRangePickerNoDialog,
  states: DateRangePickerEstados,
};
