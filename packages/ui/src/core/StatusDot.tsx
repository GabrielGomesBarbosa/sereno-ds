'use client';

import * as React from 'react';
import type { CSSProperties } from 'react';
import { sx } from '../_internal/style';

export type StatusDotTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type StatusDotSize = 'sm' | 'md';

/**
 * A small colored dot for a state ("Open now", "Online"), optionally with a soft ring that
 * pulses outward for a state that is live. The same dot `Badge` draws before its label, as its
 * own piece for the places that have no pill around it (next to a name, on a list row).
 *
 * The dot says nothing to a screen reader by itself: put the meaning in the text next to it, or
 * give it a `label` and it becomes an image with that name.
 */
export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The same words `Badge`, `Alert` and `Toast` use. */
  tone?: StatusDotTone;
  /** `sm` (5px) and `md` (6px) are the two dot sizes of `Badge`. */
  size?: StatusDotSize;
  /**
   * A translucent ring that grows and fades around the dot, over and over. For a live state
   * (open now, online), not for decoration: use it on one or two dots, never on a list. It does
   * not show when the user asks for reduced motion.
   */
  pulse?: boolean;
  /** What a screen reader says for the dot. Without it the dot is decorative. */
  label?: string;
}

const TONE_VAR: Record<StatusDotTone, string> = {
  success: '--status-success-dot',
  warning: '--status-warning-dot',
  error: '--status-error-dot',
  info: '--status-info-dot',
  neutral: '--text-muted',
};

const SIZE_PX: Record<StatusDotSize, number> = { sm: 5, md: 6 };

function color(tone: StatusDotTone): string {
  return 'var(' + (TONE_VAR[tone] || TONE_VAR.neutral) + ')';
}

/**
 * The look of a plain dot, in the form `Badge` has always drawn it. A function so `Badge` and
 * `StatusDot` cannot drift apart. It sets no `display`: the dot is a flex item inside a `Badge`,
 * and `StatusDot` adds its own.
 */
export function statusDotStyle(tone: StatusDotTone = 'neutral', size: StatusDotSize = 'md'): CSSProperties {
  const px = SIZE_PX[size] ?? SIZE_PX.md;
  return { width: px, height: px, borderRadius: '999px', background: color(tone), flex: '0 0 auto' };
}

export function StatusDot({ tone = 'neutral', size = 'md', pulse = false, label, style, ...rest }: StatusDotProps) {
  const px = SIZE_PX[size] ?? SIZE_PX.md;
  const named = label ? ({ role: 'img', 'aria-label': label } as const) : null;

  if (!pulse) return <span {...rest} {...named} style={sx({ ...statusDotStyle(tone, size), display: 'inline-block', ...style })} />;

  return (
    <span {...rest} {...named} style={sx({ position: 'relative', display: 'inline-flex', width: px, height: px, flex: '0 0 auto', ...style })}>
      {/* the ring: invisible at rest, so nothing shows where the animation does not run */}
      <span className="sereno-status-ping" style={sx({ position: 'absolute', inset: 0, borderRadius: '999px', background: color(tone), opacity: 0 })} />
      <span style={sx({ position: 'relative', width: px, height: px, borderRadius: '999px', background: color(tone) })} />
    </span>
  );
}
