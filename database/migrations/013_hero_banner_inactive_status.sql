ALTER TABLE public.hero_banners
  DROP CONSTRAINT IF EXISTS hero_banners_status_check;

ALTER TABLE public.hero_banners
  ADD CONSTRAINT hero_banners_status_check
  CHECK (status IN ('draft', 'active', 'inactive', 'archived'));
