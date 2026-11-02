-- Professional vehicle URLs: populate stable readable slugs and require them.
-- Run once on the production Supabase database before deploying the slug-only route.

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS slug text;

WITH source AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        trim(both '-' FROM regexp_replace(
          lower(concat_ws('-', manufacturer_name, model_name, generation, chassis_code)),
          '[^a-z0-9]+', '-', 'g'
        )),
        ''
      ),
      'vehicle'
    ) AS base_slug
  FROM public.vehicles
), ranked AS (
  SELECT id, base_slug, row_number() OVER (PARTITION BY base_slug ORDER BY id) AS duplicate_number
  FROM source
)
UPDATE public.vehicles AS vehicle
SET slug = ranked.base_slug || CASE
  WHEN ranked.duplicate_number = 1 THEN ''
  ELSE '-' || ranked.duplicate_number::text
END
FROM ranked
WHERE vehicle.id = ranked.id
  AND (vehicle.slug IS NULL OR btrim(vehicle.slug) = '');

-- Existing non-empty slugs are retained; make the column safe for every future record.
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_slug_unique_idx ON public.vehicles (slug);
ALTER TABLE public.vehicles ALTER COLUMN slug SET NOT NULL;
