import type { CSSProperties } from 'react';

/** A flex column with a gap — the single most repeated inline style across every
 * screen. `gap` is a raw CSS length (`'var(--space-3)'`, `'4px'`, …). */
export const vcol = (gap: string): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap });
