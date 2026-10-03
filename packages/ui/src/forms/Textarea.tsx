'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { CharCount } from '../_internal/CharCount';
import { mergeRefs } from '../_internal/mergeRefs';
import { useValueLength } from '../_internal/useValueLength';

/** Multi-line field for booking notes and service descriptions. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  /**
   * Show a `n / max` character counter on the hint row. Implied when `maxLength`
   * is set; pass `showCount` on its own for a bare count with no ceiling.
   */
  showCount?: boolean;
  containerStyle?: React.CSSProperties;
  /** Reserve the hint/error row's height even with neither set - stops the
   *  field from growing the moment a validation message appears. */
  preserveHelperSpace?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    required,
    rows = 4,
    showCount,
    preserveHelperSpace,
    disabled,
    id,
    style,
    containerStyle,
    onChange,
    onFocus,
    onBlur,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    'aria-required': ariaRequired,
    ...rest
  },
  ref,
) {
  const [focus, setFocus] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Stable across renders, so a form library's ref callback isn't detached and re-attached each time.
  const setRefs = React.useMemo(() => mergeRefs(textareaRef, ref), [ref]);
  // SSR-stable id (the DS source used Math.random(), which breaks hydration).
  const autoId = React.useId();
  const rid = id || autoId;
  // Names the hint / error line and flags the error, so a screen reader reads both with the field.
  const a11y = fieldA11y(rid, { hint, error, describedBy, invalid, required, ariaRequired });

  const max = typeof rest.maxLength === 'number' ? rest.maxLength : undefined;
  const showCounter = Boolean(showCount) || max != null;
  // Controlled: the count comes from `value`. Uncontrolled: from the element itself, so a
  // value written by code (react-hook-form's `reset()` / `setValue()`, `el.value = …`) counts too.
  const uncount = useValueLength(
    textareaRef,
    showCounter && rest.value === undefined,
    typeof rest.defaultValue === 'string' || typeof rest.defaultValue === 'number' ? String(rest.defaultValue).length : 0,
  );
  const count = rest.value !== undefined ? String(rest.value ?? '').length : uncount;

  // Destructured (not left in `...rest`) and always re-composed - same
  // reason as `handleChange` above: a caller's own onFocus/onBlur (or
  // react-hook-form's `register()`, which always injects its own onBlur)
  // must never silently replace the focus ring's, the way a plain
  // `{...rest}` spread after them used to.
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocus(true);
    onFocus?.(e);
  };
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocus(false);
    onBlur?.(e);
  };

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      requiredExposed
      htmlFor={rid}
      style={containerStyle}
      counter={showCounter ? <CharCount count={count} max={max} /> : undefined}
      preserveHelperSpace={preserveHelperSpace}
    >
      <textarea
        id={rid}
        ref={setRefs}
        rows={rows}
        disabled={disabled}
        {...rest}
        {...a11y}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={onChange}
        style={sx({
          width: '100%',
          padding: 'var(--space-3)',
          resize: 'vertical',
          borderRadius: 'var(--radius-control)',
          background: disabled ? 'var(--interactive-disabled-bg)' : 'var(--bg-surface)',
          border: 'var(--border-width-hairline) solid ' + (error ? 'var(--interactive-error)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
          boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-normal)',
          color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
          transition: 'var(--transition-control)',
          ...style,
        })}
      />
    </Field>
  );
});

Textarea.displayName = 'Textarea';