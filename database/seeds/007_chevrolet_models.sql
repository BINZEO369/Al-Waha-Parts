-- Chevrolet model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/chevrolet/logo.png', updated_at=now()
WHERE manufacturer_name='Chevrolet' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Chevrolet', seed.slug, '/manufacturers/chevrolet/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Aveo','chevrolet-aveo','/manufacturers/chevrolet/aveo.png',10),
  ('Spark','chevrolet-spark','/manufacturers/chevrolet/spark.png',20),
  ('Sonic','chevrolet-sonic','/manufacturers/chevrolet/sonic.png',30),
  ('Optra','chevrolet-optra','/manufacturers/chevrolet/optra.png',40),
  ('Cruze','chevrolet-cruze','/manufacturers/chevrolet/cruze.png',50),
  ('Malibu','chevrolet-malibu','/manufacturers/chevrolet/malibu.png',60),
  ('Impala','chevrolet-impala','/manufacturers/chevrolet/impala.png',70),
  ('Caprice','chevrolet-caprice','/manufacturers/chevrolet/caprice.png',80),
  ('Lumina','chevrolet-lumina','/manufacturers/chevrolet/lumina.png',90),
  ('Epica','chevrolet-epica','/manufacturers/chevrolet/epica.png',100),
  ('Camaro','chevrolet-camaro','/manufacturers/chevrolet/camaro.png',110),
  ('Corvette','chevrolet-corvette','/manufacturers/chevrolet/corvette.png',120),
  ('Trailblazer','chevrolet-trailblazer','/manufacturers/chevrolet/trailblazer.png',130),
  ('Blazer','chevrolet-blazer','/manufacturers/chevrolet/blazer.png',140),
  ('Equinox','chevrolet-equinox','/manufacturers/chevrolet/equinox.png',150),
  ('Captiva','chevrolet-captiva','/manufacturers/chevrolet/captiva.png',160),
  ('Traverse','chevrolet-traverse','/manufacturers/chevrolet/traverse.png',170),
  ('Tahoe','chevrolet-tahoe','/manufacturers/chevrolet/tahoe.png',180),
  ('Suburban','chevrolet-suburban','/manufacturers/chevrolet/suburban.png',190),
  ('Tahoe Hybrid','chevrolet-tahoe-hybrid','/manufacturers/chevrolet/tahoe-hybrid.png',200),
  ('Trax','chevrolet-trax','/manufacturers/chevrolet/trax.png',210),
  ('Groove','chevrolet-groove','/manufacturers/chevrolet/groove.png',220),
  ('Orlando','chevrolet-orlando','/manufacturers/chevrolet/orlando.png',230),
  ('SSR','chevrolet-ssr','/manufacturers/chevrolet/ssr.png',240),
  ('Avalanche','chevrolet-avalanche','/manufacturers/chevrolet/avalanche.png',250),
  ('Colorado','chevrolet-colorado','/manufacturers/chevrolet/colorado.png',260),
  ('Silverado','chevrolet-silverado','/manufacturers/chevrolet/silverado.png',270),
  ('Silverado HD','chevrolet-silverado-hd','/manufacturers/chevrolet/silverado-hd.png',280),
  ('S10','chevrolet-s10','/manufacturers/chevrolet/s10.png',290),
  ('T-Series','chevrolet-t-series','/manufacturers/chevrolet/t-series.png',300),
  ('Express','chevrolet-express','/manufacturers/chevrolet/express.png',310),
  ('Astro','chevrolet-astro','/manufacturers/chevrolet/astro.png',320),
  ('Uplander','chevrolet-uplander','/manufacturers/chevrolet/uplander.png',330),
  ('Venture','chevrolet-venture','/manufacturers/chevrolet/venture.png',340),
  ('Bolt EV','chevrolet-bolt-ev','/manufacturers/chevrolet/bolt-ev.png',350),
  ('Bolt EUV','chevrolet-bolt-euv','/manufacturers/chevrolet/bolt-euv.png',360),
  ('Equinox EV','chevrolet-equinox-ev','/manufacturers/chevrolet/equinox-ev.png',370),
  ('Blazer EV','chevrolet-blazer-ev','/manufacturers/chevrolet/blazer-ev.png',380),
  ('Spark EUV','chevrolet-spark-euv','/manufacturers/chevrolet/spark-euv.png',390)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Chevrolet' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
