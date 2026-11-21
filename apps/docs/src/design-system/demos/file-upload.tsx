'use client';

import * as React from 'react';
import { FileUpload } from '@sereno-ds/ui';

function FileUploadBasico() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Attachment" hint="PDF or image, up to 5 MB." accept="image/*,.pdf" value={f} onChange={setF} />
    </div>
  );
}

function FileUploadAvatar() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Logo" hint="Square PNG, transparent background." shape="circle" value={f} onChange={setF} />
    </div>
  );
}

function FileUploadErro() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Logo" hint="PNG only, up to 1 MB." accept="image/png" maxSizeMB={1} value={f} onChange={setF} />
    </div>
  );
}

function FileUploadMultiplo() {
  const [files, setFiles] = React.useState<File[]>([]);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Portfolio" hint="Up to 5 MB each." multiple accept="image/*" value={files} onChange={setFiles} />
    </div>
  );
}

function FileUploadDesabilitado() {
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Attachment" hint="Locked on the free plan." disabled />
    </div>
  );
}

export const fileUploadDemos: Record<string, React.FC> = {
    basic: FileUploadBasico,
    avatar: FileUploadAvatar,
    multiple: FileUploadMultiplo,
    error: FileUploadErro,
    disabled: FileUploadDesabilitado,
  };
