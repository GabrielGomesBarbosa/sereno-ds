import 'vitest';

/**
 * Vitest's `expect` is Jest-matcher-compatible at runtime (`expect.extend`
 * works the same way) but has its own `Assertion` interface, so `jest-axe`'s
 * (Jest-only) matcher typing never applies here — this augments Vitest's
 * directly instead. The module shape for `jest-axe` itself lives in
 * `jest-axe-shim.d.ts` (a separate, import-free file — see the comment
 * there for why that split matters).
 *
 * Mirrors `@testing-library/jest-dom`'s own `types/vitest.d.ts` shape
 * exactly (same `T = any` default on `Assertion`) — a mismatched default on
 * a merged generic interface silently drops the *other* augmentation's
 * members instead of erroring, which is what broke every `toBeInTheDocument`
 * etc. call project-wide the first time this was written with `T = unknown`.
 */
interface AxeMatchers<R = void> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any -- must match @testing-library/jest-dom's own `Assertion<T = any>` default exactly, or the two augmentations stop merging (see the module comment above)
  interface Assertion<T = any> extends AxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- same merge requirement as Assertion above
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
