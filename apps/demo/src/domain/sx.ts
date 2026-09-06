import type { CSSProperties } from 'react';

/**
 * These domain cards are token-driven: nearly every style value is a
 * `var(--token)` string, which csstype types narrowly (fontWeight, zIndex…).
 * `sx` accepts a loose style map and hands back a `CSSProperties` so the
 * component bodies can stay declarative. Local copy of the `@sereno/ui`
 * internal helper — these components are demo-app code, not library code.
 */
export const sx = (style: Record<string, unknown>): CSSProperties => style as CSSProperties;
