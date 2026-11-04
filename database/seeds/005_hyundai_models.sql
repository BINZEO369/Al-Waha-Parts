-- Hyundai model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/hyundai/logo.png', updated_at=now()
WHERE manufacturer_name='Hyundai' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Hyundai', seed.slug, '/manufacturers/hyundai/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Accent','hyundai-accent','/manufacturers/hyundai/accent.png',10),
  ('Elantra','hyundai-elantra','/manufacturers/hyundai/elantra.png',20),
  ('Sonata','hyundai-sonata','/manufacturers/hyundai/sonata.png',30),
  ('Azera','hyundai-azera','/manufacturers/hyundai/azera.png',40),
  ('Grandeur','hyundai-grandeur','/manufacturers/hyundai/grandeur.png',50),
  ('Tucson','hyundai-tucson','/manufacturers/hyundai/tucson.png',60),
  ('Santa Fe','hyundai-santa-fe','/manufacturers/hyundai/santa-fe.png',70),
  ('Grand Santa Fe','hyundai-grand-santa-fe','/manufacturers/hyundai/grand-santa-fe.png',80),
  ('Palisade','hyundai-palisade','/manufacturers/hyundai/palisade.png',90),
  ('Creta','hyundai-creta','/manufacturers/hyundai/creta.png',100),
  ('Kona','hyundai-kona','/manufacturers/hyundai/kona.png',110),
  ('Venue','hyundai-venue','/manufacturers/hyundai/venue.png',120),
  ('Veloster','hyundai-veloster','/manufacturers/hyundai/veloster.png',130),
  ('Genesis','hyundai-genesis','/manufacturers/hyundai/genesis.png',140),
  ('Genesis Coupe','hyundai-genesis-coupe','/manufacturers/hyundai/genesis-coupe.png',150),
  ('Equus','hyundai-equus','/manufacturers/hyundai/equus.png',160),
  ('Centennial','hyundai-centennial','/manufacturers/hyundai/centennial.png',170),
  ('Veracruz','hyundai-veracruz','/manufacturers/hyundai/veracruz.png',180),
  ('Terracan','hyundai-terracan','/manufacturers/hyundai/terracan.png',190),
  ('Santa Cruz','hyundai-santa-cruz','/manufacturers/hyundai/santa-cruz.png',200),
  ('H-1','hyundai-h-1','/manufacturers/hyundai/h-1.png',210),
  ('Grand Starex','hyundai-grand-starex','/manufacturers/hyundai/grand-starex.png',220),
  ('Staria','hyundai-staria','/manufacturers/hyundai/staria.png',230),
  ('H100','hyundai-h100','/manufacturers/hyundai/h100.png',240),
  ('i10','hyundai-i10','/manufacturers/hyundai/i10.png',250),
  ('Grand i10','hyundai-grand-i10','/manufacturers/hyundai/grand-i10.png',260),
  ('i20','hyundai-i20','/manufacturers/hyundai/i20.png',270),
  ('i30','hyundai-i30','/manufacturers/hyundai/i30.png',280),
  ('i40','hyundai-i40','/manufacturers/hyundai/i40.png',290),
  ('Matrix','hyundai-matrix','/manufacturers/hyundai/matrix.png',300),
  ('Trajet','hyundai-trajet','/manufacturers/hyundai/trajet.png',310),
  ('Ioniq','hyundai-ioniq','/manufacturers/hyundai/ioniq.png',320),
  ('Ioniq 5','hyundai-ioniq-5','/manufacturers/hyundai/ioniq-5.png',330),
  ('Ioniq 6','hyundai-ioniq-6','/manufacturers/hyundai/ioniq-6.png',340),
  ('Elantra Hybrid','hyundai-elantra-hybrid','/manufacturers/hyundai/elantra-hybrid.png',350),
  ('Sonata Hybrid','hyundai-sonata-hybrid','/manufacturers/hyundai/sonata-hybrid.png',360)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Hyundai' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
