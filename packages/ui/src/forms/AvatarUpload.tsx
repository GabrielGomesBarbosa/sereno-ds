'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Camera, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';
import { fieldA11y } from '../_internal/fieldA11y';
import { mergeRefs } from '../_internal/mergeRefs';
import { CaptureDialog, type Step } from './_internal/AvatarCaptureDialog';

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

  // One dialog for the flow, on whichever step is current: the crop once there is a photo,
  // else the live camera. A shot or a Retake flips both at once, so the step just changes.
  // The `Dialog` it is drawn in already locks the page scroll and closes on Escape (through the
  // `onClose` handed to it below), so nothing here does: a second lock of our own used to be
  // released after the Dialog's and left the page unable to scroll (SS-402).
  const step: Step | null = cropSrc ? 'crop' : allowCamera && cameraOpen ? 'camera' : null;

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
  return (
    <button
      type="button"
      role="menuitem"
      className="sereno-menuitem"
      onClick={onClick}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        minHeight: 40,
        padding: '0 var(--space-3)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
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
