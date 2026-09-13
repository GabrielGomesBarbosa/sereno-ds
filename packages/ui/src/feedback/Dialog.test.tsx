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
    render(
      <Dialog open={false}>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('portals to <body> rather than rendering inline', () => {
    const { container } = render(
      <Dialog open>
        <Dialog.Header title="Cancel booking?" />
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it('shows title, description and footer', () => {
    render(
      <Dialog open>
        <Dialog.Header title="Cancel booking?" description="The client will be notified." />
        <Dialog.Footer>
          <button>Confirm</button>
        </Dialog.Footer>
      </Dialog>,
    );
    expect(screen.getByRole('heading', { name: 'Cancel booking?' })).toBeInTheDocument();
    expect(screen.getByText('The client will be notified.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose on scrim click but not on panel click', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    const panel = screen.getByRole('dialog');
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(panel.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks page scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Dialog open>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Dialog open={false}>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('renders the sheet variant', () => {
    render(
      <Dialog open variant="sheet">
        <Dialog.Header title="Filters" />
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('caps the panel at the requested size', () => {
    render(
      <Dialog open size="lg">
        <Dialog.Header title="Report" />
      </Dialog>,
    );
    expect(screen.getByRole('dialog').getAttribute('style')).toContain('800px');
  });

  it('an explicit width overrides size', () => {
    render(
      <Dialog open size="lg" width={512}>
        <Dialog.Header title="Report" />
      </Dialog>,
    );
    const style = screen.getByRole('dialog').getAttribute('style') ?? '';
    expect(style).toContain('512px');
    expect(style).not.toContain('800px');
  });

  it('fullscreen fills the viewport', () => {
    render(
      <Dialog open variant="fullscreen">
        <Dialog.Header title="Edit" />
      </Dialog>,
    );
    expect(screen.getByRole('dialog').getAttribute('style')).toContain('height: 100%');
  });

  it('Dialog.Close calls onClose; absent unless you render it', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open onClose={onClose}>
        <Dialog.Header title="Hi" />
      </Dialog>,
    );
    expect(screen.queryByRole('button', { name: 'Fechar' })).toBeNull();
    rerender(
      <Dialog open onClose={onClose}>
        <Dialog.Header title="Hi">
          <Dialog.Close />
        </Dialog.Header>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismissible={false} blocks the scrim click and Escape, but not Dialog.Close', () => {
    const onClose = vi.fn();
    render(
      <Dialog open dismissible={false} onClose={onClose}>
        <Dialog.Header title="Required">
          <Dialog.Close />
        </Dialog.Header>
      </Dialog>,
    );
    const panel = screen.getByRole('dialog');
    fireEvent.click(panel.parentElement as HTMLElement); // scrim
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' })); // the ✕
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dividers keeps header, body and footer all rendered', () => {
    render(
      <Dialog open dividers>
        <Dialog.Header title="Terms" />
        <Dialog.Body>
          <p>Body copy.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <button>OK</button>
        </Dialog.Footer>
      </Dialog>,
    );
    expect(screen.getByRole('heading', { name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByText('Body copy.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('works with no Header at all — just a Body', () => {
    render(
      <Dialog open>
        <Dialog.Body>Just body copy.</Dialog.Body>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByText('Just body copy.')).toBeInTheDocument();
  });

  it('throws when a subcomponent is rendered outside <Dialog>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Dialog.Body>x</Dialog.Body>)).toThrow(/must be rendered inside <Dialog>/);
    spy.mockRestore();
  });
});
