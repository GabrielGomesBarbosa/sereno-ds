import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const alertMeta: ComponentMeta = {
  slug: 'alert',
  name: 'Alert',
  category: 'feedback',
  summary: 'Persistent in-page notice: stays until the user dismisses it or the condition is resolved. Unlike Toast, which is transient.',
  props: [
    R('tone', "'info' | 'success' | 'warning' | 'error'", 'Semantic tone (same words as Badge / Toast).', "'info'"),
    R('title', 'string', 'Notice title.'),
    R('children', 'React.ReactNode', 'Body copy.'),
    R('icon', 'React.ReactNode', 'A Lucide glyph matching the tone.'),
    R('action', 'React.ReactNode', 'Inline action(s) under the body. Use Button size="sm".'),
    R('onDismiss', '() => void', 'Renders the × dismiss control. Omit for conditions the user cannot dismiss.'),
  ],
  code: `<Alert
  tone="warning"
  title="Your schedule isn't set up"
  icon={<CalendarOff size={18} />}
  action={<Button size="sm">Set up now</Button>}
>
  Without a schedule, your public link shows no times.
</Alert>`,
  examples: [
    {
      id: 'tones',
      title: 'Tones',
      description: '`info` = neutral heads-up. `success` = something went right. `warning` = something needs doing. `error` = something is broken or blocked.',
      code: `<Alert tone="info" title="You've used 18 of 20 bookings this month">
  On the free plan the limit resets on the 1st.
</Alert>
<Alert tone="success" title="Your schedule is live">
  Clients can now book the times you set.
</Alert>
<Alert tone="warning" title="Your schedule isn't set up">
  Without a schedule, your public link shows no times.
</Alert>
<Alert tone="error" title="The last charge failed">
  Update your payment method to keep the subscription.
</Alert>`,
    },
    {
      id: 'with-action',
      title: 'Icon and action',
      description: '`icon` is a Lucide glyph matching the tone; `action` sits under the body (use `Button size="sm"`).',
      code: `<Alert
  tone="warning"
  title="Your schedule isn't set up"
  icon={<CalendarOff size={18} />}
  action={<Button size="sm">Set up now</Button>}
>
  Without a schedule, your public link shows no times.
</Alert>`,
    },
    {
      id: 'dismissible',
      title: 'Dismissible',
      description: '`onDismiss` renders the × . Omit it for conditions the user cannot simply close.',
      code: `<Alert tone="info" title="Novidade" onDismiss={() => setShown(false)}>
  You can now export your clients as CSV.
</Alert>`,
    },
  ],
  guidelines: {
    do: [
      'Use `Alert` for conditions that **persist**: schedule not set, plan limit, failed charge.',
      'If the user can leave and come back and the message should still be there, it is an `Alert`.',
    ],
    dont: [
      'Confirming an action that just happened; that is a `Toast`.',
      'A floating `Alert` or one with a shadow; it lives in the page flow.',
    ],
  },
};
