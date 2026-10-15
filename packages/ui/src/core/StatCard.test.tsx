import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StatCard, type StatCardTone } from './StatCard';

afterEach(cleanup);

const style = (el: Element | null | undefined) => el?.getAttribute('style') ?? '';
/** The card itself: the element the caller's className / style land on. */
const card = (c: HTMLElement) => c.firstElementChild as HTMLElement;

describe('StatCard: content', () => {
  it('shows the label, the number and the hint', () => {
    render(<StatCard label="Agendamentos hoje" value={12} hint="3 confirmados" />);
    expect(screen.getByText('Agendamentos hoje')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3 confirmados')).toBeInTheDocument();
  });

  it('the value is any node, shown large and in tabular figures, and is not a heading', () => {
    render(<StatCard label="Faturamento" value={<span data-testid="money">R$ 1.200</span>} />);
    const value = screen.getByTestId('money').parentElement!;
    expect(value.tagName).toBe('SPAN');
    expect(style(value)).toContain('font-variant-numeric: tabular-nums');
    expect(style(value)).toContain('font-size: var(--text-3xl)');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('the label is the eyebrow', () => {
    render(<StatCard label="Pendentes" value={4} />);
    expect(style(screen.getByText('Pendentes'))).toContain('text-transform: uppercase');
  });

  it('without a hint there is no hint line', () => {
    const { container } = render(<StatCard label="A" value={1} />);
    expect(card(container).children).toHaveLength(2);
  });

  it('is a plain div: className, style and other attributes reach the card, the style after its own', () => {
    const { container } = render(<StatCard label="A" value={1} className="mine" data-testid="sc" style={{ minWidth: 200 }} />);
    expect(card(container)).toHaveClass('mine');
    expect(card(container)).toHaveAttribute('data-testid', 'sc');
    expect(style(card(container))).toContain('min-width: 200px');
    expect(style(card(container))).toContain('flex-direction: column');
  });
});

describe('StatCard: tone', () => {
  it('default is the plain card: the Card ring, no tone colors', () => {
    const { container } = render(<StatCard label="A" value={1} hint="h" />);
    expect(style(card(container))).toContain('var(--border-default)');
    expect(style(card(container))).not.toContain('--status-');
    expect(style(screen.getByText('A'))).toContain('color: var(--text-muted)');
    expect(style(screen.getByText('1'))).toContain('color: var(--text-primary)');
  });

  it.each(['success', 'warning', 'error', 'info'] as const)('%s: a ring in the tone, label and number in its text color', (tone) => {
    const { container } = render(<StatCard tone={tone} label="A" value={1} hint="h" />);
    expect(style(card(container))).toContain('0 0 0 1px var(--status-' + tone + '-dot)');
    expect(style(card(container))).not.toContain('var(--border-default)');
    expect(style(screen.getByText('A'))).toContain('color: var(--status-' + tone + '-fg)');
    expect(style(screen.getByText('1'))).toContain('color: var(--status-' + tone + '-fg)');
  });

  it('the hint stays secondary in a status tone, so the tone does not tint every line', () => {
    render(<StatCard tone="warning" label="A" value={1} hint="a dica" />);
    expect(style(screen.getByText('a dica'))).toContain('color: var(--text-secondary)');
  });

  it('neutral: a tinted fill, no shadow, a secondary label (muted would be under AA on that fill)', () => {
    const { container } = render(<StatCard tone="neutral" label="A" value={1} />);
    expect(style(card(container))).toContain('background: var(--bg-subtle)');
    expect(style(card(container))).toContain('0 0 0 1px var(--border-default)');
    expect(style(card(container))).not.toContain('--shadow-');
    expect(style(screen.getByText('A'))).toContain('color: var(--text-secondary)');
    expect(style(screen.getByText('1'))).toContain('color: var(--text-primary)');
  });

  it('every tone of the type is handled (none falls through to an undefined token)', () => {
    const tones: StatCardTone[] = ['default', 'neutral', 'success', 'warning', 'error', 'info'];
    for (const tone of tones) {
      const { container, unmount } = render(<StatCard tone={tone} label="A" value={1} />);
      expect(container.innerHTML).not.toContain('undefined');
      unmount();
    }
  });
});

describe('StatCard: progress', () => {
  it('is a progressbar with the percent, named by the label you give it', () => {
    render(<StatCard label="Ocupação" value="60%" progress={{ percent: 60, label: 'Grade ocupada' }} />);
    const bar = screen.getByRole('progressbar', { name: 'Grade ocupada' });
    expect(bar).toHaveAttribute('aria-valuenow', '60');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(style(bar.firstElementChild)).toContain('width: 60%');
  });

  it('without a label of its own the bar takes the card label', () => {
    render(<StatCard label="Ocupação" value="60%" progress={{ percent: 60 }} />);
    expect(screen.getByRole('progressbar', { name: 'Ocupação' })).toBeInTheDocument();
  });

  it.each([
    [150, '100'],
    [-5, '0'],
    [Number.NaN, '0'],
    [37.5, '37.5'],
  ])('%s is held to 0 to 100: %s', (percent, now) => {
    render(<StatCard label="A" value={1} progress={{ percent }} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', now);
  });

  it('the fill is the primary color, and the text color of the tone in a status tone', () => {
    const { rerender } = render(<StatCard label="A" value={1} progress={{ percent: 40 }} />);
    expect(style(screen.getByRole('progressbar').firstElementChild)).toContain('background: var(--interactive-primary)');
    rerender(<StatCard tone="warning" label="A" value={1} progress={{ percent: 40 }} />);
    expect(style(screen.getByRole('progressbar').firstElementChild)).toContain('background: var(--status-warning-fg)');
  });

  it('no progress, no bar', () => {
    render(<StatCard label="A" value={1} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('StatCard: loading', () => {
  it('is busy, and the real text is not there', () => {
    const { container } = render(<StatCard loading label="Agendamentos hoje" value={12} hint="3 confirmados" />);
    expect(card(container)).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Agendamentos hoje')).toBeNull();
    expect(screen.queryByText('12')).toBeNull();
    expect(screen.queryByText('3 confirmados')).toBeNull();
  });

  it('not loading, it is not marked busy', () => {
    const { container } = render(<StatCard label="A" value={1} />);
    expect(card(container)).not.toHaveAttribute('aria-busy');
  });

  it('a placeholder for the label, the number and the hint, each hidden from a screen reader', () => {
    const { container } = render(<StatCard loading label="A" value={1} hint="h" />);
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3);
  });

  it('mirrors the props: no hint, no hint placeholder; a progress, a bar placeholder instead of the bar', () => {
    const { container } = render(<StatCard loading label="A" value={1} progress={{ percent: 50 }} />);
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3); // label, number, bar
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('every line holds the same height loading and loaded, so the card does not jump when the data arrives', () => {
    const heights = (c: HTMLElement) => [...card(c).children].map((el) => (el as HTMLElement).style.minHeight);
    const props = { label: 'A', value: 1, hint: 'h' };
    const loaded = render(<StatCard {...props} />);
    const loadedHeights = heights(loaded.container);
    loaded.unmount();
    const loading = render(<StatCard {...props} loading />);
    expect(heights(loading.container)).toEqual(loadedHeights);
    // Each is the font size times the line height, from the tokens the text uses: never blank.
    expect(loadedHeights.every((h) => h.startsWith('calc(') && h.includes('var(--'))).toBe(true);
  });

  it('keeps its tone while loading (the ring does not flash away and back)', () => {
    const { container } = render(<StatCard loading tone="warning" label="A" value={1} />);
    expect(style(card(container))).toContain('--status-warning-dot');
  });
});
