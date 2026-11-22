# @sereno-ds/ui

React primitives for the Sereno Design System, token-driven, inline styles, **no UI base library** (no Radix / MUI / Tailwind). Native light/dark via one `data-theme` attribute.

> Browse every component with a live preview: the Sereno DS showcase.

## Install

```bash
npm i @sereno-ds/ui @sereno-ds/tokens lucide-react
```

`@sereno-ds/tokens` (the CSS custom properties everything reads) and `lucide-react` (icons, see below) are **peer/companion deps** you install alongside. `react` / `react-dom` (>=18, works on 19) you already have. `next-themes` comes bundled.

## Setup - three things, once, at the app root

### 1. Import the stylesheets, in this order

```ts
import '@sereno-ds/tokens/tokens.css'; // the token layer (colors, spacing, dark overrides…)
import '@sereno-ds/ui/styles.css';     // keyframes, structural rules, and the hover / press / focus of the interactive components
```

`tokens.css` **must** come first. Both are side-effect CSS: import them once (a root layout, `_app`, or `main.tsx`), not per-component.

**`styles.css` is required**, not decorative: `Button`, `IconButton`, `Card`, `ActionCard`, the rows and the collapse control of `SidebarNav`, `Checkbox`, `Radio`, the actions of `AvatarUpload` and the text fields (`Input`, `Textarea`, `Select`, `DatePicker`, `Autocomplete`) take their hover / press / focus states (and, for several of them, their colours and border) from it. Their values are on the element, the rules that switch between them are in the stylesheet, so without it they render unstyled, with no hover and no focus ring.

#### Restyling a state with plain CSS

These components carry a class the stylesheet's state rules hang on:

| Component | Class | Also |
|---|---|---|
| `Button`, `IconButton` | `sereno-btn` | |
| `Card` | `sereno-card` | `data-interactive`, `data-clickable` |
| `ActionCard` | `sereno-action` | |
| `SidebarNav` items and sub items | `sereno-sidenav-row` | |
| `Checkbox`, `Radio` | `sereno-choice` on the row (the `<label>`), `sereno-check` / `sereno-radio` on the box | |
| the actions of `AvatarUpload` | `sereno-menuitem` | |
| the collapse control of `SidebarNav` | `sereno-sidenav-toggle` | |
| `Input` (its row), `Textarea`, the boxes of `Select`, `DatePicker` and `Autocomplete` | `sereno-field` | `data-active` while a popup is open |
| `Switch` | `sereno-switch` on the track, `sereno-switch-thumb` on the thumb | |
| each segment of a `Stepper` | `sereno-step` | `data-state` is `done`, `active` or `todo` |
| `Card` | `sereno-card` | `data-selected` when `selected` |

The state rules have the specificity of `.sereno-btn:hover` (one class and one pseudo-class), so a rule of yours with the same specificity **that comes later** wins, with no `!important`:

```css
/* a ghost button on a brand-coloured band: its hover fill vanishes on that colour */
.on-band:hover { background: rgb(255 255 255 / 0.2); }
```

Or change what the DS reads, on the element itself (the component reads `--interactive-ghost-hover` from its own style, so only that element changes):

```css
.on-band { --interactive-ghost-hover: rgb(255 255 255 / 0.2); }
```

The class names and the `data-` attributes are the styling hooks. The `--sd-*` custom properties are how the component hands its values to the stylesheet and are **not** a public API: restyle with the rules above, not by setting them.

#### High contrast (forced colors)

In Windows High Contrast (`forced-colors: active`) the browser replaces every colour with a system one and drops every `box-shadow`. `styles.css` has a block for that mode: the keyboard focus of `Button`, `IconButton`, `Card`, `ActionCard`, `Switch` and the text fields is drawn as a `Highlight` outline, and the `Switch` is drawn with a border and system fills (it has no other way to show up). Current, selected and checked states survive too: the current page of a `Pagination`, the current item of a `SidebarNav` or `BottomNav`, a selected `Tab` (an underline), a selected `Table` row and a selected `Card` or `ActionCard` (a heavier border in the selection colour), the segments of a `Stepper` (system fills) and a checked `Checkbox` or `Radio` (filled, with the mark drawn in the matching text colour). Nothing there applies outside forced colors, and a rule of your own on those classes still wins by coming later. If you restyle a focus ring or a selected state as a shadow or a fill, do the same for forced colors; and never put a `Highlight` fill behind text, the browser draws a box behind the letters in this mode.

### 2. Provide the fonts

Components reference three font CSS variables. Define them however you host fonts; the tokens already carry a system fallback, so text renders without them, just off-brand.

| Variable | Family |
|---|---|
| `--font-inter` | Inter (body / UI) |
| `--font-manrope` | Manrope (display / headings) |
| `--font-jetbrains-mono` | JetBrains Mono (code / numeric) |

**Next.js (`next/font`):**

```tsx
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-manrope', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Vite / plain (Fontsource or `@font-face`):**

```ts
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/jetbrains-mono';
```

```css
:root {
  --font-inter: 'Inter Variable', system-ui, sans-serif;
  --font-manrope: 'Manrope Variable', system-ui, sans-serif;
  --font-jetbrains-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
}
```

### 3. Wrap the tree in `ThemeProvider`

```tsx
import { ThemeProvider } from '@sereno-ds/ui';

<ThemeProvider>{children}</ThemeProvider>;
```

It writes `data-theme="light" | "dark"` on `<html>` (defaults to the OS preference, remembers the choice). If you already manage `data-theme` yourself, you can skip it, the tokens only need that attribute to be set.

## Use

```tsx
import { Button, Card, Input } from '@sereno-ds/ui';
import { Check } from 'lucide-react';

export function Example() {
  return (
    <Card padding="lg">
      <Input label="Your name" placeholder="Ana Ramos" />
      <Button variant="accent" iconLeft={<Check size={18} />}>
        Confirm
      </Button>
    </Card>
  );
}
```

## Compound components

`Table`, `Tabs`, `SidebarNav`, `BottomNav`, `Stepper`, `Dialog` and `TopBar` are
the root plus dot-notated sub-parts, compose them like JSX, not a config
object/array:

```tsx
import { Tabs } from '@sereno-ds/ui';

<Tabs value={tab} onChange={setTab} variant="pill">
  <Tabs.List>
    <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
    <Tabs.Tab value="week" count={23}>Week</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="today">…</Tabs.Panel>
  <Tabs.Panel value="week">…</Tabs.Panel>
</Tabs>;
```

```tsx
import { Dialog, Button } from '@sereno-ds/ui';

<Dialog open={open} onClose={close}>
  <Dialog.Header title="Cancel booking?" description="This can't be undone.">
    <Dialog.Close />
  </Dialog.Header>
  <Dialog.Body>…</Dialog.Body>
  <Dialog.Footer>
    <Button variant="ghost" onClick={close}>Back</Button>
    <Button variant="error" onClick={confirm}>Cancel booking</Button>
  </Dialog.Footer>
</Dialog>;
```

- Only the root is exported: `Dialog.Header`, `Tabs.Tab`, etc. resolve to
  `undefined` if imported from a Server Component. Everything compound needs
  `'use client'` somewhere above it in the tree.
- Sub-parts outside their root throw at render (`` <Tabs.Tab> must be
  rendered inside <Tabs>. ``) instead of failing silently.
- `Header` / `Footer` (`Dialog`), `List` / `Panel` (`Tabs`), `Section`
  (`SidebarNav`) are optional, render only the sub-parts a given screen
  needs.
- `Select` and `DateTimePicker` are hand-rolled but **not** compound, each
  option / day is plain data (`options`, `times`), not JSX a consumer
  composes. See each component's own JSDoc, or the showcase's Props tab, for
  the rest of the sub-parts per component.

## Contract

- **Tokens are required.** Components read only CSS custom properties (`--bg-*`, `--text-*`, `--border-*`, `--radius-*`, `--space-*`, `--font-*`, …). They live in `@sereno-ds/tokens`; without it, everything renders unstyled.
- **Dark mode** is the same components on `[data-theme="dark"]`, no `theme` prop, no variant.
- **Icons come from you.** Where a component takes an icon (`Button` `iconLeft`, `TopBar` actions, …) you pass a node, typically `lucide-react`, but any 20px-ish SVG works. `@sereno-ds/ui` also uses `lucide-react` for its own built-in affordances (the `Select` caret, the `Input` password eye, `ThemeToggle`), so it's a required peer.
- **Zero CSS-in-JS runtime.** Styles are plain inline `style={{ … }}` reading `var(--token)`.

## License

MIT
