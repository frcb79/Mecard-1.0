// ============================================
// ARCHIVO 1: hooks/useTransactions.ts
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WalletTransaction, TransactionType } from '../types';

interface UseTransactionsProps {
  studentId: string;
  limit?: number;
}

interface TransactionFilters {
  dateRange: 'today' | 'week' | 'month' | 'all';
  types: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
}

export function useTransactions({ studentId, limit }: UseTransactionsProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: 'month',
    types: []
  });

  // Cargar transacciones
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: txError } = await query;

        if (txError) throw txError;

        if (data) {
          setTransactions(data.map((tx: any) => ({
            id: tx.id,
            studentId: tx.student_id,
            studentName: '', // Se puede cargar después
            type: tx.type as TransactionType,
            amount: tx.amount,
            balanceBefore: tx.balance_before || 0,
            balanceAfter: tx.balance_after || 0,
            referenceId: tx.reference_id,
            referenceType: tx.reference_type,
            unitId: tx.unit_id,
            unitName: tx.unit_name,
            description: tx.description || '',
            category: tx.category,
            metadata: tx.metadata,
            createdBy: tx.created_by,
            createdAt: tx.created_at
          })));
        }
      } catch (err: any) {
        console.error('Error loading transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [studentId, limit]);

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    let results = transactions;

    // Filtro por fecha
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30
      };
      const daysAgo = ranges[filters.dateRange];
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      results = results.filter(tx => new Date(tx.createdAt) >= startDate);
    }

    // Filtro por tipo
    if (filters.types.length > 0) {
      results = results.filter(tx => filters.types.includes(tx.type));
    }

    // Filtro por monto
    if (filters.minAmount !== undefined) {
      results = results.filter(tx => Math.abs(tx.amount) >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      results = results.filter(tx => Math.abs(tx.amount) <= filters.maxAmount!);
    }

    return results;
  }, [transactions, filters]);

  // Estadísticas
  const stats = useMemo(() => {
    const purchases = filteredTransactions.filter(tx => tx.type === 'PURCHASE');
    const deposits = filteredTransactions.filter(tx => tx.type === 'DEPOSIT');

    return {
      totalTransactions: filteredTransactions.length,
      totalSpent: purchases.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      totalDeposited: deposits.reduce((sum, tx) => sum + tx.amount, 0),
      avgTransaction: purchases.length > 0
        ? purchases.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / purchases.length
        : 0
    };
  }, [filteredTransactions]);

  return {
    transactions: filteredTransactions,
    loading,
    error,
    filters,
    setFilters,
    stats,
    refresh: () => setLoading(true) // Trigger reload
  };
}
