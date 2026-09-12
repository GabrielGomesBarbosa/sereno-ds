// Server-safe catalogue of the Design System primitives (25 ported + FileUpload
// + AvatarUpload + SearchInput + SidebarNav). Powers the sidebar,
// the /design-system index and `generateStaticParams` for the per-component routes.
// Prop rows are transcribed from each component's .d.ts contract.

export type CategoryId = 'core' | 'forms' | 'navigation' | 'feedback';

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
    summary: 'Neutral surface: a crisp 1px ring + an optional soft lift + 14px radius. The base of every list row and panel.',
    props: [
      R('padding', "'none' | 'sm' | 'md' | 'lg'", 'Inner spacing.', "'md'"),
      R('elevation', "'none' | 'sm' | 'md' | 'lg'", 'Drop-shadow under the ring — `none` = ring only, `sm` a whisper. Never stack two.', "'sm'"),
      R('interactive', 'boolean', 'Adds hover lift, press scale and pointer cursor.', 'false'),
      R('selected', 'boolean', 'Brand ring for a chosen option.', 'false'),
    ],
    code: `<Card interactive selected={picked} onClick={() => setPicked(true)}>
  Card content
</Card>`,
    examples: [
      {
        id: 'padding',
        title: 'Padding',
        description: '`none` for list rows that own their own spacing; `sm`/`md`/`lg` for panels.',
        code: `<Card padding="sm">
  <Badge tone="neutral" size="sm">padding sm</Badge>
  <h4>Weekly summary</h4>
  <p>You saw 18 clients this week…</p>
</Card>
<Card padding="md">…</Card>
<Card padding="lg">…</Card>`,
      },
      {
        id: 'elevation',
        title: 'Elevation',
        description: 'Short, diffuse shadows. **Never stack two levels** — a card inside a card drops to `elevation="none"`.',
        code: `<Card elevation="none">…</Card>
<Card elevation="sm">…</Card>
<Card elevation="md">…</Card>
<Card elevation="lg">…</Card>`,
      },
      {
        id: 'interactive',
        title: 'Interactive and selected',
        description: '`interactive` adds hover lift + press scale. `selected` marks the choice with a brand ring on all four sides — never a left-edge stripe.',
        code: `<Card interactive selected={plan === 'year'} onClick={() => setPlan('year')}>
  <h4>Yearly</h4>
  <p>Billed once a year — two months free.</p>
  <strong>R$ 39 / mo</strong>
</Card>`,
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
  {
    slug: 'brand',
    name: 'Brand',
    category: 'core',
    summary: 'The Sereno mark — an indigo water-drop symbol, optionally locked up with the `sereno` wordmark. Gradient is the brand indigo; the wordmark is `--font-display` at 500.',
    props: [
      R('variant', "'symbol' | 'lockup' | 'lockup-vertical'", 'Symbol only, or the symbol locked up with the wordmark (horizontal / stacked).', "'symbol'"),
      R('size', 'number', 'Symbol height in px. In the lockups it also drives the wordmark size.', '24'),
      R('mono', 'boolean', 'One-colour rendering (`currentColor`) instead of the gradient — favicons, print, tinted surfaces.', 'false'),
    ],
    code: `<Brand variant="lockup" size={28} />`,
    examples: [
      {
        id: 'variants',
        title: 'Variants',
        description: '`symbol` for tight spots (a favicon, an app tile); `lockup` in a header; `lockup-vertical` for a splash or a centred hero.',
        code: `<Brand variant="symbol" size={40} />
<Brand variant="lockup" size={28} />
<Brand variant="lockup-vertical" size={40} />`,
      },
      {
        id: 'mono',
        title: 'Monochrome',
        description: '`mono` drops the gradient and paints in `currentColor` — so it takes the text colour of wherever it sits. For favicons, print and tinted surfaces.',
        code: `<span style={{ color: 'var(--text-primary)' }}>
  <Brand variant="lockup" size={28} mono />
</span>`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: 'The symbol reads down to 16px; below that use the `mono` version so the gradient does not muddy. The wordmark tracks the symbol size in the lockups.',
        code: `<Brand variant="symbol" size={16} />
<Brand variant="symbol" size={24} />
<Brand variant="symbol" size={32} />
<Brand variant="symbol" size={48} />`,
      },
    ],
    guidelines: {
      do: ['Use the lockup where there is room for the wordmark; the symbol alone only in tight spots.', 'Switch to `mono` on tinted surfaces and below 16px.'],
      dont: ['Recolour the drop or add effects (shadow, gloss, outline).', 'Stretch or rotate the symbol, or set the wordmark in another font.'],
    },
  },
  {
    slug: 'menu',
    name: 'Menu',
    category: 'core',
    summary:
      'Action menu / dropdown — a `trigger` you supply plus a portalled panel. Same mechanics as `Select`: `position: fixed` panel measured off the trigger, flips up when there is no room, closes on outside pointerdown / `Escape` / selection and returns focus to the trigger.',
    props: [
      R('trigger', 'React.ReactElement', 'The element that opens the menu — an `IconButton`, `Button`, an avatar button. `Menu` clones it to wire `onClick` + `aria-*`.'),
      R('adornment', 'React.ReactNode', 'Overlaid on the trigger (a notification count, a status dot) in a `pointer-events: none` layer.'),
      R('items', 'MenuEntry[]', 'Rows: `{ label, icon?, onClick, disabled?, tone?, keepOpen? }`, `{ separator: true }`, or `{ heading }`. Omit when using the render function.'),
      R('children', '(close) => ReactNode', 'Rich panel content instead of `items` — receives `close`. The panel is a `role="dialog"` then.'),
      R('header', 'React.ReactNode', 'A block above the items — a name + email, a title. Not part of the keyboard roving.'),
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
        description: 'The common case — `items` with `icon`, `onClick`, an optional `heading` and `separator`. Arrow keys rove, `Enter` / `Space` activate, `Escape` closes and refocuses the trigger.',
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
        'Use it for **actions** — verbs the user picks and the menu closes. For picking a value, that is `Select`.',
        'Give the trigger a clear affordance (a chevron, "•••", an icon) so it reads as openable.',
        'One `tone: "danger"` row at most, at the bottom, behind a separator.',
      ],
      dont: [
        'Nest submenus — flatten, or open a `Dialog`.',
        'Put more than ~7 items in it; past that it is a list or a `Dialog`.',
        'Use it as a `Select` — no checkmarks, no single-choice semantics.',
      ],
    },
  },
  {
    slug: 'table',
    name: 'Table',
    category: 'core',
    summary: 'Data table — a **compound component**. Cells hold real JSX; structure, density, dividers and hover / focus / sticky / zebra ship in the stylesheet. Sorting is controlled — the DS never reorders the rows.',
    props: [
      R('caption', 'string', 'Visually-hidden `<caption>` and the default accessible name for the scroll region. Always set one.'),
      R('density', "'comfortable' | 'compact'", 'Row padding. `compact` for dense CRM / reports.', "'comfortable'"),
      R('minWidth', 'number | string', 'Floor width for the table. Below it the scroll region takes a sideways scrollbar instead of the columns squashing. Set it on anything with more than ~3 columns that has to survive a phone.'),
      R('stickyHeader / maxHeight', 'boolean / number | string', 'Pin the header while the body scrolls — pair them so the head has a bounded region to stick within.'),
      R('zebra', 'boolean', 'Faint striping on even rows. Off by default — the hover is usually enough.', 'false'),
      R('Table.Row · onClick', '() => void', 'Makes the row a button: hover, pointer, focusable, Enter / Space.'),
      R('Table.Row · selected', 'boolean', 'Brand-soft fill for the chosen row.', 'false'),
      R('Table.HeaderCell · sortKey / sort / onSort', 'string / TableSort | null / (s) => void', 'Turns the header into a sort control. React to `onSort` and feed sorted rows back — the DS does not sort.'),
      R('Table.HeaderCell · srOnly', 'boolean', 'Visually-hide the header label (e.g. an actions column) — still read by assistive tech.'),
      R('Table.Cell / Table.HeaderCell · align', "'left' | 'center' | 'right'", 'Text alignment. Right for numbers.', "'left'"),
      R('Table.Cell · wrap', 'boolean', 'Let this cell wrap. Cells are `nowrap` by default so `minWidth` can do its job — opt one column back in for long free text.', 'false'),
    ],
    code: `<Table caption="Clients" density="compact" stickyHeader>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
      <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
      <Table.HeaderCell srOnly>Actions</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((r) => (
      <Table.Row key={r.id} onClick={() => open(r)}>
        <Table.Cell>{r.name}</Table.Cell>
        <Table.Cell align="right">{r.sessions}</Table.Cell>
        <Table.Cell align="right"><IconButton …/></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: '`Table.Head` + `Table.Body`, plain `Table.Cell`s. Always pass a `caption` — it names the table and the scroll region for assistive tech.',
        code: `<Table caption="Clients">
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Client</Table.HeaderCell>
      <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((r) => (
      <Table.Row key={r.id}>
        <Table.Cell>{r.name}</Table.Cell>
        <Table.Cell align="right">{r.sessions}</Table.Cell>
        <Table.Cell><Badge tone={r.status}>{label}</Badge></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>`,
      },
      {
        id: 'sortable',
        title: 'Sortable',
        description: '`sortKey` + controlled `sort` / `onSort` on a `HeaderCell`. The chevron reflects the state; **you** sort the `rows` and pass them back — the DS never reorders data.',
        code: `const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
const rows = useMemo(() => sortRows(DATA, sort), [sort]);

<Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
<Table.HeaderCell align="right" sortKey="sessions" sort={sort} onSort={setSort}>Sessions</Table.HeaderCell>`,
      },
      {
        id: 'interactive',
        title: 'Clickable rows',
        description: '`onClick` on `Table.Row` makes the whole row a button — hover, `Enter` / `Space`, focus ring. `selected` marks one. Don’t also put a `<button>` in a cell — pick one target.',
        code: `<Table.Row selected={r.id === picked} onClick={() => setPicked(r.id)}>
  <Table.Cell>{r.name}</Table.Cell>
  <Table.Cell align="right">{r.sessions}</Table.Cell>
  <Table.Cell align="right"><ChevronRight size={16} /></Table.Cell>
</Table.Row>`,
      },
      {
        id: 'row-actions',
        title: 'Row actions',
        description: 'A per-row `Menu` in a trailing `srOnly` cell — the pattern for when each row has several verbs. The row itself is **not** a button; the `IconButton` trigger is. `Menu` portals out, so the table\'s scroll region never clips it.',
        code: `<Table.HeaderCell srOnly width={44}>Actions</Table.HeaderCell>
…
<Table.Cell align="right">
  <Menu
    trigger={<IconButton label={\`Ações — \${r.name}\`} size="sm"><MoreHorizontal size={16} /></IconButton>}
    items={[
      { label: 'Editar', icon: <Pencil size={16} />, onClick: () => edit(r) },
      { label: 'Duplicar', icon: <Copy size={16} />, onClick: () => dup(r) },
      { separator: true },
      { label: 'Excluir', icon: <Trash2 size={16} />, tone: 'danger', onClick: () => del(r) },
    ]}
  />
</Table.Cell>`,
      },
      {
        id: 'compact-sticky',
        title: 'Compact + sticky header',
        description: '`density="compact"` for CRM density; `stickyHeader` + `maxHeight` pin the head inside a bounded scroll region; `zebra` for faint striping on long lists.',
        code: `<Table caption="Transactions" density="compact" stickyHeader maxHeight={220} zebra>
  …
</Table>`,
      },
      {
        id: 'empty',
        title: 'Empty state',
        description: 'The table has no built-in empty slot — the screen swaps in an `EmptyState` when `rows.length === 0`. Keeps the contract small.',
        code: `{rows.length === 0
  ? <EmptyState icon={<Search />} title="No clients" description="…" />
  : <Table caption="Clients">…</Table>}`,
      },
    ],
    guidelines: {
      do: [
        'Always set `caption` — it’s the accessible name for the table and its scroll region.',
        'Sort the `rows` in the consumer and pass them back; `sort` is display-only.',
        '`compact` for CRM / reports, `comfortable` everywhere else. Right-align numeric columns.',
        'Set `minWidth` on multi-column tables — the region scrolls sideways on a phone instead of the text crushing.',
        'For several verbs per row, a `Menu` in a trailing `srOnly` cell — not a clickable row.',
      ],
      dont: [
        'Nesting an interactive control in a clickable row (`onClick` on `Table.Row` **and** a `<button>` cell) — pick one.',
        'Expecting the `Table` to sort, filter or paginate for you.',
        'Putting the `Table` in a flex / grid track without `min-width: 0` on the track — the `minWidth` will push the *page* wide instead of the region.',
      ],
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
      'Single choice from ≤12 flat options. A hand-rolled listbox — the same in every browser, full keyboard support. On a mouse it drops down anchored to the field; on touch it opens as a bottom sheet with finger-sized rows.',
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
        description: '`sm` fits dense rows — inline filters, a time-range picker.',
        code: `<Select label="Field" size="sm" options={opts} />
<Select label="Field" size="md" options={opts} />
<Select label="Field" size="lg" options={opts} />`,
      },
      {
        id: 'long',
        title: 'Long list',
        description:
          'The panel caps its height and scrolls the rest — a dropdown to the room around the field, the touch sheet to 60% of the screen. It still *works*, but past ~12 options a search field beats scrolling; treat this as the ceiling, not the target.',
        code: `<Select label="Home city" placeholder="Search the list" options={cities} />`,
      },
    ],
    guidelines: {
      do: [
        'Use for up to ~12 flat options (duration, time zone, professional).',
        'Keep labels short — the chevron takes space on the right.',
        'Give a `placeholder` when there is no sensible default.',
      ],
      dont: [
        'Many options or grouped options as the norm — past ~12, that is a combobox/search, a different pattern.',
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
      R('year / month', 'number', 'The *initial* month (`month` is 0-indexed). The component then owns navigation — re-mount with a `key` to force a new start.'),
      R('selectedDate', 'number', 'Selected day.'),
      R('times', '(string | { value, disabled })[]', 'Time-slot labels or objects with `disabled`.', '[]'),
      R('selectedTime', 'string', 'Selected time (marked in turquoise).'),
      R('unavailable', 'number[]', 'Days with no availability — struck through and unclickable.'),
      R('onSelectDate / onSelectTime', '(v) => void', 'Selection callbacks.'),
      R('onMonthChange', '(year, month) => void', 'Fires on ‹ / › or the month/year popover — recompute `unavailable` / `renderDay` for the new month here.'),
      R('renderDay', '(day) => ReactNode', 'Content under each day number (a count, a dot). Return `null` for nothing. Every cell grows to stay even — scope it yourself (e.g. future days only).'),
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
        description:
          'Without `times`, it’s just the calendar. `month` (0-indexed) is only the *starting* view — the header navigates from there, and the grid stays 6 rows so nothing below it shifts. `onMonthChange` keeps `unavailable` in sync — here, the weekends of whatever month you land on.',
        code: `const [off, setOff] = useState(() => weekendsOf(2026, 7));

<DateTimePicker
  year={2026}
  month={7}
  unavailable={off}
  onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
  selectedDate={day}
  onSelectDate={setDay}
/>`,
      },
      {
        id: 'render-day',
        title: 'Content under each day',
        description: '`renderDay` drops a node under the day number — a booking count, a dot. Return `null` for days with nothing. Scope it in the consumer (this one shows counts for **future** days only). Every cell grows so the grid stays even.',
        code: `<DateTimePicker
  year={2026}
  month={7}
  onMonthChange={(y, m) => setCounts(bookingCountsOf(y, m))}
  renderDay={(day) =>
    counts[day] ? <span className="cal-count">{counts[day]}</span> : null
  }
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
      do: [
        '`month` is 0-indexed and is only the *starting* view.',
        'Recompute `unavailable` / `renderDay` inside `onMonthChange` so they track the visible month.',
        'Unavailable slots as `{ value, disabled: true }` — they keep their place in the grid.',
        'Let the accent time marker be the only one on the screen.',
      ],
      dont: [
        'Removing unavailable slots from the list — the grid "jumps".',
        'Putting `renderDay` counts in the public booking flow — that’s the pro’s private data.',
      ],
    },
  },
  {
    slug: 'file-upload',
    name: 'FileUpload',
    category: 'forms',
    summary: 'Pick one file — click, keyboard or drag-and-drop — with a local preview. No upload happens here; `onChange` hands you the `File`.',
    props: [
      R('multiple', 'boolean', 'A list instead of one file. Flips `value` to `File[]` and `onChange` to `(files: File[]) => void`.', 'false'),
      R('value', 'File | string | null  ·  File[]', 'Single: the picked file or an existing URL. Multiple: the file list. Omit for uncontrolled.'),
      R('onChange', '(file: File | null) => void  ·  (files: File[]) => void', 'The chosen file(s). Signature follows `multiple`.'),
      R('accept', 'string', '`accept` attribute — also enforced on drop.', "'image/*'"),
      R('maxSizeMB', 'number', 'Files above this are rejected with a message.', '5'),
      R('shape', "'circle' | 'square'", 'Thumbnail shape for image previews — `circle` for avatars (single only).', "'square'"),
      R('prompt', 'string', 'Text inside the empty drop area.'),
      R('label / hint / error / required / disabled', '—', 'Same label contract as Input.'),
    ],
    code: `<FileUpload
  label="Profile photo"
  hint="PNG or JPG, up to 5 MB."
  shape="circle"
  value={photo}
  onChange={setPhoto}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: 'Empty state is a dashed drop area — click, `Enter` / `Space`, or drop a file on it. Once a file is set it swaps to a preview with **Replace** and **Remove**. `hint` carries the accepted types / size.',
        code: `<FileUpload
  label="Attachment"
  hint="PDF or image, up to 5 MB."
  accept="image/*,.pdf"
  value={file}
  onChange={setFile}
/>`,
      },
      {
        id: 'avatar',
        title: 'Circle thumbnail',
        description: '`shape="circle"` rounds the preview — a logo or a round-cropped asset where you do not need a crop step. For a person’s photo use `AvatarUpload` instead (pencil button + circular crop).',
        code: `<FileUpload label="Logo" hint="Square PNG, transparent background." shape="circle" value={logo} onChange={setLogo} />`,
      },
      {
        id: 'multiple',
        title: 'Multiple files',
        description: '`multiple` keeps the drop zone visible and stacks the picked files below, each with its own Remove. `value` is `File[]`, `onChange` gets the whole list. Files failing `accept` / `maxSizeMB` are skipped with a count.',
        code: `<FileUpload
  label="Portfolio"
  hint="Up to 5 MB each."
  multiple
  accept="image/*"
  value={files}
  onChange={setFiles}
/>`,
      },
      {
        id: 'error',
        title: 'Rejected file',
        description: 'A file outside `accept`, or over `maxSizeMB`, is refused with a message in the `error` slot — the field itself keeps its last valid value. You can also drive `error` yourself.',
        code: `<FileUpload label="Logo" accept="image/png" maxSizeMB={1} onChange={setLogo} />
// drop a 4 MB JPG -> "File is too large — keep it under 1 MB."`,
      },
      {
        id: 'disabled',
        title: 'Disabled',
        description: 'No picker, no drop, no Replace / Remove — an existing `value` still shows as a static preview.',
        code: `<FileUpload label="Profile photo" shape="circle" value="/img/ana.jpg" disabled />`,
      },
    ],
    guidelines: {
      do: [
        'Put the accepted types and the size limit in `hint`.',
        '`multiple` for a gallery / attachment list; single (default) for one document.',
      ],
      dont: [
        'Expecting it to upload — it only hands you the `File`(s); the screen does the request.',
        'A profile photo — that is `AvatarUpload` (pencil button + circular crop).',
      ],
    },
  },
  {
    slug: 'avatar-upload',
    name: 'AvatarUpload',
    category: 'forms',
    summary: 'Profile-photo picker — an avatar disc with a pencil button, a library / camera / remove menu, and a circular crop. Hands back a cropped, downscaled JPEG.',
    props: [
      R('name', 'string', 'Full name — the initials fallback and the alt text.'),
      R('value', 'File | string | null', 'The current photo — a `File` (freshly cropped) or an existing URL string.'),
      R('onChange', '(file: File | null) => void', 'The cropped JPEG `File`, or `null` on remove.'),
      R('size', 'number', 'Disc diameter in px.', '96'),
      R('outputSize', 'number', 'The crop is drawn to this square size before export.', '512'),
      R('maxSizeMB', 'number', 'Picks larger than this are rejected (before crop).', '8'),
      R('labels', 'Partial<AvatarUploadLabels>', 'Override the English UI strings — menu, crop dialog, error messages.'),
      R('label / hint / error / required / disabled', '—', 'Same label contract as Input.'),
    ],
    code: `<AvatarUpload
  label="Profile photo"
  name={data.name}
  value={data.photo}
  onChange={(f) => setData({ ...data, photo: f })}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description:
          'The edit (pencil) button opens a menu: **Upload a photo** (library), **Take a photo** (a live camera capture via `getUserMedia` — falls back to a message if the camera is blocked), and **Remove** once a photo is set. Both routes end in a circular crop — drag to frame, scroll or the slider to zoom, **Save** exports. All strings are English by default; override with the `labels` prop.',
        code: `<AvatarUpload name="Ana Beatriz Ramos" value={photo} onChange={setPhoto} />`,
      },
      {
        id: 'existing',
        title: 'With a photo',
        description: 'Pass an existing URL string as `value` — it shows straight away, no crop. The menu then offers Replace / Remove.',
        code: `<AvatarUpload name="Marcos Lima" value="/img/marcos.jpg" onChange={setPhoto} />`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`size` sets the disc; the button and initials scale with it.',
        code: `<AvatarUpload name="AB" size={64} />
<AvatarUpload name="AB" size={96} />
<AvatarUpload name="AB" size={128} />`,
      },
      {
        id: 'disabled',
        title: 'Disabled',
        description: 'No edit button, no menu — an existing `value` still shows as a static disc.',
        code: `<AvatarUpload name="Ana" value="/img/ana.jpg" disabled />`,
      },
    ],
    guidelines: {
      do: [
        'Use for one person’s photo — profiles, team members, account settings.',
        'Let the crop do the framing; store the returned `File` and upload it server-side.',
        'Keep `hint` short — the affordance (the pencil button) speaks for itself.',
      ],
      dont: [
        'Documents / attachments / multiple files — that is `FileUpload`.',
        'Expecting HEIC to work — no browser but Safari decodes it; convert server-side. HEIC picks are rejected with a message.',
        'Skipping the server round-trip — `onChange` only gives you the cropped `File`.',
      ],
    },
  },
  {
    slug: 'search-input',
    name: 'SearchInput',
    category: 'forms',
    summary: '`Input` with a magnifier, a clear (×) button, and a debounced `onSearch`. `Enter` searches now, `Esc` clears.',
    props: [
      R('value / defaultValue', 'string', 'Controlled / uncontrolled text.'),
      R('onValueChange', '(value: string) => void', 'Every keystroke and on clear — the plain string.'),
      R('onSearch', '(value: string) => void', 'Debounced; also fires on `Enter` and on clear. Run the query here.'),
      R('debounce', 'number', 'Debounce for `onSearch`, ms.', '250'),
      R('clearLabel', 'string', 'aria-label for the × button.', "'Clear search'"),
      R('placeholder', 'string', '', "'Search…'"),
      R('label / hint / error / size / disabled', '—', 'Passed through to `Input`.'),
    ],
    code: `<SearchInput
  placeholder="Buscar cliente"
  onSearch={(q) => setQuery(q)}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Basic',
        description: 'The × appears once there is text. `onSearch` is debounced (`250ms`); pressing `Enter` fires it immediately, `Esc` clears.',
        code: `<SearchInput placeholder="Buscar cliente" onSearch={(q) => run(q)} />`,
      },
      {
        id: 'live',
        title: 'Live results',
        description: 'Wire `onSearch` to a filter. `onValueChange` (undebounced) is there too if you need the raw value for something else.',
        code: `const [q, setQ] = useState('');
const rows = q ? ITEMS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : ITEMS;
// …
<SearchInput placeholder="Filter" onSearch={setQ} />
{rows.length === 0 ? <EmptyState … /> : rows.map(…)}`,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description: 'Same `size` scale as `Input` — `lg` for a page-level search, `sm` inside a toolbar.',
        code: `<SearchInput size="sm" placeholder="Search" />
<SearchInput size="md" placeholder="Search" />
<SearchInput size="lg" placeholder="Search" />`,
      },
      {
        id: 'disabled',
        title: 'Disabled',
        code: `<SearchInput placeholder="Search" defaultValue="emma johnson" disabled />`,
      },
    ],
    guidelines: {
      do: [
        'Put the query behind `onSearch` (debounced) — not `onValueChange`.',
        'Show an `EmptyState` when a non-empty query returns nothing.',
        'A short, concrete placeholder — "Search clients", not just "Search".',
      ],
      dont: [
        'Running an expensive query on every keystroke — that is what the debounce is for.',
        'A search field with no clear affordance — the × is part of the contract.',
      ],
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
    summary: 'Horizontal section switcher — a **compound component**. `underline` for page-level sections, `pill` for filters inside a panel. `Tabs.Panel` is optional; your screen can render its own content instead, keyed off `value`.',
    props: [
      R('value / onChange', 'string / (value) => void', 'Active tab and callback. Lives on the root — every subcomponent reads it from context.'),
      R('variant', "'underline' | 'pill'", 'Visual style.', "'underline'"),
      R('fullWidth', 'boolean', 'Distributes the tabs evenly.', 'false'),
      R('Tabs.Tab · value', 'string', 'This tab’s identity — compared against the root `value`.'),
      R('Tabs.Tab · icon / count', 'ReactNode / number', 'Leading icon and a trailing chip (a count, a badge number).'),
      R('Tabs.Panel · value', 'string', 'Renders its children only while it matches the active `value`; otherwise renders nothing.'),
    ],
    code: `<Tabs variant="pill" value={filter} onChange={setFilter}>
  <Tabs.List>
    <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
    <Tabs.Tab value="semana" count={23}>Week</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
    examples: [
      {
        id: 'underline',
        title: 'Underline',
        description: 'For page-level sections. The active tab is in `text-brand` with an underline. `Tabs.Panel` renders the matching content — optional, your screen can do this itself instead.',
        code: `<Tabs value={view} onChange={setView}>
  <Tabs.List>
    <Tabs.Tab value="agenda">Calendar</Tabs.Tab>
    <Tabs.Tab value="clientes">Clients</Tabs.Tab>
    <Tabs.Tab value="servicos">Services</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="agenda">…</Tabs.Panel>
  <Tabs.Panel value="clientes">…</Tabs.Panel>
  <Tabs.Panel value="servicos">…</Tabs.Panel>
</Tabs>`,
      },
      {
        id: 'pill',
        title: 'Pill',
        description: 'For filters inside a panel. The group hugs its content — it never stretches to fill the container. `count` becomes a chip next to the label.',
        code: `<Tabs variant="pill" value={filter} onChange={setFilter}>
  <Tabs.List>
    <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
    <Tabs.Tab value="semana" count={23}>Week</Tabs.Tab>
    <Tabs.Tab value="mes">Month</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
      },
      {
        id: 'full-width',
        title: 'Full width',
        description: '`fullWidth` distributes the tabs evenly — good for 2–3 sections in a narrow panel.',
        code: `<Tabs fullWidth value={v} onChange={setV}>
  <Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab>
    <Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List>
</Tabs>`,
      },
      {
        id: 'overflow',
        title: 'Overflow',
        description: 'When the tabs are wider than the container the strip scrolls horizontally (no wrapping, no squishing) and a chevron appears on whichever side has more. Picking a tab scrolls it into view.',
        code: `<Tabs value={v} onChange={setV}>
  <Tabs.List>
    {MANY_TABS.map((t) => <Tabs.Tab key={t.value} value={t.value}>{t.label}</Tabs.Tab>)}
  </Tabs.List>
</Tabs> {/* the strip scrolls on its own */}`,
      },
    ],
    guidelines: {
      do: [
        '`underline` = page sections. `pill` = filters in a panel.',
        '`count` only when the number helps a decision.',
        'Let it scroll for a long strip — don’t wrap tabs onto two lines.',
      ],
      dont: ['A stretched `pill` taking the full width (unless `fullWidth`).', 'A dozen tabs where a `Select` or side navigation would read better.'],
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
    slug: 'sidebar-nav',
    name: 'SidebarNav',
    category: 'navigation',
    summary: 'Desktop primary navigation — the counterpart to `BottomNav`. Grouped sections with dividers, an inline second level (a hover flyout on the rail), and an edge toggle that drops it to a 72px icon rail.',
    props: [
      R('sections', 'SidebarNavSection[]', 'Groups of `{ label?, items }`. A hairline divider sits between groups; `label` is the uppercase heading above it.'),
      R('value / onChange', 'string / (value) => void', 'Active destination and callback. A parent with `children` is not a destination — it toggles its submenu.'),
      R('linkComponent', 'React.ElementType', 'Items with an `href` render through this (e.g. Next `Link`) instead of a `<button>` — routing, new-tab, SSR-active.'),
      R('collapsed / onCollapsedChange', 'boolean / (c) => void', 'Rail state. Uncontrolled via `defaultCollapsed`.', 'false'),
      R('collapsible', 'boolean', 'Show the round collapse toggle on the sidebar’s right edge.', 'true'),
      R('header', 'React.ReactNode', 'Brand / logo slot at the top.'),
      R('footer', 'React.ReactNode', 'Slot pinned to the bottom (user card, plan nudge). Hidden while collapsed.'),
      R('labels', '{ expand?, collapse? }', 'Text for the collapse toggle.'),
    ],
    code: `<SidebarNav
  value={view}
  onChange={setView}
  header={<Wordmark />}
  footer={<UserCard />}
  sections={[
    { label: 'Workspace', items: [
      { value: 'agenda', label: 'Calendar', icon: <Calendar size={18} /> },
      { value: 'clients', label: 'Clients', icon: <Users size={18} />, count: 12 },
    ]},
    { label: 'Management', items: [
      { value: 'finance', label: 'Finance', icon: <Wallet size={18} />, children: [
        { value: 'finance:incoming', label: 'Incoming' },
        { value: 'finance:payouts', label: 'Payouts' },
      ]},
    ]},
  ]}
/>`,
    examples: [
      {
        id: 'basic',
        title: 'Groups and second level',
        description:
          'Each `section` is a divided block with an optional uppercase `label`. An item with `children` is not a destination — it opens an inline second level (the branch holding the active child starts open). On the collapsed rail the same list opens as a hover flyout instead.',
        code: `<SidebarNav
  value={view}
  onChange={setView}
  sections={[
    { label: 'Workspace', items: [
      { value: 'agenda', label: 'Calendar', icon: <Calendar size={18} /> },
      { value: 'clients', label: 'Clients', icon: <Users size={18} />, count: 12 },
      { value: 'services', label: 'Services', icon: <Sparkles size={18} /> },
    ]},
    { label: 'Management', items: [
      { value: 'finance', label: 'Finance', icon: <Wallet size={18} />, children: [
        { value: 'finance:incoming', label: 'Incoming' },
        { value: 'finance:payouts', label: 'Payouts', count: 3 },
      ]},
      { value: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    ]},
    { label: 'Account', items: [
      { value: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ]},
  ]}
/>`,
      },
      {
        id: 'collapsible',
        title: 'Collapsible rail',
        description:
          'A round toggle on the sidebar’s right edge (level with the `header`) drops it to a 72px icon rail — labels hide, group headings become bare dividers, counts become a dot, and each icon gets a hover tooltip. A parent still opens its flyout from the rail. Pass `header` (a mark shows on the rail) / `footer` (hidden on the rail).',
        code: `const [collapsed, setCollapsed] = React.useState(false);

<SidebarNav
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  labels={{ expand: 'Expand', collapse: 'Collapse' }}
  header={<Wordmark compact={collapsed} />}
  footer={<UserCard />}
  value={view}
  onChange={setView}
  sections={sections}
/>`,
      },
    ],
    guidelines: {
      do: [
        'Group into 2–4 labelled sections; keep each to ~6 items.',
        'Second level only one deep — no grandchildren.',
        'On mobile it hides; `BottomNav` takes over under 900px.',
      ],
      dont: ['A parent item that both navigates and has children.', 'More than two levels.', 'Using it as the mobile navigation.'],
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
      R('stepLabel', '(current, total) => ReactNode', 'Formats the counter (1-based). Default `Step N of M` — the DS ships no localised copy. Return `null` to drop the counter.'),
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
        description:
          'Full-width segments + a `Step N of M · <label>` line (a dot separates the counter from the step label). The default for desktop wizards. Drive it with `current` — **Back** / **Next** below walk a live 4-step flow.',
        code: `const [step, setStep] = React.useState(0);
const steps = [
  { value: 'profile', label: 'Your profile' },
  { value: 'service', label: 'First service' },
  { value: 'schedule', label: 'Your schedule' },
  { value: 'review', label: 'Review & finish' },
];

<Stepper current={step} steps={steps} />
<Button onClick={() => setStep((s) => s - 1)}>Back</Button>
<Button onClick={() => setStep((s) => s + 1)}>Next</Button>`,
      },
      {
        id: 'dots',
        title: 'Dots',
        description: 'Compact pills — the current step stretches. For mobile. Same `current` contract; walk it with the buttons.',
        code: `<Stepper variant="dots" current={step} steps={steps} />`,
      },
      {
        id: 'clickable',
        title: 'Clickable back',
        description:
          'With `onStepClick`, completed steps and the current one become buttons — **back only**; the disabled forward segments still need the primary **Next**. Try clicking an earlier segment.',
        code: `<Stepper current={step} onStepClick={setStep} steps={steps} />`,
      },
      {
        id: 'step-label',
        title: 'Localised / custom counter',
        description:
          'The counter defaults to `Step N of M` — the DS embeds no localised text. Pass `stepLabel` for another language or a compact form; return `null` to show only the step label.',
        code: `<Stepper current={step} steps={steps}
  stepLabel={(c, t) => \`Passo \${c} de \${t}\`} />   // pt-BR

<Stepper current={step} steps={steps}
  stepLabel={(c, t) => \`\${c} / \${t}\`} />          // compact`,
      },
    ],
    guidelines: {
      do: [
        '`onStepClick` navigates back only.',
        '`bar` on desktop, `dots` on mobile.',
        'Pass `stepLabel` for the counter in your app’s language — the DS default is English.',
      ],
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
    summary:
      'Transient confirmation of a completed action. `<Toast>` is the card; `<ToastProvider>` + `useToast()` are the system that portals, stacks and auto-dismisses it.',
    props: [
      R('tone', "'success' | 'warning' | 'error' | 'info' | 'neutral'", 'Semantic tone (same words as Badge / Alert). `neutral` is the plain dark toast.', "'neutral'"),
      R('title', 'string', 'Title (required).'),
      R('description', 'string', 'Optional detail.'),
      R('icon / action', 'React.ReactNode', 'Glyph and inline action ("Undo" / "View").'),
      R('onClose', '() => void', 'Renders the × close control. The provider wires this for you.'),
      R('<ToastProvider> position', "'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'top-center'", 'Viewport corner.', "'bottom-right'"),
      R('<ToastProvider> max', 'number', 'Most toasts on screen at once — the oldest drops.', '3'),
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
          'Wrap the app once in `<ToastProvider>`, then call `useToast()` anywhere under it. Toasts stack newest-nearest-the-edge, show a countdown bar, auto-dismiss after `duration` (the bar and timer both pause while hovered or focused), and cap at `max`. `duration: 0` keeps one until `dismiss()`. Six `position`s — every corner and both centres.',
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
        description: 'The presentational `<Toast>` on its own — one line of `title` (required) + optional `description`. It enters with a slide-up; without the provider the host owns the lifetime and position.',
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
      do: [
        'Confirms what **just happened** and leaves the screen.',
        'A one-line `title`; `description` only if it adds something.',
        'One `<ToastProvider>` at the app root — call `useToast()` everywhere else.',
      ],
      dont: [
        'A condition that persists (schedule, limit, charge) — use `Alert`.',
        'Queueing a dozen at once — the provider caps at `max` (3), but that is a smell.',
      ],
    },
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'feedback',
    summary:
      'Modal (desktop), bottom sheet (mobile) or full-screen. Portalled to `<body>` and fixed to the viewport; while open it locks page scroll and closes on Escape. Needs the sereno-pop / sereno-slide-up keyframes on the host.',
    props: [
      R('open', 'boolean', 'Controls visibility.', 'true'),
      R('title / description', 'string', 'Dialog header.'),
      R('footer', 'React.ReactNode', 'Action buttons, right-aligned.'),
      R('onClose', '() => void', 'Called on scrim click, on Escape, and by the header ✕.'),
      R('variant', "'center' | 'sheet' | 'fullscreen'", 'sheet slides up from the bottom (mobile default); fullscreen fills the viewport.', "'center'"),
      R('size', "'sm' | 'md' | 'lg' | 'xl'", 'Max width of the centered modal (440 / 600 / 800 / 1000).', "'sm'"),
      R('dividers', 'boolean', 'Hairline rules between header / body / footer; the body scrolls on its own.', 'false'),
      R('showClose', 'boolean', 'Show a ✕ in the header (needs onClose). Defaults on for fullscreen.', 'false'),
      R('dismissible', 'boolean', 'When false, a scrim click and Escape no longer close it — only the ✕, a footer action, or open={false}.', 'true'),
      R('width', 'number', 'Explicit pixel width — overrides size.'),
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
      {
        id: 'sizes',
        title: 'Sizes',
        description: '`size` caps the centered modal at a fixed max-width — `sm` (440), `md` (600), `lg` (800), `xl` (1000). It still shrinks to fit narrow screens. `width` takes an explicit pixel value instead.',
        code: `<Dialog size="lg" open={open} title="Report" onClose={close} footer={footer}>
  {/* wide content */}
</Dialog>`,
      },
      {
        id: 'dividers',
        title: 'Dividers',
        description: 'Set `dividers` for a hairline rule under the header and above the footer; the body then scrolls between them so the title and actions stay put. Pair with `showClose` for a header ✕.',
        code: `<Dialog dividers showClose open={open} title="Terms of service" onClose={close} footer={footer}>
  {/* long, scrolling content */}
</Dialog>`,
      },
      {
        id: 'form',
        title: 'Form inside',
        description: 'Inputs, selects and checkboxes sit inside a `Dialog` without ceremony. Keep the form short enough not to need `dividers` — a `Select` menu opens within the panel, so a scrolling body would clip it.',
        code: `<Dialog showClose size="md" open={open} title="New booking" onClose={close} footer={footer}>
  <Input label="Client" />
  <Select label="Service" options={services} />
</Dialog>`,
      },
      {
        id: 'fullscreen',
        title: 'Full screen',
        description: '`variant="fullscreen"` fills the viewport (no radius, no scrim gap) — for immersive multi-section flows. The header ✕ is on by default here.',
        code: `<Dialog variant="fullscreen" dividers open={open} title="Edit availability" onClose={close} footer={footer}>
  {/* full-page form */}
</Dialog>`,
      },
      {
        id: 'dismissible',
        title: 'Require a choice',
        description: '`dismissible={false}` drops the scrim-click and Escape shortcuts, so the user has to pick a footer action (or the ✕). Reserve it for a decision that really can’t be deferred — a stray click shouldn’t trap people.',
        code: `<Dialog dismissible={false} open={open} title="Discard 3 unsaved changes?" onClose={close} footer={footer}>
  {/* content */}
</Dialog>`,
      },
    ],
    guidelines: {
      do: [
        'A title that names the consequence in destructive actions.',
        '`sheet` on mobile, `center` on desktop; `fullscreen` for long multi-step flows.',
        '`dividers` whenever the body can scroll.',
        'The destructive action on the right of the `footer`.',
        '`dismissible={false}` only for a genuinely blocking choice — and always leave a visible way out (a ✕ or a footer button).',
      ],
      dont: ['"Tem certeza?" as the title.', 'A `Dialog` for information that would fit in an in-page `Alert`.', 'A tall form with no `dividers` — the header scrolls away with it.', '`dismissible={false}` as a default — most dialogs should let a scrim click out.'],
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
        description: '`text` = stacked lines (last one shorter). `card` = avatar + 3 lines + pill (a typical list-row card). `avatar` = circle. `block` = a rectangle for an image/chart/calendar.',
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
