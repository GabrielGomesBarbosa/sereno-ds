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

  it('draws the body at full opacity, so it keeps the contrast of its tone (#156)', () => {
    // opacity 0.9 over the tinted background took the success tone to 4.13:1, under the 4.5:1 AA needs for 12 px text.
    // axe measures it in the docs (a11y.spec.ts); this keeps the unit suite from letting an opacity slip back in.
    render(<Alert tone="success" title="Saved">Your changes are live.</Alert>);
    expect(screen.getByText('Your changes are live.').getAttribute('style') ?? '').not.toContain('opacity');
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
