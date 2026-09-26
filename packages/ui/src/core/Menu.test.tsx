import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const withViewport = (w: number, fn: () => void) => {
    const orig = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
    try {
      fn();
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: orig, configurable: true });
    }
  };

  it('spans the gutters (centred, full-width) on a phone-width viewport', () => {
    withViewport(400, () => {
      render(<Menu trigger={<Trigger />} align="end" width={360} items={[{ label: 'One' }]} />);
      open();
      const menu = screen.getByRole('menu');
      expect(menu.style.left).toBe('12px');
      expect(menu.style.right).toBe('12px');
      expect(menu.style.width).toBe(''); // width is implied by left + right
    });
  });

  it('clamps left (no negative) but does not force full-width on a wide viewport', () => {
    withViewport(1200, () => {
      render(<Menu trigger={<Trigger />} align="end" width={360} items={[{ label: 'One' }]} />);
      open();
      const menu = screen.getByRole('menu');
      expect(parseFloat(menu.style.left)).toBeGreaterThanOrEqual(12);
      expect(menu.style.right).toBe('');
    });
  });

  it('composes with the trigger’s own onClick', () => {
    const triggerClick = vi.fn();
    render(<Menu trigger={<Trigger onClick={triggerClick} />} items={[{ label: 'One' }]} />);
    open();
    expect(triggerClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

/**
 * Which row is active. Opened by a click or tap nothing is (no phantom hover under a
 * cursor that never touched the panel); opened any other way the first enabled row is,
 * with a focus ring, so Enter works straight away.
 */
describe('Menu active row', () => {
  const ITEMS = (): MenuEntry[] => [
    { label: 'A', onClick: () => {} },
    { label: 'B', onClick: () => {} },
    { label: 'C', onClick: () => {} },
  ];
  const trigger = () => screen.getByText('Open');
  const rows = () => screen.getAllByRole('menuitem');
  const activeLabels = () => rows().filter((r) => r.hasAttribute('data-active')).map((r) => r.textContent);
  const hasRing = (row: HTMLElement) => row.style.boxShadow === 'var(--focus-ring)';

  /** A real click or tap: carries a click count (`detail`). */
  const clickTrigger = () => fireEvent.click(trigger(), { detail: 1 });
  /** Enter / Space on a native button: keydown, then a synthetic click with `detail` 0. */
  const pressTrigger = (key: 'Enter' | ' ') => {
    fireEvent.keyDown(trigger(), { key });
    fireEvent.click(trigger());
  };

  describe('opened with the pointer', () => {
    it('highlights no row (a real click sequence)', async () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      await userEvent.click(trigger());
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(activeLabels()).toEqual([]);
      rows().forEach((r) => expect(hasRing(r)).toBe(false));
    });

    it('highlights no row (a click carrying a click count)', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      expect(activeLabels()).toEqual([]);
    });

    it('still moves focus into the panel', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      expect(screen.getByRole('menu')).toHaveFocus();
    });

    it('Enter with nothing active does nothing, and the menu stays open', () => {
      const onClick = vi.fn();
      render(<Menu trigger={<Trigger />} items={[{ label: 'A', onClick }]} />);
      clickTrigger();
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('hover activates the row under the pointer, without a focus ring', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'B' }));
      expect(activeLabels()).toEqual(['B']);
      expect(hasRing(screen.getByRole('menuitem', { name: 'B' }))).toBe(false);
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'C' }));
      expect(activeLabels()).toEqual(['C']);
    });

    it('the highlight leaves with the pointer instead of sticking to the last row it crossed', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      const b = screen.getByRole('menuitem', { name: 'B' });
      fireEvent.mouseEnter(b);
      expect(activeLabels()).toEqual(['B']);
      fireEvent.mouseLeave(b);
      expect(activeLabels()).toEqual([]);
    });

    it('moving straight from one row to the next hands the highlight over', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      const b = screen.getByRole('menuitem', { name: 'B' });
      const c = screen.getByRole('menuitem', { name: 'C' });
      fireEvent.mouseEnter(b);
      fireEvent.mouseLeave(b);
      fireEvent.mouseEnter(c);
      expect(activeLabels()).toEqual(['C']);
    });

    it('after the pointer left, ArrowDown starts from the first row again', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      const c = screen.getByRole('menuitem', { name: 'C' });
      fireEvent.mouseEnter(c);
      fireEvent.mouseLeave(c);
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['A']);
    });

    it('ArrowDown from nothing goes to the first row, ArrowUp to the last, both with a ring', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['A']);
      expect(hasRing(screen.getByRole('menuitem', { name: 'A' }))).toBe(true);
      fireEvent.pointerDown(document.body); // close
      clickTrigger();
      expect(activeLabels()).toEqual([]);
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' });
      expect(activeLabels()).toEqual(['C']);
    });
  });

  describe('opened from the keyboard', () => {
    it.each([
      ['Enter', 'Enter'],
      ['Space', ' '],
    ] as const)('%s on the trigger opens with the first row active and ringed', (_name, key) => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      pressTrigger(key);
      expect(activeLabels()).toEqual(['A']);
      expect(hasRing(screen.getByRole('menuitem', { name: 'A' }))).toBe(true);
    });

    it('a click without a click count (screen reader, element.click()) takes the keyboard side', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      open();
      expect(activeLabels()).toEqual(['A']);
    });

    it('ArrowDown on the trigger opens with the first row active, and Enter activates it', () => {
      const a = vi.fn();
      render(<Menu trigger={<Trigger />} items={[{ label: 'A', onClick: a }, { label: 'B' }]} />);
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
      expect(screen.getByRole('menu')).toHaveFocus();
      expect(activeLabels()).toEqual(['A']);
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
      expect(a).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('ArrowUp on the trigger opens with the last row active', () => {
      const c = vi.fn();
      render(<Menu trigger={<Trigger />} items={[{ label: 'A' }, { label: 'B' }, { label: 'C', onClick: c }]} />);
      fireEvent.keyDown(trigger(), { key: 'ArrowUp' });
      expect(activeLabels()).toEqual(['C']);
      fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' });
      expect(c).toHaveBeenCalledTimes(1);
    });

    it('starts on the first ENABLED row', () => {
      render(<Menu trigger={<Trigger />} items={[{ label: 'A', disabled: true }, { label: 'B' }]} />);
      pressTrigger('Enter');
      expect(activeLabels()).toEqual(['B']);
    });

    it('a mouse move takes over: the hovered row is active and the ring goes away', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      pressTrigger('Enter');
      expect(hasRing(screen.getByRole('menuitem', { name: 'A' }))).toBe(true);
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'C' }));
      expect(activeLabels()).toEqual(['C']);
      expect(hasRing(screen.getByRole('menuitem', { name: 'C' }))).toBe(false);
    });

    it('ArrowDown / ArrowUp on the trigger do nothing when the menu is disabled or is a rich panel', () => {
      const { unmount } = render(<Menu trigger={<Trigger />} disabled items={ITEMS()} />);
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
      expect(screen.queryByRole('menu')).toBeNull();
      unmount();
      render(<Menu trigger={<Trigger />}>{() => <div>panel</div>}</Menu>);
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('composes with the trigger’s own onKeyDown, and respects preventDefault there', () => {
      const own = vi.fn((e: React.KeyboardEvent) => e.preventDefault());
      render(<Menu trigger={<Trigger onKeyDown={own} />} items={ITEMS()} />);
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
      expect(own).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  describe('roving', () => {
    it('Home / End / ArrowUp / ArrowDown move the active row and clamp at the ends', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      pressTrigger('Enter');
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'End' });
      expect(activeLabels()).toEqual(['C']);
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['C']);
      fireEvent.keyDown(menu, { key: 'ArrowUp' });
      expect(activeLabels()).toEqual(['B']);
      fireEvent.keyDown(menu, { key: 'Home' });
      expect(activeLabels()).toEqual(['A']);
      fireEvent.keyDown(menu, { key: 'ArrowUp' });
      expect(activeLabels()).toEqual(['A']);
    });

    it('a pointer leaving a row does not disturb the row the keyboard is on', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      pressTrigger('Enter');
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'End' });
      expect(activeLabels()).toEqual(['C']);
      fireEvent.mouseLeave(screen.getByRole('menuitem', { name: 'B' }));
      fireEvent.mouseLeave(screen.getByRole('menuitem', { name: 'C' }));
      expect(activeLabels()).toEqual(['C']);
      expect(hasRing(screen.getByRole('menuitem', { name: 'C' }))).toBe(true);
    });

    it('skips disabled rows, and a disabled row is never active even when hovered', () => {
      render(<Menu trigger={<Trigger />} items={[{ label: 'A' }, { label: 'B', disabled: true }, { label: 'C' }]} />);
      pressTrigger('Enter');
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['C']);
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'B' }));
      expect(activeLabels()).toEqual(['C']);
    });

    it('Enter and Space activate the active row', () => {
      const b = vi.fn();
      render(<Menu trigger={<Trigger />} items={[{ label: 'A' }, { label: 'B', onClick: b, keepOpen: true }]} />);
      pressTrigger('Enter');
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'Enter' });
      fireEvent.keyDown(menu, { key: ' ' });
      expect(b).toHaveBeenCalledTimes(2);
    });
  });

  describe('a fresh open starts clean', () => {
    it('does not inherit the last hovered row after closing with the trigger', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'C' }));
      expect(activeLabels()).toEqual(['C']);
      clickTrigger(); // the trigger toggles it closed
      expect(screen.queryByRole('menu')).toBeNull();
      clickTrigger();
      expect(activeLabels()).toEqual([]);
    });

    it('a keyboard open after a pointer session starts on the first row again', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'C' }));
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
      pressTrigger('Enter');
      expect(activeLabels()).toEqual(['A']);
    });

    it('a parent forcing `open` (no trigger involved) takes the keyboard side', () => {
      render(<Menu trigger={<Trigger />} open onOpenChange={() => {}} items={ITEMS()} />);
      expect(activeLabels()).toEqual(['A']);
    });
  });

  describe('focus', () => {
    it('returns to the trigger on Escape and after activating a row, whichever way it opened', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
      expect(trigger()).toHaveFocus();
      pressTrigger('Enter');
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger()).toHaveFocus();
    });

    it('does not steal focus from an autoFocus field inside a rich panel', () => {
      render(<Menu trigger={<Trigger />}>{() => <input aria-label="Name" autoFocus />}</Menu>);
      open();
      expect(screen.getByLabelText('Name')).toHaveFocus();
    });

    it('keeps role="menu" / "menuitem" and the trigger aria wiring', () => {
      render(<Menu trigger={<Trigger />} items={ITEMS()} />);
      clickTrigger();
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(rows()).toHaveLength(3);
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
