import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

afterEach(cleanup);

function Basic({ value, onChange }: { value: string; onChange?: (v: string) => void }) {
  return (
    <BottomNav value={value} onChange={onChange}>
      <BottomNav.Item value="agenda" label="Agenda" />
      <BottomNav.Item value="clientes" label="Clients" />
    </BottomNav>
  );
}

describe('BottomNav', () => {
  it('renders one button per Item and marks the active one', () => {
    render(<Basic value="agenda" />);
    expect(screen.getByRole('button', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Clients' })).not.toHaveAttribute('aria-current');
  });

  it('clicking an item fires onChange with its value', () => {
    const onChange = vi.fn();
    render(<Basic value="agenda" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clients' }));
    expect(onChange).toHaveBeenCalledWith('clientes');
  });

  it('throws when Item is rendered outside <BottomNav>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BottomNav.Item value="a" label="A" />)).toThrow(/must be rendered inside <BottomNav>/);
    spy.mockRestore();
  });
});
