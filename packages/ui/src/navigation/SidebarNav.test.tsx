import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SidebarNav } from './SidebarNav';

afterEach(cleanup);

function Basic({ value, onChange }: { value: string; onChange?: (v: string) => void }) {
  return (
    <SidebarNav value={value} onChange={onChange} collapsible={false}>
      <SidebarNav.Section label="Workspace">
        <SidebarNav.Item value="agenda" label="Agenda" />
        <SidebarNav.Item value="finance" label="Finance">
          <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
          <SidebarNav.SubItem value="finance:payouts" label="Payouts" count={3} />
        </SidebarNav.Item>
      </SidebarNav.Section>
    </SidebarNav>
  );
}

describe('SidebarNav', () => {
  it('renders sections and items, marking the active leaf', () => {
    render(<Basic value="agenda" />);
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
  });

  it('clicking a leaf Item fires onChange', () => {
    const onChange = vi.fn();
    render(<Basic value="agenda" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Agenda' }));
    expect(onChange).toHaveBeenCalledWith('agenda');
  });

  it('an Item with SubItem children starts closed and toggles an inline accordion on click', () => {
    render(<Basic value="agenda" />);
    expect(screen.queryByText('Incoming')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Finance' }));
    expect(screen.getByText('Incoming')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finance' }));
    expect(screen.queryByText('Incoming')).toBeNull();
  });

  it('seeds the accordion open when the active value is one of its SubItems', () => {
    render(<Basic value="finance:payouts" />);
    expect(screen.getByText('Incoming')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Payouts/ })).toHaveAttribute('aria-current', 'page');
  });

  it('clicking a SubItem fires onChange with its value', () => {
    const onChange = vi.fn();
    render(<Basic value="finance:incoming" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Payouts/ }));
    expect(onChange).toHaveBeenCalledWith('finance:payouts');
  });

  it('renders a leaf with href through linkComponent', () => {
    const Link = ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a data-testid="custom-link" href={href} {...rest}>
        {children}
      </a>
    );
    render(
      <SidebarNav value="home" collapsible={false} linkComponent={Link}>
        <SidebarNav.Section>
          <SidebarNav.Item value="home" label="Home" href="/" />
        </SidebarNav.Section>
      </SidebarNav>,
    );
    expect(screen.getByTestId('custom-link')).toHaveAttribute('href', '/');
  });

  it('throws when a subcomponent is rendered outside <SidebarNav>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SidebarNav.Item value="a" label="A" />)).toThrow(/must be rendered inside <SidebarNav>/);
    spy.mockRestore();
  });
});
