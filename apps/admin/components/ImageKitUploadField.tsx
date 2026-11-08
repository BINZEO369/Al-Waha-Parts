'use client';

import { useState } from 'react';
import { adminFetch } from '../lib/auth';

type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

type Props = {
  value: unknown;
  multiple?: boolean;
  folder: string;
  onChange: (value: string) => void;
};

function readUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : [value];
  } catch {
    return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  }
}

export function ImageKitUploadField({ value, multiple = false, folder, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const urls = readUrls(value);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) throw new Error('Please choose image files only.');
        if (file.size > 10 * 1024 * 1024) throw new Error('Each image must be 10 MB or smaller.');
        const auth = await adminFetch<ImageKitAuth>('/api/v1/admin/imagekit/auth');
        const form = new FormData();
        form.append('file', file);
        form.append('fileName', file.name);
        form.append('publicKey', auth.publicKey);
        form.append('signature', auth.signature);
        form.append('expire', String(auth.expire));
        form.append('token', auth.token);
        form.append('folder', `/al-waha-parts/${folder}`);
        form.append('useUniqueFileName', 'true');
        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form });
        const payload = (await response.json()) as { url?: string; message?: string; error?: string };
        if (!response.ok || !payload.url) throw new Error(payload.message ?? payload.error ?? 'ImageKit upload failed.');
        uploaded.push(payload.url);
        if (!multiple) break;
      }
      const next = multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1);
      onChange(multiple ? JSON.stringify(next) : next[0] ?? '');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="imagekit-uploader">
      <label className="upload-button">
        <input type="file" accept="image/*" multiple={multiple} onChange={(event) => void upload(event.target.files)} />
        {uploading ? 'Uploading…' : multiple ? 'Upload gallery images' : 'Upload image'}
      </label>
      <small>ImageKit · max 10 MB per image</small>
      {urls.length > 0 && (
        <div className="imagekit-previews">
          {urls.map((url) => (
            <img key={url} src={url} alt="Uploaded preview" />
          ))}
        </div>
      )}
      {error && <span className="imagekit-error" role="alert">{error}</span>}
    </div>
  );
}
