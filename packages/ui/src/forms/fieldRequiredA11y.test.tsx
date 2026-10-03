import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { FileUpload } from './FileUpload';
import { AvatarUpload } from './AvatarUpload';

afterEach(cleanup);

/**
 * `required` reaches assistive technology (SS-329). It used to draw an asterisk in the label and
 * nothing else, so a screen reader read a stray "*" and never said the field was required.
 * It is `aria-required`, not the native `required`, so the browser's own form validation is not
 * switched on; and only on controls whose role supports it (axe flags it on a button).
 */

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

interface Case {
  name: string;
  ui: (p: { required?: boolean }) => React.ReactElement;
  control: () => HTMLElement;
}

const SUPPORTED: Case[] = [
  { name: 'Input', ui: (p) => <Input label="Nome" {...p} />, control: () => screen.getByRole('textbox') },
  { name: 'Textarea', ui: (p) => <Textarea label="Nome" {...p} />, control: () => screen.getByRole('textbox') },
  { name: 'Select', ui: (p) => <Select label="Nome" options={OPTIONS} {...p} />, control: () => screen.getByRole('combobox') },
];

describe.each(SUPPORTED)('$name, required', ({ ui, control }) => {
  it('is announced: aria-required, and the name is the label without the asterisk', () => {
    render(ui({ required: true }));
    expect(control()).toHaveAttribute('aria-required', 'true');
    expect(control()).toHaveAccessibleName('Nome');
  });

  it('the asterisk stays on screen, only hidden from assistive technology', () => {
    render(ui({ required: true }));
    const mark = screen.getByText('*');
    expect(mark).toBeVisible();
    expect(mark).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not switch on the browser own validation (no native required attribute)', () => {
    render(ui({ required: true }));
    expect(control()).not.toHaveAttribute('required');
  });

  it('not required: no aria-required and no asterisk', () => {
    render(ui({}));
    expect(control()).not.toHaveAttribute('aria-required');
    expect(screen.queryByText('*')).toBeNull();
  });

  it('has no accessibility violations when required', async () => {
    const { container } = render(ui({ required: true }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Input and Textarea, a consumer aria-required', () => {
  it.each([
    ['Input', (p: React.ComponentProps<typeof Input>) => <Input label="Nome" {...p} />],
    ['Textarea', (p: React.ComponentProps<typeof Textarea>) => <Textarea label="Nome" {...p} />],
  ] as const)('%s: stands without `required`, and `required` wins over aria-required=false', (_n, make) => {
    const { rerender } = render(make({ 'aria-required': true }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    rerender(make({ 'aria-required': false, required: true }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });
});

describe('controls that are buttons: no aria-required (invalid ARIA there), and the asterisk is kept', () => {
  const BUTTONS: [string, React.ReactElement, () => HTMLElement][] = [
    ['DatePicker', <DatePicker key="d" label="Data" required />, () => screen.getByLabelText(/Data/)],
    ['FileUpload', <FileUpload key="f" label="Documento" required />, () => screen.getByRole('button', { name: /click to choose/ })],
    ['AvatarUpload', <AvatarUpload key="a" label="Foto" required />, () => screen.getByRole('button', { name: 'Change photo' })],
  ];

  it.each(BUTTONS)('%s', async (_n, el, control) => {
    const { container } = render(el);
    expect(control()).not.toHaveAttribute('aria-required');
    // The asterisk is all the required cue this control has, so it is not hidden.
    expect(screen.getByText('*')).not.toHaveAttribute('aria-hidden');
    expect(await axe(container)).toHaveNoViolations();
  });
});

/**
 * The field `<label for>` of a file upload points at its hidden `<input type="file">`, which is
 * out of the accessibility tree, so it named nothing: the drop zone was only its own prompt
 * ("Drag a file here..."), whatever the upload was for.
 */
describe('FileUpload, the label names the drop zone', () => {
  it.each([
    ['box', <FileUpload key="b" label="Documento" id="doc" />],
    ['circle', <FileUpload key="c" label="Documento" shape="circle" id="doc" />],
    ['multiple', <FileUpload key="m" label="Documento" multiple id="doc" />],
  ] as const)('%s: the name is the label, then the prompt', (_n, el) => {
    render(el);
    const zone = screen.getByRole('button', { name: /click to choose/ });
    expect(zone).toHaveAccessibleName(/^Documento .*click to choose/);
    expect(zone).toHaveAttribute('aria-labelledby', 'doc-label doc-prompt');
  });

  it('a custom prompt is read after the label', () => {
    render(<FileUpload label="Comprovante" prompt="Arraste o PDF aqui" />);
    expect(screen.getByRole('button', { name: /Arraste/ })).toHaveAccessibleName('Comprovante Arraste o PDF aqui');
  });

  it('with no label the name stays the prompt, as before', () => {
    render(<FileUpload />);
    const zone = screen.getByRole('button', { name: /click to choose/ });
    expect(zone).not.toHaveAttribute('aria-labelledby');
    expect(zone).toHaveAccessibleName('Drag a file here, or click to choose');
  });

  it('the ids it points at exist, once', () => {
    render(<FileUpload label="Documento" id="doc" />);
    expect(document.querySelectorAll('#doc-label')).toHaveLength(1);
    expect(document.querySelectorAll('#doc-prompt')).toHaveLength(1);
    expect(document.getElementById('doc-label')).toHaveTextContent('Documento');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FileUpload label="Documento" required hint="PDF" error="Obrigatório" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
