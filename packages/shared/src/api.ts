export interface ApiEnvelope<T> {
  data: T;
  requestId?: string;
}

export async function apiFetch<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? 'API request failed');
  return payload.data as T;
}
