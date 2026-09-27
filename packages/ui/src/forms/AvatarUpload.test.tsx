import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
 * The crop modal's layout: `CropStage` (the 280×280 crop square, shared with
 * `CameraModal`) sits directly in `Dialog.Body`, a plain block container, not
 * flex/grid, so `alignSelf` alone does nothing there. Regression coverage for
 * SS-322 (reported from the schedule-system app): the square drifted to the
 * left edge, and the zoom bar sat flush against it with no gap.
 */
describe('AvatarUpload, crop modal layout', () => {
  it('centers the crop square in the dialog body (a plain block container)', () => {
    withFakeImage(() => {
      const dialog = openCropModalFromLibrary();
      // The crop square: the 280×280 fixed box (see `V` in AvatarUpload.tsx).
      const square = Array.from(dialog.querySelectorAll('div')).find((d) => (d as HTMLElement).style.width === '280px')! as HTMLElement;
      expect(square).toBeTruthy();
      // Its direct parent, `Dialog.Body`, is a plain block container, not flex/grid,
      // so `alignSelf` alone would do nothing there (the actual SS-322 bug).
      expect(getComputedStyle(square.parentElement as Element).display).not.toBe('flex');
      expect(square.style.margin).toBe('0px auto');
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

  it('CameraModal reuses the same centered crop square', async () => {
    await withCamera(async () => {
      await shootPhoto();
      const dialog = screen.getByRole('dialog');
      const square = Array.from(dialog.querySelectorAll('div')).find((d) => (d as HTMLElement).style.width === '280px')!;
      expect(square).toBeTruthy();
      expect((square as HTMLElement).style.margin).toBe('0px auto');
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
