import * as React from 'react';

/**
 * Live camera via `getUserMedia`, while `active`. A failure (no API, permission denied)
 * goes through `onError`. `ready` turns true once the stream is flowing; going inactive
 * stops the tracks, so the camera light goes off as soon as the dialog leaves this step.
 */
export function useCamera(active: boolean, onError: () => void) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [ready, setReady] = React.useState(false);
  // Read through a ref so a new `onError` closure each render does not restart the camera.
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  });

  React.useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let started: MediaStream | null = null;
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    if (!md?.getUserMedia) {
      onErrorRef.current();
      return;
    }
    md.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((tr) => tr.stop());
          return;
        }
        started = s;
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setReady(true);
      })
      .catch(() => onErrorRef.current());
    return () => {
      cancelled = true;
      started?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [active]);

  // The `<video>` may mount after the stream arrives (`Dialog` renders its children a render
  // late) or the other way round, so wire them up whichever comes last: here for the element,
  // above for the stream.
  const attachVideo = React.useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) el.srcObject = streamRef.current;
  }, []);

  /** Grabs the centred square of the current frame, mirrored like the preview, as a JPEG. */
  const shoot = (onShot: (b: Blob) => void) => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const s = Math.min(v.videoWidth, v.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(s, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, s, s);
    canvas.toBlob((b) => b && onShot(b), 'image/jpeg', 0.9);
  };

  return { attachVideo, ready, shoot };
}
