import '@testing-library/jest-dom/vitest';

// jsdom ships neither observer; components use them only for layout side-effects.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;

// jsdom doesn't implement scrollIntoView (Select scrolls the active option into view).
Element.prototype.scrollIntoView ??= () => {};
