import { supabase } from '../lib/supabaseClient';
import type { AutoReloadConfig } from '../types';

/**
 * Auto-Reload Service
 * Manages automatic reload configurations for parent→student wallets.
 */
export const autoReloadService = {

  /**
   * Get a single auto-reload config for a parent-student pair.
   */
  async getConfig(
    parentId: string,
    studentId: string
  ): Promise<{ data: AutoReloadConfig | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('auto_reload_config')
        .select('*')
        .eq('parent_id', parentId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      return { data: data ? mapConfigRow(data) : null, error: null };
    } catch (error) {
      console.error('Error fetching auto-reload config:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all auto-reload configs for a parent (all children).
   */
  async getAllConfigs(parentId: string): Promise<{ data: AutoReloadConfig[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('auto_reload_config')
        .select('*')
        .eq('parent_id', parentId);

      if (error) throw error;
      return { data: (data || []).map(mapConfigRow), error: null };
    } catch (error) {
      console.error('Error fetching auto-reload configs:', error);
      return { data: [], error };
    }
  },

  /**
   * Upsert an auto-reload config (create or update).
   */
  async saveConfig(config: {
    parentId: string;
    studentId: string;
    enabled: boolean;
    thresholdAmount: number;
    reloadAmount: number;
    paymentMethod: 'CARD' | 'SPEI';
  }): Promise<{ data: AutoReloadConfig | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('auto_reload_config')
        .upsert(
          {
            parent_id: config.parentId,
            student_id: config.studentId,
            enabled: config.enabled,
            threshold_amount: config.thresholdAmount,
            reload_amount: config.reloadAmount,
            payment_method: config.paymentMethod,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'parent_id,student_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return { data: mapConfigRow(data), error: null };
    } catch (error) {
      console.error('Error saving auto-reload config:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete an auto-reload config.
   */
  async deleteConfig(
    parentId: string,
    studentId: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('auto_reload_config')
        .delete()
        .eq('parent_id', parentId)
        .eq('student_id', studentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting auto-reload config:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if a student's balance is below threshold and trigger reload.
   * Called after purchases or on a scheduled interval.
   */
  async checkAndReload(studentId: string): Promise<{ reloaded: boolean; error?: any }> {
    try {
      // Get active config for this student
      const { data: configs, error: cErr } = await supabase
        .from('auto_reload_config')
        .select('*')
        .eq('student_id', studentId)
        .eq('enabled', true);

      if (cErr) throw cErr;
      if (!configs || configs.length === 0) return { reloaded: false };

      // Get student's current balance
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, balance, full_name, parent_id')
        .eq('id', studentId)
        .single();

      if (sErr) throw sErr;

      const config = configs[0];
      const balance = parseFloat(student.balance);
      const threshold = parseFloat(config.threshold_amount);

      if (balance >= threshold) return { reloaded: false };

      // Check daily reload limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      if (config.last_reload_at && new Date(config.last_reload_at) >= todayStart) {
        return { reloaded: false }; // Already reloaded today
      }

      const reloadAmount = parseFloat(config.reload_amount);

      // Create wallet transaction for the reload
      const { error: tErr } = await supabase
        .from('wallet_transactions')
        .insert({
          student_id: studentId,
          type: 'DEPOSIT',
          amount: reloadAmount,
          description: `Recarga automática (saldo ${balance.toFixed(0)} < umbral ${threshold.toFixed(0)})`,
          reference: `auto-reload-${config.id}`,
          performed_by: config.parent_id,
        });

      if (tErr) throw tErr;

      // Update student balance
      const { error: bErr } = await supabase
        .from('students')
        .update({
          balance: balance + reloadAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId);

      if (bErr) throw bErr;

      // Update last_reload_at
      await supabase
        .from('auto_reload_config')
        .update({ last_reload_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', config.id);

      return { reloaded: true };
    } catch (error) {
      console.error('Error in auto-reload check:', error);
      return { reloaded: false, error };
    }
  },
};

// ─── Row Mapper ─────────────────────────────────────

function mapConfigRow(row: any): AutoReloadConfig {
  return {
    id: row.id,
    parentId: row.parent_id,
    studentId: row.student_id,
    enabled: row.enabled,
    thresholdAmount: parseFloat(row.threshold_amount),
    reloadAmount: parseFloat(row.reload_amount),
    paymentMethod: row.payment_method,
    maxDailyReloads: row.max_daily_reloads,
    lastReloadAt: row.last_reload_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
