'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { Input, type InputProps } from './Input';

/**
 * A search field: `Input` with a leading magnifier, a clear (×) button, and a
 * **debounced** `onSearch`. `Enter` searches immediately; `Esc` clears.
 *
 * A caller's `onKeyDown` runs first, on every key. Calling `preventDefault()` on
 * the event there says it was handled, and the built-in `Enter` / `Esc` are skipped
 * (the same "handled" rule a popup's `Esc` follows inside a `Dialog`).
 */
export interface SearchInputProps
  extends Omit<InputProps, 'iconLeft' | 'suffix' | 'prefix' | 'type' | 'mask' | 'showCount' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  /** Every keystroke and on clear - the plain string. */
  onValueChange?: (value: string) => void;
  /** Debounced (and on `Enter` / clear) - run the actual query here. */
  onSearch?: (value: string) => void;
  /** Debounce for `onSearch`, in ms. */
  debounce?: number;
  /** aria-label for the clear button. */
  clearLabel?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, defaultValue, onValueChange, onSearch, onKeyDown, debounce = 250, clearLabel = 'Clear search', placeholder = 'Search…', disabled, ...rest },
  ref,
) {
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

  // Composed, not replaced: a plain `{...rest}` spread followed by our own `onKeyDown` used to drop the caller's
  // silently (the same class of bug `Input` guards against for `onChange`).
  // The caller's runs first and can opt out of the built-in keys with `preventDefault()`.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter') runSearch(e.currentTarget.value, true);
    else if (e.key === 'Escape' && text) {
      e.preventDefault();
      clear();
    }
  };

  return (
    <Input
      ref={ref}
      {...rest}
      role="searchbox"
      enterKeyHint="search"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      disabled={disabled}
      value={text}
      onChange={(e) => update(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
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
});

SearchInput.displayName = 'SearchInput';
