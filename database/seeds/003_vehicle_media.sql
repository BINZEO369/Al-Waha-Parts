-- Idempotent vehicle media seed. Run after 002_production_catalog.sql.
-- Images remain database values; the frontend does not ship product/vehicle fallbacks.
UPDATE public.vehicles
SET
  manufacturer_logo = CASE manufacturer_name
    WHEN 'Toyota' THEN 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg'
    WHEN 'Nissan' THEN 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg'
    ELSE manufacturer_logo
  END,
  vehicle_images = CASE
    WHEN cover_image_url IS NOT NULL AND jsonb_array_length(COALESCE(vehicle_images, '[]'::jsonb)) = 0
      THEN jsonb_build_array(cover_image_url)
    ELSE COALESCE(vehicle_images, '[]'::jsonb)
  END,
  updated_at = now()
WHERE manufacturer_name IN ('Toyota', 'Nissan');

-- Keep the catalog records publishable and consistently ordered when this seed is rerun.
UPDATE public.parts_categories
SET status = 'active', is_featured = COALESCE(is_featured, false), updated_at = now()
WHERE slug IN ('brakes-suspension', 'engine-filters', 'electrical-lighting', 'body-exterior', 'door');

UPDATE public.parts
SET status = 'active', updated_at = now()
WHERE sku IN ('AWP-BR-001', 'AWP-OF-044', 'AWP-AL-208', 'AWP-LT-112');
