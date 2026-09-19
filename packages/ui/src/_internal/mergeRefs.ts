import type { Ref, RefCallback } from 'react';

/** Combines a forwarded `ref` with an internal one into a single callback ref
 *  so both stay in sync with the same DOM node. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}
