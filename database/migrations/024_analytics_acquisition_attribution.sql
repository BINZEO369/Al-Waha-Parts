-- Consent-based acquisition attribution. Values are normalized categories, not raw tracking URLs.
ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS acquisition_source text,
  ADD COLUMN IF NOT EXISTS acquisition_medium text,
  ADD COLUMN IF NOT EXISTS acquisition_campaign text,
  ADD COLUMN IF NOT EXISTS landing_referrer_host text;

ALTER TABLE public.analytics_visitors
  ADD COLUMN IF NOT EXISTS first_acquisition_source text,
  ADD COLUMN IF NOT EXISTS first_acquisition_medium text,
  ADD COLUMN IF NOT EXISTS first_acquisition_campaign text;

CREATE INDEX IF NOT EXISTS analytics_sessions_acquisition_source_idx
  ON public.analytics_sessions (acquisition_source, started_at DESC);
CREATE INDEX IF NOT EXISTS analytics_sessions_acquisition_medium_idx
  ON public.analytics_sessions (acquisition_medium, started_at DESC);
