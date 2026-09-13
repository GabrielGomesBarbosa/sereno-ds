'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Mobile primary navigation — a **compound component**. 3 to 5 destinations,
 * 64px tall, translucent blurred surface.
 *
 * ```tsx
 * <BottomNav value={tab} onChange={setTab}>
 *   <BottomNav.Item value="agenda" label="Calendar" icon={<Calendar size={22} />} />
 *   <BottomNav.Item value="clients" label="Clients" icon={<Users size={22} />} badge />
 * </BottomNav>
 * ```
 */
export interface BottomNavProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface BottomNavItemProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: boolean;
}

interface BottomNavContextValue {
  value?: string;
  onChange?: (value: string) => void;
}

const BottomNavContext = React.createContext<BottomNavContextValue | null>(null);

function useBottomNavContext(component: string): BottomNavContextValue {
  const ctx = React.useContext(BottomNavContext);
  if (!ctx) throw new Error(`<BottomNav.${component}> must be rendered inside <BottomNav>.`);
  return ctx;
}

function BottomNavRoot({ value, onChange, children, style, ...rest }: BottomNavProps) {
  const ctx: BottomNavContextValue = { value, onChange };
  return (
    <BottomNavContext.Provider value={ctx}>
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
        {children}
      </nav>
    </BottomNavContext.Provider>
  );
}

function Item({ value, label, icon, badge }: BottomNavItemProps) {
  const { value: activeValue, onChange } = useBottomNavContext('Item');
  const active = activeValue === value;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => onChange?.(value)}
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
        {icon}
        {badge && (
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
        {label}
      </span>
    </button>
  );
}

export const BottomNav = Object.assign(BottomNavRoot, { Item });
