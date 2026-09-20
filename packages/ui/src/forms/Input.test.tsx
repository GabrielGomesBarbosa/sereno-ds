import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Input } from './Input';

afterEach(cleanup);

describe('Input — ref', () => {
  it('forwards ref to the native input, still usable for the password-reveal focus-back', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Nome" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

describe('Input — focus ring', () => {
  it('a caller onBlur does not stop the focus ring from resetting (regression: a plain {...rest} spread used to let it silently replace the internal handler — the exact shape react-hook-form\'s register() injects)', () => {
    const onBlur = vi.fn();
    const { container } = render(<Input label="Nome" onBlur={onBlur} />);
    const input = container.querySelector('input')!;
    const box = input.parentElement as HTMLElement;
    fireEvent.focus(input);
    expect(box.getAttribute('style')).toContain('var(--border-focus)');
    fireEvent.blur(input);
    expect(box.getAttribute('style')).not.toContain('var(--border-focus)');
    expect(box.getAttribute('style')).toContain('var(--border-default)');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('a caller onFocus is still called alongside the internal handler', () => {
    const onFocus = vi.fn();
    const { container } = render(<Input label="Nome" onFocus={onFocus} />);
    fireEvent.focus(container.querySelector('input')!);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
