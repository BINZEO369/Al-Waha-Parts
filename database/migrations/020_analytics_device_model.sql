-- Store a coarse device family/model only when the browser exposes it.
ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS device_model text;
