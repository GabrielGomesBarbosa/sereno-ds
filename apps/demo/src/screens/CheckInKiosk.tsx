'use client';

import * as React from 'react';
import { Megaphone } from 'lucide-react';
import { Brand, Button, Typography } from '@sereno-ds/ui';
import { vcol } from '@/domain/layout';
import { TODAY_APPOINTMENTS, type Appointment } from '@/lib/mock';

/**
 * The waiting-room call panel (SS-66's "modo Kiosk") — a screen mounted in
 * the physical waiting room, watched by everyone sitting there, not touched
 * by them. Check-in itself already happened elsewhere (on the client's own
 * phone, via a QR code or geolocation prompt sent for their appointment —
 * the two mechanisms SS-66 also names); this panel's only job is announcing
 * who's up, the same shape as a bank's "Senha A042" display.
 *
 * Went through two corrections live, both about the same thing — this
 * screen is watched by every stranger in the room, so it can carry *zero*
 * client-identifying information:
 * 1. First pass showed a tap-your-own-name list of everyone booked today —
 *    name, time **and appointment reason** ("Sessão de psicoterapia") next
 *    to it. That's someone else's sensitive health data (LGPD Art. 5º II)
 *    on a shared public screen with no access control.
 * 2. Second pass dropped the browsable list but still showed "Carlos D." —
 *    a first name + last initial is still enough to identify someone to
 *    anyone who already knows them, which in a waiting room is common.
 *
 * What's left is a ticket code with no name in it at all — `TICKET_OF`
 * below, assigned once per today's appointment. The client only recognizes
 * their own from the code they were given at check-in (not built here); the
 * panel itself carries nothing that ties a code back to a person.
 *
 * `Chamar próximo` stands in for a receptionist's own control (their side
 * isn't built here) so the panel's states are still reachable in this demo.
 */

type Status = Appointment['status'];

// One ticket code per today's appointment, assigned by time order — stable
// for the whole day, independent of which ones get filtered out below.
const TICKET_OF = new Map<Appointment, string>(TODAY_APPOINTMENTS.map((a, i) => [a, `A${String(i + 1).padStart(3, '0')}`]));

// Today's queue, in order, minus anyone who cancelled — a cancelled slot is
// never called. Whoever is already `completed` was served earlier today,
// before this panel was ever opened.
const QUEUE: Appointment[] = TODAY_APPOINTMENTS.filter((a): a is Appointment & { status: Exclude<Status, 'cancelled'> } => a.status !== 'cancelled');
const INITIAL_INDEX = Math.max(
  0,
  QUEUE.findIndex((a) => a.status !== 'completed'),
);

function useClock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock is client-only, there's no real "now" to render on the server
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(now) : '';
}

export function CheckInKiosk() {
  const [calledIndex, setCalledIndex] = React.useState(INITIAL_INDEX);
  const clock = useClock();

  const current = QUEUE[calledIndex];
  const upcoming = QUEUE.slice(calledIndex + 1, calledIndex + 3);
  const atEnd = calledIndex >= QUEUE.length;

  return (
    <div className="kiosk-shell">
      <header className="kiosk-topbar">
        <Brand variant="lockup" size={20} />
        <div style={vcol('2px')} className="kiosk-topbar-right">
          <Typography as="span" variant="eyebrow" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.08em' }}>
            Hoje · Segunda-feira, 24 de agosto
          </Typography>
          {clock && (
            <Typography
              as="span"
              variant="h2"
              color="secondary"
              numeric
              aria-label={`Agora, ${clock}`}
              style={{ letterSpacing: 'normal', lineHeight: 'normal' }}
            >
              {clock}
            </Typography>
          )}
        </div>
      </header>

      <main className="kiosk-stage">
        {atEnd ? (
          <div className="kiosk-panel kiosk-panel-center">
            <span className="kiosk-success-badge">
              <Megaphone size={40} strokeWidth={1.5} />
            </span>
            <Typography variant="h1" style={{ fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.015em' }}>
              Nenhuma chamada no momento
            </Typography>
            <Typography variant="body" color="secondary" style={{ fontSize: 'var(--text-lg)' }}>
              A fila de hoje foi toda atendida.
            </Typography>
          </div>
        ) : (
          <div className="kiosk-panel">
            <div style={vcol('var(--space-4)')}>
              <Typography as="span" variant="eyebrow" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.08em' }}>
                Agora chamando
              </Typography>
              <div className="kiosk-now">
                <Typography as="span" variant="display" numeric style={{ letterSpacing: '0.02em', lineHeight: 'normal' }}>
                  {TICKET_OF.get(current)}
                </Typography>
                <Typography as="span" variant="h1" color="brand" numeric style={{ letterSpacing: 'normal', lineHeight: 'normal' }}>
                  {current.time}
                </Typography>
              </div>
            </div>

            {upcoming.length > 0 && (
              <div style={vcol('var(--space-3)')}>
                <Typography as="span" variant="eyebrow" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.08em' }}>
                  Em breve
                </Typography>
                <div className="kiosk-next-list">
                  {upcoming.map((a) => (
                    <div key={a.time} className="kiosk-next-row">
                      <Typography as="span" variant="h2" color="secondary" numeric style={{ letterSpacing: '0.02em', lineHeight: 'normal' }}>
                        {TICKET_OF.get(a)}
                      </Typography>
                      <Typography as="span" variant="body" color="muted" numeric style={{ lineHeight: 'normal' }}>
                        {a.time}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Stands in for the receptionist's own "next" control — not part of
          the public panel itself. */}
      <div className="kiosk-staff-bar">
        <Typography as="span" variant="caption" style={{ lineHeight: 'normal' }}>
          Painel da recepção (demo)
        </Typography>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => setCalledIndex(INITIAL_INDEX)} disabled={calledIndex === INITIAL_INDEX}>
            Reiniciar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCalledIndex((i) => i + 1)} disabled={atEnd}>
            Chamar próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
