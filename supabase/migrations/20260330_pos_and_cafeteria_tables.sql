-- Migration: Add POS and Cafeteria tables
-- Fecha: 2026-03-30
-- Purpose: Create missing tables for POS operations and cafeteria management

-- 1. POS Terminals table
CREATE TABLE IF NOT EXISTS pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES operating_units(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offline', 'maintenance')),
  
  -- Assignment
  assigned_operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Configuration
  opening_time TIME,
  closing_time TIME,
  allowed_payment_methods TEXT[] DEFAULT '{"cash", "nfc", "qr"}',
  daily_limit DECIMAL(12,2),
  
  -- Metadata
  location_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_terminals_school ON pos_terminals(school_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_unit ON pos_terminals(unit_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_operator ON pos_terminals(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_status ON pos_terminals(status);

ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;

-- POS operators can see their assigned terminal
DROP POLICY IF EXISTS "pos_terminals_operator_own" ON pos_terminals;
CREATE POLICY "pos_terminals_operator_own" ON pos_terminals FOR SELECT
  USING (assigned_operator_id = (SELECT auth.uid())
    OR unit_id IN (
      SELECT id FROM operating_units
      WHERE school_id IN (
        SELECT school_id FROM user_roles
        WHERE user_id = (SELECT auth.uid())
          AND role IN ('POS_OPERATOR', 'CAFETERIA_STAFF', 'UNIT_MANAGER')
      )
    ));

-- School admins can see all terminals in their school
DROP POLICY IF EXISTS "pos_terminals_school_admin" ON pos_terminals;
CREATE POLICY "pos_terminals_school_admin" ON pos_terminals FOR ALL
  USING (school_id IN (
    SELECT school_id FROM user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('SCHOOL_ADMIN', 'UNIT_MANAGER')
  ));

-- 2. Cafeteria Orders table
CREATE TABLE IF NOT EXISTS cafeteria_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  pos_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
  
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- Who created the order (student or operator)
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  
  items JSONB NOT NULL DEFAULT '[]',  -- [{ product_id, name, qty, price }]
  total_amount DECIMAL(12,2) NOT NULL,
  
  estimated_time_minutes INT DEFAULT 15,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_student ON cafeteria_orders(student_id);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_pos ON cafeteria_orders(pos_id);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_status ON cafeteria_orders(status);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_school ON cafeteria_orders(school_id);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_created ON cafeteria_orders(created_at DESC);

ALTER TABLE cafeteria_orders ENABLE ROW LEVEL SECURITY;

-- Students can see their own orders
DROP POLICY IF EXISTS "cafeteria_orders_student_own" ON cafeteria_orders;
CREATE POLICY "cafeteria_orders_student_own" ON cafeteria_orders FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = (SELECT auth.uid())
  ));

-- Cafeteria staff can see orders for their POS
DROP POLICY IF EXISTS "cafeteria_orders_staff_own_pos" ON cafeteria_orders;
CREATE POLICY "cafeteria_orders_staff_own_pos" ON cafeteria_orders FOR ALL
  USING (pos_id IN (
    SELECT id FROM pos_terminals
    WHERE unit_id IN (
      SELECT id FROM operating_units
      WHERE school_id IN (
        SELECT school_id FROM user_roles
        WHERE user_id = (SELECT auth.uid())
          AND role IN ('CAFETERIA_STAFF', 'UNIT_MANAGER')
      )
    )
  ));

-- 3. POS Operations Log (Audit trail)
CREATE TABLE IF NOT EXISTS pos_operations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  pos_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'terminal_opened', 'terminal_closed', 'terminal_paused', 'terminal_resumed',
    'payment_processed', 'payment_failed', 'refund_issued', 
    'product_added', 'product_removed', 'price_changed', 'stock_adjusted',
    'operator_assigned', 'operator_changed',
    'error_occurred', 'manual_adjustment'
  )),
  
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_ops_log_pos ON pos_operations_log(pos_id);
CREATE INDEX IF NOT EXISTS idx_pos_ops_log_school ON pos_operations_log(school_id);
CREATE INDEX IF NOT EXISTS idx_pos_ops_log_event ON pos_operations_log(event_type);
CREATE INDEX IF NOT EXISTS idx_pos_ops_log_created ON pos_operations_log(created_at DESC);

ALTER TABLE pos_operations_log ENABLE ROW LEVEL SECURITY;

-- School admins and POS operators can see logs for their terminals
DROP POLICY IF EXISTS "pos_ops_log_view" ON pos_operations_log;
CREATE POLICY "pos_ops_log_view" ON pos_operations_log FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('SCHOOL_ADMIN', 'UNIT_MANAGER', 'POS_OPERATOR')
  ));

-- 4. Update products table to add POS assignment
-- Note: Adding column if it doesn't exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'allergens'
  ) THEN
    ALTER TABLE products ADD COLUMN allergens TEXT[] DEFAULT '{}';
  END IF;
END $$;
