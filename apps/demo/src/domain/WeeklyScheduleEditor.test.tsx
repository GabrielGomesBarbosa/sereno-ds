import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WeeklyScheduleEditor, type WeekSchedule } from './WeeklyScheduleEditor';

afterEach(cleanup);

const WEEK: WeekSchedule = {
  mon: { enabled: true, start: '09:00', end: '18:00' },
  tue: { enabled: true, start: '09:00', end: '18:00' },
  wed: { enabled: false, start: '09:00', end: '18:00' },
  thu: { enabled: true, start: '09:00', end: '18:00' },
  fri: { enabled: true, start: '09:00', end: '17:00' },
  sat: { enabled: false, start: '09:00', end: '13:00' },
  sun: { enabled: false, start: '09:00', end: '13:00' },
};

describe('WeeklyScheduleEditor', () => {
  it('renders a row per weekday with the on/off Switch reflecting `value`', () => {
    render(<WeeklyScheduleEditor value={WEEK} />);
    expect(screen.getByRole('switch', { name: 'Segunda' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Quarta' })).not.toBeChecked();
  });

  it('an enabled day shows its start/end selects; a disabled day shows "Sem atendimento"', () => {
    render(<WeeklyScheduleEditor value={WEEK} />);
    expect(screen.getByLabelText('Horário de início, Segunda')).toBeInTheDocument();
    expect(screen.getAllByText('Sem atendimento').length).toBeGreaterThan(0);
  });

  it('the plain-language summary lists only the enabled days', () => {
    render(<WeeklyScheduleEditor value={WEEK} />);
    expect(screen.getByText(/Seg, Ter, Qui, Sex/)).toBeInTheDocument();
  });

  it('toggling a day off calls onChange with that day disabled', () => {
    const onChange = vi.fn();
    render(<WeeklyScheduleEditor value={WEEK} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Segunda' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mon: expect.objectContaining({ enabled: false }) }));
  });

  it('with every day off, the summary says the public link shows no hours', () => {
    const allOff = Object.fromEntries(Object.entries(WEEK).map(([k, v]) => [k, { ...v, enabled: false }])) as WeekSchedule;
    render(<WeeklyScheduleEditor value={allOff} />);
    expect(screen.getByText(/não vai mostrar horários/)).toBeInTheDocument();
  });

  it('showSummary={false} hides the recap line', () => {
    render(<WeeklyScheduleEditor value={WEEK} showSummary={false} />);
    expect(screen.queryByText(/Você atende/)).toBeNull();
  });

  it('works uncontrolled from defaultValue, with its own internal state', () => {
    render(<WeeklyScheduleEditor defaultValue={WEEK} />);
    const mon = screen.getByRole('switch', { name: 'Segunda' });
    expect(mon).toBeChecked();
    fireEvent.click(mon);
    expect(mon).not.toBeChecked();
  });
});
