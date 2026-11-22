import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

const html = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  html.removeAttribute('data-theme');
});
afterEach(cleanup);

const renderToggle = (props: React.ComponentProps<typeof ThemeToggle> = {}) =>
  render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>,
  );

describe('ThemeToggle', () => {
  it('is one button, named by what it will do', async () => {
    renderToggle();
    expect(await screen.findByRole('button', { name: 'Mudar para tema escuro' })).toHaveAttribute('type', 'button');
  });

  it('goes to dark on a click, and back to light on the next one', async () => {
    renderToggle();
    await userEvent.click(await screen.findByRole('button', { name: 'Mudar para tema escuro' }));
    await waitFor(() => expect(html).toHaveAttribute('data-theme', 'dark'));
    await userEvent.click(await screen.findByRole('button', { name: 'Mudar para tema claro' }));
    await waitFor(() => expect(html).toHaveAttribute('data-theme', 'light'));
    expect(screen.getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument();
  });

  it('remembers the choice for the next visit', async () => {
    renderToggle();
    await userEvent.click(await screen.findByRole('button', { name: 'Mudar para tema escuro' }));
    await waitFor(() => expect(localStorage.getItem('theme')).toBe('dark'));
  });

  it('opens in dark when dark was chosen before, and offers light', async () => {
    localStorage.setItem('theme', 'dark');
    renderToggle();
    expect(await screen.findByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument();
  });

  it('shows the moon in light and the sun in dark', async () => {
    const { container } = renderToggle();
    await screen.findByRole('button', { name: 'Mudar para tema escuro' });
    expect(container.querySelector('svg.lucide-moon')).not.toBeNull();
    await userEvent.click(screen.getByRole('button'));
    await screen.findByRole('button', { name: 'Mudar para tema claro' });
    expect(container.querySelector('svg.lucide-sun')).not.toBeNull();
  });

  it('is a framed (secondary) button by default, and borderless with variant="ghost"', async () => {
    const { rerender } = renderToggle();
    expect((await screen.findByRole('button')).style.border).toContain('var(--border-default)');
    rerender(
      <ThemeProvider>
        <ThemeToggle variant="ghost" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button').style.border).toContain('transparent');
  });
});
