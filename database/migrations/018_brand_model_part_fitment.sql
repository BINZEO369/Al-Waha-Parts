-- Production catalog normalization for Al Waha Parts.
-- Manufacturers and car models are separate physical tables. The legacy
-- car_brands table is retained for rollback compatibility during rollout.

BEGIN;

CREATE TABLE IF NOT EXISTS public.manufacturers (
  id uuid PRIMARY KEY,
  manufacturer_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  company_description text,
  country text,
  founded_year integer,
  status text NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.car_models (
  id uuid PRIMARY KEY,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  generation text,
  chassis_code text,
  year_start smallint,
  year_end smallint,
  engine_code text,
  engine_capacity numeric,
  fuel_type text,
  transmission text,
  vehicle_type text,
  cover_image_url text,
  vehicle_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.manufacturers (id, manufacturer_name, slug, logo_url, status, is_active, sort_order, created_at, updated_at)
SELECT id, manufacturer_name, slug, logo_url, status, is_active, sort_order, created_at, updated_at
FROM public.car_brands
WHERE record_type = 'brand'
ON CONFLICT (id) DO UPDATE SET
  manufacturer_name = EXCLUDED.manufacturer_name,
  slug = EXCLUDED.slug,
  logo_url = EXCLUDED.logo_url,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO public.car_models (
  id, manufacturer_id, model_name, slug, generation, chassis_code, year_start, year_end,
  engine_code, engine_capacity, fuel_type, transmission, vehicle_type, cover_image_url,
  vehicle_images, gallery_images, status, is_featured, sort_order, seo_title, seo_description,
  created_at, updated_at
)
SELECT id, car_brand_id, model_name, slug, generation, chassis_code, year_start, year_end,
  engine_code, engine_capacity, fuel_type, transmission, vehicle_type, cover_image_url,
  vehicle_images, gallery_images, status, is_featured, sort_order, seo_title, seo_description,
  created_at, updated_at
FROM public.car_brands
WHERE record_type = 'vehicle' AND car_brand_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  manufacturer_id = EXCLUDED.manufacturer_id,
  model_name = EXCLUDED.model_name,
  slug = EXCLUDED.slug,
  generation = EXCLUDED.generation,
  chassis_code = EXCLUDED.chassis_code,
  year_start = EXCLUDED.year_start,
  year_end = EXCLUDED.year_end,
  engine_code = EXCLUDED.engine_code,
  engine_capacity = EXCLUDED.engine_capacity,
  fuel_type = EXCLUDED.fuel_type,
  transmission = EXCLUDED.transmission,
  vehicle_type = EXCLUDED.vehicle_type,
  cover_image_url = EXCLUDED.cover_image_url,
  vehicle_images = EXCLUDED.vehicle_images,
  gallery_images = EXCLUDED.gallery_images,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS model_id uuid REFERENCES public.car_models(id) ON DELETE SET NULL;

UPDATE public.parts AS p
SET manufacturer_id = b.id, updated_at = now()
FROM public.car_brands AS b
WHERE p.car_brand_id = b.id AND b.record_type = 'brand'
  AND p.manufacturer_id IS DISTINCT FROM b.id;

UPDATE public.parts AS p
SET model_id = m.id, manufacturer_id = m.manufacturer_id, updated_at = now()
FROM public.part_vehicle_fitments AS f
JOIN public.car_models AS m ON m.id = COALESCE(f.model_id, f.vehicle_id)
WHERE p.id = f.part_id AND p.model_id IS DISTINCT FROM m.id;

CREATE TABLE IF NOT EXISTS public.part_model_fitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  compatible_years integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (part_id, model_id)
);

INSERT INTO public.part_model_fitments (part_id, model_id, compatible_years, created_at, updated_at)
SELECT f.part_id, COALESCE(f.model_id, f.vehicle_id), f.compatible_years, f.created_at, f.updated_at
FROM public.part_vehicle_fitments AS f
JOIN public.car_models AS m ON m.id = COALESCE(f.model_id, f.vehicle_id)
ON CONFLICT (part_id, model_id) DO UPDATE SET
  compatible_years = EXCLUDED.compatible_years, updated_at = now();

CREATE INDEX IF NOT EXISTS manufacturers_active_order_idx
  ON public.manufacturers (is_active, sort_order, manufacturer_name);
CREATE INDEX IF NOT EXISTS car_models_manufacturer_idx
  ON public.car_models (manufacturer_id, status, sort_order, model_name);
CREATE INDEX IF NOT EXISTS parts_manufacturer_idx ON public.parts (manufacturer_id);
CREATE INDEX IF NOT EXISTS parts_model_idx ON public.parts (model_id);
CREATE INDEX IF NOT EXISTS part_model_fitments_model_idx
  ON public.part_model_fitments (model_id);

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_model_fitments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS manufacturers_public_active_read ON public.manufacturers;
CREATE POLICY manufacturers_public_active_read ON public.manufacturers
  FOR SELECT TO anon, authenticated USING (is_active = true AND status = 'active');
DROP POLICY IF EXISTS car_models_public_active_read ON public.car_models;
CREATE POLICY car_models_public_active_read ON public.car_models
  FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS part_model_fitments_public_read ON public.part_model_fitments;
CREATE POLICY part_model_fitments_public_read ON public.part_model_fitments
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON TABLE public.manufacturers, public.car_models, public.part_model_fitments
  TO anon, authenticated;

COMMIT;
