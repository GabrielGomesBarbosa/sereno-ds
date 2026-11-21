'use client';

import * as React from 'react';
import { DatePicker } from '@sereno-ds/ui';
import { bookedDaysOf } from './_shared';

function DatePickerBasico() {
  const [date, setDate] = React.useState('');
  return (
    <div style={{ maxWidth: 260 }}>
      <DatePicker label="Date of birth" value={date} onChange={setDate} locale="en" />
    </div>
  );
}

// Local YYYY-MM-DD - not toISOString(), which is UTC and can land on the
// *next* day for anyone west of it (e.g. 22:00 in São Paulo is already
// tomorrow in UTC), marking "today" itself as unavailable below.
const localISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function DatePickerFaixa() {
  const today = new Date();
  const min = localISO(today);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  const max = localISO(maxDate);
  const [date, setDate] = React.useState('');
  return (
    <div style={{ maxWidth: 260 }}>
      <DatePicker label="Schedule for" hint="Only the next 30 days." min={min} max={max} value={date} onChange={setDate} locale="en" />
    </div>
  );
}

function DatePickerMarcadores() {
  const [date, setDate] = React.useState('2026-08-14');
  const [dots, setDots] = React.useState(() => bookedDaysOf(2026, 7));
  return (
    <div style={{ maxWidth: 260 }}>
      <DatePicker
        label="Reschedule to"
        value={date}
        onChange={setDate}
        dayDots={dots}
        dayDotLabel="has bookings"
        onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
        locale="en"
      />
    </div>
  );
}

export const datePickerDemos: Record<string, React.FC> = { basic: DatePickerBasico, range: DatePickerFaixa, markers: DatePickerMarcadores };
