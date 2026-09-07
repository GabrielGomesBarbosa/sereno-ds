import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

afterEach(cleanup);

const bars = (el: HTMLElement) => el.querySelectorAll('[aria-hidden="true"]');

describe('Skeleton', () => {
  it('renders every variant with at least one pulsing bar', () => {
    for (const variant of ['text', 'card', 'avatar', 'block'] as const) {
      const { container, unmount } = render(<Skeleton variant={variant} />);
      const found = bars(container);
      expect(found.length).toBeGreaterThan(0);
      expect((found[0] as HTMLElement).style.animation).toContain('sereno-pulse');
      unmount();
    }
  });

  it('draws one bar per line for variant="text"', () => {
    const { container } = render(<Skeleton variant="text" lines={5} />);
    expect(bars(container)).toHaveLength(5);
  });

  it('the card variant is an avatar + three lines + a trailing pill (5 bars)', () => {
    const { container } = render(<Skeleton variant="card" />);
    expect(bars(container)).toHaveLength(5);
  });

  it('every bar is aria-hidden — a skeleton is not content', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const all = container.querySelectorAll('span');
    expect(all.length).toBeGreaterThan(0);
    all.forEach((s) => expect(s).toHaveAttribute('aria-hidden', 'true'));
  });
});
