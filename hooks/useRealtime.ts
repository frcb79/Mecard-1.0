
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DbTransaction {
  id: string;
  school_id: string;
  unit_id: string;
  student_id: string;
  type: 'sale' | 'refund' | 'topup' | 'adjustment';
  amount: number;
  created_at: string;
  student?: {
    full_name: string;
    student_id: string;
    balance: number;
  };
}

/**
 * Monitorea una lista de transacciones en tiempo real para una escuela específica.
 */
export function useRealtimeTransactions(schoolId: string) {
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    const loadInitialTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`*, student:profiles!transactions_student_id_fkey (full_name, student_id, balance)`)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) setTransactions(data);
      } catch (err) {
        // Silently skip if network error
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`transactions:${schoolId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `school_id=eq.${schoolId}` }, 
          async (payload) => {
            const { data } = await supabase
              .from('transactions')
              .select(`*, student:profiles!transactions_student_id_fkey (full_name, student_id, balance)`)
              .eq('id', payload.new.id)
              .single();
            if (data) setTransactions(prev => [data, ...prev]);
          }
        )
        .subscribe();
    };

    loadInitialTransactions();
    setupRealtimeSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [schoolId]);

  return { transactions, loading };
}

/**
 * Monitorea un estudiante específico.
 */
export const useRealtimeTransaction = (studentId: string | undefined, onNewTransaction: () => void) => {
  useEffect(() => {
    if (!studentId || !isSupabaseConfigured) return;

    const subscription = supabase
      .channel(`student-txns-${studentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `student_id=eq.${studentId}` }, 
        () => onNewTransaction()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [studentId, onNewTransaction]);
};
