-- One part belongs to exactly one vehicle model, with one or more compatible years.
CREATE TABLE IF NOT EXISTS public.part_vehicle_fitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid NOT NULL UNIQUE REFERENCES public.parts(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  compatible_years integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT part_vehicle_fitments_years_valid CHECK (
    cardinality(compatible_years) >= 0
  )
);

CREATE INDEX IF NOT EXISTS part_vehicle_fitments_vehicle_idx
  ON public.part_vehicle_fitments (vehicle_id);

ALTER TABLE public.part_vehicle_fitments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS part_vehicle_fitments_public_read ON public.part_vehicle_fitments;
CREATE POLICY part_vehicle_fitments_public_read
  ON public.part_vehicle_fitments FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON TABLE public.part_vehicle_fitments TO anon, authenticated;

-- Backfill one deterministic model per part. Existing multi-model links are not
-- copied because the new business rule permits only one model per part.
INSERT INTO public.part_vehicle_fitments (part_id, vehicle_id, compatible_years)
SELECT DISTINCT ON (pv.part_id)
  pv.part_id,
  pv.vehicle_id,
  CASE
    WHEN v.year_start IS NOT NULL AND v.year_end IS NOT NULL AND v.year_end >= v.year_start
      THEN ARRAY(SELECT generate_series(v.year_start, v.year_end))
    WHEN v.year_start IS NOT NULL THEN ARRAY[v.year_start]
    ELSE '{}'
  END
FROM public.part_vehicles pv
JOIN public.vehicles v ON v.id = pv.vehicle_id
ORDER BY pv.part_id, pv.vehicle_id
ON CONFLICT (part_id) DO NOTHING;

-- Useful demo fitment data for the seeded catalog, without changing existing prices.
UPDATE public.part_vehicle_fitments f
SET compatible_years = CASE
  WHEN v.manufacturer_name = 'Nissan' AND v.model_name = 'Patrol' THEN ARRAY[2020, 2021, 2022, 2023, 2024]
  WHEN v.manufacturer_name = 'Nissan' AND v.model_name = 'Sunny' THEN ARRAY[2017, 2018, 2019, 2020, 2021, 2022]
  WHEN v.manufacturer_name = 'Toyota' AND v.model_name = 'Camry' THEN ARRAY[2018, 2019, 2020, 2021, 2022, 2023]
  WHEN v.manufacturer_name = 'Toyota' AND v.model_name = 'Corolla' THEN ARRAY[2019, 2020, 2021, 2022, 2023, 2024]
  ELSE f.compatible_years
END,
updated_at = now()
FROM public.vehicles v
WHERE v.id = f.vehicle_id;
