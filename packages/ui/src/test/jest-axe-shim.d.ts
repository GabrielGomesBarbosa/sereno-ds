/**
 * `jest-axe` ships no types of its own, and `@types/jest-axe` only augments
 * Jest's `jest.Matchers` (plus a `/// <reference types="jest" />` we don't
 * want pulled in) — so the module shape is hand-rolled here instead.
 *
 * No top-level import/export in this file on purpose: that's what makes
 * this a genuine global ambient module declaration (providing types for an
 * untyped package) rather than an augmentation of one — a file with any
 * top-level import/export turns every `declare module` in it into an
 * augmentation, which silently does nothing for a module with no existing
 * declaration to augment. The Vitest `Assertion` augmentation is a real
 * augmentation (of `vitest`, which already has types), so it lives in its
 * own module file: `vitest-axe-matchers.d.ts`.
 */
declare module 'jest-axe' {
  import type { AxeResults, ImpactValue, RunOptions, Spec } from 'axe-core';

  export type JestAxe = (html: Element | Document | string, options?: RunOptions) => Promise<AxeResults>;

  export const axe: JestAxe;

  export interface JestAxeConfigureOptions extends RunOptions {
    globalOptions?: Spec;
    impactLevels?: ImpactValue[];
  }

  export function configureAxe(options?: JestAxeConfigureOptions): JestAxe;

  /** Passed straight to `expect.extend(...)` — the key is the matcher name. */
  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message(): string };
  };
}
