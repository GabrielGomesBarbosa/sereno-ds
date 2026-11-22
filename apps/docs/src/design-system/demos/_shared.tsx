'use client';

// Pieces used by the demos of more than one component (SS-574).

import * as React from 'react';
import { type CalendarDayDot, CalendarLegend, DateTimePicker, Skeleton } from '@sereno-ds/ui';

export const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

export const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };

// A <fieldset>/<legend> gives a Checkbox/Radio group its accessible name - without
// it a screen reader announces just "Online, radio button, 1 of 3" with no sense
// of what the choice is between. `border: none` etc. strip the default fieldset
// chrome; the legend keeps the same look as every other section kicker.
export const legendStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 4,
};

export const dotRow: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' };

export type Plan = { id: string; name: string; sessions: number; price: string; status: 'success' | 'warning' | 'error' };

export const STATUS_LABEL: Record<Plan['status'], string> = { success: 'Active', warning: 'New', error: 'At risk' };

export const fieldCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 };

// The current month, known only on the client: a calendar that starts on "today" would otherwise
// render the build's month on the server and the visitor's on hydration. `null` on the server.
export const noSubscribe = () => () => {};

export let clientNow: Date | null = null;

export const getClientNow = () => (clientNow ??= new Date());

export function useClientNow(): Date | null {
  return React.useSyncExternalStore(noSubscribe, getClientNow, () => null);
}

// Deterministic sample "days with bookings" for a month: most are plain dots, every third one is
// still pending (a warning dot with a label of its own).
export const bookedDaysOf = (y: number, m: number): Record<number, CalendarDayDot> => {
  const out: Record<number, CalendarDayDot> = {};
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    if ((d * 5 + m) % 7 < 2) out[d] = d % 3 === 0 ? { tone: 'warning', label: 'pending' } : {};
  }
  return out;
};

export const firstDayOf = (dots: Record<number, CalendarDayDot>) => Number(Object.keys(dots)[0]);

export const LEGEND_ITEMS = [
  { label: 'Has bookings', dot: true },
  { label: 'Pending', dot: 'warning' as const },
  { label: 'Today', outline: true },
];

export function DateTimeDotsCalendar({ now }: { now: Date }) {
  const [dots, setDots] = React.useState(() => bookedDaysOf(now.getFullYear(), now.getMonth()));
  const [day, setDay] = React.useState<number | undefined>(() => firstDayOf(bookedDaysOf(now.getFullYear(), now.getMonth())));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={now.getFullYear()}
        month={now.getMonth()}
        dayDots={dots}
        dayDotLabel="has bookings"
        onMonthChange={(y, m) => setDots(bookedDaysOf(y, m))}
        selectedDate={day}
        onSelectDate={setDay}
        locale="en"
      />
      <CalendarLegend items={LEGEND_ITEMS} />
    </div>
  );
}

export function DateTimeDots() {
  const now = useClientNow();
  return now ? <DateTimeDotsCalendar now={now} /> : <Skeleton variant="block" height={380} style={{ maxWidth: 380 }} />;
}

// A phone-screen frame - the bars sit flush to its edges, so their border reads
// as an in-screen divider, not a broken frame edge.
// A phone-screen frame. box-shadow for the outline (a real border + radius +
// overflow:hidden seams at the corners); no overflow clip - instead the first
// and last child are rounded to match, so an edge-to-edge bar's divider still
// meets the outline cleanly.
export const R = 'var(--radius-card)';

export function PhoneFrame({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ style?: React.CSSProperties }>[];
  return (
    <div style={{ maxWidth: 420, borderRadius: R, boxShadow: '0 0 0 1px var(--border-default)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', ...style }}>
      {kids.map((child, i) =>
        React.cloneElement(child, {
          style: {
            ...(child.props.style || {}),
            ...(i === 0 && { borderTopLeftRadius: R, borderTopRightRadius: R }),
            ...(i === kids.length - 1 && { borderBottomLeftRadius: R, borderBottomRightRadius: R }),
          },
        }),
      )}
    </div>
  );
}

export const screenBody: React.CSSProperties = {
  padding: 'var(--space-5)',
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  background: 'var(--bg-surface)',
};

export function BodyLines() {
  return (
    <>
      <span style={{ width: '70%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
      <span style={{ width: '90%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
      <span style={{ width: '55%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
    </>
  );
}
