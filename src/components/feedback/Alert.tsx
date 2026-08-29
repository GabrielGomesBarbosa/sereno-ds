'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Persistent in-page notice — stays until the user dismisses it or the underlying
 * condition is resolved. Sits in the content flow (never floating, no shadow),
 * unlike `Toast`, which is transient and self-dismissing.
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Semantic tone (same five as Badge / Toast). `info` = neutral heads-up.
   * `success` = something went right. `warning` = something needs doing.
   * `error` = something is broken or blocked.
   */
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  /** Body copy, passed as children. */
  children?: React.ReactNode;
  /** Leading glyph — a Lucide icon matching the tone. */
  icon?: React.ReactNode;
  /** Inline action(s), rendered under the body. Use `Button size="sm"`. */
  action?: React.ReactNode;
  /** When provided, renders the × dismiss control. Omit for conditions the user cannot dismiss. */
  onDismiss?: () => void;
}

const TONES: Record<NonNullable<AlertProps['tone']>, [string, string]> = {
  info: ['--status-info-bg', '--status-info-fg'],
  success: ['--status-success-bg', '--status-success-fg'],
  warning: ['--status-warning-bg', '--status-warning-fg'],
  error: ['--status-error-bg', '--status-error-fg'],
};

export function Alert({ tone = 'info', title, children, icon, action, onDismiss, style, ...rest }: AlertProps) {
  const [bg, fg] = TONES[tone] || TONES.info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...rest}
      style={sx({
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-card)',
        background: 'var(' + bg + ')',
        color: 'var(' + fg + ')',
        border: 'var(--border-width-hairline) solid color-mix(in srgb,currentColor 20%,transparent)',
        ...style,
      })}
    >
      {icon && <span style={sx({ display: 'flex', flex: '0 0 auto', marginTop: 1 })}>{icon}</span>}
      <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 })}>
        {title && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' })}>{title}</span>}
        {children && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', lineHeight: 1.5, opacity: 0.9 })}>{children}</span>}
        {action && <span style={sx({ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' })}>{action}</span>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dispensar"
          style={sx({ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.6, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flex: '0 0 auto' })}
        >
          ×
        </button>
      )}
    </div>
  );
}