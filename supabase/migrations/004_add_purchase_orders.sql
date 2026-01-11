
-- supabase/migrations/004_add_purchase_orders.sql

-- 1. Create Purchase Order Status enum
CREATE TYPE public.purchase_order_status AS ENUM (
  'DRAFT',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED'
);

-- 2. Create Purchase Orders table
CREATE TABLE public.purchase_orders (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  school_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  status public.purchase_order_status DEFAULT 'DRAFT' NOT NULL,
  order_date timestamptz DEFAULT now() NOT NULL,
  expected_delivery_date timestamptz,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT purchase_orders_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.operating_units(id),
  CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- 3. Create Purchase Order Items table
CREATE TABLE public.purchase_order_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  purchase_order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_ordered integer NOT NULL,
  quantity_received integer DEFAULT 0 NOT NULL,
  unit_cost numeric(10,2),
  
  CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Purchase Orders
CREATE POLICY "Allow authenticated users to view their POs" ON public.purchase_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.school_id = purchase_orders.school_id
    )
  );

CREATE POLICY "Allow admins to manage POs" ON public.purchase_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.school_id = purchase_orders.school_id
      AND (
        up.role = 'SUPER_ADMIN' 
        OR up.role = 'SCHOOL_ADMIN'
        OR up.role = 'UNIT_MANAGER'
      )
    )
  );

-- 5. RLS Policies for Purchase Order Items
CREATE POLICY "Allow authenticated users to view PO items" ON public.purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.user_profiles up ON po.school_id = up.school_id
      WHERE po.id = purchase_order_items.purchase_order_id
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to manage PO items" ON public.purchase_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.user_profiles up ON po.school_id = up.school_id
      WHERE po.id = purchase_order_items.purchase_order_id
      AND up.user_id = auth.uid()
      AND (
        up.role = 'SUPER_ADMIN' 
        OR up.role = 'SCHOOL_ADMIN'
        OR up.role = 'UNIT_MANAGER'
      )
    )
  );

-- 6. Triggers for updated_at timestamps
CREATE TRIGGER set_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

COMMENT ON TABLE public.purchase_orders IS 'Stores purchase orders sent to suppliers.';
COMMENT ON TABLE public.purchase_order_items IS 'Details the items within a purchase order.';
