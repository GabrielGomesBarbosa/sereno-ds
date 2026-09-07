import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

afterEach(() => {
  cleanup();
  // The scroll-lock effect writes these; make sure nothing leaks between tests.
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<Dialog open={false} title="Hi" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('portals to <body> rather than rendering inline', () => {
    const { container } = render(<Dialog open title="Cancel booking?" />);
    const dialog = screen.getByRole('dialog');
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it('shows title, description and footer', () => {
    render(
      <Dialog
        open
        title="Cancel booking?"
        description="The client will be notified."
        footer={<button>Confirm</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Cancel booking?' })).toBeInTheDocument();
    expect(screen.getByText('The client will be notified.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose on scrim click but not on panel click', () => {
    const onClose = vi.fn();
    render(<Dialog open title="Hi" onClose={onClose} />);
    const panel = screen.getByRole('dialog');
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(panel.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(<Dialog open title="Hi" onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks page scroll while open and restores it on close', () => {
    const { rerender } = render(<Dialog open title="Hi" />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Dialog open={false} title="Hi" />);
    expect(document.body.style.overflow).toBe('');
  });

  it('renders the sheet variant', () => {
    render(<Dialog open variant="sheet" title="Filters" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
