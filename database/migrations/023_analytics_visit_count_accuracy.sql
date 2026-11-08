-- Count a returning visit only when a new session id is first observed.
CREATE OR REPLACE FUNCTION public.upsert_analytics_visitor(p_visitor_hash text,p_session_id uuid,p_page_path text,p_referrer text,p_country_code text,p_region text,p_city text,p_device_type text,p_device_model text,p_browser text,p_operating_system text,p_language text,p_timezone text,p_consent_version integer,p_is_page_view boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_visit_count integer; is_new_visit boolean;
BEGIN
  is_new_visit := p_is_page_view AND NOT EXISTS (SELECT 1 FROM public.analytics_sessions WHERE id = p_session_id);
  INSERT INTO public.analytics_visitors (visitor_hash,first_seen_at,last_seen_at,visit_count,total_page_views,last_session_id,first_landing_path,last_path,first_referrer,country_code,region,city,device_type,device_model,browser,operating_system,language,timezone,consent_version)
  VALUES (p_visitor_hash,now(),now(),CASE WHEN is_new_visit THEN 1 ELSE 0 END,CASE WHEN p_is_page_view THEN 1 ELSE 0 END,p_session_id,p_page_path,p_page_path,p_referrer,p_country_code,p_region,p_city,p_device_type,p_device_model,p_browser,p_operating_system,p_language,p_timezone,p_consent_version)
  ON CONFLICT (visitor_hash) DO UPDATE SET last_seen_at=now(),visit_count=public.analytics_visitors.visit_count+CASE WHEN is_new_visit THEN 1 ELSE 0 END,total_page_views=public.analytics_visitors.total_page_views+CASE WHEN p_is_page_view THEN 1 ELSE 0 END,last_session_id=p_session_id,last_path=p_page_path,country_code=COALESCE(p_country_code,public.analytics_visitors.country_code),region=COALESCE(p_region,public.analytics_visitors.region),city=COALESCE(p_city,public.analytics_visitors.city),device_type=COALESCE(p_device_type,public.analytics_visitors.device_type),device_model=COALESCE(p_device_model,public.analytics_visitors.device_model),browser=COALESCE(p_browser,public.analytics_visitors.browser),operating_system=COALESCE(p_operating_system,public.analytics_visitors.operating_system),language=COALESCE(p_language,public.analytics_visitors.language),timezone=COALESCE(p_timezone,public.analytics_visitors.timezone),consent_version=p_consent_version,updated_at=now()
  RETURNING visit_count INTO current_visit_count;
  RETURN current_visit_count;
END; $$;
