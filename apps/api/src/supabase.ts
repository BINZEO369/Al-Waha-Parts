import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseConfig } from './env.js';

let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const config = assertSupabaseConfig();
    client = createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
