-- ============================================
-- FINTECH SECURITY FIXES - PHASE 1
-- ============================================
-- Implementa Atomicidad, Idempotencia y Validación
-- para operaciones de dinero críticas
-- Fecha: 2026-03-11

-- ============================================
-- 1. ADD CHECK CONSTRAINTS (Balance Validation)
-- ============================================

-- Validate transactions amounts > 0
ALTER TABLE transactions
ADD CONSTRAINT ck_transactions_amount_positive CHECK (amount > 0);

-- Validate wallet transactions amounts (can be negative for purchases, but should be valid)
ALTER TABLE wallet_transactions
ADD CONSTRAINT ck_wallet_tx_amount_not_zero CHECK (amount != 0);

-- Validate pool contributions > 0 (already exists but ensure it's there)
ALTER TABLE pool_contributions
DROP CONSTRAINT IF EXISTS ck_pool_contributions_positive;
ALTER TABLE pool_contributions
ADD CONSTRAINT ck_pool_contributions_positive CHECK (amount > 0);

-- Validate gifts amount > 0
ALTER TABLE gifts
ADD CONSTRAINT ck_gifts_amount_positive CHECK (amount > 0);

-- ============================================
-- 2. ADD IDEMPOTENCY TRACKING TO REFUNDS
-- ============================================

-- Add idempotency key tracking for pending school refunds
ALTER TABLE pending_school_refunds
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS settlement_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_settlement_attempted_at TIMESTAMPTZ;

-- Add idempotency tracking to pool refunds
ALTER TABLE pool_refunds
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS processing_attempts INT DEFAULT 0;

-- ============================================
-- 3. ATOMIC POS SALE FUNCTION
-- ============================================
-- Resolves CRIT-001: Missing Transaction Atomicity in POS Sales
-- This function wraps the entire POS sale in a single transaction

CREATE OR REPLACE FUNCTION process_pos_sale_atomic(
  p_school_id UUID,
  p_unit_id UUID,
  p_student_id UUID,
  p_amount DECIMAL,
  p_items JSONB,
  p_payment_method TEXT,
  p_idempotency_key TEXT
) RETURNS JSON AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
  v_result JSON;
BEGIN
  -- 1. Validate amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- 2. Check for duplicate processing (idempotency)
  SELECT id INTO v_transaction_id
  FROM transactions
  WHERE metadata->>'idempotency_key' = p_idempotency_key
    AND type = 'sale'
    AND school_id = p_school_id
    LIMIT 1;
  
  IF v_transaction_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', TRUE,
      'reason', 'idempotent-duplicate',
      'transaction_id', v_transaction_id,
      'message', 'This sale was already processed'
    );
  END IF;
  
  -- 3. Get current student balance
  SELECT balance INTO v_current_balance
  FROM students
  WHERE id = p_student_id
  FOR UPDATE;  -- Lock the row
  
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Student not found';
  END IF;
  
  -- 4. Verify sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: % < %', v_current_balance, p_amount;
  END IF;
  
  -- 5. Deduct balance atomically
  UPDATE students
  SET balance = balance - p_amount
  WHERE id = p_student_id
  RETURNING balance INTO v_new_balance;
  
  -- 6. Create transaction record
  INSERT INTO transactions (
    school_id, unit_id, student_id, type, status, amount, items, payment_method, metadata
  )
  VALUES (
    p_school_id,
    p_unit_id,
    p_student_id,
    'sale',
    'completed',
    p_amount,
    p_items,
    p_payment_method,
    jsonb_build_object('idempotency_key', p_idempotency_key)
  )
  RETURNING id INTO v_transaction_id;
  
  -- 7. Return success with new balance
  RETURN json_build_object(
    'success', TRUE,
    'transaction_id', v_transaction_id,
    'balance_before', v_current_balance,
    'balance_after', v_new_balance,
    'amount', p_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. ATOMIC REFUND SETTLEMENT FUNCTION
-- ============================================
-- Resolves CRIT-003: Idempotent refund settlement
-- Prevents duplicate settlements via optimistic locking

CREATE OR REPLACE FUNCTION settle_refund_idempotent(
  p_refund_id UUID,
  p_settled_by UUID,
  p_method TEXT,
  p_reference TEXT,
  p_idempotency_key TEXT
) RETURNS JSON AS $$
DECLARE
  v_refund_data RECORD;
  v_settlement_id UUID;
  v_result JSON;
BEGIN
  -- 1. Fetch refund with lock to prevent race condition
  SELECT id, status, total_amount_pending, school_id, concessionaire_id
  INTO v_refund_data
  FROM pending_school_refunds
  WHERE id = p_refund_id
  FOR UPDATE;
  
  IF v_refund_data.id IS NULL THEN
    RAISE EXCEPTION 'Refund not found';
  END IF;
  
  -- 2. Check if already settled with same idempotency key
  IF v_refund_data.status = 'settled' AND p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_settlement_id
    FROM school_refund_settlements
    WHERE batch_id = p_refund_id
      AND metadata->>'idempotency_key' = p_idempotency_key
    LIMIT 1;
    
    IF v_settlement_id IS NOT NULL THEN
      RETURN json_build_object(
        'success', TRUE,
        'reason', 'idempotent-duplicate',
        'settlement_id', v_settlement_id,
        'message', 'This settlement was already processed'
      );
    END IF;
  END IF;
  
  -- 3. Verify refund is in approved state
  IF v_refund_data.status != 'approved' THEN
    RAISE EXCEPTION 'Refund is %, not approved', v_refund_data.status;
  END IF;
  
  -- 4. Create settlement record (will fail if duplicate key constraint violated)
  INSERT INTO school_refund_settlements (
    school_id,
    concessionaire_id,
    batch_id,
    total_settled_amount,
    settlement_method,
    settlement_reference,
    status,
    settled_at,
    created_by,
    metadata
  )
  VALUES (
    v_refund_data.school_id,
    v_refund_data.concessionaire_id,
    p_refund_id,
    v_refund_data.total_amount_pending,
    p_method,
    p_reference,
    'pending',
    NOW(),
    p_settled_by,
    jsonb_build_object('idempotency_key', p_idempotency_key)
  )
  RETURNING id INTO v_settlement_id;
  
  -- 5. Update refund status to settled (this UPDATE should succeed due to lock)
  UPDATE pending_school_refunds
  SET status = 'settled',
      settled_at = NOW(),
      settled_by = p_settled_by,
      settlement_reference = p_reference,
      settlement_attempts = settlement_attempts + 1,
      last_settlement_attempted_at = NOW()
  WHERE id = p_refund_id;
  
  -- 6. Return success
  RETURN json_build_object(
    'success', TRUE,
    'settlement_id', v_settlement_id,
    'amount', v_refund_data.total_amount_pending
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. STRENGTHEN RLS POLICIES
-- ============================================
-- Resolves CRIT-002: School isolation in RLS

-- Drop and recreate school isolation policy for transactions
DROP POLICY IF EXISTS "transactions_school_admin" ON transactions;
CREATE POLICY "transactions_school_admin" ON transactions FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM user_roles
      WHERE user_id = (SELECT auth.uid())
        AND school_id IS NOT NULL
        AND role IN ('SCHOOL_ADMIN', 'SCHOOL_FINANCE')
    )
  );

-- Add WITH CHECK to transactions INSERT policy
DROP POLICY IF EXISTS "transactions_pos_insert" ON transactions;
CREATE POLICY "transactions_pos_insert" ON transactions FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM user_roles
      WHERE user_id = (SELECT auth.uid())
        AND school_id IS NOT NULL
        AND role IN ('POS_OPERATOR', 'CAFETERIA_STAFF', 'STATIONERY_STAFF', 'CASHIER', 'UNIT_MANAGER')
    )
  );

-- Strengthen super admin policy
DROP POLICY IF EXISTS "transactions_super_admin" ON transactions;
CREATE POLICY "transactions_super_admin" ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
        AND role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
        AND role = 'SUPER_ADMIN'
    )
  );

-- Apply school isolation to pending_school_refunds
DROP POLICY IF EXISTS "pending_refunds_school_admin" ON pending_school_refunds;
CREATE POLICY "pending_refunds_school_admin" ON pending_school_refunds FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM user_roles
      WHERE user_id = (SELECT auth.uid())
        AND school_id IS NOT NULL
        AND role IN ('SCHOOL_ADMIN', 'SCHOOL_FINANCE')
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM user_roles
      WHERE user_id = (SELECT auth.uid())
        AND school_id IS NOT NULL
        AND role IN ('SCHOOL_ADMIN', 'SCHOOL_FINANCE')
    )
  );

-- ============================================
-- 6. AUTHORIZATION CHECKS (For Service Layer)
-- ============================================
-- These functions help service layer verify authorization

CREATE OR REPLACE FUNCTION verify_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_school_admin(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
      AND school_id = p_school_id
      AND role IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. AUDIT LOGGING TRIGGER
-- ============================================
-- Implements comprehensive audit trail for financial operations

CREATE TABLE IF NOT EXISTS financial_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_audit_user ON financial_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_entity ON financial_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_created ON financial_audit_log(created_at DESC);

-- Trigger to log refund approvals
CREATE OR REPLACE FUNCTION log_refund_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO financial_audit_log (
      user_id, action, entity_type, entity_id, old_values, new_values
    ) VALUES (
      NEW.approved_by,
      'APPROVAL',
      'REFUND',
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_refund_approval ON pending_school_refunds;
CREATE TRIGGER trg_log_refund_approval
AFTER UPDATE ON pending_school_refunds
FOR EACH ROW
EXECUTE FUNCTION log_refund_approval();

-- ============================================
-- 8. VALIDATION CONSTRAINTS
-- ============================================
-- Additional safeguards

-- Prevent negative balances on students (if ever needed)
ALTER TABLE students
ADD CONSTRAINT ck_students_balance_not_negative CHECK (balance >= 0);

-- Ensure created_at is never in future
ALTER TABLE transactions
ADD CONSTRAINT ck_transactions_created_at_valid CHECK (created_at <= NOW());

-- All timestamps must be reasonable
ALTER TABLE pending_school_refunds
ADD CONSTRAINT ck_refund_dates_valid CHECK (
  approved_at IS NULL OR approved_at >= created_at
);

-- ============================================
-- 9. PERFORMANCE INDEXES
-- ============================================

-- Index for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_transactions_student_created 
  ON transactions(student_id, created_at DESC);

-- Index for pending settlements
CREATE INDEX IF NOT EXISTS idx_pending_refunds_status_created
  ON pending_school_refunds(status, created_at DESC)
  WHERE status != 'settled';

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_pending_refunds_idempotency
  ON pending_school_refunds(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ============================================
-- Summary of Changes
-- ============================================
-- ✓ CRIT-001: Added atomic POS sale function (process_pos_sale_atomic)
-- ✓ CRIT-002: Strengthened RLS policies with school isolation
-- ✓ CRIT-003: Added idempotent settlement function (settle_refund_idempotent)
-- ✓ CRIT-004: Added CHECK constraints for amount validation
-- + Added audit logging for compliance
-- + Added authorization helper functions
-- + Added performance indexes for rate limiting
