-- ============================================
-- MECARD REWARDS SYSTEM - SUPABASE SCHEMA
-- ============================================
-- Versión: 1.0
-- Fecha: 2026-02-12
-- Propósito: Tablas necesarias para MeCard Rewards
-- Estado: LISTA PARA IMPLEMENTAR

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

CREATE INDEX idx_school_rewards_config_school_id ON school_rewards_config(school_id);


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

CREATE INDEX idx_student_rewards_points_student_id ON student_rewards_points(student_id);
CREATE INDEX idx_student_rewards_points_school_id ON student_rewards_points(school_id);
CREATE UNIQUE INDEX idx_student_rewards_points_unique 
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

CREATE INDEX idx_points_transactions_student_id ON points_transactions(student_id);
CREATE INDEX idx_points_transactions_school_id ON points_transactions(school_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);


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

CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_products_school_id ON marketplace_products(school_id);
CREATE INDEX idx_marketplace_products_available ON marketplace_products(available);
CREATE INDEX idx_marketplace_products_featured ON marketplace_products(featured);


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

CREATE INDEX idx_student_redemptions_student_id ON student_redemptions(student_id);
CREATE INDEX idx_student_redemptions_school_id ON student_redemptions(school_id);
CREATE INDEX idx_student_redemptions_product_id ON student_redemptions(product_id);
CREATE INDEX idx_student_redemptions_status ON student_redemptions(status);
CREATE INDEX idx_student_redemptions_created_at ON student_redemptions(created_at);


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

CREATE INDEX idx_pos_transactions_rewards_student_id ON pos_transactions_with_rewards(student_id);
CREATE INDEX idx_pos_transactions_rewards_school_id ON pos_transactions_with_rewards(school_id);
CREATE INDEX idx_pos_transactions_rewards_created_at ON pos_transactions_with_rewards(created_at);


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

CREATE INDEX idx_student_tier_progress_student_id 
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
  p_description TEXT DEFAULT NULL
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

-- Policy: Students can only see their own rewards
CREATE POLICY student_rewards_own 
ON student_rewards_points
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM students WHERE id = student_id));

CREATE POLICY student_points_transactions_own 
ON points_transactions
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM students WHERE id = student_id));

-- Policy: School admins can see rewards for their school
CREATE POLICY school_admin_rewards_config 
ON school_rewards_config
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM user_school_roles 
    WHERE user_id = auth.uid() 
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

CREATE INDEX idx_school_billing_config_school_id ON school_billing_config(school_id);


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

CREATE INDEX idx_invoices_school_id ON invoices(school_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);


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

CREATE INDEX idx_school_blocking_rules_school_id ON school_blocking_rules(school_id);
CREATE INDEX idx_school_blocking_rules_blocked_until_payment ON school_blocking_rules(blocked_until_payment);


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

CREATE INDEX idx_revenue_tracking_school_id ON revenue_tracking(school_id);
CREATE INDEX idx_revenue_tracking_period ON revenue_tracking(period);
CREATE INDEX idx_revenue_tracking_category ON revenue_tracking(revenue_category);


-- ============================================
-- 12. NOTAS IMPORTANTES
-- ============================================
/*

PRÓXIMOS PASOS:

1. Crear tablas base si no existen:
   - users
   - schools
   - students
   - operating_units
   - user_school_roles

2. Agregar campos a StudentProfile (en types.ts):
   - rewardsPoints?: StudentRewardsPoints
   - school_id: UUID

3. Integración en ServiceContext:
   - rewardsService llamará a estas funciones SQL
   - Mock functions → Real Supabase queries

4. Ciclo de Cierre (Automático):
   - Trigger: Al cambiar cycle_end_date, expirar puntos
   - Backup de puntos remanentes en tabla histórica

*/
