/**
 * RefundService — Complete Refund Management
 * Handles: Pool→Points conversion, School batch refunds, Settlement tracking
 * 
 * Usage:
 *   const refundService = new RefundService(supabaseClient);
 *   
 *   // Auto-convert expired pool refunds (daily task)
 *   await refundService.convertExpiredPoolRefundsToPoints();
 *   
 *   // Create & manage school refunds
 *   const pending = await refundService.createPendingSchoolRefund({...});
 *   await refundService.approvePendingRefund(id, userId);
 *   await refundService.settleApprovedRefund(id, {method, reference}, userId);
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PendingSchoolRefund,
  PlatformSettings,
  PoolPointConversion,
  SchoolRefundSettlement,
  SchoolSettings,
} from '../types';

export interface RefundConversionResult {
  converted: number;
  queued?: number;
  errors: string[];
  timestamp: string;
}

interface BirthdayPoolCandidateRow {
  id: string;
  birthday_student_id: string;
  birthday_date: string;
  status: string;
  collected_amount: number;
}

interface PoolContributionRow {
  contributor_id: string;
  amount: number;
}

interface ContributorContext {
  schoolId: string;
  contributorStudentId: string | null;
}

export interface ApprovePendingRefundResult {
  success: boolean;
  error?: string;
  approvedAt?: string;
}

export interface SettleRefundResult {
  success: boolean;
  settlementId?: string;
  error?: string;
}

export interface ValidateCashResult {
  success: boolean;
  acceptsCash: boolean;
  unitName?: string;
}

export class RefundService {
  constructor(private supabase: SupabaseClient) {}

  // =========== POOL REFUNDS ===========

  /**
   * Convert pool refunds to points if 30+ days have passed since birthday
   * 
   * Called by: Daily scheduled task (Edge Function or pg_cron)
   * Returns: Count of pools converted + any errors
   * 
   * Logic:
   * 1. Get platform settings (pool_points_expiry_days, usually 30)
   * 2. Find pool_refunds where:
   *    - status = 'processed'
   *    - converted_to_points_at IS NULL
   *    - TODAY >= auto_refund_to_points_at
   * 3. For each refund:
   *    - Calculate points: refund_amount × school_multiplier
   *    - Insert into points_ledger (POOL_CONVERSION)
   *    - Update pool_refunds: converted_to_points_at = NOW(), points_awarded = calculated
   * 4. Return results
   */
  async convertExpiredPoolRefundsToPoints(): Promise<RefundConversionResult> {
    const errors: string[] = [];
    let converted = 0;
    const timestamp = new Date().toISOString();

    try {
      const settings = await this.ensurePlatformSettings();
      const queuedResult = await this.syncEligiblePoolPointConversions(settings?.pool_points_expiry_days ?? 30);
      errors.push(...queuedResult.errors);

      const { data: conversions, error: fetchError } = await this.supabase
        .from('pool_point_conversions')
        .select('*')
        .eq('status', 'pending')
        .lte('eligible_at', timestamp)
        .order('eligible_at', { ascending: true });

      if (fetchError) {
        errors.push(`Fetch error: ${fetchError.message}`);
        return { converted: 0, queued: queuedResult.created, errors, timestamp };
      }

      if (!conversions || conversions.length === 0) {
        return { converted: 0, queued: queuedResult.created, errors, timestamp };
      }

      for (const conversion of conversions as PoolPointConversion[]) {
        try {
          if (!conversion.school_id) {
            errors.push(`Conversion ${conversion.id}: Missing school_id`);
            continue;
          }

          const points = await this._calculatePoolToPoints(
            conversion.original_contribution_amount,
            conversion.school_id,
            settings?.pool_to_points_exchange_rate ?? 1
          );

          const { data: lastEntry } = await this.supabase
            .from('points_ledger')
            .select('balance_after')
            .eq('profile_id', conversion.contributor_profile_id)
            .eq('school_id', conversion.school_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const balanceAfter = (lastEntry?.balance_after || 0) + points;

          const { error: insertError } = await this.supabase
            .from('points_ledger')
            .insert({
              profile_id: conversion.contributor_profile_id,
              student_id: conversion.contributor_student_id ?? null,
              school_id: conversion.school_id,
              transaction_type: 'POOL_CONVERSION',
              amount: points,
              source_module: 'pool',
              source_id: conversion.pool_id,
              source_description: 'Expired birthday pool contribution converted to points',
              balance_after: balanceAfter,
              notes: `Pool conversion ID: ${conversion.id}`,
              created_at: timestamp
            });

          if (insertError) {
            await this.supabase
              .from('pool_point_conversions')
              .update({ status: 'failed', error_message: insertError.message, updated_at: timestamp })
              .eq('id', conversion.id);

            errors.push(`Conversion ${conversion.id} - Points ledger insert: ${insertError.message}`);
            continue;
          }

          const { error: updateError } = await this.supabase
            .from('pool_point_conversions')
            .update({
              status: 'converted',
              converted_at: timestamp,
              points_awarded: points,
              error_message: null,
              updated_at: timestamp
            })
            .eq('id', conversion.id);

          if (updateError) {
            errors.push(`Conversion ${conversion.id} - Update: ${updateError.message}`);
            continue;
          }

          converted++;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`Pool conversion ${conversion.id}: ${errorMsg}`);
        }
      }

      return { converted, queued: queuedResult.created, errors, timestamp };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Conversion task failed: ${errorMsg}`);
      return { converted: 0, errors, timestamp };
    }
  }

  async syncEligiblePoolPointConversions(expiryDays: number = 30): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    try {
      const threshold = new Date();
      threshold.setUTCDate(threshold.getUTCDate() - expiryDays);
      const thresholdDate = threshold.toISOString().slice(0, 10);

      const { data: pools, error: poolsError } = await this.supabase
        .from('birthday_pools')
        .select('id, birthday_student_id, birthday_date, status, collected_amount')
        .lte('birthday_date', thresholdDate)
        .gt('collected_amount', 0);

      if (poolsError) {
        return { created: 0, errors: [`Pool fetch error: ${poolsError.message}`] };
      }

      const eligiblePools = ((pools || []) as BirthdayPoolCandidateRow[]).filter((pool) =>
        !['DELIVERED', 'REFUNDED'].includes(pool.status)
      );

      for (const pool of eligiblePools) {
        const { data: existingConversions } = await this.supabase
          .from('pool_point_conversions')
          .select('contributor_profile_id')
          .eq('pool_id', pool.id);

        const existingProfiles = new Set((existingConversions || []).map((item) => item.contributor_profile_id));

        const { data: studentRow, error: studentError } = await this.supabase
          .from('students')
          .select('school_id')
          .eq('id', pool.birthday_student_id)
          .maybeSingle();

        if (studentError || !studentRow?.school_id) {
          errors.push(`Pool ${pool.id}: Missing school for birthday student`);
          continue;
        }

        const { data: contributions, error: contributionError } = await this.supabase
          .from('pool_contributions')
          .select('contributor_id, amount')
          .eq('pool_id', pool.id);

        if (contributionError) {
          errors.push(`Pool ${pool.id}: Contribution fetch error: ${contributionError.message}`);
          continue;
        }

        const eligibleAt = new Date(`${pool.birthday_date}T12:00:00.000Z`);
        eligibleAt.setUTCDate(eligibleAt.getUTCDate() + expiryDays);

        for (const contribution of (contributions || []) as PoolContributionRow[]) {
          if (existingProfiles.has(contribution.contributor_id)) {
            continue;
          }

          const contributorContext = await this._getContributorContext(contribution.contributor_id, studentRow.school_id);

          const { error: insertError } = await this.supabase
            .from('pool_point_conversions')
            .insert({
              pool_id: pool.id,
              contributor_profile_id: contribution.contributor_id,
              contributor_student_id: contributorContext.contributorStudentId,
              school_id: contributorContext.schoolId,
              original_contribution_amount: contribution.amount,
              conversion_rate: 1.0,
              multiplier_applied: 1.0,
              status: 'pending',
              eligible_at: eligibleAt.toISOString(),
              notes: 'Generated automatically from expired birthday pool',
            });

          if (insertError) {
            errors.push(`Pool ${pool.id} / contributor ${contribution.contributor_id}: ${insertError.message}`);
            continue;
          }

          created++;
        }
      }

      return { created, errors };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { created, errors: [...errors, errorMsg] };
    }
  }

  async getPoolPointConversions(filters?: {
    schoolId?: string;
    status?: 'pending' | 'converted' | 'failed' | 'cancelled';
    poolId?: string;
  }): Promise<PoolPointConversion[]> {
    try {
      let query = this.supabase.from('pool_point_conversions').select('*');

      if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.poolId) query = query.eq('pool_id', filters.poolId);

      const { data, error } = await query.order('eligible_at', { ascending: false });

      if (error) {
        console.error('Error fetching pool point conversions:', error);
        return [];
      }

      return (data as PoolPointConversion[]) || [];
    } catch (err) {
      console.error('Exception fetching pool point conversions:', err);
      return [];
    }
  }

  /**
   * Calculate points from refund amount based on school settings
   * Private helper method
   */
  private async _calculatePoolToPoints(
    amount: number,
    schoolId: string,
    exchangeRate: number = 1
  ): Promise<number> {
    const { data: schoolSettings } = await this.supabase
      .from('school_settings')
      .select('pool_points_multiplier')
      .eq('school_id', schoolId)
      .maybeSingle();

    const multiplier = schoolSettings?.pool_points_multiplier || 1.0;
    return Math.round(amount * exchangeRate * multiplier);
  }

  private async _getContributorContext(profileId: string, fallbackSchoolId: string): Promise<ContributorContext> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('school_id')
      .eq('id', profileId)
      .maybeSingle();

    const { data: student } = await this.supabase
      .from('students')
      .select('id')
      .eq('user_id', profileId)
      .maybeSingle();

    return {
      schoolId: profile?.school_id || fallbackSchoolId,
      contributorStudentId: student?.id || null,
    };
  }

  // =========== SCHOOL REFUNDS ===========

  /**
   * Create pending school/concessionaire refund for manual approval
   * 
   * Called by: School admin or SUPER_ADMIN via admin dashboard
   * Returns: Created PendingSchoolRefund object
   * 
   * Workflow:
   * 1. Get next batch_number for this school
   * 2. Calculate batch_due_date = today + 15 days
   * 3. Insert into pending_school_refunds
   * 4. Return created record
   */
  async createPendingSchoolRefund(params: {
    schoolId: string;
    concessionaireId?: string;
    reason: 'service_not_used' | 'partial_service' | 'error_correction' | 'other';
    description: string;
    items: Array<{
      amount: number;
      description: string;
      transactionId?: string;
      date: string;
    }>;
  }): Promise<PendingSchoolRefund | null> {
    try {
      const totalAmount = params.items.reduce((sum, item) => sum + item.amount, 0);

      // Get current batch number
      const { data: lastBatch, error: batchError } = await this.supabase
        .from('pending_school_refunds')
        .select('batch_number')
        .eq('school_id', params.schoolId)
        .order('batch_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newBatchNumber = batchError ? 1 : (lastBatch?.batch_number || 0) + 1;

      const now = new Date();
      const batchStartDate = now.toISOString().split('T')[0];

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 15);
      const batchDueDate = dueDate.toISOString().split('T')[0];

      const { data, error } = await this.supabase
        .from('pending_school_refunds')
        .insert({
          school_id: params.schoolId,
          concessionaire_id: params.concessionaireId,
          batch_number: newBatchNumber,
          batch_start_date: batchStartDate,
          batch_due_date: batchDueDate,
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

      return data as PendingSchoolRefund;
    } catch (err) {
      console.error('Exception creating pending refund:', err);
      return null;
    }
  }

  /**
   * Get pending school refunds for admin dashboard
   * 
   * Called by: SUPER_ADMIN batch processor
   * Returns: Array of PendingSchoolRefund objects
   */
  async getPendingSchoolRefunds(filters?: {
    schoolId?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'settled';
    batchNumber?: number;
  }): Promise<PendingSchoolRefund[]> {
    try {
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

      return (data as PendingSchoolRefund[]) || [];
    } catch (err) {
      console.error('Exception fetching pending refunds:', err);
      return [];
    }
  }

  /**
   * Approve pending school refund batch
   * 
   * Called by: SUPER_ADMIN approval workflow
   * Returns: Success/error result
   * 
   * Effect:
   * - Updates status = 'approved'
   * - Sets approved_at = NOW()
   * - Stores approved_by user ID
   */
  async approvePendingRefund(
    refundId: string,
    approvedBy: string
  ): Promise<ApprovePendingRefundResult> {
    try {
      // SECURITY FIX (CRIT-007): Verify user is SUPER_ADMIN before allowing approval
      const { data: roleCheck, error: roleError } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', approvedBy)
        .eq('role', 'SUPER_ADMIN')
        .maybeSingle();

      if (roleError || !roleCheck) {
        return { success: false, error: 'Only SUPER_ADMIN can approve refunds' };
      }

      // SECURITY FIX (CRIT-006): Use optimistic locking to prevent duplicate approval
      // Only update if status is still 'pending'
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('pending_school_refunds')
        .update({
          status: 'approved',
          approved_at: now,
          approved_by: approvedBy
        })
        .eq('id', refundId)
        .eq('status', 'pending')  // <-- KEY: Only update if still pending
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if update actually happened (optimistic lock)
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Refund not found or already processed. Approval may have already been completed.'
        };
      }

      // Log approval action for audit trail
      await this.supabase.from('financial_audit_log').insert({
        user_id: approvedBy,
        action: 'APPROVAL',
        entity_type: 'REFUND',
        entity_id: refundId,
        new_values: { status: 'approved' },
        result: 'SUCCESS'
      }).then(() => {}, (err) => console.warn('Audit log failed:', err));

      return { success: true, approvedAt: now };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Reject pending school refund with reason
   * 
   * Called by: SUPER_ADMIN approval workflow
   * Returns: Success/error result
   * 
   * Effect:
   * - Updates status = 'rejected'
   * - Stores rejection_reason
   * - Stores rejected_by user ID (in approved_by field as workaround)
   */
  async rejectPendingRefund(
    refundId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<ApprovePendingRefundResult> {
    try {
      const { error } = await this.supabase
        .from('pending_school_refunds')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: rejectedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Create settlement for approved school/concessionaire refund
   * 
   * Called by: SUPER_ADMIN settlement workflow (after approval)
   * Returns: Settlement ID or error
   * 
   * Workflow:
   * 1. Get approved pending refund
   * 2. Create settlement_ledger entry
   * 3. Mark pending refund as 'settled'
   * 4. Return settlement ID
   */
  async settleApprovedRefund(
    refundId: string,
    settlementParams: {
      method: 'bank_transfer' | 'wallet_credit' | 'check' | 'cash' | 'other';
      reference: string;  // CLABE, check number, etc.
      notes?: string;
    },
    settledBy: string,
    userRole?: string
  ): Promise<SettleRefundResult> {
    try {
      // SECURITY FIX (CRIT-007): Verify authorization at service layer
      if (!userRole) {
        return { success: false, error: 'Authorization required' };
      }

      // Check if user is SUPER_ADMIN
      const { data: roleCheck, error: roleError } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', settledBy)
        .eq('role', 'SUPER_ADMIN')
        .single();

      if (roleError || !roleCheck) {
        return { success: false, error: 'Only SUPER_ADMIN can settle refunds' };
      }

      // Get the pending refund to verify school ownership
      const { data: pendingRefund, error: fetchError } = await this.supabase
        .from('pending_school_refunds')
        .select('*')
        .eq('id', refundId)
        .single();

      if (fetchError || !pendingRefund) {
        return { success: false, error: 'Refund not found' };
      }

      // SECURITY FIX (CRIT-006): Add idempotency key for preventing duplicate settlements
      const idempotencyKey = `settlement-${refundId}-${Date.now()}`;

      // Call atomic settlement function instead of manual updates
      // SECURITY FIX (CRIT-003): Use settling atómico with idempotency
      const { data: result, error: rpcError } = await this.supabase
        .rpc('settle_refund_idempotent', {
          p_refund_id: refundId,
          p_settled_by: settledBy,
          p_method: settlementParams.method,
          p_reference: settlementParams.reference,
          p_idempotency_key: idempotencyKey
        });

      if (rpcError) {
        return { success: false, error: `Settlement failed: ${rpcError.message}` };
      }

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Log settlement action for audit trail
      await this.supabase.from('financial_audit_log').insert({
        user_id: settledBy,
        action: 'SETTLEMENT',
        entity_type: 'REFUND',
        entity_id: refundId,
        new_values: {
          amount: result.amount,
          method: settlementParams.method,
          reference: settlementParams.reference
        },
        result: 'SUCCESS'
      }).then(() => {}, (err) => console.warn('Audit log failed:', err));

      return {
        success: true,
        settlementId: result.settlement_id
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Get settlement records for tracking
   */
  async getSettlements(filters?: {
    schoolId?: string;
    status?: string;
  }): Promise<SchoolRefundSettlement[]> {
    try {
      let query = this.supabase
        .from('school_refund_settlements')
        .select('*');

      if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query.order('settled_at', { ascending: false });

      if (error) {
        console.error('Error fetching settlements:', error);
        return [];
      }

      return (data as SchoolRefundSettlement[]) || [];
    } catch (err) {
      console.error('Exception fetching settlements:', err);
      return [];
    }
  }

  // =========== POS REFUNDS ===========

  /**
   * Validate if POS/unit accepts cash
   * 
   * Called by: POS refund logic before processing cash returns
   * Returns: AcceptsCash boolean
   */
  async validatePosAcceptsCash(unitId: string): Promise<ValidateCashResult> {
    try {
      const { data, error } = await this.supabase
        .from('operating_units')
        .select('accepts_cash, name')
        .eq('id', unitId)
        .single();

      if (error || !data) {
        return { success: false, acceptsCash: false };
      }

      return {
        success: true,
        acceptsCash: data.accepts_cash || false,
        unitName: data.name
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error validating POS cash acceptance:', errorMsg);
      return { success: false, acceptsCash: false };
    }
  }

  // =========== PLATFORM & SCHOOL SETTINGS ===========

  /**
   * Get current platform settings
   * 
   * Returns: PlatformSettings object
   */
  async getPlatformSettings(): Promise<PlatformSettings | null> {
    return this.ensurePlatformSettings();
  }

  async ensurePlatformSettings(): Promise<PlatformSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform settings:', error);
        return null;
      }

      if (data) {
        return data as PlatformSettings;
      }

      const { data: created, error: insertError } = await this.supabase
        .from('platform_settings')
        .insert({
          pool_to_points_exchange_rate: 1.0,
          pool_points_expiry_days: 30,
          school_refund_batch_interval_days: 15,
          default_pos_accepts_cash: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error bootstrapping platform settings:', insertError);
        return null;
      }

      return created as PlatformSettings;
    } catch (err) {
      console.error('Exception fetching platform settings:', err);
      return null;
    }
  }

  /**
   * Update platform settings (SUPER_ADMIN only)
   * 
   * Parameters:
   * - pool_to_points_exchange_rate: Decimal (1.0 = 1:1)
   * - pool_points_expiry_days: Int (default 30)
   * - school_refund_batch_interval_days: Int (default 15)
   */
  async updatePlatformSettings(
    updates: Partial<PlatformSettings>,
    updatedBy: string
  ): Promise<ApprovePendingRefundResult> {
    try {
      const existing = await this.ensurePlatformSettings();

      if (!existing) {
        return { success: false, error: 'Platform settings not available' };
      }

      const { error } = await this.supabase
        .from('platform_settings')
        .update({
          ...updates,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Get school-specific settings
   */
  async getSchoolSettings(schoolId: string): Promise<SchoolSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', schoolId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching school settings:', error);
        return null;
      }

      if (!data) {
        const { data: newSettings, error: insertError } = await this.supabase
          .from('school_settings')
          .insert({ school_id: schoolId })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating school settings:', insertError);
          return null;
        }

        return (newSettings as SchoolSettings) || null;
      }

      return data as SchoolSettings;
    } catch (err) {
      console.error('Exception fetching school settings:', err);
      return null;
    }
  }

  async initializeSchoolSettings(schoolIds: string[]): Promise<number> {
    let initialized = 0;

    for (const schoolId of schoolIds) {
      const settings = await this.getSchoolSettings(schoolId);
      if (settings) {
        initialized++;
      }
    }

    return initialized;
  }

  /**
   * Update school settings (SCHOOL_ADMIN or SUPER_ADMIN)
   * 
   * Parameters:
   * - pool_points_multiplier: Decimal (1.0 = 1:1, can vary by school)
   */
  async updateSchoolSettings(
    schoolId: string,
    updates: Partial<SchoolSettings>
  ): Promise<ApprovePendingRefundResult> {
    try {
      const { error } = await this.supabase
        .from('school_settings')
        .update(updates)
        .eq('school_id', schoolId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }
}

// ===== EXPORT SINGLETON =====
let _refundService: RefundService | null = null;

export function getRefundService(supabase: SupabaseClient): RefundService {
  if (!_refundService) {
    _refundService = new RefundService(supabase);
  }
  return _refundService;
}
