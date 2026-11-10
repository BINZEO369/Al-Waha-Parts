import { cache } from 'react';

const requestPublicApi = cache(async (path: string): Promise<unknown | null | undefined> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!baseUrl) return undefined;

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (response.status === 404) return null;

  const payload = (await response.json().catch(() => null)) as
    | { data?: unknown; error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Public catalog request failed (${response.status}).`);
  }
  return payload?.data ?? null;
});

export function fetchPublicData<T>(path: string): Promise<T | null | undefined> {
  return requestPublicApi(path) as Promise<T | null | undefined>;
}

export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.al-waha.shop';
  try {
    return new URL(configured).origin;
  } catch {
    return '';
  }
}

export function canonicalUrl(path: string): string {
  const origin = getSiteOrigin();
  return origin ? new URL(path.startsWith('/') ? path : `/${path}`, origin).toString() : '';
}

export function cleanMetaText(value: string | null | undefined, maxLength = 160): string | undefined {
  if (!value) return undefined;
  const text = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
