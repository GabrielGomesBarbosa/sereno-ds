import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('shows the title', () => {
    render(<EmptyState title="No appointments today" />);
    expect(screen.getByText('No appointments today')).toBeInTheDocument();
  });

  it('with only a title, renders only the title: no empty description, icon or action around it', () => {
    const { container } = render(<EmptyState title="Nothing here" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toHaveTextContent('Nothing here');
  });

  it('shows the description only when there is one', () => {
    const { rerender } = render(<EmptyState title="Nothing here" />);
    expect(screen.queryByText('Try another day')).toBeNull();
    rerender(<EmptyState title="Nothing here" description="Try another day" />);
    expect(screen.getByText('Try another day')).toBeInTheDocument();
  });

  it('shows the icon only when there is one', () => {
    const { rerender } = render(<EmptyState title="Nothing here" />);
    expect(screen.queryByTestId('icon')).toBeNull();
    rerender(<EmptyState title="Nothing here" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('shows the action, and the action keeps working', () => {
    render(<EmptyState title="Nothing here" action={<button type="button">New appointment</button>} />);
    expect(screen.getByRole('button', { name: 'New appointment' })).toBeEnabled();
  });

  it('keeps the title, the description and the action in reading order', () => {
    const { container } = render(
      <EmptyState title="Title" description="Description" action={<button type="button">Action</button>} icon={<svg />} />,
    );
    const text = container.textContent;
    expect(text!.indexOf('Title')).toBeLessThan(text!.indexOf('Description'));
    expect(text!.indexOf('Description')).toBeLessThan(text!.indexOf('Action'));
  });

  it('compact takes less room than the default', () => {
    const { container, rerender } = render(<EmptyState title="Nothing here" />);
    const padding = () => (container.firstElementChild as HTMLElement).style.padding;
    const roomy = padding();
    rerender(<EmptyState title="Nothing here" compact />);
    expect(padding()).not.toBe(roomy);
    expect(padding()).toBe('var(--space-6)');
  });

  it('passes the standard attributes through and lets the caller style it', () => {
    render(<EmptyState title="Nothing here" role="status" data-testid="empty" style={{ margin: 4 }} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('data-testid', 'empty');
    expect(el.style.margin).toBe('4px');
  });
});
