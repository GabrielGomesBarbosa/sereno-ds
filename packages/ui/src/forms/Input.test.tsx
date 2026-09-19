import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Input } from './Input';

afterEach(cleanup);

describe('Input — ref', () => {
  it('forwards ref to the native input, still usable for the password-reveal focus-back', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Nome" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});
