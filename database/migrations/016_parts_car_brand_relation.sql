-- Link catalog parts to the vehicle-brand logo registry.
-- brand_name remains the manufacturer/supplier brand (for example Brembo or Bosch).
-- car_brand_id identifies the vehicle make whose logo is shown on the product page.
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS car_brand_id uuid REFERENCES public.car_brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS parts_car_brand_id_idx
  ON public.parts (car_brand_id);

-- Backfill only products whose vehicle fitment makes the vehicle brand unambiguous.
UPDATE public.parts AS p
SET car_brand_id = b.id,
    updated_at = now()
FROM public.car_brands AS b
WHERE p.sku IN ('AWP-BR-001', 'AWP-OF-044')
  AND b.slug = 'toyota'
  AND p.status = 'active';

UPDATE public.parts AS p
SET car_brand_id = b.id,
    updated_at = now()
FROM public.car_brands AS b
WHERE p.sku IN ('AWP-AL-208', 'AWP-LT-112')
  AND b.slug = 'nissan'
  AND p.status = 'active';
