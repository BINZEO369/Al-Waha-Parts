-- Demo fitments for the seeded catalog. One SKU maps to one model and many years.
INSERT INTO public.part_vehicle_fitments (part_id, vehicle_id, compatible_years, updated_at)
SELECT p.id, v.id, seed.compatible_years, now()
FROM (VALUES
  ('AWP-AL-208', 'Nissan', 'Patrol', ARRAY[2020, 2021, 2022, 2023, 2024]::integer[]),
  ('AWP-BR-001', 'Toyota', 'Camry', ARRAY[2018, 2019, 2020, 2021, 2022, 2023]::integer[]),
  ('AWP-OF-044', 'Toyota', 'Corolla', ARRAY[2019, 2020, 2021, 2022, 2023, 2024]::integer[]),
  ('AWP-LT-112', 'Nissan', 'Sunny', ARRAY[2017, 2018, 2019, 2020, 2021, 2022]::integer[])
) AS seed(sku, manufacturer_name, model_name, compatible_years)
JOIN public.parts p ON p.sku = seed.sku
JOIN public.vehicles v ON v.manufacturer_name = seed.manufacturer_name AND v.model_name = seed.model_name
ON CONFLICT (part_id) DO UPDATE SET
  vehicle_id = EXCLUDED.vehicle_id,
  compatible_years = EXCLUDED.compatible_years,
  updated_at = now();
