import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    // (correct ARIA name computation) — query by the label here.
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

  it('calls onChange with the new ISO value (controlled) — value stays put until the prop changes', () => {
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

  it('ref exposes an imperative focus() that lands on the trigger — no native element to read a value from', () => {
    const ref = React.createRef<DatePickerHandle>();
    render(<DatePicker label="Data" defaultValue="2026-10-12" ref={ref} />);
    ref.current?.focus();
    expect(screen.getByRole('button', { name: 'Data' })).toHaveFocus();
  });
});
