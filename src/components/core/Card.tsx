'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { useInteract } from './Button';

/** Neutral surface container: a crisp 1px ring + optional soft lift + 14px radius. The base of every list row and panel. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** Adds hover lift, press scale and pointer cursor. */
  interactive?: boolean;
  /** Brand-coloured ring for a chosen option. */
  selected?: boolean;
  children?: React.ReactNode;
}

const PADS = { none: 0, sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-5)' } as const;
// The edge is a box-shadow ring (pixel-crisp at any radius), with the elevation
// drop-shadow layered beneath it — never a real `border` fighting the shadow.
const DROP = { none: '', sm: 'var(--shadow-xs)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' } as const;

export function Card({ padding = 'md', elevation = 'sm', interactive = false, selected = false, children, style, ...rest }: CardProps) {
  const st = useInteract(!interactive);
  const lifted = interactive && st.hover;

  const ring = selected ? '0 0 0 1.5px var(--border-brand)' : '0 0 0 1px ' + (st.hover ? 'var(--border-strong)' : 'var(--border-default)');
  const drop = selected ? 'var(--shadow-md)' : lifted ? (elevation === 'lg' ? 'var(--shadow-lg)' : 'var(--shadow-md)') : DROP[elevation];

  return (
    <div
      {...(interactive ? st.handlers : {})}
      {...rest}
      style={sx({
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-card)',
        padding: PADS[padding],
        boxShadow: [ring, drop].filter(Boolean).join(', '),
        transform: lifted && !st.press ? 'translateY(var(--hover-lift))' : interactive && st.press ? 'scale(var(--press-scale))' : 'none',
        transition: 'var(--transition-control)',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      })}
    >
      {children}
    </div>
  );
}
