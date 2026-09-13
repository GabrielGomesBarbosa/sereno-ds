import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { DateTimePicker } from './DateTimePicker';

afterEach(cleanup);

// October 2026: 1st falls on a Thursday (getDay() === 4), 31 days. Row
// containing the 15th spans 11–17 (a full Sun–Sat week) — used by the
// Home/End assertions below. Fixed month/year so the grid layout (and which
// day starts each row) is deterministic across test runs.
const OCT = { year: 2026, month: 9 };

const day = (container: HTMLElement, n: number) => container.querySelector<HTMLButtonElement>(`[data-day="${n}"]`)!;

describe('DateTimePicker — keyboard grid navigation', () => {
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
});
