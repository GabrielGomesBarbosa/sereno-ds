import * as React from 'react';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';
import { useLatest } from './useLatest';

export type MenuPlace =
  | { strategy: 'inline'; above: boolean; maxH: number }
  | { strategy: 'fixed'; above: boolean; maxH: number; top: number; left: number; width: number };

/**
 * Where a dropdown list sits under its field, for `Select` and `Autocomplete`. Two strategies, picked
 * once per open:
 *  - 'inline' - the common case. A plain `position: absolute` child of the field wrapper. The browser
 *    glues it to the field through *any* scroll (page or an inner overflow container) for free - zero
 *    JS, zero jitter, never closes on scroll. Only re-flips the side if room runs out.
 *  - 'fixed' - used when the field is inside a `position: fixed` container (a Dialog), where an inline
 *    child would be clipped by the dialog's overflow. Portalled to <body>, `position: fixed` at the
 *    anchor's viewport rect. The dialog itself doesn't scroll, so it stays glued; scrolling the dialog
 *    *body* detaches it, and `onDismiss` closes it then.
 *
 * `place` is null until the layout effect has measured, one render after `open`, so the list is only
 * rendered once it has somewhere to be. It is never reset on close, so a second open has it at once.
 * `itemCount` feeds the height estimate used to decide whether to flip above the field.
 */
export function useMenuPlacement({
  open,
  disabled = false,
  anchorRef,
  panelRef,
  itemCount,
  onDismiss,
}: {
  open: boolean;
  /** No dropdown to place (the touch sheet of `Select` needs no anchoring). */
  disabled?: boolean;
  /** The element the list hangs from: the field's trigger or box. */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** The list panel, so scrolling *inside* it is not read as the page moving away. */
  panelRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
  /** The anchor moved away (fixed strategy): close the list. */
  onDismiss: () => void;
}): MenuPlace | null {
  const [place, setPlace] = React.useState<MenuPlace | null>(null);

  // Read through a ref: a new `onDismiss` every render must not re-run the measuring effect below,
  // which would set `place` again and loop.
  const dismissRef = useLatest(onDismiss);

  useIsoLayoutEffect(() => {
    if (!open || disabled) return;
    const t = anchorRef.current;
    if (!t) return;

    const GAP = 6;
    // Non-zero fallback: if the viewport height is unreadable, assume room below
    // rather than flipping the menu up on a bad reading.
    const vh = window.innerHeight || document.documentElement.clientHeight || 900;
    const estH = Math.min(288, itemCount * 36 + 8); // rough list height, no DOM
    const evalRoom = () => {
      const r = t.getBoundingClientRect();
      const roomBelow = vh - r.bottom - 8;
      const roomAbove = r.top - 8;
      const above = roomBelow < Math.min(estH, 200) && roomAbove > roomBelow;
      const maxH = Math.max(120, Math.min(288, Math.round((above ? roomAbove : roomBelow) - GAP)));
      return { r, above, maxH };
    };

    let fixed = false;
    for (let el: HTMLElement | null = t.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).position === 'fixed') {
        fixed = true;
        break;
      }
    }

    if (fixed) {
      const { r, above, maxH } = evalRoom();
      setPlace({ strategy: 'fixed', above, maxH, left: r.left, width: r.width, top: above ? r.top - GAP : r.bottom + GAP });
      const anchorTop = r.top;
      const onScroll = (e: Event) => {
        if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
        if (Math.abs(t.getBoundingClientRect().top - anchorTop) > 1) dismissRef.current();
      };
      // A resize only detaches the list if the anchor moved or changed width: the on-screen keyboard of a
      // phone resizes the window while the field stays where it is, and must not close the list under the user.
      const anchorWidth = r.width;
      const onResize = () => {
        const now = t.getBoundingClientRect();
        if (Math.abs(now.top - anchorTop) > 1 || Math.abs(now.width - anchorWidth) > 1) dismissRef.current();
      };
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onResize);
      };
    }

    // Inline: the menu is a plain absolute child, glued for free. Never reposition
    // or close on scroll - only re-flip the side (rare) and re-cap height on
    // resize.
    const applyFull = () => {
      const { above, maxH } = evalRoom();
      setPlace((prev) =>
        prev?.strategy === 'inline' && prev.above === above && prev.maxH === maxH ? prev : { strategy: 'inline', above, maxH },
      );
    };
    applyFull();
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      const { above } = evalRoom();
      setPlace((prev) => (prev?.strategy === 'inline' && prev.above !== above ? { ...prev, above } : prev));
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', applyFull);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', applyFull);
    };
  }, [open, disabled, itemCount, anchorRef, panelRef, dismissRef]);

  return place;
}
