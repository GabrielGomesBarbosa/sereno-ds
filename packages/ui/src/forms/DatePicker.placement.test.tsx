import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DatePicker } from './DatePicker';
import { Dialog } from '../feedback/Dialog';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Where the calendar sits. Normally it is a plain `position: absolute` child right after the field, as it
 * always was. Inside a `position: fixed` container (a Dialog, whose scrolling body would clip it) it is
 * portalled to <body> like the lists of Select and Autocomplete, and the focus is handed over by hand
 * because the calendar is no longer next to the field in the DOM.
 */
const FIXED: React.CSSProperties = { position: 'fixed' };

const trigger = () => screen.getByRole('button', { name: 'Date' });
const openCalendar = () => {
  fireEvent.click(trigger());
  return screen.getByRole('dialog', { name: 'Date' });
};
/** What a keyboard reaches inside the calendar, in tab order (same rule as the component). */
const tabbables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex]')).filter((el) => el.tabIndex >= 0);

describe('DatePicker placement', () => {
  describe('outside a dialog (unchanged)', () => {
    it('keeps the calendar inline, right after the field, below it', () => {
      const { container } = render(
        <div>
          <DatePicker label="Date" />
        </div>,
      );
      const calendar = openCalendar();
      expect(container.contains(calendar)).toBe(true);
      expect(calendar.style.position).toBe('absolute');
      expect(calendar.style.top).toBe('calc(100% + 6px)');
    });

    it('leaves Tab alone: no hand-over of the focus', () => {
      render(<DatePicker label="Date" />);
      openCalendar();
      trigger().focus();
      // `fireEvent` returns false when the default was prevented.
      expect(fireEvent.keyDown(trigger(), { key: 'Tab' })).toBe(true);
    });
  });

  describe('inside a position: fixed container', () => {
    it('portals the calendar to <body>, out of the container that would clip it', () => {
      const { container } = render(
        <div style={FIXED}>
          <DatePicker label="Date" />
        </div>,
      );
      const calendar = openCalendar();
      expect(container.contains(calendar)).toBe(false);
      expect(calendar.parentElement).toBe(document.body);
      expect(calendar.style.position).toBe('fixed');
      // Above the Dialog (1000), level with the lists of Select and Autocomplete.
      expect(calendar.style.zIndex).toBe('1100');
    });

    it('a press on the calendar is not an outside press: the day is picked and the calendar closes', () => {
      const onChange = vi.fn();
      render(
        <div style={FIXED}>
          <DatePicker label="Date" defaultValue="2026-10-12" onChange={onChange} />
        </div>,
      );
      openCalendar();
      const day = screen.getByRole('button', { name: '20' });
      fireEvent.pointerDown(day);
      expect(screen.getByRole('dialog', { name: 'Date' })).toBeInTheDocument(); // still there for the click to land
      fireEvent.click(day);
      expect(onChange).toHaveBeenCalledWith('2026-10-20');
      expect(screen.queryByRole('dialog', { name: 'Date' })).toBeNull();
    });

    it('a press outside closes it', () => {
      render(
        <div style={FIXED}>
          <DatePicker label="Date" />
        </div>,
      );
      openCalendar();
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole('dialog', { name: 'Date' })).toBeNull();
    });

    it('is as wide as the field up to 320px, not wider (its cells are square, so wide means tall)', () => {
      const fieldWidth = (width: number) => {
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
          () => ({ top: 100, bottom: 140, left: 10, right: 10 + width, width, height: 40, x: 10, y: 100, toJSON: () => ({}) }) as DOMRect,
        );
        render(
          <div style={FIXED}>
            <DatePicker label="Date" />
          </div>,
        );
        const calendar = openCalendar();
        const got = calendar.style.width;
        cleanup();
        return got;
      };
      expect(fieldWidth(300)).toBe('300px');
      expect(fieldWidth(560)).toBe('320px');
    });

    describe('stays inside the window (the calendar is as tall as it is wide)', () => {
      const realInnerHeight = window.innerHeight;
      afterEach(() => {
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: realInnerHeight });
      });
      /** A 40px-tall field at `top`, a window `viewport`px high, a calendar `height`px tall. */
      const scene = ({ top, viewport, height }: { top: number; viewport: number; height: number }) => {
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
          () => ({ top, bottom: top + 40, left: 10, right: 210, width: 200, height: 40, x: 10, y: top, toJSON: () => ({}) }) as DOMRect,
        );
        vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewport });
      };
      const calendarTop = () => {
        render(
          <div style={FIXED}>
            <DatePicker label="Date" />
          </div>,
        );
        return openCalendar().style.top;
      };

      it('goes under the field when it fits there', () => {
        scene({ top: 100, viewport: 800, height: 300 });
        expect(calendarTop()).toBe('146px'); // field bottom (140) + 6
      });

      it('goes above the field when it does not fit below but fits above', () => {
        scene({ top: 600, viewport: 800, height: 300 });
        expect(calendarTop()).toBe('294px'); // field top (600) - 6 - its own height
      });

      it('goes as far up as it needs, over the field, when it fits neither way', () => {
        scene({ top: 200, viewport: 400, height: 300 });
        expect(calendarTop()).toBe('92px'); // window (400) - 8 - its own height
      });
    });

    it('closes when the field moves away (the dialog body scrolled)', () => {
      let top = 100;
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        () => ({ top, bottom: top + 40, left: 10, right: 210, width: 200, height: 40, x: 10, y: top, toJSON: () => ({}) }) as DOMRect,
      );
      render(
        <div style={FIXED}>
          <DatePicker label="Date" />
        </div>,
      );
      openCalendar();
      top = 60; // the body scrolled 40px under the field
      fireEvent.scroll(document.body);
      expect(screen.queryByRole('dialog', { name: 'Date' })).toBeNull();
    });

    describe('Tab keeps the order field -> calendar -> what follows', () => {
      const setup = (defaultValue?: string) => {
        render(
          <div style={FIXED}>
            <DatePicker label="Date" defaultValue={defaultValue} />
            <button type="button">After</button>
          </div>,
        );
        const calendar = openCalendar();
        return { calendar, items: tabbables(calendar) };
      };

      it('Tab on the field moves into the calendar', () => {
        const { calendar } = setup();
        trigger().focus();
        expect(fireEvent.keyDown(trigger(), { key: 'Tab' })).toBe(false);
        expect(calendar.contains(document.activeElement)).toBe(true);
      });

      it('with a value, the calendar follows the clear button, not the field', () => {
        const { calendar } = setup('2026-10-12');
        const field = trigger();
        const clear = screen.getByRole('button', { name: 'Limpar data' });
        field.focus();
        expect(fireEvent.keyDown(field, { key: 'Tab' })).toBe(true); // goes on to the clear button by itself
        clear.focus();
        expect(fireEvent.keyDown(clear, { key: 'Tab' })).toBe(false);
        expect(calendar.contains(document.activeElement)).toBe(true);
      });

      it('Tab on the last element closes the calendar and lets the focus go on from the field', () => {
        const { items } = setup();
        const last = items[items.length - 1];
        last.focus();
        expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(true); // not prevented: the browser moves on to "After"
        expect(document.activeElement).toBe(trigger());
        expect(screen.queryByRole('dialog', { name: 'Date' })).toBeNull();
      });

      it('Shift+Tab on the first element goes back to the field and keeps the calendar open', () => {
        const { items } = setup();
        const first = items[0];
        first.focus();
        expect(fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })).toBe(false);
        expect(document.activeElement).toBe(trigger());
        expect(screen.getByRole('dialog', { name: 'Date' })).toBeInTheDocument();
      });

      it('Tab between the calendar elements is left to the browser', () => {
        const { items } = setup();
        expect(items.length).toBeGreaterThan(2);
        items[0].focus();
        expect(fireEvent.keyDown(items[0], { key: 'Tab' })).toBe(true);
        expect(screen.getByRole('dialog', { name: 'Date' })).toBeInTheDocument();
      });
    });
  });

  describe('in a real Dialog', () => {
    it('the calendar is outside the panel, and picking a day does not close the Dialog', () => {
      const onClose = vi.fn();
      render(
        <Dialog open onClose={onClose}>
          <Dialog.Body>
            <DatePicker label="Date" defaultValue="2026-10-12" />
          </Dialog.Body>
        </Dialog>,
      );
      const panel = document.querySelector<HTMLElement>('[aria-modal="true"]')!;
      const calendar = openCalendar();
      expect(panel.contains(calendar)).toBe(false);
      fireEvent.pointerDown(screen.getByRole('button', { name: '20' }));
      fireEvent.click(screen.getByRole('button', { name: '20' }));
      expect(onClose).not.toHaveBeenCalled();
      expect(trigger()).toHaveTextContent('20/10/2026');
    });
  });
});
