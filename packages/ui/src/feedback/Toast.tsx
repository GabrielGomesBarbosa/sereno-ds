'use client';

import * as React from 'react';
import { X } from 'lucide-react';
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
  /**
   * Auto-dismiss countdown bar along the bottom edge. `ms` is the full duration;
   * `paused` freezes it. `ToastProvider` wires this — you rarely set it by hand.
   */
  progress?: { ms: number; paused?: boolean };
}

const TONES: Record<NonNullable<ToastProps['tone']>, [string, string]> = {
  success: ['--status-success-bg', '--status-success-fg'],
  warning: ['--status-warning-bg', '--status-warning-fg'],
  error: ['--status-error-bg', '--status-error-fg'],
  info: ['--status-info-bg', '--status-info-fg'],
  neutral: ['--bg-inverse', '--text-inverse'],
};

export function Toast({ tone = 'neutral', title, description, icon, action, onClose, progress, style, ...rest }: ToastProps) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return (
    <div
      role="status"
      {...rest}
      style={sx({
        position: 'relative',
        display: 'flex',
        gap: 'var(--space-3)',
        // Single-line toasts read better vertically centred; with a description
        // the row items align to the first line instead.
        alignItems: description ? 'flex-start' : 'center',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: 'var(' + bg + ')',
        color: 'var(' + fg + ')',
        boxShadow: 'var(--shadow-lg)',
        border: 'var(--border-width-hairline) solid ' + (tone === 'neutral' ? 'transparent' : 'color-mix(in srgb,currentColor 18%,transparent)'),
        maxWidth: 420,
        overflow: progress ? 'hidden' : undefined,
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
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="sereno-dismiss"
          style={sx({
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            margin: '-3px -6px 0 0',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'currentColor',
            opacity: 0.6,
            cursor: 'pointer',
          })}
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
      {progress && progress.ms > 0 && Number.isFinite(progress.ms) && (
        <span
          aria-hidden
          className="sereno-toast-bar"
          data-paused={progress.paused ? 'true' : undefined}
          style={sx({ animationDuration: progress.ms + 'ms' })}
        />
      )}
    </div>
  );
}