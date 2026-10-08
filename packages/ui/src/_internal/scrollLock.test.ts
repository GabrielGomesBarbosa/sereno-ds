import { afterEach, describe, expect, it } from 'vitest';
import { acquireScrollLock } from './scrollLock';

const html = () => document.documentElement.style.overflow;
const body = () => document.body.style.overflow;
const both = () => [html(), body()];

afterEach(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

describe('acquireScrollLock', () => {
  it('locks <html> and <body>, and the release puts them back', () => {
    expect(both()).toEqual(['', '']);
    const release = acquireScrollLock();
    expect(both()).toEqual(['hidden', 'hidden']);
    release();
    expect(both()).toEqual(['', '']);
  });

  it('puts back what the page had, per element, not an empty value', () => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'scroll';
    const release = acquireScrollLock();
    expect(both()).toEqual(['hidden', 'hidden']);
    release();
    expect(both()).toEqual(['auto', 'scroll']);
  });

  it('a second holder does not mistake the lock for the page value: the first to let go leaves it locked', () => {
    const a = acquireScrollLock();
    const b = acquireScrollLock();
    a();
    expect(both()).toEqual(['hidden', 'hidden']);
    b();
    expect(both()).toEqual(['', '']);
  });

  it.each([
    ['in the order they were taken', [0, 1, 2]],
    ['in the reverse order', [2, 1, 0]],
    ['the middle one first', [1, 0, 2]],
    ['the last one first, then the first', [2, 0, 1]],
  ])('three holders let go %s: locked until the last, then as it was', (_name, order) => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'scroll';
    const releases = [acquireScrollLock(), acquireScrollLock(), acquireScrollLock()];
    order.forEach((i, n) => {
      releases[i]();
      expect(both()).toEqual(n < order.length - 1 ? ['hidden', 'hidden'] : ['auto', 'scroll']);
    });
  });

  it('letting go twice counts once: it cannot unlock someone else', () => {
    const a = acquireScrollLock();
    const b = acquireScrollLock();
    a();
    a();
    a();
    expect(both()).toEqual(['hidden', 'hidden']);
    b();
    expect(both()).toEqual(['', '']);
  });

  it('letting go after everything is already free does nothing', () => {
    const a = acquireScrollLock();
    a();
    document.body.style.overflow = 'clip'; // the page changed it afterwards
    a();
    expect(body()).toBe('clip');
  });

  it('a lock taken again after a full release remembers the page as it is then, not as it was before', () => {
    acquireScrollLock()();
    document.documentElement.style.overflow = 'scroll'; // the page changed it between the two locks
    const release = acquireScrollLock();
    expect(html()).toBe('hidden');
    release();
    expect(html()).toBe('scroll');
  });

  it('a holder that lets go does not stop a later one from being counted', () => {
    const a = acquireScrollLock();
    a();
    const b = acquireScrollLock();
    expect(both()).toEqual(['hidden', 'hidden']);
    b();
    expect(both()).toEqual(['', '']);
  });
});
