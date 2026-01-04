
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
