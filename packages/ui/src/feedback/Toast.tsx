'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Transient confirmation of a completed action. One line of title, optional detail. */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Semantic tone (same five as Badge / Alert). `neutral` is the plain dark toast. */
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
}

const TONES: Record<NonNullable<ToastProps['tone']>, [string, string]> = {
  success: ['--status-success-bg', '--status-success-fg'],
  warning: ['--status-warning-bg', '--status-warning-fg'],
  error: ['--status-error-bg', '--status-error-fg'],
  info: ['--status-info-bg', '--status-info-fg'],
  neutral: ['--bg-inverse', '--text-inverse'],
};

export function Toast({ tone = 'neutral', title, description, icon, action, onClose, style, ...rest }: ToastProps) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return (
    <div
      role="status"
      {...rest}
      style={sx({
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: 'var(' + bg + ')',
        color: 'var(' + fg + ')',
        boxShadow: 'var(--shadow-lg)',
        border: 'var(--border-width-hairline) solid ' + (tone === 'neutral' ? 'transparent' : 'color-mix(in srgb,currentColor 18%,transparent)'),
        maxWidth: 420,
        animation: 'sereno-slide-up var(--duration-normal) var(--ease-out)',
        ...style,
      })}
    >
      {icon && <span style={sx({ display: 'flex', flex: '0 0 auto', marginTop: 1 })}>{icon}</span>}
      <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 })}>
        <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' })}>{title}</span>
        {description && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', opacity: 0.85, lineHeight: 1.45 })}>{description}</span>}
      </div>
      {action}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={sx({ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.6, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 })}
        >
          ×
        </button>
      )}
    </div>
  );
}