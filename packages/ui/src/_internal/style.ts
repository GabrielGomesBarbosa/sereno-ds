import type { CSSProperties } from 'react';

/**
 * The Sereno components are token-driven: nearly every style value is a
 * `var(--token)` string, including properties csstype types narrowly (fontWeight,
 * zIndex, opacity…). `sx` accepts a loose style map and hands back a
 * `CSSProperties` so component bodies can stay declarative and close to the
 * original Design System source.
 */
export const sx = (style: Record<string, unknown>): CSSProperties => style as CSSProperties;
