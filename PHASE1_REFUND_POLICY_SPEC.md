# FASE 1: Refund Policy Implementation Specification

**Status**: Ready for Development  
**Priority**: P1 — Core Business Logic  
**Timeline**: This Sprint  
**Owner**: Team  

---

## 1. Executive Summary

Implementar políticas de reembolsos uniforme en 6 módulos (Pool, POS, Gifts, Marketplace, Deposits, School) con:
- ✅ Auto-conversión de pools a puntos en 30 días
- ✅ Gestión manual de devoluciones colegiales en batch cada 15 días
- ✅ Settlement ledger para reconciliación escuela/concessionaire
- ✅ RLS policies para visibilidad multi-actor

---

## 2. Refund Policy Matrix (CONFIRMED)

| Módulo | Evento | Beneficiario | Formato | Aprobación | SLA | Ledger | Estado |
|--------|--------|---|---|---|---|---|---|
| **POOL** | Producto más barato | Cada contribuyente (pro-rata) | Dinero → wallet | Auto | 5 min | `pool_refunds` | ✅ Implementado Q1 2026 |
| **POOL** | Pool cancelado | Contribuyentes originales | Dinero → wallet | Auto | 5 min | `pool_refunds` | ✅ Implementado Q1 2026 |
| **POOL** | 30+ días post-cumpleaños sin canjear | Contribuyentes | **Puntos** | Auto diario | Diario | `pool_refunds` + `points_ledger` | 🆕 Esta FASE |
| **POS** | Compra anulada (pedido anticipado) | Wallet alumno | Dinero → wallet | Auto | Instant | `transactions` type='refund' | ✅ Existe |
| **POS** | Compra anulada con efectivo | POS (cash drawer) | Efectivo (mano) | Auto | At POS | `transactions` | 🆕 Config `accepts_cash` |
| **GIFT** | Rechazo | Wallet receptor | Dinero → wallet | Auto | Instant | `transactions` | ✅ Existe |
| **GIFT** | No reclamado 2 semanas | Wallet remitente | Dinero → wallet | Auto | Instant | `transactions` | ✅ Existe |
| **MARKETPLACE** | Canje rechazado | Puntos reverso | Puntos | Auto | 1 min | `points_ledger` | ✅ Existe |
| **DEPOSIT** | Error | Original method | Payment processor | Auto | 1-3 días | Payment log | ✅ Existe |
| **SCHOOL/CONC** | Servicio no prestado | Colegio/Conc | Dinero acumulado | Manual cada 15d | Batch | `pending_school_refunds` → `school_refund_settlements` | 🆕 Esta FASE |

---

## 3. Database Schema Changes

### 3.1 New Tables

#### `platform_settings`
```sql
-- Global platform configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pool → Points Conversion
  pool_to_points_exchange_rate DECIMAL(3,2) DEFAULT 1.0,  -- 1.0 = 1:1
  pool_points_expiry_days INTEGER DEFAULT 30,  -- 30 días post-cumpleaños
  
  -- School Refund Batch Processing
  school_refund_batch_interval_days INTEGER DEFAULT 15,  -- 15-day cycle
  
  -- POS Configuration
  default_pos_accepts_cash BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only SUPER_ADMIN can modify
DROP POLICY IF EXISTS "platform_settings_super_admin" ON platform_settings;
CREATE POLICY "platform_settings_super_admin" ON platform_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));

-- Authenticated users can read
DROP POLICY IF EXISTS "platform_settings_read" ON platform_settings;
CREATE POLICY "platform_settings_read" ON platform_settings FOR SELECT
  USING (auth.role() = 'authenticated');
```

#### `school_settings`
```sql
-- Per-school configuration
CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Pool Points Conversion
  pool_points_multiplier DECIMAL(2,2) DEFAULT 1.0,  -- Válues points awarded per peso (1.0 = 100 puntos per $100)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_settings_school ON school_settings(school_id);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

-- School admin sees own school
DROP POLICY IF EXISTS "school_settings_own" ON school_settings;
CREATE POLICY "school_settings_own" ON school_settings FOR ALL
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

-- Super admin sees all
DROP POLICY IF EXISTS "school_settings_super_admin" ON school_settings;
CREATE POLICY "school_settings_super_admin" ON school_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));
```

#### `points_ledger`
```sql
-- Track all point transactions (pools, marketplace, etc.)
CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'POOL_CONVERSION',  -- Pool refund converted to points
    'MARKETPLACE_PURCHASE',  -- Points purchased
    'MARKETPLACE_REDEMPTION',  -- Points used
    'MARKETPLACE_REVERSAL',  -- Canje rejected
    'ADMIN_ADJUSTMENT',  -- Manual adjustment
    'GIFT_POINTS'  -- Future: gifts in points
  )),
  
  amount INT NOT NULL CHECK (amount != 0),  -- Positive for earn, negative for spend
  
  -- Reference to source transaction
  source_module TEXT,  -- 'pool', 'marketplace', 'gift', 'admin'
  source_id UUID,  -- pool_id, marketplace_txn_id, etc.
  source_description TEXT,
  
  balance_after INT NOT NULL,  -- Denormalized point balance
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_student ON points_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_school ON points_ledger(school_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_type ON points_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_ledger_created ON points_ledger(created_at DESC);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Students see their own points
DROP POLICY IF EXISTS "points_own" ON points_ledger;
CREATE POLICY "points_own" ON points_ledger FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = (SELECT auth.uid())
  ));

-- Parents see their child's points
DROP POLICY IF EXISTS "points_parent" ON points_ledger;
CREATE POLICY "points_parent" ON points_ledger FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN parent_student_links psl ON s.id = psl.student_id
    WHERE psl.parent_id = (SELECT auth.uid())
  ));

-- School admin sees all school points
DROP POLICY IF EXISTS "points_school_admin" ON points_ledger;
CREATE POLICY "points_school_admin" ON points_ledger FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

-- Super admin sees everything
DROP POLICY IF EXISTS "points_super_admin" ON points_ledger;
CREATE POLICY "points_super_admin" ON points_ledger FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));
```

#### `pending_school_refunds`
```sql
-- Manual 15-day batch refund tracking for schools/concessionaires
CREATE TABLE IF NOT EXISTS pending_school_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  concessionaire_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- If refund is to concessionaire unit
  
  -- Batch cycle tracking
  batch_number INT NOT NULL,  -- Incremental batch ID (1, 2, 3...)
  batch_start_date DATE NOT NULL,
  batch_due_date DATE NOT NULL,  -- batch_start_date + 15 days
  
  -- Refund details
  refund_reason TEXT NOT NULL CHECK (refund_reason IN (
    'service_not_used',  -- Service no prestado (mes/vacaciones)
    'partial_service',  -- Servicio parcial
    'error_correction',  -- Corrección de error
    'other'
  )),
  
  description TEXT NOT NULL,
  total_amount_pending DECIMAL(12,2) NOT NULL CHECK (total_amount_pending > 0),
  
  -- Itemization
  items JSONB NOT NULL DEFAULT '[]',  -- Array of {amount, description, original_transaction_id, date}
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'settled')),
  
  -- Approval workflow
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- SUPER_ADMIN who approves
  rejection_reason TEXT,  -- If rejected
  
  -- Settlement
  settled_at TIMESTAMPTZ,
  settled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  settlement_reference TEXT,  -- Settlement transaction ID
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_refunds_school ON pending_school_refunds(school_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_batch ON pending_school_refunds(batch_number, school_id);
CREATE INDEX IF NOT EXISTS idx_pending_refunds_status ON pending_school_refunds(status) WHERE status IN ('pending', 'approved');
CREATE INDEX IF NOT EXISTS idx_pending_refunds_due_date ON pending_school_refunds(batch_due_date);

ALTER TABLE pending_school_refunds ENABLE ROW LEVEL SECURITY;

-- School admin sees own school pending refunds
DROP POLICY IF EXISTS "pending_refunds_school_admin" ON pending_school_refunds;
CREATE POLICY "pending_refunds_school_admin" ON pending_school_refunds FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

-- Super admin can view and approve all
DROP POLICY IF EXISTS "pending_refunds_super_admin" ON pending_school_refunds;
CREATE POLICY "pending_refunds_super_admin" ON pending_school_refunds FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));
```

#### `school_refund_settlements`
```sql
-- Settlement ledger: what was actually paid out to schools/concessionaires
CREATE TABLE IF NOT EXISTS school_refund_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  concessionaire_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Batch reference
  batch_id UUID NOT NULL REFERENCES pending_school_refunds(id) ON DELETE RESTRICT,
  
  -- Settlement details
  total_settled_amount DECIMAL(12,2) NOT NULL CHECK (total_settled_amount > 0),
  
  -- Payment method
  settlement_method TEXT NOT NULL CHECK (settlement_method IN (
    'bank_transfer',  -- Direct to school bank account
    'wallet_credit',  -- Added to school wallet (if applicable)
    'check',
    'cash',
    'other'
  )),
  
  settlement_reference TEXT NOT NULL,  -- CLABE, check number, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'failed', 'disputed')),
  
  -- Confirmation
  settled_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,  -- When school confirms receipt
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,  -- SUPER_ADMIN
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_school ON school_refund_settlements(school_id);
CREATE INDEX IF NOT EXISTS idx_settlements_batch ON school_refund_settlements(batch_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON school_refund_settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_date ON school_refund_settlements(settled_at DESC);

ALTER TABLE school_refund_settlements ENABLE ROW LEVEL SECURITY;

-- School admin sees own school settlements
DROP POLICY IF EXISTS "settlements_school_admin" ON school_refund_settlements;
CREATE POLICY "settlements_school_admin" ON school_refund_settlements FOR SELECT
  USING (school_id IN (
    SELECT school_id FROM user_roles WHERE user_id = (SELECT auth.uid())
  ));

-- Super admin full access
DROP POLICY IF EXISTS "settlements_super_admin" ON school_refund_settlements;
CREATE POLICY "settlements_super_admin" ON school_refund_settlements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'SUPER_ADMIN'
  ));
```

### 3.2 Modified Tables

#### `pool_refunds` — Add Auto-Conversion Columns
```sql
-- Add columns to track 30-day auto-conversion to points
ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS 
  auto_refund_to_points_at TIMESTAMPTZ;
  -- Calculated as: (pool.birthday_date + 30)

ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS
  converted_to_points_at TIMESTAMPTZ;
  -- Set when conversion actually executed

ALTER TABLE pool_refunds ADD COLUMN IF NOT EXISTS
  points_awarded INT;
  -- Number of points awarded (calculated as refund_amount × school_multiplier)

-- Index for finding pending conversions (daily job)
CREATE INDEX IF NOT EXISTS idx_pool_refunds_pending_conversion 
  ON pool_refunds(auto_refund_to_points_at) 
  WHERE converted_to_points_at IS NULL AND status = 'processed';
```

#### `operating_units` — Add Cash Acceptance Config
```sql
-- Add per-POS cash acceptance configuration
ALTER TABLE operating_units ADD COLUMN IF NOT EXISTS
  accepts_cash BOOLEAN NOT NULL DEFAULT FALSE;
  -- SUPER_ADMIN configures per POS unit
  -- Affects: POS refund logic, payment method availability
```

#### `transactions` — Add Refund Type Tracking
```sql
-- Enhance transaction tracking for refunds
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  refund_reason TEXT CHECK (refund_reason IN (
    'pool_cheaper',  -- Pool changed to cheaper product
    'pool_cancelled',  -- Pool cancelled
    'gift_rejected',  -- Gift recipient rejected
    'pos_early_cancel',  -- POS early purchase cancelled
    'pos_error',  -- POS transaction error
    'deposit_error',  -- Deposit/reload error
    'marketplace_reversal',  -- Marketplace canje rejected
    'admin_adjustment'  -- Manual admin adjustment
  ));

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  refund_type TEXT CHECK (refund_type IN (
    'pool', 'pos', 'gift', 'marketplace', 'deposit', 'school', 'admin'
  ));
```

---

## 4. Service Layer

### 4.1 `supabaseRefunds.ts` — Main Refund Service

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import {
  PoolRefund, PendingSchoolRefund, SchoolRefundSettlement,
  PointsLedgerEntry, PlatformSettings, SchoolSettings
} from '../types';

export class RefundService {
  constructor(private supabase: SupabaseClient) {}

  // =========== POOL REFUNDS ===========

  /**
   * Convert pool refunds to points if 30+ days have passed since birthday
   * Called by: Scheduled daily task via database function or Edge Function
   * Returns: Count of pools converted
   */
  async convertExpiredPoolRefundsToPoints(): Promise<{ converted: number; errors: string[] }> {
    const errors: string[] = [];
    let converted = 0;

    // Get platform settings
    const { data: settings } = await this.supabase
      .from('platform_settings')
      .select('pool_points_expiry_days')
      .single();

    const expiryDays = settings?.pool_points_expiry_days || 30;

    // Find all pool refunds eligible for conversion
    const { data: refunds, error: fetchError } = await this.supabase
      .from('pool_refunds')
      .select('*, birthday_pools(*), profiles(school_id)')
      .eq('status', 'processed')
      .is('converted_to_points_at', null)
      .lt('auto_refund_to_points_at', new Date().toISOString());

    if (fetchError) {
      errors.push(`Fetch error: ${fetchError.message}`);
      return { converted: 0, errors };
    }

    // Process each refund
    for (const refund of refunds || []) {
      try {
        const points = await this.calculatePoolToPoints(
          refund.refund_amount,
          refund.profiles.school_id
        );

        // Create points ledger entry
        await this.supabase
          .from('points_ledger')
          .insert({
            student_id: refund.contributor_id,
            school_id: refund.profiles.school_id,
            transaction_type: 'POOL_CONVERSION',
            amount: points,
            source_module: 'pool',
            source_id: refund.pool_id,
            source_description: `Pool refund converted to points (30+ days)`,
            balance_after: 0,  // Will be calculated by trigger
            created_at: new Date().toISOString()
          });

        // Mark refund as converted
        await this.supabase
          .from('pool_refunds')
          .update({
            converted_to_points_at: new Date().toISOString(),
            points_awarded: points
          })
          .eq('id', refund.id);

        converted++;
      } catch (err) {
        errors.push(`Pool ${refund.pool_id}: ${(err as Error).message}`);
      }
    }

    return { converted, errors };
  }

  /**
   * Calculate points from refund amount based on school settings
   */
  private async calculatePoolToPoints(amount: number, schoolId: string): Promise<number> {
    const { data: schoolSettings } = await this.supabase
      .from('school_settings')
      .select('pool_points_multiplier')
      .eq('school_id', schoolId)
      .single();

    const multiplier = schoolSettings?.pool_points_multiplier || 1.0;
    return Math.round(amount * multiplier);  // 1:1 by default, school can configure
  }

  // =========== SCHOOL REFUNDS ===========

  /**
   * Create pending school/concessionaire refund for manual approval
   */
  async createPendingSchoolRefund(params: {
    schoolId: string;
    concessionaireId?: string;
    reason: 'service_not_used' | 'partial_service' | 'error_correction' | 'other';
    description: string;
    items: Array<{ amount: number; description: string; transactionId?: string; date: string }>;
  }): Promise<PendingSchoolRefund | null> {
    const totalAmount = params.items.reduce((sum, item) => sum + item.amount, 0);

    // Get current batch number
    const { data: lastBatch } = await this.supabase
      .from('pending_school_refunds')
      .select('batch_number')
      .eq('school_id', params.schoolId)
      .order('batch_number', { ascending: false })
      .limit(1)
      .single();

    const newBatchNumber = (lastBatch?.batch_number || 0) + 1;

    const batchStartDate = new Date();
    const batchDueDate = new Date(batchStartDate);
    batchDueDate.setDate(batchDueDate.getDate() + 15);

    const { data, error } = await this.supabase
      .from('pending_school_refunds')
      .insert({
        school_id: params.schoolId,
        concessionaire_id: params.concessionaireId,
        batch_number: newBatchNumber,
        batch_start_date: batchStartDate.toISOString().split('T')[0],
        batch_due_date: batchDueDate.toISOString().split('T')[0],
        refund_reason: params.reason,
        description: params.description,
        total_amount_pending: totalAmount,
        items: params.items
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pending refund:', error);
      return null;
    }

    return data;
  }

  /**
   * Get pending school refunds for super admin approval
   */
  async getPendingSchoolRefunds(filters?: {
    schoolId?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'settled';
    batchNumber?: number;
  }): Promise<PendingSchoolRefund[]> {
    let query = this.supabase
      .from('pending_school_refunds')
      .select('*');

    if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.batchNumber) query = query.eq('batch_number', filters.batchNumber);

    const { data, error } = await query.order('batch_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching pending refunds:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Approve pending school refund batch (SUPER_ADMIN only)
   */
  async approvePendingRefund(
    refundId: string,
    approvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('pending_school_refunds')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      })
      .eq('id', refundId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Reject pending school refund with reason
   */
  async rejectPendingRefund(
    refundId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('pending_school_refunds')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        approved_by: rejectedBy
      })
      .eq('id', refundId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Process settlement for approved school refund
   */
  async settleApprovedRefund(
    refundId: string,
    settlementParams: {
      method: 'bank_transfer' | 'wallet_credit' | 'check' | 'cash' | 'other';
      reference: string;  // CLABE, check number, etc.
      notes?: string;
    },
    settledBy: string
  ): Promise<{ success: boolean; settlementId?: string; error?: string }> {
    // Get the pending refund
    const { data: pendingRefund, error: fetchError } = await this.supabase
      .from('pending_school_refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (fetchError || !pendingRefund) {
      return { success: false, error: 'Refund not found' };
    }

    // Create settlement record
    const { data: settlement, error: insertError } = await this.supabase
      .from('school_refund_settlements')
      .insert({
        school_id: pendingRefund.school_id,
        concessionaire_id: pendingRefund.concessionaire_id,
        batch_id: refundId,
        total_settled_amount: pendingRefund.total_amount_pending,
        settlement_method: settlementParams.method,
        settlement_reference: settlementParams.reference,
        status: 'pending',
        settled_at: new Date().toISOString(),
        notes: settlementParams.notes,
        created_by: settledBy
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Mark pending refund as settled
    await this.supabase
      .from('pending_school_refunds')
      .update({ status: 'settled', settled_at: new Date().toISOString(), settled_by: settledBy })
      .eq('id', refundId);

    return { success: true, settlementId: settlement?.id };
  }

  // =========== POS REFUNDS ===========

  /**
   * Validate if POS accepts cash (check operating_units.accepts_cash)
   */
  async validatePosAcceptsCash(unitId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('operating_units')
      .select('accepts_cash')
      .eq('id', unitId)
      .single();

    if (error || !data) return false;
    return data.accepts_cash;
  }

  // =========== PLATFORM & SCHOOL SETTINGS ===========

  /**
   * Get current platform settings
   */
  async getPlatformSettings(): Promise<PlatformSettings | null> {
    const { data, error } = await this.supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Update platform settings (SUPER_ADMIN only)
   */
  async updatePlatformSettings(
    updates: Partial<PlatformSettings>,
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('platform_settings')
      .update({ ...updates, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .limit(1);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Get school-specific settings
   */
  async getSchoolSettings(schoolId: string): Promise<SchoolSettings | null> {
    const { data, error } = await this.supabase
      .from('school_settings')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (error) {
      // Create default if not exists
      if (error.code === 'PGRST116') {  // Not found
        const { data: newSettings } = await this.supabase
          .from('school_settings')
          .insert({ school_id: schoolId })
          .select()
          .single();
        return newSettings || null;
      }
      return null;
    }
    return data;
  }

  /**
   * Update school settings (SCHOOL_ADMIN or SUPER_ADMIN)
   */
  async updateSchoolSettings(
    schoolId: string,
    updates: Partial<SchoolSettings>
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('school_settings')
      .update(updates)
      .eq('school_id', schoolId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}
```

---

## 5. Type Definitions

Add to `src/types.ts`:

```typescript
// ===== REFUND TYPES =====

export interface PlatformSettings {
  id: string;
  pool_to_points_exchange_rate: number;  // 1.0 = 1:1
  pool_points_expiry_days: number;  // 30
  school_refund_batch_interval_days: number;  // 15
  default_pos_accepts_cash: boolean;
  updated_at: string;
  updated_by?: string;
}

export interface SchoolSettings {
  id: string;
  school_id: string;
  pool_points_multiplier: number;  // 1.0 = 1:1, can be customized per school
  created_at: string;
  updated_at: string;
}

export interface PointsLedgerEntry {
  id: string;
  student_id: string;
  school_id: string;
  transaction_type: 'POOL_CONVERSION' | 'MARKETPLACE_PURCHASE' | 'MARKETPLACE_REDEMPTION' | 'MARKETPLACE_REVERSAL' | 'ADMIN_ADJUSTMENT' | 'GIFT_POINTS';
  amount: number;  // Positive = earn, Negative = spend
  source_module: 'pool' | 'marketplace' | 'gift' | 'admin';
  source_id?: string;
  source_description?: string;
  balance_after: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PendingSchoolRefund {
  id: string;
  school_id: string;
  concessionaire_id?: string;
  batch_number: number;
  batch_start_date: string;  // YYYY-MM-DD
  batch_due_date: string;  // YYYY-MM-DD (start + 15 days)
  refund_reason: 'service_not_used' | 'partial_service' | 'error_correction' | 'other';
  description: string;
  total_amount_pending: number;
  items: Array<{
    amount: number;
    description: string;
    original_transaction_id?: string;
    date: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  settled_at?: string;
  settled_by?: string;
  settlement_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolRefundSettlement {
  id: string;
  school_id: string;
  concessionaire_id?: string;
  batch_id: string;  // PendingSchoolRefund.id
  total_settled_amount: number;
  settlement_method: 'bank_transfer' | 'wallet_credit' | 'check' | 'cash' | 'other';
  settlement_reference: string;
  status: 'pending' | 'in_transit' | 'completed' | 'failed' | 'disputed';
  settled_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

---

## 6. Admin UI Components (Foundation)

### 6.1 Planned Components

- **`AdminPoolRefundsManager.tsx`** — View pool refunds, track 30-day countdown, view converted points
- **`AdminSchoolRefundsBatchProcessor.tsx`** — Manage pending school refunds, 15-day batch workflow
- **`AdminSettlementsTracker.tsx`** — Track settlements, confirm delivery, dispute handling
- **`PlatformSettingsPanel.tsx`** — SUPER_ADMIN: Configure pool expiry days, exchange rates, batch intervals
- **`SchoolSettingsPanel.tsx`** — SCHOOL_ADMIN: Configure pool points multiplier

---

## 7. Scheduled Tasks / Edge Functions

### 7.1 Daily Task: Auto-Convert Pool Refunds

**Trigger**: 00:00 UTC daily  
**Function**: `convertExpiredPoolRefundsToPoints()`  
**Implementation**: Supabase Edge Function or pg_cron

```typescript
// Pseudo-code for Edge Function (functions/convert-pool-refunds/index.ts)
import { RefundService } from '../../src/services/supabaseRefunds';

export async function POST(req: Request) {
  const refundService = new RefundService(supabaseClient);
  const result = await refundService.convertExpiredPoolRefundsToPoints();
  
  return new Response(JSON.stringify({
    converted: result.converted,
    errors: result.errors,
    timestamp: new Date().toISOString()
  }), { status: 200 });
}
```

### 7.2 Manual: 15-Day Batch Refund Processing

**Trigger**: Manual by SUPER_ADMIN (or scheduled notifications)  
**Flow**:
1. SUPER_ADMIN views pending school refunds (grouped by batch)
2. Reviews items and reasons
3. Approves or rejects batch
4. Creates settlement record
5. Tracks confirmation from school

---

## 8. Testing Plan

### 8.1 Unit Tests

```typescript
describe('RefundService', () => {
  describe('convertExpiredPoolRefundsToPoints', () => {
    it('converts pool refund to points after 30 days', async () => {
      // Create pool with birthday_date = today - 31 days
      // Verify: pool_refunds.converted_to_points_at is set
      // Verify: points_ledger entry created
      // Verify: calculation correct (refund_amount × school_multiplier)
    });

    it('respects platform pool_points_expiry_days setting', async () => {
      // Change platform setting to 45 days
      // Verify: 30-day pool NOT converted
      // Verify: 45-day pool NOT converted
      // Verify: 46-day pool IS converted
    });
  });

  describe('createPendingSchoolRefund', () => {
    it('creates batch with correct batch_due_date (start + 15 days)', async () => {
      const refund = await service.createPendingSchoolRefund({
        schoolId: 'school-1',
        reason: 'service_not_used',
        description: 'No ice cream service in January (vacation)',
        items: [{ amount: 500, description: 'January refund', date: '2026-01-15' }]
      });

      const daysUntilDue = (new Date(refund.batch_due_date) - new Date(refund.batch_start_date)) / (1000 * 60 * 60 * 24);
      expect(daysUntilDue).toBe(15);
    });

    it('increments batch_number sequentially per school', async () => {
      // Create 3 refunds for school-1
      // Verify: batch_numbers are 1, 2, 3
    });
  });

  describe('validatePosAcceptsCash', () => {
    it('returns false if operating_unit.accepts_cash is false', async () => {
      const accepts = await service.validatePosAcceptsCash('unit-1');
      expect(accepts).toBe(false);
    });

    it('returns true if SUPER_ADMIN configured accepts_cash = true', async () => {
      // Update unit accepts_cash = true
      const accepts = await service.validatePosAcceptsCash('unit-1');
      expect(accepts).toBe(true);
    });
  });
});
```

### 8.2 Integration Tests

- Create birthday pool → Change product → Verify pond_refunds created
- Wait 30 days (mock time) → Verify auto-conversion to points
- Create pending school refund → Approve → Settle → Verify settlement_ledger
- POS cash config → Test refund allowed/rejected based on accepts_cash

### 8.3 Manual Testing Checklist

- [ ] Pool product cheaper → pro-rata refund to wallet (existing, verify still works)
- [ ] Pool refund after 30 days → converted to points (new)
- [ ] School admin views pending refunds, due in 15 days
- [ ] Super admin approves batch, creates settlement
- [ ] Settlement marked as "in transit", then "confirmed"
- [ ] POS accepts_cash=false → cash refund rejected
- [ ] POS accepts_cash=true → cash refund processed

---

## 9. Implementation Order

1. **Create tables** (SQL migrations) — 2 hours
   - platform_settings, school_settings, points_ledger
   - pending_school_refunds, school_refund_settlements
   - Modify pool_refunds, operating_units, transactions

2. **Create service layer** (supabaseRefunds.ts) — 3 hours
   - RefundService class with all methods
   - Error handling, logging

3. **Add types** (types.ts) — 1 hour
   - All new domain types

4. **Create Edge Function** (daily task) — 1 hour
   - convertExpiredPoolRefundsToPoints() scheduled

5. **Build admin UI components** — 4 hours
   - AdminPoolRefundsManager
   - AdminSchoolRefundsBatchProcessor
   - AdminSettlementsTracker
   - Settings panels

6. **Testing** — 3 hours
   - Unit tests
   - Integration tests
   - Manual verification

**Total Estimate**: ~14 hours (1.5 sprints)

---

## 10. Success Criteria

✅ **Phase 1 Complete when:**
- All schema created & deployed to Supabase
- RefundService fully implemented with all methods
- Daily conversion task running (verified by logs)
- 15-day batch workflow functional
- Admin UI displaying refunds correctly
- All tests passing
- Documentation updated

---

## 11. Rollback Plan

If issues arise:
1. Revert SQL migrations (downtime < 5 min)
2. Revert service layer code
3. Disable scheduled task
4. Verify pool refunds still work via original wallet pathway

---

## Appendix: SQL Deployment Checklist

- [ ] Review all new table definitions
- [ ] Verify FK relationships
- [ ] Test RLS policies (each role can/cannot access correctly)
- [ ] Test indexes exist and perform (EXPLAIN ANALYZE)
- [ ] Backup database before deploying
- [ ] Deploy migrations in order
- [ ] Verify no syntax errors
- [ ] Test data integrity constraints

