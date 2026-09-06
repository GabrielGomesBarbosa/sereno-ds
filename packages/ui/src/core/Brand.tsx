'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * The Sereno mark: an indigo water-drop symbol, optionally locked up with the
 * "sereno" wordmark. Token-driven — the gradient is the brand indigo
 * (`#7d8bdf` → `#4f46e5`), the wordmark uses `--font-display` (Manrope) at 500.
 */
export interface BrandProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Symbol height in px. In the lockups it also drives the wordmark size. */
  size?: number;
  /** `symbol` (default), `lockup` (symbol + wordmark, horizontal) or `lockup-vertical`. */
  variant?: 'symbol' | 'lockup' | 'lockup-vertical';
  /** One-colour rendering (`currentColor`) instead of the gradient — for favicons, print, tinted surfaces. */
  mono?: boolean;
}

const DROP = 'M24 3 C 22 7.5 8 22 8 31.5 C 8 39 15 45 24 45 C 33 45 40 39 40 31.5 C 40 22 26 7.5 24 3 Z';

function Mark({ size, mono, decorative }: { size: number; mono: boolean; decorative: boolean }) {
  const gid = React.useId();
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img' as const, 'aria-label': 'Sereno' };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...a11y} style={{ display: 'block', flex: '0 0 auto' }}>
      {!mono && (
        <defs>
          <linearGradient id={gid} x1="0" y1="3" x2="0" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7d8bdf" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      )}
      <path d={DROP} fill={mono ? 'currentColor' : `url(#${gid})`} />
    </svg>
  );
}

export function Brand({ size = 24, variant = 'symbol', mono = false, style, ...rest }: BrandProps) {
  if (variant === 'symbol') {
    return (
      <span {...rest} style={sx({ display: 'inline-flex', ...style })}>
        <Mark size={size} mono={mono} decorative={false} />
      </span>
    );
  }

  const vertical = variant === 'lockup-vertical';
  const fontSize = Math.round(size * (vertical ? 1 : 0.78));
  const gap = Math.round(size * (vertical ? 0.28 : 0.34));
  return (
    <span
      {...rest}
      style={sx({
        display: 'inline-flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        gap,
        ...style,
      })}
    >
      <Mark size={size} mono={mono} decorative />
      <span
        style={sx({
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: mono ? 'currentColor' : 'var(--text-primary)',
        })}
      >
        sereno
      </span>
    </span>
  );
}
