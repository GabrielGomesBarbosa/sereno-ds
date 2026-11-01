import * as React from 'react';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';
import { useLatest } from './useLatest';

/** The minimal scroll: nothing moves if the option is already visible. Also scrolls the ancestors, if need be. */
export function revealNearest(el: HTMLElement): void {
  el.scrollIntoView({ block: 'nearest' });
}

/**
 * The same minimal scroll, but only inside the option's own list: the page and a Dialog behind it
 * never move. For a list that opens under a text box that has the keyboard open.
 */
export function revealInList(el: HTMLElement): void {
  const list = el.parentElement;
  if (!list) return;
  const top = el.offsetTop;
  const bottom = top + el.offsetHeight;
  if (top < list.scrollTop) list.scrollTop = top;
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
}

/**
 * Keep the active option of an open list in view: once the list exists, and again whenever the active
 * option itself changes (the keyboard, the pointer). On the desktop the list is only rendered after
 * `place` is known (one render after the open), so on the first open there is nothing to scroll in the
 * commit where `open` turns true; `place` is in the deps so this runs again the moment the list is
 * there (SS-568). It is a layout effect so the list is already on the option when it is first painted,
 * not at the top for a frame.
 *
 * It reveals once per option (`revealed`): a list the app pages from the server grows while it is open
 * (`options.length`, and so `place` in the portalled case, change with every page), and a user who
 * scrolled down to ask for the next page must not be pulled back to the active option. Closing resets it.
 *
 * `activeId` is the DOM id of the active option, or null when none is. `shouldReveal` can decline a
 * reveal (the option is then counted as revealed, so it is not asked again): for an option that
 * becomes active by itself, not by the user, that should not take the list away from where the
 * user has put it.
 */
export function useRevealActive(
  open: boolean,
  activeId: string | null,
  place: unknown,
  reveal: (el: HTMLElement) => void = revealNearest,
  shouldReveal?: (el: HTMLElement) => boolean,
): void {
  const revealed = React.useRef<string | null>(null);
  const shouldRevealRef = useLatest(shouldReveal);
  useIsoLayoutEffect(() => {
    if (!open) {
      revealed.current = null;
      return;
    }
    if (activeId === null || activeId === revealed.current) return;
    const el = document.getElementById(activeId);
    if (!el) return; // the list is not rendered yet; `place` arriving runs this again
    revealed.current = activeId;
    if (shouldRevealRef.current && !shouldRevealRef.current(el)) return;
    reveal(el);
  }, [open, activeId, place, reveal, shouldRevealRef]);
}
