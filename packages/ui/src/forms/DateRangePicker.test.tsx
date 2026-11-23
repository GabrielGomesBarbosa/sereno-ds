import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DateRangePicker, type DateRange, type DateRangePickerHandle } from './DateRangePicker';

afterEach(cleanup);

const open = (name = 'Período') => fireEvent.click(screen.getByRole('button', { name }));
const day = (n: number) => screen.getByRole('dialog').querySelector<HTMLButtonElement>(`[data-day="${n}"]`)!;
const pick = (n: number) => fireEvent.click(day(n));
const grid = () => screen.getByRole('dialog').querySelector<HTMLElement>('.sereno-dtp-days')!;
const status = () => within(screen.getByRole('dialog')).getByRole('status');

describe('DateRangePicker: the field', () => {
  it('shows the placeholder with no value, and the popover starts closed', () => {
    render(<DateRangePicker />);
    expect(screen.getByRole('button', { name: /Selecionar período/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('locale="en" has an English placeholder, dialog label and clear label', () => {
    render(<DateRangePicker locale="en" defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    fireEvent.click(screen.getByRole('button', { name: /10\/05\/2026\D+10\/09\/2026/ })); // the zero of the day is kept, like DatePicker's
    expect(screen.getByRole('dialog', { name: 'Choose a period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear period' })).toBeInTheDocument();
  });

  it('shows the range the way the locale joins it (pt-BR, DD/MM/YYYY)', () => {
    render(<DateRangePicker defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    expect(screen.getByRole('button', { name: /05\/10\/2026\D+09\/10\/2026/ })).toBeInTheDocument();
  });

  it('a one-day range shows that one date', () => {
    render(<DateRangePicker defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} />);
    const text = screen.getByRole('button', { name: /05\/10\/2026/ }).textContent ?? '';
    expect(text.match(/05\/10\/2026/g)).toHaveLength(1);
  });

  it('a range with only one end set shows as no value', () => {
    render(<DateRangePicker value={{ start: '2026-10-05', end: '' }} />);
    expect(screen.getByRole('button', { name: /Selecionar período/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Limpar/ })).toBeNull();
  });

  it('disabled prevents opening, and hides the clear button even with a value', () => {
    render(<DateRangePicker label="Período" disabled defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Período' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: /Limpar/ })).toBeNull();
  });

  it('opens on the month the range starts in', () => {
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    open();
    expect(screen.getByText(/outubro 2026/)).toBeInTheDocument();
  });

  it('ref exposes focus(), landing on the trigger', () => {
    const ref = React.createRef<DateRangePickerHandle>();
    render(<DateRangePicker ref={ref} label="Período" />);
    act(() => ref.current?.focus());
    expect(screen.getByRole('button', { name: 'Período' })).toHaveFocus();
  });
});

describe('DateRangePicker: picking', () => {
  it('the first click starts the pick: nothing is committed and the calendar stays open', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} onChange={onChange} />);
    open();
    pick(12);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(day(12)).toHaveAttribute('aria-pressed', 'true');
  });

  it('the second click commits the complete range (uncontrolled), closes, and the trigger shows it', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} onChange={onChange} />);
    open();
    pick(12);
    pick(15);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-15' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Período' })).toHaveTextContent(/12\/10\/2026\D+15\/10\/2026/);
  });

  it('the two swap when the second click is earlier: start is always the earlier date', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} onChange={onChange} />);
    open();
    pick(20);
    pick(12);
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-20' });
  });

  it('two clicks on the same day are a period of one day', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} onChange={onChange} />);
    open();
    pick(12);
    pick(12);
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-12' });
  });

  it('controlled: onChange fires, and the shown range stays put until the prop changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DateRangePicker label="Período" value={{ start: '2026-10-05', end: '2026-10-09' }} onChange={onChange} />);
    open();
    pick(12);
    pick(15);
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-15' });
    expect(screen.getByRole('button', { name: 'Período' })).toHaveTextContent(/05\/10\/2026\D+09\/10\/2026/);
    rerender(<DateRangePicker label="Período" value={{ start: '2026-10-12', end: '2026-10-15' }} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Período' })).toHaveTextContent(/12\/10\/2026\D+15\/10\/2026/);
  });

  it('a range can span months: the pick survives a month change', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} onChange={onChange} />);
    open();
    pick(28);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    pick(3);
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-28', end: '2026-11-03' });
  });

  it('Escape closes without committing, and the next open starts a new pick', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" onChange={onChange} />);
    open();
    pick(12);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    open();
    expect(status()).toHaveTextContent('Escolha a data inicial');
    expect(day(12)).toHaveAttribute('aria-pressed', 'false');
  });

  it('a day before `min` cannot start a pick', () => {
    render(<DateRangePicker label="Período" min="2026-10-10" defaultValue={{ start: '2026-10-12', end: '2026-10-14' }} />);
    open();
    expect(day(5)).toHaveAttribute('aria-disabled', 'true');
    pick(5);
    expect(status()).toHaveTextContent('Escolha a data inicial');
  });

  it('the clear button empties the range, calls onChange with the empty one and refocuses the trigger', () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar período' }));
    expect(onChange).toHaveBeenCalledWith({ start: '', end: '' });
    expect(screen.getByRole('button', { name: 'Período' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Limpar período' })).toBeNull();
  });
});

describe('DateRangePicker: what the calendar draws', () => {
  it('a settled range: both ends picked with their edge, the days between inside, the rest plain', () => {
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    open();
    expect(day(5)).toHaveAttribute('aria-pressed', 'true');
    expect(day(5)).toHaveAttribute('data-range-edge', 'start');
    expect(day(9)).toHaveAttribute('aria-pressed', 'true');
    expect(day(9)).toHaveAttribute('data-range-edge', 'end');
    for (const n of [6, 7, 8]) {
      expect(day(n)).toHaveAttribute('data-in-range');
      expect(day(n)).toHaveAttribute('aria-pressed', 'false');
    }
    for (const n of [4, 10]) {
      expect(day(n)).not.toHaveAttribute('data-in-range');
      expect(day(n)).not.toHaveAttribute('data-range-edge');
    }
  });

  it('says where the range starts, ends and what is in between, for a screen reader (the band is only a picture)', () => {
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} />);
    open();
    expect(day(5)).toHaveTextContent('início do período');
    expect(day(9)).toHaveTextContent('fim do período');
    expect(day(7)).toHaveTextContent('no período');
    expect(day(12)).not.toHaveTextContent('período');
  });

  it('a one-day range draws no band', () => {
    render(<DateRangePicker label="Período" defaultValue={{ start: '2026-10-05', end: '2026-10-05' }} />);
    open();
    expect(day(5)).toHaveAttribute('aria-pressed', 'true');
    expect(day(5)).not.toHaveAttribute('data-range-edge');
    expect(day(6)).not.toHaveAttribute('data-in-range');
  });

  it('after the first click the stretch to the pointer is the preview: lighter, not announced, the far end not pressed', () => {
    render(<DateRangePicker label="Período" />);
    open();
    pick(12);
    fireEvent.mouseEnter(day(15));
    for (const n of [12, 13, 14, 15]) expect(day(n)).toHaveAttribute('data-preview');
    expect(day(15)).toHaveAttribute('data-preview-end');
    expect(day(15)).toHaveAttribute('aria-pressed', 'false'); // not picked yet
    expect(day(12)).toHaveAttribute('aria-pressed', 'true'); // the anchor is
    expect(day(13)).not.toHaveAttribute('data-in-range'); // the settled band is for a settled range
    expect(day(16)).not.toHaveAttribute('data-preview');
    expect(day(13)).not.toHaveTextContent('período');
  });

  it('the preview grows backwards when the pointer is before the start', () => {
    render(<DateRangePicker label="Período" />);
    open();
    pick(12);
    fireEvent.mouseEnter(day(9));
    for (const n of [9, 10, 11, 12]) expect(day(n)).toHaveAttribute('data-preview');
    expect(day(9)).toHaveAttribute('data-preview-end');
    expect(day(8)).not.toHaveAttribute('data-preview');
  });

  it('with the pointer off the grid the preview falls back to the start alone', () => {
    render(<DateRangePicker label="Período" />);
    open();
    pick(12);
    fireEvent.mouseEnter(day(15));
    fireEvent.mouseLeave(grid());
    expect(day(13)).not.toHaveAttribute('data-preview');
    expect(day(15)).not.toHaveAttribute('data-preview-end');
  });

  it('the keyboard cursor grows the preview too: arrows move the far end', () => {
    render(<DateRangePicker label="Período" />);
    open();
    pick(12);
    act(() => day(12).focus());
    fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    expect(day(15)).toHaveFocus();
    for (const n of [12, 13, 14, 15]) expect(day(n)).toHaveAttribute('data-preview');
    expect(day(15)).toHaveAttribute('data-preview-end');
    // Enter on the focused day is a click: it commits the range
    fireEvent.click(day(15));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('DateRangePicker: what it says while picking', () => {
  it('a polite live region says what to pick next, and changes after the first click', () => {
    render(<DateRangePicker label="Period" locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Period' }));
    expect(status()).toHaveAttribute('aria-live', 'polite');
    expect(status()).toHaveTextContent('Select the start date');
    pick(12);
    expect(status()).toHaveTextContent('Select the end date');
  });
});

describe('DateRangePicker: the value type', () => {
  it('DateRange is a pair of ISO strings', () => {
    const r: DateRange = { start: '2026-10-05', end: '2026-10-09' };
    expect(Object.keys(r)).toEqual(['start', 'end']);
  });
});
