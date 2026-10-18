import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StatusDot, statusDotStyle, type StatusDotTone } from './StatusDot';

afterEach(cleanup);

const style = (el: Element | null | undefined) => el?.getAttribute('style') ?? '';
const dotOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

describe('StatusDot', () => {
  it('is a neutral 6px dot by default, a block of its own (it is not always inside a flex row)', () => {
    const { container } = render(<StatusDot />);
    expect(style(dotOf(container))).toBe('width: 6px; height: 6px; border-radius: 999px; background: var(--text-muted); flex: 0 0 auto; display: inline-block;');
  });

  it.each([
    ['success', '--status-success-dot'],
    ['warning', '--status-warning-dot'],
    ['error', '--status-error-dot'],
    ['info', '--status-info-dot'],
    ['neutral', '--text-muted'],
  ] as const)('%s paints with %s', (tone, token) => {
    const { container } = render(<StatusDot tone={tone} />);
    expect(style(dotOf(container))).toContain('background: var(' + token + ')');
  });

  it('an unknown tone falls back to neutral, like Badge always did', () => {
    const { container } = render(<StatusDot tone={'nope' as StatusDotTone} />);
    expect(style(dotOf(container))).toContain('background: var(--text-muted)');
  });

  it('sm is 5px and md is 6px, the two dot sizes of Badge', () => {
    const { container, rerender } = render(<StatusDot size="sm" />);
    expect(style(dotOf(container))).toContain('width: 5px; height: 5px');
    rerender(<StatusDot size="md" />);
    expect(style(dotOf(container))).toContain('width: 6px; height: 6px');
  });

  it('with no label it is decorative: no role, no name', () => {
    const { container } = render(<StatusDot tone="success" />);
    expect(dotOf(container)).not.toHaveAttribute('role');
    expect(dotOf(container)).not.toHaveAttribute('aria-label');
  });

  it('with a label it is an image with that name', () => {
    render(<StatusDot tone="success" label="Online" />);
    expect(screen.getByRole('img', { name: 'Online' })).toBeInTheDocument();
  });

  it('className, other attributes and style reach the dot, the style after its own', () => {
    const { container } = render(<StatusDot className="mine" data-testid="d" style={{ marginLeft: 4, display: 'block' }} />);
    expect(dotOf(container)).toHaveClass('mine');
    expect(dotOf(container)).toHaveAttribute('data-testid', 'd');
    expect(style(dotOf(container))).toContain('margin-left: 4px');
    expect(style(dotOf(container))).toContain('display: block');
  });

  it('statusDotStyle is the plain dot Badge draws, with no display of its own', () => {
    expect(statusDotStyle('warning', 'sm')).toEqual({ width: 5, height: 5, borderRadius: '999px', background: 'var(--status-warning-dot)', flex: '0 0 auto' });
    expect(statusDotStyle()).toEqual({ width: 6, height: 6, borderRadius: '999px', background: 'var(--text-muted)', flex: '0 0 auto' });
  });
});

describe('StatusDot pulse', () => {
  it('without pulse there is no ring', () => {
    const { container } = render(<StatusDot tone="success" />);
    expect(container.querySelector('.sereno-status-ping')).toBeNull();
    expect(container.firstElementChild?.children).toHaveLength(0);
  });

  it('a ring behind the dot, in the same tone and size, invisible at rest', () => {
    const { container } = render(<StatusDot tone="warning" size="sm" pulse />);
    const root = dotOf(container);
    const ring = root.querySelector('.sereno-status-ping') as HTMLElement;
    expect(style(root)).toContain('position: relative');
    expect(style(root)).toContain('width: 5px; height: 5px');
    expect(style(ring)).toContain('background: var(--status-warning-dot)');
    expect(style(ring)).toContain('opacity: 0');
    expect(style(ring)).toContain('position: absolute');
    expect(style(ring)).toContain('border-radius: 999px');
  });

  it('the dot itself is still there, above the ring', () => {
    const { container } = render(<StatusDot tone="success" pulse />);
    const kids = [...dotOf(container).children];
    expect(kids).toHaveLength(2);
    expect(kids[0]).toHaveClass('sereno-status-ping');
    expect(style(kids[1])).toContain('background: var(--status-success-dot)');
    expect(style(kids[1])).toContain('position: relative');
  });

  it('className, other attributes and style reach the pulsing dot too, the style after its own', () => {
    const { container } = render(<StatusDot pulse className="mine" data-testid="p" style={{ marginLeft: 4, display: 'block' }} />);
    expect(dotOf(container)).toHaveClass('mine');
    expect(dotOf(container)).toHaveAttribute('data-testid', 'p');
    expect(style(dotOf(container))).toContain('margin-left: 4px');
    expect(style(dotOf(container))).toContain('display: block');
  });

  it('a label still names the pulsing dot, once', () => {
    render(<StatusDot tone="success" pulse label="Open now" />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Open now' })).toBeInTheDocument();
  });
});
