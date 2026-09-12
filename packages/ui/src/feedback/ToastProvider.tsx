'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastProps } from './Toast';
import { sx } from '../_internal/style';

/**
 * The toast *system* — a portal viewport plus a queue — layered on top of the
 * presentational `Toast`. Wrap the app once:
 *
 * ```tsx
 * <ToastProvider position="bottom-right">
 *   <App />
 * </ToastProvider>
 * ```
 *
 * then fire from anywhere under it:
 *
 * ```tsx
 * const { toast, dismiss } = useToast();
 * toast.success('Booking confirmed', { description: 'The client was notified.' });
 * toast('Link copied');                          // neutral, title only
 * const id = toast.info('Syncing…', { duration: 0 });  // sticks until dismiss(id)
 * ```
 *
 * Toasts stack (newest nearest the edge), show a countdown bar, auto-dismiss
 * after `duration`, pause that timer (and the bar) while hovered/focused, and
 * cap at `max` — the oldest drops. Needs the `sereno-toast-*` keyframes from
 * `@sereno-ds/ui/styles.css`.
 */

type Tone = NonNullable<ToastProps['tone']>;

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: Tone;
  icon?: React.ReactNode;
  /** Inline control on the right — an "Undo" / "View" `Button variant="link"`. */
  action?: React.ReactNode;
  /** ms until auto-dismiss. `0` (or `Infinity`) keeps it until dismissed. Defaults to the provider's `duration`. */
  duration?: number;
}

/** `msg` shorthand: a bare string becomes the `title`; an object is the full options. */
export type ToastInput = string | ToastOptions;

type ToneFn = (msg: ToastInput, opts?: Partial<ToastOptions>) => string;

export interface ToastApi {
  /** `toast('Saved')` or `toast('Saved', { description, action, duration })`. Neutral tone. */
  (msg: ToastInput, opts?: Partial<ToastOptions>): string;
  success: ToneFn;
  error: ToneFn;
  warning: ToneFn;
  info: ToneFn;
  neutral: ToneFn;
}

export interface ToastContextValue {
  toast: ToastApi;
  /** `dismiss(id)` removes one; `dismiss()` clears them all. */
  dismiss: (id?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export type ToastPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Viewport corner. Default `bottom-right`. */
  position?: ToastPosition;
  /** Most toasts on screen at once; the oldest drops when a new one arrives. Default `3`. */
  max?: number;
  /** Default auto-dismiss, in ms. Default `4000`. */
  duration?: number;
}

interface Entry extends ToastOptions {
  id: string;
  /** Resolved auto-dismiss (ms) — `opts.duration ?? provider duration`. `0` / `Infinity` = sticky. */
  ms: number;
  leaving?: boolean;
}

const EXIT_MS = 180;
let seq = 0;
const nextId = () => `t${Date.now().toString(36)}-${(seq++).toString(36)}`;

const norm = (msg: ToastInput): Partial<ToastOptions> => (typeof msg === 'string' ? { title: msg } : msg);
const timed = (ms: number) => ms > 0 && Number.isFinite(ms);

export function ToastProvider({ children, position = 'bottom-right', max = 3, duration = 4000 }: ToastProviderProps) {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [pausedIds, setPausedIds] = React.useState<ReadonlySet<string>>(() => new Set());

  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);

  // Per-toast auto-dismiss timers, so hover/focus can pause and resume them.
  const timers = React.useRef(new Map<string, { handle: ReturnType<typeof setTimeout>; endsAt: number; left: number }>());

  const forget = React.useCallback((id: string) => {
    setPausedIds((s) => {
      if (!s.has(id)) return s;
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }, []);

  const drop = React.useCallback(
    (id: string) => {
      const t = timers.current.get(id);
      if (t) clearTimeout(t.handle);
      timers.current.delete(id);
      setEntries((list) => list.map((e) => (e.id === id ? { ...e, leaving: true } : e)));
      setTimeout(() => {
        setEntries((list) => list.filter((e) => e.id !== id));
        forget(id);
      }, EXIT_MS);
    },
    [forget],
  );

  const arm = React.useCallback(
    (id: string, ms: number) => {
      if (!timed(ms)) return;
      const handle = setTimeout(() => drop(id), ms);
      timers.current.set(id, { handle, endsAt: Date.now() + ms, left: ms });
    },
    [drop],
  );

  const pause = React.useCallback((id: string) => {
    const t = timers.current.get(id);
    if (!t) return;
    clearTimeout(t.handle);
    t.left = Math.max(0, t.endsAt - Date.now());
    setPausedIds((s) => (s.has(id) ? s : new Set(s).add(id)));
  }, []);

  const resume = React.useCallback(
    (id: string) => {
      const t = timers.current.get(id);
      if (t) {
        t.handle = setTimeout(() => drop(id), t.left);
        t.endsAt = Date.now() + t.left;
      }
      forget(id);
    },
    [drop, forget],
  );

  const add = React.useCallback(
    (opts: ToastOptions) => {
      const id = nextId();
      const ms = opts.duration ?? duration;
      setEntries((list) => {
        const next: Entry[] = [...list, { ...opts, id, ms }];
        // Cap: hard-drop the oldest that isn't already leaving.
        while (next.filter((e) => !e.leaving).length > max) {
          const victim = next.find((e) => !e.leaving);
          if (!victim) break;
          const vt = timers.current.get(victim.id);
          if (vt) clearTimeout(vt.handle);
          timers.current.delete(victim.id);
          victim.leaving = true;
          setTimeout(() => {
            setEntries((l) => l.filter((e) => e.id !== victim.id));
            forget(victim.id);
          }, EXIT_MS);
        }
        return next;
      });
      arm(id, ms);
      return id;
    },
    [arm, duration, forget, max],
  );

  // Tone-specific methods always paint their tone; bare `toast(...)` respects a
  // `tone` in the message / options and otherwise stays neutral.
  const fire = React.useCallback(
    (msg: ToastInput, opts?: Partial<ToastOptions>, tone?: Tone) =>
      add({ title: '', ...norm(msg), ...opts, ...(tone ? { tone } : {}) } as ToastOptions),
    [add],
  );

  /* eslint-disable react-hooks/refs -- `fire` transitively reaches the `timers` ref, but only when a
     consumer invokes toast.*() from an event handler — never during render. `useMemo` just keeps
     the callable API object's identity stable. */
  const toast = React.useMemo<ToastApi>(() => {
    const base = (msg: ToastInput, opts?: Partial<ToastOptions>) => fire(msg, opts);
    const make = (tone: Tone): ToneFn => (msg, opts) => fire(msg, opts, tone);
    return Object.assign(base, {
      success: make('success'),
      error: make('error'),
      warning: make('warning'),
      info: make('info'),
      neutral: make('neutral'),
    }) as ToastApi;
  }, [fire]);
  /* eslint-enable react-hooks/refs */

  const dismiss = React.useCallback(
    (id?: string) => {
      if (id) {
        drop(id);
        return;
      }
      entries.forEach((e) => !e.leaving && drop(e.id));
    },
    [drop, entries],
  );

  const value = React.useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  // Clear every pending timer on unmount.
  React.useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t.handle));
  }, []);

  const [edge, side] = position.split('-') as ['top' | 'bottom', 'right' | 'left' | 'center'];
  const viewport = sx({
    position: 'fixed',
    zIndex: 1200,
    display: 'flex',
    // Newest nearest the anchored edge: normal flow for bottom, reversed for top.
    flexDirection: edge === 'bottom' ? 'column' : 'column-reverse',
    gap: 'var(--space-3)',
    width: 'min(420px, calc(100vw - var(--space-8)))',
    maxHeight: '100dvh',
    padding: 'var(--space-4)',
    pointerEvents: 'none',
    [edge]: 0,
    // Every toast is full-width of the viewport, so the stack edges line up on
    // any side; `alignItems` only matters if a toast were ever narrower.
    alignItems: 'stretch',
    // An *outer* offset on top of the padding above, not just the padding
    // itself — macOS Safari's overlay scrollbar floats over the page rather
    // than reducing its width, so a left/right edge flush at 0 can end up
    // with the scrollbar painted right where the padding was supposed to be
    // the toast's only clearance from the edge.
    ...(side === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { [side]: 'var(--space-2)' }),
  });

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        entries.length > 0 &&
        createPortal(
          <div role="region" aria-label="Notifications" style={viewport}>
            {entries.map((e) => (
              <div
                key={e.id}
                className="sereno-toast-item"
                data-edge={edge}
                data-leaving={e.leaving ? 'true' : undefined}
                onMouseEnter={() => pause(e.id)}
                onMouseLeave={() => resume(e.id)}
                onFocusCapture={() => pause(e.id)}
                onBlurCapture={() => resume(e.id)}
                style={sx({ pointerEvents: 'auto', width: '100%' })}
              >
                <Toast
                  tone={e.tone}
                  title={e.title}
                  description={e.description}
                  icon={e.icon}
                  action={e.action}
                  role={e.tone === 'error' ? 'alert' : 'status'}
                  onClose={() => drop(e.id)}
                  progress={timed(e.ms) && !e.leaving ? { ms: e.ms, paused: pausedIds.has(e.id) } : undefined}
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be called inside <ToastProvider>.');
  return ctx;
}
