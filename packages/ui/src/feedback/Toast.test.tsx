import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Toast } from './Toast';

afterEach(cleanup);

describe('Toast', () => {
  it('renders the title, the optional description, and a status role', () => {
    render(<Toast title="Saved" description="Your changes are live." />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Saved');
    expect(toast).toHaveTextContent('Your changes are live.');
  });

  it('paints the requested tone', () => {
    const { rerender } = render(<Toast tone="error" title="Failed" />);
    expect(screen.getByRole('status').getAttribute('style')).toContain('--status-error-bg');
    rerender(<Toast tone="success" title="Done" />);
    expect(screen.getByRole('status').getAttribute('style')).toContain('--status-success-bg');
  });

  it('shows the ✕ only when onClose is given, and it fires', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Toast title="Saved" />);
    expect(screen.queryByRole('button', { name: 'Fechar' })).toBeNull();
    rerender(<Toast title="Saved" onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(close).toHaveClass('sereno-dismiss'); // proper icon button, not a bare ×
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a passed icon and action node', () => {
    render(<Toast title="Saved" icon={<svg data-testid="ico" />} action={<button>Undo</button>} />);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });
});
