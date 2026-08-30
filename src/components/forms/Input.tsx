'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { formatMask, MASK_INPUTMODE, MASK_MAXLENGTH, type MaskName } from '../_internal/mask';

/**
 * Single-line text field with label, hint and error states.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Helper text under the field. Replaced by `error` when present. */
  hint?: string;
  /** Error message; also turns the border red. */
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  /** Trailing text or control (e.g. "min", a clear button). */
  suffix?: React.ReactNode;
  /**
   * Format the value as the user types. A preset (`phone` / `cpf` / `cep` /
   * `currency`) or a custom pattern where `#` is one digit (`(##) #####-####`).
   * Sets `inputMode` and `maxLength` unless you pass your own.
   */
  mask?: MaskName | string;
  containerStyle?: React.CSSProperties;
}

const H = { sm: 'var(--control-height-sm)', md: 'var(--control-height-md)', lg: 'var(--control-height-lg)' } as const;

export function Input({
  label,
  hint,
  error,
  required,
  size = 'md',
  iconLeft,
  suffix,
  disabled,
  id,
  style,
  containerStyle,
  mask,
  onChange,
  inputMode,
  maxLength,
  defaultValue,
  ...rest
}: InputProps) {
  const [focus, setFocus] = React.useState(false);
  // SSR-stable id (the DS source used Math.random(), which breaks hydration).
  const autoId = React.useId();
  const rid = id || autoId;

  const handleChange = mask
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatMask(mask, e.currentTarget.value);
        if (formatted !== e.currentTarget.value) {
          const el = e.currentTarget;
          el.value = formatted;
          // keep the caret at the end — the natural spot while typing forward
          try {
            el.setSelectionRange(formatted.length, formatted.length);
          } catch {
            /* type doesn't support selection */
          }
        }
        onChange?.(e);
      }
    : onChange;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={rid} style={containerStyle}>
      <div
        style={sx({
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          height: H[size] || H.md,
          padding: '0 var(--space-3)',
          borderRadius: 'var(--radius-control)',
          background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
          border: 'var(--border-width-hairline) solid ' + (error ? 'var(--interactive-error)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
          boxShadow: focus ? (error ? 'none' : 'var(--focus-ring)') : 'none',
          transition: 'var(--transition-control)',
        })}
      >
        {iconLeft && <span style={sx({ display: 'flex', color: 'var(--text-muted)', flex: '0 0 auto' })}>{iconLeft}</span>}
        <input
          id={rid}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={handleChange}
          inputMode={mask ? inputMode ?? MASK_INPUTMODE[mask] ?? 'numeric' : inputMode}
          maxLength={mask ? maxLength ?? MASK_MAXLENGTH[mask] : maxLength}
          defaultValue={mask && typeof defaultValue === 'string' ? formatMask(mask, defaultValue) : defaultValue}
          {...rest}
          style={sx({
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
            ...style,
          })}
        />
        {suffix && <span style={sx({ display: 'flex', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', flex: '0 0 auto' })}>{suffix}</span>}
      </div>
    </Field>
  );
}
