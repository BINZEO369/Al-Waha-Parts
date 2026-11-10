-- Shared, atomic per-admin AI rate limits suitable for concurrent/serverless API instances.
CREATE TABLE IF NOT EXISTS public.admin_ai_rate_limits (
  admin_id uuid NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action = 'analytics_insights'),
  window_started_at timestamptz NOT NULL,
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  PRIMARY KEY (admin_id, action)
);

ALTER TABLE public.admin_ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ai_rate_limits FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_ai_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.admin_ai_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_admin_ai_rate_limit(
  p_admin_id uuid,
  p_action text,
  p_limit integer DEFAULT 8,
  p_window_seconds integer DEFAULT 3600
)
RETURNS TABLE (allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_used_count integer;
BEGIN
  IF p_action <> 'analytics_insights' OR p_limit < 1 OR p_limit > 100
     OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid AI rate limit parameters';
  END IF;

  INSERT INTO public.admin_ai_rate_limits AS rate_limit (admin_id, action, window_started_at, used_count)
  VALUES (p_admin_id, p_action, v_now, 1)
  ON CONFLICT (admin_id, action) DO UPDATE
  SET window_started_at = CASE
        WHEN rate_limit.window_started_at + make_interval(secs => p_window_seconds) <= v_now THEN v_now
        ELSE rate_limit.window_started_at
      END,
      used_count = CASE
        WHEN rate_limit.window_started_at + make_interval(secs => p_window_seconds) <= v_now THEN 1
        ELSE LEAST(rate_limit.used_count + 1, p_limit + 1)
      END
  RETURNING admin_ai_rate_limits.window_started_at, admin_ai_rate_limits.used_count
  INTO v_window_started_at, v_used_count;

  allowed := v_used_count <= p_limit;
  retry_after_seconds := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_window_started_at + make_interval(secs => p_window_seconds) - v_now)))::integer)
  END;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_admin_ai_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_admin_ai_rate_limit(uuid, text, integer, integer) TO service_role;
