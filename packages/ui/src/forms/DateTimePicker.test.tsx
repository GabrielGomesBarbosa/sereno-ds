import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('a mouse click re-syncs the roving cursor, so the next arrow press moves from there', () => {
    // Regression: found live in the showcase — a click used to leave the
    // roving cursor state wherever it was before (initialized from
    // selectedDate={5} here), so the *next* arrow key jumped from that
    // stale position (day 6) instead of the cell the user just clicked.
    const { container } = render(<DateTimePicker {...OCT} selectedDate={5} />);
    fireEvent.click(day(container, 20));
    fireEvent.keyDown(day(container, 20), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(day(container, 21));
  });
});

describe('DateTimePicker — time slot capacity/overbooking (SS-64)', () => {
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
    const btn = screen.getByRole('button', { name: '11:00 — 3 de 5 vagas' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).toHaveBeenCalledWith('11:00');
  });

  it('a full slot (booked >= capacity) shows "Lotado" but remains clickable — full ≠ blocked', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '12:00', capacity: 4, booked: 4 }]} onSelectTime={onSelectTime} />);
    expect(screen.getByText('Lotado')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: '12:00 — lotado, 4 de 4 vagas' });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).toHaveBeenCalledWith('12:00');
  });

  it('a full slot that is ALSO explicitly disabled is genuinely non-interactive', () => {
    const onSelectTime = vi.fn();
    render(<DateTimePicker {...OCT} times={[{ value: '13:00', capacity: 2, booked: 2, disabled: true }]} onSelectTime={onSelectTime} />);
    const btn = screen.getByRole('button', { name: '13:00 — lotado, 2 de 2 vagas' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSelectTime).not.toHaveBeenCalled();
  });

  it('booked defaults to 0 when omitted alongside capacity', () => {
    render(<DateTimePicker {...OCT} times={[{ value: '14:00', capacity: 6 }]} />);
    expect(screen.getByText('0 de 6 vagas')).toBeInTheDocument();
  });
});
