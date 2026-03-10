-- ============================================
-- PHASE 1: REFUND POLICY SETTINGS SEED
-- ============================================

INSERT INTO platform_settings (
  pool_to_points_exchange_rate,
  pool_points_expiry_days,
  school_refund_batch_interval_days,
  default_pos_accepts_cash
)
SELECT 1.0, 30, 15, FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM platform_settings
);

INSERT INTO school_settings (school_id, pool_points_multiplier)
SELECT s.id, 1.0
FROM schools s
WHERE NOT EXISTS (
  SELECT 1 FROM school_settings ss WHERE ss.school_id = s.id
);

SELECT id, pool_to_points_exchange_rate, pool_points_expiry_days, school_refund_batch_interval_days, default_pos_accepts_cash
FROM platform_settings;

SELECT school_id, pool_points_multiplier
FROM school_settings
ORDER BY school_id;