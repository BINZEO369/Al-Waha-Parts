-- Database-managed car brand logos for the homepage strip.
CREATE TABLE IF NOT EXISTS public.car_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS car_brands_active_order_idx
  ON public.car_brands (is_active, sort_order, manufacturer_name);

ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS car_brands_public_active_read ON public.car_brands;
CREATE POLICY car_brands_public_active_read
  ON public.car_brands
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON TABLE public.car_brands TO anon, authenticated;

INSERT INTO public.car_brands (manufacturer_name, slug, logo_url, sort_order)
VALUES
  ('Toyota', 'toyota', '/car-brands/toyota.svg', 10),
  ('Nissan', 'nissan', '/car-brands/nissan.svg', 20),
  ('Honda', 'honda', '/car-brands/honda.svg', 30),
  ('Hyundai', 'hyundai', '/car-brands/hyundai.svg', 40),
  ('Kia', 'kia', '/car-brands/kia.svg', 50),
  ('Mitsubishi', 'mitsubishi', '/car-brands/mitsubishi.svg', 60),
  ('Mazda', 'mazda', '/car-brands/mazda.svg', 70),
  ('BMW', 'bmw', '/car-brands/bmw.svg', 80),
  ('Ford', 'ford', '/car-brands/ford.svg', 90),
  ('Chevrolet', 'chevrolet', '/car-brands/chevrolet.svg', 100)
ON CONFLICT (slug) DO NOTHING;
