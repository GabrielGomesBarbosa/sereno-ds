'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, ImagePlus, Pencil, RotateCcw, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { mergeRefs } from '../_internal/mergeRefs';
import { Dialog } from '../feedback/Dialog';
import { Button } from '../core/Button';

/**
 * Profile-photo picker: an avatar disc with a camera button. Pick from the
 * library (or the camera on touch), frame the face in a circular crop, and it
 * hands back a **cropped, downscaled** `File` (JPEG). For attachments / documents
 * / multiple files use `FileUpload` instead.
 *
 * Client-side only downscales and re-encodes; it does not decode HEIC (no
 * browser but Safari can) - that is a server-side job. HEIC picks are rejected
 * with a message.
 */
/** User-facing strings - English by default; pass overrides for another locale. */
export interface AvatarUploadLabels {
  trigger: string;
  upload: string;
  takePhoto: string;
  remove: string;
  cropTitle: string;
  cropHint: string;
  cameraTitle: string;
  cameraHint: string;
  capture: string;
  /** On the crop step, only shown for a shot taken with the camera; reopens it directly. */
  retake: string;
  cancel: string;
  save: string;
  zoom: string;
  heicError: string;
  notImage: string;
  tooLarge: (mb: number) => string;
  unreadable: string;
  cameraError: string;
}

const EN: AvatarUploadLabels = {
  trigger: 'Change photo',
  upload: 'Upload a photo',
  takePhoto: 'Take a photo',
  remove: 'Remove photo',
  cropTitle: 'Adjust the photo',
  cropHint: 'Drag to reposition · scroll to zoom.',
  cameraTitle: 'Take a photo',
  cameraHint: 'Line your face up with the circle.',
  capture: 'Capture',
  retake: 'Retake',
  cancel: 'Cancel',
  save: 'Save',
  zoom: 'Zoom',
  heicError: "That format (HEIC) won't open in the browser, upload a JPG or PNG.",
  notImage: 'Choose an image file.',
  tooLarge: (mb) => `The image is over ${mb} MB.`,
  unreadable: "Couldn't read that image. Try a JPG or PNG.",
  cameraError: "Couldn't open the camera: upload a photo from your library instead.",
};

export interface AvatarUploadProps {
  /** Full name - drives the initials fallback and the alt text. */
  name?: string;
  /** Current photo: a `File` (freshly cropped) or an existing URL string. */
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  /** Disc diameter in px. */
  size?: number;
  /** Exported square size in px - the crop is drawn to this. */
  outputSize?: number;
  /** Reject picks larger than this (before crop). */
  maxSizeMB?: number;
  /** Override the English UI strings (menu, crop dialog, messages). */
  labels?: Partial<AvatarUploadLabels>;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  containerStyle?: React.CSSProperties;
  /** Reserve the hint/error row's height even with neither set - stops the
   *  field from growing the moment a validation message appears. */
  preserveHelperSpace?: boolean;
  /**
   * Whether to allow taking a photo via camera (default true).
   * Set to `false` when picking an organization or brand logo, where taking a
   * live selfie/photo makes no sense.
   */
  allowCamera?: boolean;
}

function initials(name: string): string {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

const isHeic = (f: File) => /image\/heic|image\/heif/i.test(f.type) || /\.(heic|heif)$/i.test(f.name);

export const AvatarUpload = React.forwardRef<HTMLInputElement, AvatarUploadProps>(function AvatarUpload(
  {
    name = '',
    value,
    onChange,
    size = 96,
    outputSize = 512,
    maxSizeMB = 8,
    labels: labelsProp,
    label,
    hint,
    error,
    required,
    disabled,
    id,
    containerStyle,
    preserveHelperSpace,
    allowCamera = true,
  },
  forwardedRef,
) {
  const t = React.useMemo<AvatarUploadLabels>(() => ({ ...EN, ...labelsProp }), [labelsProp]);
  const autoId = React.useId();
  const rid = id || autoId;
  const libRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number } | null>(null);
  const [rejected, setRejected] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  // Whether the photo now in the crop step came from the camera. Only then does the crop
  // modal offer "Retake" (a library pick already has its own way to change: cancel and pick
  // another file from the system's own dialog).
  const [cropFromCamera, setCropFromCamera] = React.useState(false);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<File | null>(null);

  const current = value !== undefined ? value : internal;

  // Preview URL for the current photo.
  const [preview, setPreview] = React.useState<string | null>(typeof current === 'string' ? current : null);
  React.useEffect(() => {
    if (current instanceof File) {
      const u = URL.createObjectURL(current);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to an object URL
      setPreview(u);
      return () => URL.revokeObjectURL(u);
    }
    setPreview(typeof current === 'string' ? current : null);
  }, [current]);

  const itemCount = (allowCamera ? 1 : 0) + 1 + (current ? 1 : 0);

  const toggleMenu = () => {
    if (!allowCamera && !current) {
      libRef.current?.click();
      return;
    }
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const h = itemCount * 40 + 8;
      const flipUp = r.bottom + 6 + h > window.innerHeight - 8;
      setMenuPos({
        top: flipUp ? Math.max(8, r.top - 6 - h) : r.bottom + 6,
        left: Math.max(8, Math.min(r.left, window.innerWidth - 208)),
      });
    }
    setMenuOpen(true);
  };

  // Close the menu on outside click / Escape / scroll - it is portalled to <body>.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuOpen]);

  // Dialog doesn't lock scroll or bind Escape - do it here while a modal is up.
  // One dialog for the flow, on whichever step is current: the crop once there is a photo,
  // else the live camera. A shot or a Retake flips both at once, so the step just changes.
  const step: Step | null = cropSrc ? 'crop' : allowCamera && cameraOpen ? 'camera' : null;
  const modalUp = step !== null;
  React.useEffect(() => {
    if (!modalUp) return;
    const root = document.documentElement;
    const prev = { h: root.style.overflow, b: document.body.style.overflow };
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setCameraOpen(false);
      setCropSrc((s) => {
        if (s) URL.revokeObjectURL(s);
        return null;
      });
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev.h;
      document.body.style.overflow = prev.b;
      document.removeEventListener('keydown', onKey);
    };
  }, [modalUp]);

  const pick = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (isHeic(f)) {
      setRejected(t.heicError);
      return;
    }
    if (!f.type.startsWith('image/')) {
      setRejected(t.notImage);
      return;
    }
    if (f.size > maxSizeMB * 1048576) {
      setRejected(t.tooLarge(maxSizeMB));
      return;
    }
    const url = URL.createObjectURL(f);
    const probe = new Image();
    probe.onload = () => {
      setRejected(null);
      setCropFromCamera(false);
      setCropSrc(url);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setRejected(t.unreadable);
    };
    probe.src = url;
  };

  const commit = (file: File | null) => {
    if (value === undefined) setInternal(file);
    onChange?.(file);
  };

  const onCropSave = (blob: Blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    commit(file);
  };
  const onCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const onCameraShot = (blob: Blob) => {
    setCameraOpen(false);
    setRejected(null);
    setCropFromCamera(true);
    setCropSrc(URL.createObjectURL(blob));
  };

  // Straight back to the live camera, no menu in between: the crop modal's "Retake".
  const onRetake = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCameraOpen(true);
  };

  const cameraBtn = Math.max(30, Math.round(size * 0.34));

  // What `Field` shows as the error: the consumer's, or a rejected pick's (type, size, unreadable).
  const shownError = error || rejected || undefined;
  // The hidden `<input type="file">` is out of the accessibility tree: the pencil is what takes focus.
  const a11y = fieldA11y(rid, { hint, error: shownError });

  return (
    <Field label={label} hint={hint} error={shownError} required={required} htmlFor={rid} style={containerStyle} preserveHelperSpace={preserveHelperSpace}>
      <input ref={mergeRefs(libRef, forwardedRef)} id={rid} type="file" accept="image/*" disabled={disabled} onChange={(e) => pick(e.target.files)} style={{ display: 'none' }} />

      <div style={sx({ position: 'relative', width: size, height: size, flex: '0 0 auto', opacity: disabled ? 0.6 : 1 })}>
        <span
          style={sx({
            width: size,
            height: size,
            borderRadius: '999px',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: preview ? 'var(--bg-subtle)' : 'color-mix(in srgb, var(--brand-500) 22%, var(--bg-surface))',
            border: '1px solid ' + (preview ? 'var(--border-subtle)' : 'color-mix(in srgb, var(--brand-500) 30%, transparent)'),
            color: 'var(--text-brand)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: Math.round(size * 0.34),
            letterSpacing: 'var(--tracking-snug)',
          })}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={name} style={sx({ width: '100%', height: '100%', objectFit: 'cover' })} />
          ) : (
            initials(name) || <ImagePlus size={Math.round(size * 0.3)} strokeWidth={1.75} />
          )}
        </span>

        {!disabled && (
          <button
            ref={triggerRef}
            type="button"
            className="ds-affix-btn"
            aria-label={t.trigger}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            {...a11y}
            onClick={toggleMenu}
            style={sx({
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: cameraBtn,
              height: cameraBtn,
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            })}
          >
            <Pencil size={Math.round(cameraBtn * 0.46)} strokeWidth={1.75} />
          </button>
        )}

      </div>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={sx({
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              minWidth: 200,
              zIndex: 1000,
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            })}
          >
            <MenuItem
              icon={<ImagePlus size={16} strokeWidth={1.75} />}
              label={t.upload}
              onClick={() => {
                setMenuOpen(false);
                libRef.current?.click();
              }}
            />
            {allowCamera && (
              <MenuItem
                icon={<Camera size={16} strokeWidth={1.75} />}
                label={t.takePhoto}
                onClick={() => {
                  setMenuOpen(false);
                  setRejected(null);
                  setCameraOpen(true);
                }}
              />
            )}
            {current && (
              <MenuItem
                icon={<Trash2 size={16} strokeWidth={1.75} />}
                label={t.remove}
                danger
                onClick={() => {
                  setMenuOpen(false);
                  commit(null);
                }}
              />
            )}
          </div>,
          document.body,
        )}

      {step && (
        <CaptureDialog
          step={step}
          src={cropSrc}
          outputSize={outputSize}
          labels={t}
          onClose={step === 'camera' ? () => setCameraOpen(false) : onCropCancel}
          onCameraShot={onCameraShot}
          onCameraError={() => {
            setCameraOpen(false);
            setRejected(t.cameraError);
          }}
          onSave={onCropSave}
          onRetake={cropFromCamera ? onRetake : undefined}
        />
      )}
    </Field>
  );
});

AvatarUpload.displayName = 'AvatarUpload';

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        minHeight: 40,
        padding: '0 var(--space-3)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        background: hover ? 'var(--bg-subtle)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: danger ? 'var(--interactive-error)' : 'var(--text-primary)',
        textAlign: 'left',
      })}
    >
      {icon}
      {label}
    </button>
  );
}

const DEFAULT_STAGE = 280; // crop stage's assumed size (px) before its own ResizeObserver measures it

/**
 * Width of the camera and crop dialogs. They are two steps of one flow (a shot goes straight
 * to the crop), so they share it: a dialog that changed size between the steps would jump.
 * Wider than `Dialog`'s default 352: with Retake the crop footer has three real Buttons, and
 * in Portuguese ("Tirar outra", "Cancelar", "Gravar") they add up to 384px, more than the
 * 358px of content a 400px dialog leaves. 440 gives 398px, so they fit on one line with ~14px
 * to spare. `Dialog` already caps at `min(100%, ...)` for narrow viewports (see
 * feedback/Dialog.tsx), so a phone just gets a narrower dialog. Widening only moves the limit
 * though: the crop footer's `fill` is what keeps a longer language, or that phone, from
 * stranding the primary button.
 */
const MODAL_WIDTH = 440;

/** Height reserved for the zoom row, so the camera step (which has none) is as tall as the crop step. */
const ZOOM_ROW_HEIGHT = 24;

/**
 * The square viewport + circular guide, shared by the crop and camera modals.
 * `width: 100%` + `aspectRatio: 1`, not a fixed pixel box: it spans exactly the same
 * width as `Dialog.Header`'s title and `Dialog.Footer`'s buttons (both just block-level
 * or flex content inside the same padded `Dialog.Body`), instead of a fixed size
 * centered with margins of its own that didn't match theirs (SS-322 follow-up, the
 * stage read as misaligned from the rest of the dialog). Also needs no separate
 * mobile-width handling of its own: whatever width the dialog ends up at (already
 * responsive, see `feedback/Dialog.tsx`), the stage fills it exactly, staying square
 * via `aspectRatio`.
 */
function CropStage({ children, onPointerDown, onPointerMove, onPointerUp, onWheel, stageRef }: {
  children: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onWheel?: (e: React.WheelEvent) => void;
  /** `useCropper` reads the live rendered size off this to drive the crop math (`V`). */
  stageRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={sx({
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-sunken)',
        cursor: onPointerDown ? 'grab' : 'default',
        touchAction: 'none',
      })}
    >
      {children}
      <span
        style={sx({
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: '999px',
          boxShadow: '0 0 0 9999px color-mix(in srgb, var(--bg-overlay) 80%, transparent)',
          outline: '1px solid rgba(255, 255, 255, 0.9)',
          outlineOffset: -1,
        })}
      />
    </div>
  );
}

/** Which step of the photo flow the dialog is on. */
type Step = 'camera' | 'crop';

/**
 * Live camera via `getUserMedia`, while `active`. A failure (no API, permission denied)
 * goes through `onError`. `ready` turns true once the stream is flowing; going inactive
 * stops the tracks, so the camera light goes off as soon as the dialog leaves this step.
 */
function useCamera(active: boolean, onError: () => void) {
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

/**
 * The crop state and math for one picked photo (`src`): pan, zoom, the stage's live size,
 * and the export. It lives above the dialog, not inside the crop step, so the header, body
 * and footer of a single `Dialog` can all read it while the camera step swaps in and out.
 * Everything resets when `src` changes, so a retaken photo starts centred at 1x.
 */
function useCropper(src: string | null, outputSize: number) {
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

/**
 * The one dialog for the whole photo flow: the live camera, then the crop (and back, on
 * Retake). It stays mounted across the steps and only its header text, stage and buttons
 * swap, so the panel does not close and reopen (no second pop-in, no scroll-lock or focus
 * hand-off) and it keeps one size. `Dialog.Header` / `Body` / `Footer` are direct children
 * on purpose: `Dialog` reads them off its children to pad the body and label itself, which
 * a wrapper component per step would hide from it.
 */
function CaptureDialog({
  step,
  src,
  outputSize,
  labels,
  onClose,
  onCameraShot,
  onCameraError,
  onSave,
  onRetake,
}: {
  step: Step;
  /** The photo being cropped; only set on the crop step. */
  src: string | null;
  outputSize: number;
  labels: AvatarUploadLabels;
  onClose: () => void;
  onCameraShot: (b: Blob) => void;
  onCameraError: () => void;
  onSave: (b: Blob) => void;
  /** Only set for a shot taken with the camera; shows the "Retake" button. */
  onRetake?: () => void;
}) {
  const isCamera = step === 'camera';
  const camera = useCamera(isCamera, onCameraError);
  const crop = useCropper(src, outputSize);

  // The step's buttons unmount with it, and with them the focused one: without this, focus
  // would fall to the page behind the dialog and Tab would leave the trap. `Dialog` only
  // pulls focus in when it opens, so do it again on every step change.
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null);
  React.useEffect(() => {
    contentEl?.closest<HTMLElement>('[role="dialog"]')?.focus();
  }, [step, contentEl]);

  /* eslint-disable react-hooks/refs -- `useCamera` / `useCropper` return event handlers that reach a
     ref (`videoRef`, the drag origin), so the lint marks every property read off them; but those
     refs are only touched when a handler runs from an event, never during this render. */
  return (
    <Dialog width={MODAL_WIDTH} onClose={onClose}>
      <Dialog.Header title={isCamera ? labels.cameraTitle : labels.cropTitle} description={isCamera ? labels.cameraHint : labels.cropHint} />
      <Dialog.Body>
        <div ref={setContentEl}>
          {isCamera ? (
            <CropStage key="camera">
              <video ref={camera.attachVideo} autoPlay playsInline muted style={sx({ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' })} />
            </CropStage>
          ) : (
            <CropStage
              key="crop"
              stageRef={crop.setStageEl}
              onPointerDown={crop.onPointerDown}
              onPointerMove={crop.onPointerMove}
              onPointerUp={crop.onPointerUp}
              onWheel={(e) => crop.setZoomAt(crop.zoom - e.deltaY * 0.002)}
            >
              {src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={crop.setImgEl}
                  src={src}
                  alt=""
                  draggable={false}
                  onLoad={(e) => crop.onImgLoad(e.currentTarget)}
                  style={sx({ position: 'absolute', left: crop.offset.x, top: crop.offset.y, width: crop.dispW, height: crop.dispH, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' })}
                />
              )}
            </CropStage>
          )}

          {/* The zoom row is only there on the crop step, but the camera step keeps its room, so the dialog is the same height on both. */}
          <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)', minHeight: ZOOM_ROW_HEIGHT, color: 'var(--text-muted)' })}>
            {!isCamera && (
              <>
                <ZoomOut size={16} strokeWidth={1.75} style={{ flex: '0 0 auto' }} />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={crop.zoom}
                  onChange={(e) => crop.setZoomAt(Number(e.target.value))}
                  aria-label={labels.zoom}
                  style={sx({ flex: 1, accentColor: 'var(--interactive-primary)' })}
                />
                <ZoomIn size={16} strokeWidth={1.75} style={{ flex: '0 0 auto' }} />
              </>
            )}
          </div>
        </div>
      </Dialog.Body>
      {/* Three actions (crop after a camera shot, with Retake) share the row and each line they wrap onto; two stay right-aligned, as before. */}
      <Dialog.Footer fill={!isCamera && Boolean(onRetake)}>
        {isCamera ? (
          <React.Fragment key="camera">
            <Button variant="secondary" iconLeft={<X size={16} strokeWidth={2} />} onClick={onClose}>
              {labels.cancel}
            </Button>
            <Button iconLeft={<Camera size={16} strokeWidth={2} />} onClick={() => camera.shoot(onCameraShot)} disabled={!camera.ready}>
              {labels.capture}
            </Button>
          </React.Fragment>
        ) : (
          <React.Fragment key="crop">
            {onRetake && (
              <Button variant="secondary" iconLeft={<RotateCcw size={16} strokeWidth={2} />} onClick={onRetake}>
                {labels.retake}
              </Button>
            )}
            <Button variant="secondary" iconLeft={<X size={16} strokeWidth={2} />} onClick={onClose}>
              {labels.cancel}
            </Button>
            <Button iconLeft={<Check size={16} strokeWidth={2.5} />} onClick={() => crop.save(onSave)}>
              {labels.save}
            </Button>
          </React.Fragment>
        )}
      </Dialog.Footer>
    </Dialog>
  );
  /* eslint-enable react-hooks/refs */
}
