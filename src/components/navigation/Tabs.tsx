'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

/**
 * Horizontal section switcher. `underline` for page-level sections, `pill` for filters inside a panel.
 */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  fullWidth?: boolean;
}

export function Tabs({ items = [], value, onChange, variant = 'underline', fullWidth = false, style, ...rest }: TabsProps) {
  const pill = variant === 'pill';
  return (
    <div
      role="tablist"
      {...rest}
      style={sx({
        display: pill ? 'inline-flex' : 'flex',
        // A pill group hugs its content — never stretch to fill a flex/grid parent
        // (would leave a wide empty track). `fullWidth` opts back into stretching.
        alignSelf: pill && !fullWidth ? 'flex-start' : undefined,
        width: !pill && fullWidth ? '100%' : undefined,
        gap: pill ? 'var(--space-1)' : 'var(--space-5)',
        padding: pill ? 'var(--space-1)' : 0,
        borderRadius: pill ? 'var(--radius-pill)' : 0,
        background: pill ? 'var(--bg-subtle)' : 'transparent',
        borderBottom: pill ? 'none' : 'var(--border-width-hairline) solid var(--border-default)',
        ...style,
      })}
    >
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(it.value)}
            style={sx({
              flex: fullWidth ? 1 : '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              background: pill ? (active ? 'var(--bg-surface)' : 'transparent') : 'transparent',
              boxShadow: pill && active ? 'var(--shadow-xs)' : 'none',
              borderRadius: pill ? 'var(--radius-pill)' : 0,
              padding: pill ? '8px var(--space-4)' : '0 0 var(--space-3)',
              borderBottom: pill ? 'none' : '2px solid ' + (active ? 'var(--interactive-primary)' : 'transparent'),
              marginBottom: pill ? 0 : -1,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              color: active ? (pill ? 'var(--text-primary)' : 'var(--text-brand)') : 'var(--text-secondary)',
              transition: 'var(--transition-control)',
            })}
          >
            {it.icon}
            {it.label}
            {it.count !== undefined && (
              <span
                style={sx({
                  fontSize: 'var(--text-2xs)',
                  fontWeight: 'var(--weight-bold)',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  // On the pill track (which is --bg-subtle) an inactive count needs a
                  // surface fill to read; on the underline variant it sits on the page.
                  background: active ? 'var(--bg-brand-soft)' : pill ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  color: active ? 'var(--text-brand)' : 'var(--text-muted)',
                })}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}