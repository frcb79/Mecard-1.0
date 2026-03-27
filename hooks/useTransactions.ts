// ============================================
// ARCHIVO 1: hooks/useTransactions.ts
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/lib/supabaseClient';
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

  // Cargar transacciones - ADAPTADO A TU TABLA
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
          // Cargar saldo actual del estudiante para calcular balances
          const { data: studentData } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', studentId)
            .single();

          const currentBalance = studentData?.balance || 0;

          setTransactions(data.map((tx: any, index: number) => {
            // Calcular balance después de esta transacción
            // (sumando hacia atrás desde el balance actual)
            let balanceAfter = currentBalance;
            for (let i = 0; i < index; i++) {
              const prevTx = data[i];
              if (prevTx.type === 'DEPOSIT') {
                balanceAfter -= prevTx.amount;
              } else if (prevTx.type === TransactionType.PURCHASE) {
                balanceAfter += prevTx.amount;
              }
            }

            const balanceBefore = tx.type === TransactionType.DEPOSIT
              ? balanceAfter - tx.amount 
              : balanceAfter + tx.amount;

            return {
              id: tx.id,
              studentId: tx.student_id,
              studentName: '',
              type: tx.type as TransactionType,
              amount: tx.amount,
              balanceBefore,
              balanceAfter,
              referenceId: tx.settlement_id,
              referenceType: tx.type,
              unitId: tx.unit_id,
              unitName: '', // Se puede cargar desde otra tabla si existe
              description: tx.type === TransactionType.PURCHASE
                ? `Compra - ${tx.payment_method}`
                : tx.type,
              category: tx.items?.[0]?.category || '',
              metadata: tx.metadata,
              createdBy: '',
              createdAt: tx.created_at
            };
          }));
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

  // Estadísticas - ADAPTADO A TU ESTRUCTURA
  const stats = useMemo(() => {
    const purchases = filteredTransactions.filter(tx => tx.type === TransactionType.PURCHASE);
    const deposits = filteredTransactions.filter(tx => tx.type === TransactionType.DEPOSIT);

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
