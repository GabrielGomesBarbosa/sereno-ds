import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

afterEach(cleanup);

const STEPS = [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }];

describe('Stepper', () => {
  it('renders one segment per step and marks the current one', () => {
    const { container } = render(<Stepper steps={STEPS} current={1} />);
    expect(container.querySelectorAll('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-current', 'step');
  });

  it('counter defaults to "Step N of M" (1-based, English — no embedded pt-BR)', () => {
    render(<Stepper steps={STEPS} current={0} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.queryByText(/Passo/)).toBeNull();
  });

  it('stepLabel overrides the counter', () => {
    render(<Stepper steps={STEPS} current={2} stepLabel={(c, t) => `Passo ${c} de ${t}`} />);
    expect(screen.getByText('Passo 3 de 3')).toBeInTheDocument();
    expect(screen.queryByText(/Step \d/)).toBeNull();
  });

  it('stepLabel returning null drops the counter but keeps the step label', () => {
    render(<Stepper steps={STEPS} current={1} stepLabel={() => null} />);
    expect(screen.queryByText(/of 3/)).toBeNull();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('onStepClick fires for a completed step, not a future one', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} current={1} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByRole('button', { name: 'Three' }));
    expect(onStepClick).toHaveBeenCalledTimes(1);
  });
});
