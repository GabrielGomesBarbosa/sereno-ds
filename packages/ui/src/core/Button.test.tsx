import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

afterEach(cleanup);

describe('Button', () => {
  describe('what it is', () => {
    it('is a button that does not submit a form unless asked to', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button>Save</Button>
        </form>,
      );
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn).toHaveAttribute('type', 'button');
      await userEvent.click(btn);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('can be a submit button', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit">Send</Button>
        </form>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('passes the standard attributes through', () => {
      render(
        <Button aria-label="Close dialog" data-track="close" className="x" id="b1">
          ×
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Close dialog' });
      expect(btn).toHaveAttribute('data-track', 'close');
      expect(btn).toHaveClass('x');
      expect(btn).toHaveAttribute('id', 'b1');
    });

    it('merges a style prop over its own (the caller wins)', () => {
      render(
        <Button fullWidth style={{ width: 120, margin: 3 }}>
          Go
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Go' });
      expect(btn.style.width).toBe('120px');
      expect(btn.style.margin).toBe('3px');
    });
  });

  describe('clicking and the keyboard', () => {
    it('calls onClick on a click', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is reachable with Tab and activated with Enter and with Space', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);
      await userEvent.tab();
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('disabled', () => {
    it('is disabled, ignores clicks and leaves the Tab order', async () => {
      const onClick = vi.fn();
      render(
        <>
          <Button disabled onClick={onClick}>
            Save
          </Button>
          <Button>Next</Button>
        </>,
      );
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn).toBeDisabled();
      await userEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
      await userEvent.tab();
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    });
  });

  describe('loading', () => {
    it('blocks the click and the keyboard, and keeps the label', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Saving
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Saving' });
      expect(btn).toBeDisabled();
      await userEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('swaps the left icon for the spinner, and keeps the right one', () => {
      const { rerender } = render(
        <Button iconLeft={<i data-testid="left" />} iconRight={<i data-testid="right" />}>
          Go
        </Button>,
      );
      expect(screen.getByTestId('left')).toBeInTheDocument();
      rerender(
        <Button loading iconLeft={<i data-testid="left" />} iconRight={<i data-testid="right" />}>
          Go
        </Button>,
      );
      expect(screen.queryByTestId('left')).toBeNull();
      expect(screen.getByTestId('right')).toBeInTheDocument();
      // the spinner takes the place of the icon: the button still starts with an element before the label
      const btn = screen.getByRole('button', { name: 'Go' });
      expect(btn.firstElementChild).not.toBe(screen.getByTestId('right'));
    });
  });

  describe('icons and layout props', () => {
    it('puts iconLeft before the label and iconRight after it', () => {
      render(
        <Button iconLeft={<i data-testid="left" />} iconRight={<i data-testid="right" />}>
          Go
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Go' });
      expect(btn.firstElementChild).toBe(screen.getByTestId('left'));
      expect(btn.lastElementChild).toBe(screen.getByTestId('right'));
      expect(btn).toHaveTextContent('Go');
    });

    it('fills its container with fullWidth, and not otherwise', () => {
      const { rerender } = render(<Button>Go</Button>);
      expect(screen.getByRole('button').style.width).toBe('');
      rerender(<Button fullWidth>Go</Button>);
      expect(screen.getByRole('button').style.width).toBe('100%');
    });

    it('sizes by the control-height token of its size', () => {
      const { rerender } = render(<Button size="sm">Go</Button>);
      expect(screen.getByRole('button').style.height).toBe('var(--control-height-sm)');
      rerender(<Button size="xl">Go</Button>);
      expect(screen.getByRole('button').style.height).toBe('var(--control-height-xl)');
    });

    it('a link variant is inline text: no fixed height, no padding', () => {
      render(<Button variant="link">Read more</Button>);
      const btn = screen.getByRole('button', { name: 'Read more' });
      expect(btn.style.height).toBe('auto');
      expect(btn.style.padding).toBe('0px');
    });

    it('renders every variant as a usable button', () => {
      for (const variant of ['primary', 'accent', 'secondary', 'ghost', 'link', 'success', 'warning', 'error'] as const) {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>);
        expect(screen.getByRole('button', { name: variant })).toBeEnabled();
        unmount();
      }
    });
  });
});
