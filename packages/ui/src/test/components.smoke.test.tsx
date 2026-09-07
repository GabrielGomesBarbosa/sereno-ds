import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as UI from '../index';

afterEach(cleanup);

/** Every component the barrel is meant to export. */
const EXPECTED = [
  'Button', 'IconButton', 'Badge', 'Card', 'Avatar', 'Brand', 'Table',
  'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch', 'DateTimePicker',
  'FileUpload', 'AvatarUpload', 'SearchInput',
  'TopBar', 'Tabs', 'BottomNav', 'SidebarNav', 'Stepper',
  'Alert', 'Toast', 'Dialog', 'Skeleton', 'EmptyState',
  'ThemeProvider', 'ThemeToggle',
] as const;

const icon = <svg aria-hidden width={16} height={16} />;

/** One minimal-but-valid render per component. */
const CASES: Record<string, React.ReactElement> = {
  Button: <UI.Button>Save</UI.Button>,
  IconButton: <UI.IconButton label="Back">{icon}</UI.IconButton>,
  Badge: <UI.Badge>New</UI.Badge>,
  Card: <UI.Card>body</UI.Card>,
  Avatar: <UI.Avatar name="Ana Ramos" />,
  Brand: <UI.Brand />,
  Table: (
    <UI.Table caption="Clients">
      <UI.Table.Head>
        <UI.Table.Row>
          <UI.Table.HeaderCell sortKey="name" sort={{ key: 'name', direction: 'asc' }} onSort={() => {}}>
            Name
          </UI.Table.HeaderCell>
        </UI.Table.Row>
      </UI.Table.Head>
      <UI.Table.Body>
        <UI.Table.Row selected onClick={() => {}}>
          <UI.Table.Cell>Ana</UI.Table.Cell>
        </UI.Table.Row>
      </UI.Table.Body>
    </UI.Table>
  ),
  Input: <UI.Input label="Name" hint="Helper" />,
  Textarea: <UI.Textarea label="Bio" />,
  Select: <UI.Select label="Plan" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />,
  Checkbox: <UI.Checkbox label="I accept" />,
  Radio: <UI.Radio name="g" label="One" />,
  Switch: <UI.Switch />,
  DateTimePicker: <UI.DateTimePicker year={2026} month={0} selectedDate={5} times={['09:00', { value: '10:00', disabled: true }]} />,
  FileUpload: <UI.FileUpload />,
  AvatarUpload: <UI.AvatarUpload />,
  SearchInput: <UI.SearchInput placeholder="Search" />,
  TopBar: <UI.TopBar title="Agenda" subtitle="Today" />,
  Tabs: <UI.Tabs value="a" items={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />,
  BottomNav: <UI.BottomNav value="a" items={[{ value: 'a', label: 'A', icon }, { value: 'b', label: 'B', icon }]} />,
  SidebarNav: <UI.SidebarNav value="a" sections={[{ items: [{ value: 'a', label: 'A', icon }] }]} />,
  Stepper: <UI.Stepper current={1} steps={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} />,
  Alert: <UI.Alert tone="warning" title="Heads up" onDismiss={() => {}}>Body copy.</UI.Alert>,
  Toast: <UI.Toast tone="success" title="Saved" description="All good" />,
  Dialog: <UI.Dialog open title="Confirm" description="Sure?">Body</UI.Dialog>,
  Skeleton: <UI.Skeleton />,
  EmptyState: <UI.EmptyState title="Nothing here" description="Add the first one." />,
  ThemeProvider: <UI.ThemeProvider><span>child</span></UI.ThemeProvider>,
  ThemeToggle: <UI.ThemeToggle />,
};

describe('@sereno/ui barrel', () => {
  it('exports every documented component', () => {
    for (const name of EXPECTED) expect(UI, name).toHaveProperty(name);
  });

  it('has a render case for every export', () => {
    for (const name of EXPECTED) expect(CASES[name], `missing render case for ${name}`).toBeTruthy();
  });
});

describe('component smoke — renders without throwing', () => {
  for (const name of EXPECTED) {
    it(name, () => {
      const el = name === 'ThemeProvider' ? CASES[name] : <UI.ThemeProvider>{CASES[name]}</UI.ThemeProvider>;
      const { unmount } = render(el);
      // Portalled components (Dialog) render into document.body, not the container.
      expect(document.body.textContent ?? '').not.toBe('');
      expect(() => unmount()).not.toThrow();
    });
  }
});
