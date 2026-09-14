import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WhatsAppButton } from './WhatsAppButton';

afterEach(cleanup);

function spyOnWindowOpen() {
  return vi.spyOn(window, 'open').mockImplementation(() => null);
}

describe('WhatsAppButton', () => {
  let openSpy: ReturnType<typeof spyOnWindowOpen>;

  beforeEach(() => {
    openSpy = spyOnWindowOpen();
  });

  it('renders icon-only by default, as an accessible button', () => {
    render(<WhatsAppButton phone="+55 11 99999-8888" />);
    expect(screen.getByRole('button', { name: 'Conversar no WhatsApp' })).toBeInTheDocument();
  });

  it('renders with a visible label when `label` is set', () => {
    render(<WhatsAppButton phone="+55 11 99999-8888" label="Chamar no WhatsApp" />);
    expect(screen.getByRole('button', { name: 'Chamar no WhatsApp' })).toBeInTheDocument();
  });

  it('opens a wa.me link with the phone digits and no message when message is omitted', () => {
    render(<WhatsAppButton phone="+55 (11) 99999-8888" />);
    fireEvent.click(screen.getByRole('button'));
    expect(openSpy).toHaveBeenCalledWith('https://wa.me/5511999998888', '_blank', 'noopener,noreferrer');
  });

  it('URL-encodes a pre-filled `message`', () => {
    render(<WhatsAppButton phone="+5511999998888" message="Olá, tudo bem?" />);
    fireEvent.click(screen.getByRole('button'));
    expect(openSpy).toHaveBeenCalledWith('https://wa.me/5511999998888?text=Ol%C3%A1%2C%20tudo%20bem%3F', '_blank', 'noopener,noreferrer');
  });

  it('is disabled and does nothing on click when there is no phone on file', () => {
    render(<WhatsAppButton phone="" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('respects an explicit `disabled` prop even with a phone on file', () => {
    render(<WhatsAppButton phone="+5511999998888" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
