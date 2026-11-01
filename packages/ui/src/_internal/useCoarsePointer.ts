import * as React from 'react';

/** True on touch / pen devices, where rows get finger-sized (and `Select` opens a sheet). SSR-safe. */
export function useCoarsePointer(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(pointer: coarse)');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(pointer: coarse)').matches,
    () => false,
  );
}
