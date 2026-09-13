import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Card } from './Card';

afterEach(cleanup);

describe('Card', () => {
  it('a plain Card renders as a div with no button semantics', () => {
    render(<Card>body</Card>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('interactive with no onClick stays a plain div — it must not nest a focusable control inside an outer one (e.g. a <Link>)', () => {
    render(
      <Card interactive padding="lg">
        body
      </Card>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('interactive + onClick (SS-228) is a real keyboard-operable button: focusable, and Enter/Space activate it', () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick}>
        Pick me
      </Card>,
    );
    const card = screen.getByRole('button', { name: 'Pick me' });
    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);

    fireEvent.keyDown(card, { key: 'a' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
