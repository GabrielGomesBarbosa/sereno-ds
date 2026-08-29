'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { useInteract } from './Button';

/** Neutral surface container: 1px border + soft shadow + 14px radius. The base of every list row and panel. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** Adds hover lift, press scale and pointer cursor. */
  interactive?: boolean;
  /** Brand-coloured border + ring for a chosen option. */
  selected?: boolean;
  children?: React.ReactNode;
}

const PADS = { none: 0, sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-5)' } as const;

export function Card({ padding = 'md', elevation = 'sm', interactive = false, selected = false, children, style, ...rest }: CardProps) {
  const st = useInteract(!interactive);
  const shadow =
    elevation === 'none' ? 'none' : elevation === 'md' ? 'var(--shadow-md)' : elevation === 'lg' ? 'var(--shadow-lg)' : 'var(--shadow-sm)';
  return (
    <div
      {...(interactive ? st.handlers : {})}
      {...rest}
      style={sx({
        background: 'var(--bg-surface)',
        border: 'var(--border-width-hairline) solid ' + (selected ? 'var(--border-brand)' : st.hover ? 'var(--border-strong)' : 'var(--border-default)'),
        borderRadius: 'var(--radius-card)',
        padding: PADS[padding],
        boxShadow: selected ? '0 0 0 1px var(--border-brand), var(--shadow-md)' : st.hover ? 'var(--shadow-md)' : shadow,
        transform: interactive && st.hover && !st.press ? 'translateY(var(--hover-lift))' : interactive && st.press ? 'scale(var(--press-scale))' : 'none',
        transition: 'var(--transition-control)',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      })}
    >
      {children}
    </div>
  );
}