'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { useInteract } from './Button';

/**
 * Square icon-only control for toolbars, card corners and top bars. Always pass `label`.
 * `success` / `warning` / `error` are solid semantic fills — same words as Button / Badge.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'secondary' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  /** Accessible name — becomes aria-label and title. Required. */
  label: string;
  disabled?: boolean;
  /** The icon element (Lucide 20px stroke 1.75). */
  children?: React.ReactNode;
}

const S = { sm: 32, md: 40, lg: 48 } as const;

/** Solid-fill variants: [base, hover, fg]. */
const SOLID: Partial<Record<NonNullable<IconButtonProps['variant']>, [string, string, string]>> = {
  primary: ['--interactive-primary', '--interactive-primary-hover', '--interactive-primary-fg'],
  success: ['--interactive-success', '--interactive-success-hover', '--interactive-success-fg'],
  warning: ['--interactive-warning', '--interactive-warning-hover', '--interactive-warning-fg'],
  error: ['--interactive-error', '--interactive-error-hover', '--interactive-error-fg'],
};

export function IconButton({ variant = 'ghost', size = 'md', label, disabled = false, children, style, ...rest }: IconButtonProps) {
  const st = useInteract(disabled);
  const d = S[size] || S.md;
  const solid = SOLID[variant];
  const outline = variant === 'secondary';

  let background = 'transparent';
  let color = 'var(--text-secondary)';
  if (disabled) {
    background = 'var(--interactive-disabled-bg)';
    color = 'var(--interactive-disabled-fg)';
  } else if (solid) {
    background = `var(${st.hover ? solid[1] : solid[0]})`;
    color = `var(${solid[2]})`;
  } else if (outline) {
    background = st.hover ? 'var(--interactive-secondary-hover)' : 'var(--interactive-secondary)';
  } else if (st.hover) {
    background = 'var(--interactive-ghost-hover)';
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      {...st.handlers}
      {...rest}
      style={sx({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: d,
        height: d,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-control)',
        border: 'var(--border-width-hairline) solid ' + (outline ? 'var(--border-default)' : 'transparent'),
        background,
        color,
        boxShadow: st.focus ? 'var(--focus-ring)' : 'none',
        transform: st.press && !disabled ? 'scale(var(--press-scale))' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)',
        outline: 'none',
        ...style,
      })}
    >
      {children}
    </button>
  );
}
