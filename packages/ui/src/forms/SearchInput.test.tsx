import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SearchInput } from './SearchInput';

afterEach(cleanup);

describe('SearchInput: ref', () => {
  it('forwards ref through to the underlying Input\'s native input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput placeholder="Search" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('role', 'searchbox');
  });
});

describe('SearchInput: onKeyDown', () => {
  const field = () => screen.getByRole('searchbox') as HTMLInputElement;

  it('a caller onKeyDown runs for every key (regression: it used to be silently dropped)', () => {
    const onKeyDown = vi.fn();
    render(<SearchInput aria-label="Search" onKeyDown={onKeyDown} />);
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    fireEvent.keyDown(field(), { key: 'a' });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
  });

  it('runs alongside the built-in keys: Enter still searches at once, Esc still clears', () => {
    const onKeyDown = vi.fn();
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" defaultValue="Maria" onKeyDown={onKeyDown} onSearch={onSearch} />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('Maria'); // immediately, not after the debounce
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(field().value).toBe('');
  });

  it('preventDefault() in the caller handler says the key was handled: the built-in Enter and Esc are skipped', () => {
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" defaultValue="Maria" onKeyDown={(e) => e.preventDefault()} onSearch={onSearch} />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field().value).toBe('Maria');
  });

  it('only the key the caller prevented is skipped: another key still gets the built-in behaviour', () => {
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" defaultValue="Maria" onKeyDown={(e) => e.key === 'Escape' && e.preventDefault()} onSearch={onSearch} />);
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field().value).toBe('Maria'); // the caller kept it
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('Maria');
  });

  it('without a caller handler nothing changes: Enter searches at once, Esc clears and says it handled the key', () => {
    const onSearch = vi.fn();
    render(<SearchInput aria-label="Search" defaultValue="Maria" onSearch={onSearch} />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('Maria');
    // `fireEvent` returns false when the default was prevented: a Dialog around the field relies on this to keep its own Esc.
    expect(fireEvent.keyDown(field(), { key: 'Escape' })).toBe(false);
    expect(field().value).toBe('');
  });

  it('Esc with nothing to clear is left alone (not prevented), so a Dialog around the field can close', () => {
    render(<SearchInput aria-label="Search" />);
    expect(fireEvent.keyDown(field(), { key: 'Escape' })).toBe(true);
  });
});
