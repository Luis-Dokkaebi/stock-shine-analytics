CREATE OR REPLACE FUNCTION public.add_item_to_order_atomic(
  p_order_id UUID,
  p_part_id UUID,
  p_quantity INTEGER,
  p_assigned_by TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_existing_item_id UUID;
  v_current_fulfilled INTEGER;
  v_current_required INTEGER;
  v_new_fulfilled INTEGER;
  v_new_required INTEGER;
BEGIN
  -- 1. Check and Lock Stock (Always lock Part first to prevent deadlocks)
  SELECT stock INTO v_current_stock
  FROM public.parts
  WHERE id = p_part_id
  FOR UPDATE;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Part not found';
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente';
  END IF;

  -- 2. Deduct Stock
  UPDATE public.parts
  SET stock = stock - p_quantity
  WHERE id = p_part_id;

  -- 3. Handle Order Item
  SELECT id, quantity_fulfilled, quantity_required
  INTO v_existing_item_id, v_current_fulfilled, v_current_required
  FROM public.order_items
  WHERE order_id = p_order_id AND part_id = p_part_id;

  IF v_existing_item_id IS NOT NULL THEN
    v_new_fulfilled := v_current_fulfilled + p_quantity;
    v_new_required := GREATEST(v_current_required, v_new_fulfilled);

    UPDATE public.order_items
    SET
      quantity_fulfilled = v_new_fulfilled,
      quantity_required = v_new_required
    WHERE id = v_existing_item_id;
  ELSE
    INSERT INTO public.order_items (order_id, part_id, quantity_required, quantity_fulfilled)
    VALUES (p_order_id, p_part_id, p_quantity, p_quantity);
  END IF;

  -- 4. Log Fulfillment
  INSERT INTO public.fulfillment_logs (order_id, part_id, quantity, operation_type, assigned_by)
  VALUES (p_order_id, p_part_id, p_quantity, 'add', p_assigned_by);

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_item_from_order_atomic(
  p_order_id UUID,
  p_part_id UUID,
  p_quantity INTEGER,
  p_removed_by TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_item_id UUID;
  v_current_fulfilled INTEGER;
  v_new_fulfilled INTEGER;
  v_current_stock INTEGER; -- Variable to hold stock reading
BEGIN
  -- 1. Lock Part First (Prevent Deadlock)
  SELECT stock INTO v_current_stock
  FROM public.parts
  WHERE id = p_part_id
  FOR UPDATE;

  -- 2. Return Stock
  UPDATE public.parts
  SET stock = stock + p_quantity
  WHERE id = p_part_id;

  -- 3. Get and Lock Order Item
  SELECT id, quantity_fulfilled
  INTO v_existing_item_id, v_current_fulfilled
  FROM public.order_items
  WHERE order_id = p_order_id AND part_id = p_part_id
  FOR UPDATE;

  IF v_existing_item_id IS NULL THEN
    RAISE EXCEPTION 'Item not found in order';
  END IF;

  IF v_current_fulfilled < p_quantity THEN
    -- Rollback is implicit on exception, but we should be careful.
    -- Raising exception here will rollback the transaction including Part update.
    RAISE EXCEPTION 'Cannot remove more than fulfilled quantity';
  END IF;

  -- 4. Update Order Item
  v_new_fulfilled := v_current_fulfilled - p_quantity;

  IF v_new_fulfilled <= 0 THEN
    DELETE FROM public.order_items WHERE id = v_existing_item_id;
  ELSE
    UPDATE public.order_items
    SET
      quantity_fulfilled = v_new_fulfilled,
      quantity_required = v_new_fulfilled
    WHERE id = v_existing_item_id;
  END IF;

  -- 5. Log Fulfillment
  INSERT INTO public.fulfillment_logs (order_id, part_id, quantity, operation_type, assigned_by)
  VALUES (p_order_id, p_part_id, -p_quantity, 'remove', p_removed_by);

  RETURN TRUE;
END;
$$;

-- Ensure the ID generation function and trigger exist
CREATE OR REPLACE FUNCTION public.generate_or_number()
RETURNS TRIGGER AS $$
DECLARE
  last_num INTEGER;
  new_num TEXT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(or_number, '-', 3) AS INTEGER)), 0
  ) INTO last_num
  FROM public.orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  new_num := 'OR-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD((last_num + 1)::TEXT, 3, '0');
  NEW.or_number := new_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS generate_order_number ON public.orders;

CREATE TRIGGER generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.or_number IS NULL OR NEW.or_number = '')
EXECUTE FUNCTION public.generate_or_number();
