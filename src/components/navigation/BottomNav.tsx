'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

export interface BottomNavItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: boolean;
}

/** Mobile primary navigation — 3–5 destinations, 64px tall, translucent blurred surface. */
export interface BottomNavProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  items: BottomNavItem[];
  value?: string;
  onChange?: (value: string) => void;
}

export function BottomNav({ items = [], value, onChange, style, ...rest }: BottomNavProps) {
  return (
    <nav
      {...rest}
      style={sx({
        display: 'flex',
        alignItems: 'stretch',
        height: 'var(--bottom-nav-height)',
        background: 'color-mix(in srgb,var(--bg-surface) 88%,transparent)',
        backdropFilter: 'blur(12px)',
        borderTop: 'var(--border-width-hairline) solid var(--border-default)',
        ...style,
      })}
    >
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange && onChange(it.value)}
            style={sx({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              outline: 'none',
              position: 'relative',
              color: active ? 'var(--text-brand)' : 'var(--text-muted)',
              transition: 'var(--transition-control)',
            })}
          >
            <span style={sx({ display: 'flex', position: 'relative' })}>
              {it.icon}
              {it.badge && (
                <span
                  style={sx({ position: 'absolute', top: -3, right: -5, minWidth: 8, height: 8, borderRadius: '999px', background: 'var(--interactive-accent)' })}
                />
              )}
            </span>
            <span
              style={sx({
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-2xs)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                letterSpacing: 'var(--tracking-snug)',
              })}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}