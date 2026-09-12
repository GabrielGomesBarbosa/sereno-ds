import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider, useToast, type ToastContextValue, type ToastProviderProps } from './ToastProvider';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

type ApiRef = React.MutableRefObject<ToastContextValue | null>;

function Grab({ apiRef }: { apiRef: ApiRef }) {
  const api = useToast();
  React.useEffect(() => {
    apiRef.current = api;
  }, [api, apiRef]);
  return null;
}

function mount(apiRef: ApiRef, props?: Partial<ToastProviderProps>) {
  return render(
    <ToastProvider duration={0} {...props}>
      <Grab apiRef={apiRef} />
    </ToastProvider>,
  );
}

/** Every visible (non-leaving) toast card in the portal. */
const cards = () => [...document.body.querySelectorAll('[role="status"], [role="alert"]')];

describe('ToastProvider / useToast', () => {
  it('throws when useToast is called outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Grab apiRef={{ current: null }} />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });

  it('fires a toast into a portal on <body>, as role="status"', () => {
    const api: ApiRef = { current: null };
    const { container } = mount(api);
    act(() => {
      api.current!.toast.success('Booking confirmed');
    });
    const card = within(document.body).getByRole('status');
    expect(card).toHaveTextContent('Booking confirmed');
    expect(container).not.toContainElement(card); // portalled out of the provider subtree
  });

  it('uses role="alert" for the error tone', () => {
    const api: ApiRef = { current: null };
    mount(api);
    act(() => {
      api.current!.toast.error('Payment failed');
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('auto-dismisses after the duration', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api, { duration: 3000 });
    act(() => {
      api.current!.toast('Link copied');
    });
    expect(screen.getByText('Link copied')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000 + 300));
    expect(screen.queryByText('Link copied')).toBeNull();
  });

  it('keeps a toast with duration 0 until it is dismissed', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api);
    let id = '';
    act(() => {
      id = api.current!.toast.info('Syncing…', { duration: 0 });
    });
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Syncing…')).toBeInTheDocument();
    act(() => api.current!.dismiss(id));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByText('Syncing…')).toBeNull();
  });

  it('dismiss(id) removes one; dismiss() clears the rest', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api);
    let first = '';
    act(() => {
      first = api.current!.toast('One');
      api.current!.toast('Two');
      api.current!.toast('Three');
    });
    expect(cards()).toHaveLength(3);
    act(() => api.current!.dismiss(first));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.getByText('Two')).toBeInTheDocument();
    act(() => api.current!.dismiss());
    act(() => vi.advanceTimersByTime(300));
    expect(cards()).toHaveLength(0);
  });

  it('caps the stack at `max` — the oldest drops', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api, { max: 2 });
    act(() => {
      api.current!.toast('a1');
      api.current!.toast('a2');
      api.current!.toast('a3');
    });
    act(() => vi.advanceTimersByTime(300)); // let the evicted one finish leaving
    expect(screen.queryByText('a1')).toBeNull();
    expect(screen.getByText('a2')).toBeInTheDocument();
    expect(screen.getByText('a3')).toBeInTheDocument();
    expect(cards()).toHaveLength(2);
  });

  it('pauses the auto-dismiss timer while the toast is hovered', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api, { duration: 3000 });
    act(() => {
      api.current!.toast('Hover me');
    });
    const item = screen.getByText('Hover me').closest('.sereno-toast-item')!;
    fireEvent.mouseEnter(item);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Hover me')).toBeInTheDocument(); // frozen
    fireEvent.mouseLeave(item);
    act(() => vi.advanceTimersByTime(3000 + 300));
    expect(screen.queryByText('Hover me')).toBeNull();
  });

  it('shows a countdown bar for timed toasts and freezes it on hover', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api, { duration: 3000 });
    act(() => {
      api.current!.toast('Timed');
    });
    const bar = () => document.body.querySelector('.sereno-toast-bar');
    expect(bar()).toBeInTheDocument();
    expect((bar() as HTMLElement).style.animationDuration).toBe('3000ms');
    const item = screen.getByText('Timed').closest('.sereno-toast-item')!;
    fireEvent.mouseEnter(item);
    expect(bar()!.getAttribute('data-paused')).toBe('true');
    fireEvent.mouseLeave(item);
    expect(bar()!.getAttribute('data-paused')).toBeNull();
  });

  it('omits the countdown bar for a sticky toast (duration 0)', () => {
    const api: ApiRef = { current: null };
    mount(api);
    act(() => {
      api.current!.toast.info('Sticky', { duration: 0 });
    });
    expect(screen.getByText('Sticky')).toBeInTheDocument();
    expect(document.body.querySelector('.sereno-toast-bar')).toBeNull();
  });

  it('supports every corner position', () => {
    for (const position of ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const) {
      const api: ApiRef = { current: null };
      const { unmount } = mount(api, { position });
      act(() => {
        api.current!.toast('here');
      });
      const region = screen.getByRole('region', { name: 'Notifications' });
      const [edge, side] = position.split('-');
      expect(region.style.getPropertyValue(edge)).toBe('0px');
      // `side` (left/right) carries a small outward offset, not flush 0 — see
      // ToastProvider's viewport style: a macOS Safari overlay scrollbar can
      // paint right over a flush edge, inside what should have been the
      // toast's only clearance from it.
      if (side === 'center') expect(region.style.left).toBe('50%');
      else expect(region.style.getPropertyValue(side)).toBe('var(--space-2)');
      unmount();
    }
  });

  it('the header ✕ dismisses the toast', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api);
    act(() => {
      api.current!.toast('Close me');
    });
    fireEvent.click(within(document.body).getByRole('button', { name: 'Fechar' }));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByText('Close me')).toBeNull();
  });
});
