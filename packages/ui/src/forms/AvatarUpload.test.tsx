import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AvatarUpload } from './AvatarUpload';

afterEach(cleanup);

// jsdom doesn't decode images: stub `Image` so the file-picker's load probe
// (`pick()` → `new Image(); probe.onload = …; probe.src = url`) resolves
// synchronously, and stub `URL.createObjectURL` / `revokeObjectURL`, which jsdom
// doesn't implement.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_v: string) {
    this.onload?.();
  }
}
function withFakeImage(fn: () => void) {
  vi.stubGlobal('Image', FakeImage as unknown as typeof Image);
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
  try {
    fn();
  } finally {
    vi.unstubAllGlobals();
  }
}

// jsdom has no `navigator.mediaDevices`: stub `getUserMedia` so the effect takes its
// async, camera-granted path instead of calling `onError` synchronously, which would
// close the modal right back before it ever renders. Also fakes just enough of the
// canvas 2D API (`getContext` returns null in jsdom, `toBlob` never calls back) for
// `CameraModal.shoot()` to go through instead of silently no-opping.
async function withCamera(fn: () => void | Promise<void>) {
  const stream = { getTracks: () => [] } as unknown as MediaStream;
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } });
  const getContext = HTMLCanvasElement.prototype.getContext;
  const toBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ translate() {}, scale() {}, drawImage() {} })) as unknown as typeof getContext;
  HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback) {
    cb(new Blob(['x'], { type: 'image/jpeg' }));
  } as unknown as typeof toBlob;
  try {
    await fn();
  } finally {
    vi.unstubAllGlobals();
    HTMLCanvasElement.prototype.getContext = getContext;
    HTMLCanvasElement.prototype.toBlob = toBlob;
  }
}

/**
 * Captures the `ResizeObserver` the crop stage installs so a test can fire its callback
 * with a chosen `contentRect.width`, standing in for the real layout measurement jsdom
 * doesn't do. `fire` defaults to reporting `DEFAULT_STAGE` (280, see AvatarUpload.tsx)
 * so a test that only wants the canvas-drawing stub can ignore it.
 */
function withFakeResizeObserver(fn: (fire: (width: number) => void) => void | Promise<void>) {
  const real = globalThis.ResizeObserver;
  let callback: ResizeObserverCallback | null = null;
  class FakeResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      callback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  // Real callback: fires outside of any React event handler, exactly like the real
  // ResizeObserver would, so this needs its own `act()` (React would otherwise warn that a
  // state update wasn't wrapped).
  const fire = (width: number) => act(() => void callback?.([{ contentRect: { width } } as ResizeObserverEntry], null as unknown as ResizeObserver));
  try {
    return fn(fire);
  } finally {
    globalThis.ResizeObserver = real;
  }
}

/** Stubs the canvas 2D API `save()` needs, recording every `drawImage` call's arguments. */
function withDrawImageSpy(fn: (calls: () => unknown[][]) => void | Promise<void>) {
  const getContext = HTMLCanvasElement.prototype.getContext;
  const toBlob = HTMLCanvasElement.prototype.toBlob;
  const calls: unknown[][] = [];
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: (...args: unknown[]) => calls.push(args),
  })) as unknown as typeof getContext;
  HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback) {
    cb(new Blob(['x'], { type: 'image/jpeg' }));
  } as unknown as typeof toBlob;
  try {
    return fn(() => calls);
  } finally {
    HTMLCanvasElement.prototype.getContext = getContext;
    HTMLCanvasElement.prototype.toBlob = toBlob;
  }
}

/** Fakes the picked image's decoded size and fires its `load` event (`onImgLoad`). */
function loadFakeImage(dialog: HTMLElement, w: number, h: number) {
  const img = dialog.querySelector('img')!;
  Object.defineProperty(img, 'naturalWidth', { value: w, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: h, configurable: true });
  fireEvent.load(img);
}

function openCropModalFromLibrary() {
  render(<AvatarUpload label="Photo" />);
  const input = document.querySelector('input[type="file"]')!;
  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
  return screen.getByRole('dialog');
}

/** Opens the camera, waits for it to be "ready", and takes a shot, landing on the crop step. */
async function shootPhoto() {
  render(<AvatarUpload label="Photo" />);
  fireEvent.click(screen.getByRole('button', { name: 'Change photo' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Take a photo' }));
  // Capture is disabled until the stream is "ready" (see CameraModal); waiting for it
  // to enable also waits out the microtask that resolves the mocked `getUserMedia`, inside
  // an act() boundary (unlike vi.waitFor, this waitFor is RTL's own, act-aware, version).
  await waitFor(() => expect(screen.getByRole('button', { name: 'Capture' })).toBeEnabled());
  // jsdom's <video> never actually plays anything, so `videoWidth`/`videoHeight` stay 0;
  // `shoot()` bails out on that (a real, un-loaded camera looks the same). Fake a frame size.
  const video = document.querySelector('video')!;
  Object.defineProperty(video, 'videoWidth', { value: 640, configurable: true });
  Object.defineProperty(video, 'videoHeight', { value: 640, configurable: true });
  fireEvent.click(screen.getByRole('button', { name: 'Capture' }));
  // "Save" is unique to the crop dialog's footer (the camera dialog has "Capture" instead),
  // so waiting for it also tells "retake shows Retake" apart from "still on the camera".
  await screen.findByRole('button', { name: 'Save' });
}

describe('AvatarUpload — ref', () => {
  it('forwards ref to the hidden native file input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<AvatarUpload ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('file');
    expect(ref.current?.accept).toBe('image/*');
  });
});

/**
 * The crop modal's layout (SS-322, reported from the schedule-system app, in two rounds):
 * originally `CropStage` (the crop square, shared with `CameraModal`) was a fixed 280×280
 * box, `alignSelf: 'center'`, sitting directly in `Dialog.Body`, a plain block container,
 * not flex/grid, so `alignSelf` did nothing and it drifted to the left edge. `margin: '0
 * auto'` centered it, but that still left it narrower than, and misaligned with, the
 * title and the footer buttons either side of it. It's `width: 100%` now: exactly as wide
 * as everything else in the dialog, whatever that width is, and square via `aspectRatio`.
 */
describe('AvatarUpload, crop modal layout', () => {
  /** The crop stage: the one `aspectRatio: '1'` box, shared by the crop and camera modals. */
  const findStage = (dialog: HTMLElement) => Array.from(dialog.querySelectorAll('div')).find((d) => d.style.aspectRatio === '1')! as HTMLElement;

  it('spans the full dialog body width, same as the title and the footer buttons, instead of a fixed size of its own', () => {
    withFakeImage(() => {
      const dialog = openCropModalFromLibrary();
      const stage = findStage(dialog);
      expect(stage).toBeTruthy();
      expect(stage.style.width).toBe('100%');
      expect(stage.style.margin).toBe('');
    });
  });

  it('gives the zoom row a top margin, so it does not sit flush against the crop square', () => {
    withFakeImage(() => {
      openCropModalFromLibrary();
      const zoomRow = screen.getByLabelText('Zoom').parentElement as HTMLElement;
      expect(zoomRow.style.marginTop).not.toBe('');
      expect(zoomRow.style.marginTop).not.toBe('0');
    });
  });

  it("CameraModal's own live view uses the same full-width stage, before any shot is taken", async () => {
    await withCamera(async () => {
      render(<AvatarUpload label="Photo" />);
      fireEvent.click(screen.getByRole('button', { name: 'Change photo' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Take a photo' }));
      const dialog = await screen.findByRole('dialog');
      const stage = findStage(dialog);
      expect(stage).toBeTruthy();
      expect(stage.style.width).toBe('100%');
      expect(stage.querySelector('video')).toBeInTheDocument();
    });
  });

  it('the crop step after a camera shot reuses the same full-width stage', async () => {
    await withCamera(async () => {
      await shootPhoto();
      const stage = findStage(screen.getByRole('dialog'));
      expect(stage).toBeTruthy();
      expect(stage.style.width).toBe('100%');
    });
  });
});

/**
 * `CropStage` fills its container, so the crop math (`V` in AvatarUpload.tsx: scale, pan,
 * clamping, the final export) no longer has a fixed pixel size to key off. It reads the
 * stage's own live rendered width instead, via a `ResizeObserver` (jsdom does no real
 * layout, so these stub it and drive its callback directly).
 */
describe('AvatarUpload, crop stage measurement', () => {
  it('exports using the measured width, not the pre-measurement guess, and resizes the displayed image to match', () => {
    withFakeImage(() => {
      withFakeResizeObserver((fire) => {
        withDrawImageSpy((drawCalls) => {
          const dialog = openCropModalFromLibrary();
          // A square image, so `scale = V / naturalSize` regardless of orientation.
          loadFakeImage(dialog, 1000, 1000);
          const img = dialog.querySelector('img') as HTMLElement;
          // Before any measurement: the pre-measurement guess (DEFAULT_STAGE, 280px in
          // AvatarUpload.tsx), not yet the stage's real, larger, full-container size.
          expect(img.style.width).toBe('280px');
          // The real container measured 360px, wider than the 280px pre-measurement guess.
          fire(360);
          // Regression guard for a live-caught bug: a plain `useRef` + a `useEffect(fn, [])`
          // reading `.current` once, right on the stage's very first mount, could still see
          // `null` there (`Dialog` renders its children only from the render *after* its own
          // `mounted` state flips) and, with no deps to fire again on, never retry, `V` stuck
          // at the guess forever, an image visibly smaller than its own (always full-width)
          // box, a gray gap on two edges. `stageEl`, state set from a callback ref, is the fix.
          expect(img.style.width).toBe('360px');
          fireEvent.click(screen.getByRole('button', { name: 'Save' }));
          // ctx.drawImage(el, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight): index 0 is
          // the <img> element itself, not a number.
          const [, , , sw] = drawCalls()[0] as [HTMLImageElement, ...number[]];
          // sSize = V / scale = V / (V / 1000) = 1000 whatever V is, *as long as the same V*
          // drives both scale and the display size, so this alone wouldn't catch a stuck V (the
          // `img.style.width` checks above do). It does catch V never being read from the
          // observer at all, e.g. a typo reading the wrong entry.
          expect(sw).toBeCloseTo(1000, 0);
        });
      });
    });
  });

  it('rescales pan so a resize does not shift the framed crop', () => {
    // 2000×1000: at zoom 1 the shorter side (1000) fills V, but the wider one doesn't,
    // so `onImgLoad` centers it with a non-zero starting `offset.x` already; zooming to 2
    // pushes it further off {0, 0}. That alone is enough of a "distinctive, non-centered
    // framing" to check against a resize, with no drag needed (jsdom's synthetic
    // PointerEvents don't carry `clientX`/`clientY` through to the handler, so a drag isn't
    // reliably simulable here anyway).
    const frameIt = (dialog: HTMLElement) => {
      loadFakeImage(dialog, 2000, 1000);
      const zoomInput = screen.getByLabelText('Zoom');
      fireEvent.change(zoomInput, { target: { value: '2' } });
    };

    withFakeImage(() => {
      withFakeResizeObserver((fire) => {
        withDrawImageSpy((drawCalls) => {
          // Dialog 1: measured once, at the pre-measurement guess itself (280), the baseline.
          const dialog1 = openCropModalFromLibrary();
          frameIt(dialog1);
          fire(280);
          fireEvent.click(screen.getByRole('button', { name: 'Save' }));
          const atGuess = drawCalls()[0] as number[];
          cleanup(); // Save closes the dialog, not the whole tree; start dialog 2 from a clean slate. // Save closes the dialog, not the whole tree; start dialog 2 from a clean slate.

          // Dialog 2: the same framing, but resized (280 → 420, as if the real measurement
          // landed only after the pan) right before saving.
          const dialog2 = openCropModalFromLibrary();
          frameIt(dialog2);
          fire(280);
          fire(420);
          fireEvent.click(screen.getByRole('button', { name: 'Save' }));
          const afterResize = drawCalls()[1] as number[];

          // Same drawImage argument order as above; skip index 0, the <img> element.
          const [, sxGuess, syGuess, swGuess] = atGuess as [HTMLImageElement, ...number[]];
          const [, sxAfter, syAfter, swAfter] = afterResize as [HTMLImageElement, ...number[]];
          expect(swAfter).toBeCloseTo(swGuess, 1);
          expect(sxAfter).toBeCloseTo(sxGuess, 1);
          expect(syAfter).toBeCloseTo(syGuess, 1);
        });
      });
    });
  });
});

/**
 * "Retake" on the crop modal (SS-322, third ask on the same testing round): a shot taken
 * with the camera can go straight back to a live camera, no trip through the menu. A
 * library pick has no such button: cancelling and picking another file is already one
 * click away, through the system's own file dialog.
 */
describe('AvatarUpload, retake', () => {
  it('a library pick shows no Retake button', () => {
    withFakeImage(() => {
      const dialog = openCropModalFromLibrary();
      expect(dialog).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Retake' })).toBeNull();
    });
  });

  it('a camera shot shows Retake', async () => {
    await withCamera(async () => {
      await shootPhoto();
      expect(screen.getByRole('button', { name: 'Retake' })).toBeInTheDocument();
    });
  });

  it('renders Retake, Cancel and Save as plain, evenly-sized buttons (the real Button component, not a bespoke style)', async () => {
    // Regression guard: a hand-rolled button style here once shipped with no horizontal
    // padding at all (masked by `flex: 1` stretching it full-width; real once a button
    // shrank to its own content, SS-322 follow-up) and, separately, a `flex: 1` sibling
    // fighting a lone `marginRight: auto` for space, both read as one cramped, mismatched
    // row. `Button` owns its own sizing; nothing here should override it.
    await withCamera(async () => {
      await shootPhoto();
      const footer = screen.getByRole('button', { name: 'Save' }).parentElement!;
      const [retake, cancel, save] = ['Retake', 'Cancel', 'Save'].map((name) => screen.getByRole('button', { name }));
      for (const btn of [retake, cancel, save]) {
        expect(btn.parentElement).toBe(footer);
        expect(getComputedStyle(btn).paddingLeft).not.toBe('0px');
      }
    });
  });

  it('Retake reopens the camera directly, without going through the menu', async () => {
    await withCamera(async () => {
      await shootPhoto();
      fireEvent.click(screen.getByRole('button', { name: 'Retake' }));
      // Straight to the live-camera dialog (Capture), not the crop dialog (Save) or the menu.
      await screen.findByRole('button', { name: 'Capture' });
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('cancelling from the reopened camera closes everything, no loop back to the crop step', async () => {
    await withCamera(async () => {
      await shootPhoto();
      fireEvent.click(screen.getByRole('button', { name: 'Retake' }));
      await screen.findByRole('button', { name: 'Capture' });
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('cancelling a camera-shot crop (not retaking) closes everything, same as any other cancel', async () => {
    await withCamera(async () => {
      await shootPhoto();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
