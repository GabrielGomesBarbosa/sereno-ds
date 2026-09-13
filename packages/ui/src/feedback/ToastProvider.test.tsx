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
const cards = () => [...document.body.querySelectorAll('[role="status"], [role="alert"]')] as HTMLElement[];

/**
 * The visible card carrying `text` — not the sr-only aria-live announcer,
 * which deliberately carries the same text (see ToastProvider's two
 * persistent live regions), so a plain `screen.getByText` now matches both.
 */
const cardWithText = (text: string) => cards().find((c) => c.textContent?.includes(text));

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
    expect(cardWithText('Link copied')).toBeTruthy();
    act(() => vi.advanceTimersByTime(3000 + 300));
    expect(cardWithText('Link copied')).toBeUndefined();
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
    expect(cardWithText('Syncing…')).toBeTruthy();
    act(() => api.current!.dismiss(id));
    act(() => vi.advanceTimersByTime(300));
    expect(cardWithText('Syncing…')).toBeUndefined();
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
    expect(cardWithText('One')).toBeUndefined();
    expect(cardWithText('Two')).toBeTruthy();
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
    expect(cardWithText('a1')).toBeUndefined();
    expect(cardWithText('a2')).toBeTruthy();
    expect(cardWithText('a3')).toBeTruthy();
    expect(cards()).toHaveLength(2);
  });

  it('pauses the auto-dismiss timer while the toast is hovered', () => {
    vi.useFakeTimers();
    const api: ApiRef = { current: null };
    mount(api, { duration: 3000 });
    act(() => {
      api.current!.toast('Hover me');
    });
    const item = cardWithText('Hover me')!.closest('.sereno-toast-item')!;
    fireEvent.mouseEnter(item);
    act(() => vi.advanceTimersByTime(10_000));
    expect(cardWithText('Hover me')).toBeTruthy(); // frozen
    fireEvent.mouseLeave(item);
    act(() => vi.advanceTimersByTime(3000 + 300));
    expect(cardWithText('Hover me')).toBeUndefined();
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
    const item = cardWithText('Timed')!.closest('.sereno-toast-item')!;
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
    expect(cardWithText('Sticky')).toBeTruthy();
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
    expect(cardWithText('Close me')).toBeUndefined();
  });

  it('announces through a persistent aria-live region, not just the freshly-mounted card', () => {
    const api: ApiRef = { current: null };
    mount(api);
    // The polite region exists from the start (mount), before any toast fires —
    // that persistence is the whole point: a live region only reliably
    // announces a *change*, not a node that mounts already carrying content.
    const polite = document.body.querySelector('[aria-live="polite"]');
    const assertive = document.body.querySelector('[aria-live="assertive"]');
    expect(polite).toBeInTheDocument();
    expect(assertive).toBeInTheDocument();
    expect(polite).toHaveTextContent('');

    act(() => {
      api.current!.toast.success('Booking confirmed', { description: 'The client was notified.' });
    });
    expect(polite).toHaveTextContent('Booking confirmed. The client was notified.');
    expect(assertive).toHaveTextContent('');
  });

  it('routes an error tone through the assertive region instead of the polite one', () => {
    const api: ApiRef = { current: null };
    mount(api);
    const polite = document.body.querySelector('[aria-live="polite"]');
    const assertive = document.body.querySelector('[aria-live="assertive"]');
    act(() => {
      api.current!.toast.error('Payment failed');
    });
    expect(assertive).toHaveTextContent('Payment failed');
    expect(polite).toHaveTextContent('');
  });
});
