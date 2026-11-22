-- Al Waha Parts: a manufacturer may own many models.
-- Keep model slugs unique within a manufacturer, not across the entire model table.
BEGIN;

ALTER TABLE public.car_models
  DROP CONSTRAINT IF EXISTS car_models_slug_key;
DROP INDEX IF EXISTS public.car_models_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS car_models_manufacturer_slug_key
  ON public.car_models (manufacturer_id, lower(slug));
CREATE INDEX IF NOT EXISTS car_models_manufacturer_name_idx
  ON public.car_models (manufacturer_id, lower(model_name));

COMMIT;
