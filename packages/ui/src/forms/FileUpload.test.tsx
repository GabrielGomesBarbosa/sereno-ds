import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { FileUpload } from './FileUpload';

afterEach(cleanup);

describe('FileUpload — ref', () => {
  it('forwards ref to the hidden native file input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FileUpload ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('file');
  });
});
