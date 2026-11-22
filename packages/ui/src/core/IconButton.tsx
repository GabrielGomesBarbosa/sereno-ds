'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Square icon-only control for toolbars, card corners and top bars. Always pass `label`.
 * `success` / `warning` / `error` are solid semantic fills - same words as Button / Badge.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'secondary' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  /** Accessible name - becomes aria-label and title. Required. */
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

export function IconButton({ variant = 'ghost', size = 'md', label, disabled = false, children, className, style, ...rest }: IconButtonProps) {
  const d = S[size] || S.md;
  const solid = SOLID[variant];
  const outline = variant === 'secondary';

  // The values of each state, for `.sereno-btn` (styles.css) to switch between on :hover / :active / :focus-visible
  // (SS-577). Only a press scale and a focus ring are common to all; the rest is per variant.
  let vars: Record<string, string>;
  if (disabled) {
    vars = { '--sd-bg': 'var(--interactive-disabled-bg)', '--sd-fg': 'var(--interactive-disabled-fg)' };
  } else if (solid) {
    vars = { '--sd-bg': `var(${solid[0]})`, '--sd-bg-hover': `var(${solid[1]})`, '--sd-fg': `var(${solid[2]})` };
  } else if (outline) {
    vars = { '--sd-bg': 'var(--interactive-secondary)', '--sd-bg-hover': 'var(--interactive-secondary-hover)', '--sd-fg': 'var(--text-secondary)' };
  } else {
    vars = { '--sd-bg': 'transparent', '--sd-bg-hover': 'var(--interactive-ghost-hover)', '--sd-fg': 'var(--text-secondary)' };
  }
  vars['--sd-bd'] = outline ? 'var(--border-default)' : 'transparent';
  vars['--sd-sh'] = 'none';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      {...rest}
      className={['sereno-btn', className].filter(Boolean).join(' ')}
      style={sx({
        ...vars,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: d,
        height: d,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-control)',
        borderWidth: 'var(--border-width-hairline)',
        borderStyle: 'solid',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)',
        ...style,
      })}
    >
      {children}
    </button>
  );
}
