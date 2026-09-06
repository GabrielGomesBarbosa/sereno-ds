'use client';

import * as React from 'react';
import { File as FileIcon, FileArchive, FileSpreadsheet, FileText, RefreshCw, Trash2, UploadCloud, type LucideIcon } from 'lucide-react';
import { sx } from '../_internal/style';
import { Field } from '../_internal/Field';

/**
 * Pick files — click, keyboard, or drag-and-drop — with a local preview.
 * Image-first (`shape` circle/square thumbnail); other types show an extension
 * chip. No upload happens here: `onChange` hands you the `File`(s); the preview
 * is local. Set `multiple` for a list; `value` then is `File[]`.
 */
interface BaseProps {
  label?: string;
  /** Helper text under the field — a good place for the accepted types / size. */
  hint?: string;
  /** Error message; also shown instead of a rejected-file message. */
  error?: string;
  required?: boolean;
  /** `accept` attribute, also enforced on drop. */
  accept?: string;
  /** Max size in MB — files above this are rejected with a message. */
  maxSizeMB?: number;
  /** Thumbnail shape for image previews. `circle` for avatars (single only). */
  shape?: 'circle' | 'square';
  /** Prompt inside the empty drop area. */
  prompt?: string;
  disabled?: boolean;
  id?: string;
  containerStyle?: React.CSSProperties;
}

export type FileUploadProps = BaseProps &
  (
    | { multiple?: false; value?: File | string | null; onChange?: (file: File | null) => void }
    | { multiple: true; value?: File[]; onChange?: (files: File[]) => void }
  );

function matchesAccept(file: File, accept: string): boolean {
  if (!accept || accept === '*' || accept === '*/*') return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .some((tok) => {
      if (!tok) return false;
      if (tok.startsWith('.')) return name.endsWith(tok);
      if (tok.endsWith('/*')) return type.startsWith(tok.slice(0, -1));
      return type === tok;
    });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** File-type glyph + colour, keyed by extension. Images never reach this. */
const GLYPHS: Record<string, { Icon: LucideIcon; color: string }> = {
  pdf: { Icon: FileText, color: 'var(--status-error-fg)' },
  doc: { Icon: FileText, color: 'var(--status-info-fg)' },
  docx: { Icon: FileText, color: 'var(--status-info-fg)' },
  rtf: { Icon: FileText, color: 'var(--status-info-fg)' },
  odt: { Icon: FileText, color: 'var(--status-info-fg)' },
  txt: { Icon: FileText, color: 'var(--status-neutral-fg)' },
  md: { Icon: FileText, color: 'var(--status-neutral-fg)' },
  csv: { Icon: FileSpreadsheet, color: 'var(--status-success-fg)' },
  xls: { Icon: FileSpreadsheet, color: 'var(--status-success-fg)' },
  xlsx: { Icon: FileSpreadsheet, color: 'var(--status-success-fg)' },
  ppt: { Icon: FileText, color: 'var(--status-warning-fg)' },
  pptx: { Icon: FileText, color: 'var(--status-warning-fg)' },
  zip: { Icon: FileArchive, color: 'var(--status-warning-fg)' },
  rar: { Icon: FileArchive, color: 'var(--status-warning-fg)' },
  '7z': { Icon: FileArchive, color: 'var(--status-warning-fg)' },
};
function glyphFor(name: string) {
  return GLYPHS[(name.split('.').pop() || '').toLowerCase()] ?? { Icon: FileIcon, color: 'var(--status-neutral-fg)' };
}

/** One thumbnail — the image itself, or a colour-coded file-type glyph. */
function Thumb({ url, name, size, shape }: { url: string | null; name: string; size: number; shape: 'circle' | 'square' }) {
  const { Icon, color } = glyphFor(name);
  return (
    <span
      style={sx({
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: shape === 'circle' ? '999px' : 'var(--radius-md)',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: url ? 'var(--bg-subtle)' : `color-mix(in srgb, ${color} 12%, var(--bg-surface))`,
        border: '1px solid ' + (url ? 'var(--border-subtle)' : `color-mix(in srgb, ${color} 28%, transparent)`),
      })}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} style={sx({ width: '100%', height: '100%', objectFit: 'cover' })} />
      ) : (
        <Icon size={Math.round(size * 0.44)} strokeWidth={1.75} style={{ color }} />
      )}
    </span>
  );
}

const actionBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  minHeight: 36,
  padding: '0 12px',
  borderRadius: 'var(--radius-control)',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-medium)',
  cursor: 'pointer',
} as const;

/**
 * A preview URL for a File (object URL) or an existing URL string. The object
 * URL is created *and* revoked inside one effect, so a re-render (or StrictMode's
 * mount/cleanup/mount) never leaves a revoked URL on screen.
 */
function usePreviewUrl(file: File | string | null | undefined): string | null {
  const [url, setUrl] = React.useState<string | null>(typeof file === 'string' ? file : null);
  React.useEffect(() => {
    const isImageFile = file instanceof File && file.type.startsWith('image/');
    const next = isImageFile ? URL.createObjectURL(file) : typeof file === 'string' ? file : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to an external resource (object URL)
    setUrl(next);
    return isImageFile ? () => URL.revokeObjectURL(next as string) : undefined;
  }, [file]);
  return url;
}

/** A stable-ish key for a File across list reorders. */
function fileKey(f: File): string {
  return `${f.name}:${f.size}:${f.lastModified}`;
}

export function FileUpload(props: FileUploadProps) {
  const {
    label,
    hint,
    error,
    required,
    accept = 'image/*',
    maxSizeMB = 5,
    shape = 'square',
    prompt,
    disabled,
    id,
    containerStyle,
  } = props;
  const multiple = props.multiple === true;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const autoId = React.useId();
  const rid = id || autoId;
  const [rejected, setRejected] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // Uncontrolled fallback — one shape covers both modes internally.
  const [internalOne, setInternalOne] = React.useState<File | null>(null);
  const [internalMany, setInternalMany] = React.useState<File[]>([]);
  const one = props.multiple ? null : props.value !== undefined ? props.value : internalOne;
  const many = props.multiple ? (props.value !== undefined ? props.value : internalMany) : [];

  const validate = (f: File): string | null => {
    if (!matchesAccept(f, accept)) return `“${f.name}” isn’t an accepted type.`;
    if (f.size > maxSizeMB * 1048576) return `“${f.name}” is over ${maxSizeMB} MB.`;
    return null;
  };

  const ingest = (list: FileList | null) => {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    if (multiple) {
      const ok: File[] = [];
      const bad: string[] = [];
      for (const f of files) {
        const err = validate(f);
        if (err) bad.push(f.name);
        else ok.push(f);
      }
      setRejected(bad.length ? `Skipped ${bad.length} file${bad.length > 1 ? 's' : ''} (type or size).` : null);
      const next = [...many, ...ok];
      if (props.value === undefined) setInternalMany(next);
      props.onChange?.(next);
    } else {
      const f = files[0];
      const err = validate(f);
      if (err) {
        setRejected(err);
        return;
      }
      setRejected(null);
      if (props.value === undefined) setInternalOne(f);
      props.onChange?.(f);
    }
  };

  const removeAt = (i: number) => {
    const next = many.filter((_, j) => j !== i);
    if (props.value === undefined) setInternalMany(next);
    (props.onChange as ((f: File[]) => void) | undefined)?.(next);
  };
  const clearOne = () => {
    setRejected(null);
    if (inputRef.current) inputRef.current.value = '';
    if (props.value === undefined) setInternalOne(null);
    (props.onChange as ((f: File | null) => void) | undefined)?.(null);
  };
  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const oneUrl = usePreviewUrl(one);

  // A hard `error` (or a rejected single file) puts the field in an error state;
  // a "skipped N" note in multiple mode is informational, not an error.
  const invalid = Boolean(error || (rejected && !multiple));
  const edge = dragOver ? 'var(--border-brand)' : invalid ? 'var(--interactive-error)' : 'var(--border-default)';
  const usePrompt = prompt ?? (multiple ? 'Drag files here, or click to choose' : 'Drag a file here, or click to choose');

  const dragProps = disabled
    ? {}
    : {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(false);
          ingest(e.dataTransfer.files);
        },
      };

  // ---- the drop zone (shown when empty in single mode, always in multiple) ----
  const circleZone = (
    <button
      type="button"
      className="ds-affix-btn"
      disabled={disabled}
      onClick={openPicker}
      {...dragProps}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 'var(--space-4)',
        width: '100%',
        padding: 0,
        border: 'none',
        background: 'transparent',
        fontFamily: 'var(--font-body)',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      })}
    >
      <span
        style={sx({
          width: 96,
          height: 96,
          flex: '0 0 auto',
          borderRadius: '999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: dragOver ? 'var(--text-brand)' : 'var(--text-muted)',
          border: '1.5px dashed ' + edge,
          background: dragOver ? 'color-mix(in srgb, var(--interactive-primary) 5%, transparent)' : 'transparent',
          transition: 'var(--transition-control)',
        })}
      >
        <UploadCloud size={24} strokeWidth={1.75} />
      </span>
      <span style={sx({ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' })}>{usePrompt}</span>
    </button>
  );

  const boxZone = (
    <button
      type="button"
      className="ds-affix-btn"
      disabled={disabled}
      onClick={openPicker}
      {...dragProps}
      style={sx({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        boxSizing: 'border-box',
        padding: 'var(--space-6) var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed ' + edge,
        background: dragOver ? 'color-mix(in srgb, var(--interactive-primary) 5%, var(--bg-surface))' : 'var(--bg-surface)',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'var(--transition-control)',
      })}
    >
      <UploadCloud size={22} strokeWidth={1.75} style={{ color: dragOver ? 'var(--text-brand)' : 'var(--text-muted)' }} />
      <span style={sx({ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.4 })}>{usePrompt}</span>
    </button>
  );

  return (
    <Field label={label} hint={hint} error={error || (multiple ? undefined : rejected) || undefined} required={required} htmlFor={rid} style={containerStyle}>
      <input
        ref={inputRef}
        id={rid}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => ingest(e.target.files)}
        style={{ display: 'none' }}
      />

      {multiple ? (
        <div style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' })}>
          {boxZone}
          {many.length > 0 && (
            <ul style={sx({ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' })}>
              {many.map((f, i) => (
                <MultiRow key={fileKey(f)} file={f} disabled={disabled} onRemove={() => removeAt(i)} />
              ))}
            </ul>
          )}
          {rejected && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>{rejected}</span>}
        </div>
      ) : one ? (
        <div style={sx({ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' })}>
          <Thumb url={oneUrl} name={typeof one === 'string' ? one.split('/').pop() || one : one.name} size={shape === 'circle' ? 88 : 96} shape={shape} />
          <div style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 })}>
            <span
              style={sx({
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              })}
              title={typeof one === 'string' ? one.split('/').pop() || one : one.name}
            >
              {typeof one === 'string' ? one.split('/').pop() || one : one.name}
            </span>
            {one instanceof File && <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>{fmtSize(one.size)}</span>}
            {!disabled && (
              <div style={sx({ display: 'flex', gap: 'var(--space-2)', marginTop: 6, flexWrap: 'wrap' })}>
                <button type="button" className="ds-affix-btn" onClick={openPicker} style={{ ...actionBtn, color: 'var(--text-primary)' }}>
                  <RefreshCw size={14} strokeWidth={2} /> Replace
                </button>
                <button type="button" className="ds-affix-btn" onClick={clearOne} style={{ ...actionBtn, color: 'var(--interactive-error)' }}>
                  <Trash2 size={14} strokeWidth={2} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : shape === 'circle' ? (
        circleZone
      ) : (
        boxZone
      )}
    </Field>
  );
}

function MultiRow({ file, disabled, onRemove }: { file: File; disabled?: boolean; onRemove: () => void }) {
  const url = usePreviewUrl(file);
  return (
    <li
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      })}
    >
      <Thumb url={url} name={file.name} size={44} shape="square" />
      <span style={sx({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 })}>
        <span
          style={sx({
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            minWidth: 0,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })}
          title={file.name}
        >
          {file.name}
        </span>
        <span style={sx({ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' })}>{fmtSize(file.size)}</span>
      </span>
      {!disabled && (
        <button
          type="button"
          className="ds-affix-btn"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
          style={sx({
            flex: '0 0 auto',
            width: 36,
            height: 36,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-control)',
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--interactive-error)',
            cursor: 'pointer',
          })}
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      )}
    </li>
  );
}
