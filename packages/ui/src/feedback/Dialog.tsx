'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { sx } from '../_internal/style';

/**
 * Modal (desktop), bottom sheet (mobile) or full-screen. Portalled to `<body>`
 * and fixed to the viewport, so no ancestor's `overflow`/`transform`/positioning
 * can trap it. While open it locks page scroll and closes on `Escape`. Host needs
 * the `sereno-pop` / `sereno-slide-up` keyframes (see globals.css).
 */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: string;
  description?: string;
  /** Action buttons, right-aligned. */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** `sheet` slides up from the bottom (mobile default); `fullscreen` fills the viewport. */
  variant?: 'center' | 'sheet' | 'fullscreen';
  /** Max width of the centered modal. Ignored for `sheet` / `fullscreen`. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hairline rules between header / body / footer, MUI-style. The body scrolls on its own. */
  dividers?: boolean;
  /** Show an ✕ in the header. Defaults to `true` for `fullscreen`, `false` otherwise. Needs `onClose`. */
  showClose?: boolean;
  /** Explicit pixel width — overrides `size`. */
  width?: number;
  children?: React.ReactNode;
}

const SIZE_W = { sm: 440, md: 600, lg: 800, xl: 1000 } as const;

export function Dialog({
  open = true,
  title,
  description,
  children,
  footer,
  onClose,
  variant = 'center',
  size = 'sm',
  dividers = false,
  showClose,
  width,
  style,
  ...rest
}: DialogProps) {
  const sheet = variant === 'sheet';
  const full = variant === 'fullscreen';
  const showX = (showClose ?? full) && !!onClose;
  const rid = React.useId();
  const titleId = title ? `${rid}-title` : undefined;

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

  const pad = 'var(--space-5)';
  const hairline = 'var(--border-width-hairline) solid var(--border-default)';
  const hasHeader = !!(title || description || showX);

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
        padding: sheet || full ? 0 : 'var(--space-5)',
      })}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={titleId ? undefined : title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        {...rest}
        style={sx({
          width: full || sheet ? '100%' : 'min(100%,' + (width ?? SIZE_W[size]) + 'px)',
          height: full ? '100%' : undefined,
          maxHeight: full ? undefined : sheet ? '90dvh' : 'calc(100dvh - var(--space-6))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          outline: 'none',
          background: 'var(--bg-surface)',
          borderRadius: full ? 0 : sheet ? 'var(--radius-sheet) var(--radius-sheet) 0 0' : 'var(--radius-lg)',
          border: full ? 'none' : hairline,
          boxShadow: full ? 'none' : sheet ? 'var(--shadow-sheet)' : 'var(--shadow-lg)',
          animation: sheet ? 'sereno-slide-up var(--duration-sheet) var(--ease-gentle)' : 'sereno-pop var(--duration-normal) var(--ease-out)',
          ...style,
        })}
      >
        {sheet && (
          <span
            aria-hidden
            style={sx({ width: 36, height: 4, borderRadius: '999px', background: 'var(--border-strong)', alignSelf: 'center', marginTop: 'var(--space-2)', flex: '0 0 auto' })}
          />
        )}

        {hasHeader && (
          <div
            style={sx({
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: dividers ? pad : `${pad} ${pad} var(--space-3)`,
              borderBottom: dividers ? hairline : undefined,
            })}
          >
            <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' })}>
              {title && (
                <h3
                  id={titleId}
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
            {showX && (
              <button
                type="button"
                className="sereno-dialog-close"
                aria-label="Fechar"
                onClick={onClose}
                style={sx({
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  margin: '-4px -4px 0 0',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                })}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            )}
          </div>
        )}

        <div
          style={sx({
            flex: full ? '1 1 auto' : '0 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            padding: dividers
              ? pad
              : hasHeader
                ? `0 ${pad} ${footer ? 'var(--space-3)' : pad}`
                : pad,
          })}
        >
          {children}
        </div>

        {footer && (
          <div
            style={sx({
              flex: '0 0 auto',
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              padding: dividers ? pad : `0 ${pad} ${pad}`,
              borderTop: dividers ? hairline : undefined,
            })}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
