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

  describe('Footer fill', () => {
    const footerOf = (name: string) => screen.getByRole('button', { name }).parentElement as HTMLElement;

    it('is off by default, so a footer keeps hugging the right edge at its natural width', () => {
      render(
        <Dialog open>
          <Dialog.Footer>
            <button>Cancel</button>
            <button>Save</button>
          </Dialog.Footer>
        </Dialog>,
      );
      expect(footerOf('Save')).not.toHaveAttribute('data-fill');
      expect(footerOf('Save').style.justifyContent).toBe('flex-end');
    });

    it('marks the footer so the stylesheet can let its buttons grow (the rule sits on the children, so it cannot be inline)', () => {
      render(
        <Dialog open>
          <Dialog.Footer fill>
            <button>Retake</button>
            <button>Cancel</button>
            <button>Save</button>
          </Dialog.Footer>
        </Dialog>,
      );
      const footer = footerOf('Save');
      expect(footer).toHaveAttribute('data-fill', 'true');
      expect(footer).toHaveClass('sereno-dialog-footer');
      // Still a wrapping flex row: `fill` changes how the buttons grow, not whether they wrap.
      expect(footer.style.flexWrap).toBe('wrap');
    });

    it('fill={false} is the same as leaving it out', () => {
      render(
        <Dialog open>
          <Dialog.Footer fill={false}>
            <button>OK</button>
          </Dialog.Footer>
        </Dialog>,
      );
      expect(footerOf('OK')).not.toHaveAttribute('data-fill');
    });
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

  it('works with no Header at all: just a Body', () => {
    render(
      <Dialog open>
        <Dialog.Body>Just body copy.</Dialog.Body>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByText('Just body copy.')).toBeInTheDocument();
  });

  it('traps Tab within the panel: wraps last → first and first → last', () => {
    render(
      <Dialog open>
        <Dialog.Header title="Hi">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Footer>
          <button>OK</button>
        </Dialog.Footer>
      </Dialog>,
    );
    const closeBtn = screen.getByRole('button', { name: 'Fechar' });
    const okBtn = screen.getByRole('button', { name: 'OK' });

    okBtn.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    closeBtn.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(okBtn);
  });

  it('restores focus to the trigger element once closed', () => {
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <Dialog.Header title="Hi">
              <Dialog.Close />
            </Dialog.Header>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('throws when a subcomponent is rendered outside <Dialog>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Dialog.Body>x</Dialog.Body>)).toThrow(/must be rendered inside <Dialog>/);
    spy.mockRestore();
  });
});

/**
 * The page scroll lock (SS-402). Three components locked the scroll each on its own, remembering
 * the value they found and putting it back on close, so two held at once and released in the
 * wrong order left `overflow: hidden` stuck on <html> and <body>. They share one lock now.
 */
describe('Dialog: the page scroll lock', () => {
  const html = () => document.documentElement.style.overflow;
  const body = () => document.body.style.overflow;

  it('locks the scroll while open and gives it back on close', () => {
    const { rerender } = render(<Dialog open={false}><Dialog.Body>x</Dialog.Body></Dialog>);
    expect([html(), body()]).toEqual(['', '']);
    rerender(<Dialog open><Dialog.Body>x</Dialog.Body></Dialog>);
    expect([html(), body()]).toEqual(['hidden', 'hidden']);
    rerender(<Dialog open={false}><Dialog.Body>x</Dialog.Body></Dialog>);
    expect([html(), body()]).toEqual(['', '']);
  });

  it('gives back whatever the page had, not just an empty value', () => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'scroll';
    const { unmount } = render(<Dialog open><Dialog.Body>x</Dialog.Body></Dialog>);
    expect([html(), body()]).toEqual(['hidden', 'hidden']);
    unmount();
    expect([html(), body()]).toEqual(['auto', 'scroll']);
  });

  it.each([
    ['the first one opened closes first', [true, false] as const],
    ['the last one opened closes first', [false, true] as const],
  ])('two dialogs open at once: %s, and the page is as it was once both are closed', (_name, order) => {
    const two = (a: boolean, b: boolean) => (
      <>
        <Dialog open={a}><Dialog.Body>one</Dialog.Body></Dialog>
        <Dialog open={b}><Dialog.Body>two</Dialog.Body></Dialog>
      </>
    );
    const { rerender } = render(two(true, true));
    expect(html()).toBe('hidden');
    // The first closes while the other is still open: the page stays locked.
    rerender(two(order[0] ? false : true, order[1] ? false : true));
    expect([html(), body()]).toEqual(['hidden', 'hidden']);
    rerender(two(false, false));
    expect([html(), body()]).toEqual(['', '']);
  });

  it('a dialog opened inside another one: closing the outer one first still frees the page', () => {
    const nested = (outer: boolean, inner: boolean) => (
      <Dialog open={outer}>
        <Dialog.Body>
          <Dialog open={inner}><Dialog.Body>inner</Dialog.Body></Dialog>
        </Dialog.Body>
      </Dialog>
    );
    const { rerender, unmount } = render(nested(true, true));
    expect(html()).toBe('hidden');
    rerender(nested(false, true)); // the outer unmounts, taking the inner with it
    expect([html(), body()]).toEqual(['', '']);
    unmount();
    expect([html(), body()]).toEqual(['', '']);
  });
});
