import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const radioMeta: ComponentMeta = {
  slug: 'radio',
  name: 'Radio',
  category: 'forms',
  summary: 'Single choice among mutually exclusive options. Group by the same `name`. The host needs the `.sereno-radio:checked` rule.',
  props: [
    R('label', 'string', 'Label next to the circle.'),
    R('description', 'string', 'Secondary line below the label. Replaced by `error` when present.'),
    R('error', 'string', 'Error message: tints the circle and the secondary line red. Replaces `description`. The message sits inside the label, so it is part of the radio\'s accessible name. ARIA has no invalid state for one radio: to flag the whole group, put `aria-invalid` on a `role="radiogroup"` wrapper.'),
    R('name', 'string', 'Same value on every option in the group.'),
    R('size', "'sm' | 'md'", 'Circle size: `sm` is 16px. Matches `Checkbox`.', "'md'"),
    R('checked / defaultChecked / disabled', 'boolean', 'Native input props passed through.'),
    R('preserveHelperSpace', 'boolean', "Reserve the description/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<>
  <Radio name="format" label="Online" description="By video." defaultChecked />
  <Radio name="format" label="In person" description="At the office." />
</>`,
  examples: [
    {
      id: 'vertical',
      title: 'Vertical',
      description: 'The default: options stacked, every one sharing the same `name`. A `description` explains each choice: good for payment method and appointment format. Wrap the group in `<fieldset>`/`<legend>`: without it a screen reader has no sense of what the choice is between.',
      code: `<fieldset>
  <legend>Appointment format</legend>
  <Radio name="format" label="Online" description="By video call." defaultChecked />
  <Radio name="format" label="In person" description="At the office, in Pinheiros." />
  <Radio name="format" label="Hybrid" description="First session in person, the rest online." />
</fieldset>`,
    },
    {
      id: 'horizontal',
      title: 'Horizontal',
      description: 'Lay the same options in a row for short, label-only choices (duration, party size). Wrap them in a flex row: `Radio` itself does not manage layout.',
      code: `<fieldset>
  <legend>Session duration</legend>
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    {['30', '45', '60'].map((m) => (
      <Radio key={m} name="dur" label={\`\${m} min\`} checked={v === m} onChange={() => setV(m)} />
    ))}
  </div>
</fieldset>`,
    },
    {
      id: 'states',
      title: 'Disabled',
      description: '`disabled` dims the row. Combine with `defaultChecked` for a locked-in selection the user cannot change.',
      code: `<fieldset>
  <legend>Plan</legend>
  <Radio name="plan" label="Free" defaultChecked />
  <Radio name="plan" label="Pro (coming soon)" disabled />
</fieldset>
<Radio name="plan2" label="Locked selection" disabled defaultChecked />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`size="sm"` (16px) for dense lists; `md` (20px) is the default. Same two sizes as `Checkbox`.',
      code: `<fieldset>
  <legend>Box size</legend>
  <Radio name="sz" size="sm" label="Small (16px)" defaultChecked />
  <Radio name="sz" label="Medium (20px, default)" />
</fieldset>`,
    },
    {
      id: 'error',
      title: 'Error',
      description:
        '`error` replaces `description` and tints the circle red. There\'s no separate "group error" slot: pass it to one option (the last one reads naturally) to show a single message for the whole required group.',
      code: `<fieldset>
  <legend>Payment method</legend>
  <Radio name="pay" label="Credit card" />
  <Radio name="pay" label="Pix" />
  <Radio name="pay" label="Bank transfer" error="Select a payment method." />
</fieldset>`,
    },
  ],
  guidelines: {
    do: [
      'Same `name` across the whole group.',
      'A `<fieldset>`/`<legend>` around every group: the accessible name for what the choice is between.',
      'A `description` per option when the difference is not obvious.',
      'Horizontal only for short, label-only options.',
      '`error` on one option (the last reads naturally) for a required group left unselected.',
    ],
    dont: [
      'A single lone `Radio`: if it is yes/no, use `Checkbox` or `Switch`.',
      'A group with more than ~6 options, becomes a `Select`.',
      'Horizontal rows when options carry a `description`; they get too tall.',
    ],
  },
};
