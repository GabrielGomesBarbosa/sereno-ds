import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Textarea } from './Textarea';

afterEach(cleanup);

describe('Textarea — ref', () => {
  it('forwards ref to the native textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea label="Bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

describe('Textarea — focus ring', () => {
  it('a caller onBlur does not stop the focus ring from resetting (regression: a plain {...rest} spread used to let it silently replace the internal handler — the exact shape react-hook-form\'s register() injects)', () => {
    const onBlur = vi.fn();
    const { container } = render(<Textarea label="Bio" onBlur={onBlur} />);
    const textarea = container.querySelector('textarea')!;
    fireEvent.focus(textarea);
    expect(textarea.getAttribute('style')).toContain('var(--border-focus)');
    fireEvent.blur(textarea);
    expect(textarea.getAttribute('style')).not.toContain('var(--border-focus)');
    expect(textarea.getAttribute('style')).toContain('var(--border-default)');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('a caller onFocus is still called alongside the internal handler', () => {
    const onFocus = vi.fn();
    const { container } = render(<Textarea label="Bio" onFocus={onFocus} />);
    fireEvent.focus(container.querySelector('textarea')!);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('a caller onChange still fires alongside the character counter (regression guard for the same {...rest}-ordering class of bug)', () => {
    const onChange = vi.fn();
    const { container } = render(<Textarea label="Bio" maxLength={10} onChange={onChange} />);
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: 'oi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
