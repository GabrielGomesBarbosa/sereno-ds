'use client';

import { useEffect } from 'react';

// The demo app's entry is the hub at /demo. Client redirect keeps this
// static-export-safe. (Cross-app links are finalised in SS-158.)
export default function Index() {
  useEffect(() => {
    window.location.replace('/demo/');
  }, []);
  return null;
}
