-- Nissan model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/nissan/logo.png', updated_at=now()
WHERE manufacturer_name='Nissan' AND record_type='brand';
UPDATE public.car_brands
SET logo_url='/manufacturers/nissan/logo.png',
    cover_image_url='/manufacturers/nissan/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png',
    vehicle_images=jsonb_build_array('/manufacturers/nissan/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png'),
    gallery_images=jsonb_build_array('/manufacturers/nissan/' || regexp_replace(lower(model_name), '[^a-z0-9]+', '-', 'g') || '.png'), updated_at=now()
WHERE car_brand_id=(SELECT id FROM public.car_brands WHERE manufacturer_name='Nissan' AND record_type='brand' LIMIT 1) AND record_type='vehicle';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Nissan', seed.slug, '/manufacturers/nissan/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Sunny','nissan-sunny','/manufacturers/nissan/sunny.png',10),
  ('Altima','nissan-altima','/manufacturers/nissan/altima.png',20),
  ('Maxima','nissan-maxima','/manufacturers/nissan/maxima.png',30),
  ('Sentra','nissan-sentra','/manufacturers/nissan/sentra.png',40),
  ('Versa','nissan-versa','/manufacturers/nissan/versa.png',50),
  ('Tiida','nissan-tiida','/manufacturers/nissan/tiida.png',60),
  ('Micra','nissan-micra','/manufacturers/nissan/micra.png',70),
  ('Patrol','nissan-patrol','/manufacturers/nissan/patrol.png',80),
  ('Patrol Safari','nissan-patrol-safari','/manufacturers/nissan/patrol-safari.png',90),
  ('Patrol Super Safari','nissan-patrol-super-safari','/manufacturers/nissan/patrol-super-safari.png',100),
  ('X-Terra','nissan-x-terra','/manufacturers/nissan/x-terra.png',110),
  ('X-Trail','nissan-x-trail','/manufacturers/nissan/x-trail.png',120),
  ('Pathfinder','nissan-pathfinder','/manufacturers/nissan/pathfinder.png',130),
  ('Murano','nissan-murano','/manufacturers/nissan/murano.png',140),
  ('Armada','nissan-armada','/manufacturers/nissan/armada.png',150),
  ('Kicks','nissan-kicks','/manufacturers/nissan/kicks.png',160),
  ('Juke','nissan-juke','/manufacturers/nissan/juke.png',170),
  ('Qashqai','nissan-qashqai','/manufacturers/nissan/qashqai.png',180),
  ('Rogue','nissan-rogue','/manufacturers/nissan/rogue.png',190),
  ('Terrano','nissan-terrano','/manufacturers/nissan/terrano.png',200),
  ('Xterra','nissan-xterra','/manufacturers/nissan/xterra.png',210),
  ('Pathfinder Armada','nissan-pathfinder-armada','/manufacturers/nissan/pathfinder-armada.png',220),
  ('Safari','nissan-safari','/manufacturers/nissan/safari.png',230),
  ('Navara','nissan-navara','/manufacturers/nissan/navara.png',240),
  ('Frontier','nissan-frontier','/manufacturers/nissan/frontier.png',250),
  ('Titan','nissan-titan','/manufacturers/nissan/titan.png',260),
  ('Hardbody','nissan-hardbody','/manufacturers/nissan/hardbody.png',270),
  ('D22','nissan-d22','/manufacturers/nissan/d22.png',280),
  ('D40','nissan-d40','/manufacturers/nissan/d40.png',290),
  ('Urvan','nissan-urvan','/manufacturers/nissan/urvan.png',300),
  ('Caravan','nissan-caravan','/manufacturers/nissan/caravan.png',310),
  ('NV350','nissan-nv350','/manufacturers/nissan/nv350.png',320),
  ('Civilian','nissan-civilian','/manufacturers/nissan/civilian.png',330),
  ('Quest','nissan-quest','/manufacturers/nissan/quest.png',340),
  ('Livina','nissan-livina','/manufacturers/nissan/livina.png',350),
  ('Grand Livina','nissan-grand-livina','/manufacturers/nissan/grand-livina.png',360),
  ('Juke Nismo','nissan-juke-nismo','/manufacturers/nissan/juke-nismo.png',370),
  ('GT-R','nissan-gt-r','/manufacturers/nissan/gt-r.png',380),
  ('370Z','nissan-370z','/manufacturers/nissan/370z.png',390),
  ('350Z','nissan-350z','/manufacturers/nissan/350z.png',400),
  ('240SX','nissan-240sx','/manufacturers/nissan/240sx.png',410),
  ('300ZX','nissan-300zx','/manufacturers/nissan/300zx.png',420),
  ('Leaf','nissan-leaf','/manufacturers/nissan/leaf.png',430),
  ('Ariya','nissan-ariya','/manufacturers/nissan/ariya.png',440),
  ('Teana','nissan-teana','/manufacturers/nissan/teana.png',450),
  ('Bluebird','nissan-bluebird','/manufacturers/nissan/bluebird.png',460),
  ('Gloria','nissan-gloria','/manufacturers/nissan/gloria.png',470),
  ('Cedric','nissan-cedric','/manufacturers/nissan/cedric.png',480),
  ('Fuga','nissan-fuga','/manufacturers/nissan/fuga.png',490),
  ('Sunny B15','nissan-sunny-b15','/manufacturers/nissan/sunny-b15.png',500),
  ('Sunny B17','nissan-sunny-b17','/manufacturers/nissan/sunny-b17.png',510)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Nissan' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
