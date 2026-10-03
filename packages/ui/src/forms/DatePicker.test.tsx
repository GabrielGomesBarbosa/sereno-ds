import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DatePicker, type DatePickerHandle } from './DatePicker';

afterEach(cleanup);

describe('DatePicker', () => {
  it('shows the placeholder with no value, and the popover starts closed', () => {
    render(<DatePicker placeholder="Selecionar data" />);
    expect(screen.getByRole('button', { name: /Selecionar data/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the formatted value (pt-BR, DD/MM/YYYY) when set', () => {
    render(<DatePicker defaultValue="2026-10-12" />);
    expect(screen.getByRole('button', { name: /12\/10\/2026/ })).toBeInTheDocument();
  });

  it('opens the calendar popover on click', () => {
    // A <label> takes over the accessible name from the button's own text
    // (correct ARIA name computation) - query by the label here.
    render(<DatePicker label="Data" defaultValue="2026-10-12" />);
    fireEvent.click(screen.getByRole('button', { name: 'Data' }));
    expect(screen.getByRole('dialog', { name: 'Data' })).toBeInTheDocument();
    // The calendar opens on the value's own month.
    expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
  });

  it('picking a day commits the ISO value and closes the popover (uncontrolled)', () => {
    render(<DatePicker defaultValue="2026-10-12" />);
    fireEvent.click(screen.getByRole('button', { name: /12\/10\/2026/ }));
    fireEvent.click(screen.getByRole('button', { name: '20' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /20\/10\/2026/ })).toBeInTheDocument();
  });

  it('calls onChange with the new ISO value (controlled), value stays put until the prop changes', () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-10-12" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /12\/10\/2026/ }));
    fireEvent.click(screen.getByRole('button', { name: '20' }));
    expect(onChange).toHaveBeenCalledWith('2026-10-20');
    expect(screen.getByRole('button', { name: /12\/10\/2026/ })).toBeInTheDocument();
  });

  it('a day before `min` is aria-disabled and does not commit on click', () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-10-12" min="2026-10-10" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /12\/10\/2026/ }));
    const day5 = screen.getByRole('button', { name: '5' });
    expect(day5).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(day5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a day after `max` is aria-disabled', () => {
    render(<DatePicker value="2026-10-12" max="2026-10-20" />);
    fireEvent.click(screen.getByRole('button', { name: /12\/10\/2026/ }));
    expect(screen.getByRole('button', { name: '25' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: '15' })).not.toHaveAttribute('aria-disabled');
  });

  it('disabled prevents opening the popover', () => {
    render(<DatePicker defaultValue="2026-10-12" disabled />);
    const trigger = screen.getByRole('button', { name: /12\/10\/2026/ });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape closes the popover and returns focus to the trigger', () => {
    render(<DatePicker defaultValue="2026-10-12" />);
    const trigger = screen.getByRole('button', { name: /12\/10\/2026/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('has no clear button with no value', () => {
    render(<DatePicker />);
    expect(screen.queryByRole('button', { name: 'Limpar data' })).toBeNull();
  });

  it('a value shows a clear button that resets to the placeholder (uncontrolled) and refocuses the trigger', () => {
    render(<DatePicker defaultValue="2026-10-12" />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar data' }));
    expect(screen.getByRole('button', { name: 'Selecionar data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selecionar data' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Limpar data' })).toBeNull();
  });

  it('clearing a controlled value calls onChange with an empty string, without clicking through to the trigger', () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-10-12" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar data' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('disabled hides the clear button even with a value', () => {
    render(<DatePicker defaultValue="2026-10-12" disabled />);
    expect(screen.queryByRole('button', { name: 'Limpar data' })).toBeNull();
  });

  it('locale="en" renders English placeholder, date format, weekday/month header, and clear label', () => {
    render(<DatePicker locale="en" defaultValue="2026-10-12" />);
    expect(screen.getByRole('button', { name: /10\/12\/2026/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /10\/12\/2026/ }));
    expect(screen.getByText(/October 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument();
  });

  it('ref exposes an imperative focus() that lands on the trigger, no native element to read a value from', () => {
    const ref = React.createRef<DatePickerHandle>();
    render(<DatePicker label="Data" defaultValue="2026-10-12" ref={ref} />);
    ref.current?.focus();
    expect(screen.getByRole('button', { name: 'Data' })).toHaveFocus();
  });
});

/**
 * `min` / `max` now limit the navigation as well as strike the days (SS-331). The popover shows the
 * same calendar `DateTimePicker` does, so this repeats the behaviors that matter for a field, plus
 * the one only a field has: the date that comes out has to be in the month that was shown.
 */
describe('DatePicker: min and max limit the navigation (SS-331)', () => {
  const open = (name: RegExp | string = /12\/10\/2026/) => fireEvent.click(screen.getByRole('button', { name }));
  const prev = () => screen.getByRole('button', { name: 'Mês anterior' });
  const next = () => screen.getByRole('button', { name: 'Próximo mês' });
  const dayBtn = (n: number) => document.querySelector<HTMLButtonElement>(`[data-day="${n}"]`)!;
  const struck = () => [...document.querySelectorAll('[data-day][aria-disabled="true"]')].map((b) => Number(b.getAttribute('data-day')));

  it('with no min and no max nothing changes: both arrows enabled, nothing struck', () => {
    render(<DatePicker value="2026-10-12" />);
    open();
    expect(prev()).toBeEnabled();
    expect(next()).toBeEnabled();
    expect(struck()).toEqual([]);
  });

  it('in the month of min the previous-month arrow is disabled, and the days before it stay struck', () => {
    render(<DatePicker value="2026-10-12" min="2026-10-10" />);
    open();
    expect(prev()).toBeDisabled();
    expect(next()).toBeEnabled();
    expect(struck()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('forward and back: the arrow comes back only when there is a month behind, and the days are struck as soon as the month shows', () => {
    render(<DatePicker value="2026-10-12" min="2026-09-10" />);
    open();
    expect(prev()).toBeEnabled();
    fireEvent.click(prev());
    expect(screen.getByText(/setembro 2026/)).toBeInTheDocument();
    expect(prev()).toBeDisabled();
    expect(struck()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    fireEvent.click(next());
    expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
    expect(struck()).toEqual([]);
  });

  it('max: the next-month arrow is disabled in its month, and the later days are struck', () => {
    render(<DatePicker value="2026-10-12" max="2026-10-27" />);
    open();
    expect(next()).toBeDisabled();
    expect(prev()).toBeEnabled();
    expect(struck()).toEqual([28, 29, 30, 31]);
  });

  it('PageUp in the first month keeps the same month, and PageDown still steps forward', () => {
    render(<DatePicker value="2026-10-12" min="2026-10-01" />);
    open();
    const d = dayBtn(12);
    act(() => d.focus());
    fireEvent.keyDown(d, { key: 'PageUp' });
    expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
    fireEvent.keyDown(d, { key: 'PageDown' });
    expect(screen.getByText(/novembro 2026/)).toBeInTheDocument();
  });

  it('the month / year popover disables what is out of range', () => {
    render(<DatePicker value="2026-10-12" min="2026-10-05" max="2027-02-10" />);
    open();
    fireEvent.click(document.querySelector('.sereno-dtp-title[aria-haspopup]')!);
    const month = (t: string) => [...document.querySelectorAll<HTMLButtonElement>('.sereno-dtp-pop .sereno-dtp-grid button')].find((b) => b.textContent === t)!;
    expect(month('set')).toBeDisabled();
    expect(month('out')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Ano anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeEnabled(); // 2027 has months in range
    fireEvent.click(screen.getByRole('button', { name: 'Próximo ano' }));
    expect(screen.getByText(/fevereiro 2027/)).toBeInTheDocument(); // a year ahead of October 2026 is past max: it lands on max's month
    expect(screen.getByRole('button', { name: 'Próximo ano' })).toBeDisabled();
  });

  describe('the date that comes out is in the month that was shown', () => {
    it('a value before min opens on min\'s month, and picking a day gives a date in it (not in the month the value was in)', () => {
      const onChange = vi.fn();
      render(<DatePicker value="2026-08-12" min="2026-10-05" onChange={onChange} />);
      fireEvent.click(screen.getByRole('button', { name: /12\/08\/2026/ }));
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      fireEvent.click(dayBtn(20));
      expect(onChange).toHaveBeenCalledWith('2026-10-20');
    });

    it('a value after max opens on max\'s month, and picking gives a date in it', () => {
      const onChange = vi.fn();
      render(<DatePicker value="2026-12-12" max="2026-10-20" onChange={onChange} />);
      fireEvent.click(screen.getByRole('button', { name: /12\/12\/2026/ }));
      expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
      fireEvent.click(dayBtn(15));
      expect(onChange).toHaveBeenCalledWith('2026-10-15');
    });

    it('with no value it opens on today, moved into the range when today is outside it', () => {
      const onChange = vi.fn();
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 2, 1));
      try {
        render(<DatePicker label="Data" min="2026-10-05" onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Data' }));
        expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
        fireEvent.click(dayBtn(8));
        expect(onChange).toHaveBeenCalledWith('2026-10-08');
      } finally {
        vi.useRealTimers();
      }
    });

    it('a day picked after navigating to the first month is in that month', () => {
      const onChange = vi.fn();
      render(<DatePicker value="2026-10-12" min="2026-09-10" onChange={onChange} />);
      open();
      fireEvent.click(prev());
      fireEvent.click(dayBtn(25));
      expect(onChange).toHaveBeenCalledWith('2026-09-25');
    });

    it('a struck day by min is not committed', () => {
      const onChange = vi.fn();
      render(<DatePicker value="2026-10-12" min="2026-10-10" onChange={onChange} />);
      open();
      fireEvent.click(dayBtn(3));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
