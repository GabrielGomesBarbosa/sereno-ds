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

  describe('disabled', () => {
    it('a disabled leaf is aria-disabled and a click never fires onChange', () => {
      const onChange = vi.fn();
      render(
        <SidebarNav value="agenda" onChange={onChange} collapsible={false}>
          <SidebarNav.Section>
            <SidebarNav.Item value="agenda" label="Agenda" />
            <SidebarNav.Item value="domain" label="Domain" disabled />
          </SidebarNav.Section>
        </SidebarNav>,
      );
      const btn = screen.getByRole('button', { name: 'Domain' });
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(btn);
      expect(onChange).not.toHaveBeenCalled();
      // aria-disabled, not the native attribute — still in the accessibility
      // tree, but out of the Tab order (a locked menu shouldn't cost a dead tab stop per item).
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveAttribute('tabindex', '-1');
      const enabled = screen.getByRole('button', { name: 'Agenda' });
      expect(enabled).not.toHaveAttribute('aria-disabled');
      expect(enabled).not.toHaveAttribute('tabindex');
    });

    it('a disabled leaf with an href never renders as a link', () => {
      const Link = ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a data-testid="custom-link" href={href} {...rest}>
          {children}
        </a>
      );
      render(
        <SidebarNav value="home" collapsible={false} linkComponent={Link}>
          <SidebarNav.Section>
            <SidebarNav.Item value="home" label="Home" href="/" />
            <SidebarNav.Item value="pro" label="Pro" href="/pro" disabled />
          </SidebarNav.Section>
        </SidebarNav>,
      );
      expect(screen.getAllByTestId('custom-link')).toHaveLength(1);
      expect(screen.getByRole('button', { name: 'Pro' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('a disabled item can still be the current page — `value` pointing at it keeps aria-current, and it is still not clickable', () => {
      const onChange = vi.fn();
      render(
        <SidebarNav value="domain" onChange={onChange} collapsible={false}>
          <SidebarNav.Section>
            <SidebarNav.Item value="domain" label="Domain" disabled />
          </SidebarNav.Section>
        </SidebarNav>,
      );
      const btn = screen.getByRole('button', { name: 'Domain' });
      expect(btn).toHaveAttribute('aria-current', 'page');
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(btn);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('the branch holding a disabled current SubItem stays open (you can still see where you are), but nothing in it is clickable or toggles closed', () => {
      const onChange = vi.fn();
      render(
        <SidebarNav value="finance:incoming" onChange={onChange} collapsible={false} disabled>
          <SidebarNav.Section>
            <SidebarNav.Item value="finance" label="Finance">
              <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
              <SidebarNav.SubItem value="finance:payouts" label="Payouts" />
            </SidebarNav.Item>
          </SidebarNav.Section>
        </SidebarNav>,
      );
      expect(screen.getByRole('button', { name: 'Incoming' })).toHaveAttribute('aria-current', 'page');
      fireEvent.click(screen.getByRole('button', { name: 'Payouts' }));
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Finance' }));
      expect(screen.getByText('Incoming')).toBeInTheDocument();
    });

    it('a disabled parent does not open its accordion', () => {
      render(
        <SidebarNav value="agenda" collapsible={false}>
          <SidebarNav.Section>
            <SidebarNav.Item value="finance" label="Finance" disabled>
              <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
            </SidebarNav.Item>
          </SidebarNav.Section>
        </SidebarNav>,
      );
      const btn = screen.getByRole('button', { name: 'Finance' });
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Incoming')).toBeNull();
    });

    it('a disabled SubItem is aria-disabled and a click never fires onChange, siblings still work', () => {
      const onChange = vi.fn();
      render(
        <SidebarNav value="finance:incoming" onChange={onChange} collapsible={false}>
          <SidebarNav.Section>
            <SidebarNav.Item value="finance" label="Finance">
              <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
              <SidebarNav.SubItem value="finance:invoices" label="Invoices" disabled />
              <SidebarNav.SubItem value="finance:payouts" label="Payouts" />
            </SidebarNav.Item>
          </SidebarNav.Section>
        </SidebarNav>,
      );
      const invoices = screen.getByRole('button', { name: 'Invoices' });
      expect(invoices).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(invoices);
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Payouts' }));
      expect(onChange).toHaveBeenCalledWith('finance:payouts');
    });

    it('on the collapsed rail a disabled parent opens no flyout but still shows the label tooltip', () => {
      render(
        <SidebarNav value="agenda" collapsed collapsible={false}>
          <SidebarNav.Section>
            <SidebarNav.Item value="finance" label="Finance" disabled>
              <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
            </SidebarNav.Item>
          </SidebarNav.Section>
        </SidebarNav>,
      );
      const btn = screen.getByRole('button', { name: 'Finance' });
      fireEvent.mouseEnter(btn);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Finance');
    });

    describe('on the root', () => {
      function Locked({ onChange, onCollapsedChange }: { onChange?: (v: string) => void; onCollapsedChange?: (c: boolean) => void }) {
        return (
          <SidebarNav value="agenda" onChange={onChange} onCollapsedChange={onCollapsedChange} disabled header={<span>Brand</span>} footer={<button type="button">Upgrade</button>}>
            <SidebarNav.Section>
              <SidebarNav.Item value="agenda" label="Agenda" />
              <SidebarNav.Item value="clients" label="Clients" />
              <SidebarNav.Item value="help" label="Help" disabled={false} />
              <SidebarNav.Item value="finance" label="Finance">
                <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
              </SidebarNav.Item>
            </SidebarNav.Section>
          </SidebarNav>
        );
      }

      it('disables every Item at once; the current page keeps its aria-current', () => {
        const onChange = vi.fn();
        render(<Locked onChange={onChange} />);
        for (const name of ['Agenda', 'Clients', 'Finance']) {
          expect(screen.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true');
        }
        fireEvent.click(screen.getByRole('button', { name: 'Clients' }));
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
      });

      it('an Item with its own `disabled={false}` stays live under a disabled root', () => {
        const onChange = vi.fn();
        render(<Locked onChange={onChange} />);
        const help = screen.getByRole('button', { name: 'Help' });
        expect(help).not.toHaveAttribute('aria-disabled');
        fireEvent.click(help);
        expect(onChange).toHaveBeenCalledWith('help');
      });

      it('SubItems inherit from their parent Item, not straight from the root — an explicitly-enabled parent is not re-locked underneath', () => {
        render(
          <SidebarNav value="agenda" disabled>
            <SidebarNav.Section>
              <SidebarNav.Item value="finance" label="Finance" disabled={false}>
                <SidebarNav.SubItem value="finance:incoming" label="Incoming" />
                <SidebarNav.SubItem value="finance:payouts" label="Payouts" disabled />
              </SidebarNav.Item>
            </SidebarNav.Section>
          </SidebarNav>,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Finance' }));
        expect(screen.getByRole('button', { name: 'Incoming' })).not.toHaveAttribute('aria-disabled');
        // ...and a SubItem's own value still wins over whatever it inherits.
        expect(screen.getByRole('button', { name: 'Payouts' })).toHaveAttribute('aria-disabled', 'true');
      });

      it('the collapse toggle, header and footer stay live — they are not destinations', () => {
        const onCollapsedChange = vi.fn();
        render(<Locked onCollapsedChange={onCollapsedChange} />);
        expect(screen.getByText('Brand')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upgrade' })).not.toHaveAttribute('aria-disabled');
        const toggle = screen.getByRole('button', { name: 'Collapse' });
        expect(toggle).not.toHaveAttribute('aria-disabled');
        fireEvent.click(toggle);
        expect(onCollapsedChange).toHaveBeenCalledWith(true);
      });
    });
  });

  it('throws when a subcomponent is rendered outside <SidebarNav>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SidebarNav.Item value="a" label="A" />)).toThrow(/must be rendered inside <SidebarNav>/);
    spy.mockRestore();
  });
});
