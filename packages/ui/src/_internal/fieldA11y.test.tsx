import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Field } from './Field';
import { fieldA11y, fieldMessageId } from './fieldA11y';

afterEach(cleanup);

describe('fieldA11y', () => {
  it('names the message after the control id', () => {
    expect(fieldMessageId('nome')).toBe('nome-message');
  });

  it('an error: invalid, and described by the message', () => {
    expect(fieldA11y('f', { error: 'Obrigatório' })).toEqual({ 'aria-invalid': true, 'aria-describedby': 'f-message' });
  });

  it('a hint alone: described, not invalid', () => {
    expect(fieldA11y('f', { hint: 'Ajuda' })).toEqual({ 'aria-invalid': undefined, 'aria-describedby': 'f-message' });
  });

  it('an error and a hint: still one message id (the error replaces the hint)', () => {
    expect(fieldA11y('f', { error: 'Obrigatório', hint: 'Ajuda' })['aria-describedby']).toBe('f-message');
  });

  it('nothing to say: both attributes are undefined (so they render nothing)', () => {
    expect(fieldA11y('f', {})).toEqual({ 'aria-invalid': undefined, 'aria-describedby': undefined });
    expect(fieldA11y('f', { error: '', hint: '' })).toEqual({ 'aria-invalid': undefined, 'aria-describedby': undefined });
  });

  it('keeps the consumer ids, after the message', () => {
    expect(fieldA11y('f', { error: 'Obrigatório', describedBy: 'a b' })['aria-describedby']).toBe('f-message a b');
  });

  it('with no message, the consumer ids stand alone, and blank ones add nothing', () => {
    expect(fieldA11y('f', { describedBy: 'a' })['aria-describedby']).toBe('a');
    expect(fieldA11y('f', { describedBy: '   ' })['aria-describedby']).toBeUndefined();
  });

  it('a consumer aria-invalid stands without an error; an error wins over it', () => {
    expect(fieldA11y('f', { invalid: 'true' })['aria-invalid']).toBe('true');
    expect(fieldA11y('f', { invalid: false, error: 'x' })['aria-invalid']).toBe(true);
  });
});

describe('Field, the message line', () => {
  it('carries the id the control points at', () => {
    render(<Field label="Nome" htmlFor="nome" error="Obrigatório"><input id="nome" /></Field>);
    expect(screen.getByText('Obrigatório')).toHaveAttribute('id', fieldMessageId('nome'));
  });

  it('the hint carries it too, and the counter does not take it', () => {
    render(<Field label="Nome" htmlFor="nome" hint="Ajuda" counter={<span>3 / 10</span>}><input id="nome" /></Field>);
    expect(screen.getByText('Ajuda')).toHaveAttribute('id', 'nome-message');
    expect(screen.getByText('3 / 10')).not.toHaveAttribute('id');
  });

  it('with nothing to say, no message line is rendered (and so no dangling id)', () => {
    const { container } = render(<Field label="Nome" htmlFor="nome"><input id="nome" /></Field>);
    expect(container.querySelector('[id$="-message"]')).toBeNull();
  });

  it('with no htmlFor there is no id to build on, so none is set', () => {
    render(<Field error="Obrigatório"><input /></Field>);
    expect(screen.getByText('Obrigatório')).not.toHaveAttribute('id');
  });
});
