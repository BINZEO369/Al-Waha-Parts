-- Store the API-observed client IP only for consented analytics sessions.
ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS ip_address text;
