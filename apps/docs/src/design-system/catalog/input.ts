import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const inputMeta: ComponentMeta = {
  slug: 'input',
  name: 'Input',
  category: 'forms',
  summary: 'Single-line text field with label, hint and error state.',
  props: [
    R('label', 'string', 'Label above the field.'),
    R('hint', 'string', 'Helper text. Replaced by `error` when present. A screen reader reads it with the field (it is the field\'s description).'),
    R('error', 'string', 'Error message; also turns the border red. Screen readers get it too: the field is marked invalid (`aria-invalid`) and described by the message (`aria-describedby`), with no wiring of your own.'),
    R('aria-describedby', 'string', 'Ids of extra elements to read with the field. Kept next to the hint / error, never replacing it.'),
    R('required', 'boolean', 'Adds the asterisk to the label, and tells screen readers the field is required (`aria-required`, with the asterisk hidden from them). It does not switch on the browser\'s own validation: the native `required` attribute is not set.', 'false'),
    R('size', "'sm' | 'md' | 'lg'", 'Control height.', "'md'"),
    R('iconLeft', 'React.ReactNode', 'Icon on the left inside the field.'),
    R('prefix', 'React.ReactNode', 'Leading text adornment ("R$", "@", "+55"). Not part of the value.'),
    R('suffix', 'React.ReactNode', 'Trailing text or control (e.g. "min"). Not part of the value.'),
    R('mask', "'phone' | 'cpf' | 'cep' | 'currency' | string", "Format as you type: a preset or a custom `#`-per-digit pattern (`(##) #####-####`). Sets `inputMode` + `maxLength`."),
    R('type', "'text' | 'password' | 'email' | …", 'Native input type. `password` adds a show/hide eye toggle at the end of the field.', "'text'"),
    R('showCount', 'boolean', 'Show a `n / max` character counter on the hint row. Implied when `maxLength` is set. It counts the field\'s real value, also when a form library or code writes it (`reset()`, `setValue()`, `el.value = …`).', 'false'),
    R(
      'preserveHelperSpace',
      'boolean',
      'Reserve the hint/error row\'s height even with neither set, several fields validating at once (e.g. a login form submitted empty) then invalidate in place instead of the whole form growing under the user.',
      'false',
    ),
  ],
  code: `<Input
  label="WhatsApp"
  required
  size="lg"
  iconLeft={<Phone size={16} />}
  hint="We'll send the confirmation here."
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Always with a `label`. `required` adds the asterisk. `hint` is the helper text below the field.',
      code: `<Input label="Full name" placeholder="Marina Alves" />
<Input label="WhatsApp" required hint="We'll send the confirmation here." />`,
    },
    {
      id: 'icon-suffix',
      title: 'Icon, prefix and suffix',
      description: '`iconLeft` for a glyph inside the field; `prefix` / `suffix` for a unit or a symbol. None of them are part of the value.',
      code: `<Input label="WhatsApp" iconLeft={<Phone size={16} />} placeholder="(11) 90000-0000" />
<Input label="Duration" suffix="min" defaultValue="50" />
<Input label="Price" prefix="R$" placeholder="0,00" />`,
    },
    {
      id: 'masked',
      title: 'Masked',
      description:
        '`mask` formats the value as you type. Presets: `phone` (switches 8/9-digit), `cpf`, `cep`, `currency` (digits read as cents → `1.234,56`; pair it with `prefix="R$"`). Pass a custom `#`-per-digit pattern for anything else. `onChange` receives the formatted value in `e.currentTarget.value`.',
      code: `<Input label="WhatsApp" mask="phone" placeholder="(11) 90000-0000" />
<Input label="CPF" mask="cpf" placeholder="000.000.000-00" />
<Input label="CEP" mask="cep" placeholder="00000-000" />
<Input label="Price" mask="currency" prefix="R$" placeholder="0,00" />`,
    },
    {
      id: 'password',
      title: 'Password',
      description: '`type="password"` adds a show/hide eye toggle at the end of the field. It swaps the input `type` and keeps focus; `aria-label` flips between "Mostrar senha" / "Ocultar senha".',
      code: `<Input label="Password" type="password" iconLeft={<Lock size={16} />} />
<Input label="New password" type="password" hint="At least 8 characters." />`,
    },
    {
      id: 'count',
      title: 'Character counter',
      description: 'Set `maxLength` (or pass `showCount`) to get a `n / max` counter on the hint row. It turns red once the limit is reached.',
      code: `<Input label="Headline" maxLength={60} />`,
    },
    {
      id: 'count-from-code',
      title: 'Counter on a field filled from code',
      description:
        'The counter reads the field itself, so a value that arrives without typing counts at once: a saved value put in by react-hook-form\'s `reset()` after a fetch, a `setValue()`, its `defaultValues`, a native `form.reset()`. The preview writes `el.value` through a ref, which is what `reset()` does under the hood.',
      code: `const { register, reset } = useForm();

<Input label="Headline" maxLength={60} {...register('headline')} />

// once the saved value is fetched
reset({ headline: saved }); // the counter shows the saved length right away`,
    },
    {
      id: 'states',
      title: 'Error and disabled',
      description: '`error` replaces `hint` and turns the border red. `disabled` uses its own fill.',
      code: `<Input label="Email" error="Enter a valid email." defaultValue="marina@" />
<Input label="Registration" defaultValue="CRP 06/123456" disabled />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`lg` is the default on mobile and in the public booking flow.',
      code: `<Input label="Field" size="sm" />
<Input label="Field" size="md" />
<Input label="Field" size="lg" />`,
    },
    {
      id: 'no-layout-shift',
      title: 'No layout shift on validation',
      description:
        'Submit a form with several fields at once and every one of them can invalidate in the same instant, a login form with nothing filled in is the classic case. Without `preserveHelperSpace`, each field only grows once its own error text mounts, so the whole form jumps in height right under the user\'s cursor. With it, the hint/error row\'s height is reserved from the start; the error just fills a slot that was already there.',
      code: `<Input label="Email" required error="This field is required." preserveHelperSpace />
<Input label="Password" type="password" required error="This field is required." preserveHelperSpace />`,
    },
  ],
  guidelines: {
    do: [
      'Always a `label`: never `placeholder` alone.',
      '`size="lg"` on mobile and in the public flow.',
      'Full error sentence with a period: "Enter a valid email."',
      'Pass the message through `error` (not a separate element under the field): that is what marks the field invalid and ties the message to it for screen readers.',
      'On submit, focus the first invalid field (react-hook-form\'s `shouldFocusError` does): the screen reader reads its error. If you validate when the user leaves a field, announce those errors yourself, with one polite status region (`aria-live="polite"`) for the whole form: the field does not announce an error as it appears.',
      '`preserveHelperSpace` on every field of a form that validates several at once (e.g. on submit): keeps the layout still while errors appear.',
    ],
    dont: ['Placeholder instead of the label.', 'An error with no text (just the red border).', 'A hand-made red line under the field instead of `error`: it looks the same, but a screen reader never links it to the field.'],
  },
};
