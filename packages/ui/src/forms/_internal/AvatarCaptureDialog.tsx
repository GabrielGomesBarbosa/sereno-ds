'use client';

import * as React from 'react';
import { Camera, Check, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { sx } from '../../_internal/style';
import { Dialog } from '../../feedback/Dialog';
import { Button } from '../../core/Button';
import type { AvatarUploadLabels } from '../AvatarUpload';
import { useCamera } from './useCamera';
import { useCropper } from './useCropper';

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
export type Step = 'camera' | 'crop';

/**
 * The one dialog for the whole photo flow: the live camera, then the crop (and back, on
 * Retake). It stays mounted across the steps and only its header text, stage and buttons
 * swap, so the panel does not close and reopen (no second pop-in, no scroll-lock or focus
 * hand-off) and it keeps one size. `Dialog.Header` / `Body` / `Footer` are direct children
 * on purpose: `Dialog` reads them off its children to pad the body and label itself, which
 * a wrapper component per step would hide from it.
 */
export function CaptureDialog({
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
