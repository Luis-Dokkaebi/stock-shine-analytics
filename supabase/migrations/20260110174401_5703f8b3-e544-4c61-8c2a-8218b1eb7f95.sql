-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects (public read, no delete)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" 
ON public.projects 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update projects" 
ON public.projects 
FOR UPDATE 
USING (true);

-- NO DELETE POLICY - Projects cannot be deleted

-- Create orders table (Órdenes de Trabajo)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  or_number TEXT NOT NULL UNIQUE,
  technician TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('HVAC', 'ELECTROMECANICO', 'HERRERIA', 'MAQUINARIA PESADA')),
  supplier_name TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders (public read/insert/update, NO DELETE for audit)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are viewable by everyone" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);

-- NO DELETE POLICY - Orders cannot be deleted for audit purposes

-- Create inventory/parts table
CREATE TABLE public.parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  rotation TEXT DEFAULT 'medium' CHECK (rotation IN ('high', 'medium', 'low')),
  days_in_warehouse INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on parts
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parts are viewable by everyone" 
ON public.parts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert parts" 
ON public.parts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update parts" 
ON public.parts 
FOR UPDATE 
USING (true);

-- Create order_items table (items assigned to orders)
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  part_id UUID NOT NULL REFERENCES public.parts(id),
  quantity_required INTEGER NOT NULL DEFAULT 0,
  quantity_fulfilled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id, part_id)
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items are viewable by everyone" 
ON public.order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update order items" 
ON public.order_items 
FOR UPDATE 
USING (true);

-- Create fulfillment_logs table (audit trail - NEVER deleted)
CREATE TABLE public.fulfillment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  part_id UUID NOT NULL REFERENCES public.parts(id),
  quantity INTEGER NOT NULL, -- Positive for add, negative for remove
  operation_type TEXT NOT NULL CHECK (operation_type IN ('add', 'remove')),
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on fulfillment_logs (read only after insert - immutable audit)
ALTER TABLE public.fulfillment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fulfillment logs are viewable by everyone" 
ON public.fulfillment_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert fulfillment logs" 
ON public.fulfillment_logs 
FOR INSERT 
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICY - Logs are immutable for audit

-- Create stock_alerts table
CREATE TABLE public.stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL REFERENCES public.parts(id),
  part_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  requested_quantity INTEGER NOT NULL,
  or_number TEXT NOT NULL,
  technician TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on stock_alerts
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stock alerts are viewable by everyone" 
ON public.stock_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert stock alerts" 
ON public.stock_alerts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update stock alerts" 
ON public.stock_alerts 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parts_updated_at
BEFORE UPDATE ON public.parts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate sequential OR numbers
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

CREATE TRIGGER generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.or_number IS NULL OR NEW.or_number = '')
EXECUTE FUNCTION public.generate_or_number();

-- Insert initial projects
INSERT INTO public.projects (name, description) VALUES
  ('Alpha Tower Maintenance', 'Mantenimiento de Torre Alpha'),
  ('Beta Complex Wiring', 'Cableado del Complejo Beta'),
  ('Gamma Station Upgrade', 'Actualización de Estación Gamma');

-- Insert initial parts/inventory
INSERT INTO public.parts (sku, name, category, stock, unit_cost, sale_price, rotation, days_in_warehouse) VALUES
  ('ELEC-001', 'Monitor LED 24"', 'Electronics', 45, 180.00, 299.00, 'high', 12),
  ('TOOL-015', 'Industrial Drill', 'Tools', 23, 95.00, 159.00, 'medium', 35),
  ('MAT-089', 'Electric Cable 100m', 'Materials', 150, 45.00, 79.00, 'high', 8),
  ('EQUI-022', 'Air Compressor', 'Equipment', 0, 450.00, 699.00, 'low', 78),
  ('ELEC-045', 'Mechanical Keyboard', 'Electronics', 67, 55.00, 89.00, 'high', 5),
  ('TOOL-089', 'Circular Saw', 'Tools', 1, 220.00, 349.00, 'medium', 42);

-- Enable realtime for orders to see new requests instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_alerts;