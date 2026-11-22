import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

afterEach(cleanup);

describe('Avatar', () => {
  describe('initials (no photo)', () => {
    it('shows the first letter of the first two words, in capitals', () => {
      render(<Avatar name="ana luiza souza" />);
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('a single name gives a single letter', () => {
      render(<Avatar name="Marcos" />);
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('ignores extra spaces around and between the words', () => {
      render(<Avatar name="   Beatriz    Dias  " />);
      expect(screen.getByText('BD')).toBeInTheDocument();
    });

    it('shows nothing when there is no name', () => {
      const { container } = render(<Avatar />);
      expect(container).toHaveTextContent('');
    });
  });

  describe('photo', () => {
    it('shows the photo, with the name as its alternative text, instead of the initials', () => {
      render(<Avatar name="Ana Luiza" src="/ana.jpg" />);
      const img = screen.getByRole('img', { name: 'Ana Luiza' });
      expect(img).toHaveAttribute('src', '/ana.jpg');
      expect(screen.queryByText('AL')).toBeNull();
    });
  });

  describe('size', () => {
    it('is a disc of 24, 32, 40 (default), 56 or 80 px', () => {
      const disc = (c: HTMLElement) => (c.firstElementChild!.firstElementChild as HTMLElement).style.width;
      const widths = (['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => {
        const { container, unmount } = render(<Avatar name="Ana" size={size} />);
        const w = disc(container);
        unmount();
        return w;
      });
      expect(widths).toEqual(['24px', '32px', '40px', '56px', '80px']);
      const { container } = render(<Avatar name="Ana" />);
      expect(disc(container)).toBe('40px');
    });
  });

  describe('status dot', () => {
    const dots = (container: HTMLElement) => container.firstElementChild!.children.length;

    it('has no dot unless a status is given', () => {
      const { container } = render(<Avatar name="Ana" />);
      expect(dots(container)).toBe(1);
    });

    it('draws a dot in the colour of the status', () => {
      const colours = (['confirmed', 'pending', 'cancelled'] as const).map((status) => {
        const { container, unmount } = render(<Avatar name="Ana" status={status} />);
        expect(dots(container)).toBe(2);
        const dot = container.firstElementChild!.children[1] as HTMLElement;
        const bg = dot.style.background;
        unmount();
        return bg;
      });
      expect(colours).toEqual(['var(--status-success-dot)', 'var(--status-warning-dot)', 'var(--status-error-dot)']);
    });
  });

  it('passes the standard attributes through', () => {
    render(<Avatar name="Ana" aria-label="Ana Luiza, online" data-id="7" />);
    const el = screen.getByLabelText('Ana Luiza, online');
    expect(el).toHaveAttribute('data-id', '7');
  });
});
