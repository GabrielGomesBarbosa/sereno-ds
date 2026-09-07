'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { sx } from '../_internal/style';

/**
 * Modal (desktop) or bottom sheet (mobile). Portalled to `<body>` and fixed to
 * the viewport, so no ancestor's `overflow`/`transform`/positioning can trap it.
 * While open it locks page scroll and closes on `Escape`. Host needs the
 * `sereno-pop` / `sereno-slide-up` keyframes (see globals.css).
 */
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
  const sheet = variant === 'sheet';

  // Portal target is client-only.
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);

  // While open: lock page scroll and bind Escape to close. `onClose` is read
  // through a ref so the lock effect only re-runs when `open` flips.
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  });
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = { h: root.style.overflow, b: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev.h;
      document.body.style.overflow = prev.b;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Pull focus into the dialog when it opens.
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open && mounted) panelRef.current?.focus();
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      style={sx({
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        {...rest}
        style={sx({
          width: sheet ? '100%' : 'min(100%,' + width + 'px)',
          maxHeight: sheet ? '90dvh' : 'calc(100dvh - var(--space-6))',
          overflowY: 'auto',
          outline: 'none',
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
    </div>,
    document.body,
  );
}
