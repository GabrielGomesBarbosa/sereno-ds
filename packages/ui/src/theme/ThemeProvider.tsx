'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wraps next-themes so it writes `data-theme="light|dark"` on <html> — the exact
 * hook the Sereno tokens switch on (`[data-theme="dark"]` in colors.css / elevation.css).
 * Defaults to the OS preference; the choice is remembered in localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem enableColorScheme={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
