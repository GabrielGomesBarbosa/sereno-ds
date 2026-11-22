'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Primary action control. `primary` for navigation-level commitment, `accent` for the single
 * conversion action on a view. `success` / `warning` / `error` are the semantic fills, using the
 * same words as Badge / Alert / Toast. (No `info` - in Sereno that is the brand indigo = `primary`.)
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual role. Only one `accent` button per screen. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'error';
  /** Control height. `lg`/`xl` are the mobile defaults (≥44px tap target). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const SIZES = {
  sm: { h: 'var(--control-height-sm)', px: 'var(--space-3)', fs: 'var(--text-sm)', gap: '6px' },
  md: { h: 'var(--control-height-md)', px: 'var(--space-4)', fs: 'var(--text-base)', gap: '8px' },
  lg: { h: 'var(--control-height-lg)', px: 'var(--space-5)', fs: 'var(--text-md)', gap: '10px' },
  xl: { h: 'var(--control-height-xl)', px: 'var(--space-6)', fs: 'var(--text-lg)', gap: '10px' },
} as const;

/**
 * What a variant looks like in each state, as the custom properties `.sereno-btn` (styles.css) reads:
 * the base, then only what differs on `:hover`, `:active` (pressed) and `:focus-visible` (SS-577). The
 * browser switches between them, so a button holds no hover / press / focus state and does not re-render when
 * the pointer crosses it. A property left out falls back to the one before it in the CSS.
 */
function stateVars(variant: NonNullable<ButtonProps['variant']>): Record<string, string> {
  switch (variant) {
    case 'accent':
      return { '--sd-bg': 'var(--interactive-accent)', '--sd-bg-hover': 'var(--interactive-accent-hover)', '--sd-bg-active': 'var(--interactive-accent-active)', '--sd-fg': 'var(--interactive-accent-fg)', '--sd-bd': 'transparent', '--sd-sh': 'var(--shadow-xs)', '--sd-sh-hover': 'var(--shadow-accent)', '--sd-ring': 'var(--focus-ring-accent)' };
    case 'secondary':
      return { '--sd-bg': 'var(--interactive-secondary)', '--sd-bg-hover': 'var(--interactive-secondary-hover)', '--sd-bg-active': 'var(--interactive-secondary-active)', '--sd-fg': 'var(--interactive-secondary-fg)', '--sd-bd': 'var(--border-default)', '--sd-sh': 'var(--shadow-xs)' };
    case 'ghost':
      return { '--sd-bg': 'transparent', '--sd-bg-hover': 'var(--interactive-ghost-hover)', '--sd-fg': 'var(--text-secondary)', '--sd-bd': 'transparent', '--sd-sh': 'none' };
    case 'success':
      return { '--sd-bg': 'var(--interactive-success)', '--sd-bg-hover': 'var(--interactive-success-hover)', '--sd-fg': 'var(--interactive-success-fg)', '--sd-bd': 'transparent', '--sd-sh': 'var(--shadow-xs)' };
    case 'warning':
      return { '--sd-bg': 'var(--interactive-warning)', '--sd-bg-hover': 'var(--interactive-warning-hover)', '--sd-fg': 'var(--interactive-warning-fg)', '--sd-bd': 'transparent', '--sd-sh': 'var(--shadow-xs)' };
    case 'error':
      return { '--sd-bg': 'var(--interactive-error)', '--sd-bg-hover': 'var(--interactive-error-hover)', '--sd-fg': 'var(--interactive-error-fg)', '--sd-bd': 'transparent', '--sd-sh': 'var(--shadow-xs)' };
    case 'link':
      return { '--sd-bg': 'transparent', '--sd-fg': 'var(--text-link)', '--sd-fg-hover': 'var(--text-link-hover)', '--sd-bd': 'transparent', '--sd-sh': 'none', '--sd-deco-hover': 'underline' };
    default:
      return { '--sd-bg': 'var(--interactive-primary)', '--sd-bg-hover': 'var(--interactive-primary-hover)', '--sd-bg-active': 'var(--interactive-primary-active)', '--sd-fg': 'var(--interactive-primary-fg)', '--sd-bd': 'transparent', '--sd-sh': 'var(--shadow-xs)', '--sd-sh-hover': 'var(--shadow-brand)' };
  }
}

/** A disabled control: one look, no hover, no press, no ring (the CSS rules exclude `:disabled`). */
const DISABLED_VARS = { '--sd-bg': 'var(--interactive-disabled-bg)', '--sd-fg': 'var(--interactive-disabled-fg)', '--sd-bd': 'transparent', '--sd-sh': 'none' };

export function Button({ variant = 'primary', size = 'md', fullWidth = false, disabled = false, loading = false, iconLeft, iconRight, children, className, style, ...rest }: ButtonProps) {
  const sz = SIZES[size] || SIZES.md;
  const isLink = variant === 'link';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      {...rest}
      className={['sereno-btn', className].filter(Boolean).join(' ')}
      style={sx({
        ...(disabled ? DISABLED_VARS : stateVars(variant)),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        height: isLink ? 'auto' : sz.h,
        padding: isLink ? 0 : '0 ' + sz.px,
        width: fullWidth ? '100%' : undefined,
        fontFamily: 'var(--font-body)',
        fontSize: sz.fs,
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-snug)',
        borderRadius: isLink ? 'var(--radius-xs)' : 'var(--radius-control)',
        borderWidth: 'var(--border-width-hairline)',
        borderStyle: 'solid',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.75 : 1,
        transition: 'var(--transition-control)',
        textUnderlineOffset: '2px',
        ...style,
      })}
    >
      {loading ? (
        <span style={sx({ width: '1em', height: '1em', borderRadius: '999px', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'sereno-spin .7s linear infinite' })} />
      ) : (
        iconLeft
      )}
      {children}
      {iconRight}
    </button>
  );
}