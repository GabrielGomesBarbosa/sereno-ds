'use client';

import * as React from 'react';
import { AvatarUpload } from '@sereno-ds/ui';

function AvatarUploadBasico() {
  const [photo, setPhoto] = React.useState<File | null>(null);
  return <AvatarUpload label="Profile photo" name="Ana Beatriz Ramos" value={photo} onChange={setPhoto} />;
}

function AvatarUploadExistente() {
  // A real photo that ships with the docs, so the example needs no network: apps/docs/public/img/marcos.jpg is
  // "Matthew Wiebe" on Unsplash (https://unsplash.com/photos/tBtuxtLvAZs, Unsplash License), 400x400 from picsum.photos.
  // It replaces an inline SVG whose gradient was encoded twice (`%23` became `%2523`): the image loaded but painted
  // nothing, so the example showed an empty gray disc.
  const [photo, setPhoto] = React.useState<File | string | null>('/img/marcos.jpg');
  return <AvatarUpload label="Profile photo" name="Marcos Lima" value={photo} onChange={(f) => setPhoto(f)} />;
}

function AvatarUploadTamanhos() {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <AvatarUpload name="Ana Beatriz" size={64} />
      <AvatarUpload name="Ana Beatriz" size={96} />
      <AvatarUpload name="Ana Beatriz" size={128} />
    </div>
  );
}

function AvatarUploadDesabilitado() {
  return <AvatarUpload label="Profile photo" name="Ana Beatriz Ramos" disabled />;
}

export const avatarUploadDemos: Record<string, React.FC> = {
    basic: AvatarUploadBasico,
    existing: AvatarUploadExistente,
    sizes: AvatarUploadTamanhos,
    disabled: AvatarUploadDesabilitado,
  };
