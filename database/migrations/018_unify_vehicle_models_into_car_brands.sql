-- Copy manufacturer/model data into one table. Keep the old table temporarily
-- so existing production instances continue to work during the API rollout.

ALTER TABLE public.car_brands
  ADD COLUMN IF NOT EXISTS record_type text NOT NULL DEFAULT 'brand',
  ADD COLUMN IF NOT EXISTS car_brand_id uuid,
  ADD COLUMN IF NOT EXISTS model_name text,
  ADD COLUMN IF NOT EXISTS generation text,
  ADD COLUMN IF NOT EXISTS chassis_code text,
  ADD COLUMN IF NOT EXISTS year_start smallint,
  ADD COLUMN IF NOT EXISTS year_end smallint,
  ADD COLUMN IF NOT EXISTS engine_code text,
  ADD COLUMN IF NOT EXISTS engine_capacity numeric,
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS transmission text,
  ADD COLUMN IF NOT EXISTS vehicle_type text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS vehicle_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.car_brands
  DROP CONSTRAINT IF EXISTS car_brands_manufacturer_name_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'car_brands_record_type_check'
      AND conrelid = 'public.car_brands'::regclass
  ) THEN
    ALTER TABLE public.car_brands
      ADD CONSTRAINT car_brands_record_type_check
      CHECK (record_type IN ('brand', 'vehicle'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'car_brands_status_check'
      AND conrelid = 'public.car_brands'::regclass
  ) THEN
    ALTER TABLE public.car_brands
      ADD CONSTRAINT car_brands_status_check
      CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'car_brands_record_shape_check'
      AND conrelid = 'public.car_brands'::regclass
  ) THEN
    ALTER TABLE public.car_brands
      ADD CONSTRAINT car_brands_record_shape_check
      CHECK (
        (record_type = 'brand' AND car_brand_id IS NULL)
        OR (record_type = 'vehicle' AND car_brand_id IS NOT NULL AND model_name IS NOT NULL)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'car_brands_car_brand_id_fkey'
      AND conrelid = 'public.car_brands'::regclass
  ) THEN
    ALTER TABLE public.car_brands
      ADD CONSTRAINT car_brands_car_brand_id_fkey
      FOREIGN KEY (car_brand_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;
  END IF;
END $$;

UPDATE public.car_brands
SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END
WHERE record_type = 'brand';

CREATE UNIQUE INDEX IF NOT EXISTS car_brands_root_manufacturer_name_key
  ON public.car_brands (lower(manufacturer_name))
  WHERE record_type = 'brand';

CREATE INDEX IF NOT EXISTS car_brands_parent_model_idx
  ON public.car_brands (car_brand_id, status, sort_order)
  WHERE record_type = 'vehicle';

-- Fail rather than silently discard a model if its manufacturer has no logo row.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.vehicles v
    LEFT JOIN public.car_brands b
      ON b.record_type = 'brand'
     AND lower(b.manufacturer_name) = lower(v.manufacturer_name)
    WHERE b.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Vehicle migration stopped: one or more manufacturers have no car_brands row';
  END IF;
END $$;

-- Copy each old vehicle/model into car_brands as a child row, preserving its UUID.
INSERT INTO public.car_brands (
  id, manufacturer_name, slug, logo_url, is_active, sort_order, created_at, updated_at,
  record_type, car_brand_id, model_name, generation, chassis_code, year_start, year_end,
  engine_code, engine_capacity, fuel_type, transmission, vehicle_type, status,
  cover_image_url, vehicle_images, gallery_images, is_featured, seo_title, seo_description
)
SELECT
  v.id,
  v.manufacturer_name,
  COALESCE(NULLIF(v.slug, ''), 'vehicle-' || replace(v.id::text, '-', '')),
  b.logo_url,
  false,
  v.sort_order,
  v.created_at,
  v.updated_at,
  'vehicle',
  b.id,
  v.model_name,
  v.generation,
  v.chassis_code,
  v.year_start,
  v.year_end,
  v.engine_code,
  v.engine_capacity,
  v.fuel_type,
  v.transmission,
  v.vehicle_type,
  v.status,
  v.cover_image_url,
  COALESCE(v.vehicle_images, '[]'::jsonb),
  COALESCE(v.gallery_images, '[]'::jsonb),
  v.is_featured OR EXISTS (
    SELECT 1
    FROM public.homepage_selected_vehicles h
    WHERE h.vehicle_id = v.id AND h.is_active
  ),
  v.seo_title,
  v.seo_description
FROM public.vehicles v
JOIN public.car_brands b
  ON b.record_type = 'brand'
 AND lower(b.manufacturer_name) = lower(v.manufacturer_name)
ON CONFLICT (id) DO UPDATE SET
  manufacturer_name = EXCLUDED.manufacturer_name,
  slug = EXCLUDED.slug,
  logo_url = EXCLUDED.logo_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at,
  record_type = EXCLUDED.record_type,
  car_brand_id = EXCLUDED.car_brand_id,
  model_name = EXCLUDED.model_name,
  generation = EXCLUDED.generation,
  chassis_code = EXCLUDED.chassis_code,
  year_start = EXCLUDED.year_start,
  year_end = EXCLUDED.year_end,
  engine_code = EXCLUDED.engine_code,
  engine_capacity = EXCLUDED.engine_capacity,
  fuel_type = EXCLUDED.fuel_type,
  transmission = EXCLUDED.transmission,
  vehicle_type = EXCLUDED.vehicle_type,
  status = EXCLUDED.status,
  cover_image_url = EXCLUDED.cover_image_url,
  vehicle_images = EXCLUDED.vehicle_images,
  gallery_images = EXCLUDED.gallery_images,
  is_featured = EXCLUDED.is_featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- Create the one-model-per-part fitment contract while retaining its old FK
-- until the deployed API is ready for the final FK retarget.
CREATE TABLE IF NOT EXISTS public.part_vehicle_fitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid NOT NULL UNIQUE REFERENCES public.parts(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  compatible_years integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT part_vehicle_fitments_years_valid CHECK (cardinality(compatible_years) >= 0)
);

CREATE INDEX IF NOT EXISTS part_vehicle_fitments_vehicle_idx
  ON public.part_vehicle_fitments (vehicle_id);

-- Preserve the old many-to-many data when migration 017 has not been applied yet.
INSERT INTO public.part_vehicle_fitments (part_id, vehicle_id, compatible_years)
SELECT DISTINCT ON (pv.part_id)
  pv.part_id,
  pv.vehicle_id,
  CASE
    WHEN v.year_start IS NOT NULL AND v.year_end IS NOT NULL AND v.year_end >= v.year_start
      THEN ARRAY(SELECT generate_series(v.year_start::integer, v.year_end::integer))
    WHEN v.year_start IS NOT NULL THEN ARRAY[v.year_start]
    ELSE '{}'
  END
FROM public.part_vehicles pv
JOIN public.vehicles v ON v.id = pv.vehicle_id
ORDER BY pv.part_id, pv.vehicle_id
ON CONFLICT (part_id) DO NOTHING;

ALTER TABLE public.part_vehicle_fitments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS part_vehicle_fitments_public_read ON public.part_vehicle_fitments;
CREATE POLICY part_vehicle_fitments_public_read
  ON public.part_vehicle_fitments FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON TABLE public.part_vehicle_fitments TO anon, authenticated;

-- The model's featured flag now controls home-page selection. Carry current
-- selections and their order into the same car_brands model row.
UPDATE public.car_brands model
SET is_featured = true,
    sort_order = selected.display_order,
    updated_at = now()
FROM public.homepage_selected_vehicles selected
WHERE model.id = selected.vehicle_id
  AND model.record_type = 'vehicle'
  AND selected.is_active;

-- Keep the legacy tables until the updated API and storefront are live. A
-- separate follow-up migration retargets the remaining foreign keys and drops
-- those tables after production verification.
