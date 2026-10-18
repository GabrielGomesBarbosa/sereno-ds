'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { StatusDot, statusDotStyle } from './StatusDot';

/**
 * Status pill for the booking lifecycle and other short labels.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone. Same five tones across Badge, Alert and Toast. */
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  /** Leading status dot. Keep it on for lifecycle states. */
  dot?: boolean;
  /**
   * A soft ring pulses out of the dot, for a state that is live ("Open now", "Online"). Only
   * with `dot`. Off by default: use it on one or two badges, never on a list. It does not show
   * when the user asks for reduced motion.
   */
  pulse?: boolean;
  children?: React.ReactNode;
}

// The dot's own color comes from `StatusDot`, so the two cannot drift apart.
const TONES: Record<NonNullable<BadgeProps['tone']>, [string, string]> = {
  success: ['--status-success-bg', '--status-success-fg'],
  warning: ['--status-warning-bg', '--status-warning-fg'],
  error: ['--status-error-bg', '--status-error-fg'],
  info: ['--status-info-bg', '--status-info-fg'],
  // Neutral = an outlined chip (surface fill + hairline border, added below) so it
  // reads on any background, including a tinted one.
  neutral: ['--bg-surface', '--text-secondary'],
};

export function Badge({ tone = 'neutral', size = 'md', dot = true, pulse = false, children, style, ...rest }: BadgeProps) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
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
        // The neutral fill can match a tinted surface it sits on - a hairline
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
      {dot &&
        (pulse ? (
          <StatusDot tone={tone} size={sm ? 'sm' : 'md'} pulse />
        ) : (
          <span style={statusDotStyle(tone, sm ? 'sm' : 'md')} />
        ))}
      {children}
    </span>
  );
}