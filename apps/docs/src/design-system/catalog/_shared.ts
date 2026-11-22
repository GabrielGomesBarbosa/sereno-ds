// Helpers shared by the per-component catalogue files (one file per component, SS-574).

import type { PropRow } from '../catalog';

export const R = (name: string, type: string, description: string, def?: string): PropRow => ({ name, type, description, default: def });

/**
 * Semantic tone vocabulary shared by Badge, Alert and Toast - the same five words
 * everywhere: `success` (green), `warning` (amber), `error` (red), `info` (indigo),
 * `neutral` (grey). Booking-lifecycle props map onto these:
 * confirmed → success · pending → warning · cancelled → error · completed → neutral.
 */
export const SEMANTIC_TONES = ['success', 'warning', 'error', 'info', 'neutral'] as const;
