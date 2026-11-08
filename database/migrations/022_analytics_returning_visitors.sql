-- Consent-based returning visitor identity.
-- The browser sends a random first-party UUID only after Allow; the API stores only its HMAC hash.

ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS visitor_id_hash text,
  ADD COLUMN IF NOT EXISTS visit_number integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS analytics_sessions_visitor_id_hash_idx
  ON public.analytics_sessions (visitor_id_hash, started_at DESC);

CREATE TABLE IF NOT EXISTS public.analytics_visitors (
  visitor_hash text PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
  total_page_views integer NOT NULL DEFAULT 0 CHECK (total_page_views >= 0),
  last_session_id uuid REFERENCES public.analytics_sessions(id) ON DELETE SET NULL,
  first_landing_path text,
  last_path text,
  first_referrer text,
  country_code text,
  region text,
  city text,
  device_type text,
  device_model text,
  browser text,
  operating_system text,
  language text,
  timezone text,
  consent_version integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_visitors_last_seen_idx
  ON public.analytics_visitors (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS analytics_visitors_returning_idx
  ON public.analytics_visitors (visit_count DESC, last_seen_at DESC);

ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visitors FORCE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.analytics_visitors FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.analytics_visitors TO service_role;

CREATE OR REPLACE FUNCTION public.upsert_analytics_visitor(
  p_visitor_hash text,
  p_session_id uuid,
  p_page_path text,
  p_referrer text,
  p_country_code text,
  p_region text,
  p_city text,
  p_device_type text,
  p_device_model text,
  p_browser text,
  p_operating_system text,
  p_language text,
  p_timezone text,
  p_consent_version integer,
  p_is_page_view boolean
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_visit_count integer;
BEGIN
  INSERT INTO public.analytics_visitors (
    visitor_hash, first_seen_at, last_seen_at, visit_count, total_page_views,
    last_session_id, first_landing_path, last_path, first_referrer,
    country_code, region, city, device_type, device_model, browser,
    operating_system, language, timezone, consent_version
  ) VALUES (
    p_visitor_hash, now(), now(), CASE WHEN p_is_page_view THEN 1 ELSE 0 END,
    CASE WHEN p_is_page_view THEN 1 ELSE 0 END, p_session_id, p_page_path, p_page_path,
    p_referrer, p_country_code, p_region, p_city, p_device_type, p_device_model,
    p_browser, p_operating_system, p_language, p_timezone, p_consent_version
  )
  ON CONFLICT (visitor_hash) DO UPDATE SET
    last_seen_at = now(),
    visit_count = public.analytics_visitors.visit_count + CASE WHEN p_is_page_view THEN 1 ELSE 0 END,
    total_page_views = public.analytics_visitors.total_page_views + CASE WHEN p_is_page_view THEN 1 ELSE 0 END,
    last_session_id = p_session_id,
    last_path = p_page_path,
    country_code = COALESCE(p_country_code, public.analytics_visitors.country_code),
    region = COALESCE(p_region, public.analytics_visitors.region),
    city = COALESCE(p_city, public.analytics_visitors.city),
    device_type = COALESCE(p_device_type, public.analytics_visitors.device_type),
    device_model = COALESCE(p_device_model, public.analytics_visitors.device_model),
    browser = COALESCE(p_browser, public.analytics_visitors.browser),
    operating_system = COALESCE(p_operating_system, public.analytics_visitors.operating_system),
    language = COALESCE(p_language, public.analytics_visitors.language),
    timezone = COALESCE(p_timezone, public.analytics_visitors.timezone),
    consent_version = p_consent_version,
    updated_at = now()
  RETURNING visit_count INTO current_visit_count;

  RETURN current_visit_count;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_analytics_visitor(text, uuid, text, text, text, text, text, text, text, text, text, text, text, integer, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_analytics_visitor(text, uuid, text, text, text, text, text, text, text, text, text, text, text, integer, boolean) TO service_role;
