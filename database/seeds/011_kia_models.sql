-- Kia model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/kia/logo.png', updated_at=now()
WHERE manufacturer_name='Kia' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Kia', seed.slug, '/manufacturers/kia/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Picanto','kia-picanto','/manufacturers/kia/picanto.png',10),
  ('Rio','kia-rio','/manufacturers/kia/rio.png',20),
  ('Rio Hatchback','kia-rio-hatchback','/manufacturers/kia/rio-hatchback.png',30),
  ('Cerato','kia-cerato','/manufacturers/kia/cerato.png',40),
  ('Cerato Koup','kia-cerato-koup','/manufacturers/kia/cerato-koup.png',50),
  ('Forte','kia-forte','/manufacturers/kia/forte.png',60),
  ('Optima','kia-optima','/manufacturers/kia/optima.png',70),
  ('K5','kia-k5','/manufacturers/kia/k5.png',80),
  ('Cadenza','kia-cadenza','/manufacturers/kia/cadenza.png',90),
  ('K7','kia-k7','/manufacturers/kia/k7.png',100),
  ('K8','kia-k8','/manufacturers/kia/k8.png',110),
  ('Quoris','kia-quoris','/manufacturers/kia/quoris.png',120),
  ('K900','kia-k900','/manufacturers/kia/k900.png',130),
  ('Opirus','kia-opirus','/manufacturers/kia/opirus.png',140),
  ('Soul','kia-soul','/manufacturers/kia/soul.png',150),
  ('Venga','kia-venga','/manufacturers/kia/venga.png',160),
  ('Carens','kia-carens','/manufacturers/kia/carens.png',170),
  ('Carnival','kia-carnival','/manufacturers/kia/carnival.png',180),
  ('Sedona','kia-sedona','/manufacturers/kia/sedona.png',190),
  ('Sportage','kia-sportage','/manufacturers/kia/sportage.png',200),
  ('Sorento','kia-sorento','/manufacturers/kia/sorento.png',210),
  ('Mohave','kia-mohave','/manufacturers/kia/mohave.png',220),
  ('Telluride','kia-telluride','/manufacturers/kia/telluride.png',230),
  ('Seltos','kia-seltos','/manufacturers/kia/seltos.png',240),
  ('Sonet','kia-sonet','/manufacturers/kia/sonet.png',250),
  ('Pegas','kia-pegas','/manufacturers/kia/pegas.png',260),
  ('K3','kia-k3','/manufacturers/kia/k3.png',270),
  ('K4','kia-k4','/manufacturers/kia/k4.png',280),
  ('Stinger','kia-stinger','/manufacturers/kia/stinger.png',290),
  ('Stonic','kia-stonic','/manufacturers/kia/stonic.png',300),
  ('Niro','kia-niro','/manufacturers/kia/niro.png',310),
  ('EV3','kia-ev3','/manufacturers/kia/ev3.png',320),
  ('EV5','kia-ev5','/manufacturers/kia/ev5.png',330),
  ('EV6','kia-ev6','/manufacturers/kia/ev6.png',340),
  ('EV9','kia-ev9','/manufacturers/kia/ev9.png',350),
  ('Tasman','kia-tasman','/manufacturers/kia/tasman.png',360),
  ('Bongo','kia-bongo','/manufacturers/kia/bongo.png',370)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Kia' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
