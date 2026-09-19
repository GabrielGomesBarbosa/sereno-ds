import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SearchInput } from './SearchInput';

afterEach(cleanup);

describe('SearchInput — ref', () => {
  it('forwards ref through to the underlying Input\'s native input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput placeholder="Search" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('role', 'searchbox');
  });
});
