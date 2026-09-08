import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Menu, type MenuEntry } from './Menu';
import { Table } from './Table';

afterEach(cleanup);

const Trigger = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...props}>
    Open
  </button>
);

function open() {
  fireEvent.click(screen.getByText('Open'));
}

describe('Menu', () => {
  it('is closed until the trigger is clicked, then portals a role="menu" to <body>', () => {
    const { container } = render(<Menu trigger={<Trigger />} items={[{ label: 'One', onClick: () => {} }]} />);
    expect(screen.queryByRole('menu')).toBeNull();
    open();
    const menu = screen.getByRole('menu');
    expect(document.body).toContainElement(menu);
    expect(container).not.toContainElement(menu);
  });

  it('marks the trigger with aria-haspopup / aria-expanded', () => {
    render(<Menu trigger={<Trigger />} items={[{ label: 'One' }]} />);
    const trigger = screen.getByText('Open');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    open();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders items as role="menuitem"; activating one fires onClick and closes', () => {
    const onClick = vi.fn();
    render(<Menu trigger={<Trigger />} items={[{ label: 'Settings', onClick }]} />);
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('keepOpen leaves the menu open after activating', () => {
    const onClick = vi.fn();
    render(<Menu trigger={<Trigger />} items={[{ label: 'Toggle', onClick, keepOpen: true }]} />);
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Toggle' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders separators and headings, and a disabled item does not fire', () => {
    const onClick = vi.fn();
    const items: MenuEntry[] = [
      { heading: 'Account' },
      { label: 'Profile', onClick: () => {} },
      { separator: true },
      { label: 'Nope', onClick, disabled: true },
    ];
    render(<Menu trigger={<Trigger />} items={items} />);
    open();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nope' }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    render(<Menu trigger={<Trigger />} items={[{ label: 'One' }]} />);
    open();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByText('Open')).toHaveFocus();
  });

  it('closes on an outside pointerdown', () => {
    render(<Menu trigger={<Trigger />} items={[{ label: 'One' }]} />);
    open();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('roves with ArrowDown/ArrowUp and activates with Enter', () => {
    const a = vi.fn();
    const b = vi.fn();
    render(
      <Menu
        trigger={<Trigger />}
        items={[
          { label: 'A', onClick: a },
          { label: 'B', onClick: b },
        ]}
      />,
    );
    open();
    const menu = screen.getByRole('menu');
    // first item is active by default → ArrowDown moves to B
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(b).toHaveBeenCalledTimes(1);
    expect(a).not.toHaveBeenCalled();
  });

  it('skips a disabled item while roving', () => {
    const a = vi.fn();
    const c = vi.fn();
    render(
      <Menu
        trigger={<Trigger />}
        items={[
          { label: 'A', onClick: a },
          { label: 'B', disabled: true },
          { label: 'C', onClick: c },
        ]}
      />,
    );
    open();
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // A → C (B skipped)
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(c).toHaveBeenCalledTimes(1);
  });

  it('the children render-prop gets a working close()', () => {
    render(
      <Menu trigger={<Trigger />} label="Notifications">
        {(close) => (
          <button type="button" onClick={close}>
            done
          </button>
        )}
      </Menu>,
    );
    open();
    const panel = screen.getByRole('dialog', { name: 'Notifications' });
    expect(panel).toBeInTheDocument();
    fireEvent.click(within(panel).getByText('done'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('supports a controlled open state', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Menu trigger={<Trigger />} open={false} onOpenChange={onOpenChange} items={[{ label: 'One' }]} />);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByText('Open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // still closed — parent owns the state
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(<Menu trigger={<Trigger />} open onOpenChange={onOpenChange} items={[{ label: 'One' }]} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders a header above the items', () => {
    render(
      <Menu
        trigger={<Trigger />}
        header={<div>Ana Beatriz Ramos</div>}
        items={[{ label: 'Sign out', onClick: () => {} }]}
      />,
    );
    open();
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Ana Beatriz Ramos')).toBeInTheDocument();
    // header comes before the first menuitem in DOM order
    const header = within(menu).getByText('Ana Beatriz Ramos');
    const firstItem = within(menu).getByRole('menuitem');
    expect(header.compareDocumentPosition(firstItem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('works as a per-row action menu inside a Table', () => {
    const onDelete = vi.fn();
    render(
      <Table caption="Clients">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Marina</Table.Cell>
            <Table.Cell>
              <Menu
                trigger={<Trigger />}
                items={[
                  { label: 'Edit', onClick: () => {} },
                  { label: 'Delete', tone: 'danger', onClick: onDelete },
                ]}
              />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    open();
    // portalled out of the table, so the scroll region can't clip it
    const menu = screen.getByRole('menu');
    expect(document.body).toContainElement(menu);
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('keeps a wide panel on screen at a narrow viewport (left never goes negative)', () => {
    const orig = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
    try {
      render(<Menu trigger={<Trigger />} align="end" width={360} items={[{ label: 'One' }]} />);
      open();
      const menu = screen.getByRole('menu');
      expect(parseFloat(menu.style.left)).toBeGreaterThanOrEqual(12);
      expect(menu.style.right).toBe('');
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: orig, configurable: true });
    }
  });

  it('composes with the trigger’s own onClick', () => {
    const triggerClick = vi.fn();
    render(<Menu trigger={<Trigger onClick={triggerClick} />} items={[{ label: 'One' }]} />);
    open();
    expect(triggerClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
