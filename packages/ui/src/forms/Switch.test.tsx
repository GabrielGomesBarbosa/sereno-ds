import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Switch } from './Switch';

afterEach(cleanup);

describe('Switch — ref', () => {
  it('forwards ref to the role="switch" span — no native form element underneath, so only .focus() is meaningful', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Switch label="Notificações" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(screen.getByRole('switch'));
    ref.current?.focus();
    expect(ref.current).toHaveFocus();
  });
});
