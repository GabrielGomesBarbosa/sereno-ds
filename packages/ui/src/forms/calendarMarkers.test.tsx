import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DateTimePicker } from './DateTimePicker';
import { DatePicker } from './DatePicker';
import { CalendarLegend } from './CalendarLegend';
import type { CalendarDayContext } from './DateTimePicker';

afterEach(cleanup);

// "Today" is fixed so the ring, `aria-current` and `context.today` are deterministic. Only Date
// is faked, so timers and Testing Library's own waiting keep working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 15, 12));
});
afterEach(() => vi.useRealTimers());

// October 2026 (today is the 15th), 31 days. January 2026 is a month with no today in it.
const OCT = { year: 2026, month: 9 };
const JAN = { year: 2026, month: 0 };

const day = (container: HTMLElement, n: number) => container.querySelector<HTMLButtonElement>(`[data-day="${n}"]`)!;
/** The dot under a day: the 6px circle (aria-hidden, so it is not read twice). */
const dotOf = (container: HTMLElement, n: number) => day(container, n).querySelector<HTMLElement>('span[aria-hidden]');
const style = (el: HTMLElement | null) => el?.getAttribute('style') ?? '';

describe('renderDay context', () => {
  /** Calls of `renderDay` collected as `day -> context`, from the last render of each day. */
  function collect(props: React.ComponentProps<typeof DateTimePicker>) {
    const seen = new Map<number, CalendarDayContext>();
    const utils = render(
      <DateTimePicker
        {...props}
        renderDay={(d, ctx) => {
          seen.set(d, ctx);
          return null;
        }}
      />,
    );
    return { seen, ...utils };
  }

  it('a plain `(day) =>` still works: the second argument is only an addition', () => {
    const { container } = render(<DateTimePicker {...OCT} renderDay={(d) => (d === 3 ? <b data-testid="count">2</b> : null)} />);
    expect(day(container, 3)).toContainElement(screen.getByTestId('count'));
  });

  it('selected is true on the selected day only', () => {
    const { seen } = collect({ ...OCT, selectedDate: 20 });
    expect(seen.get(20)?.selected).toBe(true);
    expect([...seen].filter(([, c]) => c.selected).map(([d]) => d)).toEqual([20]);
  });

  it('selected is true on no day when none is selected', () => {
    const { seen } = collect({ ...OCT });
    expect([...seen.values()].some((c) => c.selected)).toBe(false);
  });

  it('the selection belongs to the month it was made in, as the highlight does', () => {
    const { seen, container } = collect({ ...OCT, selectedDate: 20 });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    // November on screen now: the 20th is not selected there (aria-pressed says the same).
    expect(day(container, 20)).toHaveAttribute('aria-pressed', 'false');
    // The last context given for the 20th is the November one.
    expect(seen.get(20)?.selected).toBe(false);
  });

  it('today is true on the current day of the current month only', () => {
    const { seen } = collect({ ...OCT });
    expect(seen.get(15)?.today).toBe(true);
    expect([...seen].filter(([, c]) => c.today).map(([d]) => d)).toEqual([15]);
  });

  it('no day is today in another month', () => {
    const { seen } = collect({ ...JAN });
    expect([...seen.values()].some((c) => c.today)).toBe(false);
  });

  it('unavailable covers a listed day', () => {
    const { seen } = collect({ ...OCT, unavailable: [4, 5] });
    expect([...seen].filter(([, c]) => c.unavailable).map(([d]) => d)).toEqual([4, 5]);
  });

  it('unavailable covers a day outside min / max with no need to list it', () => {
    const { seen } = collect({ ...OCT, min: '2026-10-10', max: '2026-10-25' });
    const off = [...seen].filter(([, c]) => c.unavailable).map(([d]) => d);
    expect(off).toContain(9);
    expect(off).toContain(26);
    expect(off).not.toContain(10);
    expect(off).not.toContain(25);
  });

  it('the three flags are independent: a selected, unavailable today is all three', () => {
    const { seen } = collect({ ...OCT, selectedDate: 15, unavailable: [15] });
    expect(seen.get(15)).toEqual({ selected: true, today: true, unavailable: true });
  });
});

describe('dayDots', () => {
  it('a list of days: a dot on exactly those days, none elsewhere', () => {
    const { container } = render(<DateTimePicker {...OCT} dayDots={[3, 17]} />);
    expect(dotOf(container, 3)).not.toBeNull();
    expect(dotOf(container, 17)).not.toBeNull();
    expect(container.querySelectorAll('[data-day] span[aria-hidden]')).toHaveLength(2);
  });

  it('no dayDots and no renderDay: a day is its number and nothing else (nothing that existed changes)', () => {
    const { container } = render(<DateTimePicker {...OCT} />);
    for (const n of [1, 15, 31]) {
      expect(day(container, n).children).toHaveLength(1);
      expect(day(container, n)).toHaveTextContent(String(n));
    }
    expect(day(container, 1)).toHaveStyle({ height: '38px' });
  });

  it('an empty list still makes room: the slot exists, so cells grow like renderDay does', () => {
    const { container } = render(<DateTimePicker {...OCT} dayDots={[]} />);
    expect(day(container, 1)).toHaveStyle({ height: '48px' });
  });

  it('is brand by default and takes the tone from the object form', () => {
    const { container } = render(<DateTimePicker {...OCT} dayDots={{ 3: {}, 5: { tone: 'warning' }, 7: { tone: 'success' } }} />);
    expect(style(dotOf(container, 3))).toContain('background: var(--interactive-primary)');
    expect(style(dotOf(container, 5))).toContain('background: var(--status-warning-dot)');
    expect(style(dotOf(container, 7))).toContain('background: var(--status-success-dot)');
  });

  it('on the selected day the dot turns to the primary foreground, so it does not vanish into the fill', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={17} dayDots={{ 3: {}, 17: { tone: 'warning' } }} />);
    expect(style(dotOf(container, 17))).toContain('background: var(--interactive-primary-fg)');
    expect(style(dotOf(container, 3))).toContain('background: var(--interactive-primary)');
  });

  it('after the selection moves, the dot it left goes back to its own color', () => {
    // `selectedDate` is the parent's to move, so the picker is hosted the way an app uses it.
    function Host() {
      const [picked, setPicked] = React.useState(3);
      return <DateTimePicker {...OCT} selectedDate={picked} onSelectDate={setPicked} dayDots={[3, 17]} />;
    }
    const { container } = render(<Host />);
    expect(style(dotOf(container, 3))).toContain('--interactive-primary-fg');
    fireEvent.click(day(container, 17));
    expect(style(dotOf(container, 17))).toContain('--interactive-primary-fg');
    expect(style(dotOf(container, 3))).not.toContain('--interactive-primary-fg');
  });

  it('a dot on a day that cannot be picked fades', () => {
    const { container } = render(<DateTimePicker {...OCT} unavailable={[3]} dayDots={[3, 4]} />);
    expect(style(dotOf(container, 3))).toContain('opacity: 0.45');
    expect(style(dotOf(container, 4))).toContain('opacity: 1');
  });

  it('is named for a screen reader: the day number, then the default text (pt-BR and en)', () => {
    const { container, rerender } = render(<DateTimePicker {...OCT} dayDots={[3]} />);
    expect(screen.getByRole('button', { name: '3 com marcador' })).toBe(day(container, 3));
    rerender(<DateTimePicker {...OCT} locale="en" dayDots={[3]} />);
    expect(screen.getByRole('button', { name: '3 marked' })).toBe(day(container, 3));
  });

  it('dayDotLabel names every dot, and a dot label wins over it', () => {
    render(<DateTimePicker {...OCT} dayDotLabel="com agendamento" dayDots={{ 3: {}, 5: { label: 'Pendente' } }} />);
    expect(screen.getByRole('button', { name: '3 com agendamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5 Pendente' })).toBeInTheDocument();
  });

  it('a day with no dot keeps its plain name', () => {
    render(<DateTimePicker {...OCT} dayDots={[3]} />);
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
  });

  it('shares the slot with renderDay: both show on the same day', () => {
    const { container } = render(<DateTimePicker {...OCT} dayDots={[3]} renderDay={(d) => (d === 3 ? <b data-testid="n">2</b> : null)} />);
    expect(day(container, 3)).toContainElement(screen.getByTestId('n'));
    expect(dotOf(container, 3)).not.toBeNull();
  });

  it('follows the month on screen: the numbers are the visible month, so refreshing them in onMonthChange works', () => {
    function Host() {
      const [dots, setDots] = React.useState<number[]>([3]);
      return <DateTimePicker {...OCT} dayDots={dots} onMonthChange={() => setDots([20])} />;
    }
    const { container } = render(<Host />);
    expect(dotOf(container, 3)).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(dotOf(container, 3)).toBeNull();
    expect(dotOf(container, 20)).not.toBeNull();
  });
});

describe('today', () => {
  it('is marked with aria-current="date" and a thin ring, and only today is', () => {
    const { container } = render(<DateTimePicker {...OCT} />);
    expect(day(container, 15)).toHaveAttribute('aria-current', 'date');
    expect(style(day(container, 15))).toContain('inset 0 0 0 1px var(--border-brand)');
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    expect(style(day(container, 14))).not.toContain('inset');
  });

  it('no ring and no aria-current in a month that has no today', () => {
    const { container } = render(<DateTimePicker {...JAN} />);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
    expect(container.innerHTML).not.toContain('inset 0 0 0 1px');
  });

  it('when today is the selected day the fill says it, so there is no ring (aria-current stays)', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={15} />);
    expect(day(container, 15)).toHaveAttribute('aria-current', 'date');
    expect(style(day(container, 15))).not.toContain('inset 0 0 0 1px');
  });

  it('the ring follows the month: gone when you navigate away, back when you return', () => {
    const { container } = render(<DateTimePicker {...OCT} />);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(day(container, 15)).toHaveAttribute('aria-current', 'date');
  });
});

describe('DatePicker', () => {
  const open = () => fireEvent.click(screen.getByRole('button', { name: 'Data' }));

  it('passes renderDay (with the context) and dayDots to its calendar', () => {
    const seen: Record<number, CalendarDayContext> = {};
    render(
      <DatePicker
        label="Data"
        defaultValue="2026-10-12"
        dayDots={[3]}
        renderDay={(d, ctx) => {
          seen[d] = ctx;
          return d === 5 ? <b data-testid="n">9</b> : null;
        }}
      />,
    );
    open();
    expect(screen.getByRole('button', { name: '3 com marcador' })).toBeInTheDocument();
    expect(screen.getByTestId('n')).toBeInTheDocument();
    expect(seen[12]).toEqual({ selected: true, today: false, unavailable: false });
    expect(seen[15].today).toBe(true);
  });

  it('without them, its calendar is the one it always was (square cells, nothing under the number)', () => {
    render(<DatePicker label="Data" defaultValue="2026-10-12" />);
    open();
    const d12 = screen.getByRole('button', { name: '12' });
    expect(d12.children).toHaveLength(1);
    expect(d12).toHaveStyle({ aspectRatio: '1' });
  });

  it('onMonthChange reports the month after each step, and not when the popover opens', () => {
    const onMonthChange = vi.fn();
    render(<DatePicker label="Data" defaultValue="2026-10-12" onMonthChange={onMonthChange} />);
    open();
    expect(onMonthChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(onMonthChange).toHaveBeenLastCalledWith(2026, 10);
    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(onMonthChange).toHaveBeenLastCalledWith(2026, 8);
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });
});

// The same floor the barrel test sets for every component (SS-232), here for the calendar in the
// state this file adds: today marked, dots under days, a selected day with a dot, and the legend.
describe('accessibility: axe', () => {
  it('a calendar with today, dots, a selected marked day and its legend has no violations', async () => {
    const { container } = render(
      <div>
        <DateTimePicker {...OCT} selectedDate={17} dayDots={{ 3: {}, 5: { tone: 'warning', label: 'Pendente' }, 17: {} }} />
        <CalendarLegend items={[{ label: 'Tem agendamento', dot: true }, { label: 'Hoje', outline: true }]} />
      </div>,
    );
    const results = await axe(container, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
