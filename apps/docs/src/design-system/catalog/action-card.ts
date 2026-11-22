import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const actionCardMeta: ComponentMeta = {
  slug: 'action-card',
  name: 'ActionCard',
  category: 'core',
  summary: 'A whole card you press: an icon, a title, a line of explanation and an arrow, in a real button. For the options of a decision and the entries of a settings flow.',
  props: [
    R('title', 'ReactNode', 'What the card does. Short: with the description it is the name a screen reader says.'),
    R('description', 'ReactNode', 'One line that says what happens.'),
    R('icon', 'ReactNode', 'An icon (a `lucide-react` element), drawn in a tile on the left. Hidden from a screen reader: the title says it.'),
    R('trailing', 'ReactNode', 'What sits on the right. An arrow by default; any node (a `Badge`, a value), or `null` for nothing.'),
    R('selected', 'boolean', 'Passing it (true or false) makes the card a toggle: it reports `aria-pressed` and, when true, wears the brand ring. Leave it out for a plain action. It is not a radio: for "choose exactly one" the semantics are a radio group\'s.'),
    R('variant', "'default' | 'primary' | 'error'", '`primary` is the option to steer toward (the tile takes the primary color); `error` is a destructive one (error tile, error title and ring).', "'default'"),
    R('disabled', 'boolean', 'Native `disabled`: not clickable, not focusable. The text and the tile go to the disabled colors.', 'false'),
    R('onClick / type / …', '-', 'Everything a `button` takes. `type` defaults to `button`, so it never submits a form by accident.'),
  ],
  code: `<ActionCard
  icon={<CalendarClock size={20} />}
  title="Reschedule"
  description="Pick another day and time"
  onClick={reschedule}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Stack them for the options of a decision. The whole card is the button: hover rings it in the brand color, the keyboard focus ring is the DS one, and Enter and Space press it.',
      code: `<ActionCard icon={<CalendarClock size={20} />} title="Reschedule" description="Pick another day and time" onClick={reschedule} />
<ActionCard icon={<Pencil size={20} />} title="Edit the booking" description="Change the service or the notes" onClick={edit} />
<ActionCard icon={<Share2 size={20} />} title="Share the link" description="Send it to the client" onClick={share} />`,
    },
    {
      id: 'selected',
      title: 'Selected',
      description:
        'With `selected`, the card is a toggle: `aria-pressed` tells a screen reader which is on, and the brand ring tells everyone else. This is a toggle, not a radio: the arrow keys do not move between the cards, and nothing stops two being on. For "exactly one of these", a radio group is the right semantics.',
      code: `<ActionCard selected={on === 'email'} onClick={() => setOn('email')} icon={<Mail size={20} />} title="E-mail" description="A message with the details" trailing={null} />
<ActionCard selected={on === 'sms'} onClick={() => setOn('sms')} icon={<Phone size={20} />} title="SMS" description="A short text message" trailing={null} />`,
    },
    {
      id: 'variants',
      title: 'Variants',
      description: '`primary` is the one to steer toward: its tile takes the primary color. `error` is for a destructive option: an error tile, an error title and an error ring.',
      code: `<ActionCard icon={<Plus size={20} />} title="New booking" description="Add a client to the agenda" />
<ActionCard variant="primary" icon={<Sparkles size={20} />} title="Open the agenda" description="See today at a glance" />
<ActionCard variant="error" icon={<Trash2 size={20} />} title="Cancel the booking" description="This cannot be undone" />`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: '`disabled` is the native attribute: the card cannot be clicked or focused, and its text and tile go to the disabled colors. Say why in the description.',
      code: `<ActionCard disabled icon={<Lock size={20} />} title="Export the report" description="Available on the yearly plan" />`,
    },
    {
      id: 'trailing',
      title: 'Trailing',
      description: 'The arrow is the default. Swap it for any node (a `Badge`, a value), or pass `null` when the card is a toggle and an arrow would say "go".',
      code: `<ActionCard icon={<Wallet size={20} />} title="Payments" description="Cards and Pix" trailing={<Badge tone="warning" size="sm">Set up</Badge>} />
<ActionCard icon={<Bell size={20} />} title="Reminders" description="Sent the day before" trailing={null} />`,
    },
  ],
  guidelines: {
    do: [
      'One card per option of a decision, with a title that says what it does.',
      'A description that says what happens next, in a line.',
      '`variant="error"` for a destructive option, and say what is lost.',
      '`selected` for a toggle; `trailing={null}` so the arrow does not say "go".',
    ],
    dont: [
      'A card with no `onClick`: it looks pressable and does nothing. A plain panel is a `Card`.',
      '`selected` to mean "the one chosen of several": that is a radio group, and these are not radios.',
      'A long paragraph in `description`: it is one line.',
      'A card inside a card: the inner one is a `Card` with `elevation="none"`.',
    ],
  },
};
