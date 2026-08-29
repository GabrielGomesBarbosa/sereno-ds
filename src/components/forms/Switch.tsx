'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/** Instant-apply toggle for settings rows (agenda online, lembretes, tema). Never use inside a form that needs Save. */
export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
  style?: React.CSSProperties;
}

export function Switch({ label, description, checked = false, disabled, onChange, style }: SwitchProps) {
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
        onClick={() => {
          if (!disabled && onChange) onChange({ target: { checked: !checked } });
        }}
        style={sx({
          position: 'relative',
          width: 44,
          height: 26,
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
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
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