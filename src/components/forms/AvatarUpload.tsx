'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, ImagePlus, Pencil, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { Dialog } from '../feedback/Dialog';

/**
 * Profile-photo picker: an avatar disc with a camera button. Pick from the
 * library (or the camera on touch), frame the face in a circular crop, and it
 * hands back a **cropped, downscaled** `File` (JPEG). For attachments / documents
 * / multiple files use `FileUpload` instead.
 *
 * Client-side only downscales and re-encodes; it does not decode HEIC (no
 * browser but Safari can) — that is a server-side job. HEIC picks are rejected
 * with a message.
 */
/** User-facing strings — English by default; pass overrides for another locale. */
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
  cancel: 'Cancel',
  save: 'Save',
  zoom: 'Zoom',
  heicError: "That format (HEIC) won't open in the browser — upload a JPG or PNG.",
  notImage: 'Choose an image file.',
  tooLarge: (mb) => `The image is over ${mb} MB.`,
  unreadable: "Couldn't read that image. Try a JPG or PNG.",
  cameraError: "Couldn't open the camera — upload a photo from your library instead.",
};

export interface AvatarUploadProps {
  /** Full name — drives the initials fallback and the alt text. */
  name?: string;
  /** Current photo: a `File` (freshly cropped) or an existing URL string. */
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  /** Disc diameter in px. */
  size?: number;
  /** Exported square size in px — the crop is drawn to this. */
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

export function AvatarUpload({
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
}: AvatarUploadProps) {
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

  const itemCount = 2 + (current ? 1 : 0);

  const toggleMenu = () => {
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

  // Close the menu on outside click / Escape / scroll — it is portalled to <body>.
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

  // Dialog doesn't lock scroll or bind Escape — do it here while a modal is up.
  const modalUp = Boolean(cropSrc) || cameraOpen;
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
    setCropSrc(URL.createObjectURL(blob));
  };

  const cameraBtn = Math.max(30, Math.round(size * 0.34));

  return (
    <Field label={label} hint={hint} error={error || rejected || undefined} required={required} htmlFor={rid} style={containerStyle}>
      <input ref={libRef} id={rid} type="file" accept="image/*" disabled={disabled} onChange={(e) => pick(e.target.files)} style={{ display: 'none' }} />

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
            <MenuItem
              icon={<Camera size={16} strokeWidth={1.75} />}
              label={t.takePhoto}
              onClick={() => {
                setMenuOpen(false);
                setRejected(null);
                setCameraOpen(true);
              }}
            />
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

      {cameraOpen && (
        <CameraModal
          labels={t}
          onClose={() => setCameraOpen(false)}
          onCapture={onCameraShot}
          onError={() => {
            setCameraOpen(false);
            setRejected(t.cameraError);
          }}
        />
      )}

      {cropSrc && <CropModal src={cropSrc} outputSize={outputSize} labels={t} onClose={onCropCancel} onSave={onCropSave} />}
    </Field>
  );
}

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

const V = 280; // crop viewport (square) in px

const modalBtn = {
  flex: 1,
  minHeight: 40,
  borderRadius: 'var(--radius-control)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
} as const;
const cancelBtn = { ...modalBtn, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' } as const;
const confirmBtn = { ...modalBtn, border: 'none', background: 'var(--interactive-primary)', fontWeight: 'var(--weight-semibold)', color: 'var(--interactive-primary-fg)' } as const;

/** The square viewport + circular guide, shared by the crop and camera modals. */
function CropStage({ children, onPointerDown, onPointerMove, onPointerUp, onWheel }: {
  children: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onWheel?: (e: React.WheelEvent) => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={sx({
        position: 'relative',
        width: V,
        height: V,
        maxWidth: '100%',
        alignSelf: 'center',
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

function CropModal({ src, outputSize, labels, onClose, onSave }: { src: string; outputSize: number; labels: AvatarUploadLabels; onClose: () => void; onSave: (b: Blob) => void }) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [nat, setNat] = React.useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number } | null>(null);

  const scaleMin = nat ? V / Math.min(nat.w, nat.h) : 1;
  const scale = scaleMin * zoom;
  const dispW = nat ? nat.w * scale : V;
  const dispH = nat ? nat.h * scale : V;

  const clamp = React.useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(V - dispW, o.x)),
      y: Math.min(0, Math.max(V - dispH, o.y)),
    }),
    [dispW, dispH],
  );

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
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

  const save = () => {
    const el = imgRef.current;
    if (!el || !nat) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sSize = V / scale;
    ctx.drawImage(el, -offset.x / scale, -offset.y / scale, sSize, sSize, 0, 0, outputSize, outputSize);
    canvas.toBlob((b) => b && onSave(b), 'image/jpeg', 0.85);
  };

  return (
    <Dialog
      title={labels.cropTitle}
      description={labels.cropHint}
      width={352}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} style={sx(cancelBtn)}>
            <X size={16} strokeWidth={2} /> {labels.cancel}
          </button>
          <button type="button" onClick={save} style={sx(confirmBtn)}>
            <Check size={16} strokeWidth={2.5} /> {labels.save}
          </button>
        </>
      }
    >
      <CropStage onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={(e) => setZoomAt(zoom - e.deltaY * 0.002)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={onImgLoad}
          style={sx({ position: 'absolute', left: offset.x, top: offset.y, width: dispW, height: dispH, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' })}
        />
      </CropStage>

      <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-muted)' })}>
        <ZoomOut size={16} strokeWidth={1.75} style={{ flex: '0 0 auto' }} />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoomAt(Number(e.target.value))}
          aria-label={labels.zoom}
          style={sx({ flex: 1, accentColor: 'var(--interactive-primary)' })}
        />
        <ZoomIn size={16} strokeWidth={1.75} style={{ flex: '0 0 auto' }} />
      </div>
    </Dialog>
  );
}

/** Live camera capture via getUserMedia — falls back through `onError`. */
function CameraModal({ labels, onCapture, onClose, onError }: { labels: AvatarUploadLabels; onCapture: (b: Blob) => void; onClose: () => void; onError: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    if (!md?.getUserMedia) {
      onError();
      return;
    }
    md.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(onError);
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [onError]);

  const shoot = () => {
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
    canvas.toBlob((b) => b && onCapture(b), 'image/jpeg', 0.9);
  };

  return (
    <Dialog
      title={labels.cameraTitle}
      description={labels.cameraHint}
      width={352}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} style={sx(cancelBtn)}>
            <X size={16} strokeWidth={2} /> {labels.cancel}
          </button>
          <button type="button" onClick={shoot} disabled={!ready} style={sx({ ...confirmBtn, opacity: ready ? 1 : 0.6 })}>
            <Camera size={16} strokeWidth={2} /> {labels.capture}
          </button>
        </>
      }
    >
      <CropStage>
        <video ref={videoRef} autoPlay playsInline muted style={sx({ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' })} />
      </CropStage>
    </Dialog>
  );
}
