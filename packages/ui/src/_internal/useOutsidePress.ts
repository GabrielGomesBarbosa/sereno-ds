import * as React from 'react';
import { useLatest } from './useLatest';

/**
 * Calls `onOutside` when a pointer goes down anywhere outside every element in `refs`, while `enabled`.
 * What `Select`, `Menu`, `Autocomplete`, `DatePicker` and the month / year popover of the calendar all do
 * to close their popup on a press elsewhere (SS-575): one place, one behavior.
 *
 * It listens on `document` in the **capture** phase, so a component that stops the event on its way down
 * cannot hide a press from it. `refs` and `onOutside` are read when the event arrives, so passing a new
 * array or a new callback every render does not re-subscribe. A ref that is `null` (not mounted) counts
 * as "nothing there", so a press is outside of it.
 */
export function useOutsidePress(
  enabled: boolean,
  refs: ReadonlyArray<React.RefObject<Element | null>>,
  onOutside: (event: PointerEvent) => void,
): void {
  const refsRef = useLatest(refs);
  const onOutsideRef = useLatest(onOutside);
  React.useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (refsRef.current.some((r) => r.current?.contains(target))) return;
      onOutsideRef.current(e);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [enabled, refsRef, onOutsideRef]);
}
