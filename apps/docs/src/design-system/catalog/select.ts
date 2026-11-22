import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const selectMeta: ComponentMeta = {
  slug: 'select',
  name: 'Select',
  category: 'forms',
  summary:
    'Single choice from ≤12 flat options. A hand-rolled listbox: the same in every browser, full keyboard support. On a mouse it drops down anchored to the field; on touch it opens as a bottom sheet with finger-sized rows.',
  props: [
    R('options', 'SelectOption[]', 'List of `{ value, label, disabled? }`. A list the server pages can grow while the panel is open: the panel keeps its scroll when it does. Keep the selected option in the list: the trigger takes its label from it, and with no match it shows the placeholder.', '[]'),
    R('value / defaultValue', 'string', 'Controlled / uncontrolled selection.'),
    R('onValueChange', '(value: string) => void', 'Fires with the chosen value: a string, not a DOM event.'),
    R('placeholder', 'string', 'Shown when nothing is selected.'),
    R('label / hint / error / required', '-', 'Same label contract as Input, including the `aria-invalid` / `aria-describedby` / `aria-required` wiring on the trigger.'),
    R('size', "'sm' | 'md' | 'lg'", 'Control height.', "'md'"),
    R('disabled', 'boolean', 'Disabled fill and text, not-allowed cursor.', 'false'),
    R('name', 'string', 'Mirrored to a hidden input so the value can be submitted in a form.'),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<Select
  label="Duration"
  defaultValue="50 min"
  onValueChange={(v) => setDuration(v)}
  options={[
    { value: '30 min', label: '30 min' },
    { value: '50 min', label: '50 min' },
  ]}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        '`options` is a list of `{ value, label }`. `onValueChange` gives you the value directly (a string). Open with click or `Enter` / `↓`; then `↑ ↓`, `Home` / `End`, type-ahead, `Enter` to pick, `Esc` to dismiss.',
      code: `<Select
  label="Duration"
  defaultValue="50 min"
  onValueChange={(v) => setDuration(v)}
  options={[
    { value: '30 min', label: '30 min' },
    { value: '50 min', label: '50 min' },
    { value: '1h', label: '1 hour' },
  ]}
/>`,
    },
    {
      id: 'placeholder',
      title: 'Placeholder & hint',
      description: 'With no `value` / `defaultValue` the `placeholder` shows in muted text until a choice is made. `hint` / `error` use the same contract as `Input`.',
      code: `<Select
  label="Time zone"
  placeholder="Choose a time zone"
  hint="Used for the times on the public link."
  options={[
    { value: 'sp', label: 'Brasília (GMT-3)' },
    { value: 'mao', label: 'Manaus (GMT-4)' },
  ]}
/>`,
    },
    {
      id: 'error',
      title: 'Error',
      description: '`error` replaces `hint`, turns the trigger border red, and pairs with `required`. Same contract as `Input`.',
      code: `<Select
  label="Duration"
  required
  placeholder="Pick a duration"
  error="Choose how long the session lasts."
  options={opts}
/>`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'The whole control with `disabled`, or a single row with `{ ..., disabled: true }`: kept in place, skipped by keyboard and pointer.',
      code: `<Select label="Duration" defaultValue="30 min" disabled options={opts} />
<Select
  label="Plan"
  defaultValue="free"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro (coming soon)', disabled: true },
  ]}
/>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm` fits dense rows: inline filters, a time-range picker.',
      code: `<Select label="Field" size="sm" options={opts} />
<Select label="Field" size="md" options={opts} />
<Select label="Field" size="lg" options={opts} />`,
    },
    {
      id: 'long',
      title: 'Long list',
      description:
        'The panel caps its height and scrolls the rest, a dropdown to the room around the field, the touch sheet to 60% of the screen. With a value selected (Lisbon here) the panel opens already scrolled to it, the first time and every time. It still *works*, but past ~12 options a search field beats scrolling; treat this as the ceiling, not the target.',
      code: `<Select label="Home city" placeholder="Search the list" options={cities} />`,
    },
    {
      id: 'in-dialog',
      title: 'Inside a Dialog',
      description:
        'The list is drawn over the dialog, not clipped by it. `Esc` closes the list first, and the dialog on the next press.',
      code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <Dialog.Body>
    <Select label="Service" placeholder="Pick one" options={services} />
  </Dialog.Body>
</Dialog>`,
    },
  ],
  guidelines: {
    do: [
      'Use for up to ~12 flat options (duration, time zone, professional).',
      'Keep labels short: the chevron takes space on the right.',
      'Give a `placeholder` when there is no sensible default.',
      'When a server pages the list, keep the selected option in `options` even if its page is not the one on screen: the trigger takes its label from there.',
    ],
    dont: [
      'Many options or grouped options as the norm, past ~12, that is a combobox/search, a different pattern.',
      'Expecting a DOM event in `onValueChange`; it hands you the value string.',
    ],
  },
};
