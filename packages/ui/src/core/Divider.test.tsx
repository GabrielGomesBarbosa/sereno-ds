import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Divider } from './Divider';

afterEach(cleanup);

const style = (el: Element | null | undefined) => el?.getAttribute('style') ?? '';

describe('Divider', () => {
  it('is an <hr>, a separator for a screen reader', () => {
    render(<Divider />);
    expect(screen.getByRole('separator').tagName).toBe('HR');
  });

  it('default is the subtle hairline, strong is the firmer one', () => {
    const { rerender } = render(<Divider data-testid="d" />);
    expect(style(screen.getByTestId('d'))).toContain('border-color: var(--border-subtle)');
    rerender(<Divider variant="strong" data-testid="d" />);
    expect(style(screen.getByTestId('d'))).toContain('border-color: var(--border-strong)');
    rerender(<Divider variant="default" data-testid="d" />);
    expect(style(screen.getByTestId('d'))).toContain('border-color: var(--border-subtle)');
  });

  it('an unknown variant falls back to the default', () => {
    render(<Divider variant={'nope' as 'default'} data-testid="d" />);
    expect(style(screen.getByTestId('d'))).toContain('border-color: var(--border-subtle)');
  });

  it('draws one hairline on the top edge only, with no height of its own', () => {
    render(<Divider data-testid="d" />);
    const s = style(screen.getByTestId('d'));
    expect(s).toContain('border-style: solid');
    expect(s).toContain('border-width: var(--border-width-hairline) 0 0 0');
    expect(s).toContain('height: 0');
    expect(s).toContain('width: 100%');
  });

  it('has no margin of its own: the space around it is the caller\'s', () => {
    render(<Divider data-testid="d" />);
    expect(style(screen.getByTestId('d'))).toContain('margin: 0');
  });

  it('decorative hides it from a screen reader', () => {
    render(<Divider decorative data-testid="d" />);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByTestId('d')).toHaveAttribute('role', 'none');
  });

  it('not decorative has no role attribute: the native one stands', () => {
    render(<Divider data-testid="d" />);
    expect(screen.getByTestId('d')).not.toHaveAttribute('role');
  });

  it('className and other attributes reach it, and the style comes after its own', () => {
    render(<Divider className="mine" aria-label="Fim da lista" style={{ margin: '16px 0' }} data-testid="d" />);
    const hr = screen.getByTestId('d');
    expect(hr).toHaveClass('mine');
    expect(hr).toHaveAttribute('aria-label', 'Fim da lista');
    expect(style(hr)).toContain('margin: 16px 0');
  });
});
