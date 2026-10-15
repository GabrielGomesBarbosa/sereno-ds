'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Skeleton } from '../feedback/Skeleton';
import { Card } from './Card';
import { Typography } from './Typography';

export type StatCardTone = 'default' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

/**
 * A figure on a dashboard: a small label, the number big, one line of context under it, and
 * optionally a thin bar for "how full" (the day's grid, a quota). Built on `Card`, `Typography`
 * and `Skeleton`, so it looks like the rest and follows the theme with no color of its own.
 */
export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The small line above the number: what is being counted. */
  label: string;
  /** The number, or a short text. Any node, so a formatted price or a `Badge` fits. Shown large, in tabular figures. */
  value: React.ReactNode;
  /** One line of context under the number ("3 confirmados"). */
  hint?: string;
  /**
   * `default` is the plain card. `neutral` is a quieter one (a tinted fill, no shadow) for figures
   * that are background. `success`, `warning`, `error` and `info` are the status tones (the same
   * names `Badge`, `Alert` and `Toast` use): the card gets a ring in the tone's color and the
   * label and number take its text color.
   */
  tone?: StatCardTone;
  /**
   * A thin bar under the number. `percent` is 0 to 100 (anything outside is held to it).
   * `label` names the bar for a screen reader; without it the bar takes the card's `label`.
   */
  progress?: { percent: number; label?: string };
  /**
   * The data has not arrived: the label, the number and the hint become placeholders that take
   * the same room as the real text, so nothing jumps when it arrives. It mirrors the props you
   * pass, so give `hint` and `progress` while loading too if the loaded card will have them.
   */
  loading?: boolean;
}

type StatusTone = 'success' | 'warning' | 'error' | 'info';

// `fg` is the text color of the tone and also the bar fill (the `dot` color is a hair under 3:1
// against the track in the light theme); `edge` is the ring.
const STATUS: Record<StatusTone, { fg: string; edge: string }> = {
  success: { fg: '--status-success-fg', edge: '--status-success-dot' },
  warning: { fg: '--status-warning-fg', edge: '--status-warning-dot' },
  error: { fg: '--status-error-fg', edge: '--status-error-dot' },
  info: { fg: '--status-info-fg', edge: '--status-info-dot' },
};

// The height of each line, held by the loaded text and by its placeholder alike: the font size
// times the line height, from the same tokens the text is set in, so the two are the same height
// whatever the font's metrics (the number is `--text-3xl` at a 1.1 line height, set below).
const LABEL_H = 'calc(var(--text-2xs) * var(--leading-normal))';
const VALUE_H = 'calc(var(--text-3xl) * 1.1)';
const HINT_H = 'calc(var(--text-xs) * var(--leading-normal))';

const row = (minHeight: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', minWidth: 0, minHeight });

export function StatCard({ label, value, hint, tone = 'default', progress, loading = false, style, ...rest }: StatCardProps) {
  const status = tone in STATUS ? STATUS[tone as StatusTone] : null;
  const neutral = tone === 'neutral';
  const toneColor = status ? { color: 'var(' + status.fg + ')' } : undefined;
  const pct = progress && Number.isFinite(progress.percent) ? Math.min(100, Math.max(0, progress.percent)) : 0;

  return (
    <Card
      padding="md"
      elevation={neutral ? 'none' : 'sm'}
      aria-busy={loading || undefined}
      {...rest}
      style={sx({
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        minWidth: 0,
        ...(neutral ? { background: 'var(--bg-subtle)', boxShadow: '0 0 0 1px var(--border-default)' } : null),
        ...(status ? { boxShadow: '0 0 0 1px var(' + status.edge + '), var(--shadow-xs)' } : null),
        ...style,
      })}
    >
      <div style={row(LABEL_H)}>
        {loading ? (
          <Skeleton variant="block" height={10} style={{ width: '45%' }} />
        ) : (
          <Typography as="span" variant="eyebrow" color={neutral ? 'secondary' : undefined} style={toneColor}>
            {label}
          </Typography>
        )}
      </div>

      <div style={row(VALUE_H)}>
        {loading ? (
          <Skeleton variant="block" height={26} style={{ width: '40%' }} />
        ) : (
          <Typography as="span" variant="h1" numeric style={{ fontWeight: 'var(--weight-extrabold)', lineHeight: 1.1, ...toneColor }}>
            {value}
          </Typography>
        )}
      </div>

      {progress ? (
        loading ? (
          <Skeleton variant="block" height={6} style={{ marginTop: 'var(--space-1)' }} />
        ) : (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={progress.label ?? label}
            style={sx({
              marginTop: 'var(--space-1)',
              height: 6,
              width: '100%',
              overflow: 'hidden',
              borderRadius: 'var(--radius-pill)',
              background: neutral ? 'var(--bg-surface)' : 'var(--border-subtle)',
            })}
          >
            <div
              style={sx({
                height: '100%',
                width: pct + '%',
                borderRadius: 'var(--radius-pill)',
                background: status ? 'var(' + status.fg + ')' : 'var(--interactive-primary)',
                transition: 'width var(--duration-normal) var(--ease-standard)',
              })}
            />
          </div>
        )
      ) : null}

      {hint ? (
        <div style={row(HINT_H)}>
          {loading ? (
            <Skeleton variant="block" height={11} style={{ width: '70%' }} />
          ) : (
            <Typography as="span" variant="caption" color="secondary">
              {hint}
            </Typography>
          )}
        </div>
      ) : null}
    </Card>
  );
}
