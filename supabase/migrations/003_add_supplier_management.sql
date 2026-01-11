
-- supabase/migrations/003_add_supplier_management.sql

-- 1. Create the suppliers table
CREATE TABLE public.suppliers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  contact_person text NULL,
  email text NULL,
  phone text NULL,
  address text NULL,
  school_id uuid NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT suppliers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 2. Add supplier_id to inventory_movements for tracking restocks
ALTER TABLE public.inventory_movements
  ADD COLUMN supplier_id uuid,
  ADD CONSTRAINT inventory_movements_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- 3. RLS Policies for suppliers
CREATE POLICY "Allow authenticated users to view suppliers" ON public.suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND (
        up.role = 'SUPER_ADMIN' 
        OR up.role = 'SCHOOL_ADMIN'
      )
    )
  );

-- 4. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger for suppliers updated_at
CREATE TRIGGER set_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

COMMENT ON TABLE public.suppliers IS 'Stores information about suppliers for inventory items.';
COMMENT ON COLUMN public.inventory_movements.supplier_id IS 'Link to the supplier for restock movements.';
