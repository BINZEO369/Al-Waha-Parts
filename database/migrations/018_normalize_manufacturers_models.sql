-- Al Waha Parts: use separate manufacturer and model tables as the vehicle source of truth.
-- This migration is intentionally ordered so existing production IDs and booking history are preserved.

BEGIN;

-- Ensure normalized tables can accept future admin-created records.
ALTER TABLE public.manufacturers
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.car_models
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Backfill/refresh normalized manufacturers from the combined catalog before removing it.
INSERT INTO public.manufacturers (
  manufacturer_name, slug, logo_url, status, is_active, sort_order, created_at, updated_at
)
SELECT
  cb.manufacturer_name,
  cb.slug,
  cb.logo_url,
  COALESCE(cb.status, 'active'),
  COALESCE(cb.is_active, true),
  COALESCE(cb.sort_order, 0),
  COALESCE(cb.created_at, now()),
  COALESCE(cb.updated_at, now())
FROM public.car_brands cb
WHERE cb.record_type = 'brand'
ON CONFLICT (slug) DO UPDATE SET
  manufacturer_name = EXCLUDED.manufacturer_name,
  logo_url = COALESCE(EXCLUDED.logo_url, public.manufacturers.logo_url),
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Backfill/refresh normalized models and keep their manufacturer relationship explicit.
INSERT INTO public.car_models (
  manufacturer_id, model_name, slug, generation, chassis_code, year_start, year_end,
  engine_code, engine_capacity, fuel_type, transmission, vehicle_type, cover_image_url,
  vehicle_images, gallery_images, status, is_featured, sort_order, seo_title, seo_description,
  created_at, updated_at
)
SELECT
  m.id,
  cb.model_name,
  cb.slug,
  cb.generation,
  cb.chassis_code,
  cb.year_start,
  cb.year_end,
  cb.engine_code,
  cb.engine_capacity,
  cb.fuel_type,
  cb.transmission,
  cb.vehicle_type,
  cb.cover_image_url,
  COALESCE(cb.vehicle_images, '[]'::jsonb),
  COALESCE(cb.gallery_images, '[]'::jsonb),
  COALESCE(cb.status, 'active'),
  COALESCE(cb.is_featured, false),
  COALESCE(cb.sort_order, 0),
  cb.seo_title,
  cb.seo_description,
  COALESCE(cb.created_at, now()),
  COALESCE(cb.updated_at, now())
FROM public.car_brands cb
JOIN public.car_brands parent ON parent.id = cb.car_brand_id AND parent.record_type = 'brand'
JOIN public.manufacturers m ON lower(m.slug) = lower(parent.slug)
WHERE cb.record_type = 'vehicle'
ON CONFLICT (slug) DO UPDATE SET
  manufacturer_id = EXCLUDED.manufacturer_id,
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
  cover_image_url = COALESCE(EXCLUDED.cover_image_url, public.car_models.cover_image_url),
  vehicle_images = EXCLUDED.vehicle_images,
  gallery_images = EXCLUDED.gallery_images,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_at = now();

-- Move the remaining combined-table part references to the normalized IDs.
UPDATE public.parts p
SET manufacturer_id = m.id
FROM public.car_brands cb
JOIN public.manufacturers m ON lower(m.slug) = lower(cb.slug)
WHERE p.manufacturer_id IS NULL
  AND p.car_brand_id = cb.id
  AND cb.record_type = 'brand';

UPDATE public.parts p
SET model_id = cm.id,
    manufacturer_id = COALESCE(p.manufacturer_id, cm.manufacturer_id)
FROM public.car_brands cb
JOIN public.car_models cm ON lower(cm.slug) = lower(cb.slug)
WHERE p.model_id IS NULL
  AND p.car_brand_id = cb.id
  AND cb.record_type = 'vehicle';

-- Consolidate legacy fitment rows into the normalized model-fitment table.
INSERT INTO public.part_model_fitments (part_id, model_id, compatible_years, created_at, updated_at)
SELECT f.part_id, COALESCE(f.model_id, cm.id), f.compatible_years, f.created_at, f.updated_at
FROM public.part_vehicle_fitments f
LEFT JOIN public.car_brands cb ON cb.id = f.vehicle_id
LEFT JOIN public.car_models cm ON cm.id = f.model_id OR lower(cm.slug) = lower(cb.slug)
WHERE COALESCE(f.model_id, cm.id) IS NOT NULL
ON CONFLICT (part_id, model_id) DO UPDATE SET
  compatible_years = EXCLUDED.compatible_years,
  updated_at = now();

INSERT INTO public.part_model_fitments (part_id, model_id, compatible_years, created_at, updated_at)
SELECT pv.part_id, cm.id, '{}'::integer[], pv.created_at, pv.created_at
FROM public.part_vehicles pv
JOIN public.car_brands cb ON cb.id = pv.vehicle_id
JOIN public.car_models cm ON lower(cm.slug) = lower(cb.slug)
ON CONFLICT (part_id, model_id) DO NOTHING;

-- Preserve vehicle IDs attached to existing anonymous bookings.
ALTER TABLE public.booking_items
  DROP CONSTRAINT IF EXISTS booking_items_vehicle_id_car_brands_fkey;
UPDATE public.booking_items bi
SET vehicle_id = cm.id
FROM public.car_brands cb
JOIN public.car_models cm ON lower(cm.slug) = lower(cb.slug)
WHERE bi.vehicle_id = cb.id;
ALTER TABLE public.booking_items
  ADD CONSTRAINT booking_items_vehicle_id_car_models_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_models(id) ON DELETE SET NULL;

-- Preserve homepage selections while changing their FK to car_models.
ALTER TABLE public.homepage_selected_vehicles
  DROP CONSTRAINT IF EXISTS homepage_selected_vehicles_vehicle_id_car_brands_fkey;
UPDATE public.homepage_selected_vehicles hv
SET vehicle_id = cm.id
FROM public.car_brands cb
JOIN public.car_models cm ON lower(cm.slug) = lower(cb.slug)
WHERE hv.vehicle_id = cb.id;
ALTER TABLE public.homepage_selected_vehicles
  ADD CONSTRAINT homepage_selected_vehicles_vehicle_id_car_models_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_models(id) ON DELETE CASCADE;

-- Remove obsolete foreign keys/columns before dropping the combined table.
ALTER TABLE public.parts
  DROP CONSTRAINT IF EXISTS parts_car_brand_id_fkey,
  DROP COLUMN IF EXISTS car_brand_id;

DROP TABLE IF EXISTS public.part_vehicle_fitments;
DROP TABLE IF EXISTS public.part_vehicles;

-- The combined manufacturer/model table is no longer part of the production schema.
DROP TABLE public.car_brands;

-- Enforce the separate-table model relationship and make lookup/indexing production-safe.
CREATE UNIQUE INDEX IF NOT EXISTS manufacturers_slug_key ON public.manufacturers (lower(slug));
CREATE UNIQUE INDEX IF NOT EXISTS car_models_slug_key ON public.car_models (lower(slug));
CREATE INDEX IF NOT EXISTS car_models_manufacturer_status_order_idx
  ON public.car_models (manufacturer_id, status, sort_order, model_name);
CREATE INDEX IF NOT EXISTS parts_manufacturer_model_idx
  ON public.parts (manufacturer_id, model_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturers_status_valid') THEN
    ALTER TABLE public.manufacturers
      ADD CONSTRAINT manufacturers_status_valid CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'car_models_status_valid') THEN
    ALTER TABLE public.car_models
      ADD CONSTRAINT car_models_status_valid CHECK (status IN ('active', 'inactive', 'draft'));
  END IF;
END $$;

COMMIT;
