'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Status pill for the booking lifecycle and other short labels.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone. Same five tones across Badge, Alert and Toast. */
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  /** Leading status dot. Keep it on for lifecycle states. */
  dot?: boolean;
  children?: React.ReactNode;
}

const TONES: Record<NonNullable<BadgeProps['tone']>, [string, string, string]> = {
  success: ['--status-success-bg', '--status-success-fg', '--status-success-dot'],
  warning: ['--status-warning-bg', '--status-warning-fg', '--status-warning-dot'],
  error: ['--status-error-bg', '--status-error-fg', '--status-error-dot'],
  info: ['--status-info-bg', '--status-info-fg', '--status-info-dot'],
  // Neutral = an outlined chip (surface fill + hairline border, added below) so it
  // reads on any background, including a tinted one.
  neutral: ['--bg-surface', '--text-secondary', '--text-muted'],
};

export function Badge({ tone = 'neutral', size = 'md', dot = true, children, style, ...rest }: BadgeProps) {
  const [bg, fg, dt] = TONES[tone] || TONES.neutral;
  const sm = size === 'sm';
  return (
    <span
      {...rest}
      style={sx({
        display: 'inline-flex',
        alignItems: 'center',
        gap: sm ? 5 : 6,
        padding: sm ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--radius-chip)',
        background: 'var(' + bg + ')',
        // The neutral fill can match a tinted surface it sits on — a hairline
        // keeps the chip defined on any background. Tinted tones read on their own.
        border: 'var(--border-width-hairline) solid ' + (tone === 'neutral' ? 'var(--border-default)' : 'transparent'),
        color: 'var(' + fg + ')',
        fontFamily: 'var(--font-body)',
        fontSize: sm ? 'var(--text-2xs)' : 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-snug)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      })}
    >
      {dot && <span style={sx({ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: '999px', background: 'var(' + dt + ')', flex: '0 0 auto' })} />}
      {children}
    </span>
  );
}