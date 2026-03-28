-- ============================================================
-- Migration: Admin Ops RPCs
-- Date: 2026-03-27
-- Description: Atomic RPC functions for School Admin operations:
--   1. reload_wallet_atomic  — add balance to a student wallet
--   2. process_refund_atomic — refund a transaction back to wallet
-- Both functions enforce school_id isolation and write to
-- activity_log for full auditability.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. activity_log table (audit trail for admin mutations)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID        NOT NULL,
  actor_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,            -- e.g. 'WALLET_RELOAD', 'REFUND_PROCESSED'
  table_name    TEXT        NOT NULL,
  record_id     TEXT        NOT NULL,            -- id of the affected row
  before_data   JSONB,
  after_data    JSONB,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only admins of the same school can read their own logs
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_admin_read_own_logs"
  ON activity_log
  FOR SELECT
  USING (
    school_id = (
      SELECT school_id FROM profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

-- Index for fast per-school queries
CREATE INDEX IF NOT EXISTS idx_activity_log_school_id ON activity_log (school_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 2. reload_wallet_atomic
-- ──────────────────────────────────────────────────────────────
-- Atomically:
--   a. Validates student belongs to the given school
--   b. Adds p_amount to profiles.balance
--   c. Inserts a RELOAD transaction record
--   d. Writes to activity_log
--
-- Returns: JSONB { ok: bool, message: text, new_balance: numeric }
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reload_wallet_atomic(
  p_student_id  UUID,
  p_school_id   UUID,
  p_amount      NUMERIC,
  p_reason      TEXT,
  p_admin_id    UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_balance  NUMERIC;
  v_new_balance  NUMERIC;
  v_tx_id        UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'message', 'El monto debe ser mayor a cero.');
  END IF;

  -- Lock and validate student row
  SELECT balance INTO v_old_balance
  FROM profiles
  WHERE id = p_student_id
    AND school_id = p_school_id
    AND role = 'STUDENT'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Alumno no encontrado en esta escuela.');
  END IF;

  v_new_balance := v_old_balance + p_amount;

  -- Update balance
  UPDATE profiles
  SET balance    = v_new_balance,
      updated_at = now()
  WHERE id = p_student_id;

  -- Insert transaction record
  INSERT INTO transactions (
    id, school_id, student_id, amount, type, payment_method, reason, created_at
  ) VALUES (
    gen_random_uuid(),
    p_school_id,
    p_student_id,
    p_amount,
    'RELOAD',
    'ADMIN',
    p_reason,
    now()
  )
  RETURNING id INTO v_tx_id;

  -- Audit log
  INSERT INTO activity_log (
    school_id, actor_id, action, table_name, record_id,
    before_data, after_data, reason
  ) VALUES (
    p_school_id,
    COALESCE(p_admin_id, auth.uid()),
    'WALLET_RELOAD',
    'profiles',
    p_student_id::TEXT,
    jsonb_build_object('balance', v_old_balance),
    jsonb_build_object('balance', v_new_balance, 'transaction_id', v_tx_id),
    p_reason
  );

  RETURN jsonb_build_object(
    'ok',          true,
    'message',     'Recarga aplicada correctamente.',
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'message', SQLERRM);
END;
$$;

-- Revoke public execute; only authenticated users can call it
REVOKE EXECUTE ON FUNCTION reload_wallet_atomic FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION reload_wallet_atomic TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 3. process_refund_atomic
-- ──────────────────────────────────────────────────────────────
-- Atomically:
--   a. Validates transaction belongs to school and is refundable
--   b. Returns abs(amount) to profiles.balance
--   c. Marks transaction as refunded
--   d. Inserts a REFUND transaction record
--   e. Writes to activity_log
--
-- Returns: JSONB { ok: bool, message: text, new_balance: numeric }
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION process_refund_atomic(
  p_transaction_id  UUID,
  p_student_id      UUID,
  p_school_id       UUID,
  p_reason          TEXT,
  p_admin_id        UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_amount    NUMERIC;
  v_tx_type      TEXT;
  v_tx_refunded  BOOLEAN;
  v_old_balance  NUMERIC;
  v_new_balance  NUMERIC;
  v_refund_tx_id UUID;
BEGIN
  -- Lock and validate original transaction
  SELECT amount, type, COALESCE(refunded, false)
  INTO v_tx_amount, v_tx_type, v_tx_refunded
  FROM transactions
  WHERE id          = p_transaction_id
    AND school_id   = p_school_id
    AND student_id  = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Transacción no encontrada.');
  END IF;

  IF v_tx_refunded THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Esta transacción ya fue reembolsada.');
  END IF;

  -- Only PURCHASE transactions are refundable via this RPC
  IF v_tx_type NOT IN ('PURCHASE', 'FEE') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Solo se pueden reembolsar compras o cargos.');
  END IF;

  -- Lock student balance
  SELECT balance INTO v_old_balance
  FROM profiles
  WHERE id = p_student_id
    AND school_id = p_school_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Alumno no encontrado.');
  END IF;

  -- Refund amount = absolute value (transactions store purchases as negative)
  v_new_balance := v_old_balance + ABS(v_tx_amount);

  -- Update student balance
  UPDATE profiles
  SET balance    = v_new_balance,
      updated_at = now()
  WHERE id = p_student_id;

  -- Mark original transaction as refunded
  UPDATE transactions
  SET refunded    = true,
      refund_reason = p_reason,
      updated_at  = now()
  WHERE id = p_transaction_id;

  -- Insert refund transaction record
  INSERT INTO transactions (
    id, school_id, student_id, amount, type, payment_method,
    reason, related_transaction_id, created_at
  ) VALUES (
    gen_random_uuid(),
    p_school_id,
    p_student_id,
    ABS(v_tx_amount),
    'REFUND',
    'ADMIN',
    p_reason,
    p_transaction_id,
    now()
  )
  RETURNING id INTO v_refund_tx_id;

  -- Audit log
  INSERT INTO activity_log (
    school_id, actor_id, action, table_name, record_id,
    before_data, after_data, reason
  ) VALUES (
    p_school_id,
    COALESCE(p_admin_id, auth.uid()),
    'REFUND_PROCESSED',
    'transactions',
    p_transaction_id::TEXT,
    jsonb_build_object('balance', v_old_balance, 'original_amount', v_tx_amount),
    jsonb_build_object('balance', v_new_balance, 'refund_tx_id', v_refund_tx_id),
    p_reason
  );

  RETURN jsonb_build_object(
    'ok',             true,
    'message',        'Reembolso procesado correctamente.',
    'new_balance',    v_new_balance,
    'refund_tx_id',   v_refund_tx_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'message', SQLERRM);
END;
$$;

-- Revoke public execute; only authenticated users can call it
REVOKE EXECUTE ON FUNCTION process_refund_atomic FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION process_refund_atomic TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- NOTE: If the transactions table doesn't have these columns yet,
-- add them:
-- ──────────────────────────────────────────────────────────────
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS refunded               BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS refund_reason          TEXT,
  ADD COLUMN IF NOT EXISTS reason                 TEXT,
  ADD COLUMN IF NOT EXISTS related_transaction_id UUID        REFERENCES transactions(id),
  ADD COLUMN IF NOT EXISTS updated_at             TIMESTAMPTZ DEFAULT now();
