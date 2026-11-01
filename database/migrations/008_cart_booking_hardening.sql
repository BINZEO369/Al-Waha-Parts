-- Production hardening for cart checkout bookings.
-- Safe to run repeatedly on the existing Al Waha Parts schema.

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

CREATE INDEX IF NOT EXISTS booking_items_part_idx ON public.booking_items (part_id);
CREATE INDEX IF NOT EXISTS bookings_source_created_idx ON public.bookings (source, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_booking_item_snapshots()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT p.part_name, p.sku
    INTO NEW.part_name_snapshot, NEW.sku_snapshot
    FROM public.parts p
   WHERE p.id = NEW.part_id;

  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT concat_ws(' ', v.manufacturer_name, v.model_name, NULLIF(v.generation, ''))
      INTO NEW.vehicle_name_snapshot
      FROM public.vehicles v
     WHERE v.id = NEW.vehicle_id;
  END IF;

  NEW.line_total := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_item_snapshot_trigger ON public.booking_items;
CREATE TRIGGER booking_item_snapshot_trigger
BEFORE INSERT OR UPDATE ON public.booking_items
FOR EACH ROW EXECUTE FUNCTION public.set_booking_item_snapshots();
