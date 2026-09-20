# @sereno-ds/tokens

The token layer of the Sereno Design System — CSS custom properties (colors, typography, spacing, radii, elevation, motion) with light and `[data-theme="dark"]` values. CSS-first: the one JS export ([Breakpoints](#breakpoints), below) exists only for values a CSS custom property can't serve on its own.

Required by [`@sereno-ds/ui`](https://www.npmjs.com/package/@sereno-ds/ui); usable on its own if you want the Sereno scales without the components.

## Install

```bash
npm i @sereno-ds/tokens
```

## Use

Import the barrel once at the app root, **before** any component styles:

```ts
import '@sereno-ds/tokens/tokens.css';
```

That pulls, in order: `colors`, `typography`, `spacing`, `radii`, `elevation`, `motion`, `base` (a light element reset). You can also import a single layer:

```ts
import '@sereno-ds/tokens/colors.css';
import '@sereno-ds/tokens/spacing.css';
```

## Breakpoints

`spacing.css` defines the canonical breakpoints as `--bp-sm` / `--bp-md` / `--bp-lg` / `--bp-xl`, but a CSS `@media` query can't read a custom property — anything that has to write one (a Tailwind `@theme`, a `matchMedia` call) needs the literal pixel number. Import it instead of retyping it by hand:

```ts
import { breakpoints } from '@sereno-ds/tokens/breakpoints';
// { sm: 560, md: 768, lg: 1024, xl: 1280 }
```

A build-time check keeps this in sync with `spacing.css` — the two can never silently drift apart.

CSS still can't import a JS value, so a tool like Tailwind v4's `@theme` (which compiles breakpoints straight into `@media` rules) still needs the literal number written in its own config — this export just gives you something to read that number *from* instead of hand-copying it, and something a consumer-side test can assert against so a future change to `--bp-*` doesn't drift silently:

```ts
// e.g. a small check in the consuming app's own test suite
import { breakpoints } from '@sereno-ds/tokens/breakpoints';
expect(TAILWIND_THEME.breakpointSm).toBe(`${breakpoints.sm}px`);
```

## Dark mode

`colors.css` and `elevation.css` carry `[data-theme="dark"]` overrides. Set `data-theme="dark"` (or `"light"`) on `<html>` — `@sereno-ds/ui`'s `ThemeProvider` does this, or wire your own.

## Fonts

`typography.css` maps `--font-display` / `--font-body` / `--font-mono` onto three variables the host provides: `--font-manrope`, `--font-inter`, `--font-jetbrains-mono` (each with a system fallback). See the `@sereno-ds/ui` README for setup.

## License

MIT
