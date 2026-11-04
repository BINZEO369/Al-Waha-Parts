-- Honda model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/honda/logo.png', updated_at=now()
WHERE manufacturer_name='Honda' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Honda', seed.slug, '/manufacturers/honda/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Accord','honda-accord','/manufacturers/honda/accord.png',10),
  ('Civic','honda-civic','/manufacturers/honda/civic.png',20),
  ('City','honda-city','/manufacturers/honda/city.png',30),
  ('CR-V','honda-cr-v','/manufacturers/honda/cr-v.png',40),
  ('Pilot','honda-pilot','/manufacturers/honda/pilot.png',50),
  ('Odyssey','honda-odyssey','/manufacturers/honda/odyssey.png',60),
  ('HR-V','honda-hr-v','/manufacturers/honda/hr-v.png',70),
  ('ZR-V','honda-zr-v','/manufacturers/honda/zr-v.png',80),
  ('Civic Type R','honda-civic-type-r','/manufacturers/honda/civic-type-r.png',90),
  ('Accord Coupe','honda-accord-coupe','/manufacturers/honda/accord-coupe.png',100),
  ('Civic Hatchback','honda-civic-hatchback','/manufacturers/honda/civic-hatchback.png',110),
  ('Accord Crosstour','honda-accord-crosstour','/manufacturers/honda/accord-crosstour.png',120),
  ('Jazz','honda-jazz','/manufacturers/honda/jazz.png',130),
  ('Fit','honda-fit','/manufacturers/honda/fit.png',140),
  ('Prelude','honda-prelude','/manufacturers/honda/prelude.png',150),
  ('Legend','honda-legend','/manufacturers/honda/legend.png',160),
  ('S2000','honda-s2000','/manufacturers/honda/s2000.png',170),
  ('CR-Z','honda-cr-z','/manufacturers/honda/cr-z.png',180),
  ('Insight','honda-insight','/manufacturers/honda/insight.png',190),
  ('MR-V','honda-mr-v','/manufacturers/honda/mr-v.png',200),
  ('E','honda-e','/manufacturers/honda/e.png',210),
  ('Civic Coupe','honda-civic-coupe','/manufacturers/honda/civic-coupe.png',220),
  ('Accord Hybrid','honda-accord-hybrid','/manufacturers/honda/accord-hybrid.png',230),
  ('Civic Hybrid','honda-civic-hybrid','/manufacturers/honda/civic-hybrid.png',240),
  ('CR-V Hybrid','honda-cr-v-hybrid','/manufacturers/honda/cr-v-hybrid.png',250),
  ('Passport','honda-passport','/manufacturers/honda/passport.png',260),
  ('Ridgeline','honda-ridgeline','/manufacturers/honda/ridgeline.png',270),
  ('Element','honda-element','/manufacturers/honda/element.png',280),
  ('Stream','honda-stream','/manufacturers/honda/stream.png',290),
  ('Mobilio','honda-mobilio','/manufacturers/honda/mobilio.png',300),
  ('BR-V','honda-br-v','/manufacturers/honda/br-v.png',310),
  ('Freed','honda-freed','/manufacturers/honda/freed.png',320),
  ('Avancier','honda-avancier','/manufacturers/honda/avancier.png',330),
  ('Vezel','honda-vezel','/manufacturers/honda/vezel.png',340),
  ('Integra','honda-integra','/manufacturers/honda/integra.png',350)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Honda' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
