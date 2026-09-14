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

// jsdom doesn't implement matchMedia — Select reads it to detect a coarse
// (touch) pointer, next-themes reads it on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
