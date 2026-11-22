import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { Textarea } from './Textarea';

afterEach(cleanup);

describe('Textarea: ref', () => {
  it('forwards ref to the native textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea label="Bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

/**
 * Same contract as `Input` (SS-582): the textarea carries `--sd-*` values and the stylesheet draws its border and
 * ring from `.sereno-field:focus`; the component keeps no focus state and wraps no `onFocus` / `onBlur`.
 */
describe('Textarea: focus ring', () => {
  const v = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

  it('is a field frame, with the colours of rest, active and the ring as values, and no colour set inline', () => {
    const { container } = render(<Textarea label="Bio" />);
    const textarea = container.querySelector('textarea')!;
    expect(textarea).toHaveClass('sereno-field');
    expect(v(textarea, '--sd-bd')).toBe('var(--border-default)');
    expect(v(textarea, '--sd-bd-active')).toBe('var(--border-focus)');
    expect(v(textarea, '--sd-ring-active')).toBe('var(--focus-ring)');
    expect(textarea.style.borderColor).toBe('');
    expect(textarea.style.boxShadow).toBe('');
  });

  it('keeps the caller class next to its own, and an error has its border while active and no ring', () => {
    const { container } = render(<Textarea label="Bio" className="mine" error="Obrigatório" />);
    const textarea = container.querySelector('textarea')!;
    expect(textarea).toHaveClass('sereno-field', 'mine');
    expect(v(textarea, '--sd-bd')).toBe('var(--interactive-error)');
    expect(v(textarea, '--sd-bd-active')).toBe('var(--interactive-error)');
    expect(v(textarea, '--sd-ring-active')).toBe('none');
  });

  it('focus and blur change nothing on the textarea: there is no focus state to render', () => {
    const { container } = render(<Textarea label="Bio" />);
    const textarea = container.querySelector('textarea')!;
    const before = container.innerHTML;
    fireEvent.focus(textarea);
    expect(container.innerHTML).toBe(before);
    fireEvent.blur(textarea);
    expect(container.innerHTML).toBe(before);
  });

  it('a caller onFocus and onBlur each run once, straight from the textarea (register() of react-hook-form injects them)', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(<Textarea label="Bio" onFocus={onFocus} onBlur={onBlur} />);
    const textarea = container.querySelector('textarea')!;
    fireEvent.focus(textarea);
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(textarea);
    expect(onBlur).toHaveBeenCalledTimes(1);
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
