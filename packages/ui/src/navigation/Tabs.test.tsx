import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Tabs } from './Tabs';

afterEach(cleanup);

function Basic({ value, onChange }: { value: string; onChange?: (v: string) => void }) {
  return (
    <Tabs value={value} onChange={onChange}>
      <Tabs.List>
        <Tabs.Tab value="agenda">Agenda</Tabs.Tab>
        <Tabs.Tab value="clientes" count={3}>
          Clients
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="agenda">Agenda panel</Tabs.Panel>
      <Tabs.Panel value="clientes">Clients panel</Tabs.Panel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders a tablist with one tab per Tabs.Tab and marks the active one', () => {
    render(<Basic value="agenda" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('tab', { name: 'Agenda' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Clients/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking a tab fires onChange with its value', () => {
    const onChange = vi.fn();
    render(<Basic value="agenda" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /Clients/ }));
    expect(onChange).toHaveBeenCalledWith('clientes');
  });

  it('Tabs.Panel renders only the panel matching the active value', () => {
    render(<Basic value="clientes" />);
    expect(screen.getByText('Clients panel')).toBeInTheDocument();
    expect(screen.queryByText('Agenda panel')).toBeNull();
  });

  it('count renders as a badge next to the label', () => {
    render(<Basic value="agenda" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('throws when a subcomponent is rendered outside <Tabs>', () => {
    // Expected: React logs the error too — this only asserts the throw.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tabs.Tab value="a">A</Tabs.Tab>)).toThrow(/must be rendered inside <Tabs>/);
    spy.mockRestore();
  });
});
