'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Instant-apply toggle for settings rows (agenda online, lembretes, tema). Never use inside a form that needs Save. Host must include the `.sereno-switch` focus rule (see globals.css). */
export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Track size. `sm` for dense settings lists; `md` is the default. Matches `Checkbox` / `Radio`. */
  size?: 'sm' | 'md';
  onChange?: (e: { target: { checked: boolean } }) => void;
  style?: React.CSSProperties;
}

const TRACK = { sm: { w: 36, h: 22, thumb: 16 }, md: { w: 44, h: 26, thumb: 20 } } as const;

export function Switch({ label, description, checked = false, disabled, size = 'md', onChange, style }: SwitchProps) {
  const t = TRACK[size];
  const toggle = () => {
    if (!disabled && onChange) onChange({ target: { checked: !checked } });
  };
  return (
    <label
      style={sx({
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      })}
    >
      <span style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
        {label && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' })}>{label}</span>
        )}
        {description && (
          <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.45 })}>{description}</span>
        )}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? undefined : 0}
        className="sereno-switch"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
          }
        }}
        style={sx({
          position: 'relative',
          width: t.w,
          height: t.h,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--interactive-primary)' : 'var(--border-strong)',
          transition: 'background-color var(--duration-normal) var(--ease-standard)',
        })}
      >
        <span
          style={sx({
            position: 'absolute',
            top: 3,
            left: checked ? t.w - t.thumb - 3 : 3,
            width: t.thumb,
            height: t.thumb,
            borderRadius: '999px',
            background: '#fff',
            boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--duration-normal) var(--ease-gentle)',
          })}
        />
      </span>
    </label>
  );
}
