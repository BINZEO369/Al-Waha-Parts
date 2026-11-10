-- Read-only hourly traffic aggregation for the admin analytics dashboard.
-- The function is invoker-security, clamps its range to 24 hours, and returns aggregates only.
CREATE OR REPLACE FUNCTION public.admin_analytics_hourly(p_hours integer DEFAULT 24)
RETURNS TABLE (
  hour_start timestamptz,
  page_views bigint,
  page_exits bigint,
  sessions bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('hour', now())
        - (GREATEST(1, LEAST(COALESCE(p_hours, 24), 24)) - 1) * interval '1 hour' AS start_at,
      date_trunc('hour', now()) AS end_at
  ),
  buckets AS (
    SELECT generate_series(bounds.start_at, bounds.end_at, interval '1 hour') AS bucket
    FROM bounds
  ),
  event_counts AS (
    SELECT
      date_trunc('hour', event.created_at) AS bucket,
      count(*) FILTER (WHERE event.event_name = 'page_view') AS page_views,
      count(*) FILTER (WHERE event.event_name = 'page_exit') AS page_exits
    FROM public.analytics_events AS event
    CROSS JOIN bounds
    WHERE event.created_at >= bounds.start_at
      AND event.created_at < bounds.end_at + interval '1 hour'
    GROUP BY date_trunc('hour', event.created_at)
  ),
  session_counts AS (
    SELECT date_trunc('hour', session.started_at) AS bucket, count(*) AS sessions
    FROM public.analytics_sessions AS session
    CROSS JOIN bounds
    WHERE session.started_at >= bounds.start_at
      AND session.started_at < bounds.end_at + interval '1 hour'
    GROUP BY date_trunc('hour', session.started_at)
  )
  SELECT
    buckets.bucket AS hour_start,
    COALESCE(event_counts.page_views, 0)::bigint AS page_views,
    COALESCE(event_counts.page_exits, 0)::bigint AS page_exits,
    COALESCE(session_counts.sessions, 0)::bigint AS sessions
  FROM buckets
  LEFT JOIN event_counts ON event_counts.bucket = buckets.bucket
  LEFT JOIN session_counts ON session_counts.bucket = buckets.bucket
  ORDER BY buckets.bucket;
$$;

REVOKE ALL ON FUNCTION public.admin_analytics_hourly(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_hourly(integer) TO service_role;
