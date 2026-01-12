/**
 * Reporting Service
 * Genera reportes financieros para padres, escuelas y concesionarias
 */

import { supabaseClient } from './supabaseClient';

export interface TransactionReport {
  period: string;
  totalTransactions: number;
  totalAmount: number;
  byType: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, { count: number; amount: number }>;
  averageTransaction: number;
}

export interface ParentReport {
  parentUserId: string;
  studentCount: number;
  totalDeposited: number;
  totalSpent: number;
  totalBalance: number;
  transactions: Array<any>;
  period: string;
}

export interface SchoolReport {
  schoolId: bigint;
  studentCount: number;
  totalTransactions: number;
  totalRevenue: number;
  averageSpendPerStudent: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  topOperatingUnits: Array<{ name: string; revenue: number }>;
  period: string;
}

class ReportingService {
  /**
   * Obtiene reporte de transacciones por estudiante
   */
  async getStudentTransactionReport(
    studentId: bigint,
    schoolId: bigint,
    startDate: Date,
    endDate: Date
  ): Promise<TransactionReport | null> {
    try {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching transactions:', error);
        return null;
      }

      const txns = data || [];
      const byType: Record<string, { count: number; amount: number }> = {};
      const byStatus: Record<string, { count: number; amount: number }> = {};

      let totalAmount = 0;

      txns.forEach((txn) => {
        const amount = parseFloat(txn.amount);
        totalAmount += amount;

        // By type
        if (!byType[txn.type]) {
          byType[txn.type] = { count: 0, amount: 0 };
        }
        byType[txn.type].count++;
        byType[txn.type].amount += amount;

        // By status
        if (!byStatus[txn.status]) {
          byStatus[txn.status] = { count: 0, amount: 0 };
        }
        byStatus[txn.status].count++;
        byStatus[txn.status].amount += amount;
      });

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalTransactions: txns.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        byType,
        byStatus,
        averageTransaction: txns.length > 0 ? Math.round((totalAmount / txns.length) * 100) / 100 : 0,
      };
    } catch (err) {
      console.error('Error in getStudentTransactionReport:', err);
      return null;
    }
  }

  /**
   * Obtiene reporte para un padre
   */
  async getParentReport(parentUserId: string, schoolId: bigint, days: number = 30): Promise<ParentReport | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener estudiantes del padre
      const { data: links } = await supabaseClient
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_user_id', parentUserId)
        .eq('school_id', schoolId);

      if (!links) {
        return null;
      }

      const studentIds = links.map((l) => l.student_id);

      // Obtener balances
      const { data: profiles } = await supabaseClient
        .from('financial_profiles')
        .select('balance')
        .in('student_id', studentIds)
        .eq('school_id', schoolId);

      const totalBalance = (profiles || []).reduce((sum, p) => sum + parseFloat(p.balance), 0);

      // Obtener transacciones
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('student_id', studentIds)
        .eq('school_id', schoolId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      const txns = transactions || [];

      const totalDeposited = txns
        .filter((t) => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalSpent = txns
        .filter((t) => t.type === 'purchase' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        parentUserId,
        studentCount: studentIds.length,
        totalDeposited: Math.round(totalDeposited * 100) / 100,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalBalance: Math.round(totalBalance * 100) / 100,
        transactions: txns,
        period: `Last ${days} days`,
      };
    } catch (err) {
      console.error('Error in getParentReport:', err);
      return null;
    }
  }

  /**
   * Obtiene reporte financiero de una escuela
   */
  async getSchoolReport(schoolId: bigint, days: number = 30): Promise<SchoolReport | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Contar estudiantes
      const { count: studentCount } = await supabaseClient
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      // Obtener transacciones
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('school_id', schoolId)
        .gte('created_at', startDate.toISOString());

      const txns = transactions || [];

      // Calcular totales
      const totalTransactions = txns.length;
      const totalRevenue = txns
        .filter((t) => t.type === 'purchase' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Top productos
      const productMap: Record<string, { count: number; revenue: number }> = {};

      txns.forEach((txn) => {
        if (txn.product_id) {
          if (!productMap[txn.product_id]) {
            productMap[txn.product_id] = { count: 0, revenue: 0 };
          }
          productMap[txn.product_id].count++;
          productMap[txn.product_id].revenue += parseFloat(txn.amount);
        }
      });

      // Obtener nombres de productos
      const topProducts = await Promise.all(
        Object.entries(productMap)
          .sort(([, a], [, b]) => b.revenue - a.revenue)
          .slice(0, 5)
          .map(async ([productId, stats]) => {
            const { data: product } = await supabaseClient
              .from('products')
              .select('name')
              .eq('id', parseInt(productId))
              .single();

            return {
              name: product?.name || 'Unknown',
              quantity: stats.count,
              revenue: Math.round(stats.revenue * 100) / 100,
            };
          })
      );

      // Top concesionarias
      const unitMap: Record<string, number> = {};

      txns.forEach((txn) => {
        if (txn.operating_unit_id) {
          if (!unitMap[txn.operating_unit_id]) {
            unitMap[txn.operating_unit_id] = 0;
          }
          unitMap[txn.operating_unit_id] += parseFloat(txn.amount);
        }
      });

      // Obtener nombres de unidades
      const topOperatingUnits = await Promise.all(
        Object.entries(unitMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(async ([unitId, revenue]) => {
            const { data: unit } = await supabaseClient
              .from('operating_units')
              .select('name')
              .eq('id', parseInt(unitId))
              .single();

            return {
              name: unit?.name || 'Unknown',
              revenue: Math.round(revenue * 100) / 100,
            };
          })
      );

      return {
        schoolId,
        studentCount: studentCount || 0,
        totalTransactions,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageSpendPerStudent:
          studentCount && studentCount > 0 ? Math.round((totalRevenue / studentCount) * 100) / 100 : 0,
        topProducts,
        topOperatingUnits,
        period: `Last ${days} days`,
      };
    } catch (err) {
      console.error('Error in getSchoolReport:', err);
      return null;
    }
  }

  /**
   * Obtiene reporte de una concesionaria
   */
  async getOperatingUnitReport(
    operatingUnitId: bigint,
    schoolId: bigint,
    days: number = 30
  ): Promise<TransactionReport | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('operating_unit_id', operatingUnitId)
        .eq('school_id', schoolId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching transactions:', error);
        return null;
      }

      const txns = data || [];
      const byType: Record<string, { count: number; amount: number }> = {};
      const byStatus: Record<string, { count: number; amount: number }> = {};

      let totalAmount = 0;

      txns.forEach((txn) => {
        const amount = parseFloat(txn.amount);
        totalAmount += amount;

        if (!byType[txn.type]) {
          byType[txn.type] = { count: 0, amount: 0 };
        }
        byType[txn.type].count++;
        byType[txn.type].amount += amount;

        if (!byStatus[txn.status]) {
          byStatus[txn.status] = { count: 0, amount: 0 };
        }
        byStatus[txn.status].count++;
        byStatus[txn.status].amount += amount;
      });

      return {
        period: `Last ${days} days`,
        totalTransactions: txns.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        byType,
        byStatus,
        averageTransaction: txns.length > 0 ? Math.round((totalAmount / txns.length) * 100) / 100 : 0,
      };
    } catch (err) {
      console.error('Error in getOperatingUnitReport:', err);
      return null;
    }
  }
}

export const reportingService = new ReportingService();
