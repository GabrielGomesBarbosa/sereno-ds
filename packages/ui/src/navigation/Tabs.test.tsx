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

  it('only the active tab is in the Tab order (roving tabindex)', () => {
    render(<Basic value="agenda" />);
    expect(screen.getByRole('tab', { name: 'Agenda' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Clients/ })).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight/ArrowLeft move focus and select — automatic activation, wrapping at the ends', () => {
    const onChange = vi.fn();
    function Wrapped() {
      const [v, setV] = React.useState('agenda');
      return (
        <Tabs value={v} onChange={(next) => { setV(next); onChange(next); }}>
          <Tabs.List>
            <Tabs.Tab value="agenda">Agenda</Tabs.Tab>
            <Tabs.Tab value="clientes">Clients</Tabs.Tab>
            <Tabs.Tab value="financeiro">Finance</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      );
    }
    render(<Wrapped />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('clientes');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Clients' }));

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('financeiro');

    // Past the last tab, wraps to the first.
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('agenda');

    // Before the first tab, wraps to the last.
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('financeiro');
  });

  it('Home/End jump to the first/last tab', () => {
    const onChange = vi.fn();
    function Wrapped() {
      const [v, setV] = React.useState('financeiro');
      return (
        <Tabs value={v} onChange={(next) => { setV(next); onChange(next); }}>
          <Tabs.List>
            <Tabs.Tab value="agenda">Agenda</Tabs.Tab>
            <Tabs.Tab value="clientes">Clients</Tabs.Tab>
            <Tabs.Tab value="financeiro">Finance</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      );
    }
    render(<Wrapped />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('agenda');
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('financeiro');
  });

  it('throws when a subcomponent is rendered outside <Tabs>', () => {
    // Expected: React logs the error too — this only asserts the throw.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tabs.Tab value="a">A</Tabs.Tab>)).toThrow(/must be rendered inside <Tabs>/);
    spy.mockRestore();
  });
});
