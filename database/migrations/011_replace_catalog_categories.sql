-- Replace the legacy catalog taxonomy with the 20 approved Al Waha Parts categories.
-- Existing products are preserved: their old category_id is cleared before removal.

UPDATE public.parts
SET category_id = NULL
WHERE category_id IS NOT NULL;

DELETE FROM public.popular_categories;
DELETE FROM public.parts_categories;

INSERT INTO public.parts_categories
  (category_name, slug, description, status, image_url, is_featured, sort_order)
VALUES
  ('Engine & Engine Parts', 'engine-engine-parts', 'Engine assemblies, internals and service parts', 'active', '/categories/img1.png', true, 1),
  ('Transmission & Drivetrain', 'transmission-drivetrain', 'Transmission, clutch, differential and drivetrain parts', 'active', '/categories/img2.png', true, 2),
  ('Suspension & Steering', 'suspension-steering', 'Suspension, steering and handling components', 'active', '/categories/img3.png', true, 3),
  ('Braking System', 'braking-system', 'Brake pads, discs, calipers and braking components', 'active', '/categories/img4.png', true, 4),
  ('Electrical & Electronics', 'electrical-electronics', 'Automotive electrical and electronic components', 'active', '/categories/img5.png', true, 5),
  ('Cooling System', 'cooling-system', 'Radiators, cooling fans, pumps and cooling parts', 'active', '/categories/img6.png', true, 6),
  ('Fuel System', 'fuel-system', 'Fuel pumps, injectors, tanks and fuel delivery parts', 'active', '/categories/img7.png', true, 7),
  ('Air Intake & Exhaust', 'air-intake-exhaust', 'Air intake, turbo, exhaust and emission parts', 'active', '/categories/img8.png', true, 8),
  ('Body Parts & Exterior', 'body-parts-exterior', 'Panels, mirrors, bumpers and exterior parts', 'active', '/categories/img9.png', true, 9),
  ('Interior Parts & Accessories', 'interior-parts-accessories', 'Interior trim, comfort and cabin accessories', 'active', '/categories/img10.png', true, 10),
  ('Lighting & Lamps', 'lighting-lamps', 'Headlights, lamps, indicators and lighting parts', 'active', '/categories/img11.png', true, 11),
  ('Wheels & Tyres', 'wheels-tyres', 'Wheels, rims, tyres and wheel accessories', 'active', '/categories/img12.png', true, 12),
  ('Battery & Charging', 'battery-charging', 'Batteries, chargers, alternators and charging parts', 'active', '/categories/img13.png', true, 13),
  ('Filters & Maintenance', 'filters-maintenance', 'Filters, service kits and maintenance essentials', 'active', '/categories/img14.png', true, 14),
  ('HVAC & Air Conditioning', 'hvac-air-conditioning', 'Air conditioning, heating and climate control parts', 'active', '/categories/img15.png', true, 15),
  ('Safety & Security', 'safety-security', 'Safety, alarms, locks and security components', 'active', '/categories/img16.png', true, 16),
  ('Performance Parts', 'performance-parts', 'Performance, tuning and upgrade components', 'active', '/categories/img17.png', true, 17),
  ('Car Accessories', 'car-accessories', 'Practical and lifestyle accessories for vehicles', 'active', '/categories/img18.png', true, 18),
  ('Oils & Fluids', 'oils-fluids', 'Engine oils, coolants, brake fluids and lubricants', 'active', '/categories/img19.png', true, 19),
  ('Tools & Equipment', 'tools-equipment', 'Workshop tools, equipment and diagnostic products', 'active', '/categories/img20.png', true, 20)
ON CONFLICT (slug) DO UPDATE SET
  category_name = EXCLUDED.category_name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
