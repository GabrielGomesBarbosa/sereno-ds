import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const stepperMeta: ComponentMeta = {
  slug: 'stepper',
  name: 'Stepper',
  category: 'navigation',
  summary: 'Progress indicator for a linear multi-step flow, a **compound component** (onboarding, guided setup).',
  props: [
    R('current', 'number', '0-based index of the active step. Lives on the root: `Stepper.Step` reads it from context.', '0'),
    R('onStepClick', '(index: number) => void', 'When present, completed steps become clickable (back only).'),
    R('variant', "'bar' | 'dots'", 'bar = full-width segments (desktop). dots = compact pills (mobile).', "'bar'"),
    R('stepLabel', '(current, total) => ReactNode', 'Formats the counter (1-based). Default `Step N of M`: the DS ships no localised copy. Return `null` to drop the counter.'),
    R('Stepper.Step · label', 'string', 'Shown next to the counter while this step is active.'),
    R('Stepper.Step · value', 'string', 'Optional: not read by `Stepper` itself, only for your own `key` / bookkeeping.'),
  ],
  code: `<Stepper current={step} onStepClick={setStep}>
  <Stepper.Step value="perfil" label="Your profile" />
  <Stepper.Step value="servico" label="First service" />
  <Stepper.Step value="grade" label="Your schedule" />
</Stepper>`,
  examples: [
    {
      id: 'bar',
      title: 'Bar',
      description:
        'Full-width segments + a `Step N of M · <label>` line (a dot separates the counter from the step label). The default for desktop wizards. Drive it with `current`: **Back** / **Next** below walk a live 4-step flow.',
      code: `const [step, setStep] = React.useState(0);

<Stepper current={step}>
  <Stepper.Step value="profile" label="Your profile" />
  <Stepper.Step value="service" label="First service" />
  <Stepper.Step value="schedule" label="Your schedule" />
  <Stepper.Step value="review" label="Review & finish" />
</Stepper>
<Button onClick={() => setStep((s) => s - 1)}>Back</Button>
<Button onClick={() => setStep((s) => s + 1)}>Next</Button>`,
    },
    {
      id: 'dots',
      title: 'Dots',
      description: 'Compact pills: the current step stretches. For mobile. Same `current` contract; walk it with the buttons.',
      code: `<Stepper variant="dots" current={step}>
  <Stepper.Step value="profile" label="Your profile" />
  <Stepper.Step value="service" label="First service" />
</Stepper>`,
    },
    {
      id: 'clickable',
      title: 'Clickable back',
      description:
        'With `onStepClick`, completed steps and the current one become buttons, **back only**; the disabled forward segments still need the primary **Next**. Try clicking an earlier segment.',
      code: `<Stepper current={step} onStepClick={setStep}>
  <Stepper.Step value="profile" label="Your profile" />
  <Stepper.Step value="service" label="First service" />
</Stepper>`,
    },
    {
      id: 'step-label',
      title: 'Localised / custom counter',
      description:
        'The counter defaults to `Step N of M`, the DS embeds no localised text. Pass `stepLabel` for another language or a compact form; return `null` to show only the step label.',
      code: `<Stepper current={step} stepLabel={(c, t) => \`Passo \${c} de \${t}\`}>...</Stepper>   // pt-BR

<Stepper current={step} stepLabel={(c, t) => \`\${c} / \${t}\`}>...</Stepper>          // compact`,
    },
  ],
  guidelines: {
    do: [
      '`onStepClick` navigates back only.',
      '`bar` on desktop, `dots` on mobile.',
      'Pass `stepLabel` for the counter in your app’s language, the DS default is English.',
    ],
    dont: ['Letting the user skip ahead via the Stepper.'],
  },
};
