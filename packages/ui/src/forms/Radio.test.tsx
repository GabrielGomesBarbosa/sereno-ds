import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Radio } from './Radio';

afterEach(cleanup);

describe('Radio', () => {
  it('renders the description when no error is set', () => {
    render(<Radio label="Cartão" description="Cobrado na confirmação." />);
    expect(screen.getByText('Cobrado na confirmação.')).toBeInTheDocument();
  });

  it('error replaces description and tints the text red', () => {
    render(<Radio label="Forma de pagamento" description="Escolha uma opção." error="Selecione uma forma de pagamento." />);
    expect(screen.queryByText('Escolha uma opção.')).not.toBeInTheDocument();
    const msg = screen.getByText('Selecione uma forma de pagamento.');
    expect(msg.style.color).toBe('var(--interactive-error)');
  });

  it('error tints the radio circle border red', () => {
    const { container } = render(<Radio label="Pix" error="Obrigatório." />);
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input.getAttribute('style')).toContain('var(--interactive-error)');
  });

  it('without preserveHelperSpace, no secondary row renders when there is nothing to show', () => {
    render(<Radio label="Pix" />);
    const label = screen.getByText('Pix');
    expect(label.nextElementSibling).toBeNull();
  });

  it('preserveHelperSpace reserves the row even with neither description nor error', () => {
    render(<Radio label="Pix" preserveHelperSpace />);
    const label = screen.getByText('Pix');
    const row = label.nextElementSibling as HTMLElement | null;
    expect(row).not.toBeNull();
    expect(row?.style.minHeight).toBe('calc(var(--text-xs) * 1.45)');
    expect(row?.textContent).toBe('');
  });

  it('forwards ref to the native radio input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Radio label="Pix" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });
});
