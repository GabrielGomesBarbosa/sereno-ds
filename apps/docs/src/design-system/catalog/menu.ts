import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const menuMeta: ComponentMeta = {
  slug: 'menu',
  name: 'Menu',
  category: 'core',
  summary:
    'Action menu / dropdown: a `trigger` you supply plus a portalled panel. Same mechanics as `Select`: `position: fixed` panel measured off the trigger, flips up when there is no room, closes on outside pointerdown / `Escape` / selection and returns focus to the trigger.',
  props: [
    R('trigger', 'React.ReactElement', 'The element that opens the menu: an `IconButton`, `Button`, an avatar button. `Menu` clones it to wire `onClick` + `aria-*`.'),
    R('adornment', 'React.ReactNode', 'Overlaid on the trigger (a notification count, a status dot) in a `pointer-events: none` layer.'),
    R('items', 'MenuEntry[]', 'Rows: `{ label, icon?, onClick, disabled?, tone?, keepOpen? }`, `{ separator: true }`, or `{ heading }`. Omit when using the render function.'),
    R('children', '(close) => ReactNode', 'Rich panel content instead of `items`: receives `close`. The panel is a `role="dialog"` then.'),
    R('header', 'React.ReactNode', 'A block above the items: a name + email, a title. Not part of the keyboard roving.'),
    R('label', 'string', 'Accessible name for the panel; also a heading row when `items` is used.'),
    R('align', "'start' | 'end'", 'Which trigger edge the panel lines up with.', "'end'"),
    R('width', 'number | string', 'Panel width. Default: fits the content (min 180px), capped to the viewport.'),
    R('open / onOpenChange', 'boolean / (open) => void', 'Controlled open state. Omit for uncontrolled.'),
    R('disabled', 'boolean', 'The trigger no longer opens the menu.', 'false'),
  ],
  code: `<Menu
  trigger={<IconButton label="Conta"><User /></IconButton>}
  items={[
    { label: 'Settings', icon: <Settings />, onClick: openSettings },
    { separator: true },
    { label: 'Sign out', icon: <LogOut />, tone: 'danger', onClick: signOut },
  ]}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Item menu',
      description: 'The common case: `items` with `icon`, `onClick`, an optional `heading` and `separator`. Arrow keys rove, `Enter` / `Space` activate, `Escape` closes and refocuses the trigger. Opened with a click, no row is highlighted until the pointer enters one; opened from the keyboard (`Enter`, `Space` or `ArrowDown` on the trigger, `ArrowUp` for the last row) the first row is active and ringed, so `Enter` acts straight away.',
      code: `<Menu
  trigger={<Button variant="secondary" iconRight={<ChevronDown size={16} />}>Actions</Button>}
  label="Appointment"
  items={[
    { label: 'Reschedule', icon: <CalendarClock size={16} />, onClick: … },
    { label: 'Duplicate', icon: <Copy size={16} />, onClick: … },
    { separator: true },
    { label: 'Cancel', icon: <X size={16} />, tone: 'danger', onClick: … },
  ]}
/>`,
    },
    {
      id: 'danger-disabled',
      title: 'Danger and disabled',
      description: '`tone: "danger"` paints the row in the error colour for a destructive action. A `disabled` row is skipped by the arrow-key roving.',
      code: `items={[
  { label: 'Edit', onClick: … },
  { label: 'Archive', disabled: true },
  { label: 'Delete', tone: 'danger', onClick: … },
]}`,
    },
    {
      id: 'rich',
      title: 'Rich panel',
      description: 'Pass a function instead of `items` for a custom panel (a notifications list, a form). It gets `close`; the panel becomes a `role="dialog"`.',
      code: `<Menu trigger={<IconButton label="Notificações"><Bell /></IconButton>} label="Notificações">
  {(close) => <NotificationList onSeeAll={close} />}
</Menu>`,
    },
  ],
  guidelines: {
    do: [
      'Use it for **actions**: verbs the user picks and the menu closes. For picking a value, that is `Select`.',
      'Give the trigger a clear affordance (a chevron, "•••", an icon) so it reads as openable.',
      'One `tone: "danger"` row at most, at the bottom, behind a separator.',
    ],
    dont: [
      'Nest submenus: flatten, or open a `Dialog`.',
      'Put more than ~7 items in it; past that it is a list or a `Dialog`.',
      'Use it as a `Select`: no checkmarks, no single-choice semantics.',
    ],
  },
};
