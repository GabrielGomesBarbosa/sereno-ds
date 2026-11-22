'use client';

import * as React from 'react';
import { AvatarUpload } from '@sereno-ds/ui';

function AvatarUploadBasico() {
  const [photo, setPhoto] = React.useState<File | null>(null);
  return <AvatarUpload label="Profile photo" name="Ana Beatriz Ramos" value={photo} onChange={setPhoto} />;
}

function AvatarUploadExistente() {
  const [photo, setPhoto] = React.useState<File | string | null>(
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%237C83E8"/><stop offset="1" stop-color="%232FBFA8"/></linearGradient></defs><rect width="200" height="200" fill="url(%23g)"/></svg>',
      ),
  );
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
