/**
 * Spending Limits Service
 * Maneja límites de gasto de padres para sus hijos
 */

import { supabaseClient } from './supabaseClient';

export interface SpendingLimit {
  id?: bigint;
  studentId: bigint;
  schoolId: bigint;
  dailyLimit?: number;
  monthlyLimit?: number;
  categoryLimits?: Record<string, number>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpendingStatus {
  studentId: bigint;
  dailySpent: number;
  dailyLimit: number;
  dailyPercentage: number;
  monthlySpent: number;
  monthlyLimit: number;
  monthlyPercentage: number;
  canPurchase: boolean;
  remainingDaily: number;
  remainingMonthly: number;
}

class SpendingLimitsService {
  /**
   * Obtiene o crea límites de gasto para un estudiante
   */
  async getOrCreateLimit(studentId: bigint, schoolId: bigint): Promise<SpendingLimit | null> {
    try {
      const { data, error } = await supabaseClient
        .from('spending_limits')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (!error && data) {
        return data;
      }

      // Si no existe, crear con defaults
      const { data: newLimit } = await supabaseClient
        .from('spending_limits')
        .insert({
          student_id: studentId,
          school_id: schoolId,
          daily_limit: 100, // Default
          monthly_limit: 1000, // Default
          is_active: true,
        })
        .select()
        .single();

      return newLimit || null;
    } catch (err) {
      console.error('Error in getOrCreateLimit:', err);
      return null;
    }
  }

  /**
   * Actualiza los límites de gasto
   */
  async updateLimit(studentId: bigint, schoolId: bigint, limits: Partial<SpendingLimit>): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('spending_limits')
        .update({
          daily_limit: limits.dailyLimit,
          monthly_limit: limits.monthlyLimit,
          is_active: limits.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error updating limit:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in updateLimit:', err);
      return false;
    }
  }

  /**
   * Obtiene el estado de gasto actual del estudiante
   */
  async getSpendingStatus(studentId: bigint, schoolId: bigint): Promise<SpendingStatus | null> {
    try {
      const limit = await this.getOrCreateLimit(studentId, schoolId);
      if (!limit) {
        return null;
      }

      // Gasto de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayTxns } = await supabaseClient
        .from('transactions')
        .select('amount')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const dailySpent = (todayTxns || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Gasto de este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { data: monthTxns } = await supabaseClient
        .from('transactions')
        .select('amount')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .gte('created_at', thisMonth.toISOString());

      const monthlySpent = (monthTxns || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const dailyLimit = limit.dailyLimit || 100;
      const monthlyLimit = limit.monthlyLimit || 1000;

      return {
        studentId,
        dailySpent: Math.round(dailySpent * 100) / 100,
        dailyLimit,
        dailyPercentage: (dailySpent / dailyLimit) * 100,
        monthlySpent: Math.round(monthlySpent * 100) / 100,
        monthlyLimit,
        monthlyPercentage: (monthlySpent / monthlyLimit) * 100,
        canPurchase: dailySpent < dailyLimit && monthlySpent < monthlyLimit,
        remainingDaily: Math.max(0, dailyLimit - dailySpent),
        remainingMonthly: Math.max(0, monthlyLimit - monthlySpent),
      };
    } catch (err) {
      console.error('Error in getSpendingStatus:', err);
      return null;
    }
  }

  /**
   * Valida si una compra puede realizarse según los límites
   */
  async canMakePurchase(studentId: bigint, schoolId: bigint, amount: number): Promise<boolean> {
    const status = await this.getSpendingStatus(studentId, schoolId);
    if (!status) {
      return false;
    }

    return status.canPurchase && amount <= status.remainingDaily && amount <= status.remainingMonthly;
  }

  /**
   * Obtiene estudiantes que han excedido límites
   */
  async getOverLimitStudents(schoolId: bigint): Promise<Array<{ studentId: bigint; status: SpendingStatus }>> {
    try {
      const { data: students } = await supabaseClient
        .from('students')
        .select('id')
        .eq('school_id', schoolId);

      if (!students) {
        return [];
      }

      const overLimit = [];

      for (const student of students) {
        const status = await this.getSpendingStatus(student.id, schoolId);
        if (status && !status.canPurchase) {
          overLimit.push({
            studentId: student.id,
            status,
          });
        }
      }

      return overLimit;
    } catch (err) {
      console.error('Error in getOverLimitStudents:', err);
      return [];
    }
  }
}

export const spendingLimitsService = new SpendingLimitsService();
