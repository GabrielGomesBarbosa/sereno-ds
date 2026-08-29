'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Primary action control. `primary` for navigation-level commitment, `accent` for the single
 * conversion action on a view. `success` / `warning` / `error` are the semantic fills, using the
 * same words as Badge / Alert / Toast. (No `info` — in Sereno that is the brand indigo = `primary`.)
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

export interface InteractState {
  hover: boolean;
  press: boolean;
  focus: boolean;
  handlers: React.HTMLAttributes<HTMLElement>;
}

/** Shared hover / press / focus-visible tracking used by Button, IconButton and Card. */
export function useInteract(disabled: boolean): InteractState {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const handlers: React.HTMLAttributes<HTMLElement> = disabled
    ? {}
    : {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => {
          setHover(false);
          setPress(false);
        },
        onMouseDown: () => setPress(true),
        onMouseUp: () => setPress(false),
        onFocus: (e) => {
          if ((e.target as HTMLElement).matches(':focus-visible')) setFocus(true);
        },
        onBlur: () => setFocus(false),
      };
  return { hover, press, focus, handlers };
}

const SIZES = {
  sm: { h: 'var(--control-height-sm)', px: 'var(--space-3)', fs: 'var(--text-sm)', gap: '6px' },
  md: { h: 'var(--control-height-md)', px: 'var(--space-4)', fs: 'var(--text-base)', gap: '8px' },
  lg: { h: 'var(--control-height-lg)', px: 'var(--space-5)', fs: 'var(--text-md)', gap: '10px' },
  xl: { h: 'var(--control-height-xl)', px: 'var(--space-6)', fs: 'var(--text-lg)', gap: '10px' },
} as const;

function palette(variant: NonNullable<ButtonProps['variant']>, s: InteractState) {
  switch (variant) {
    case 'accent':
      return { bg: s.press ? 'var(--interactive-accent-active)' : s.hover ? 'var(--interactive-accent-hover)' : 'var(--interactive-accent)', fg: 'var(--interactive-accent-fg)', bd: 'transparent', sh: s.hover && !s.press ? 'var(--shadow-accent)' : 'var(--shadow-xs)', ring: 'var(--focus-ring-accent)' };
    case 'secondary':
      return { bg: s.press ? 'var(--interactive-secondary-active)' : s.hover ? 'var(--interactive-secondary-hover)' : 'var(--interactive-secondary)', fg: 'var(--interactive-secondary-fg)', bd: 'var(--border-default)', sh: 'var(--shadow-xs)', ring: 'var(--focus-ring)' };
    case 'ghost':
      return { bg: s.hover ? 'var(--interactive-ghost-hover)' : 'transparent', fg: 'var(--text-secondary)', bd: 'transparent', sh: 'none', ring: 'var(--focus-ring)' };
    case 'success':
      return { bg: s.hover ? 'var(--interactive-success-hover)' : 'var(--interactive-success)', fg: 'var(--interactive-success-fg)', bd: 'transparent', sh: 'var(--shadow-xs)', ring: 'var(--focus-ring)' };
    case 'warning':
      return { bg: s.hover ? 'var(--interactive-warning-hover)' : 'var(--interactive-warning)', fg: 'var(--interactive-warning-fg)', bd: 'transparent', sh: 'var(--shadow-xs)', ring: 'var(--focus-ring)' };
    case 'error':
      return { bg: s.hover ? 'var(--interactive-error-hover)' : 'var(--interactive-error)', fg: 'var(--interactive-error-fg)', bd: 'transparent', sh: 'var(--shadow-xs)', ring: 'var(--focus-ring)' };
    case 'link':
      return { bg: 'transparent', fg: s.hover ? 'var(--text-link-hover)' : 'var(--text-link)', bd: 'transparent', sh: 'none', ring: 'var(--focus-ring)' };
    default:
      return { bg: s.press ? 'var(--interactive-primary-active)' : s.hover ? 'var(--interactive-primary-hover)' : 'var(--interactive-primary)', fg: 'var(--interactive-primary-fg)', bd: 'transparent', sh: s.hover && !s.press ? 'var(--shadow-brand)' : 'var(--shadow-xs)', ring: 'var(--focus-ring)' };
  }
}

export function Button({ variant = 'primary', size = 'md', fullWidth = false, disabled = false, loading = false, iconLeft, iconRight, children, style, ...rest }: ButtonProps) {
  const st = useInteract(disabled || loading);
  const sz = SIZES[size] || SIZES.md;
  const p = palette(variant, st);
  const isLink = variant === 'link';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      {...st.handlers}
      {...rest}
      style={sx({
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
        border: 'var(--border-width-hairline) solid ' + (disabled ? 'transparent' : p.bd),
        background: disabled ? 'var(--interactive-disabled-bg)' : p.bg,
        color: disabled ? 'var(--interactive-disabled-fg)' : p.fg,
        boxShadow: disabled ? 'none' : st.focus ? p.ring : p.sh,
        transform: st.press && !disabled ? 'scale(var(--press-scale))' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.75 : 1,
        transition: 'var(--transition-control)',
        outline: 'none',
        textDecoration: isLink && st.hover ? 'underline' : 'none',
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