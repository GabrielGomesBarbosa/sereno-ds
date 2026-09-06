'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Circular professional/client identity. Falls back to brand-soft initials when no photo exists. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — drives the initials fallback and the img alt. */
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional lifecycle dot in the lower-right corner. */
  status?: 'confirmed' | 'pending' | 'cancelled';
}

const S = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 } as const;

function initials(name: string): string {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

export function Avatar({ name = '', src, size = 'md', status, style, ...rest }: AvatarProps) {
  const d = S[size] || S.md;
  const fs = d <= 24 ? 10 : d <= 32 ? 12 : d <= 40 ? 14 : d <= 56 ? 18 : 26;
  const dot = status
    ? ({ confirmed: '--status-success-dot', pending: '--status-warning-dot', cancelled: '--status-error-dot' } as const)[status]
    : null;
  return (
    <span {...rest} style={sx({ position: 'relative', display: 'inline-flex', flex: '0 0 auto', ...style })}>
      <span
        style={sx({
          width: d,
          height: d,
          borderRadius: 'var(--radius-avatar)',
          overflow: 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Initials fill is a distinct brand tint (not --bg-brand-soft) so the
          // disc still reads when placed on a brand-soft surface (e.g. the
          // booking profile header).
          background: src ? 'var(--bg-subtle)' : 'color-mix(in srgb, var(--brand-500) 22%, var(--bg-surface))',
          color: 'var(--text-brand)',
          fontFamily: 'var(--font-display)',
          fontSize: fs,
          fontWeight: 'var(--weight-bold)',
          letterSpacing: 'var(--tracking-snug)',
          border: 'var(--border-width-hairline) solid ' + (src ? 'var(--border-subtle)' : 'color-mix(in srgb, var(--brand-500) 30%, transparent)'),
        })}
      >
        {src ? (
          // Plain <img>: this is a portable DS primitive, not tied to next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} style={sx({ width: '100%', height: '100%', objectFit: 'cover' })} />
        ) : (
          initials(name)
        )}
      </span>
      {dot && (
        <span
          style={sx({
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: Math.max(8, d * 0.28),
            height: Math.max(8, d * 0.28),
            borderRadius: '999px',
            background: 'var(' + dot + ')',
            border: '2px solid var(--bg-surface)',
          })}
        />
      )}
    </span>
  );
}