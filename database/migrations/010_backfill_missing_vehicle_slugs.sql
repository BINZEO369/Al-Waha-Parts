-- Backfill slugs for any legacy/new vehicle records that still have no public slug.
-- Idempotent: existing administrator-managed slugs are never changed.

DO $$
DECLARE
  vehicle_row record;
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
BEGIN
  FOR vehicle_row IN
    SELECT id, manufacturer_name, model_name, generation, chassis_code, year_start
    FROM public.vehicles
    WHERE slug IS NULL OR btrim(slug) = ''
    ORDER BY created_at NULLS LAST, id
  LOOP
    base_slug := lower(trim(both '-' FROM regexp_replace(
      concat_ws('-', vehicle_row.manufacturer_name, vehicle_row.model_name,
        coalesce(vehicle_row.generation, vehicle_row.chassis_code), vehicle_row.year_start),
      '[^a-zA-Z0-9]+', '-', 'g'
    )));
    IF base_slug = '' THEN base_slug := 'vehicle'; END IF;

    candidate_slug := base_slug;
    suffix := 1;
    WHILE EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE slug = candidate_slug AND id <> vehicle_row.id
    ) LOOP
      suffix := suffix + 1;
      candidate_slug := base_slug || '-' || suffix::text;
    END LOOP;

    UPDATE public.vehicles
       SET slug = candidate_slug,
           updated_at = now()
     WHERE id = vehicle_row.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_slug_unique_idx
  ON public.vehicles (slug)
  WHERE slug IS NOT NULL;
