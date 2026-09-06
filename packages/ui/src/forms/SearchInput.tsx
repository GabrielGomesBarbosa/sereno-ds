'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { Input, type InputProps } from './Input';

/**
 * A search field: `Input` with a leading magnifier, a clear (×) button, and a
 * **debounced** `onSearch`. `Enter` searches immediately; `Esc` clears.
 */
export interface SearchInputProps
  extends Omit<InputProps, 'iconLeft' | 'suffix' | 'prefix' | 'type' | 'mask' | 'showCount' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  /** Every keystroke and on clear — the plain string. */
  onValueChange?: (value: string) => void;
  /** Debounced (and on `Enter` / clear) — run the actual query here. */
  onSearch?: (value: string) => void;
  /** Debounce for `onSearch`, in ms. */
  debounce?: number;
  /** aria-label for the clear button. */
  clearLabel?: string;
}

export function SearchInput({
  value,
  defaultValue,
  onValueChange,
  onSearch,
  debounce = 250,
  clearLabel = 'Clear search',
  placeholder = 'Search…',
  disabled,
  ...rest
}: SearchInputProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const text = value !== undefined ? value : internal;

  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const runSearch = (v: string, immediate: boolean) => {
    clearTimeout(timer.current);
    if (immediate) onSearch?.(v);
    else timer.current = setTimeout(() => onSearch?.(v), debounce);
  };

  const update = (v: string, immediate = false) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
    runSearch(v, immediate);
  };

  const clear = () => update('', true);

  return (
    <Input
      {...rest}
      role="searchbox"
      enterKeyHint="search"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      disabled={disabled}
      value={text}
      onChange={(e) => update(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') runSearch(e.currentTarget.value, true);
        else if (e.key === 'Escape' && text) {
          e.preventDefault();
          clear();
        }
      }}
      iconLeft={<Search size={16} strokeWidth={1.75} />}
      suffix={
        text && !disabled ? (
          <button
            type="button"
            className="ds-affix-btn"
            aria-label={clearLabel}
            onClick={clear}
            style={sx({ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 })}
          >
            <X size={16} strokeWidth={2} />
          </button>
        ) : undefined
      }
    />
  );
}
