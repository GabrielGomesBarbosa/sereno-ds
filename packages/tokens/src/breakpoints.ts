/**
 * Pixel breakpoints — mirrors `--bp-sm` / `--bp-md` / `--bp-lg` / `--bp-xl` in
 * `spacing.css`. A CSS `@media` query can't read a custom property, so
 * anything that has to write one (a Tailwind `@theme`, a `matchMedia` call, a
 * React Native `useWindowDimensions` check) needs the literal number — import
 * this instead of retyping it by hand. Kept in sync with `spacing.css` by
 * `scripts/check-breakpoints.mjs`, which fails the build if they disagree.
 */
export const breakpoints = {
  sm: 560,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;
