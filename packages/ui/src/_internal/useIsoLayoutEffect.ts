import * as React from 'react';

/** `useLayoutEffect` in the browser, `useEffect` on the server (React 18 warns
 *  about the former during SSR). */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
