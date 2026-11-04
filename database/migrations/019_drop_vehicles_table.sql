-- Retire only the standalone vehicles table. Preserve every model UUID in
-- car_brands and retarget existing foreign keys to those same UUIDs.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.vehicles v
    LEFT JOIN public.car_brands b ON b.id = v.id AND b.record_type = 'vehicle'
    WHERE b.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot drop vehicles: one or more model rows are not present in car_brands';
  END IF;
END $$;

ALTER TABLE public.booking_items
  DROP CONSTRAINT IF EXISTS booking_items_vehicle_id_fkey;
ALTER TABLE public.booking_items
  ADD CONSTRAINT booking_items_vehicle_id_car_brands_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_brands(id) ON DELETE SET NULL;

ALTER TABLE public.homepage_selected_vehicles
  DROP CONSTRAINT IF EXISTS homepage_selected_vehicles_vehicle_id_fkey;
ALTER TABLE public.homepage_selected_vehicles
  ADD CONSTRAINT homepage_selected_vehicles_vehicle_id_car_brands_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;

ALTER TABLE public.part_vehicle_fitments
  DROP CONSTRAINT IF EXISTS part_vehicle_fitments_vehicle_id_fkey;
ALTER TABLE public.part_vehicle_fitments
  ADD CONSTRAINT part_vehicle_fitments_vehicle_id_car_brands_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;

ALTER TABLE public.part_vehicles
  DROP CONSTRAINT IF EXISTS part_vehicles_vehicle_id_fkey;
ALTER TABLE public.part_vehicles
  ADD CONSTRAINT part_vehicles_vehicle_id_car_brands_fkey
  FOREIGN KEY (vehicle_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS part_vehicles_public_read ON public.part_vehicles;
CREATE POLICY part_vehicles_public_read
  ON public.part_vehicles FOR SELECT TO anon, authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM public.parts p
        WHERE p.id = part_vehicles.part_id AND p.status = 'active'
      )
      AND EXISTS (
        SELECT 1 FROM public.car_brands model
        WHERE model.id = part_vehicles.vehicle_id
          AND model.record_type = 'vehicle'
          AND model.status = 'active'
      )
    )
    OR private.is_active_admin()
  );

DROP TABLE public.vehicles;
