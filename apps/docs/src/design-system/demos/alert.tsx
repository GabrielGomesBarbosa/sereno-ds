'use client';

import { Alert, Button } from '@sereno-ds/ui';
import { Bell, CalendarCheck, CalendarOff } from 'lucide-react';
import * as React from 'react';
import { col } from './_shared';

function AlertTons() {
  return (
    <div style={{ ...col, maxWidth: 520 }}>
      <Alert tone="info" title="You've used 18 of 20 bookings this month" icon={<Bell size={18} strokeWidth={1.75} />}>
        On the free plan the limit resets on the 1st.
      </Alert>
      <Alert tone="success" title="Your schedule is live" icon={<CalendarCheck size={18} strokeWidth={1.75} />}>
        Clients can now book the times you set.
      </Alert>
      <Alert tone="warning" title="Your schedule isn't set up" icon={<CalendarOff size={18} strokeWidth={1.75} />}>
        Without a schedule, your public link shows no times.
      </Alert>
      <Alert tone="error" title="The last charge failed" icon={<CalendarOff size={18} strokeWidth={1.75} />}>
        Update your payment method to keep the subscription.
      </Alert>
    </div>
  );
}

function AlertComAcao() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Alert
        tone="warning"
        title="Your schedule isn't set up"
        icon={<CalendarOff size={18} strokeWidth={1.75} />}
        action={<Button size="sm">Set up now</Button>}
      >
        Without a schedule, your public link shows no times.
      </Alert>
    </div>
  );
}

function AlertDispensavel() {
  const [shown, setShown] = React.useState(true);
  return (
    <div style={{ maxWidth: 520 }}>
      {shown ? (
        <Alert tone="info" title="Novidade" onDismiss={() => setShown(false)}>
          You can now export your clients as CSV.
        </Alert>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setShown(true)}>
          Show again
        </Button>
      )}
    </div>
  );
}

export const alertDemos: Record<string, React.FC> = { tones: AlertTons, 'with-action': AlertComAcao, dismissible: AlertDispensavel };
