'use client';

import * as React from 'react';
import { Camera, Check, ImagePlus, Trash2, X } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';

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
  cancel: string;
  save: string;
  zoom: string;
  heicError: string;
  notImage: string;
  tooLarge: (mb: number) => string;
  unreadable: string;
}

const EN: AvatarUploadLabels = {
  trigger: 'Change photo',
  upload: 'Upload a photo',
  takePhoto: 'Take a photo',
  remove: 'Remove photo',
  cropTitle: 'Adjust the photo',
  cancel: 'Cancel',
  save: 'Save',
  zoom: 'Zoom',
  heicError: "That format (HEIC) won't open in the browser — upload a JPG or PNG.",
  notImage: 'Choose an image file.',
  tooLarge: (mb) => `The image is over ${mb} MB.`,
  unreadable: "Couldn't read that image. Try a JPG or PNG.",
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
  const camRef = React.useRef<HTMLInputElement>(null);
  const menuWrapRef = React.useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [rejected, setRejected] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [internal, setInternal] = React.useState<File | null>(null);

  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
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

  // Close the menu on outside click / Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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

  const cameraBtn = Math.max(30, Math.round(size * 0.34));

  return (
    <Field label={label} hint={hint} error={error || rejected || undefined} required={required} htmlFor={rid} style={containerStyle}>
      <input ref={libRef} id={rid} type="file" accept="image/*" disabled={disabled} onChange={(e) => pick(e.target.files)} style={{ display: 'none' }} />
      <input ref={camRef} type="file" accept="image/*" capture="user" disabled={disabled} onChange={(e) => pick(e.target.files)} style={{ display: 'none' }} />

      <div ref={menuWrapRef} style={sx({ position: 'relative', width: size, height: size, flex: '0 0 auto', opacity: disabled ? 0.6 : 1 })}>
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
            type="button"
            className="ds-affix-btn"
            aria-label={t.trigger}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
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
            <Camera size={Math.round(cameraBtn * 0.5)} strokeWidth={1.75} />
          </button>
        )}

        {menuOpen && (
          <div
            role="menu"
            style={sx({
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              minWidth: 180,
              zIndex: 5,
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
            {coarse && (
              <MenuItem
                icon={<Camera size={16} strokeWidth={1.75} />}
                label={t.takePhoto}
                onClick={() => {
                  setMenuOpen(false);
                  camRef.current?.click();
                }}
              />
            )}
            {preview && (
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
          </div>
        )}
      </div>

      {cropSrc && <CropModal src={cropSrc} outputSize={outputSize} labels={t} onCancel={onCropCancel} onSave={onCropSave} />}
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

const V = 260; // crop viewport (square) in px

function CropModal({ src, outputSize, labels, onCancel, onSave }: { src: string; outputSize: number; labels: AvatarUploadLabels; onCancel: () => void; onSave: (b: Blob) => void }) {
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

  // Lock body scroll while open.
  React.useEffect(() => {
    const prev = { h: document.documentElement.style.overflow, b: document.body.style.overflow };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev.h;
      document.body.style.overflow = prev.b;
      document.removeEventListener('keydown', onKey);
    };
  }, [onCancel]);

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    setNat({ w, h });
    const s = (V / Math.min(w, h)) * 1;
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
    <div
      onClick={onCancel}
      style={sx({
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'var(--bg-overlay)',
      })}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={labels.cropTitle}
        style={sx({
          width: 'min(340px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-lg)',
        })}
      >
        <span style={sx({ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' })}>{labels.cropTitle}</span>

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(e) => setZoomAt(zoom - e.deltaY * 0.002)}
          style={sx({
            position: 'relative',
            width: V,
            height: V,
            maxWidth: '100%',
            alignSelf: 'center',
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-sunken)',
            cursor: 'grab',
            touchAction: 'none',
          })}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={onImgLoad}
            style={sx({
              position: 'absolute',
              left: offset.x,
              top: offset.y,
              width: dispW,
              height: dispH,
              maxWidth: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            })}
          />
          {/* circular mask */}
          <span
            style={sx({
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              boxShadow: '0 0 0 9999px color-mix(in srgb, var(--bg-overlay) 55%, transparent)',
              borderRadius: '999px',
              border: '2px solid rgba(255,255,255,0.85)',
            })}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoomAt(Number(e.target.value))}
          aria-label={labels.zoom}
          style={sx({ width: '100%', accentColor: 'var(--interactive-primary)' })}
        />

        <div style={sx({ display: 'flex', gap: 'var(--space-2)' })}>
          <button
            type="button"
            onClick={onCancel}
            style={sx({
              flex: 1,
              minHeight: 40,
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            })}
          >
            <X size={16} strokeWidth={2} /> {labels.cancel}
          </button>
          <button
            type="button"
            onClick={save}
            style={sx({
              flex: 1,
              minHeight: 40,
              borderRadius: 'var(--radius-control)',
              border: 'none',
              background: 'var(--interactive-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--interactive-primary-fg)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            })}
          >
            <Check size={16} strokeWidth={2.5} /> {labels.save}
          </button>
        </div>
      </div>
    </div>
  );
}
