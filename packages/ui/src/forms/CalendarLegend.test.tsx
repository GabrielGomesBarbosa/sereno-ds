import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { CalendarLegend } from './CalendarLegend';

afterEach(cleanup);

const style = (el: Element | null) => el?.getAttribute('style') ?? '';
/** The swatch of an item: the aria-hidden box before its label. */
const swatchOf = (li: HTMLElement) => li.querySelector<HTMLElement>('[aria-hidden]');

describe('CalendarLegend', () => {
  it('is a list with one entry per item, in order, each with its label', () => {
    render(<CalendarLegend items={[{ label: 'Tem agendamento', dot: true }, { label: 'Hoje', outline: true }]} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Tem agendamento', 'Hoje']);
  });

  it('an item with neither dot nor outline is only its label', () => {
    render(<CalendarLegend items={[{ label: 'Sem marca' }]} />);
    expect(swatchOf(screen.getByRole('listitem'))).toBeNull();
  });

  it('a dot is the calendar dot: 6px, brand by default, hidden from a screen reader', () => {
    render(<CalendarLegend items={[{ label: 'Tem agendamento', dot: true }]} />);
    const swatch = swatchOf(screen.getByRole('listitem'))!;
    const dot = swatch.firstElementChild as HTMLElement;
    expect(swatch).toHaveAttribute('aria-hidden', 'true');
    expect(style(dot)).toContain('width: 6px');
    expect(style(dot)).toContain('height: 6px');
    expect(style(dot)).toContain('background: var(--interactive-primary)');
  });

  it('a dot can take a tone, like dayDots', () => {
    render(<CalendarLegend items={[{ label: 'Pendente', dot: 'warning' }]} />);
    const dot = swatchOf(screen.getByRole('listitem'))!.firstElementChild as HTMLElement;
    expect(style(dot)).toContain('background: var(--status-warning-dot)');
  });

  it('an outline is the ring the calendar draws around today', () => {
    render(<CalendarLegend items={[{ label: 'Hoje', outline: true }]} />);
    const ring = swatchOf(screen.getByRole('listitem'))!.firstElementChild as HTMLElement;
    expect(style(ring)).toContain('inset 0 0 0 1px var(--border-brand)');
    expect(ring.children).toHaveLength(0);
  });

  it('a dot with an outline sits inside the ring', () => {
    render(<CalendarLegend items={[{ label: 'Hoje, com agendamento', dot: true, outline: true }]} />);
    const ring = swatchOf(screen.getByRole('listitem'))!.firstElementChild as HTMLElement;
    expect(style(ring)).toContain('inset 0 0 0 1px');
    expect(style(ring.firstElementChild)).toContain('background: var(--interactive-primary)');
  });

  it('passes className, style and other attributes to the list, the style after its own', () => {
    render(<CalendarLegend items={[{ label: 'A' }]} className="legend" data-testid="legend" style={{ justifyContent: 'flex-start' }} />);
    const ul = screen.getByTestId('legend');
    expect(ul).toHaveClass('legend');
    expect(style(ul)).toContain('justify-content: flex-start');
    expect(style(ul)).toContain('flex-wrap: wrap');
  });

  it('with no items it is an empty list, not a crash', () => {
    const { container } = render(<CalendarLegend items={[]} />);
    expect(container.querySelector('ul')?.children).toHaveLength(0);
  });
});
