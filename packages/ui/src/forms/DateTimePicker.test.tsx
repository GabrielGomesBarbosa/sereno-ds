import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DateTimePicker } from './DateTimePicker';

afterEach(cleanup);

// October 2026: 1st falls on a Thursday (getDay() === 4), 31 days. Row
// containing the 15th spans 11–17 (a full Sun–Sat week) - used by the
// Home/End assertions below. Fixed month/year so the grid layout (and which
// day starts each row) is deterministic across test runs.
const OCT = { year: 2026, month: 9 };

const day = (container: HTMLElement, n: number) => container.querySelector<HTMLButtonElement>(`[data-day="${n}"]`)!;

describe('DateTimePicker: keyboard grid navigation', () => {
  it('only one day is in the Tab order (roving tabindex)', () => {
    const { container } = render(<DateTimePicker {...OCT} />);
    const tabbable = [...container.querySelectorAll('[data-day]')].filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('defaults the roving cell to selectedDate when given', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={20} />);
    expect(day(container, 20)).toHaveAttribute('tabindex', '0');
    expect(day(container, 1)).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight/ArrowLeft move the roving cursor by one day', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={15} />);
    day(container, 15).focus();
    fireEvent.keyDown(day(container, 15), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(day(container, 16));
    fireEvent.keyDown(day(container, 16), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(day(container, 15));
  });

  it('ArrowDown/ArrowUp move by a week', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={15} />);
    day(container, 15).focus();
    fireEvent.keyDown(day(container, 15), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(day(container, 22));
    fireEvent.keyDown(day(container, 22), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(day(container, 15));
  });

  it('Home/End move within the current week row, not the whole month', () => {
    const { container } = render(<DateTimePicker {...OCT} selectedDate={15} />);
    day(container, 15).focus();
    fireEvent.keyDown(day(container, 15), { key: 'End' });
    expect(document.activeElement).toBe(day(container, 17));
    fireEvent.keyDown(day(container, 17), { key: 'Home' });
    expect(document.activeElement).toBe(day(container, 11));
  });

  it('ArrowRight past the last day of the month crosses into the next one', () => {
    const onMonthChange = vi.fn();
    const { container } = render(<DateTimePicker {...OCT} selectedDate={31} onMonthChange={onMonthChange} />);
    day(container, 31).focus();
    fireEvent.keyDown(day(container, 31), { key: 'ArrowRight' });
    expect(onMonthChange).toHaveBeenCalledWith(2026, 10); // November, 0-indexed
    expect(document.activeElement).toBe(day(container, 1));
  });

  it('ArrowLeft before the 1st crosses into the previous month', () => {
    const onMonthChange = vi.fn();
    const { container } = render(<DateTimePicker {...OCT} selectedDate={1} onMonthChange={onMonthChange} />);
    day(container, 1).focus();
    fireEvent.keyDown(day(container, 1), { key: 'ArrowLeft' });
    expect(onMonthChange).toHaveBeenCalledWith(2026, 8); // September, 0-indexed
    expect(document.activeElement).toBe(day(container, 30)); // September has 30 days
  });

  it('PageDown/PageUp step the month, keeping the same day-of-month clamped to it', () => {
    const onMonthChange = vi.fn();
    const { container } = render(<DateTimePicker {...OCT} selectedDate={15} onMonthChange={onMonthChange} />);
    day(container, 15).focus();
    fireEvent.keyDown(day(container, 15), { key: 'PageDown' });
    expect(onMonthChange).toHaveBeenLastCalledWith(2026, 10);
    expect(document.activeElement).toBe(day(container, 15));
  });

  it('an unavailable day stays focusable (aria-disabled, not disabled) but does not select on click', () => {
    const onSelectDate = vi.fn();
    const { container } = render(<DateTimePicker {...OCT} unavailable={[16]} onSelectDate={onSelectDate} selectedDate={15} />);
    const d16 = day(container, 16);
    expect(d16).not.toBeDisabled();
    expect(d16).toHaveAttribute('aria-disabled', 'true');
    d16.focus();
    expect(document.activeElement).toBe(d16); // a truly disabled button couldn't receive this
    fireEvent.click(d16);
    expect(onSelectDate).not.toHaveBeenCalled();
  });

  it('clicking or activating an available day calls onSelectDate', () => {
    const onSelectDate = vi.fn();
    const { container } = render(<DateTimePicker {...OCT} onSelectDate={onSelectDate} />);
    fireEvent.click(day(container, 12));
    expect(onSelectDate).toHaveBeenCalledWith(12);
  });

  it('a mouse click re-syncs the roving cursor, so the next arrow press moves from there', () => {
    // Regression: found live in the showcase - a click used to leave the
    // roving cursor state wherever it was before (initialized from
    // selectedDate={5} here), so the *next* arrow key jumped from that
    // stale position (day 6) instead of the cell the user just clicked.
    const { container } = render(<DateTimePicker {...OCT} selectedDate={5} />);
    fireEvent.click(day(container, 20));
    fireEvent.keyDown(day(container, 20), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(day(container, 21));
  });
});

describe('DateTimePicker: time slot capacity/overbooking (SS-64)', () => {
  it('a plain string slot renders and behaves exactly as before (no aria-label override)', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={['09:00']} onSelectTime={onSelectTime} />);
    const btn = screen.getByRole('button', { name: '09:00' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).toHaveBeenCalledWith('09:00');
  });

  it('a `{value, disabled}` slot with no capacity still renders/behaves as before', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '10:00', disabled: true }]} onSelectTime={onSelectTime} />);
    const btn = screen.getByRole('button', { name: '10:00' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).not.toHaveBeenCalled();
  });

  it('a slot with capacity shows "X de Y vagas" and stays clickable', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '11:00', capacity: 5, booked: 3 }]} onSelectTime={onSelectTime} />);
    expect(screen.getByText('3 de 5 vagas')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: '11:00, 3 de 5 vagas' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).toHaveBeenCalledWith('11:00');
  });

  it('a full slot (booked >= capacity) shows "Lotado" but remains clickable, full ≠ blocked', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '12:00', capacity: 4, booked: 4 }]} onSelectTime={onSelectTime} />);
    expect(screen.getByText('Lotado')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: '12:00, lotado, 4 de 4 vagas' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).toHaveBeenCalledWith('12:00');
  });

  it('a full slot that is ALSO explicitly disabled is genuinely non-interactive', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '13:00', capacity: 2, booked: 2, disabled: true }]} onSelectTime={onSelectTime} />);
    const btn = screen.getByRole('button', { name: '13:00, lotado, 2 de 2 vagas' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).not.toHaveBeenCalled();
  });

  it('booked defaults to 0 when omitted alongside capacity', () => {
    render(<DateTimePicker {...OCT} times={[{ value: '14:00', capacity: 6 }]} />);
    expect(screen.getByText('0 de 6 vagas')).toBeInTheDocument();
  });
});

describe('DateTimePicker: ref', () => {
  it('forwards ref to the root element: plain DOM access, not a form value (day/time are separate, parent-owned props)', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<DateTimePicker {...OCT} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(container.firstElementChild);
  });
});

/**
 * `min` / `max` limit the navigation, not only the days (SS-331). Before, the previous-month arrow,
 * PageUp, the arrow keys and the month / year popover led to any month and year, and a consumer
 * could only strike the days of the visible month through `unavailable`.
 */
describe('DateTimePicker: min and max limit the navigation (SS-331)', () => {
  const prev = () => screen.getByRole('button', { name: 'Mês anterior' });
  const next = () => screen.getByRole('button', { name: 'Próximo mês' });
  const title = (container: HTMLElement) => container.querySelector<HTMLButtonElement>('.sereno-dtp-title[aria-haspopup]')!;
  const openPopover = (container: HTMLElement) => fireEvent.click(title(container));
  /** The month / year buttons of the open popover, by their text. */
  const yearTitle = (container: HTMLElement) => container.querySelector<HTMLButtonElement>('.sereno-dtp-pop .sereno-dtp-title')!;
  const popBtn = (container: HTMLElement, text: string) =>
    [...container.querySelectorAll<HTMLButtonElement>('.sereno-dtp-pop .sereno-dtp-grid button')].find((b) => b.textContent === text)!;
  const struck = (container: HTMLElement) => [...container.querySelectorAll('[data-day][aria-disabled="true"]')].map((b) => Number(b.getAttribute('data-day')));

  describe('with no min and no max nothing changes', () => {
    it('both arrows are enabled, nothing is struck, and the popover has every month and year', () => {
      const { container } = render(<DateTimePicker {...OCT} />);
      expect(prev()).toBeEnabled();
      expect(next()).toBeEnabled();
      expect(struck(container)).toEqual([]);
      openPopover(container);
      expect([...container.querySelectorAll('.sereno-dtp-pop button')].filter((b) => (b as HTMLButtonElement).disabled)).toEqual([]);
    });

    it('an invalid min or max is ignored, the same as none', () => {
      const { container } = render(<DateTimePicker {...OCT} min="tomorrow" max="2026-13" />);
      expect(prev()).toBeEnabled();
      expect(next()).toBeEnabled();
      expect(struck(container)).toEqual([]);
    });
  });

  describe('the header arrows', () => {
    it('in the month of min the previous-month arrow is disabled (it keeps its name), the next one is not', () => {
      render(<DateTimePicker {...OCT} min="2026-10-05" />);
      expect(prev()).toBeDisabled();
      expect(next()).toBeEnabled();
    });

    it('clicking the disabled arrow changes nothing and reports nothing', () => {
      const onMonthChange = vi.fn();
      render(<DateTimePicker {...OCT} min="2026-10-05" onMonthChange={onMonthChange} />);
      fireEvent.click(prev());
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('forward and back: the arrow is enabled again only when there is a valid month behind', () => {
      render(<DateTimePicker {...OCT} min="2026-10-05" />);
      fireEvent.click(next());
      expect(screen.getByText(/novembro 2026/)).toBeInTheDocument();
      expect(prev()).toBeEnabled();
      fireEvent.click(prev());
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      expect(prev()).toBeDisabled();
    });

    it('with min some months back you can walk back to it, and no further', () => {
      render(<DateTimePicker {...OCT} min="2026-08-20" />);
      fireEvent.click(prev());
      fireEvent.click(prev());
      expect(screen.getByText(/agosto 2026/)).toBeInTheDocument();
      expect(prev()).toBeDisabled();
    });

    it('max is the mirror image: the next-month arrow disables in its month', () => {
      render(<DateTimePicker {...OCT} max="2026-10-20" />);
      expect(next()).toBeDisabled();
      expect(prev()).toBeEnabled();
    });

    it('min and max in the same month disable both arrows', () => {
      render(<DateTimePicker {...OCT} min="2026-10-05" max="2026-10-20" />);
      expect(prev()).toBeDisabled();
      expect(next()).toBeDisabled();
    });

    it('min across a year end: December to January and back, stopping at the right month', () => {
      render(<DateTimePicker year={2026} month={11} min="2026-11-10" />);
      fireEvent.click(next());
      expect(screen.getByText(/janeiro 2027/)).toBeInTheDocument();
      fireEvent.click(prev());
      fireEvent.click(prev());
      expect(screen.getByText(/novembro 2026/)).toBeInTheDocument();
      expect(prev()).toBeDisabled();
    });

    it('pressing the arrow that lands on the first month hands focus to the title instead of dropping it', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-09-10" />);
      act(() => prev().focus());
      fireEvent.click(prev());
      expect(screen.getByText(/setembro 2026/)).toBeInTheDocument();
      expect(prev()).toBeDisabled();
      expect(document.activeElement).toBe(title(container));
    });
  });

  describe('the days', () => {
    it('every day before min is struck on its own, no `unavailable` needed, and cannot be picked', () => {
      const onSelectDate = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" onSelectDate={onSelectDate} />);
      expect(struck(container)).toEqual([1, 2, 3, 4]);
      fireEvent.click(day(container, 3));
      expect(onSelectDate).not.toHaveBeenCalled();
      fireEvent.click(day(container, 5)); // min itself is allowed
      expect(onSelectDate).toHaveBeenCalledWith(5);
    });

    it('every day after max is struck, and max itself is allowed', () => {
      const { container } = render(<DateTimePicker {...OCT} max="2026-10-27" />);
      expect(struck(container)).toEqual([28, 29, 30, 31]);
    });

    it('a month that is wholly inside the range has nothing struck', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-08-01" max="2027-02-01" />);
      expect(struck(container)).toEqual([]);
    });

    it('is merged with `unavailable`, not replaced by it', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-03" max="2026-10-29" unavailable={[10, 20]} />);
      expect(struck(container)).toEqual([1, 2, 10, 20, 30, 31]);
    });

    it('stepping to the first month strikes its early days at once', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-09-10" />);
      expect(struck(container)).toEqual([]);
      fireEvent.click(prev());
      expect(struck(container)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('the keyboard', () => {
    it('PageUp in the first month does nothing, and does not leave a focus move armed for later', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" selectedDate={15} onMonthChange={onMonthChange} />);
      day(container, 15).focus();
      fireEvent.keyDown(day(container, 15), { key: 'PageUp' });
      expect(onMonthChange).not.toHaveBeenCalled();
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      // A blocked PageUp that left its "focus the cell" flag up would steal focus on the next month change.
      act(() => next().focus());
      fireEvent.click(next());
      expect(document.activeElement).toBe(next());
    });

    it('PageDown in the last month does nothing either, and does not leave a focus move armed for later', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} max="2026-10-20" selectedDate={15} onMonthChange={onMonthChange} />);
      day(container, 15).focus();
      fireEvent.keyDown(day(container, 15), { key: 'PageDown' });
      expect(onMonthChange).not.toHaveBeenCalled();
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      act(() => prev().focus());
      fireEvent.click(prev());
      expect(document.activeElement).toBe(prev());
    });

    it('PageDown steps on while there is a month ahead, and stops at max', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} max="2026-11-20" selectedDate={15} onMonthChange={onMonthChange} />);
      day(container, 15).focus();
      fireEvent.keyDown(day(container, 15), { key: 'PageDown' });
      expect(onMonthChange).toHaveBeenLastCalledWith(2026, 10);
      fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' });
      expect(onMonthChange).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/novembro 2026/)).toBeInTheDocument();
    });

    it('ArrowUp that would cross into an earlier month leaves the cursor where it is', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-01" selectedDate={3} onMonthChange={onMonthChange} />);
      day(container, 3).focus();
      fireEvent.keyDown(day(container, 3), { key: 'ArrowUp' }); // 3 - 7 = September 26
      expect(document.activeElement).toBe(day(container, 3));
      expect(day(container, 3)).toHaveAttribute('tabindex', '0');
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('ArrowLeft from the 1st of the first month stays on the 1st', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-01" selectedDate={1} onMonthChange={onMonthChange} />);
      day(container, 1).focus();
      fireEvent.keyDown(day(container, 1), { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(day(container, 1));
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('ArrowRight and ArrowDown at the last month stay put, and within the month the arrows still move', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} max="2026-10-31" selectedDate={31} onMonthChange={onMonthChange} />);
      day(container, 31).focus();
      fireEvent.keyDown(day(container, 31), { key: 'ArrowRight' });
      expect(document.activeElement).toBe(day(container, 31));
      fireEvent.keyDown(day(container, 31), { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(day(container, 30));
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('a struck day by min is still reachable by the arrows inside its month (like `unavailable`)', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" selectedDate={9} />);
      day(container, 9).focus();
      fireEvent.keyDown(day(container, 9), { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(day(container, 8));
      expect(day(container, 4)).not.toBeDisabled();
    });
  });

  describe('the month / year popover', () => {
    const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    it('months before min are disabled, the rest are not, and "Ano anterior" is disabled', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" />);
      openPopover(container);
      MONTHS.forEach((m, i) => (i < 9 ? expect(popBtn(container, m)).toBeDisabled() : expect(popBtn(container, m)).toBeEnabled()));
      expect(screen.getByRole('button', { name: 'Ano anterior' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeEnabled();
    });

    it('months after max are disabled, and "Próximo ano" is disabled', () => {
      const { container } = render(<DateTimePicker {...OCT} max="2026-10-20" />);
      openPopover(container);
      MONTHS.forEach((m, i) => (i > 9 ? expect(popBtn(container, m)).toBeDisabled() : expect(popBtn(container, m)).toBeEnabled()));
      expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeDisabled();
    });

    it('a disabled month cannot be picked; an enabled one jumps there and closes the popover', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" onMonthChange={onMonthChange} />);
      openPopover(container);
      fireEvent.click(popBtn(container, 'ago'));
      expect(onMonthChange).not.toHaveBeenCalled();
      fireEvent.click(popBtn(container, 'dez'));
      expect(onMonthChange).toHaveBeenCalledWith(2026, 11);
      expect(screen.getByText(/dezembro 2026/)).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('"Ano anterior" is enabled while an earlier year has a valid month, and lands on min\'s month, not before it', () => {
      const { container } = render(<DateTimePicker year={2026} month={0} min="2025-10-05" />);
      openPopover(container);
      const py = screen.getByRole('button', { name: 'Ano anterior' });
      expect(py).toBeEnabled();
      fireEvent.click(py);
      expect(screen.getByText(/outubro 2025/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ano anterior' })).toBeDisabled();
    });

    it('year view: years outside the range are disabled, and the 12-year arrows stop when no year is left that way', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2025-10-05" max="2029-01-01" />);
      openPopover(container);
      fireEvent.click(yearTitle(container));
      const years = [...container.querySelectorAll<HTMLButtonElement>('.sereno-dtp-pop .sereno-dtp-grid button')];
      // The block starts at min's year, so it is not mostly years that cannot be picked.
      expect(years.map((b) => b.textContent)).toEqual(Array.from({ length: 12 }, (_, i) => String(2025 + i)));
      years.forEach((b) => (Number(b.textContent) <= 2029 ? expect(b).toBeEnabled() : expect(b).toBeDisabled()));
      expect(screen.getByRole('button', { name: 'Anos anteriores' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Próximos anos' })).toBeDisabled();
    });

    it('year view with only a min: you can page forward, and picking min\'s year from a later one lands inside the range', () => {
      const { container } = render(<DateTimePicker year={2027} month={0} min="2026-10-05" />);
      openPopover(container);
      fireEvent.click(yearTitle(container));
      expect(screen.getByRole('button', { name: 'Anos anteriores' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Próximos anos' })).toBeEnabled();
      fireEvent.click(popBtn(container, '2026'));
      // January 2026 would be before min: it lands on October 2026.
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
    });

    it('a disabled year cannot be picked', () => {
      const onMonthChange = vi.fn();
      const { container } = render(<DateTimePicker {...OCT} max="2028-06-01" onMonthChange={onMonthChange} />);
      openPopover(container);
      fireEvent.click(yearTitle(container));
      fireEvent.click(screen.getByRole('button', { name: 'Próximos anos' }));
      const y2029 = [...container.querySelectorAll<HTMLButtonElement>('.sereno-dtp-pop .sereno-dtp-grid button')].find((b) => b.textContent === '2029');
      if (y2029) {
        expect(y2029).toBeDisabled();
        fireEvent.click(y2029);
      }
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('the year arrow that lands on the first year hands focus to the popover instead of dropping it', () => {
      const { container } = render(<DateTimePicker year={2026} month={0} min="2025-10-05" />);
      openPopover(container);
      const py = screen.getByRole('button', { name: 'Ano anterior' });
      act(() => py.focus());
      fireEvent.click(py);
      expect(screen.getByRole('button', { name: 'Ano anterior' })).toBeDisabled();
      expect(document.activeElement).toBe(screen.getByRole('dialog'));
    });

    it('a disabled month or year is out of the Tab order (native disabled)', () => {
      const { container } = render(<DateTimePicker {...OCT} min="2026-10-05" />);
      openPopover(container);
      popBtn(container, 'ago').focus();
      expect(document.activeElement).not.toBe(popBtn(container, 'ago'));
    });
  });

  describe('a month outside the range at the start', () => {
    it('a month before min starts on min\'s month, and onMonthChange reports it once, at mount', () => {
      const onMonthChange = vi.fn();
      render(<DateTimePicker year={2026} month={7} min="2026-10-05" onMonthChange={onMonthChange} />);
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      expect(onMonthChange).toHaveBeenCalledTimes(1);
      expect(onMonthChange).toHaveBeenCalledWith(2026, 9);
    });

    it('a month after max starts on max\'s month and reports it', () => {
      const onMonthChange = vi.fn();
      render(<DateTimePicker year={2026} month={11} max="2026-10-20" onMonthChange={onMonthChange} />);
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      expect(onMonthChange).toHaveBeenCalledWith(2026, 9);
    });

    it('a year too is moved: 2024 with min in 2026 starts in 2026', () => {
      render(<DateTimePicker year={2024} month={3} min="2026-10-05" />);
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
    });

    it('a month already inside the range is left alone, and nothing is reported at mount (as before)', () => {
      const onMonthChange = vi.fn();
      render(<DateTimePicker {...OCT} min="2026-08-01" max="2027-02-01" onMonthChange={onMonthChange} />);
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('with no year / month the calendar starts on today, moved into the range if today is outside it', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 5, 15));
      try {
        render(<DateTimePicker min="2026-10-05" />);
        expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('on the first month the roving cell starts on a day that can be picked, not a struck one', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 5, 15));
      try {
        const { container } = render(<DateTimePicker {...OCT} min="2026-10-15" />);
        expect(day(container, 15)).toHaveAttribute('tabindex', '0');
        expect(day(container, 1)).toHaveAttribute('tabindex', '-1');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('min and max that change after mount', () => {
    it('a min that moves past the visible month brings the view to it, and reports it', () => {
      const onMonthChange = vi.fn();
      const { rerender } = render(<DateTimePicker {...OCT} onMonthChange={onMonthChange} />);
      rerender(<DateTimePicker {...OCT} min="2026-12-10" onMonthChange={onMonthChange} />);
      expect(screen.getByText(/dezembro 2026/)).toBeInTheDocument();
      expect(onMonthChange).toHaveBeenLastCalledWith(2026, 11);
      expect(prev()).toBeDisabled();
    });

    it('a bound removed again frees the navigation', () => {
      const { rerender } = render(<DateTimePicker {...OCT} min="2026-10-05" />);
      expect(prev()).toBeDisabled();
      rerender(<DateTimePicker {...OCT} />);
      expect(prev()).toBeEnabled();
    });

    it('a min after max does not crash or loop, and nothing can be navigated', () => {
      render(<DateTimePicker {...OCT} min="2026-12-01" max="2026-02-01" />);
      expect(prev()).toBeDisabled();
      expect(next()).toBeDisabled();
    });
  });
});
