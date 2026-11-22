'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { sx } from '../../_internal/style';

export function SubmenuPopover({
  anchorRef,
  label,
  icon,
  children,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; caret: number | null } | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const p = el.getBoundingClientRect();
    let left = a.right + 10;
    let onRight = true;
    if (left + p.width > window.innerWidth - 8) {
      left = Math.max(8, a.left - p.width - 10);
      onRight = false;
    }
    let top = a.top - 4;
    if (top + p.height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - 8 - p.height);
    const caret = onRight ? a.top + a.height / 2 - top : null;
    setPos({ top, left, caret });
  }, [anchorRef]);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !anchorRef.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={sx({
        position: 'fixed',
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        minWidth: 196,
        maxWidth: 264,
        padding: 5,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 0 0 1px var(--border-default), var(--shadow-lg)',
        zIndex: 1000,
        animation: 'sereno-flyout-in var(--duration-fast) var(--ease-out)',
      })}
    >
      {pos?.caret != null && (
        <span
          aria-hidden
          style={sx({
            position: 'absolute',
            left: -4,
            top: pos.caret,
            width: 8,
            height: 8,
            background: 'var(--bg-surface)',
            borderLeft: 'var(--border-width-hairline) solid var(--border-default)',
            borderBottom: 'var(--border-width-hairline) solid var(--border-default)',
            transform: 'translateY(-50%) rotate(45deg)',
            borderBottomLeftRadius: 2,
          })}
        />
      )}

      <div
        style={sx({
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '5px 8px 8px',
          marginBottom: 4,
          borderBottom: 'var(--border-width-hairline) solid var(--border-subtle)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-primary)',
        })}
      >
        {icon && (
          <span
            style={sx({ flex: '0 0 auto', display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' })}
          >
            {icon}
          </span>
        )}
        <span style={sx({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{label}</span>
      </div>

      <div style={sx({ display: 'flex', flexDirection: 'column', gap: 1 })}>{children}</div>
    </div>,
    document.body,
  );
}
