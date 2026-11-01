import * as React from 'react';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

/**
 * The newest value of something that changes every render (a callback prop, usually), readable from
 * an effect or an event listener without that effect having to depend on it and re-run.
 */
export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
