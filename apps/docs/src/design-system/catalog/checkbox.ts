import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const checkboxMeta: ComponentMeta = {
  slug: 'checkbox',
  name: 'Checkbox',
  category: 'forms',
  summary: 'Opt-in control for consents and multi-select filters. The host needs the `.sereno-check:checked` / `:indeterminate` rules.',
  props: [
    R('label', 'string', 'Label next to the box.'),
    R('description', 'string', 'Secondary line below the label. Replaced by `error` when present.'),
    R('error', 'string', 'Error message: tints the box and the secondary line red. Replaces `description`. The box is marked invalid (`aria-invalid`); the message is already part of its accessible name, since it sits inside the label.'),
    R('indeterminate', 'boolean', 'Mixed state (some children selected). Visual only: a form still submits it as unchecked.', 'false'),
    R('size', "'sm' | 'md'", 'Box size: `sm` is 16px for dense filter lists.', "'md'"),
    R('checked / defaultChecked / disabled', 'boolean', 'Native input props passed through.'),
    R('preserveHelperSpace', 'boolean', "Reserve the description/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<Checkbox
  label="Send me WhatsApp reminders"
  description="Sent 24h and 1h before the session."
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: '`label` next to the box; `description` is an optional second line. The `.sereno-check:checked` tick comes from the global CSS.',
      code: `<Checkbox label="I accept the terms" />
<Checkbox label="Subscribe to the newsletter" defaultChecked />
<Checkbox
  label="Send me WhatsApp reminders"
  description="Sent 24h and 1h before the session."
  defaultChecked
/>`,
    },
    {
      id: 'states',
      title: 'Disabled',
      description: '`disabled` dims the whole row (box + label). Combine with `defaultChecked` for a locked-on option.',
      code: `<Checkbox label="Unavailable on the free plan" disabled />
<Checkbox label="Included on every plan" disabled defaultChecked />`,
    },
    {
      id: 'indeterminate',
      title: 'Indeterminate',
      description:
        'A "select all" parent is `checked` when every child is, `indeterminate` when only some are. `indeterminate` is a DOM property, so the component sets it via a ref; you just pass the boolean.',
      code: `<Checkbox
  label="All channels"
  checked={on.every(Boolean)}
  indeterminate={on.some(Boolean) && !on.every(Boolean)}
  onChange={(e) => setOn(CHANNELS.map(() => e.currentTarget.checked))}
/>
{/* children, indented */}
<Checkbox label="WhatsApp" checked={on[0]} onChange={…} />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`size="sm"` (16px) for dense filter lists; `md` (20px) is the default. The glyph scales with the box. `Radio` has the same two sizes.',
      code: `<Checkbox size="sm" label="Small (16px)" defaultChecked />
<Checkbox label="Medium (20px, default)" defaultChecked />`,
    },
    {
      id: 'error',
      title: 'Error',
      description: '`error` replaces `description` and tints the box red, a required consent left unchecked on submit is the classic case.',
      code: `<Checkbox label="I accept the terms" error="You must accept the terms to continue." />`,
    },
    {
      id: 'group',
      title: 'Group',
      description: 'Multi-select: independent boxes sharing a `<fieldset>` / `<legend>`. This is the filter-list pattern: for a single yes/no, one `Checkbox` is enough.',
      code: `<fieldset>
  <legend>Filter by specialty</legend>
  {OPTS.map((o) => (
    <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
  ))}
</fieldset>`,
    },
    {
      id: 'horizontal',
      title: 'Horizontal',
      description: 'Same multi-select group, laid out in a row for short, label-only options. Wrap them in a flex row: `Checkbox` itself does not manage layout. Matches `Radio`\'s own `Horizontal` example.',
      code: `<fieldset>
  <legend>Preferred contact channels</legend>
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    {OPTS.map((o) => (
      <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
    ))}
  </div>
</fieldset>`,
    },
  ],
  guidelines: {
    do: [
      'Consents and multi-select filters.',
      'Affirmative label ("I accept…", "I want…").',
      '`indeterminate` for a "select all" parent: never a plain third state.',
      '`size="sm"` in dense filter panels; `md` in forms.',
      '`error` for a required consent left unchecked on submit, full sentence, same as `Input`.',
    ],
    dont: [
      'A mutually exclusive single choice: use `Radio`.',
      'An instant-apply setting: use `Switch`.',
      'A `color` prop: the box is one brand colour on purpose.',
    ],
  },
};
