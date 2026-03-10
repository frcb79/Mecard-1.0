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

import { SupabaseClient } from '@supabase/supabase-js';
import {
  PoolRefund, PendingSchoolRefund, SchoolRefundSettlement,
  PointsLedgerEntry, PlatformSettings, SchoolSettings
} from '../types';

export interface RefundConversionResult {
  converted: number;
  errors: string[];
  timestamp: string;
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
      // Get platform settings
      const { data: settings, error: settingsError } = await this.supabase
        .from('platform_settings')
        .select('pool_points_expiry_days')
        .single();

      if (settingsError) {
        errors.push(`Failed to fetch platform settings: ${settingsError.message}`);
        return { converted: 0, errors, timestamp };
      }

      const expiryDays = settings?.pool_points_expiry_days || 30;

      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - expiryDays);

      // Find eligible refunds
      const { data: refunds, error: fetchError } = await this.supabase
        .from('pool_refunds')
        .select(`
          id,
          pool_id,
          contributor_id,
          refund_amount,
          status,
          converted_to_points_at,
          auto_refund_to_points_at,
          birthday_pools!inner(birthday_student_id),
          profiles(school_id)
        `)
        .eq('status', 'processed')
        .is('converted_to_points_at', null)
        .lte('auto_refund_to_points_at', cutoffDate.toISOString());

      if (fetchError) {
        errors.push(`Fetch error: ${fetchError.message}`);
        return { converted: 0, errors, timestamp };
      }

      if (!refunds || refunds.length === 0) {
        return { converted: 0, errors, timestamp };
      }

      // Process each refund
      for (const refund of refunds) {
        try {
          const schoolId = refund.profiles?.school_id;
          const studentId = refund.birthday_pools?.birthday_student_id;

          if (!schoolId || !studentId) {
            errors.push(`Refund ${refund.id}: Missing school_id or student_id`);
            continue;
          }

          // Calculate points
          const points = await this._calculatePoolToPoints(refund.refund_amount, schoolId);

          // Get current points balance for this student
          const { data: lastEntry } = await this.supabase
            .from('points_ledger')
            .select('balance_after')
            .eq('student_id', studentId)
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const balanceAfter = (lastEntry?.balance_after || 0) + points;

          // Create points ledger entry
          const { error: insertError } = await this.supabase
            .from('points_ledger')
            .insert({
              student_id: studentId,
              school_id: schoolId,
              transaction_type: 'POOL_CONVERSION',
              amount: points,
              source_module: 'pool',
              source_id: refund.pool_id,
              source_description: `Pool refund converted to points after ${expiryDays} days`,
              balance_after: balanceAfter,
              notes: `Pool refund ID: ${refund.id}`,
              created_at: timestamp
            });

          if (insertError) {
            errors.push(`Refund ${refund.id} - Points ledger insert: ${insertError.message}`);
            continue;
          }

          // Mark refund as converted
          const { error: updateError } = await this.supabase
            .from('pool_refunds')
            .update({
              converted_to_points_at: timestamp,
              points_awarded: points
            })
            .eq('id', refund.id);

          if (updateError) {
            errors.push(`Refund ${refund.id} - Update: ${updateError.message}`);
            continue;
          }

          converted++;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`Pool refund ${refund.id}: ${errorMsg}`);
        }
      }

      return { converted, errors, timestamp };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Conversion task failed: ${errorMsg}`);
      return { converted: 0, errors, timestamp };
    }
  }

  /**
   * Calculate points from refund amount based on school settings
   * Private helper method
   */
  private async _calculatePoolToPoints(amount: number, schoolId: string): Promise<number> {
    const { data: schoolSettings } = await this.supabase
      .from('school_settings')
      .select('pool_points_multiplier')
      .eq('school_id', schoolId)
      .single();

    const multiplier = schoolSettings?.pool_points_multiplier || 1.0;
    return Math.round(amount * multiplier);
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
        .single();

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
      const now = new Date().toISOString();

      const { error } = await this.supabase
        .from('pending_school_refunds')
        .update({
          status: 'approved',
          approved_at: now,
          approved_by: approvedBy
        })
        .eq('id', refundId);

      if (error) {
        return { success: false, error: error.message };
      }

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
    settledBy: string
  ): Promise<SettleRefundResult> {
    try {
      // Get the pending refund
      const { data: pendingRefund, error: fetchError } = await this.supabase
        .from('pending_school_refunds')
        .select('*')
        .eq('id', refundId)
        .single();

      if (fetchError || !pendingRefund) {
        return { success: false, error: 'Refund not found' };
      }

      if (pendingRefund.status !== 'approved') {
        return { success: false, error: `Refund status is ${pendingRefund.status}, not approved` };
      }

      const now = new Date().toISOString();

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
          settled_at: now,
          notes: settlementParams.notes,
          created_by: settledBy
        })
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // Mark pending refund as settled
      const { error: updateError } = await this.supabase
        .from('pending_school_refunds')
        .update({
          status: 'settled',
          settled_at: now,
          settled_by: settledBy,
          settlement_reference: settlementParams.reference
        })
        .eq('id', refundId);

      if (updateError) {
        console.error('Warning: Settlement created but pending refund not updated:', updateError);
      }

      return { success: true, settlementId: settlement?.id };
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
    try {
      const { data, error } = await this.supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching platform settings:', error);
        return null;
      }

      return data as PlatformSettings;
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
      const { error } = await this.supabase
        .from('platform_settings')
        .update({
          ...updates,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .limit(1);

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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found, create default
          const { data: newSettings } = await this.supabase
            .from('school_settings')
            .insert({ school_id: schoolId })
            .select()
            .single();
          return (newSettings as SchoolSettings) || null;
        }
        console.error('Error fetching school settings:', error);
        return null;
      }

      return data as SchoolSettings;
    } catch (err) {
      console.error('Exception fetching school settings:', err);
      return null;
    }
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
