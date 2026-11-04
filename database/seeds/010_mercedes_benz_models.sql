-- Mercedes-Benz model seed. Creates the parent brand only if it is missing.
-- Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, status)
SELECT 'Mercedes-Benz','mercedes-benz','/manufacturers/mercedes-benz/logo.png',true,0,'brand','active'
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands WHERE slug='mercedes-benz' AND record_type='brand');
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Mercedes-Benz', seed.slug, '/manufacturers/mercedes-benz/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('A-Class','mercedes-benz-a-class','/manufacturers/mercedes-benz/a-class.png',10),
  ('B-Class','mercedes-benz-b-class','/manufacturers/mercedes-benz/b-class.png',20),
  ('C-Class','mercedes-benz-c-class','/manufacturers/mercedes-benz/c-class.png',30),
  ('C-Class Coupe','mercedes-benz-c-class-coupe','/manufacturers/mercedes-benz/c-class-coupe.png',40),
  ('C-Class Cabriolet','mercedes-benz-c-class-cabriolet','/manufacturers/mercedes-benz/c-class-cabriolet.png',50),
  ('E-Class','mercedes-benz-e-class','/manufacturers/mercedes-benz/e-class.png',60),
  ('E-Class Coupe','mercedes-benz-e-class-coupe','/manufacturers/mercedes-benz/e-class-coupe.png',70),
  ('E-Class Cabriolet','mercedes-benz-e-class-cabriolet','/manufacturers/mercedes-benz/e-class-cabriolet.png',80),
  ('S-Class','mercedes-benz-s-class','/manufacturers/mercedes-benz/s-class.png',90),
  ('CLA','mercedes-benz-cla','/manufacturers/mercedes-benz/cla.png',100),
  ('CLS','mercedes-benz-cls','/manufacturers/mercedes-benz/cls.png',110),
  ('CLK','mercedes-benz-clk','/manufacturers/mercedes-benz/clk.png',120),
  ('CL','mercedes-benz-cl','/manufacturers/mercedes-benz/cl.png',130),
  ('SL','mercedes-benz-sl','/manufacturers/mercedes-benz/sl.png',140),
  ('SLK','mercedes-benz-slk','/manufacturers/mercedes-benz/slk.png',150),
  ('SLC','mercedes-benz-slc','/manufacturers/mercedes-benz/slc.png',160),
  ('SLR McLaren','mercedes-benz-slr-mclaren','/manufacturers/mercedes-benz/slr-mclaren.png',170),
  ('SLS AMG','mercedes-benz-sls-amg','/manufacturers/mercedes-benz/sls-amg.png',180),
  ('AMG GT','mercedes-benz-amg-gt','/manufacturers/mercedes-benz/amg-gt.png',190),
  ('GT 4-Door Coupe','mercedes-benz-gt-4-door-coupe','/manufacturers/mercedes-benz/gt-4-door-coupe.png',200),
  ('G-Class','mercedes-benz-g-class','/manufacturers/mercedes-benz/g-class.png',210),
  ('GLA','mercedes-benz-gla','/manufacturers/mercedes-benz/gla.png',220),
  ('GLB','mercedes-benz-glb','/manufacturers/mercedes-benz/glb.png',230),
  ('GLC','mercedes-benz-glc','/manufacturers/mercedes-benz/glc.png',240),
  ('GLC Coupe','mercedes-benz-glc-coupe','/manufacturers/mercedes-benz/glc-coupe.png',250),
  ('GLK','mercedes-benz-glk','/manufacturers/mercedes-benz/glk.png',260),
  ('GLE','mercedes-benz-gle','/manufacturers/mercedes-benz/gle.png',270),
  ('GLE Coupe','mercedes-benz-gle-coupe','/manufacturers/mercedes-benz/gle-coupe.png',280),
  ('M-Class','mercedes-benz-m-class','/manufacturers/mercedes-benz/m-class.png',290),
  ('GL','mercedes-benz-gl','/manufacturers/mercedes-benz/gl.png',300),
  ('GLS','mercedes-benz-gls','/manufacturers/mercedes-benz/gls.png',310),
  ('GLK-Class','mercedes-benz-glk-class','/manufacturers/mercedes-benz/glk-class.png',320),
  ('GLB-Class','mercedes-benz-glb-class','/manufacturers/mercedes-benz/glb-class.png',330),
  ('R-Class','mercedes-benz-r-class','/manufacturers/mercedes-benz/r-class.png',340),
  ('GLC-Class','mercedes-benz-glc-class','/manufacturers/mercedes-benz/glc-class.png',350),
  ('EQB','mercedes-benz-eqb','/manufacturers/mercedes-benz/eqb.png',360),
  ('EQC','mercedes-benz-eqc','/manufacturers/mercedes-benz/eqc.png',370),
  ('EQE','mercedes-benz-eqe','/manufacturers/mercedes-benz/eqe.png',380),
  ('EQS','mercedes-benz-eqs','/manufacturers/mercedes-benz/eqs.png',390),
  ('V-Class','mercedes-benz-v-class','/manufacturers/mercedes-benz/v-class.png',400),
  ('Viano','mercedes-benz-viano','/manufacturers/mercedes-benz/viano.png',410),
  ('Vito','mercedes-benz-vito','/manufacturers/mercedes-benz/vito.png',420),
  ('Sprinter','mercedes-benz-sprinter','/manufacturers/mercedes-benz/sprinter.png',430),
  ('Citan','mercedes-benz-citan','/manufacturers/mercedes-benz/citan.png',440),
  ('X-Class','mercedes-benz-x-class','/manufacturers/mercedes-benz/x-class.png',450),
  ('G-Class AMG','mercedes-benz-g-class-amg','/manufacturers/mercedes-benz/g-class-amg.png',460),
  ('Maybach S-Class','mercedes-benz-maybach-s-class','/manufacturers/mercedes-benz/maybach-s-class.png',470),
  ('Maybach GLS','mercedes-benz-maybach-gls','/manufacturers/mercedes-benz/maybach-gls.png',480),
  ('Maybach EQS SUV','mercedes-benz-maybach-eqs-suv','/manufacturers/mercedes-benz/maybach-eqs-suv.png',490)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE slug='mercedes-benz' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
