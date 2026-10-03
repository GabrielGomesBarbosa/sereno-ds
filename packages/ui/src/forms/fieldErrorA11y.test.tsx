import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { FileUpload } from './FileUpload';
import { AvatarUpload } from './AvatarUpload';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';

afterEach(cleanup);

/**
 * A form control and its error / hint reach assistive technology (SS-328): the control that
 * takes focus says it is invalid and names the message line, so a screen reader reads
 * "invalid" and the error (or the hint) when the field is focused. `Field` renders the line,
 * `fieldA11y` points the control at it; nothing visual changes.
 *
 * `toHaveAccessibleDescription` is what a screen reader reads after the name, computed the
 * same way a browser does from `aria-describedby`.
 */

interface Props {
  error?: string;
  hint?: string;
}

interface Case {
  name: string;
  /** The field, with the given error / hint. */
  ui: (p: Props) => React.ReactElement;
  /** The element that takes focus: the one that must carry the attributes. */
  control: () => HTMLElement;
}

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const CASES: Case[] = [
  { name: 'Input', ui: (p) => <Input label="Nome" {...p} />, control: () => screen.getByRole('textbox', { name: 'Nome' }) },
  { name: 'Textarea', ui: (p) => <Textarea label="Notas" {...p} />, control: () => screen.getByRole('textbox', { name: 'Notas' }) },
  { name: 'Select', ui: (p) => <Select label="Plano" options={OPTIONS} {...p} />, control: () => screen.getByRole('combobox', { name: 'Plano' }) },
  { name: 'DatePicker', ui: (p) => <DatePicker label="Data" {...p} />, control: () => screen.getByLabelText('Data') },
  { name: 'FileUpload (box)', ui: (p) => <FileUpload label="Documento" {...p} />, control: () => screen.getByRole('button', { name: /click to choose/ }) },
  { name: 'FileUpload (circle)', ui: (p) => <FileUpload label="Foto" shape="circle" {...p} />, control: () => screen.getByRole('button', { name: /click to choose/ }) },
  { name: 'AvatarUpload', ui: (p) => <AvatarUpload label="Foto" {...p} />, control: () => screen.getByRole('button', { name: 'Change photo' }) },
];

describe.each(CASES)('$name, error and hint reach assistive technology', ({ ui, control }) => {
  it('with an error: aria-invalid, and the error is the control description', () => {
    render(ui({ error: 'Campo obrigatório' }));
    const el = control();
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toHaveAccessibleDescription('Campo obrigatório');
  });

  it('aria-describedby points at the element that holds the error text', () => {
    render(ui({ error: 'Campo obrigatório' }));
    const id = control().getAttribute('aria-describedby')!;
    expect(id).toBeTruthy();
    expect(document.getElementById(id)).toHaveTextContent('Campo obrigatório');
  });

  it('with a hint and no error: described by the hint, and not invalid', () => {
    render(ui({ hint: 'Usamos para o comprovante' }));
    const el = control();
    expect(el).toHaveAccessibleDescription('Usamos para o comprovante');
    expect(el).not.toHaveAttribute('aria-invalid');
  });

  it('with both: the error replaces the hint, as on screen', () => {
    render(ui({ error: 'Campo obrigatório', hint: 'Usamos para o comprovante' }));
    const el = control();
    expect(el).toHaveAccessibleDescription('Campo obrigatório');
    expect(screen.queryByText('Usamos para o comprovante')).toBeNull();
  });

  it('with neither: no aria-invalid and no aria-describedby at all', () => {
    render(ui({}));
    const el = control();
    expect(el).not.toHaveAttribute('aria-invalid');
    expect(el).not.toHaveAttribute('aria-describedby');
  });

  it('the error showing and going away flips the attributes with it', () => {
    const { rerender } = render(ui({ error: 'Campo obrigatório' }));
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    rerender(ui({}));
    expect(control()).not.toHaveAttribute('aria-invalid');
    expect(control()).not.toHaveAttribute('aria-describedby');
  });

  it('has no accessibility violations with an error, or with a hint', async () => {
    const withError = render(ui({ error: 'Campo obrigatório' }));
    expect(await axe(withError.container)).toHaveNoViolations();
    withError.unmount();
    const withHint = render(ui({ hint: 'Usamos para o comprovante' }));
    expect(await axe(withHint.container)).toHaveNoViolations();
  });
});

describe('Input and Textarea, the consumer own aria attributes', () => {
  it.each([
    ['Input', (p: React.ComponentProps<typeof Input>) => <Input label="Nome" {...p} />],
    ['Textarea', (p: React.ComponentProps<typeof Textarea>) => <Textarea label="Nome" {...p} />],
  ] as const)('%s: an aria-describedby from the consumer is kept next to the message, never replaced', (_name, make) => {
    render(
      <>
        {make({ error: 'Campo obrigatório', 'aria-describedby': 'extra' })}
        <p id="extra">Só letras.</p>
      </>,
    );
    const el = screen.getByRole('textbox', { name: 'Nome' });
    expect(el.getAttribute('aria-describedby')!.split(' ')).toHaveLength(2);
    expect(el).toHaveAccessibleDescription('Campo obrigatório Só letras.');
  });

  it.each([
    ['Input', (p: React.ComponentProps<typeof Input>) => <Input label="Nome" {...p} />],
    ['Textarea', (p: React.ComponentProps<typeof Textarea>) => <Textarea label="Nome" {...p} />],
  ] as const)('%s: with no hint or error, the consumer aria-describedby is the only one', (_name, make) => {
    render(
      <>
        {make({ 'aria-describedby': 'extra' })}
        <p id="extra">Só letras.</p>
      </>,
    );
    const el = screen.getByRole('textbox', { name: 'Nome' });
    expect(el.getAttribute('aria-describedby')).toBe('extra');
  });

  it.each([
    ['Input', (p: React.ComponentProps<typeof Input>) => <Input label="Nome" {...p} />],
    ['Textarea', (p: React.ComponentProps<typeof Textarea>) => <Textarea label="Nome" {...p} />],
  ] as const)('%s: an aria-invalid from the consumer stands without an error, and an error wins over aria-invalid=false', (_name, make) => {
    const { rerender } = render(make({ 'aria-invalid': true }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    rerender(make({ 'aria-invalid': false, error: 'Campo obrigatório' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('Input: the message id follows a consumer id', () => {
    render(<Input label="Nome" id="nome" error="Campo obrigatório" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'nome-message');
    expect(document.getElementById('nome-message')).toHaveTextContent('Campo obrigatório');
  });

  it('Input: the character counter is a live region of its own and stays out of the description', () => {
    render(<Input label="Nome" maxLength={20} hint="Como no documento" />);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Como no documento');
  });
});

describe('FileUpload, what counts as an error', () => {
  const rejectOne = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'nota.txt', { type: 'text/plain' })] } });
  };

  it('a single file rejected for its type is an error, read with the control', () => {
    render(<FileUpload label="Documento" accept="image/*" />);
    rejectOne();
    const zone = screen.getByRole('button', { name: /click to choose/ });
    expect(zone).toHaveAttribute('aria-invalid', 'true');
    expect(zone).toHaveAccessibleDescription(/isn’t an accepted type/);
  });

  it('the "skipped N" note of a multiple upload is informational: not invalid', () => {
    render(<FileUpload label="Documentos" accept="image/*" multiple />);
    rejectOne();
    expect(screen.getByText(/Skipped 1 file/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /click to choose/ })).not.toHaveAttribute('aria-invalid');
  });

  it('an error from the consumer applies to a multiple upload too', () => {
    render(<FileUpload label="Documentos" multiple error="Envie ao menos um" />);
    const zone = screen.getByRole('button', { name: /click to choose/ });
    expect(zone).toHaveAttribute('aria-invalid', 'true');
    expect(zone).toHaveAccessibleDescription('Envie ao menos um');
  });

  it('once a file is chosen, Replace (the first control to take focus) carries them', () => {
    render(<FileUpload label="Documento" value="https://example.com/doc.png" error="Arquivo recusado" />);
    const replace = screen.getByRole('button', { name: /Replace/ });
    expect(replace).toHaveAttribute('aria-invalid', 'true');
    expect(replace).toHaveAccessibleDescription('Arquivo recusado');
  });
});

describe('AvatarUpload, what counts as an error', () => {
  it('a pick rejected for its type is an error, read with the pencil', () => {
    render(<AvatarUpload label="Foto" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'nota.txt', { type: 'text/plain' })] } });
    const pencil = screen.getByRole('button', { name: 'Change photo' });
    expect(pencil).toHaveAttribute('aria-invalid', 'true');
    expect(pencil).toHaveAccessibleDescription(/image/i);
  });
});

describe('Checkbox, the error state', () => {
  it('with an error: aria-invalid, and the error stays in the name (it sits inside the label)', () => {
    render(<Checkbox label="Aceito os termos" error="Obrigatório" />);
    const el = screen.getByRole('checkbox');
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toHaveAccessibleName('Aceito os termos Obrigatório');
  });

  it('adds no aria-describedby of its own, so the message is not read twice', () => {
    render(<Checkbox label="Aceito os termos" error="Obrigatório" description="Leia antes" />);
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-describedby');
  });

  it('without an error there is no aria-invalid, and a consumer aria-describedby is untouched', () => {
    render(
      <>
        <Checkbox label="Aceito os termos" aria-describedby="extra" />
        <p id="extra">Mais.</p>
      </>,
    );
    const el = screen.getByRole('checkbox');
    expect(el).not.toHaveAttribute('aria-invalid');
    expect(el).toHaveAttribute('aria-describedby', 'extra');
  });

  it('a consumer aria-invalid stands without an error, and an error wins over aria-invalid=false', () => {
    const { rerender } = render(<Checkbox label="Aceito" aria-invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Checkbox label="Aceito" aria-invalid={false} error="Obrigatório" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no accessibility violations with an error', async () => {
    const { container } = render(<Checkbox label="Aceito os termos" error="Obrigatório" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

/**
 * ARIA has no invalid state for a single radio (`aria-invalid` belongs to `radiogroup`), so the
 * radio gets none: the error line is inside its <label>, hence in its name, which is how it is read.
 */
describe('Radio, the error state', () => {
  it('the error is part of the name, and no unsupported aria-invalid is added', () => {
    render(<Radio name="g" label="Online" error="Escolha uma opção" />);
    const el = screen.getByRole('radio');
    expect(el).toHaveAccessibleName('Online Escolha uma opção');
    expect(el).not.toHaveAttribute('aria-invalid');
    expect(el).not.toHaveAttribute('aria-describedby');
  });

  it('a consumer aria-describedby is untouched', () => {
    render(
      <>
        <Radio name="g" label="Online" aria-describedby="extra" />
        <p id="extra">Mais.</p>
      </>,
    );
    expect(screen.getByRole('radio')).toHaveAttribute('aria-describedby', 'extra');
  });

  it('has no accessibility violations with an error', async () => {
    const { container } = render(<Radio name="g" label="Online" error="Escolha uma opção" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
