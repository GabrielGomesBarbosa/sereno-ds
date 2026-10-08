/**
 * The one lock on the page scroll, shared by everything that needs it (`Dialog`, and the touch
 * sheet of `Select`).
 *
 * Each of them used to lock on its own: remember the `overflow` it found on <html> and <body>,
 * set `hidden`, and put the remembered value back on close. With two held at once that goes
 * wrong in both directions. The second one remembers `hidden` as if it were the page's own
 * value, so when the locks are released in the wrong order the page ends up with `hidden` for
 * good (and a client-side navigation does not reload it to clear that); and the one that
 * closes first can unlock the page behind a window that is still open (SS-402).
 *
 * Here the first holder records what the page had and sets `hidden`, every other holder just
 * counts, and the last one to let go puts the recorded value back. Order does not matter.
 */

let holders = 0;
let saved: { html: string; body: string } | null = null;

/**
 * Locks the page scroll and returns the function that lets go. Letting go twice is harmless
 * (only the first counts), so a cleanup that runs more than once cannot unlock someone else.
 * Does nothing on the server.
 */
export function acquireScrollLock(): () => void {
  if (typeof document === 'undefined') return () => {};
  const root = document.documentElement;
  const body = document.body;
  if (holders === 0) {
    saved = { html: root.style.overflow, body: body.style.overflow };
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  }
  holders += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders === 0 && saved) {
      root.style.overflow = saved.html;
      body.style.overflow = saved.body;
      saved = null;
    }
  };
}
