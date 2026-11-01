CREATE TABLE IF NOT EXISTS public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  eyebrow text NOT NULL DEFAULT 'Al Waha Parts',
  title text NOT NULL,
  description text,
  cta_label text NOT NULL DEFAULT 'Explore parts',
  cta_href text NOT NULL DEFAULT '/catalog',
  image_url text NOT NULL,
  mobile_image_url text,
  badge_text text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hero_banners_schedule_check CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS hero_banners_active_order_idx ON public.hero_banners (status, sort_order, created_at);

INSERT INTO public.hero_banners (slug, eyebrow, title, description, cta_label, cta_href, image_url, badge_text, status, sort_order)
VALUES
  ('fitment-first','Automotive parts / UAE','Keep every vehicle moving.','A trusted parts desk for workshops, fleets and drivers. Search by vehicle, match the fit, and book with confidence.','Explore parts','/catalog','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/4wKGRTiQ8tMFf6VWfzk9Wk.jpg','FITMENT FIRST','active',10),
  ('fleet-ready','For workshops & fleets','Parts that keep the shift moving.','Tested stock, clear fitment and a parts desk that understands fleet pressure.','Find by vehicle','/vehicles','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/cpqc7BWHb8zAXAWDDKYrtf.jpg','READY FOR WORK','active',20),
  ('book-with-confidence','Parts desk / Dubai','The right part starts with the right match.','Send the part number or vehicle details and our team will confirm availability before you commit.','Book a part','/booking','https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/C8eLMFJi2YW8oWyWSzihEi.jpg','24H RESPONSE','active',30)
ON CONFLICT (slug) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  image_url = EXCLUDED.image_url,
  badge_text = EXCLUDED.badge_text,
  status = 'active',
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
