import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
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

describe('Textarea, character counter', () => {
  const counter = (c: HTMLElement) => c.querySelector('[aria-live="polite"]')?.textContent;

  it('counts the defaultValue at mount', () => {
    const { container } = render(<Textarea label="Bio" maxLength={120} defaultValue="abcd" />);
    expect(counter(container)).toBe('4 / 120');
  });

  it('follows a value written by code after mount (react-hook-form reset() / setValue() / el.value = …)', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const { container } = render(<Textarea label="Bio" maxLength={120} ref={ref} />);
    expect(counter(container)).toBe('0 / 120');
    act(() => {
      ref.current!.value = 'Tmp Contador';
    });
    expect(counter(container)).toBe('12 / 120');
  });

  it('counts a value written while the ref attaches (register() with defaultValues)', () => {
    const Form = () => {
      const register = React.useCallback((node: HTMLTextAreaElement | null) => {
        if (node) node.value = 'Tmp Contador';
      }, []);
      return <Textarea label="Bio" maxLength={120} ref={register} />;
    };
    const { container } = render(<Form />);
    expect(counter(container)).toBe('12 / 120');
  });

  it('keeps forwarding the ref to the native textarea while counting', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea label="Bio" maxLength={120} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('typing still updates it, and the caller onChange still fires', () => {
    const onChange = vi.fn();
    const { container } = render(<Textarea label="Bio" maxLength={120} onChange={onChange} />);
    fireEvent.change(container.querySelector('textarea')!, { target: { value: 'oi tudo bem' } });
    expect(counter(container)).toBe('11 / 120');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('follows a native form.reset() back to the defaultValue', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <form>
          <Textarea label="Bio" maxLength={120} defaultValue="abc" />
        </form>,
      );
      const el = container.querySelector('textarea')!;
      act(() => {
        el.value = 'a much longer value';
      });
      expect(counter(container)).toBe('19 / 120');
      act(() => {
        container.querySelector('form')!.reset();
        vi.runAllTimers();
      });
      expect(counter(container)).toBe('3 / 120');
    } finally {
      vi.useRealTimers();
    }
  });

  it('controlled: counts `value`, as before', () => {
    const { container, rerender } = render(<Textarea label="Bio" maxLength={120} value="abcde" onChange={() => {}} />);
    expect(counter(container)).toBe('5 / 120');
    rerender(<Textarea label="Bio" maxLength={120} value="abcdefgh" onChange={() => {}} />);
    expect(counter(container)).toBe('8 / 120');
  });
});
