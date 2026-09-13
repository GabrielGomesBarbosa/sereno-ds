# @sereno-ds/ui

React primitives for the Sereno Design System — token-driven, inline styles, **no UI base library** (no Radix / MUI / Tailwind). Native light/dark via one `data-theme` attribute.

> Browse every component with a live preview: the Sereno DS showcase.

## Install

```bash
npm i @sereno-ds/ui @sereno-ds/tokens lucide-react
```

`@sereno-ds/tokens` (the CSS custom properties everything reads) and `lucide-react` (icons — see below) are **peer/companion deps** you install alongside. `react` / `react-dom` (>=18, works on 19) you already have. `next-themes` comes bundled.

## Setup — three things, once, at the app root

### 1. Import the stylesheets, in this order

```ts
import '@sereno-ds/tokens/tokens.css'; // the token layer (colors, spacing, dark overrides…)
import '@sereno-ds/ui/styles.css';     // component keyframes + a few structural rules
```

`tokens.css` **must** come first. Both are side-effect CSS — import them once (a root layout, `_app`, or `main.tsx`), not per-component.

### 2. Provide the fonts

Components reference three font CSS variables. Define them however you host fonts; the tokens already carry a system fallback, so text renders without them — just off-brand.

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

It writes `data-theme="light" | "dark"` on `<html>` (defaults to the OS preference, remembers the choice). If you already manage `data-theme` yourself, you can skip it — the tokens only need that attribute to be set.

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
the root plus dot-notated sub-parts — compose them like JSX, not a config
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

- Only the root is exported — `Dialog.Header`, `Tabs.Tab`, etc. resolve to
  `undefined` if imported from a Server Component. Everything compound needs
  `'use client'` somewhere above it in the tree.
- Sub-parts outside their root throw at render (`` <Tabs.Tab> must be
  rendered inside <Tabs>. ``) instead of failing silently.
- `Header` / `Footer` (`Dialog`), `List` / `Panel` (`Tabs`), `Section`
  (`SidebarNav`) are optional — render only the sub-parts a given screen
  needs.
- `Select` and `DateTimePicker` are hand-rolled but **not** compound — each
  option / day is plain data (`options`, `times`), not JSX a consumer
  composes. See each component's own JSDoc, or the showcase's Props tab, for
  the rest of the sub-parts per component.

## Contract

- **Tokens are required.** Components read only CSS custom properties (`--bg-*`, `--text-*`, `--border-*`, `--radius-*`, `--space-*`, `--font-*`, …). They live in `@sereno-ds/tokens`; without it, everything renders unstyled.
- **Dark mode** is the same components on `[data-theme="dark"]` — no `theme` prop, no variant.
- **Icons come from you.** Where a component takes an icon (`Button` `iconLeft`, `TopBar` actions, …) you pass a node — typically `lucide-react`, but any 20px-ish SVG works. `@sereno-ds/ui` also uses `lucide-react` for its own built-in affordances (the `Select` caret, the `Input` password eye, `ThemeToggle`), so it's a required peer.
- **Zero CSS-in-JS runtime.** Styles are plain inline `style={{ … }}` reading `var(--token)`.

## License

MIT
