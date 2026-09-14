import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ScheduleExceptions } from './ScheduleExceptions';

afterEach(cleanup);

describe('ScheduleExceptions', () => {
  it('renders an empty state when there are no exceptions', () => {
    render(<ScheduleExceptions />);
    expect(screen.getByText('Nenhuma data bloqueada')).toBeInTheDocument();
  });

  it('lists pre-existing exceptions (defaultValue), sorted, with their reason', () => {
    render(
      <ScheduleExceptions
        defaultValue={[
          { date: '2026-12-25', reason: 'Feriado' },
          { date: '2026-10-12', reason: 'Feriado' },
        ]}
      />,
    );
    expect(screen.queryByText('Nenhuma data bloqueada')).toBeNull();
    const reasons = screen.getAllByText('Feriado');
    expect(reasons).toHaveLength(2);
  });

  it('adding a date is disabled until a date is picked', () => {
    render(<ScheduleExceptions />);
    expect(screen.getByRole('button', { name: 'Bloquear data' })).toBeDisabled();
  });

  it('adds a new exception with a date and optional reason, uncontrolled', () => {
    render(<ScheduleExceptions />);
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-20' } });
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Viagem' } });
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear data' }));

    expect(screen.queryByText('Nenhuma data bloqueada')).toBeNull();
    expect(screen.getByText('Viagem')).toBeInTheDocument();
    // The date input resets after a successful add.
    expect(screen.getByLabelText('Data')).toHaveValue('');
  });

  it('calls onChange with the new list (controlled)', () => {
    const onChange = vi.fn();
    render(<ScheduleExceptions value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear data' }));
    expect(onChange).toHaveBeenCalledWith([{ date: '2026-11-20', reason: undefined }]);
  });

  it('rejects a duplicate date — Add stays disabled and shows an error', () => {
    render(<ScheduleExceptions defaultValue={[{ date: '2026-11-20' }]} />);
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-20' } });
    expect(screen.getByRole('button', { name: 'Bloquear data' })).toBeDisabled();
    expect(screen.getByText('Essa data já está bloqueada.')).toBeInTheDocument();
  });

  it('removes an exception', () => {
    render(<ScheduleExceptions defaultValue={[{ date: '2026-11-20', reason: 'Viagem' }]} />);
    fireEvent.click(screen.getByRole('button', { name: /Remover bloqueio/ }));
    expect(screen.getByText('Nenhuma data bloqueada')).toBeInTheDocument();
  });
});
