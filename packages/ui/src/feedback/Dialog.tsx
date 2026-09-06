'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Modal (desktop) or bottom sheet (mobile). Host needs `sereno-pop` / `sereno-slide-up` keyframes (see globals.css). */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: string;
  description?: string;
  /** Action buttons, right-aligned. */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** `sheet` slides up from the bottom — the mobile default. */
  variant?: 'center' | 'sheet';
  width?: number;
  children?: React.ReactNode;
}

export function Dialog({ open = true, title, description, children, footer, onClose, variant = 'center', width = 440, style, ...rest }: DialogProps) {
  if (!open) return null;
  const sheet = variant === 'sheet';
  return (
    <div
      style={sx({
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: sheet ? 'flex-end' : 'center',
        justifyContent: 'center',
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(2px)',
        padding: sheet ? 0 : 'var(--space-5)',
      })}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        {...rest}
        style={sx({
          width: sheet ? '100%' : 'min(100%,' + width + 'px)',
          background: 'var(--bg-surface)',
          borderRadius: sheet ? 'var(--radius-sheet) var(--radius-sheet) 0 0' : 'var(--radius-lg)',
          border: 'var(--border-width-hairline) solid var(--border-default)',
          boxShadow: sheet ? 'var(--shadow-sheet)' : 'var(--shadow-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          animation: sheet ? 'sereno-slide-up var(--duration-sheet) var(--ease-gentle)' : 'sereno-pop var(--duration-normal) var(--ease-out)',
          ...style,
        })}
      >
        {sheet && <span style={sx({ width: 36, height: 4, borderRadius: '999px', background: 'var(--border-strong)', alignSelf: 'center', marginTop: -6 })} />}
        {(title || description) && (
          <div style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' })}>
            {title && (
              <h3
                style={sx({
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-bold)',
                  letterSpacing: 'var(--tracking-tight)',
                  color: 'var(--text-primary)',
                  margin: 0,
                })}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                style={sx({
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-normal)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                })}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
        {footer && <div style={sx({ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', flexWrap: 'wrap' })}>{footer}</div>}
      </div>
    </div>
  );
}