-- Ford model seed. Uses existing car_brands columns only; no schema changes.
-- Placeholder PNGs can be replaced later without changing database records.
UPDATE public.car_brands SET logo_url='/manufacturers/ford/logo.png', updated_at=now()
WHERE manufacturer_name='Ford' AND record_type='brand';
INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, is_active, sort_order, record_type, car_brand_id, model_name, status, cover_image_url, vehicle_images, gallery_images, is_featured)
SELECT 'Ford', seed.slug, '/manufacturers/ford/logo.png', true, seed.sort_order, 'vehicle', brand.id, seed.model_name, 'active', seed.image_path, jsonb_build_array(seed.image_path), jsonb_build_array(seed.image_path), false
FROM (VALUES
  ('Crown Victoria','ford-crown-victoria','/manufacturers/ford/crown-victoria.png',10),
  ('Grand Marquis','ford-grand-marquis','/manufacturers/ford/grand-marquis.png',20),
  ('Taurus','ford-taurus','/manufacturers/ford/taurus.png',30),
  ('Five Hundred','ford-five-hundred','/manufacturers/ford/five-hundred.png',40),
  ('Fusion','ford-fusion','/manufacturers/ford/fusion.png',50),
  ('Mondeo','ford-mondeo','/manufacturers/ford/mondeo.png',60),
  ('Focus','ford-focus','/manufacturers/ford/focus.png',70),
  ('Fiesta','ford-fiesta','/manufacturers/ford/fiesta.png',80),
  ('Escort','ford-escort','/manufacturers/ford/escort.png',90),
  ('Mustang','ford-mustang','/manufacturers/ford/mustang.png',100),
  ('GT','ford-gt','/manufacturers/ford/gt.png',110),
  ('Thunderbird','ford-thunderbird','/manufacturers/ford/thunderbird.png',120),
  ('Explorer','ford-explorer','/manufacturers/ford/explorer.png',130),
  ('Expedition','ford-expedition','/manufacturers/ford/expedition.png',140),
  ('Excursion','ford-excursion','/manufacturers/ford/excursion.png',150),
  ('Edge','ford-edge','/manufacturers/ford/edge.png',160),
  ('Escape','ford-escape','/manufacturers/ford/escape.png',170),
  ('EcoSport','ford-ecosport','/manufacturers/ford/ecosport.png',180),
  ('Territory','ford-territory','/manufacturers/ford/territory.png',190),
  ('Everest','ford-everest','/manufacturers/ford/everest.png',200),
  ('Bronco','ford-bronco','/manufacturers/ford/bronco.png',210),
  ('Bronco Sport','ford-bronco-sport','/manufacturers/ford/bronco-sport.png',220),
  ('Flex','ford-flex','/manufacturers/ford/flex.png',230),
  ('Freestyle','ford-freestyle','/manufacturers/ford/freestyle.png',240),
  ('Freestar','ford-freestar','/manufacturers/ford/freestar.png',250),
  ('Windstar','ford-windstar','/manufacturers/ford/windstar.png',260),
  ('Ranger','ford-ranger','/manufacturers/ford/ranger.png',270),
  ('Ranger Raptor','ford-ranger-raptor','/manufacturers/ford/ranger-raptor.png',280),
  ('F-150','ford-f-150','/manufacturers/ford/f-150.png',290),
  ('F-150 Raptor','ford-f-150-raptor','/manufacturers/ford/f-150-raptor.png',300),
  ('F-250','ford-f-250','/manufacturers/ford/f-250.png',310),
  ('F-350','ford-f-350','/manufacturers/ford/f-350.png',320),
  ('F-450','ford-f-450','/manufacturers/ford/f-450.png',330),
  ('F-550','ford-f-550','/manufacturers/ford/f-550.png',340),
  ('Maverick','ford-maverick','/manufacturers/ford/maverick.png',350),
  ('Transit','ford-transit','/manufacturers/ford/transit.png',360),
  ('Transit Connect','ford-transit-connect','/manufacturers/ford/transit-connect.png',370),
  ('Tourneo Connect','ford-tourneo-connect','/manufacturers/ford/tourneo-connect.png',380),
  ('Tourneo Custom','ford-tourneo-custom','/manufacturers/ford/tourneo-custom.png',390),
  ('E-Series','ford-e-series','/manufacturers/ford/e-series.png',400),
  ('Econoline','ford-econoline','/manufacturers/ford/econoline.png',410),
  ('Courier','ford-courier','/manufacturers/ford/courier.png',420),
  ('Aerostar','ford-aerostar','/manufacturers/ford/aerostar.png',430)
) AS seed(model_name, slug, image_path, sort_order)
CROSS JOIN (SELECT id FROM public.car_brands WHERE manufacturer_name='Ford' AND record_type='brand' LIMIT 1) brand
WHERE NOT EXISTS (SELECT 1 FROM public.car_brands existing WHERE existing.car_brand_id=brand.id AND existing.record_type='vehicle' AND lower(existing.model_name)=lower(seed.model_name));
