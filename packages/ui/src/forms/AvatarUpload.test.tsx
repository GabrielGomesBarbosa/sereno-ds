import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { AvatarUpload } from './AvatarUpload';

afterEach(cleanup);

describe('AvatarUpload — ref', () => {
  it('forwards ref to the hidden native file input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<AvatarUpload ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('file');
    expect(ref.current?.accept).toBe('image/*');
  });
});
