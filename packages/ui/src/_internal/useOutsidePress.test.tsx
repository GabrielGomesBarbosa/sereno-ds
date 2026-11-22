import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useOutsidePress } from './useOutsidePress';

afterEach(cleanup);

/** Two zones that count as "inside", a button outside and a switch for `enabled`. */
function Harness({ enabled = true, onOutside }: { enabled?: boolean; onOutside: (e: PointerEvent) => void }) {
  const a = React.useRef<HTMLDivElement>(null);
  const b = React.useRef<HTMLDivElement>(null);
  const missing = React.useRef<HTMLDivElement>(null); // never attached: not mounted
  useOutsidePress(enabled, [a, b, missing], onOutside);
  return (
    <div>
      <div ref={a} data-testid="a">
        <button type="button">inside a</button>
      </div>
      <div ref={b} data-testid="b">
        inside b
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe('useOutsidePress', () => {
  it('fires for a press outside every ref', () => {
    const onOutside = vi.fn();
    render(<Harness onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('does not fire for a press inside any one of the refs, nested elements included', () => {
    const onOutside = vi.fn();
    render(<Harness onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByText('inside a'));
    fireEvent.pointerDown(screen.getByTestId('b'));
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('does not listen while disabled, and starts when it is enabled', () => {
    const onOutside = vi.fn();
    const { rerender } = render(<Harness enabled={false} onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onOutside).not.toHaveBeenCalled();
    rerender(<Harness enabled onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('stops listening when it unmounts', () => {
    const onOutside = vi.fn();
    const { unmount } = render(<Harness onOutside={onOutside} />);
    unmount();
    fireEvent.pointerDown(document.body);
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('uses the newest callback without subscribing again', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Harness onOutside={first} />);
    const subscriptions = add.mock.calls.filter(([type]) => type === 'pointerdown').length;
    rerender(<Harness onOutside={second} />);
    expect(add.mock.calls.filter(([type]) => type === 'pointerdown').length).toBe(subscriptions);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    add.mockRestore();
  });

  it('hears a press that a component stops on its way down (capture phase)', () => {
    const onOutside = vi.fn();
    render(<Harness onOutside={onOutside} />);
    const outside = screen.getByText('outside');
    outside.addEventListener('pointerdown', (e) => e.stopPropagation()); // target phase: after capture
    fireEvent.pointerDown(outside);
    expect(onOutside).toHaveBeenCalledTimes(1);
  });
});
