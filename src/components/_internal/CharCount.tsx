'use client';

import * as React from 'react';
import { sx } from './style';

/** `n / max` (or a bare count) for the hint row of Input / Textarea. */
export function CharCount({ count, max }: { count: number; max?: number }) {
  const atLimit = max != null && count >= max;
  return (
    <span
      aria-live="polite"
      style={sx({
        flex: '0 0 auto',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.45,
        fontVariantNumeric: 'tabular-nums',
        color: atLimit ? 'var(--interactive-error)' : 'var(--text-muted)',
      })}
    >
      {max != null ? `${count} / ${max}` : count}
    </span>
  );
}
