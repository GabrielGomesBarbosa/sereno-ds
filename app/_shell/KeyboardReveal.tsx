'use client';

import { useEffect } from 'react';

/**
 * App-shell workaround — NOT part of the component library (`src/components/**`).
 *
 * `/design-system` and `/agendar` (mobile) scroll inside a nested `overflow: auto`
 * container, not the document. iOS Safari and Chrome still reveal a focused field
 * above the software keyboard in that setup; Brave for iOS does not. This nudges
 * the focused field into view — but only when it is actually covered, so it is a
 * no-op in every browser that already handles it, and on desktop.
 *
 * When the lib is extracted, a host app needs this only if it uses a fixed
 * app-shell with a nested scroller. Pages that scroll the document (e.g.
 * `/onboarding`) don't.
 */
const SELECTOR =
  'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=range]), textarea, select';

export function KeyboardReveal() {
  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;

    let timer = 0;
    let raf = 0;

    const reveal = (el: Element) => {
      const vv = window.visualViewport;
      if (!vv) return;
      // Covered by the keyboard (or within a hair of its top edge)?
      if (el.getBoundingClientRect().bottom > vv.height - 12) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as Element | null;
      if (!el?.matches?.(SELECTOR)) return;
      // Wait for the keyboard to finish animating in, then measure.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => reveal(el));
      }, 300);
    };

    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
