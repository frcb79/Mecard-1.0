
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// TIPOS (Reflejando la BD de Supabase)
// ============================================

export interface DbTransaction {
  id: string;
  school_id: string;
  unit_id: string;
  student_id: string;
  type: 'sale' | 'refund' | 'topup' | 'adjustment';
  amount: number;
  mecard_fee?: number;
  card_fee?: number;
  net_amount?: number;
  items: any;
  payment_method: 'nfc' | 'qr' | 'cash' | 'card' | 'spei';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  settlement_id: string | null;
  metadata?: any | null;
  created_at: string;
  student?: {
    full_name: string;
    student_id: string;
    balance: number;
  };
}

// ============================================
// CUSTOM HOOKS
// ============================================

/**
 * Monitorea una lista de transacciones en tiempo real para una escuela específica.
 */
export function useRealtimeTransactions(schoolId: string) {
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    let channel: RealtimeChannel | null = null;

    const loadInitialTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select(`
            *,
            student:profiles!transactions_student_id_fkey (
              full_name,
              student_id,
              balance
            )
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) throw fetchError;

        setTransactions(data || []);
      } catch (err: any) {
        console.error('Error loading transactions:', err);
        setError(err.message || 'Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    const handleInsert = async (payload: any) => {
      try {
        const { data: newTransaction, error: fetchError } = await supabase
          .from('transactions')
          .select(`
            *,
            student:profiles!transactions_student_id_fkey (
              full_name,
              student_id,
              balance
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (fetchError) throw fetchError;

        if (newTransaction) {
          setTransactions(prev => [newTransaction, ...prev]);
        }
      } catch (err) {
        console.error('Error fetching new transaction:', err);
      }
    };

    const handleUpdate = (payload: any) => {
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === payload.new.id
            ? { ...tx, ...payload.new }
            : tx
        )
      );
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`transactions:${schoolId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `school_id=eq.${schoolId}`,
          },
          handleInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `school_id=eq.${schoolId}`,
          },
          handleUpdate
        )
        .subscribe();
    };

    loadInitialTransactions();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [schoolId]);

  return {
    transactions,
    loading,
    error,
  };
}

/**
 * Hook anterior para monitorear un estudiante específico.
 */
export const useRealtimeTransaction = (
  studentId: string | undefined, 
  onNewTransaction: () => void
) => {
  useEffect(() => {
    if (!studentId) return;

    const subscription = supabase
      .channel(`student-txns-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          console.log('¡Nueva transacción detectada en tiempo real!', payload);
          onNewTransaction();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [studentId, onNewTransaction]);
};
