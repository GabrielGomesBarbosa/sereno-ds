import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Alert } from './Alert';

afterEach(cleanup);

describe('Alert', () => {
  it('renders the title and the body (children)', () => {
    render(<Alert title="Plan limit">You have used 18 of 20 bookings.</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Plan limit');
    expect(alert).toHaveTextContent('You have used 18 of 20 bookings.');
  });

  it('is role="status" by tone, but role="alert" for error', () => {
    const { rerender } = render(<Alert tone="info">heads up</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<Alert tone="error">broken</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('paints the requested tone', () => {
    render(<Alert tone="warning">check this</Alert>);
    expect(screen.getByRole('status').getAttribute('style')).toContain('--status-warning-bg');
  });

  it('shows the ✕ only when onDismiss is given, and it fires', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Alert>fixed condition</Alert>);
    expect(screen.queryByRole('button', { name: 'Dispensar' })).toBeNull();
    rerender(<Alert onDismiss={onDismiss}>fixed condition</Alert>);
    const dismiss = screen.getByRole('button', { name: 'Dispensar' });
    expect(dismiss).toHaveClass('sereno-dismiss'); // proper icon button, not a bare ×
    fireEvent.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders an action node under the body', () => {
    render(
      <Alert title="Upgrade" action={<button>See plans</button>}>
        Body copy.
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'See plans' })).toBeInTheDocument();
  });
});
