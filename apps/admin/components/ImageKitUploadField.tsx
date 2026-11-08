'use client';

import { useState } from 'react';
import { adminFetch } from '../lib/auth';

type ImageKitAuth = { token: string; expire: number; signature: string; publicKey: string };
type Props = { value: unknown; multiple?: boolean; folder: string; onChange: (value: string) => void };

function readUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : [value];
  } catch {
    return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  }
}

function safeFileName(value: string) {
  return value.trim().toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

function extension(file: File) {
  const fromName = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  return file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
}

export function ImageKitUploadField({ value, multiple = false, folder, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');
  const urls = readUrls(value);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setProgress(0); setError('');
    try {
      const uploaded: string[] = [];
      const selected = Array.from(files);
      for (const [index, file] of selected.entries()) {
        if (!file.type.startsWith('image/')) throw new Error('Please choose image files only.');
        if (file.size > 10 * 1024 * 1024) throw new Error('Each image must be 10 MB or smaller.');
        const auth = await adminFetch<ImageKitAuth>('/api/v1/admin/imagekit/auth');
        const baseName = safeFileName(filename) || safeFileName(file.name) || `image-${Date.now()}`;
        const finalName = multiple && selected.length > 1 ? `${baseName}-${index + 1}` : baseName;
        const form = new FormData();
        form.append('file', file);
        form.append('fileName', `${finalName}.${extension(file)}`);
        form.append('publicKey', auth.publicKey);
        form.append('signature', auth.signature);
        form.append('expire', String(auth.expire));
        form.append('token', auth.token);
        form.append('folder', `/al-waha-parts/${folder}`);
        form.append('useUniqueFileName', 'false');
        form.append('overwriteFile', 'true');
        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form });
        const payload = (await response.json()) as { url?: string; message?: string; error?: string };
        if (!response.ok || !payload.url) throw new Error(payload.message ?? payload.error ?? 'ImageKit upload failed.');
        uploaded.push(payload.url);
        setProgress(Math.round(((index + 1) / selected.length) * 100));
        if (!multiple) break;
      }
      const next = multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1);
      onChange(multiple ? JSON.stringify(next) : next[0] ?? '');
      setFilename('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed.');
    } finally { setUploading(false); }
  }

  function remove(url: string) {
    const next = urls.filter((item) => item !== url);
    onChange(multiple ? JSON.stringify(next) : '');
  }

  return (
    <div className="imagekit-uploader">
      <div className="imagekit-name-row">
        <label>Custom file name <small>optional</small><input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="e.g. toyota-corolla-brake-pad" /></label>
        <span className="imagekit-extension">.{filename ? 'jpg / png' : 'auto'}</span>
      </div>
      <div className="imagekit-upload-row"><label className="upload-button"><input type="file" accept="image/*" multiple={multiple} onChange={(event) => void upload(event.target.files)} />{uploading ? `Uploading ${progress}%…` : multiple ? 'Choose gallery images' : 'Choose image'}</label><small>ImageKit · max 10 MB per image</small></div>
      {uploading && <div className="upload-progress"><span style={{ width: `${progress}%` }} /></div>}
      {urls.length > 0 && <div className="imagekit-previews">{urls.map((url) => <div className="imagekit-preview" key={url}><img src={url} alt="Uploaded preview" loading="lazy" /><button type="button" onClick={() => remove(url)} aria-label="Remove uploaded image">×</button></div>)}</div>}
      {error && <span className="imagekit-error" role="alert">{error}</span>}
    </div>
  );
}
