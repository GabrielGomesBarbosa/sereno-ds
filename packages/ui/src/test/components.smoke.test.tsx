import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as UI from '../index';

afterEach(cleanup);

/** Every component the barrel is meant to export. */
const EXPECTED = [
  'Typography', 'Button', 'IconButton', 'Badge', 'Card', 'Avatar', 'Brand', 'Menu', 'Table',
  'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch', 'DateTimePicker', 'DatePicker',
  'FileUpload', 'AvatarUpload', 'SearchInput',
  'TopBar', 'Tabs', 'BottomNav', 'SidebarNav', 'Stepper',
  'Alert', 'Toast', 'Dialog', 'Skeleton', 'EmptyState',
  'ThemeProvider', 'ThemeToggle',
] as const;

const icon = <svg aria-hidden width={16} height={16} />;

/** One minimal-but-valid render per component. */
const CASES: Record<string, React.ReactElement> = {
  Typography: <UI.Typography variant="h2">Section title</UI.Typography>,
  Button: <UI.Button>Save</UI.Button>,
  IconButton: <UI.IconButton label="Back">{icon}</UI.IconButton>,
  Badge: <UI.Badge>New</UI.Badge>,
  Card: <UI.Card>body</UI.Card>,
  Avatar: <UI.Avatar name="Ana Ramos" />,
  Brand: <UI.Brand />,
  Menu: <UI.Menu trigger={<button type="button">Menu</button>} items={[{ label: 'One', onClick: () => {} }]} />,
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
  Switch: <UI.Switch label="Notificações" />,
  DateTimePicker: <UI.DateTimePicker year={2026} month={0} selectedDate={5} times={['09:00', { value: '10:00', disabled: true }]} />,
  DatePicker: <UI.DatePicker label="Data" defaultValue="2026-10-12" />,
  FileUpload: <UI.FileUpload />,
  AvatarUpload: <UI.AvatarUpload />,
  SearchInput: <UI.SearchInput placeholder="Search" />,
  TopBar: (
    <UI.TopBar>
      <UI.TopBar.Title subtitle="Today">Agenda</UI.TopBar.Title>
    </UI.TopBar>
  ),
  Tabs: (
    <UI.Tabs value="a">
      <UI.Tabs.List>
        <UI.Tabs.Tab value="a">A</UI.Tabs.Tab>
        <UI.Tabs.Tab value="b">B</UI.Tabs.Tab>
      </UI.Tabs.List>
      <UI.Tabs.Panel value="a">panel A</UI.Tabs.Panel>
    </UI.Tabs>
  ),
  BottomNav: (
    <UI.BottomNav value="a">
      <UI.BottomNav.Item value="a" label="A" icon={icon} />
      <UI.BottomNav.Item value="b" label="B" icon={icon} />
    </UI.BottomNav>
  ),
  SidebarNav: (
    <UI.SidebarNav value="a">
      <UI.SidebarNav.Section>
        <UI.SidebarNav.Item value="a" label="A" icon={icon} />
      </UI.SidebarNav.Section>
    </UI.SidebarNav>
  ),
  Stepper: (
    <UI.Stepper current={1}>
      <UI.Stepper.Step label="One" />
      <UI.Stepper.Step label="Two" />
      <UI.Stepper.Step label="Three" />
    </UI.Stepper>
  ),
  Alert: <UI.Alert tone="warning" title="Heads up" onDismiss={() => {}}>Body copy.</UI.Alert>,
  Toast: <UI.Toast tone="success" title="Saved" description="All good" />,
  Dialog: (
    <UI.Dialog open>
      <UI.Dialog.Header title="Confirm" description="Sure?">
        <UI.Dialog.Close />
      </UI.Dialog.Header>
      <UI.Dialog.Body>Body</UI.Dialog.Body>
    </UI.Dialog>
  ),
  Skeleton: <UI.Skeleton />,
  EmptyState: <UI.EmptyState title="Nothing here" description="Add the first one." />,
  ThemeProvider: <UI.ThemeProvider><span>child</span></UI.ThemeProvider>,
  ThemeToggle: <UI.ThemeToggle />,
};

describe('@sereno-ds/ui barrel', () => {
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

// SS-232: an automated floor, not the whole audit — this only sees each
// component's default render (the same CASES above), so it can't catch
// state that only exists once open/interactive (a Select's listbox, a
// Menu's panel) or anything jest-axe can't check in jsdom (colour
// contrast — see SS-230, done separately against the tokens themselves).
// Complements the manual keyboard/ARIA/focus passes (SS-228/229/231); it
// doesn't replace them.
//
// `region` is off: it wants the *whole page* wrapped in a landmark, which
// is a page-composition concern (checked where a real page exists, not
// here) — every isolated component render trips it by construction.
const AXE_OPTIONS = { rules: { region: { enabled: false } } };

describe('component accessibility — axe (SS-232)', () => {
  for (const name of EXPECTED) {
    it(
      name,
      async () => {
        const el = name === 'ThemeProvider' ? CASES[name] : <UI.ThemeProvider>{CASES[name]}</UI.ThemeProvider>;
        render(el);
        const results = await axe(document.body, AXE_OPTIONS);
        expect(results).toHaveNoViolations();
      },
      10000,
    );
  }
});
