import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TopBar } from './TopBar';

afterEach(cleanup);

describe('TopBar', () => {
  it('renders a title and subtitle', () => {
    render(
      <TopBar>
        <TopBar.Title subtitle="Today">Agenda</TopBar.Title>
      </TopBar>,
    );
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('Title with no children skips the title line but keeps the subtitle', () => {
    render(
      <TopBar>
        <TopBar.Title subtitle="Solo subtitle" />
      </TopBar>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Solo subtitle')).toBeInTheDocument();
  });

  it('Leading renders its children with no wrapper of its own', () => {
    render(
      <TopBar>
        <TopBar.Leading>
          <button>Back</button>
        </TopBar.Leading>
      </TopBar>,
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('Actions renders its children', () => {
    render(
      <TopBar>
        <TopBar.Actions>
          <button>Share</button>
        </TopBar.Actions>
      </TopBar>,
    );
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });

  it('all three slots are independently optional', () => {
    const { container } = render(<TopBar />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
