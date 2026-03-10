-- ============================================
-- MECARD PLATFORM - COMPLETE SUPABASE SCHEMA
-- ============================================
-- Versión: 2.0
-- Fecha: 2026-02-23
-- Propósito: Schema completo de la plataforma MeCard
-- Estado: Phase 1 — Base tables + Feature tables

-- ============================================
-- 0. BASE TABLES (fundacionales)
-- ============================================

-- 0.1 SCHOOLS — Tabla base de escuelas
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  legal_name TEXT,
  rfc TEXT,
  logo_url TEXT,
  
  -- Estadísticas
  student_count INT NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  unified_balance BOOLEAN NOT NULL DEFAULT true,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'TRIAL', 'SUSPENDED', 'BLOCKED')),
  contract_type TEXT NOT NULL DEFAULT 'STANDARD' CHECK (contract_type IN ('STANDARD', 'ENTERPRISE', 'TRIAL', 'CUSTOM')),
  trial_duration_months INT,
  onboarding_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (onboarding_status IN ('PENDING', 'COMPLETED')),
  
  -- Finanzas
  stp_cost_center TEXT,
  settlement_clabe TEXT,
  platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 3.5,
  
  -- Dirección (JSONB para flexibilidad)
  address JSONB,
  contact JSONB,
  branding JSONB,
  
  -- Modelo de negocio (JSONB — cafeteria_fee_percent, stationery_fee_percent, etc.)
  business_model JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

-- 0.2 CAMPUSES — Campus/sedes de una escuela
CREATE TABLE IF NOT EXISTS campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  stp_cost_center TEXT,
  
  address JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campuses_school ON campuses(school_id);

-- 0.3 OPERATING UNITS — Cafeterías, papelerías, etc.
CREATE TABLE IF NOT EXISTS operating_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id),
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CAFETERIA', 'STATIONERY', 'LIBRARY', 'BOOKSTORE', 'OTHER')),
  owner_type TEXT NOT NULL DEFAULT 'SCHOOL' CHECK (owner_type IN ('SCHOOL', 'CONCESSIONAIRE')),
  
  manager_id UUID,
  vendor_name TEXT,
  vendor_clabe TEXT,
  commission_percent DECIMAL(5,2),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  opening_hours JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_school ON operating_units(school_id);

-- 0.4 USER ROLES — Mapeo de usuarios a roles por escuela/unidad
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References auth.users
  
  role TEXT NOT NULL CHECK (role IN (
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'SCHOOL_FINANCE',
    'UNIT_MANAGER', 'CAFETERIA_STAFF', 'STATIONERY_STAFF',
    'CASHIER', 'POS_OPERATOR', 'PARENT', 'STUDENT'
  )),
  
  school_id UUID REFERENCES schools(id),
  unit_id UUID REFERENCES operating_units(id),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role, COALESCE(school_id, '00000000-0000-0000-0000-000000000000'::UUID));
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- 0.5 STUDENTS — Tabla base de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- References auth.users (nullable for imported students without login)
  
  -- Identificación
  student_id TEXT NOT NULL,  -- Matrícula
  full_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  "group" TEXT,
  curp TEXT,
  
  -- Escuela
  school_id UUID NOT NULL REFERENCES schools(id),
  campus_id UUID REFERENCES campuses(id),
  
  -- Credencial (JSONB — qrCode, barcode, nfcId, cardDesign, etc.)
  credential JSONB NOT NULL DEFAULT '{}',
  
  -- Wallet
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  daily_limit DECIMAL(12,2) NOT NULL DEFAULT 200,
  spent_today DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Restricciones (JSONB — restrictedCategories, allergens, maxPerTransaction, etc.)
  restrictions JSONB NOT NULL DEFAULT '{}',
  
  -- Familia
  parent_id UUID,
  parent_name TEXT,
  parent_email TEXT,
  
  -- Transporte
  bus_route TEXT,
  
  -- Cumpleaños
  date_of_birth DATE,

  -- Foto & metadata
  photo_url TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
  
  clabe_personal TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);

-- 0.6 PRODUCTS — Catálogo de productos POS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'HOT_MEALS', 'SANDWICHES', 'SNACKS', 'DRINKS', 'DESSERTS',
    'HEALTHY', 'COMBO_MEALS', 'BREAKFAST', 'SUPPLIES',
    'UNIFORMS', 'BOOKS', 'TECH', 'MERCH', 'SEASONAL'
  )),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  
  -- Media
  image_url TEXT,
  images JSONB,
  
  -- Nutricional
  calories INT,
  ingredients TEXT[],
  allergens TEXT[],
  nutrition_facts JSONB,
  
  -- Ownership
  owner_type TEXT NOT NULL DEFAULT 'SCHOOL' CHECK (owner_type IN ('SCHOOL', 'CONCESSIONAIRE')),
  unit_id UUID REFERENCES operating_units(id),
  
  -- Status
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_combo BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Combo items (JSONB array)
  combo_items JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 0.7 WALLET TRANSACTIONS — Movimientos financieros de estudiantes
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  student_id UUID NOT NULL REFERENCES students(id),
  
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'PURCHASE', 'REFUND', 'GIFT_SENT', 'GIFT_RECEIVED', 'REWARD_REDEMPTION', 'ADJUSTMENT')),
  amount DECIMAL(12,2) NOT NULL,  -- Positive for deposits, negative for purchases
  
  -- Referencia
  unit_id UUID REFERENCES operating_units(id),
  unit_name TEXT,
  description TEXT NOT NULL,
  category TEXT,
  
  -- Metadata (items purchased, payment method, etc.)
  metadata JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'REVERSED')),
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_student ON wallet_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_date ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(type);

-- 0.8 GIFTS — Regalos entre estudiantes
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  sender_id UUID NOT NULL REFERENCES students(id),
  sender_name TEXT NOT NULL,
  sender_student_id TEXT NOT NULL,
  
  receiver_id UUID NOT NULL REFERENCES students(id),
  receiver_name TEXT NOT NULL,
  receiver_student_id TEXT NOT NULL,
  
  -- Producto
  inventory_item_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  redemption_code TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'REDEEMED', 'EXPIRED', 'CANCELLED')),
  
  message TEXT,
  thank_you_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Redemption tracking
  redeemable_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeeming_student_id UUID REFERENCES students(id),
  location_id UUID REFERENCES operating_units(id),
  
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_gifts_sender ON gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);

-- 0.9 CATEGORIES — Categorías de productos (extensible)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  
  unit_type TEXT CHECK (unit_type IN ('CAFETERIA', 'STATIONERY', 'ALL')),
  
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES FOR BASE TABLES
-- ============================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Super admins can see everything
DROP POLICY IF EXISTS "super_admin_all_schools" ON schools;
CREATE POLICY "super_admin_all_schools" ON schools FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()::uuid) AND role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "super_admin_all_students" ON students;
CREATE POLICY "super_admin_all_students" ON students FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()::uuid) AND role = 'SUPER_ADMIN'));

-- School admins can see their school's data
DROP POLICY IF EXISTS "school_admin_own_students" ON students;
CREATE POLICY "school_admin_own_students" ON students FOR ALL
  USING (school_id IN (SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid()::uuid) AND role IN ('SCHOOL_ADMIN', 'SCHOOL_FINANCE')));

-- Students can see their own data
DROP POLICY IF EXISTS "student_own_profile" ON students;
CREATE POLICY "student_own_profile" ON students FOR SELECT
  USING ((SELECT auth.uid()::uuid) = user_id);

-- Parents can see their children's data
DROP POLICY IF EXISTS "parent_children" ON students;
CREATE POLICY "parent_children" ON students FOR SELECT
  USING ((SELECT auth.uid()::uuid) = parent_id);

-- Students can see their own transactions
DROP POLICY IF EXISTS "student_own_transactions" ON wallet_transactions;
CREATE POLICY "student_own_transactions" ON wallet_transactions FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = (SELECT auth.uid()::uuid)));

-- Students can see their own gifts (sent or received)
DROP POLICY IF EXISTS "student_own_gifts" ON gifts;
CREATE POLICY "student_own_gifts" ON gifts FOR SELECT
  USING (
    sender_id IN (SELECT id FROM students WHERE user_id = (SELECT auth.uid()::uuid)) OR
    receiver_id IN (SELECT id FROM students WHERE user_id = (SELECT auth.uid()::uuid))
  );

-- Products visible to all authenticated users
DROP POLICY IF EXISTS "products_visible" ON products;
CREATE POLICY "products_visible" ON products FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- 1. SCHOOL REWARDS CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS school_rewards_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  
  -- Configuration Parameters
  markup_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.0,  -- 5-15% typical
  points_per_peso INT NOT NULL DEFAULT 10,                 -- 1 peso = X puntos
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Academic Cycle Dates
  cycle_start_date DATE NOT NULL DEFAULT '2025-08-01',
  cycle_end_date DATE NOT NULL DEFAULT '2026-06-30',
  
  -- Tier Thresholds
  tier_silver INT NOT NULL DEFAULT 1000,
  tier_gold INT NOT NULL DEFAULT 3000,
  tier_platinum INT NOT NULL DEFAULT 7000,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT fk_school_rewards_config_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_school_rewards_config_school_id ON school_rewards_config(school_id);


-- ============================================
-- 2. STUDENT REWARDS POINTS (Current Cycle)
-- ============================================
CREATE TABLE IF NOT EXISTS student_rewards_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  
  -- Points Tracking
  total_points INT NOT NULL DEFAULT 0,
  earned_this_cycle INT NOT NULL DEFAULT 0,        -- Total earned (not including multiplier)
  redeemed_this_cycle INT NOT NULL DEFAULT 0,      -- Total "cashed out"
  
  -- Tier Information
  tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE',      -- BRONZE | SILVER | GOLD | PLATINUM
  
  -- Tracking
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_student_rewards_points_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_rewards_points_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT ck_tier_valid 
    CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'))
);

CREATE INDEX IF NOT EXISTS idx_student_rewards_points_student_id ON student_rewards_points(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rewards_points_school_id ON student_rewards_points(school_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_rewards_points_unique 
  ON student_rewards_points(student_id, school_id);


-- ============================================
-- 3. POINTS TRANSACTIONS (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  
  -- Transaction Details
  transaction_type VARCHAR(20) NOT NULL,          -- EARN | REDEEM | EXPIRE | ADJUST
  points_amount INT NOT NULL,                      -- Positive for earn, negative for redeem
  
  -- Reference & Description
  reference_id VARCHAR(255),                       -- Links to POS transaction or redemption
  description TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_points_transactions_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_points_transactions_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT ck_transaction_type_valid 
    CHECK (transaction_type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST'))
);

CREATE INDEX IF NOT EXISTS idx_points_transactions_student_id ON points_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_school_id ON points_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);


-- ============================================
-- 4. MARKETPLACE PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Attributes
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,                  -- TECH | SCHOOL_SUPPLIES | SPORTS | ENTERTAINMENT | GIFT_CARDS | EXPERIENCES
  
  -- Points Cost
  points_cost INT NOT NULL,
  
  -- Inventory
  stock_quantity INT NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  
  -- Display
  image_url VARCHAR(500),
  featured BOOLEAN NOT NULL DEFAULT false,
  available BOOLEAN NOT NULL DEFAULT true,
  
  -- Popularity
  popularity_score INT NOT NULL DEFAULT 50,       -- 0-100 scale
  
  -- School Scope
  school_id UUID,                                  -- NULL = available para todas
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT fk_marketplace_products_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_school_id ON marketplace_products(school_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_available ON marketplace_products(available);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_featured ON marketplace_products(featured);


-- ============================================
-- 5. STUDENT REDEMPTIONS (Canje Log)
-- ============================================
CREATE TABLE IF NOT EXISTS student_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  product_id UUID NOT NULL,
  
  -- Transaction Details
  points_spent INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | DELIVERED | CANCELLED
  
  -- Fulfillment
  delivery_date DATE,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_student_redemptions_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_redemptions_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_redemptions_product 
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  CONSTRAINT ck_redemption_status_valid 
    CHECK (status IN ('PENDING', 'APPROVED', 'DELIVERED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_student_redemptions_student_id ON student_redemptions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_redemptions_school_id ON student_redemptions(school_id);
CREATE INDEX IF NOT EXISTS idx_student_redemptions_product_id ON student_redemptions(product_id);
CREATE INDEX IF NOT EXISTS idx_student_redemptions_status ON student_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_student_redemptions_created_at ON student_redemptions(created_at);


-- ============================================
-- 5B. MARKETPLACE SUGGESTIONS (FROM FAMILIES)
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  parent_name VARCHAR(255),
  category VARCHAR(80) NOT NULL,
  suggestion TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',      -- NEW | REVIEWED | APPROVED | REJECTED
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_marketplace_suggestions_parent
    FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ck_marketplace_suggestions_status
    CHECK (status IN ('NEW', 'REVIEWED', 'APPROVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_parent_id ON marketplace_suggestions(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_status ON marketplace_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_suggestions_created_at ON marketplace_suggestions(created_at);


-- ============================================
-- 5C. PARENT REWARDS PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS parent_rewards_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE,
  student_purchases_enabled BOOLEAN NOT NULL DEFAULT true,
  use_family_pool BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_parent_rewards_preferences_parent
    FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parent_rewards_preferences_parent_id ON parent_rewards_preferences(parent_id);


-- ============================================
-- 5D. FAMILY POINTS TOP-UPS
-- ============================================
CREATE TABLE IF NOT EXISTS family_points_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  points_amount INT NOT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'MANUAL_TOPUP',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT fk_family_points_topups_parent
    FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ck_family_points_topups_points_positive
    CHECK (points_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_family_points_topups_parent_id ON family_points_topups(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_points_topups_created_at ON family_points_topups(created_at);


-- ============================================
-- 6. POS TRANSACTIONS WITH REWARDS
-- ============================================
CREATE TABLE IF NOT EXISTS pos_transactions_with_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  
  -- Amount Details
  base_amount DECIMAL(10,2) NOT NULL,              -- Original price
  markup_amount DECIMAL(10,2) NOT NULL,            -- Markup that funds rewards
  total_amount DECIMAL(10,2) NOT NULL,             -- base + markup
  
  -- Rewards
  points_earned INT NOT NULL,
  
  -- Transaction Details
  description TEXT,
  unit_id UUID,                                    -- Which POS terminal
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_pos_transactions_rewards_student 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_pos_transactions_rewards_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_pos_transactions_rewards_unit 
    FOREIGN KEY (unit_id) REFERENCES operating_units(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_rewards_student_id ON pos_transactions_with_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_rewards_school_id ON pos_transactions_with_rewards(school_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_rewards_created_at ON pos_transactions_with_rewards(created_at);


-- ============================================
-- 7. MATERIALIZED VIEW: STUDENT TIER PROGRESS
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS student_tier_progress AS
SELECT 
  srp.student_id,
  srp.school_id,
  srp.earned_this_cycle AS current_points,
  srp.tier,
  src.tier_silver,
  src.tier_gold,
  src.tier_platinum,
  CASE 
    WHEN srp.tier = 'BRONZE' THEN src.tier_silver - srp.earned_this_cycle
    WHEN srp.tier = 'SILVER' THEN src.tier_gold - srp.earned_this_cycle
    WHEN srp.tier = 'GOLD' THEN src.tier_platinum - srp.earned_this_cycle
    ELSE 0
  END AS points_to_next_tier,
  srp.updated_at
FROM student_rewards_points srp
LEFT JOIN school_rewards_config src ON srp.school_id = src.school_id;

CREATE INDEX IF NOT EXISTS idx_student_tier_progress_student_id 
  ON student_tier_progress(student_id);


-- ============================================
-- 8. FUNCTION: Update Student Tier Based on Points
-- ============================================
CREATE OR REPLACE FUNCTION update_student_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE student_rewards_points
  SET 
    tier = CASE 
      WHEN earned_this_cycle >= 7000 THEN 'PLATINUM'
      WHEN earned_this_cycle >= 3000 THEN 'GOLD'
      WHEN earned_this_cycle >= 1000 THEN 'SILVER'
      ELSE 'BRONZE'
    END,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_student_tier ON student_rewards_points;
CREATE TRIGGER trg_update_student_tier
AFTER UPDATE ON student_rewards_points
FOR EACH ROW
EXECUTE FUNCTION update_student_tier();


-- ============================================
-- 9. FUNCTION: Record Points Transaction
-- ============================================
CREATE OR REPLACE FUNCTION record_points_transaction(
  p_student_id UUID,
  p_school_id UUID,
  p_type VARCHAR,
  p_amount INT,
  p_reference_id VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT 'Transacción de puntos'
)
RETURNS UUID AS $$
DECLARE
  v_tx_id UUID;
  v_current_points INT;
BEGIN
  -- Insert transaction record
  INSERT INTO points_transactions (
    student_id, school_id, transaction_type, points_amount, 
    reference_id, description
  ) VALUES (
    p_student_id, p_school_id, p_type, p_amount, 
    p_reference_id, p_description
  ) RETURNING id INTO v_tx_id;
  
  -- Update student points
  UPDATE student_rewards_points
  SET 
    total_points = total_points + p_amount,
    earned_this_cycle = CASE 
      WHEN p_type = 'EARN' THEN earned_this_cycle + p_amount
      WHEN p_type = 'REDEEM' THEN earned_this_cycle
      ELSE earned_this_cycle
    END,
    redeemed_this_cycle = CASE 
      WHEN p_type = 'REDEEM' THEN redeemed_this_cycle + ABS(p_amount)
      ELSE redeemed_this_cycle
    END,
    updated_at = now()
  WHERE student_id = p_student_id AND school_id = p_school_id;
  
  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 10. POLICIES: Row Level Security (RLS)
-- ============================================

-- Enable RLS on rewards tables
ALTER TABLE school_rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rewards_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_rewards_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_points_topups ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only see their own rewards
DROP POLICY IF EXISTS student_rewards_own ON student_rewards_points;
CREATE POLICY student_rewards_own 
ON student_rewards_points
FOR SELECT
USING ((SELECT auth.uid()::uuid) = (SELECT user_id FROM students WHERE students.id = student_rewards_points.student_id));

DROP POLICY IF EXISTS student_points_transactions_own ON points_transactions;
CREATE POLICY student_points_transactions_own 
ON points_transactions
FOR SELECT
USING ((SELECT auth.uid()::uuid) = (SELECT user_id FROM students WHERE students.id = points_transactions.student_id));
-- Policy: School admins can see rewards for their school
DROP POLICY IF EXISTS school_admin_rewards_config ON school_rewards_config;
CREATE POLICY school_admin_rewards_config 
ON school_rewards_config
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM user_roles 
    WHERE user_id = (SELECT auth.uid()::uuid) 
    AND role IN ('SCHOOL_ADMIN', 'SUPER_ADMIN')
  )
);

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


-- ============================================
-- 11. SEED DATA (Demo/Test)
-- ============================================

-- Example marketplace products
INSERT INTO marketplace_products (name, description, category, points_cost, stock_quantity, current_stock, image_url, featured, popularity_score)
VALUES 
  ('Audífonos Bluetooth', 'Audífonos inalámbricos', 'TECH', 2500, 15, 12, '🎧', true, 95),
  ('Mochila Escolar', 'Mochila resistente', 'SCHOOL_SUPPLIES', 1800, 20, 18, '🎒', true, 88),
  ('Balón Fútbol', 'Balón oficial', 'SPORTS', 1200, 10, 8, '⚽', false, 82),
  ('Gift Card Amazon $500', 'Tarjeta de regalo', 'GIFT_CARDS', 5000, 50, 45, '🎁', true, 98),
  ('Smartwatch Deportivo', 'Reloj inteligente', 'TECH', 4200, 8, 5, '⌚', true, 92),
  ('Set de Arte', 'Kit de pintura', 'SCHOOL_SUPPLIES', 950, 25, 22, '🎨', false, 75),
  ('Entrada Cine 2x1', 'Dos entradas', 'EXPERIENCES', 800, 100, 95, '🎬', false, 85),
  ('Nintendo Switch', 'Consola portátil', 'ENTERTAINMENT', 8500, 3, 2, '🎮', true, 99)
ON CONFLICT DO NOTHING;


-- ============================================
-- 12. BILLING CONFIGURATION - SCHOOL
-- ============================================
CREATE TABLE IF NOT EXISTS school_billing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE,

  -- ========== SETUP & ONE-TIME FEES ==========
  setup_fee DECIMAL(10,2) DEFAULT 25000.00,
  setup_fee_paid_by VARCHAR(20) DEFAULT 'SCHOOL',  -- SCHOOL | CONCESSIONAIRE

  -- ========== MONTHLY/ANNUAL INFRASTRUCTURE ==========
  monthly_rent DECIMAL(10,2) DEFAULT 3500.00,
  annual_license DECIMAL(10,2) DEFAULT 42000.00,

  -- ========== CREDENTIAL/CARD COSTS ==========
  yearly_card_cost DECIMAL(10,2) DEFAULT 140.00,
  card_design_fee DECIMAL(10,2) DEFAULT 0.00,

  -- ========== DEPOSIT FEES (Parents) ==========
  deposit_fee_card DECIMAL(5,3) DEFAULT 0.035,      -- 3.5%
  deposit_fee_spei DECIMAL(10,2) DEFAULT 8.00,      -- $8
  deposit_fee_cash DECIMAL(10,2) DEFAULT 0.00,      -- FREE

  -- ========== POS COMMISSIONS ==========
  pos_markup_percentage DECIMAL(5,3) DEFAULT 0.03,  -- 3%
  pos_commission_percentage DECIMAL(5,3) DEFAULT 0.03,  -- 3%

  -- ========== CONCESSIONAIRE FEES ==========
  concess_monthly_system_fee DECIMAL(10,2) DEFAULT 0.00,
  concess_tech_support_fee DECIMAL(10,2) DEFAULT 0.00,
  concess_card_processing_fee DECIMAL(5,3) DEFAULT 0.00,

  -- ========== EARLY WITHDRAWAL FEE ==========
  early_withdrawal_fee_percentage DECIMAL(5,3) DEFAULT 0.02,  -- 2%

  -- ========== SECURITY LIMITS ==========
  max_deposit_per_tx DECIMAL(10,2) DEFAULT 50000.00,
  student_daily_limit DECIMAL(10,2) DEFAULT 500.00,
  student_weekly_limit DECIMAL(10,2) DEFAULT 2000.00,

  -- ========== PAYMENT TERMS & SUSPENSION ==========
  invoice_due_date INT DEFAULT 10,  -- days
  overdue_days_before_suspension INT DEFAULT 30,  -- 1 month

  billing_cycle VARCHAR(10) DEFAULT 'MONTHLY',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_school_billing_config_school
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_school_billing_config_school_id ON school_billing_config(school_id);


-- ============================================
-- 13. INVOICES & BILLING
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  school_id UUID NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,

  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,

  subtotal DECIMAL(10,2) NOT NULL,
  taxes DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,

  status VARCHAR(20) DEFAULT 'ISSUED',  -- DRAFT | ISSUED | PAID | OVERDUE | CANCELLED
  payment_method VARCHAR(50),  -- SPEI | BANK_TRANSFER
  paid_at TIMESTAMP WITH TIME ZONE,

  line_items JSONB,  -- Array of {description, quantity, unitPrice, amount}
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_invoices_school
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT ck_invoice_status
    CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_school_id ON invoices(school_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);


-- ============================================
-- 14. SCHOOL BLOCKING RULES
-- ============================================
CREATE TABLE IF NOT EXISTS school_blocking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  school_id UUID NOT NULL UNIQUE,
  blocked_reason VARCHAR(50) NOT NULL,  -- OVERDUE_INVOICE | MANUAL_SUSPENSION | POLICY_VIOLATION
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until_payment BOOLEAN DEFAULT true,
  overdue_days INT DEFAULT 0,

  -- Escalation
  notification_sent BOOLEAN DEFAULT false,
  legal_escalation_eligible BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_school_blocking_rules_school
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT ck_blocked_reason
    CHECK (blocked_reason IN ('OVERDUE_INVOICE', 'MANUAL_SUSPENSION', 'POLICY_VIOLATION'))
);

CREATE INDEX IF NOT EXISTS idx_school_blocking_rules_school_id ON school_blocking_rules(school_id);
CREATE INDEX IF NOT EXISTS idx_school_blocking_rules_blocked_until_payment ON school_blocking_rules(blocked_until_payment);


-- ============================================
-- 15. REVENUE TRACKING & ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  school_id UUID NOT NULL,
  period DATE NOT NULL,  -- YYYY-MM-01

  revenue_category VARCHAR(50) NOT NULL,  -- DEPOSIT_FEE | CARD_EMISSION | MONTHLY_RENT | POS_COMMISSION
  amount DECIMAL(10,2) NOT NULL,
  transaction_count INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_revenue_tracking_school
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_revenue_tracking_school_id ON revenue_tracking(school_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_period ON revenue_tracking(period);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_category ON revenue_tracking(revenue_category);


-- ============================================
-- 16. STUDENT FAVORITES / WISHLIST
-- ============================================
CREATE TABLE IF NOT EXISTS student_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  product_id UUID NOT NULL,

  -- Product info (denormalized for quick display)
  product_name VARCHAR(255),
  product_image TEXT,

  -- Privacy control
  is_public BOOLEAN NOT NULL DEFAULT true,  -- Others can see what they want gifted

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT fk_student_favorites_student
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_favorites_school
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_favorites_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

  -- Prevent duplicates (each student can only favorite a product once)
  CONSTRAINT uq_student_product_favorite
    UNIQUE(student_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_student_favorites_student_id ON student_favorites(student_id);
CREATE INDEX IF NOT EXISTS idx_student_favorites_school_id ON student_favorites(school_id);
CREATE INDEX IF NOT EXISTS idx_student_favorites_is_public ON student_favorites(is_public);


-- ============================================
-- MULTI-PARENT: PARENT-STUDENT LINKS
-- ============================================
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  
  role TEXT NOT NULL DEFAULT 'parent',  -- Future: 'titular', 'asociado'
  
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  linked_by UUID NOT NULL,              -- parent_id who created the link
  invitation_code TEXT,                 -- 6-char code for co-parent invite
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
  
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_psl_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_psl_student ON parent_student_links(student_id);

-- ============================================
-- AUTHORIZED CONTACTS (family level)
-- ============================================
CREATE TABLE IF NOT EXISTS authorized_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id TEXT NOT NULL,               -- Shared between co-parents
  
  nombre TEXT NOT NULL,
  parentesco TEXT NOT NULL,              -- "Abuela", "Tío", etc.
  telefono TEXT NOT NULL,
  email TEXT,
  identificacion TEXT NOT NULL,          -- INE number
  foto TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  created_by UUID NOT NULL,             -- parent_id who added
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ac_family ON authorized_contacts(family_id);

-- ============================================
-- EXIT PERMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS exit_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  
  -- Student
  child_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  child_grade TEXT NOT NULL,
  child_group TEXT,
  
  -- Transport
  bus_original TEXT,                     -- Normal bus route
  bus_destino TEXT,                      -- Alternate bus/destination
  transporte TEXT NOT NULL CHECK (transporte IN ('bus_alterno', 'auto_particular', 'a_pie', 'no_asiste', 'otro')),
  transporte_detalle TEXT,
  
  -- Request
  fecha DATE NOT NULL,
  hora_salida TIME,
  motivo TEXT,
  
  -- Authorized person (inline or reference)
  authorized_contact_id UUID REFERENCES authorized_contacts(id),
  persona_nombre TEXT,
  persona_parentesco TEXT,
  persona_telefono TEXT,
  persona_email TEXT,
  persona_identificacion TEXT,
  
  -- Creator
  created_by UUID NOT NULL,
  created_by_name TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado', 'cancelado', 'expirado')),
  
  -- School approval
  school_status TEXT DEFAULT 'pendiente' CHECK (school_status IN ('pendiente', 'aprobado', 'rechazado')),
  school_reviewed_by UUID,
  school_reviewed_by_name TEXT,
  school_reviewed_at TIMESTAMPTZ,
  school_notes TEXT,
  
  -- Notifications
  notif_school BOOLEAN NOT NULL DEFAULT false,
  notif_coparent BOOLEAN NOT NULL DEFAULT false,
  notif_receiving_family BOOLEAN NOT NULL DEFAULT false,
  notif_external_person BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ep_school ON exit_permissions(school_id);
CREATE INDEX IF NOT EXISTS idx_ep_child ON exit_permissions(child_id);
CREATE INDEX IF NOT EXISTS idx_ep_date ON exit_permissions(fecha);
CREATE INDEX IF NOT EXISTS idx_ep_status ON exit_permissions(status);

-- ============================================
-- PERMISSION APPROVALS (multi-parent)
-- ============================================
CREATE TABLE IF NOT EXISTS permission_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id UUID NOT NULL REFERENCES exit_permissions(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL,
  parent_name TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  
  device_info TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pa_permission ON permission_approvals(permission_id);

-- ============================================
-- SCHOOL PERMISSION CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS school_permission_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE,
  
  horas_anticipacion INT NOT NULL DEFAULT 6,
  requiere_dos_aprobaciones BOOLEAN NOT NULL DEFAULT false,
  hora_limite_solicitud TIME NOT NULL DEFAULT '14:00',
  dias_permitidos TEXT[] NOT NULL DEFAULT ARRAY['LUN','MAR','MIE','JUE','VIE'],
  requiere_identificacion BOOLEAN NOT NULL DEFAULT true,
  permitir_no_asiste BOOLEAN NOT NULL DEFAULT true,
  max_permisos_por_semana INT NOT NULL DEFAULT 0,  -- 0 = sin limite
  notificar_direccion BOOLEAN NOT NULL DEFAULT true,
  requiere_motivo BOOLEAN NOT NULL DEFAULT true,
  mensaje_personalizado TEXT DEFAULT '',
  bloqueo_en_examenes BOOLEAN NOT NULL DEFAULT false,
  fechas_examen DATE[] DEFAULT ARRAY[]::DATE[],
  rutas_camion TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SCHOOL TRIPS
-- ============================================
CREATE TABLE IF NOT EXISTS school_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  
  nombre TEXT NOT NULL,
  destino TEXT NOT NULL,
  descripcion TEXT,
  
  fecha_salida DATE NOT NULL,
  fecha_regreso DATE NOT NULL,
  
  costo_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  costo_por_alumno DECIMAL(10,2) NOT NULL,
  
  cupo_maximo INT NOT NULL,
  cupo_disponible INT NOT NULL,
  
  grados_permitidos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'abierto', 'cerrado', 'completado', 'cancelado')),
  
  fecha_limite_pago DATE,
  fecha_limite_inscripcion DATE,
  
  permite_parcialidades BOOLEAN NOT NULL DEFAULT false,
  numero_parcialidades INT NOT NULL DEFAULT 1,
  
  requiere_documentos BOOLEAN NOT NULL DEFAULT false,
  documentos_requeridos TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  itinerario TEXT,
  contacto_emergencia TEXT,
  notas TEXT,
  image_emoji TEXT DEFAULT '🎒',
  
  creado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_st_school ON school_trips(school_id);
CREATE INDEX IF NOT EXISTS idx_st_status ON school_trips(status);

-- ============================================
-- TRIP ENROLLMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS trip_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES school_trips(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_grade TEXT NOT NULL,
  parent_id UUID NOT NULL,
  parent_name TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'inscrito' CHECK (status IN ('inscrito', 'pagado_parcial', 'pagado', 'cancelado', 'lista_espera')),
  
  total_pagado DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  documentos_entregados TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  approved_by_parent BOOLEAN NOT NULL DEFAULT false,
  approval_date TIMESTAMPTZ,
  
  inscrito_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(trip_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_te_trip ON trip_enrollments(trip_id);
CREATE INDEX IF NOT EXISTS idx_te_student ON trip_enrollments(student_id);

-- ============================================
-- TRIP PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS trip_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES trip_enrollments(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL,
  student_id UUID NOT NULL,
  student_name TEXT,
  
  monto DECIMAL(10,2) NOT NULL,
  parcialidad INT NOT NULL DEFAULT 1,
  total_parcialidades INT NOT NULL DEFAULT 1,
  
  metodo_pago TEXT,              -- SPEI, Tarjeta, Efectivo
  comprobante TEXT,
  
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'rechazado')),
  
  fecha_pago TIMESTAMPTZ,
  fecha_limite DATE,
  
  registrado_por UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tp_enrollment ON trip_payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_tp_trip ON trip_payments(trip_id);

-- ============================================
-- TRIP REMINDERS
-- ============================================
CREATE TABLE IF NOT EXISTS trip_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES school_trips(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('pago', 'documento', 'general', 'inscripcion')),
  mensaje TEXT NOT NULL,
  
  destinatarios UUID[] DEFAULT ARRAY[]::UUID[],
  
  fecha_envio TIMESTAMPTZ NOT NULL,
  enviado BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG (multi-parent audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  
  action TEXT NOT NULL,           -- deposit, limit_change, permission_create, etc.
  entity_type TEXT NOT NULL,      -- student, permission, trip, wallet, contact, parent
  entity_id TEXT NOT NULL,
  
  details TEXT NOT NULL,          -- Human-readable description
  metadata JSONB,
  
  device_info TEXT,
  ip_address TEXT,
  
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_al_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_al_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_al_timestamp ON activity_log(timestamp DESC);

-- ============================================
-- NOTIFICATIONS (referenced in code, now defined)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  recipient_id UUID NOT NULL,
  recipient_role TEXT NOT NULL,
  
  type TEXT NOT NULL,
  
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  
  data JSONB,
  
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(recipient_id) WHERE read_at IS NULL;

-- ============================================
-- BIRTHDAY POOLS (Colectas de cumpleaños)
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birthday_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  creator_type TEXT NOT NULL CHECK (creator_type IN ('STUDENT', 'PARENT')),
  target_product_id UUID,
  target_product_name TEXT NOT NULL,
  target_product_image TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  collected_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FUNDED', 'DELIVERED', 'EXPIRED', 'REFUNDED')),
  birthday_date DATE NOT NULL,
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  funded_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pools_student ON birthday_pools(birthday_student_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON birthday_pools(status) WHERE status = 'OPEN';

-- POOL CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES birthday_pools(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL,
  contributor_type TEXT NOT NULL CHECK (contributor_type IN ('STUDENT', 'PARENT')),
  contributor_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  refunded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contributions_pool ON pool_contributions(pool_id);

-- ============================================
-- AUTO-RELOAD CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS auto_reload_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  threshold_amount DECIMAL(12,2) NOT NULL DEFAULT 100,
  reload_amount DECIMAL(12,2) NOT NULL DEFAULT 300,
  payment_method TEXT NOT NULL DEFAULT 'CARD' CHECK (payment_method IN ('CARD', 'SPEI')),
  max_daily_reloads INTEGER NOT NULL DEFAULT 1,
  last_reload_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_autoreload_parent ON auto_reload_config(parent_id);
CREATE INDEX IF NOT EXISTS idx_autoreload_active ON auto_reload_config(student_id) WHERE enabled = TRUE;

-- ============================================
-- PROFILES (Auth user profiles — maps auth.users to app data)
-- ============================================
-- Used by: supabaseAuth.ts, supabaseSocial.ts, useTransactions.ts
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,  -- matches auth.users.id
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT,       -- matrícula (nullable for staff)
  
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN (
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'SCHOOL_FINANCE',
    'UNIT_MANAGER', 'POS_OPERATOR', 'CAFETERIA_STAFF',
    'STATIONERY_STAFF', 'CASHIER', 'PARENT', 'STUDENT'
  )),
  
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  grade TEXT,
  
  -- Wallet (denormalized for fast reads)
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Social features
  favorites TEXT[] DEFAULT '{}',         -- product IDs
  favorites_public BOOLEAN NOT NULL DEFAULT TRUE,
  allergies TEXT[] DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  photo_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
CREATE POLICY "profiles_own_read" ON profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- Same-school users can search each other (for friend lookup)
DROP POLICY IF EXISTS "profiles_school_read" ON profiles;
CREATE POLICY "profiles_school_read" ON profiles FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM profiles WHERE id = (SELECT auth.uid())
  ));

-- Super admins full access
DROP POLICY IF EXISTS "profiles_super_admin" ON profiles;
CREATE POLICY "profiles_super_admin" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- FRIENDSHIPS (Social graph between students)
-- ============================================
-- Used by: supabaseSocial.ts (addFriend, getFriends)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(user_id, status);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can manage their own friendships
DROP POLICY IF EXISTS "friendships_own" ON friendships;
CREATE POLICY "friendships_own" ON friendships FOR ALL
  USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

-- ============================================
-- INVENTORY ITEMS (Products available in units)
-- ============================================
-- Used by: supabaseInventory.ts, supabaseSocial.ts (gift item join)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES operating_units(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2),
  
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  max_stock INTEGER,
  
  image_url TEXT,
  barcode TEXT,
  
  -- Nutritional / dietary
  allergens TEXT[] DEFAULT '{}',
  is_healthy BOOLEAN NOT NULL DEFAULT FALSE,
  calories INTEGER,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_unit ON inventory_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_inventory_school ON inventory_items(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view active inventory
DROP POLICY IF EXISTS "inventory_read_auth" ON inventory_items;
CREATE POLICY "inventory_read_auth" ON inventory_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Unit managers and staff can manage their unit's inventory
DROP POLICY IF EXISTS "inventory_manage_unit" ON inventory_items;
CREATE POLICY "inventory_manage_unit" ON inventory_items FOR ALL
  USING (unit_id IN (
    SELECT ou.id FROM operating_units ou
    JOIN user_roles ur ON ur.school_id = ou.school_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('UNIT_MANAGER', 'CAFETERIA_STAFF', 'STATIONERY_STAFF', 'SCHOOL_ADMIN')
  ));

-- ============================================
-- TRANSACTIONS (POS sales, purchases, deposits)
-- ============================================
-- Used by: supabasePos.ts, useTransactions.ts, useRealtime.ts
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES operating_units(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'deposit', 'refund', 'adjustment', 'gift')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  
  amount DECIMAL(12,2) NOT NULL,
  items JSONB DEFAULT '[]',  -- Cart snapshot [{ id, name, qty, price }]
  
  payment_method TEXT CHECK (payment_method IN ('nfc', 'qr', 'cash', 'card', 'wallet', 'spei')),
  
  -- Reference data
  receipt_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_school ON transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_transactions_unit ON transactions(unit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Students see their own transactions
DROP POLICY IF EXISTS "transactions_student_own" ON transactions;
CREATE POLICY "transactions_student_own" ON transactions FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = (SELECT auth.uid())
  ));

-- POS operators can insert transactions for their unit
DROP POLICY IF EXISTS "transactions_pos_insert" ON transactions;
CREATE POLICY "transactions_pos_insert" ON transactions FOR INSERT
  WITH CHECK (school_id IN (
    SELECT school_id FROM user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('POS_OPERATOR', 'CAFETERIA_STAFF', 'STATIONERY_STAFF', 'CASHIER', 'UNIT_MANAGER')
  ));

-- School admins can see all school transactions
DROP POLICY IF EXISTS "transactions_school_admin" ON transactions;
CREATE POLICY "transactions_school_admin" ON transactions FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('SCHOOL_ADMIN', 'SCHOOL_FINANCE')
  ));

-- Super admins see everything
DROP POLICY IF EXISTS "transactions_super_admin" ON transactions;
CREATE POLICY "transactions_super_admin" ON transactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- ============================================
-- ALTER gifts — add school_id for social service
-- ============================================
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_gifts_school ON gifts(school_id);

-- ============================================
-- HELPER FUNCTION: Decrement inventory stock (used by POS)
-- ============================================
CREATE OR REPLACE FUNCTION decrement_inventory_stock(p_item_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock
  INTO current_stock
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE inventory_items
  SET stock = stock - p_quantity,
      status = CASE
        WHEN (stock - p_quantity) = 0 THEN 'out_of_stock'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = p_item_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-create profile on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
