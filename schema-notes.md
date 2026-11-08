# Production schema audit — 2026-11-08

Supabase project: `pitxdheggaxxhzqdbpln`.

Relevant real tables:
- `manufacturers`: id, manufacturer_name, slug, logo_url, company_description, country, founded_year, status(active/inactive/draft), is_active, sort_order.
- `car_models`: id, manufacturer_id FK -> manufacturers.id, model_name, slug, generation, chassis_code, year_start/end, engine_code, engine_capacity, fuel_type, transmission, vehicle_type, cover_image_url, vehicle_images, gallery_images, status(active/inactive/draft), is_featured, sort_order, SEO fields.
- `parts`: manufacturer_id FK -> manufacturers.id, model_id FK -> car_models.id, primary_image_url, image_urls jsonb, plus inventory fields.
- `part_model_fitments`: part_id FK -> parts.id, model_id FK -> car_models.id, compatible_years int[]; 8 rows.
- `booking_items.vehicle_id` FK -> car_models.id.
- `homepage_selected_vehicles.vehicle_id` FK -> car_models.id.
- `admins`: one active super_admin, email `web-alwaha-1@binzeo.com`, auth user matches.
- Admin Vercel project: `al-waha-parts-admin`, id `prj_LPmngUviW8onmgbc676Hd2RWLXv0`; production domain `admin.al-waha.shop` verified.

Existing API had stale references to nonexistent `car_brands`, `part_vehicle_fitments`, and legacy `record_type`; migration work is replacing them with normalized tables and IDs.
