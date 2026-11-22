'use client';

import * as React from 'react';
import { DateTimePicker } from '@sereno-ds/ui';
import { DateTimeDots } from './_shared';

// Weekend day-numbers for a month - the examples strike those through so the
// pattern stays meaningful as you navigate (recomputed via `onMonthChange`).
const weekendsOf = (y: number, m: number) =>
  Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1).filter((d) => {
    const wd = new Date(y, m, d).getDay();
    return wd === 0 || wd === 6;
  });

function DateTimeCalendario() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [off, setOff] = React.useState(() => weekendsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        unavailable={off}
        onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
        selectedDate={day}
        onSelectDate={setDay}
        locale="en"
      />
    </div>
  );
}

function DateTimeLimitado() {
  const [day, setDay] = React.useState<number | undefined>(14);
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker year={2026} month={7} min="2026-08-10" max="2026-11-20" selectedDate={day} onSelectDate={setDay} locale="en" />
    </div>
  );
}

// A full working day at 30-min steps, lunch (12:00–13:00) taken.
const DAY_SLOTS = Array.from({ length: 22 }, (_, i) => {
  const mins = 8 * 60 + i * 30;
  const value = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${mins % 60 === 0 ? '00' : '30'}`;
  return ['12:00', '12:30', '13:00', '16:30'].includes(value) ? { value, disabled: true } : value;
});

function DateTimeComHorarios() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [time, setTime] = React.useState<string | undefined>('10:00');
  const [off, setOff] = React.useState(() => weekendsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        unavailable={off}
        onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
        times={DAY_SLOTS}
        selectedDate={day}
        selectedTime={time}
        onSelectDate={setDay}
        onSelectTime={setTime}
        locale="en"
      />
    </div>
  );
}

// Group-session slots: some room left, some full (but still pickable - a
// deliberate overbook), one full AND hard-blocked (SS-64).
const GROUP_SLOTS = [
  { value: '09:00', capacity: 8, booked: 3 },
  { value: '10:00', capacity: 8, booked: 8 },
  { value: '11:00', capacity: 4, booked: 4, disabled: true },
  '14:00',
  { value: '15:00', capacity: 6, booked: 5 },
];

function DateTimeCapacidade() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [time, setTime] = React.useState<string | undefined>(undefined);
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        times={GROUP_SLOTS}
        selectedDate={day}
        selectedTime={time}
        onSelectDate={setDay}
        onSelectTime={setTime}
        locale="en"
      />
    </div>
  );
}

// Deterministic sample booking counts for a month - weekdays only, and only
// from a fixed "today" forward, so `renderDay` scoping is visible.
const DEMO_TODAY = { y: 2026, m: 7, d: 14 };

const bookingCountsOf = (y: number, m: number): Record<number, number> => {
  const out: Record<number, number> = {};
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const future = y > DEMO_TODAY.y || (y === DEMO_TODAY.y && (m > DEMO_TODAY.m || (m === DEMO_TODAY.m && d >= DEMO_TODAY.d)));
    const wd = new Date(y, m, d).getDay();
    if (future && wd !== 0 && wd !== 6) out[d] = ((d * 7 + m * 3) % 5) + 1;
  }
  return out;
};

function DateTimeRenderDay() {
  const [day, setDay] = React.useState<number | undefined>(18);
  const [counts, setCounts] = React.useState(() => bookingCountsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        onMonthChange={(y, m) => setCounts(bookingCountsOf(y, m))}
        renderDay={(d) =>
          counts[d] ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 15,
                height: 13,
                padding: '0 4px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
                // soft accent chip - legible on white and on the selected day
                background: 'var(--bg-accent-soft)',
                color: 'var(--text-accent)',
              }}
            >
              {counts[d]}
            </span>
          ) : null
        }
        selectedDate={day}
        onSelectDate={setDay}
        locale="en"
      />
    </div>
  );
}

export const dateTimePickerDemos: Record<string, React.FC> = {
    calendar: DateTimeCalendario,
    'render-day': DateTimeRenderDay,
    'day-dots': DateTimeDots,
    'with-times': DateTimeComHorarios,
    capacity: DateTimeCapacidade,
    bounded: DateTimeLimitado,
  };
