import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Brand } from './Brand';

afterEach(cleanup);

describe('Brand', () => {
  it('the symbol is an image named "Sereno"', () => {
    render(<Brand />);
    expect(screen.getByRole('img', { name: 'Sereno' })).toBeInTheDocument();
    expect(screen.queryByText('sereno')).toBeNull();
  });

  it('the symbol is as tall and wide as `size` (24 by default)', () => {
    const { rerender } = render(<Brand />);
    const svg = () => screen.getByRole('img', { name: 'Sereno' });
    expect(svg()).toHaveAttribute('width', '24');
    expect(svg()).toHaveAttribute('height', '24');
    rerender(<Brand size={64} />);
    expect(svg()).toHaveAttribute('width', '64');
  });

  describe('lockups', () => {
    it('the horizontal lockup shows the wordmark, and the symbol is decorative (the text names it)', () => {
      const { container } = render(<Brand variant="lockup" />);
      expect(screen.getByText('sereno')).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Sereno' })).toBeNull();
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('the horizontal lockup is a row, the vertical one a column', () => {
      const { container, rerender } = render(<Brand variant="lockup" />);
      const root = () => container.firstElementChild as HTMLElement;
      expect(root().style.flexDirection).toBe('row');
      rerender(<Brand variant="lockup-vertical" />);
      expect(root().style.flexDirection).toBe('column');
    });

    it('the wordmark size follows `size`: 78% in a row, 100% in a column', () => {
      const word = () => screen.getByText('sereno').style.fontSize;
      const { rerender } = render(<Brand variant="lockup" size={40} />);
      expect(word()).toBe('31px');
      rerender(<Brand variant="lockup-vertical" size={40} />);
      expect(word()).toBe('40px');
    });
  });

  describe('mono', () => {
    it('is drawn with the surrounding text colour, with no gradient', () => {
      const { container } = render(<Brand mono />);
      expect(container.querySelector('linearGradient')).toBeNull();
      expect(container.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    });

    it('is the brand gradient otherwise', () => {
      const { container } = render(<Brand />);
      expect(container.querySelector('linearGradient')).not.toBeNull();
      expect(container.querySelector('path')!.getAttribute('fill')).toMatch(/^url\(#/);
    });

    it('a mono wordmark takes the text colour too', () => {
      render(<Brand variant="lockup" mono />);
      expect(screen.getByText('sereno').style.color).toBe('currentcolor');
    });
  });

  it('two marks on a page do not share their gradient id', () => {
    const { container } = render(
      <>
        <Brand />
        <Brand />
      </>,
    );
    const ids = [...container.querySelectorAll('linearGradient')].map((g) => g.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('passes the standard attributes through', () => {
    render(<Brand data-testid="brand" />);
    expect(screen.getByTestId('brand')).toBeInTheDocument();
  });
});
