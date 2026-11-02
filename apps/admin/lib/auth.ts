import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabase) throw new Error('Supabase authentication is not configured for the admin app.');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('Admin API is not configured.');
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new Error('Your admin session has expired. Please sign in again.');
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...(init?.headers ?? {}) },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? 'Admin API request failed.');
  return payload.data as T;
}
