// Server-safe catalogue of the 25 Design System primitives. Powers the sidebar,
// the /design-system index and `generateStaticParams` for the per-component routes.
// Prop rows are transcribed from each component's .d.ts contract.

export type CategoryId = 'core' | 'forms' | 'domain' | 'navigation' | 'feedback';

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** One named example on a component page: a live demo (keyed by `id` in demos.tsx) + its snippet. */
export interface Example {
  id: string;
  title: string;
  description?: string;
  code: string;
}

export interface Guidelines {
  do: string[];
  dont: string[];
}

export interface ComponentMeta {
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  props: PropRow[];
  /** Single usage snippet — fallback for components not yet broken into `examples`. */
  code: string;
  /** MUI-style example sections. When present, the page renders these instead of `code`. */
  examples?: Example[];
  guidelines?: Guidelines;
}

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'core', label: 'Core', blurb: 'Actions, status pills and identity.' },
  { id: 'forms', label: 'Forms', blurb: 'Fields, selects, toggles and the calendar.' },
  { id: 'domain', label: 'Domain', blurb: 'Cards for the scheduling domain.' },
  { id: 'navigation', label: 'Navigation', blurb: 'Headers, tabs and progress.' },
  { id: 'feedback', label: 'Feedback', blurb: 'Notices, confirmations and loading.' },
];

const R = (name: string, type: string, description: string, def?: string): PropRow => ({ name, type, description, default: def });

/**
 * Semantic tone vocabulary shared by Badge, Alert and Toast — the same five words
 * everywhere: `success` (green), `warning` (amber), `error` (red), `info` (indigo),
 * `neutral` (grey). Booking-lifecycle props map onto these:
 * confirmed → success · pending → warning · cancelled → error · completed → neutral.
 */
export const SEMANTIC_TONES = ['success', 'warning', 'error', 'info', 'neutral'] as const;

export const COMPONENTS: ComponentMeta[] = [
  // ── core ──────────────────────────────────────────────────────────────────
  {
    slug: 'button',
    name: 'Button',
    category: 'core',
    summary: 'Primary action control. `primary` for navigation-level commitment, `accent` for the one conversion action on a screen.',
    props: [
      R('variant', "'primary' | 'accent' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'error'", 'Visual role. One `accent` per screen; the semantic fills only when the colour IS the message.', "'primary'"),
      R('size', "'sm' | 'md' | 'lg' | 'xl'", 'Control height. lg/xl are the mobile default (≥44px tap target).', "'md'"),
      R('fullWidth', 'boolean', 'Stretches to 100% of the container.', 'false'),
      R('loading', 'boolean', 'Shows a spinner and blocks interaction.', 'false'),
      R('disabled', 'boolean', 'Disabled fill and text, not-allowed cursor.', 'false'),
      R('iconLeft / iconRight', 'React.ReactNode', 'A Lucide icon passed as a React node.'),
    ],
    code: `<Button variant="accent" size="lg" iconLeft={<Check size={18} />}>
  Confirm booking
</Button>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: '`primary` is the default, for navigation-level commitment. `accent` marks the one conversion action on the screen; `secondary` is the supporting action next to it.',
        code: `<Button>Save</Button>
<Button variant="accent">Confirm booking</Button>
<Button variant="secondary">Back</Button>`,
      },
      {
        id: 'variants',
        title: 'Variants',
        description: 'Role variants: `ghost` for tertiary actions in bars; `link` only for inline navigation inside a run of text.',
        code: `<Button variant="primary">Primary</Button>
<Button variant="accent">Accent</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
      },
      {
        id: 'semantic',
        title: 'Semantic fills',
        description: 'Use `success` · `warning` · `error` only when the button colour IS the message — a destructive confirm, an approve step. Same words as `Badge` / `Alert` / `Toast`. There is no `info` fill: in Sereno that is the brand indigo, i.e. `primary`.',
        code: `<Button variant="success" iconLeft={<Check size={16} />}>Approve</Button>
<Button variant="warning">Review flags</Button>
<Button variant="error" iconLeft={<Trash2 size={16} />}>Delete account</Button>`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`sm` and `md` on desktop; `lg` and `xl` are the mobile default — they guarantee the 44px tap target.',
        code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">XL</Button>`,
      },
      {
        id: 'with-icon',
        title: 'With icon',
        description: 'Pass any React node in `iconLeft` / `iconRight`. Use `lucide-react` icons at a `size` that matches the text (16 in `sm`/`md`, 18 in `lg`).',
        code: `<Button iconLeft={<Plus size={16} />}>New service</Button>
<Button variant="secondary" iconRight={<ChevronRight size={16} />}>
  Next
</Button>`,
      },
      {
        id: 'states',
        title: 'Loading and disabled',
        description: '`loading` swaps the left icon for a spinner and blocks clicks — use it on async actions. `disabled` uses its own fill and text (never just opacity).',
        code: `<Button loading>Sending</Button>
<Button disabled>Unavailable</Button>`,
      },
      {
        id: 'full-width',
        title: 'Full width',
        description: '`fullWidth` stretches the button to 100% of its container — used by the fixed footer actions on mobile.',
        code: `<Button variant="accent" size="lg" fullWidth>
  Confirm booking
</Button>`,
      },
    ],
    guidelines: {
      do: [
        'Use a single `accent` action per screen — the main conversion ("Confirm booking", "Subscribe now").',
        'Sentence-case label, verb in the infinitive: "Confirm booking", "Add service".',
        '`lg` or `xl` on mobile and in fixed footer actions.',
        'Turn on `loading` for async actions — it blocks the double click and communicates progress.',
      ],
      dont: [
        'Two `accent` buttons competing on the same screen.',
        '`ghost` on a tinted surface (the grey hover looks muddy) — use `secondary`.',
        'All-caps, a period, or "!" in the label.',
        '`link` for the primary action — it is only for inline navigation inside text.',
        'Scattering `success`/`warning`/`error` fills. Most buttons carry role (`primary`/`accent`/`secondary`); a semantic fill is only for the case where the colour itself is the warning — a destructive confirm, an approve step.',
      ],
    },
  },
  {
    slug: 'icon-button',
    name: 'IconButton',
    category: 'core',
    summary: 'Square icon-only control for bars, card corners and top bars. Always pass `label`.',
    props: [
      R('label', 'string', 'Accessible name — becomes aria-label and title. Required.'),
      R('variant', "'ghost' | 'secondary' | 'primary' | 'success' | 'warning' | 'error'", 'Visual role. Semantic fills follow the same words as `Badge` / `Alert`.', "'ghost'"),
      R('size', "'sm' | 'md' | 'lg'", 'Square side (32 / 40 / 48px).', "'md'"),
      R('children', 'React.ReactNode', 'The icon (Lucide 20px, stroke 1.75).'),
    ],
    code: `<IconButton label="Back">
  <ChevronLeft size={18} />
</IconButton>`,
    examples: [
      {
        id: 'variants',
        title: 'Variants',
        description: '`ghost` is the default (bars and card corners). `secondary` when you need a visible border — including on a tinted surface. `primary` for the standout action in a bar.',
        code: `<IconButton label="Back"><ChevronLeft size={18} /></IconButton>
<IconButton label="Search" variant="secondary"><Search size={18} /></IconButton>
<IconButton label="New" variant="primary"><Plus size={18} /></IconButton>`,
      },
      {
        id: 'semantic',
        title: 'Semantic fills',
        description: '`success` · `warning` · `error` — the same words as `Button` and `Badge`. Only when the colour is the message (a destructive control in a card corner). No `info`: that is `primary`.',
        code: `<IconButton label="Approve" variant="success"><Check size={18} /></IconButton>
<IconButton label="Flag" variant="warning"><Flag size={18} /></IconButton>
<IconButton label="Delete" variant="error"><Trash2 size={18} /></IconButton>`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '32 / 40 / 48px sides. Even `sm` keeps an adequate tap target thanks to padding.',
        code: `<IconButton label="Previous" size="sm"><ChevronLeft size={16} /></IconButton>
<IconButton label="Previous" size="md"><ChevronLeft size={18} /></IconButton>
<IconButton label="Previous" size="lg"><ChevronLeft size={20} /></IconButton>`,
      },
      {
        id: 'disabled',
        title: 'Disabled',
        description: 'Disabled fill and colour, `not-allowed` cursor — applies to every variant.',
        code: `<IconButton label="Back" disabled><ChevronLeft size={18} /></IconButton>
<IconButton label="New" variant="primary" disabled><Plus size={18} /></IconButton>`,
      },
    ],
    guidelines: {
      do: [
        'Always pass `label` — it is the `aria-label` and the `title`.',
        'Use `variant="secondary"` when the button sits on a tinted surface (the grey `ghost` hover looks muddy).',
        '`lucide-react` icon with `strokeWidth={1.75}`, 18–20px.',
        'A semantic fill (`success`/`warning`/`error`) only when the colour itself carries the meaning.',
      ],
      dont: [
        'An action that has text — use `Button` with `iconLeft`.',
        'An icon carrying meaning alone in a status — `Badge` always has a word.',
        'A semantic fill for a plain toolbar action — `ghost` · `secondary` · `primary` cover those.',
      ],
    },
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'core',
    summary: 'Small status pill. Semantic `tone` — the same five tones as Alert and Toast.',
    props: [
      R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'Semantic tone. `neutral` renders as an outlined chip.', "'neutral'"),
      R('size', "'sm' | 'md'", 'Pill size.', "'md'"),
      R('dot', 'boolean', 'Leading status dot. Keep it on for lifecycle states.', 'true'),
    ],
    code: `<Badge tone="success">Confirmed</Badge>`,
    examples: [
      {
        id: 'tones',
        title: 'Tones',
        description: 'The label is domain copy ("Confirmed"); the `tone` is the shared semantic word. Booking lifecycle maps as: confirmed → `success`, pending → `warning`, cancelled → `error`, completed → `neutral`.',
        code: `<Badge tone="success">Confirmed</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="error">Cancelled</Badge>
<Badge tone="info">Online</Badge>
<Badge tone="neutral">Completed</Badge>`,
      },
      {
        id: 'labels',
        title: 'As a label',
        description: 'Drop the dot with `dot={false}` for a plain label. `neutral` is an outlined chip — it reads on any background, including a tinted one.',
        code: `<Badge tone="info" dot={false}>Online</Badge>
<Badge tone="neutral" dot={false}>São Paulo</Badge>`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`sm` (11px) for dense lists; `md` (12px) is the default.',
        code: `<Badge tone="success" size="sm">Confirmed</Badge>
<Badge tone="success" size="md">Confirmed</Badge>`,
      },
    ],
    guidelines: {
      do: [
        'Use only the five semantic tones — never invent a sixth.',
        'Always with a word: a `Badge` never signals status by colour alone.',
        'Keep `dot` on for lifecycle states.',
      ],
      dont: [
        'A `Badge` as a button — it is not clickable.',
        'The old lifecycle names (`confirmed`, `pending`…) as `tone` — those are gone; use the semantic tones.',
      ],
    },
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'core',
    summary: 'Neutral surface: 1px border + soft shadow + 14px radius. The base of every list row and panel.',
    props: [
      R('padding', "'none' | 'sm' | 'md' | 'lg'", 'Inner spacing.', "'md'"),
      R('elevation', "'none' | 'sm' | 'md' | 'lg'", 'Shadow level. Never stack two.', "'sm'"),
      R('interactive', 'boolean', 'Adds hover lift, press scale and pointer cursor.', 'false'),
      R('selected', 'boolean', 'Brand border + ring for a chosen option.', 'false'),
    ],
    code: `<Card interactive selected={picked} onClick={() => setPicked(true)}>
  Card content
</Card>`,
    examples: [
      {
        id: 'padding',
        title: 'Padding',
        description: '`none` for list rows that own their own spacing; `sm`/`md`/`lg` for panels.',
        code: `<Card padding="sm">sm</Card>
<Card padding="md">md</Card>
<Card padding="lg">lg</Card>`,
      },
      {
        id: 'elevation',
        title: 'Elevation',
        description: 'Short, diffuse shadows. **Never stack two levels** — a card inside a card drops to `elevation="none"`.',
        code: `<Card elevation="none">none</Card>
<Card elevation="sm">sm</Card>
<Card elevation="md">md</Card>
<Card elevation="lg">lg</Card>`,
      },
      {
        id: 'interactive',
        title: 'Interactive and selected',
        description: '`interactive` adds hover lift + press scale. `selected` marks the choice with a brand border on all four sides + a ring — never a left-edge stripe.',
        code: `<Card interactive>Hover me</Card>
<Card interactive selected>Selected</Card>`,
      },
    ],
    guidelines: {
      do: [
        'A card inside a card → the inner one goes to `elevation="none"`.',
        'Use `interactive` only when the whole card is clickable.',
        'Selection = `selected` (border on all 4 sides + ring).',
      ],
      dont: ['Stacking two shadows.', 'A coloured left border to indicate selection.'],
    },
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'core',
    summary: 'Circular professional/client identity. Falls back to initials on a brand tint when there is no photo.',
    props: [
      R('name', 'string', 'Full name — drives the initials and the image alt.'),
      R('src', 'string', 'Photo URL. Without it, shows initials.'),
      R('size', "'xs' | 'sm' | 'md' | 'lg' | 'xl'", 'Diameter (24 → 80px).', "'md'"),
      R('status', "'confirmed' | 'pending' | 'cancelled'", 'Lifecycle dot in the lower-right corner (a domain concept).'),
    ],
    code: `<Avatar name="Ana Beatriz Ramos" size="xl" />`,
    examples: [
      {
        id: 'sizes',
        title: 'Sizes',
        description: 'xs 24 · sm 32 · md 40 · lg 56 · xl 80. The initials font size scales with it.',
        code: `<Avatar name="Ana Beatriz Ramos" size="xs" />
<Avatar name="Ana Beatriz Ramos" size="sm" />
<Avatar name="Ana Beatriz Ramos" size="md" />
<Avatar name="Ana Beatriz Ramos" size="lg" />
<Avatar name="Ana Beatriz Ramos" size="xl" />`,
      },
      {
        id: 'initials-photo',
        title: 'Initials and photo',
        description: 'Without `src`, shows the first two initials in Manrope on a brand tint — legible even on a tinted surface.',
        code: `<Avatar name="Ana Beatriz Ramos" size="lg" />
<Avatar name="Carlos Dias" src="/foto.jpg" size="lg" />`,
      },
      {
        id: 'status',
        title: 'With status',
        description: 'A lifecycle dot in the lower-right corner. Use sparingly — only where the avatar’s status matters.',
        code: `<Avatar name="Carlos Dias" size="lg" status="confirmed" />
<Avatar name="Rafael & Bia" size="lg" status="pending" />`,
      },
    ],
    guidelines: {
      do: ['Let the initials fallback do its job when there is no photo.', 'Crop photos to a circle (`radius-avatar`).'],
      dont: ['A generic illustration/blob in place of the photo.', '`status` on every avatar — only where it says something.'],
    },
  },

  // ── forms ─────────────────────────────────────────────────────────────────
  {
    slug: 'input',
    name: 'Input',
    category: 'forms',
    summary: 'Single-line text field with label, hint and error state.',
    props: [
      R('label', 'string', 'Label above the field.'),
      R('hint', 'string', 'Helper text. Replaced by `error` when present.'),
      R('error', 'string', 'Error message; also turns the border red.'),
      R('required', 'boolean', 'Adds the asterisk to the label.', 'false'),
      R('size', "'sm' | 'md' | 'lg'", 'Control height.', "'md'"),
      R('iconLeft', 'React.ReactNode', 'Icon on the left inside the field.'),
      R('prefix', 'React.ReactNode', 'Leading text adornment ("R$", "@", "+55"). Not part of the value.'),
      R('suffix', 'React.ReactNode', 'Trailing text or control (e.g. "min"). Not part of the value.'),
      R('mask', "'phone' | 'cpf' | 'cep' | 'currency' | string", "Format as you type — a preset or a custom `#`-per-digit pattern (`(##) #####-####`). Sets `inputMode` + `maxLength`."),
      R('type', "'text' | 'password' | 'email' | …", 'Native input type. `password` adds a show/hide eye toggle at the end of the field.', "'text'"),
      R('showCount', 'boolean', 'Show a `n / max` character counter on the hint row. Implied when `maxLength` is set.', 'false'),
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
    ],
    guidelines: {
      do: [
        'Always a `label` — never `placeholder` alone.',
        '`size="lg"` on mobile and in the public flow.',
        'Full error sentence with a period: "Enter a valid email."',
      ],
      dont: ['Placeholder instead of the label.', 'An error with no text (just the red border).'],
    },
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    category: 'forms',
    summary: 'Multi-line field for booking notes and service descriptions.',
    props: [
      R('label / hint / error / required', 'string / string / string / boolean', 'Same label contract as Input.'),
      R('rows', 'number', 'Initial height in lines.', '4'),
      R('showCount', 'boolean', 'Show a `n / max` character counter on the hint row. Implied when `maxLength` is set.', 'false'),
    ],
    code: `<Textarea label="Any notes?" rows={3} hint="Optional." />`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: 'Same label/hint/error contract as `Input`. `rows` sets the initial height; the field is vertically resizable.',
        code: `<Textarea label="Any notes?" rows={3} hint="Optional." />`,
      },
      {
        id: 'count',
        title: 'Character counter',
        description: 'Set `maxLength` (or pass `showCount`) for a `n / max` counter on the hint row — handy for notes with a ceiling. It turns red at the limit.',
        code: `<Textarea label="Any notes?" rows={3} maxLength={140} hint="Optional." />`,
      },
      {
        id: 'error',
        title: 'With error',
        description: '`error` replaces `hint` and turns the border red.',
        code: `<Textarea
  label="Service description"
  rows={3}
  error="The description needs at least 20 characters."
/>`,
      },
    ],
    guidelines: {
      do: ['Use for booking notes and service descriptions.', 'Set `rows` to the expected length (3 for notes).'],
      dont: ['A textarea for a short one-line value — use `Input`.'],
    },
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'forms',
    summary:
      'Single choice from ≤12 flat options. A hand-rolled listbox on pointer devices (looks the same in every browser, full keyboard); the native `<select>` on touch, where the OS picker is better with a finger.',
    props: [
      R('options', 'SelectOption[]', 'List of `{ value, label, disabled? }`.', '[]'),
      R('value / defaultValue', 'string', 'Controlled / uncontrolled selection.'),
      R('onValueChange', '(value: string) => void', 'Fires with the chosen value — a string, not a DOM event.'),
      R('placeholder', 'string', 'Shown when nothing is selected.'),
      R('label / hint / error / required', '—', 'Same label contract as Input.'),
      R('size', "'sm' | 'md' | 'lg'", 'Control height.', "'md'"),
      R('disabled', 'boolean', 'Disabled fill and text, not-allowed cursor.', 'false'),
      R('name', 'string', 'Mirrored to a hidden input so the value can be submitted in a form.'),
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
        description: 'The whole control with `disabled`, or a single row with `{ ..., disabled: true }` — kept in place, skipped by keyboard and pointer.',
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
        description: '`sm` is used inside the `WeeklyScheduleEditor`.',
        code: `<Select label="Field" size="sm" options={opts} />
<Select label="Field" size="md" options={opts} />
<Select label="Field" size="lg" options={opts} />`,
      },
    ],
    guidelines: {
      do: [
        'Use for up to ~12 flat options (duration, time zone, professional).',
        'Keep labels short — the chevron takes space on the right.',
        'Give a `placeholder` when there is no sensible default.',
      ],
      dont: [
        'More than ~12 options or grouped options — that is a combobox/search, a different pattern.',
        'Expecting a DOM event in `onValueChange` — it hands you the value string.',
      ],
    },
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'forms',
    summary: 'Opt-in control for consents and multi-select filters. The host needs the `.sereno-check:checked` / `:indeterminate` rules.',
    props: [
      R('label', 'string', 'Label next to the box.'),
      R('description', 'string', 'Secondary line below the label.'),
      R('indeterminate', 'boolean', 'Mixed state (some children selected). Visual only — a form still submits it as unchecked.', 'false'),
      R('size', "'sm' | 'md'", 'Box size — `sm` is 16px for dense filter lists.', "'md'"),
      R('checked / defaultChecked / disabled', 'boolean', 'Native input props passed through.'),
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
          'A "select all" parent is `checked` when every child is, `indeterminate` when only some are. `indeterminate` is a DOM property, so the component sets it via a ref — you just pass the boolean.',
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
        id: 'group',
        title: 'Group',
        description: 'Multi-select: independent boxes sharing a `<fieldset>` / `<legend>`. This is the filter-list pattern — for a single yes/no, one `Checkbox` is enough.',
        code: `<fieldset>
  <legend>Filter by specialty</legend>
  {OPTS.map((o) => (
    <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
  ))}
</fieldset>`,
      },
    ],
    guidelines: {
      do: [
        'Consents and multi-select filters.',
        'Affirmative label ("I accept…", "I want…").',
        '`indeterminate` for a "select all" parent — never a plain third state.',
        '`size="sm"` in dense filter panels; `md` in forms.',
      ],
      dont: [
        'A mutually exclusive single choice — use `Radio`.',
        'An instant-apply setting — use `Switch`.',
        'A `color` prop — the box is one brand colour on purpose.',
      ],
    },
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'forms',
    summary: 'Single choice among mutually exclusive options. Group by the same `name`. The host needs the `.sereno-radio:checked` rule.',
    props: [
      R('label', 'string', 'Label next to the circle.'),
      R('description', 'string', 'Secondary line below the label.'),
      R('name', 'string', 'Same value on every option in the group.'),
      R('size', "'sm' | 'md'", 'Circle size — `sm` is 16px. Matches `Checkbox`.', "'md'"),
      R('checked / defaultChecked / disabled', 'boolean', 'Native input props passed through.'),
    ],
    code: `<>
  <Radio name="format" label="Online" description="By video." defaultChecked />
  <Radio name="format" label="In person" description="At the office." />
</>`,
    examples: [
      {
        id: 'vertical',
        title: 'Vertical',
        description: 'The default: options stacked, every one sharing the same `name`. A `description` explains each choice — good for payment method and appointment format.',
        code: `<Radio name="format" label="Online" description="By video call." defaultChecked />
<Radio name="format" label="In person" description="At the office, in Pinheiros." />
<Radio name="format" label="Hybrid" description="First session in person, the rest online." />`,
      },
      {
        id: 'horizontal',
        title: 'Horizontal',
        description: 'Lay the same options in a row for short, label-only choices (duration, party size). Wrap them in a flex row — `Radio` itself does not manage layout.',
        code: `<div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
  {['30', '45', '60'].map((m) => (
    <Radio key={m} name="dur" label={\`\${m} min\`} checked={v === m} onChange={() => setV(m)} />
  ))}
</div>`,
      },
      {
        id: 'states',
        title: 'Disabled',
        description: '`disabled` dims the row. Combine with `defaultChecked` for a locked-in selection the user cannot change.',
        code: `<Radio name="plan" label="Free" defaultChecked />
<Radio name="plan" label="Pro — coming soon" disabled />
<Radio name="plan2" label="Locked selection" disabled defaultChecked />`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`size="sm"` (16px) for dense lists; `md` (20px) is the default. Same two sizes as `Checkbox`.',
        code: `<Radio name="sz" size="sm" label="Small (16px)" defaultChecked />
<Radio name="sz" label="Medium (20px, default)" />`,
      },
    ],
    guidelines: {
      do: [
        'Same `name` across the whole group.',
        'A `description` per option when the difference is not obvious.',
        'Horizontal only for short, label-only options.',
      ],
      dont: [
        'A single lone `Radio` — if it is yes/no, use `Checkbox` or `Switch`.',
        'A group with more than ~6 options — becomes a `Select`.',
        'Horizontal rows when options carry a `description` — they get too tall.',
      ],
    },
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'forms',
    summary: 'Instant-apply toggle for settings rows. Never inside a form that has a "Save" button.',
    props: [
      R('label', 'string', 'Label on the left.'),
      R('description', 'string', 'Secondary line below the label.'),
      R('checked', 'boolean', 'Toggle state.', 'false'),
      R('disabled', 'boolean', 'Dims the row, not-allowed cursor, drops out of the tab order.', 'false'),
      R('size', "'sm' | 'md'", 'Track size — `sm` for dense settings lists. Matches `Checkbox` / `Radio`.', "'md'"),
      R('onChange', '(e: { target: { checked: boolean } }) => void', 'Fired on toggle (click, or Space / Enter when focused).'),
    ],
    code: `<Switch
  label="Aceitar agendamentos online"
  checked={on}
  onChange={(e) => setOn(e.target.checked)}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: '`onChange` receives `{ target: { checked } }` — mirrors an input event without being one. Applies immediately, no "Save". Focusable; Space / Enter toggle.',
        code: `<Switch label="24h reminder" checked={a} onChange={(e) => setA(e.target.checked)} />
<Switch
  label="Daily email digest"
  description="Sent at 7am with the day's agenda."
  checked={b}
  onChange={(e) => setB(e.target.checked)}
/>`,
      },
      {
        id: 'settings',
        title: 'Settings list',
        description: 'The pattern Switch is for: a stack of independent, instant-apply rows, each with a `description` saying what flipping it does.',
        code: `<Switch label="Accept online bookings" description="Your public link takes new appointments." checked={s.online} onChange={set('online')} />
<Switch label="WhatsApp notifications" description="A message on every new booking or cancellation." checked={s.whats} onChange={set('whats')} />
<Switch label="Client reminders" description="Sent to the client 24h and 1h before." checked={s.reminders} onChange={set('reminders')} />`,
      },
      {
        id: 'states',
        title: 'Disabled',
        description: '`disabled` dims the row and removes it from the tab order — off or on.',
        code: `<Switch label="Paid-plan feature (off)" disabled />
<Switch label="Locked on" checked disabled />`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`size="sm"` (36×22 track) for dense settings panels; `md` (44×26) is the default.',
        code: `<Switch size="sm" label="Small track" checked={a} onChange={…} />
<Switch label="Medium track (default)" checked={b} onChange={…} />`,
      },
    ],
    guidelines: {
      do: [
        'Settings rows that apply immediately (reminders, accepting bookings, theme).',
        'A `description` on every row — the label alone rarely says what "on" does.',
        '`size="sm"` in a long settings panel.',
      ],
      dont: [
        'Inside a form that only saves on "Save" — use `Checkbox`.',
        'For a choice between two things — that is `Radio`, not on/off.',
      ],
    },
  },
  {
    slug: 'date-time-picker',
    name: 'DateTimePicker',
    category: 'forms',
    summary: 'Month calendar + available time slots — the heart of the public flow. Days and months render in pt-BR.',
    props: [
      R('year / month', 'number', 'Displayed month (`month` is 0-indexed). Defaults to the current month.'),
      R('selectedDate', 'number', 'Selected day.'),
      R('times', '(string | { value, disabled })[]', 'Time-slot labels or objects with `disabled`.', '[]'),
      R('selectedTime', 'string', 'Selected time (marked in turquoise).'),
      R('unavailable', 'number[]', 'Days with no availability — struck through and unclickable.'),
      R('onSelectDate / onSelectTime', '(v) => void', 'Selection callbacks.'),
    ],
    code: `<DateTimePicker
  year={2026}
  month={7}
  unavailable={[1, 2, 8, 9]}
  times={['09:00', '10:00', { value: '11:00', disabled: true }]}
  selectedDate={day}
  selectedTime={time}
  onSelectDate={setDay}
  onSelectTime={setTime}
/>`,
    examples: [
      {
        id: 'calendar',
        title: 'Calendar only',
        description: 'Without `times`, it shows just the month. `month` is 0-indexed (7 = August). `unavailable` strikes through and disables the days.',
        code: `<DateTimePicker
  year={2026}
  month={7}
  unavailable={[1, 2, 8, 9, 15, 16, 22, 23, 29, 30]}
  selectedDate={day}
  onSelectDate={setDay}
/>`,
      },
      {
        id: 'with-times',
        title: 'With time slots',
        description: 'Pass `times` as strings or `{ value, disabled }`. The selected time is the only turquoise (accent) element — the moment of decision in the flow.',
        code: `<DateTimePicker
  year={2026}
  month={7}
  times={['09:00', '10:00', { value: '11:00', disabled: true }, '14:00', '15:00']}
  selectedDate={day}
  selectedTime={time}
  onSelectDate={setDay}
  onSelectTime={setTime}
/>`,
      },
    ],
    guidelines: {
      do: ['`month` is 0-indexed.', 'Unavailable slots as `{ value, disabled: true }` — they keep their place in the grid.', 'Let the accent time marker be the only one on the screen.'],
      dont: ['Removing unavailable slots from the list — the grid "jumps".'],
    },
  },

  // ── domain ────────────────────────────────────────────────────────────────
  {
    slug: 'service-card',
    name: 'ServiceCard',
    category: 'domain',
    summary: 'One bookable service, in the public flow and in the professional’s catalogue.',
    props: [
      R('name', 'string', 'Service name.'),
      R('duration', 'string', 'Human duration, e.g. "50 min".'),
      R('price', 'string', 'Pre-formatted BRL string, e.g. "R$ 180".'),
      R('description', 'string', 'Short description.'),
      R('tag', 'string', 'Info badge, e.g. "Online".'),
      R('selected / onSelect', 'boolean / () => void', 'Makes the card selectable.'),
    ],
    code: `<ServiceCard
  name="Therapy session"
  duration="50 min"
  price="R$ 180"
  tag="Online"
  selected={picked}
  onSelect={() => setPicked(true)}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: '`price` is an already-formatted string ("R$ 180" — no cents in UI). `tag` becomes an info `Badge` ("Online", "In person").',
        code: `<ServiceCard
  name="Therapy session"
  duration="50 min"
  price="R$ 180"
  tag="Online"
  description="One-on-one session by video."
/>`,
      },
      {
        id: 'selectable',
        title: 'Selectable',
        description: 'Passing `onSelect` makes the card interactive; `selected` marks the choice (it inherits the `Card` `selected` state).',
        code: `<ServiceCard name="Therapy session" duration="50 min" price="R$ 180"
  selected={id === 'psi'} onSelect={() => setId('psi')} />
<ServiceCard name="First consultation" duration="1h" price="R$ 220"
  selected={id === 'aval'} onSelect={() => setId('aval')} />`,
      },
    ],
    guidelines: {
      do: ['Pre-formatted `price`: "R$ 180", "R$ 1.200".', 'Human duration: "50 min", "1h", "1h30".'],
      dont: ['"R$ 180,00" in the UI (cents only in receipts).', 'A selectable card without `onSelect` (`selected` alone is not clickable).'],
    },
  },
  {
    slug: 'professional-card',
    name: 'ProfessionalCard',
    category: 'domain',
    summary: 'A professional’s identity card — public directory, booking header, team lists.',
    props: [
      R('name', 'string', 'Professional’s name.'),
      R('specialty', 'string', 'e.g. "Clinical psychologist".'),
      R('credential', 'string', 'Professional registration, e.g. "CRP 06/123456".'),
      R('location / rating', 'string', 'City and pre-formatted rating.'),
      R('photo', 'string', 'Photo URL (falls back to initials).'),
      R('action', 'React.ReactNode', 'Trailing element, usually a Button.'),
    ],
    code: `<ProfessionalCard
  name="Ana Beatriz Ramos"
  specialty="Clinical psychologist"
  credential="CRP 06/123456"
  location="São Paulo"
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: 'The credential (CRP/CRN/CRM) shows whenever it exists — it is a trust signal, not a detail.',
        code: `<ProfessionalCard
  name="Ana Beatriz Ramos"
  specialty="Clinical psychologist"
  credential="CRP 06/123456"
  location="São Paulo"
  rating="4,9 (128)"
/>`,
      },
      {
        id: 'with-action',
        title: 'With action',
        description: '`action` is a trailing element — usually a `Button size="sm"`.',
        code: `<ProfessionalCard
  name="Ana Beatriz Ramos"
  specialty="Clinical psychologist"
  credential="CRP 06/123456"
  action={<Button size="sm">View calendar</Button>}
/>`,
      },
    ],
    guidelines: {
      do: ['Always show `credential` when it exists.', 'Pre-formatted rating: "4,9 (128)".'],
      dont: ['`action` and `onSelect` together on the same card — pick one behaviour.'],
    },
  },
  {
    slug: 'appointment-card',
    name: 'AppointmentCard',
    category: 'domain',
    summary: 'A booking in the professional’s agenda: time block, client, service and a lifecycle badge.',
    props: [
      R('client', 'string', 'Client name.'),
      R('service', 'string', 'Booked service.'),
      R('time', 'string', '"14:30" — large, in the brand-soft time block.'),
      R('date', 'string', 'Short date under the time, e.g. "Mon, 24".'),
      R('status', "'confirmed' | 'pending' | 'cancelled' | 'completed'", 'Booking lifecycle. Mapped to a semantic Badge tone internally.', "'confirmed'"),
      R('channel', 'string', '"Online" / "In person".'),
      R('actions', 'React.ReactNode', 'Trailing controls, usually IconButtons.'),
    ],
    code: `<AppointmentCard
  time="14:30"
  date="Mon, 24"
  client="Juliana Prado"
  service="Therapy session"
  channel="Online"
  status="confirmed"
/>`,
    examples: [
      {
        id: 'states',
        title: 'States',
        description: '`status` is a domain concept (confirmed / pending / cancelled / completed); the card maps it to the semantic `Badge` tone. At narrow widths the card reflows — the badge and actions drop to a second line.',
        code: `<AppointmentCard time="09:00" date="Mon, 24" client="Marina Alves"
  service="Therapy session" channel="Online" status="completed" />
<AppointmentCard time="11:00" date="Mon, 24" client="Carlos Dias"
  service="First consultation" channel="In person" status="confirmed" />
<AppointmentCard time="16:00" date="Mon, 24" client="Rafael & Bia"
  service="Couples therapy" channel="In person" status="pending" />`,
      },
      {
        id: 'with-actions',
        title: 'With actions',
        description: '`actions` are trailing controls — usually `IconButton`s, plus a confirm `Button` when `status="pending"`.',
        code: `<AppointmentCard
  time="16:00" date="Mon, 24" client="Rafael & Bia"
  service="Couples therapy" status="pending"
  actions={<>
    <Button size="sm">Confirm</Button>
    <IconButton label="More"><MoreVertical size={18} /></IconButton>
  </>}
/>`,
      },
    ],
    guidelines: {
      do: ['Keep `status` domain-named — the card handles the tone mapping.', 'Time always 24h with a leading zero: "09:00".'],
      dont: ['More than two controls in `actions` — that becomes a menu.'],
    },
  },
  {
    slug: 'weekly-schedule-editor',
    name: 'WeeklyScheduleEditor',
    category: 'domain',
    summary: 'Recurring weekly availability editor: one row per day with a Switch, start/end Selects, a buffer and a plain-language recap.',
    props: [
      R('value / defaultValue', 'WeekSchedule', 'Controlled via value/onChange, or uncontrolled from defaultValue.'),
      R('onChange', '(next: WeekSchedule) => void', 'Fired on every day/time change.'),
      R('buffer / defaultBuffer', "string ('0'|'5'|'10'|'15'|'30')", 'Buffer between appointments, in minutes.', "'10'"),
      R('onBufferChange', '(minutes: string) => void', 'Fired on buffer change.'),
      R('showSummary', 'boolean', 'Shows the pt-BR recap line ("Você atende Seg, Ter…").', 'true'),
    ],
    code: `<WeeklyScheduleEditor
  value={week}
  buffer={buffer}
  onChange={setWeek}
  onBufferChange={setBuffer}
/>`,
    examples: [
      {
        id: 'controlled',
        title: 'Controlled',
        description: 'The host owns the week and buffer state (`value` + `onChange`, `buffer` + `onBufferChange`). Each row stacks on narrow screens. The grid is on the 30-minute mark, 07:00 to 21:00.',
        code: `const [week, setWeek] = useState(DEFAULT_WEEK);
const [buffer, setBuffer] = useState('10');

<WeeklyScheduleEditor
  value={week}
  buffer={buffer}
  onChange={setWeek}
  onBufferChange={setBuffer}
/>`,
      },
      {
        id: 'uncontrolled',
        title: 'Uncontrolled',
        description: 'Without `value`, the editor holds its own state from `defaultValue` / `defaultBuffer`. `showSummary={false}` hides the pt-BR recap line ("Você atende Seg, Ter…").',
        code: `<WeeklyScheduleEditor defaultBuffer="15" showSummary={false} />`,
      },
    ],
    guidelines: {
      do: ['Prefer the controlled mode in the onboarding wizard (the wizard needs the state).', 'Keep the plain-language recap on in the professional’s flow.'],
      dont: ['Mixing `value` and `defaultValue`.'],
    },
  },

  // ── navigation ────────────────────────────────────────────────────────────
  {
    slug: 'top-bar',
    name: 'TopBar',
    category: 'navigation',
    summary: 'Sticky page header: leading/back slot, title + subtitle, trailing actions. 60px, translucent with blur.',
    props: [
      R('title / subtitle', 'string', 'Title and subtitle.'),
      R('leading', 'React.ReactNode', 'Usually a back IconButton or the wordmark.'),
      R('actions', 'React.ReactNode', 'Trailing actions.'),
      R('sticky', 'boolean', 'Sticks to the top on scroll.', 'true'),
      R('transparent', 'boolean', 'Drops the blur/border for hero headers.', 'false'),
    ],
    code: `<TopBar
  title="Pick a time"
  subtitle="Therapy session"
  leading={<IconButton label="Back"><ChevronLeft size={18} /></IconButton>}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Title and subtitle',
        description: '`leading` is usually a back `IconButton`; `actions` sit on the right.',
        code: `<TopBar
  title="Your details"
  leading={<IconButton label="Back"><ChevronLeft size={18} /></IconButton>}
/>`,
      },
      {
        id: 'full',
        title: 'With leading and actions',
        code: `<TopBar
  title="Pick a time"
  subtitle="Therapy session"
  leading={<IconButton label="Back"><ChevronLeft size={18} /></IconButton>}
  actions={<IconButton label="Notifications"><Bell size={18} /></IconButton>}
/>`,
      },
      {
        id: 'transparent',
        title: 'Transparent',
        description: '`transparent` drops the blur and border — for hero headers over a coloured surface.',
        code: `<TopBar transparent leading={<span className="wordmark">Sereno</span>} />`,
      },
    ],
    guidelines: {
      do: ['60px, `sticky` to the top by default.', '`leading` = back or the wordmark; never both.'],
      dont: ['More than two `actions` — that becomes a menu.'],
    },
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'navigation',
    summary: 'Horizontal section switcher. `underline` for page-level sections, `pill` for filters inside a panel.',
    props: [
      R('items', 'TabItem[]', 'List of { value, label, icon?, count? }.'),
      R('value / onChange', 'string / (value) => void', 'Active tab and callback.'),
      R('variant', "'underline' | 'pill'", 'Visual style.', "'underline'"),
      R('fullWidth', 'boolean', 'Distributes the tabs evenly.', 'false'),
    ],
    code: `<Tabs
  variant="pill"
  value={filter}
  onChange={setFilter}
  items={[
    { value: 'today', label: 'Today', count: 5 },
    { value: 'semana', label: 'Week', count: 23 },
  ]}
/>`,
    examples: [
      {
        id: 'underline',
        title: 'Underline',
        description: 'For page-level sections. The active tab is in `text-brand` with an underline.',
        code: `<Tabs
  value={view}
  onChange={setView}
  items={[
    { value: 'agenda', label: 'Calendar' },
    { value: 'clientes', label: 'Clients' },
    { value: 'servicos', label: 'Services' },
  ]}
/>`,
      },
      {
        id: 'pill',
        title: 'Pill',
        description: 'For filters inside a panel. The group hugs its content — it never stretches to fill the container. `count` becomes a chip next to the label.',
        code: `<Tabs
  variant="pill"
  value={filter}
  onChange={setFilter}
  items={[
    { value: 'today', label: 'Today', count: 5 },
    { value: 'semana', label: 'Week', count: 23 },
    { value: 'mes', label: 'Month' },
  ]}
/>`,
      },
      {
        id: 'full-width',
        title: 'Full width',
        description: '`fullWidth` distributes the tabs evenly — good for 2–3 sections in a narrow panel.',
        code: `<Tabs fullWidth value={v} onChange={setV} items={items} />`,
      },
    ],
    guidelines: {
      do: ['`underline` = page sections. `pill` = filters in a panel.', '`count` only when the number helps a decision.'],
      dont: ['A stretched `pill` taking the full width (unless `fullWidth`).', 'More than ~5 tabs — becomes a `Select` or navigation.'],
    },
  },
  {
    slug: 'bottom-nav',
    name: 'BottomNav',
    category: 'navigation',
    summary: 'Mobile primary navigation — 3 to 5 destinations, 64px, translucent blurred surface.',
    props: [
      R('items', 'BottomNavItem[]', 'List of { value, label, icon?, badge? }.'),
      R('value / onChange', 'string / (value) => void', 'Active destination and callback.'),
    ],
    code: `<BottomNav
  value={tab}
  onChange={setTab}
  items={[
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} />, badge: true },
  ]}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: '22px icon per item. The active one is in `text-brand`. Use 3 to 5 destinations.',
        code: `<BottomNav
  value={tab}
  onChange={setTab}
  items={[
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} /> },
    { value: 'servicos', label: 'Services', icon: <Sparkles size={22} /> },
  ]}
/>`,
      },
      {
        id: 'with-badge',
        title: 'With badge',
        description: '`badge: true` puts an accent dot on the icon corner — for "there’s something new here".',
        code: `items={[
  { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} /> },
  { value: 'clientes', label: 'Clients', icon: <Users size={22} />, badge: true },
]}`,
      },
    ],
    guidelines: {
      do: ['3 to 5 destinations.', 'The label always visible below the icon.'],
      dont: ['More than 5 items.', 'Using it on desktop — that is the sidebar’s job.'],
    },
  },
  {
    slug: 'stepper',
    name: 'Stepper',
    category: 'navigation',
    summary: 'Progress indicator for a linear multi-step flow (onboarding, guided setup).',
    props: [
      R('steps', 'StepperStep[]', 'List of { value?, label }.'),
      R('current', 'number', '0-based index of the active step.', '0'),
      R('onStepClick', '(index: number) => void', 'When present, completed steps become clickable (back only).'),
      R('variant', "'bar' | 'dots'", 'bar = full-width segments (desktop). dots = compact pills (mobile).', "'bar'"),
    ],
    code: `<Stepper
  current={step}
  onStepClick={setStep}
  steps={[
    { value: 'perfil', label: 'Your profile' },
    { value: 'servico', label: 'First service' },
    { value: 'grade', label: 'Your schedule' },
  ]}
/>`,
    examples: [
      {
        id: 'bar',
        title: 'Bar',
        description: 'Full-width segments + the "Passo N de M · <label>" line. The default for desktop wizards.',
        code: `<Stepper
  current={1}
  steps={[
    { value: 'perfil', label: 'Your profile' },
    { value: 'servico', label: 'First service' },
    { value: 'grade', label: 'Your schedule' },
  ]}
/>`,
      },
      {
        id: 'dots',
        title: 'Dots',
        description: 'Compact pills — the current step stretches. For mobile.',
        code: `<Stepper variant="dots" current={1} steps={steps} />`,
      },
      {
        id: 'clickable',
        title: 'Clickable back',
        description: 'With `onStepClick`, completed steps and the current one become buttons — back only; moving forward still needs the primary button.',
        code: `<Stepper current={step} onStepClick={setStep} steps={steps} />`,
      },
    ],
    guidelines: {
      do: ['`onStepClick` navigates back only.', '`bar` on desktop, `dots` on mobile.'],
      dont: ['Letting the user skip ahead via the Stepper.'],
    },
  },

  // ── feedback ──────────────────────────────────────────────────────────────
  {
    slug: 'alert',
    name: 'Alert',
    category: 'feedback',
    summary: 'Persistent in-page notice — stays until the user dismisses it or the condition is resolved. Unlike Toast, which is transient.',
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
        'Use `Alert` for conditions that **persist** — schedule not set, plan limit, failed charge.',
        'If the user can leave and come back and the message should still be there, it is an `Alert`.',
      ],
      dont: [
        'Confirming an action that just happened — that is a `Toast`.',
        'A floating `Alert` or one with a shadow — it lives in the page flow.',
      ],
    },
  },
  {
    slug: 'toast',
    name: 'Toast',
    category: 'feedback',
    summary: 'Transient confirmation of a completed action. One line of title, optional detail.',
    props: [
      R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'Semantic tone (same words as Badge / Alert). `neutral` is the plain dark toast.', "'neutral'"),
      R('title', 'string', 'Title (required).'),
      R('description', 'string', 'Optional detail.'),
      R('icon / action', 'React.ReactNode', 'Glyph and inline action.'),
      R('onClose', '() => void', 'Renders the × close control.'),
    ],
    code: `<Toast
  tone="success"
  title="Booking cancelled"
  description="The client was notified via WhatsApp."
  icon={<Check size={18} />}
/>`,
    examples: [
      {
        id: 'tones',
        title: 'Tones',
        description: 'One line of `title` (required) + optional `description`. It enters with a slide-up; the host controls the lifetime (~3s) and the position.',
        code: `<Toast tone="success" title="Booking cancelled"
  description="The client was notified via WhatsApp." icon={<Check size={18} />} />
<Toast tone="neutral" title="Link copied" />`,
      },
      {
        id: 'with-action',
        title: 'With action and close',
        description: '`onClose` renders the × . `action` sits on the right — use it for "Undo".',
        code: `<Toast
  tone="success"
  title="Service removed"
  action={<Button variant="link" size="sm">Undo</Button>}
  onClose={() => setToast(null)}
/>`,
      },
    ],
    guidelines: {
      do: ['Confirms what **just happened** and leaves the screen.', 'A one-line `title`; `description` only if it adds something.'],
      dont: ['A condition that persists (schedule, limit, charge) — use `Alert`.', 'Stacking several toasts — show one at a time.'],
    },
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'feedback',
    summary: 'Modal (desktop) or bottom sheet (mobile). Needs the sereno-pop / sereno-slide-up keyframes on the host.',
    props: [
      R('open', 'boolean', 'Controls visibility.', 'true'),
      R('title / description', 'string', 'Dialog header.'),
      R('footer', 'React.ReactNode', 'Action buttons, right-aligned.'),
      R('onClose', '() => void', 'Close on scrim click.'),
      R('variant', "'center' | 'sheet'", 'sheet slides up from the bottom — the mobile default.', "'center'"),
      R('width', 'number', 'Width of the center modal.', '440'),
    ],
    code: `<Dialog
  open={open}
  title="Cancel booking?"
  description="A cliente será avisada por WhatsApp."
  onClose={() => setOpen(false)}
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Back</Button>
      <Button variant="error">Cancel booking</Button>
    </>
  }
/>`,
    examples: [
      {
        id: 'center',
        title: 'Center (desktop)',
        description: 'The desktop default. `footer` holds the buttons, right-aligned. For destructive actions, the title **names the consequence** before it asks.',
        code: `<Dialog
  open={open}
  title="Cancel booking?"
  description="The client will be notified via WhatsApp and the slot frees up."
  onClose={() => setOpen(false)}
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Back</Button>
    <Button variant="error">Cancel booking</Button>
  </>}
/>`,
      },
      {
        id: 'sheet',
        title: 'Sheet (mobile)',
        description: '`variant="sheet"` slides up from the bottom of the screen, with a grabber at the top. It is the mobile default.',
        code: `<Dialog variant="sheet" open={open} title="Filters" onClose={close} footer={footer}>
  {/* content */}
</Dialog>`,
      },
    ],
    guidelines: {
      do: ['A title that names the consequence in destructive actions.', '`sheet` on mobile, `center` on desktop.', 'The destructive action on the right of the `footer`.'],
      dont: ['"Tem certeza?" as the title.', 'A `Dialog` for information that would fit in an in-page `Alert`.'],
    },
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'feedback',
    summary: 'Loading placeholder that holds the shape of content still being fetched. Needs the sereno-pulse keyframes on the host.',
    props: [
      R('variant', "'text' | 'card' | 'avatar' | 'block'", 'text = stacked lines. card = avatar + 3 lines + pill. avatar = circle. block = rectangle.', "'text'"),
      R('lines', 'number', 'Line count for variant="text".', '3'),
      R('width / height', 'number | string', 'Overrides the per-variant default size.'),
    ],
    code: `<Skeleton variant="card" />`,
    examples: [
      {
        id: 'variants',
        title: 'Variants',
        description: '`text` = stacked lines (last one shorter). `card` = avatar + 3 lines + pill (matches `AppointmentCard`/`ServiceCard`). `avatar` = circle. `block` = a rectangle for an image/chart/calendar.',
        code: `<Skeleton variant="text" />
<Skeleton variant="card" />
<Skeleton variant="avatar" />
<Skeleton variant="block" height={80} />`,
      },
      {
        id: 'lines',
        title: 'Lines and size',
        description: '`lines` controls the count in `variant="text"`; `width`/`height` override the per-variant default.',
        code: `<Skeleton variant="text" lines={2} />
<Skeleton variant="block" width={220} height={64} />`,
      },
    ],
    guidelines: {
      do: ['Use `card` for lists that load from the network (agenda, catalogue).', 'Same shape/height as the real content — the screen must not "jump" when it loads.'],
      dont: ['A skeleton for more than ~2s with no other signal — consider an error state.'],
    },
  },
  {
    slug: 'empty-state',
    name: 'EmptyState',
    category: 'feedback',
    summary: 'Friendly placeholder for empty agendas, client lists and search results.',
    props: [
      R('icon', 'React.ReactNode', 'A Lucide glyph in a brand-soft badge.'),
      R('title', 'string', 'Title (required).'),
      R('description', 'string', 'Supporting text.'),
      R('action', 'React.ReactNode', 'Primary action, usually a Button.'),
      R('compact', 'boolean', 'Reduces the vertical padding.', 'false'),
    ],
    code: `<EmptyState
  icon={<CalendarCheck size={22} />}
  title="No bookings today"
  description="A good time to review your services."
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: 'An `icon` in a brand-soft badge, a `title` (required) and a `description` that suggests the next step — no dwelling on the emptiness.',
        code: `<EmptyState
  icon={<CalendarCheck size={22} />}
  title="No bookings today"
  description="A good time to review your services."
/>`,
      },
      {
        id: 'with-action',
        title: 'With action',
        description: '`action` is the primary action out of the empty state.',
        code: `<EmptyState
  icon={<Users size={22} />}
  title="No clients yet"
  description="Your clients show up here after the first booking."
  action={<Button size="sm">Share my link</Button>}
/>`,
      },
      {
        id: 'compact',
        title: 'Compact',
        description: '`compact` reduces the vertical padding — for inside a card, not the whole screen.',
        code: `<EmptyState compact icon={<BarChart3 size={22} />}
  title="Reports coming soon" />`,
      },
    ],
    guidelines: {
      do: ['A tone that points to the next step: "A good time to review your services."'],
      dont: ['"Que vazio por aqui…" — no dwelling on the empty state.', 'A generic vector illustration.'],
    },
  },
];

export function getComponent(category: string, slug: string): ComponentMeta | undefined {
  return COMPONENTS.find((c) => c.category === category && c.slug === slug);
}

export function componentsByCategory(id: CategoryId): ComponentMeta[] {
  return COMPONENTS.filter((c) => c.category === id);
}

/** Previous / next component in the flat catalogue order — for the page footer nav. */
export function adjacentComponents(slug: string): { prev?: ComponentMeta; next?: ComponentMeta } {
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: COMPONENTS[i - 1], next: COMPONENTS[i + 1] };
}

/** Example sections for the page — the real list, or a single fallback from `code`. */
export function examplesFor(meta: ComponentMeta): Example[] {
  return meta.examples ?? [{ id: 'example', title: 'Example', code: meta.code }];
}
