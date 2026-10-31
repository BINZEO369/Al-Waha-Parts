-- Production hardening for anonymous customer bookings and catalog reads.
CREATE INDEX IF NOT EXISTS parts_active_category_position_idx ON public.parts (category_id, status, position, created_at DESC);
CREATE INDEX IF NOT EXISTS parts_search_sku_idx ON public.parts (sku);
CREATE INDEX IF NOT EXISTS vehicles_active_make_model_idx ON public.vehicles (status, manufacturer_name, model_name);
CREATE INDEX IF NOT EXISTS bookings_phone_created_idx ON public.bookings (customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_items_booking_idx ON public.booking_items (booking_id);

CREATE OR REPLACE FUNCTION public.set_booking_item_snapshot()
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
  NEW.line_total := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_item_snapshot_trigger ON public.booking_items;
CREATE TRIGGER booking_item_snapshot_trigger
BEFORE INSERT OR UPDATE ON public.booking_items
FOR EACH ROW EXECUTE FUNCTION public.set_booking_item_snapshot();
