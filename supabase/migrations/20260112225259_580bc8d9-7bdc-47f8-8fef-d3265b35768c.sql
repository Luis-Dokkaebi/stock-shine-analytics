-- Add department field to parts table for independent inventories
ALTER TABLE public.parts ADD COLUMN department TEXT NOT NULL DEFAULT 'general';

-- Add department field to orders table to track which department's inventory is affected
-- (already exists, but ensure it's used consistently)

-- Add department to stock_alerts
ALTER TABLE public.stock_alerts ADD COLUMN department TEXT NOT NULL DEFAULT 'general';

-- Add department to fulfillment_logs for tracking
ALTER TABLE public.fulfillment_logs ADD COLUMN department TEXT NOT NULL DEFAULT 'general';

-- Create index for faster department-based queries
CREATE INDEX idx_parts_department ON public.parts(department);
CREATE INDEX idx_stock_alerts_department ON public.stock_alerts(department);
CREATE INDEX idx_fulfillment_logs_department ON public.fulfillment_logs(department);