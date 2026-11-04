-- Toyota model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.

UPDATE public.car_brands
SET logo_url = '/manufacturers/toyota/logo.png', updated_at = now()
WHERE manufacturer_name = 'Toyota' AND record_type = 'brand';

UPDATE public.car_brands
SET logo_url = '/manufacturers/toyota/logo.png',
    cover_image_url = '/manufacturers/toyota/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png',
    vehicle_images = jsonb_build_array('/manufacturers/toyota/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png'),
    gallery_images = jsonb_build_array('/manufacturers/toyota/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png'),
    updated_at = now()
WHERE car_brand_id = (SELECT id FROM public.car_brands WHERE manufacturer_name = 'Toyota' AND record_type = 'brand' LIMIT 1)
  AND record_type = 'vehicle';

INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Toyota', seed.slug, '/manufacturers/toyota/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Yaris','toyota-yaris','/manufacturers/toyota/yaris.png',10,'/manufacturers/toyota/yaris.png'),
  ('Avalon','toyota-avalon','/manufacturers/toyota/avalon.png',20,'/manufacturers/toyota/avalon.png'),
  ('Aurion','toyota-aurion','/manufacturers/toyota/aurion.png',30,'/manufacturers/toyota/aurion.png'),
  ('Cressida','toyota-cressida','/manufacturers/toyota/cressida.png',40,'/manufacturers/toyota/cressida.png'),
  ('Hilux','toyota-hilux','/manufacturers/toyota/hilux.png',50,'/manufacturers/toyota/hilux.png'),
  ('Land Cruiser','toyota-land-cruiser','/manufacturers/toyota/land-cruiser.png',60,'/manufacturers/toyota/land-cruiser.png'),
  ('Land Cruiser 70 Series','toyota-land-cruiser-70-series','/manufacturers/toyota/land-cruiser-70-series.png',70,'/manufacturers/toyota/land-cruiser-70-series.png'),
  ('Land Cruiser Prado','toyota-land-cruiser-prado','/manufacturers/toyota/land-cruiser-prado.png',80,'/manufacturers/toyota/land-cruiser-prado.png'),
  ('Fortuner','toyota-fortuner','/manufacturers/toyota/fortuner.png',90,'/manufacturers/toyota/fortuner.png'),
  ('FJ Cruiser','toyota-fj-cruiser','/manufacturers/toyota/fj-cruiser.png',100,'/manufacturers/toyota/fj-cruiser.png'),
  ('RAV4','toyota-rav4','/manufacturers/toyota/rav4.png',110,'/manufacturers/toyota/rav4.png'),
  ('Highlander','toyota-highlander','/manufacturers/toyota/highlander.png',120,'/manufacturers/toyota/highlander.png'),
  ('Sequoia','toyota-sequoia','/manufacturers/toyota/sequoia.png',130,'/manufacturers/toyota/sequoia.png'),
  ('Rush','toyota-rush','/manufacturers/toyota/rush.png',140,'/manufacturers/toyota/rush.png'),
  ('Innova','toyota-innova','/manufacturers/toyota/innova.png',150,'/manufacturers/toyota/innova.png'),
  ('Avanza','toyota-avanza','/manufacturers/toyota/avanza.png',160,'/manufacturers/toyota/avanza.png'),
  ('Previa','toyota-previa','/manufacturers/toyota/previa.png',170,'/manufacturers/toyota/previa.png'),
  ('Hiace','toyota-hiace','/manufacturers/toyota/hiace.png',180,'/manufacturers/toyota/hiace.png'),
  ('Coaster','toyota-coaster','/manufacturers/toyota/coaster.png',190,'/manufacturers/toyota/coaster.png'),
  ('LiteAce','toyota-liteace','/manufacturers/toyota/liteace.png',200,'/manufacturers/toyota/liteace.png'),
  ('Crown','toyota-crown','/manufacturers/toyota/crown.png',210,'/manufacturers/toyota/crown.png'),
  ('Raize','toyota-raize','/manufacturers/toyota/raize.png',220,'/manufacturers/toyota/raize.png'),
  ('Corolla Cross','toyota-corolla-cross','/manufacturers/toyota/corolla-cross.png',230,'/manufacturers/toyota/corolla-cross.png'),
  ('Veloz','toyota-veloz','/manufacturers/toyota/veloz.png',240,'/manufacturers/toyota/veloz.png'),
  ('Urban Cruiser','toyota-urban-cruiser','/manufacturers/toyota/urban-cruiser.png',250,'/manufacturers/toyota/urban-cruiser.png'),
  ('Supra','toyota-supra','/manufacturers/toyota/supra.png',260,'/manufacturers/toyota/supra.png'),
  ('86','toyota-86','/manufacturers/toyota/86.png',270,'/manufacturers/toyota/86.png'),
  ('GR86','toyota-gr86','/manufacturers/toyota/gr86.png',280,'/manufacturers/toyota/gr86.png'),
  ('Prius','toyota-prius','/manufacturers/toyota/prius.png',290,'/manufacturers/toyota/prius.png'),
  ('C-HR','toyota-c-hr','/manufacturers/toyota/c-hr.png',300,'/manufacturers/toyota/c-hr.png'),
  ('Tundra','toyota-tundra','/manufacturers/toyota/tundra.png',310,'/manufacturers/toyota/tundra.png'),
  ('Tacoma','toyota-tacoma','/manufacturers/toyota/tacoma.png',320,'/manufacturers/toyota/tacoma.png')
) AS seed(model_name, slug, image_path, sort_order, image_path_2)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name = 'Toyota' AND record_type = 'brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id = brand.id AND existing.record_type = 'vehicle' AND lower(existing.model_name) = lower(seed.model_name));
