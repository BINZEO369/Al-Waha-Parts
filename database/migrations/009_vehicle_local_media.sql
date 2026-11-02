-- Keep homepage vehicle media on the web app's public asset path.
-- The rows remain database-driven; only the image source moves to versioned local assets.
UPDATE public.vehicles
SET cover_image_url = CASE
  WHEN manufacturer_name = 'Toyota' AND model_name = 'Camry' AND year_start = 2018 THEN '/vehicle/toyota-camry-xv70.jpg'
  WHEN manufacturer_name = 'Toyota' AND model_name = 'Corolla' AND year_start = 2019 THEN '/vehicle/toyota-corolla-e210.jpg'
  WHEN manufacturer_name = 'Nissan' AND model_name = 'Patrol' AND year_start = 2020 THEN '/vehicle/nissan-patrol-y62.jpg'
  ELSE cover_image_url
END
WHERE (manufacturer_name, model_name, year_start) IN (
  ('Toyota', 'Camry', 2018),
  ('Toyota', 'Corolla', 2019),
  ('Nissan', 'Patrol', 2020)
);

UPDATE public.vehicles
SET vehicle_images = jsonb_build_array(cover_image_url)
WHERE cover_image_url IS NOT NULL
  AND cover_image_url LIKE '/vehicle/%'
  AND (vehicle_images IS NULL OR jsonb_array_length(vehicle_images) = 0);
