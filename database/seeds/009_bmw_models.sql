-- BMW model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/bmw/logo.png', updated_at=now()
WHERE manufacturer_name='BMW' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'BMW', seed.slug, '/manufacturers/bmw/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('1 Series','bmw-1-series','/manufacturers/bmw/1-series.png',10),
  ('2 Series','bmw-2-series','/manufacturers/bmw/2-series.png',20),
  ('2 Series Gran Coupe','bmw-2-series-gran-coupe','/manufacturers/bmw/2-series-gran-coupe.png',30),
  ('3 Series','bmw-3-series','/manufacturers/bmw/3-series.png',40),
  ('3 Series Gran Turismo','bmw-3-series-gran-turismo','/manufacturers/bmw/3-series-gran-turismo.png',50),
  ('4 Series','bmw-4-series','/manufacturers/bmw/4-series.png',60),
  ('4 Series Gran Coupe','bmw-4-series-gran-coupe','/manufacturers/bmw/4-series-gran-coupe.png',70),
  ('5 Series','bmw-5-series','/manufacturers/bmw/5-series.png',80),
  ('5 Series Gran Turismo','bmw-5-series-gran-turismo','/manufacturers/bmw/5-series-gran-turismo.png',90),
  ('6 Series','bmw-6-series','/manufacturers/bmw/6-series.png',100),
  ('6 Series Gran Coupe','bmw-6-series-gran-coupe','/manufacturers/bmw/6-series-gran-coupe.png',110),
  ('7 Series','bmw-7-series','/manufacturers/bmw/7-series.png',120),
  ('8 Series','bmw-8-series','/manufacturers/bmw/8-series.png',130),
  ('M2','bmw-m2','/manufacturers/bmw/m2.png',140),
  ('M3','bmw-m3','/manufacturers/bmw/m3.png',150),
  ('M4','bmw-m4','/manufacturers/bmw/m4.png',160),
  ('M5','bmw-m5','/manufacturers/bmw/m5.png',170),
  ('M6','bmw-m6','/manufacturers/bmw/m6.png',180),
  ('M8','bmw-m8','/manufacturers/bmw/m8.png',190),
  ('X1','bmw-x1','/manufacturers/bmw/x1.png',200),
  ('X2','bmw-x2','/manufacturers/bmw/x2.png',210),
  ('X3','bmw-x3','/manufacturers/bmw/x3.png',220),
  ('X4','bmw-x4','/manufacturers/bmw/x4.png',230),
  ('X5','bmw-x5','/manufacturers/bmw/x5.png',240),
  ('X6','bmw-x6','/manufacturers/bmw/x6.png',250),
  ('X7','bmw-x7','/manufacturers/bmw/x7.png',260),
  ('XM','bmw-xm','/manufacturers/bmw/xm.png',270),
  ('Z3','bmw-z3','/manufacturers/bmw/z3.png',280),
  ('Z4','bmw-z4','/manufacturers/bmw/z4.png',290),
  ('Z8','bmw-z8','/manufacturers/bmw/z8.png',300),
  ('i3','bmw-i3','/manufacturers/bmw/i3.png',310),
  ('i4','bmw-i4','/manufacturers/bmw/i4.png',320),
  ('i5','bmw-i5','/manufacturers/bmw/i5.png',330),
  ('i7','bmw-i7','/manufacturers/bmw/i7.png',340),
  ('i8','bmw-i8','/manufacturers/bmw/i8.png',350),
  ('iX','bmw-ix','/manufacturers/bmw/ix.png',360),
  ('iX1','bmw-ix1','/manufacturers/bmw/ix1.png',370),
  ('iX2','bmw-ix2','/manufacturers/bmw/ix2.png',380),
  ('iX3','bmw-ix3','/manufacturers/bmw/ix3.png',390),
  ('X5 M','bmw-x5-m','/manufacturers/bmw/x5-m.png',400),
  ('X6 M','bmw-x6-m','/manufacturers/bmw/x6-m.png',410),
  ('X3 M','bmw-x3-m','/manufacturers/bmw/x3-m.png',420),
  ('X4 M','bmw-x4-m','/manufacturers/bmw/x4-m.png',430),
  ('Alpina B3','bmw-alpina-b3','/manufacturers/bmw/alpina-b3.png',440),
  ('Alpina B5','bmw-alpina-b5','/manufacturers/bmw/alpina-b5.png',450),
  ('Alpina B7','bmw-alpina-b7','/manufacturers/bmw/alpina-b7.png',460),
  ('Alpina XB7','bmw-alpina-xb7','/manufacturers/bmw/alpina-xb7.png',470)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='BMW' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
