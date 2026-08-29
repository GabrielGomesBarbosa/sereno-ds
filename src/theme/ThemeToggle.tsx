'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components';

/**
 * Light/dark switch for the showcase chrome. Resolves the active theme (accounting
 * for `system`) and flips to the opposite. Renders a stable placeholder until
 * mounted to avoid a hydration mismatch on the icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  // Standard next-themes hydration guard: the resolved theme is only known on the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';
  return (
    <IconButton
      variant="secondary"
      label={mounted ? (isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro') : 'Alternar tema'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted && isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </IconButton>
  );
}
