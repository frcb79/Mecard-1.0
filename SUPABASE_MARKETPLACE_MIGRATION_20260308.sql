-- MeCard migration: Marketplace suggestions + parent rewards preferences + family points topups
-- Date: 2026-03-08
-- Safe to run multiple times where possible.

BEGIN;

-- ============================================
-- 1) MARKETPLACE SUGGESTIONS (FROM FAMILIES)
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  parent_name VARCHAR(255),
  category VARCHAR(80) NOT NULL,
  suggestion TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_marketplace_suggestions_parent
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_marketplace_suggestions_status
    CHECK (status IN ('NEW', 'REVIEWED', 'APPROVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_parent_id ON marketplace_suggestions(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_status ON marketplace_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_created_at ON marketplace_suggestions(created_at);


-- ============================================
-- 2) PARENT REWARDS PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS parent_rewards_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE,
  student_purchases_enabled BOOLEAN NOT NULL DEFAULT true,
  use_family_pool BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_parent_rewards_preferences_parent
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parent_rewards_preferences_parent_id ON parent_rewards_preferences(parent_id);


-- ============================================
-- 3) FAMILY POINTS TOP-UPS
-- ============================================
CREATE TABLE IF NOT EXISTS family_points_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  points_amount INT NOT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'MANUAL_TOPUP',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_family_points_topups_parent
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_family_points_topups_points_positive
    CHECK (points_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_family_points_topups_parent_id ON family_points_topups(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_points_topups_created_at ON family_points_topups(created_at);


-- ============================================
-- 4) ROW LEVEL SECURITY
-- ============================================
ALTER TABLE marketplace_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_rewards_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_points_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parent_rewards_preferences_own ON parent_rewards_preferences;
CREATE POLICY parent_rewards_preferences_own
ON parent_rewards_preferences
FOR ALL
USING (parent_id = (SELECT auth.uid()::uuid))
WITH CHECK (parent_id = (SELECT auth.uid()::uuid));

DROP POLICY IF EXISTS family_points_topups_own ON family_points_topups;
CREATE POLICY family_points_topups_own
ON family_points_topups
FOR ALL
USING (parent_id = (SELECT auth.uid()::uuid))
WITH CHECK (parent_id = (SELECT auth.uid()::uuid));

DROP POLICY IF EXISTS marketplace_suggestions_parent_write ON marketplace_suggestions;
CREATE POLICY marketplace_suggestions_parent_write
ON marketplace_suggestions
FOR INSERT
WITH CHECK (parent_id = (SELECT auth.uid()::uuid));

DROP POLICY IF EXISTS marketplace_suggestions_parent_read ON marketplace_suggestions;
CREATE POLICY marketplace_suggestions_parent_read
ON marketplace_suggestions
FOR SELECT
USING (
  parent_id = (SELECT auth.uid()::uuid)
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid()::uuid)
      AND role IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
  )
);

COMMIT;
