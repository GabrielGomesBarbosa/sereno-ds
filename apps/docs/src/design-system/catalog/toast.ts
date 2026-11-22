import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const toastMeta: ComponentMeta = {
  slug: 'toast',
  name: 'Toast',
  category: 'feedback',
  summary:
    'Transient confirmation of a completed action. `<Toast>` is the card; `<ToastProvider>` + `useToast()` are the system that portals, stacks and auto-dismisses it.',
  props: [
    R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'Semantic tone (same words as Badge / Alert). `neutral` is the plain dark toast.', "'neutral'"),
    R('title', 'string', 'Title (required).'),
    R('description', 'string', 'Optional detail.'),
    R('icon / action', 'React.ReactNode', 'Glyph and inline action ("Undo" / "View").'),
    R('onClose', '() => void', 'Renders the × close control. The provider wires this for you.'),
    R('<ToastProvider> position', "'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'top-center'", 'Viewport corner.', "'bottom-right'"),
    R('<ToastProvider> max', 'number', 'Most toasts on screen at once: the oldest drops.', '3'),
    R('<ToastProvider> duration', 'number', 'Default auto-dismiss in ms. Per-call `duration: 0` makes one stick.', '4000'),
    R('useToast() → toast', "(msg, opts?) => string & { success, error, warning, info, neutral }", 'Fire a toast; returns its id. `toast.success("Saved")`, `toast("Link copied")`.'),
    R('useToast() → dismiss', '(id?: string) => void', '`dismiss(id)` removes one; `dismiss()` clears them all.'),
  ],
  code: `const { toast } = useToast();
toast.success('Booking confirmed', {
  description: 'The client was notified via WhatsApp.',
});`,
  examples: [
    {
      id: 'system',
      title: 'The toast system',
      description:
        'Wrap the app once in `<ToastProvider>`, then call `useToast()` anywhere under it. Toasts stack newest-nearest-the-edge, show a countdown bar, auto-dismiss after `duration` (the bar and timer both pause while hovered or focused), and cap at `max`. `duration: 0` keeps one until `dismiss()`. Six `position`s: every corner and both centres.',
      code: `// app root
<ToastProvider position="bottom-right">
  <App />
</ToastProvider>

// anywhere below it
const { toast, dismiss } = useToast();
toast.success('Booking confirmed', { description: 'The client was notified.' });
toast.error('Payment failed');
toast('Link copied');                                  // neutral, title only
const id = toast.info('Sync in progress', { duration: 0 });  // sticks
dismiss(id);`,
    },
    {
      id: 'tones',
      title: 'The card',
      description: 'The presentational `<Toast>` on its own: one line of `title` (required) + optional `description`. It enters with a slide-up; without the provider the host owns the lifetime and position.',
      code: `<Toast tone="success" title="Booking cancelled"
  description="The client was notified via WhatsApp." icon={<Check size={18} />} />
<Toast tone="neutral" title="Link copied" />`,
    },
    {
      id: 'with-action',
      title: 'With action and close',
      description: '`onClose` renders the × . `action` sits on the right: use it for "Undo".',
      code: `<Toast
  tone="success"
  title="Service removed"
  action={<Button variant="link" size="sm">Undo</Button>}
  onClose={() => setToast(null)}
/>`,
    },
  ],
  guidelines: {
    do: [
      'Confirms what **just happened** and leaves the screen.',
      'A one-line `title`; `description` only if it adds something.',
      'One `<ToastProvider>` at the app root: call `useToast()` everywhere else.',
    ],
    dont: [
      'A condition that persists (schedule, limit, charge), use `Alert`.',
      'Queueing a dozen at once: the provider caps at `max` (3), but that is a smell.',
    ],
  },
};
