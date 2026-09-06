# @sereno/tokens

The token layer of the Sereno Design System — CSS custom properties (colors, typography, spacing, radii, elevation, motion) with light and `[data-theme="dark"]` values. No JS.

Required by [`@sereno/ui`](https://www.npmjs.com/package/@sereno/ui); usable on its own if you want the Sereno scales without the components.

## Install

```bash
npm i @sereno/tokens
```

## Use

Import the barrel once at the app root, **before** any component styles:

```ts
import '@sereno/tokens/tokens.css';
```

That pulls, in order: `colors`, `typography`, `spacing`, `radii`, `elevation`, `motion`, `base` (a light element reset). You can also import a single layer:

```ts
import '@sereno/tokens/colors.css';
import '@sereno/tokens/spacing.css';
```

## Dark mode

`colors.css` and `elevation.css` carry `[data-theme="dark"]` overrides. Set `data-theme="dark"` (or `"light"`) on `<html>` — `@sereno/ui`'s `ThemeProvider` does this, or wire your own.

## Fonts

`typography.css` maps `--font-display` / `--font-body` / `--font-mono` onto three variables the host provides: `--font-manrope`, `--font-inter`, `--font-jetbrains-mono` (each with a system fallback). See the `@sereno/ui` README for setup.

## License

MIT
