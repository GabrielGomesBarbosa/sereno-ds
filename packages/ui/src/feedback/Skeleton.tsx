'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Loading placeholder that holds the shape of content still being fetched.
 * Host must include the `sereno-pulse` keyframes (see globals.css).
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `text` = stacked lines (last one short). `card` = avatar + three lines + trailing
   * pill — a typical list-row card. `avatar` = single circle sized to
   * `Avatar`. `block` = one rectangle for images, charts, calendars.
   */
  variant?: 'text' | 'card' | 'avatar' | 'block';
  /** Line count for `variant="text"`. Default 3. */
  lines?: number;
  /** Overrides the per-variant default width (any CSS length). */
  width?: number | string;
  /** Overrides the per-variant default height (any CSS length). */
  height?: number | string;
}

const BASE = { background: 'var(--bg-subtle)', animation: 'sereno-pulse 1.6s var(--ease-gentle) infinite' };

function Bar({ w, h, r }: { w: number | string; h: number | string; r: string }) {
  return <span aria-hidden="true" style={sx({ ...BASE, display: 'block', width: w, height: h, borderRadius: r, flex: '0 0 auto' })} />;
}

export function Skeleton({ variant = 'text', lines = 3, width, height, style, ...rest }: SkeletonProps) {
  if (variant === 'avatar')
    return (
      <span {...rest} style={sx({ display: 'inline-flex', ...style })}>
        <Bar w={width || 44} h={height || 44} r="var(--radius-pill)" />
      </span>
    );
  if (variant === 'block')
    return (
      <span {...rest} style={sx({ display: 'flex', ...style })}>
        <Bar w={width || '100%'} h={height || 120} r="var(--radius-md)" />
      </span>
    );
  if (variant === 'card')
    return (
      <div
        {...rest}
        style={sx({
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'flex-start',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-surface)',
          border: 'var(--border-width-hairline) solid var(--border-default)',
          ...style,
        })}
      >
        <Bar w={44} h={44} r="var(--radius-pill)" />
        <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' })}>
          <Bar w="52%" h={13} r="var(--radius-sm)" />
          <Bar w="80%" h={11} r="var(--radius-sm)" />
          <Bar w="34%" h={11} r="var(--radius-sm)" />
        </div>
        <Bar w={72} h={24} r="var(--radius-pill)" />
      </div>
    );
  return (
    <div {...rest} style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style })}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} w={width || (i === lines - 1 ? '60%' : '100%')} h={height || 12} r="var(--radius-sm)" />
      ))}
    </div>
  );
}