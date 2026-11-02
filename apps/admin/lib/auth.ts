import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}

async function requestWithSession(path: string, init: RequestInit, accessToken: string) {
  try {
    return await fetch(`/api/proxy${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Unable to reach the admin API. Check the API deployment and API_URL setting.');
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase authentication is not configured for the admin app.');

  let { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) {
    redirectToLogin();
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  let response = await requestWithSession(path, init, data.session.access_token);
  if (response.status === 401) {
    const refreshed = await supabase.auth.refreshSession();
    data = refreshed.data;
    if (data.session?.access_token) {
      response = await requestWithSession(path, init, data.session.access_token);
    }
  }

  if (response.status === 401 || response.status === 403) {
    await supabase.auth.signOut();
    redirectToLogin();
    throw new Error('Your admin session is no longer authorized. Please sign in again.');
  }

  let payload: { data?: T; error?: { message?: string } };
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Admin API returned an invalid response (${response.status}).`);
  }
  if (!response.ok) throw new Error(payload.error?.message ?? 'Admin API request failed.');
  return payload.data as T;
}
