import * as React from 'react';

const DEFAULT_STAGE = 280; // crop stage's assumed size (px) before its own ResizeObserver measures it

/**
 * The crop state and math for one picked photo (`src`): pan, zoom, the stage's live size,
 * and the export. It lives above the dialog, not inside the crop step, so the header, body
 * and footer of a single `Dialog` can all read it while the camera step swaps in and out.
 * Everything resets when `src` changes, so a retaken photo starts centred at 1x.
 */
export function useCropper(src: string | null, outputSize: number) {
  const [imgEl, setImgEl] = React.useState<HTMLImageElement | null>(null);
  // A *callback* ref (kept as state), not a plain `useRef` + a `[]`-effect: `Dialog` renders
  // its children only from the render *after* its own `mounted` flips true (SSR-safe portal),
  // so on the stage's very first mount a `useEffect(..., [])` reading `stageRef.current` at
  // that point would still see `null` and, with no deps to fire again on, never retry, so `V`
  // would then stay stuck at the `DEFAULT_STAGE` guess forever (this exact bug, caught live:
  // the displayed image stayed 280px inside a stage CSS had already sized at ~344px, a gray
  // gap on two edges). The callback fires the moment React actually attaches the node.
  const [stageEl, setStageEl] = React.useState<HTMLDivElement | null>(null);
  // The stage's own live rendered size (it's `width: 100%` of the dialog body now, not a
  // fixed px box), read via ResizeObserver. `DEFAULT_STAGE` is only the guess for the very
  // first paint, before the observer's first callback lands.
  const [V, setV] = React.useState(DEFAULT_STAGE);
  const prevV = React.useRef(V);
  const [nat, setNat] = React.useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number } | null>(null);

  // A new photo starts from scratch. Adjusting state while rendering (rather than in an
  // effect) means the stale pan / zoom is never painted against the new image.
  const [seenSrc, setSeenSrc] = React.useState(src);
  if (src !== seenSrc) {
    setSeenSrc(src);
    setNat(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  React.useEffect(() => {
    if (!stageEl) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (!w || w === prevV.current) return;
      // A live resize while the dialog is open (a phone rotated, a window resized) or the
      // very first real measurement replacing `DEFAULT_STAGE`: rescale the pan offset by
      // the same factor as the viewport itself, so the framed crop doesn't jump. `scale`
      // (see below) is linear in `V`, so multiplying the offset by `newV / oldV` keeps
      // the same fraction of the image framed.
      const factor = w / prevV.current;
      prevV.current = w;
      setV(w);
      setOffset((o) => ({ x: o.x * factor, y: o.y * factor }));
    });
    ro.observe(stageEl);
    return () => ro.disconnect();
  }, [stageEl]);

  const scaleMin = nat ? V / Math.min(nat.w, nat.h) : 1;
  const scale = scaleMin * zoom;
  const dispW = nat ? nat.w * scale : V;
  const dispH = nat ? nat.h * scale : V;

  const clamp = React.useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(V - dispW, o.x)),
      y: Math.min(0, Math.max(V - dispH, o.y)),
    }),
    [V, dispW, dispH],
  );

  const onImgLoad = (el: HTMLImageElement) => {
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    setNat({ w, h });
    const s = V / Math.min(w, h);
    setOffset({ x: (V - w * s) / 2, y: (V - h * s) / 2 });
  };

  const setZoomAt = (nextZoom: number) => {
    const z = Math.min(3, Math.max(1, nextZoom));
    setZoom((prevZ) => {
      const oldScale = scaleMin * prevZ;
      const newScale = scaleMin * z;
      setOffset((o) => {
        const imgX = (V / 2 - o.x) / oldScale;
        const imgY = (V / 2 - o.y) / oldScale;
        return clamp({ x: V / 2 - imgX * newScale, y: V / 2 - imgY * newScale });
      });
      return z;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => clamp({ x: o.x + dx, y: o.y + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const save = (onSave: (b: Blob) => void) => {
    if (!imgEl || !nat) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sSize = V / scale;
    ctx.drawImage(imgEl, -offset.x / scale, -offset.y / scale, sSize, sSize, 0, 0, outputSize, outputSize);
    canvas.toBlob((b) => b && onSave(b), 'image/jpeg', 0.85);
  };

  return { setImgEl, setStageEl, zoom, setZoomAt, offset, dispW, dispH, onImgLoad, onPointerDown, onPointerMove, onPointerUp, save };
}
