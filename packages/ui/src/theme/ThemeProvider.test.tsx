import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { ThemeProvider } from './ThemeProvider';

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <p>
      theme:{theme} resolved:{resolvedTheme}
    </p>
  );
}

const html = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  html.removeAttribute('data-theme');
  html.style.colorScheme = '';
});
afterEach(cleanup);

describe('ThemeProvider', () => {
  it('renders what it wraps', () => {
    render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('writes data-theme on <html>, the hook the tokens switch on', async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(html).toHaveAttribute('data-theme', 'light'));
  });

  it('starts from the system preference (light here: the test environment prefers light)', async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText(/theme:system/)).toBeInTheDocument());
    expect(screen.getByText(/resolved:light/)).toBeInTheDocument();
  });

  it('remembers the choice: a stored "dark" wins over the system', async () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(html).toHaveAttribute('data-theme', 'dark'));
    expect(screen.getByText(/theme:dark/)).toBeInTheDocument();
  });

  it('does not touch color-scheme (the tokens set their own colours)', async () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(html).toHaveAttribute('data-theme', 'dark'));
    expect(html.style.colorScheme).toBe('');
  });
});
