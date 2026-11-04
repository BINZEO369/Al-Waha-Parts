-- Preserve booking history while permitting permanent part/model removal, and
-- ensure booking creation reads model labels from the unified car_brands table.

UPDATE public.booking_items AS item
SET part_name_snapshot = COALESCE(item.part_name_snapshot, part.part_name),
    sku_snapshot = COALESCE(item.sku_snapshot, part.sku)
FROM public.parts AS part
WHERE item.part_id = part.id
  AND (item.part_name_snapshot IS NULL OR item.sku_snapshot IS NULL);

UPDATE public.booking_items AS item
SET vehicle_name_snapshot = COALESCE(
  item.vehicle_name_snapshot,
  concat_ws(' ', model.manufacturer_name, model.model_name, NULLIF(model.generation, ''))
)
FROM public.car_brands AS model
WHERE item.vehicle_id = model.id
  AND model.record_type = 'vehicle'
  AND item.vehicle_name_snapshot IS NULL;

ALTER TABLE public.booking_items
  ALTER COLUMN part_id DROP NOT NULL;

ALTER TABLE public.booking_items
  DROP CONSTRAINT IF EXISTS booking_items_part_id_fkey;
ALTER TABLE public.booking_items
  ADD CONSTRAINT booking_items_part_id_fkey
  FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE SET NULL;

-- A part removal nulls its live relation but retains the immutable snapshot.
CREATE OR REPLACE FUNCTION public.set_booking_item_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.part_id IS NOT NULL THEN
    SELECT part_name, sku
      INTO NEW.part_name_snapshot, NEW.sku_snapshot
      FROM public.parts
     WHERE id = NEW.part_id;
  END IF;
  NEW.line_total := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$function$;

-- Keep the existing RPC signature and security while switching the model lookup
-- from the removed vehicles table to vehicle rows in car_brands.
CREATE OR REPLACE FUNCTION public.create_booking(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT NULL::text,
  p_customer_note text DEFAULT NULL::text,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_shipping_address text DEFAULT NULL::text,
  p_customer_city text DEFAULT NULL::text,
  p_delivery_method text DEFAULT 'pickup'::text,
  p_payment_method text DEFAULT 'cash_on_delivery'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  v_booking_id uuid;
  v_booking_number text;
  v_total numeric := 0;
  v_item jsonb;
  v_part public.parts%ROWTYPE;
  v_quantity integer;
  v_vehicle_name text;
  v_line_total numeric;
BEGIN
  IF coalesce(trim(p_customer_name), '') = '' OR coalesce(trim(p_customer_phone), '') = '' THEN
    RAISE EXCEPTION 'Customer name and phone are required';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one booking item is required';
  END IF;

  v_booking_number := 'AWP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  INSERT INTO public.bookings (
    booking_number, customer_name, customer_phone, customer_email, customer_note,
    shipping_address, customer_city, delivery_method, payment_method, source, total_amount
  )
  VALUES (
    v_booking_number, trim(p_customer_name), trim(p_customer_phone),
    nullif(trim(p_customer_email), ''), nullif(trim(p_customer_note), ''),
    nullif(trim(p_shipping_address), ''), nullif(trim(p_customer_city), ''),
    coalesce(nullif(trim(p_delivery_method), ''), 'pickup'),
    coalesce(nullif(trim(p_payment_method), ''), 'cash_on_delivery'), 'website', 0
  )
  RETURNING id INTO v_booking_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    SELECT * INTO v_part
      FROM public.parts
     WHERE id = (v_item->>'part_id')::uuid
       AND status = 'active'
     LIMIT 1;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Part not found or unavailable';
    END IF;

    v_line_total := coalesce(v_part.sale_price, v_part.price, 0) * v_quantity;
    v_vehicle_name := NULL;
    IF nullif(v_item->>'vehicle_id', '') IS NOT NULL THEN
      SELECT concat_ws(' ', model.manufacturer_name, model.model_name, NULLIF(model.generation, ''))
        INTO v_vehicle_name
        FROM public.car_brands AS model
       WHERE model.id = (v_item->>'vehicle_id')::uuid
         AND model.record_type = 'vehicle'
         AND model.status = 'active'
       LIMIT 1;
    END IF;

    INSERT INTO public.booking_items (
      booking_id, part_id, vehicle_id, quantity, unit_price,
      part_name_snapshot, sku_snapshot, vehicle_name_snapshot, line_total
    )
    VALUES (
      v_booking_id, v_part.id, nullif(v_item->>'vehicle_id', '')::uuid,
      v_quantity, coalesce(v_part.sale_price, v_part.price, 0),
      v_part.part_name, v_part.sku, v_vehicle_name, v_line_total
    );
    v_total := v_total + v_line_total;
  END LOOP;

  UPDATE public.bookings SET total_amount = v_total WHERE id = v_booking_id;
  RETURN jsonb_build_object(
    'id', v_booking_id,
    'booking_number', v_booking_number,
    'total_amount', v_total,
    'currency', 'AED'
  );
END;
$function$;
