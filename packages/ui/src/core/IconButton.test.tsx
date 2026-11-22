import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

/**
 * The colour of the frame, however the component writes it: the `--sd-bd` custom property its CSS rule reads
 * (hover, press and focus are CSS since SS-577), or an inline `border` shorthand (how it was written before).
 * The test is about the outcome, a framed button or a borderless one, not about which of the two is used.
 */
const frame = (el: HTMLElement) => el.style.getPropertyValue('--sd-bd') || el.style.border;

afterEach(cleanup);

const icon = <svg data-testid="icon" aria-hidden width={16} height={16} />;

describe('IconButton', () => {
  it('is named by its label: aria-label and tooltip, since it has no text', () => {
    render(<IconButton label="Back">{icon}</IconButton>);
    const btn = screen.getByRole('button', { name: 'Back' });
    expect(btn).toHaveAttribute('aria-label', 'Back');
    expect(btn).toHaveAttribute('title', 'Back');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('is a button that does not submit a form unless asked to', () => {
    render(<IconButton label="Back">{icon}</IconButton>);
    expect(screen.getByRole('button', { name: 'Back' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick, with a click and with the keyboard', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Back" onClick={onClick}>
        {icon}
      </IconButton>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('is disabled: ignores clicks', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Back" disabled onClick={onClick}>
        {icon}
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Back' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is a square of 32, 40 or 48 px by size', () => {
    const { rerender } = render(
      <IconButton label="Back" size="sm">
        {icon}
      </IconButton>,
    );
    const size = () => {
      const s = screen.getByRole('button', { name: 'Back' }).style;
      return [s.width, s.height];
    };
    expect(size()).toEqual(['32px', '32px']);
    rerender(
      <IconButton label="Back">
        {icon}
      </IconButton>,
    );
    expect(size()).toEqual(['40px', '40px']);
    rerender(
      <IconButton label="Back" size="lg">
        {icon}
      </IconButton>,
    );
    expect(size()).toEqual(['48px', '48px']);
  });

  it('the secondary variant is framed, the others are not', () => {
    const { rerender } = render(
      <IconButton label="Back" variant="secondary">
        {icon}
      </IconButton>,
    );
    expect(frame(screen.getByRole('button'))).toContain('var(--border-default)');
    rerender(
      <IconButton label="Back" variant="ghost">
        {icon}
      </IconButton>,
    );
    expect(frame(screen.getByRole('button'))).toContain('transparent');
  });

  it('passes the standard attributes through and lets the caller style it', () => {
    render(
      <IconButton label="Back" data-track="back" style={{ margin: 2 }}>
        {icon}
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Back' });
    expect(btn).toHaveAttribute('data-track', 'back');
    expect(btn.style.margin).toBe('2px');
  });

  it('renders every variant as a usable button', () => {
    for (const variant of ['ghost', 'secondary', 'primary', 'success', 'warning', 'error'] as const) {
      const { unmount } = render(
        <IconButton label={variant} variant={variant}>
          {icon}
        </IconButton>,
      );
      expect(screen.getByRole('button', { name: variant })).toBeEnabled();
      unmount();
    }
  });
});
