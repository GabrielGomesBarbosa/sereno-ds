import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Checkbox } from './Checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  it('renders the description when no error is set', () => {
    render(<Checkbox label="Notificações" description="Receba por e-mail." />);
    expect(screen.getByText('Receba por e-mail.')).toBeInTheDocument();
  });

  it('error replaces description and tints the text red', () => {
    render(<Checkbox label="Termos" description="Leia com atenção." error="Você precisa aceitar os termos." />);
    expect(screen.queryByText('Leia com atenção.')).not.toBeInTheDocument();
    const msg = screen.getByText('Você precisa aceitar os termos.');
    expect(msg.style.color).toBe('var(--interactive-error)');
  });

  it('error tints the checkbox box border red', () => {
    const { container } = render(<Checkbox label="Termos" error="Obrigatório." />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute('style')).toContain('var(--interactive-error)');
  });

  it('without preserveHelperSpace, no secondary row renders when there is nothing to show', () => {
    render(<Checkbox label="Termos" />);
    const label = screen.getByText('Termos');
    expect(label.nextElementSibling).toBeNull();
  });

  it('preserveHelperSpace reserves the row even with neither description nor error', () => {
    render(<Checkbox label="Termos" preserveHelperSpace />);
    const label = screen.getByText('Termos');
    const row = label.nextElementSibling as HTMLElement | null;
    expect(row).not.toBeNull();
    expect(row?.style.minHeight).toBe('calc(var(--text-xs) * 1.45)');
    expect(row?.textContent).toBe('');
  });
});
