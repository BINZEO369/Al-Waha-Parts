-- Vehicles use the database car_brands record instead of storing a direct logo image.
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS car_brand_id uuid REFERENCES public.car_brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vehicles_car_brand_id_idx
  ON public.vehicles (car_brand_id);

UPDATE public.vehicles v
SET car_brand_id = b.id, updated_at = now()
FROM public.car_brands b
WHERE v.car_brand_id IS NULL
  AND lower(v.manufacturer_name) = lower(b.manufacturer_name);
