'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { sx } from '../_internal/style';

/**
 * Modal (desktop), bottom sheet (mobile) or full-screen — a **compound
 * component**. Portalled to `<body>` and fixed to the viewport, so no
 * ancestor's `overflow`/`transform`/positioning can trap it. While open it
 * locks page scroll and closes on `Escape`. Host needs the `sereno-pop` /
 * `sereno-slide-up` keyframes (see globals.css).
 *
 * ```tsx
 * <Dialog open={open} onClose={close} footer={false}>
 *   <Dialog.Header title="Cancel booking?" description="…">
 *     <Dialog.Close />
 *   </Dialog.Header>
 *   <Dialog.Body>…</Dialog.Body>
 *   <Dialog.Footer>
 *     <Button variant="ghost" onClick={close}>Back</Button>
 *     <Button variant="error" onClick={confirm}>Cancel booking</Button>
 *   </Dialog.Footer>
 * </Dialog>
 * ```
 *
 * `Dialog.Header` / `Dialog.Footer` are both optional — a dialog can be just
 * a `Dialog.Body`. `Dialog.Close` goes wherever you put it (typically inside
 * `Dialog.Header`); nothing renders a close button unless you add one.
 */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  /** `sheet` slides up from the bottom (mobile default); `fullscreen` fills the viewport. */
  variant?: 'center' | 'sheet' | 'fullscreen';
  /** Max width of the centered modal. Ignored for `sheet` / `fullscreen`. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hairline rules between header / body / footer, MUI-style. The body scrolls on its own. */
  dividers?: boolean;
  /**
   * When `false`, a scrim click and `Escape` no longer close the dialog — only
   * `Dialog.Close`, a footer action, or `open={false}` do. Use it for a choice
   * the user must make explicitly. Defaults to `true`.
   */
  dismissible?: boolean;
  /** Explicit pixel width — overrides `size`. */
  width?: number;
  children?: React.ReactNode;
}

export interface DialogHeaderProps {
  title?: string;
  description?: string;
  /** Extra content below the description — or the whole header, if you skip `title`/`description`. Put `Dialog.Close` here. */
  children?: React.ReactNode;
}

export interface DialogBodyProps {
  children?: React.ReactNode;
}

export interface DialogFooterProps {
  /** Action buttons, right-aligned. */
  children?: React.ReactNode;
}

interface DialogContextValue {
  titleId: string;
  onClose?: () => void;
  full: boolean;
  dividers: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
}

const SIZE_W = { sm: 440, md: 600, lg: 800, xl: 1000 } as const;

// Cheap, dependency-free focusable check — matches what most hand-rolled
// focus traps use. No visibility filtering: nothing inside a Dialog is ever
// conditionally hidden today, and jsdom doesn't compute layout (offsetParent
// is always null there), so a visibility check would be untestable dead
// weight rather than a real safeguard.
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
function focusableIn(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error(`<Dialog.${component}> must be rendered inside <Dialog>.`);
  return ctx;
}

function DialogRoot({
  open = true,
  children,
  onClose,
  variant = 'center',
  size = 'sm',
  dividers = false,
  dismissible = true,
  width,
  style,
  ...rest
}: DialogProps) {
  const sheet = variant === 'sheet';
  const full = variant === 'fullscreen';
  const rid = React.useId();
  const titleId = `${rid}-title`;

  // Portal target is client-only.
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
  React.useEffect(() => setMounted(true), []);

  // While open: lock page scroll, bind Escape to close, trap Tab inside the
  // panel, and restore focus to whatever had it before opening once closed.
  // `onClose` / `dismissible` are read through refs so the effect only
  // re-runs when `open` flips.
  const onCloseRef = React.useRef(onClose);
  const dismissibleRef = React.useRef(dismissible);
  React.useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const prev = { h: root.style.overflow, b: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dismissibleRef.current) onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = focusableIn(panel);
      // No focusable content (a bare Dialog.Body with plain text): keep
      // focus pinned on the panel itself rather than leaking to the page.
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev.h;
      document.body.style.overflow = prev.b;
      document.removeEventListener('keydown', onKey);
      // The trigger may itself have unmounted (e.g. a row it lived in was
      // removed) — focus() on a detached element is a silent no-op, not a
      // throw, so no need to guard beyond the null check.
      previouslyFocused?.focus();
    };
  }, [open]);

  // Pull focus into the dialog when it opens.
  React.useEffect(() => {
    if (open && mounted) panelRef.current?.focus();
  }, [open, mounted]);

  if (!open || !mounted) return null;

  // Body/Footer padding depends on whether a Header/Footer is actually
  // present — read straight off the children, the same technique
  // SidebarNav.Item / Stepper use for data they need before render.
  const items = React.Children.toArray(children);
  const hasHeader = items.some((c) => React.isValidElement(c) && c.type === Header);
  const hasFooter = items.some((c) => React.isValidElement(c) && c.type === Footer);

  const ctx: DialogContextValue = { titleId, onClose, full, dividers, hasHeader, hasFooter };

  return createPortal(
    <div
      style={sx({
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: sheet ? 'flex-end' : 'center',
        justifyContent: 'center',
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(2px)',
        padding: sheet || full ? 0 : 'var(--space-5)',
      })}
      onClick={dismissible ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasHeader ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        {...rest}
        style={sx({
          width: full || sheet ? '100%' : 'min(100%,' + (width ?? SIZE_W[size]) + 'px)',
          height: full ? '100%' : undefined,
          maxHeight: full ? undefined : sheet ? '90dvh' : 'calc(100dvh - var(--space-6))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          outline: 'none',
          background: 'var(--bg-surface)',
          borderRadius: full ? 0 : sheet ? 'var(--radius-sheet) var(--radius-sheet) 0 0' : 'var(--radius-lg)',
          border: full ? 'none' : 'var(--border-width-hairline) solid var(--border-default)',
          boxShadow: full ? 'none' : sheet ? 'var(--shadow-sheet)' : 'var(--shadow-lg)',
          animation: sheet ? 'sereno-slide-up var(--duration-sheet) var(--ease-gentle)' : 'sereno-pop var(--duration-normal) var(--ease-out)',
          ...style,
        })}
      >
        {sheet && (
          <span
            aria-hidden
            style={sx({ width: 36, height: 4, borderRadius: '999px', background: 'var(--border-strong)', alignSelf: 'center', marginTop: 'var(--space-2)', flex: '0 0 auto' })}
          />
        )}
        <DialogContext.Provider value={ctx}>{children}</DialogContext.Provider>
      </div>
    </div>,
    document.body,
  );
}

function Header({ title, description, children }: DialogHeaderProps) {
  const { titleId, dividers } = useDialogContext('Header');
  const pad = 'var(--space-5)';
  const hairline = 'var(--border-width-hairline) solid var(--border-default)';

  const items = React.Children.toArray(children);
  const closeEl = items.find((c) => React.isValidElement(c) && c.type === Close);
  const extra = items.filter((c) => c !== closeEl);

  return (
    <div
      style={sx({
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: dividers ? pad : `${pad} ${pad} var(--space-3)`,
        borderBottom: dividers ? hairline : undefined,
      })}
    >
      <div id={titleId} style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' })}>
        {title && (
          <h3
            style={sx({
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              margin: 0,
            })}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            style={sx({
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-normal)',
              color: 'var(--text-secondary)',
              margin: 0,
            })}
          >
            {description}
          </p>
        )}
        {extra}
      </div>
      {closeEl}
    </div>
  );
}

function Body({ children }: DialogBodyProps) {
  const { dividers, hasHeader, hasFooter, full } = useDialogContext('Body');
  const pad = 'var(--space-5)';
  return (
    <div
      style={sx({
        flex: full ? '1 1 auto' : '0 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        padding: dividers ? pad : hasHeader ? `0 ${pad} ${hasFooter ? 'var(--space-3)' : pad}` : pad,
      })}
    >
      {children}
    </div>
  );
}

function Footer({ children }: DialogFooterProps) {
  const { dividers } = useDialogContext('Footer');
  const pad = 'var(--space-5)';
  const hairline = 'var(--border-width-hairline) solid var(--border-default)';
  return (
    <div
      style={sx({
        flex: '0 0 auto',
        display: 'flex',
        gap: 'var(--space-3)',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        padding: dividers ? pad : `0 ${pad} ${pad}`,
        borderTop: dividers ? hairline : undefined,
      })}
    >
      {children}
    </div>
  );
}

function Close() {
  const { onClose, full } = useDialogContext('Close');
  return (
    <button
      type="button"
      className="sereno-dialog-close"
      aria-label="Fechar"
      onClick={onClose}
      style={sx({
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: full ? 40 : 34,
        height: full ? 40 : 34,
        margin: full ? 0 : '-3px -5px 0 0',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        background: full ? 'var(--bg-subtle)' : 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      })}
    >
      <X size={full ? 22 : 18} strokeWidth={2} />
    </button>
  );
}

export const Dialog = Object.assign(DialogRoot, { Header, Body, Footer, Close });
