-- Idempotent default catalog seed for local/staging environments.
-- Customer accounts are intentionally not used; bookings only require contact details.

INSERT INTO public.parts_categories (category_name, slug, description, status, image_url, is_featured, sort_order)
VALUES
  ('Brakes & Suspension', 'brakes-suspension', 'Brake pads, discs and suspension essentials', 'active', 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/wuTfX6XaptYuNd75uGVpAB.jpg', true, 10),
  ('Engine & Filters', 'engine-filters', 'Engine service and filtration parts', 'active', 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/t3TgG2uRfxhk97wyfLGX3F.jpg', true, 20),
  ('Electrical & Lighting', 'electrical-lighting', 'Alternators, lamps and electrical parts', 'active', 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/C8eLMFJi2YW8oWyWSzihEi.jpg', true, 30)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, status = 'active', is_featured = true, updated_at = now();

INSERT INTO public.parts (part_name, category_id, brand_name, sku, oem_number, description, condition, tested_status, price, sale_price, stock_quantity, status, slug, primary_image_url, image_urls, tags, is_featured, sort_order, warranty_months, currency)
SELECT seed.part_name, category.id, seed.brand_name, seed.sku, seed.oem_number, seed.description, seed.condition, 'tested', seed.price, seed.sale_price, seed.stock_quantity, 'active', seed.slug, seed.image_url, jsonb_build_array(seed.image_url), seed.tags, true, seed.sort_order, seed.warranty_months, 'SAR'
FROM (VALUES
  ('Front Brake Pad Set','brakes-suspension','Brembo','AWP-BR-001','04465-33471','Premium ceramic front brake pad set','new',280::numeric,245::numeric,8,'front-brake-pad-set','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/wuTfX6XaptYuNd75uGVpAB.jpg',ARRAY['brakes','ceramic'],10,12),
  ('Oil Filter Housing','engine-filters','Mann','AWP-OF-044','15620-36020','Aluminum oil filter housing with seal kit','new',145::numeric,NULL::numeric,12,'oil-filter-housing','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/t3TgG2uRfxhk97wyfLGX3F.jpg',ARRAY['engine','filter'],20,6),
  ('Alternator Assembly','electrical-lighting','Bosch','AWP-AL-208','27060-0V250','Tested alternator assembly for fleet vehicles','refurbished',640::numeric,590::numeric,3,'alternator-assembly','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/cpqc7BWHb8zAXAWDDKYrtf.jpg',ARRAY['electrical','alternator'],30,3),
  ('LED Headlight Assembly','electrical-lighting','Al Waha Select','AWP-LT-112','81150-06A30','LED headlight assembly with projector beam','new',920::numeric,850::numeric,5,'led-headlight-assembly','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/C8eLMFJi2YW8oWyWSzihEi.jpg',ARRAY['lighting','led'],40,12)
) AS seed(part_name, category_slug, brand_name, sku, oem_number, description, condition, price, sale_price, stock_quantity, slug, image_url, tags, sort_order, warranty_months)
JOIN public.parts_categories category ON category.slug = seed.category_slug
ON CONFLICT (sku) DO UPDATE SET primary_image_url = EXCLUDED.primary_image_url, image_urls = EXCLUDED.image_urls, status = 'active', stock_quantity = EXCLUDED.stock_quantity, updated_at = now();

INSERT INTO public.vehicles (manufacturer_name, model_name, generation, chassis_code, year_start, year_end, fuel_type, transmission, vehicle_type, status, cover_image_url, is_featured, sort_order)
SELECT seed.manufacturer_name, seed.model_name, seed.generation, seed.chassis_code, seed.year_start, seed.year_end, seed.fuel_type, seed.transmission, seed.vehicle_type, 'active', seed.cover_image_url, true, seed.sort_order
FROM (VALUES
  ('Toyota','Camry','XV70','AXVA70',2018,2023,'Petrol','Automatic','Sedan','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/cDY2sUGsYBA4vQ4pGY3Qva.jpg',10),
  ('Toyota','Corolla','E210','MZEA12',2019,2024,'Petrol','CVT','Sedan','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/4wKGRTiQ8tMFf6VWfzk9Wk.jpg',20),
  ('Nissan','Patrol','Y62','Y62',2020,2024,'Petrol','Automatic','SUV','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/C8eLMFJi2YW8oWyWSzihEi.jpg',30)
) AS seed(manufacturer_name, model_name, generation, chassis_code, year_start, year_end, fuel_type, transmission, vehicle_type, cover_image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles existing WHERE existing.manufacturer_name = seed.manufacturer_name AND existing.model_name = seed.model_name AND existing.year_start = seed.year_start);
