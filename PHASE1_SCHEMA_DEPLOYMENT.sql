-- ============================================
-- PHASE 1: REFUND POLICY SCHEMA DEPLOYMENT
-- ============================================
-- Date: 2026-03-10
-- Description: Platform-wide refund policies with auto-conversion (pools→points),
--              manual batch processing (school refunds), settlement ledger
-- Tables Created: 8
-- Tables Modified: 3

-- ============================================
-- 1. PLATFORM SETTINGS (Global Configuration)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pool → Points Conversion
  pool_to_points_exchange_rate DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  pool_points_expiry_days INTEGER NOT NULL DEFAULT 30,
  
  -- School Refund Batch Processing
  school_refund_batch_interval_days INTEGER NOT NULL DEFAULT 15,
  
  -- POS Configuration
  default_pos_accepts_cash BOOLEAN NOT NULL DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_super_admin" ON platform_settings;
CREATE POLICY "platform_settings_super_admin" ON platform_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

DROP POLICY IF EXISTS "platform_settings_read" ON platform_settings;
CREATE POLICY "platform_settings_read" ON platform_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. SCHOOL SETTINGS (Per-School Configuration)
-- ============================================

CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Pool Points Multiplier
  pool_points_multiplier DECIMAL(2,2) NOT NULL DEFAULT 1.0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_settings_school ON school_settings(school_id);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_settings_own" ON school_settings;
CREATE POLICY "school_settings_own" ON school_settings FOR ALL
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "school_settings_super_admin" ON school_settings;
CREATE POLICY "school_settings_super_admin" ON school_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- 3. POINTS LEDGER (Point Transaction Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'POOL_CONVERSION',
    'MARKETPLACE_PURCHASE',
    'MARKETPLACE_REDEMPTION',
    'MARKETPLACE_REVERSAL',
    'ADMIN_ADJUSTMENT',
    'GIFT_POINTS'
  )),
  
  amount INT NOT NULL CHECK (amount != 0),
  
  source_module TEXT,
  source_id UUID,
  source_description TEXT,
  
  balance_after INT NOT NULL,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_student ON points_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_school ON points_ledger(school_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_type ON points_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_ledger_created ON points_ledger(created_at DESC);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "points_own" ON points_ledger;
CREATE POLICY "points_own" ON points_ledger FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "points_parent" ON points_ledger;
CREATE POLICY "points_parent" ON points_ledger FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN parent_student_links psl ON s.id = psl.student_id
    WHERE psl.parent_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "points_school_admin" ON points_ledger;
CREATE POLICY "points_school_admin" ON points_ledger FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "points_super_admin" ON points_ledger;
CREATE POLICY "points_super_admin" ON points_ledger FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- 4. PENDING SCHOOL REFUNDS (Manual Batch Processing)
-- ============================================

CREATE TABLE IF NOT EXISTS pending_school_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  concessionaire_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  batch_number INT NOT NULL,
  batch_start_date DATE NOT NULL,
  batch_due_date DATE NOT NULL,
  
  refund_reason TEXT NOT NULL CHECK (refund_reason IN (
    'service_not_used',
    'partial_service',
    'error_correction',
    'other'
  )),
  
  description TEXT NOT NULL,
  total_amount_pending DECIMAL(12,2) NOT NULL CHECK (total_amount_pending > 0),
  
  items JSONB NOT NULL DEFAULT '[]',
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'settled')),
  
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  
  settled_at TIMESTAMPTZ,
  settled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  settlement_reference TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_refunds_school ON pending_school_refunds(school_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_batch ON pending_school_refunds(batch_number, school_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_status ON pending_school_refunds(status) WHERE status IN ('pending', 'approved');
CREATE INDEX IF NOT EXISTS idx_pending_refunds_due_date ON pending_school_refunds(batch_due_date);

ALTER TABLE pending_school_refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pending_refunds_school_admin" ON pending_school_refunds;
CREATE POLICY "pending_refunds_school_admin" ON pending_school_refunds FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "pending_refunds_super_admin" ON pending_school_refunds;
CREATE POLICY "pending_refunds_super_admin" ON pending_school_refunds FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- 5. SCHOOL REFUND SETTLEMENTS (Settlement Ledger)
-- ============================================

CREATE TABLE IF NOT EXISTS school_refund_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  concessionaire_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  batch_id UUID NOT NULL REFERENCES pending_school_refunds(id) ON DELETE RESTRICT,
  
  total_settled_amount DECIMAL(12,2) NOT NULL CHECK (total_settled_amount > 0),
  
  settlement_method TEXT NOT NULL CHECK (settlement_method IN (
    'bank_transfer',
    'wallet_credit',
    'check',
    'cash',
    'other'
  )),
  
  settlement_reference TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'failed', 'disputed')),
  
  settled_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_school ON school_refund_settlements(school_id);
CREATE INDEX IF NOT EXISTS idx_settlements_batch ON school_refund_settlements(batch_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON school_refund_settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_date ON school_refund_settlements(settled_at DESC);

ALTER TABLE school_refund_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settlements_school_admin" ON school_refund_settlements;
CREATE POLICY "settlements_school_admin" ON school_refund_settlements FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "settlements_super_admin" ON school_refund_settlements;
CREATE POLICY "settlements_super_admin" ON school_refund_settlements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- 6. MODIFY pool_refunds (Add Auto-Conversion Columns)
-- ============================================

ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS
  auto_refund_to_points_at TIMESTAMPTZ;

ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS
  converted_to_points_at TIMESTAMPTZ;

ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS
  points_awarded INT;

CREATE INDEX IF NOT EXISTS idx_pool_refunds_pending_conversion 
  ON pool_refunds(auto_refund_to_points_at) 
  WHERE converted_to_points_at IS NULL AND status = 'processed';

-- ============================================
-- 7. MODIFY operating_units (Add Cash Acceptance)
-- ============================================

ALTER TABLE operating_units ADD COLUMN IF NOT EXISTS
  accepts_cash BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================
-- 8. MODIFY transactions (Add Refund Tracking)
-- ============================================

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  refund_reason TEXT CHECK (refund_reason IN (
    'pool_cheaper',
    'pool_cancelled',
    'gift_rejected',
    'pos_early_cancel',
    'pos_error',
    'deposit_error',
    'marketplace_reversal',
    'admin_adjustment'
  ));

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  refund_type TEXT CHECK (refund_type IN (
    'pool', 'pos', 'gift', 'marketplace', 'deposit', 'school', 'admin'
  ));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'platform_settings', 'school_settings', 'points_ledger',
  'pending_school_refunds', 'school_refund_settlements'
)
ORDER BY table_name;

-- Check pool_refunds new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pool_refunds' 
AND column_name IN (
  'auto_refund_to_points_at', 'converted_to_points_at', 'points_awarded'
);

-- Check operating_units has accepts_cash
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'operating_units' 
AND column_name = 'accepts_cash';

-- Check transactions has refund columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('refund_reason', 'refund_type');
