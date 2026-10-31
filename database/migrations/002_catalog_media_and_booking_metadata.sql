-- Applied to the managed Al Waha Parts Supabase project.
-- The project already contains public.parts, parts_categories, vehicles,
-- bookings, booking_items and admins from the existing Supabase schema.

ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS primary_image_url text,
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_months integer,
  ADD COLUMN IF NOT EXISTS min_order_quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reorder_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_location text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AED',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.parts_categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS icon_name text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS total_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AED',
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS customer_city text,
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash_on_delivery',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website';

ALTER TABLE public.booking_items
  ADD COLUMN IF NOT EXISTS part_name_snapshot text,
  ADD COLUMN IF NOT EXISTS sku_snapshot text,
  ADD COLUMN IF NOT EXISTS vehicle_name_snapshot text,
  ADD COLUMN IF NOT EXISTS line_total numeric NOT NULL DEFAULT 0;

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS parts_slug_unique_idx ON public.parts (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_slug_unique_idx ON public.vehicles (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS parts_catalog_idx ON public.parts (status, is_featured, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_created_idx ON public.bookings (booking_status, created_at DESC);
