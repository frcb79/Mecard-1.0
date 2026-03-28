import { useCallback, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';

interface SchoolAdminMutationResult {
  ok: boolean;
  message: string;
}

interface UseSchoolAdminMutationsOptions {
  schoolId: string;
  adminId?: string;
}

export const useSchoolAdminMutations = ({ schoolId, adminId }: UseSchoolAdminMutationsOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadWallet = useCallback(
    async (studentId: string, amount: number, reason: string): Promise<SchoolAdminMutationResult> => {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setLoading(false);
        return {
          ok: true,
          message: 'Modo fallback activo: recarga simulada correctamente.',
        };
      }

      try {
        const { error: rpcError } = await supabase.rpc('reload_wallet_atomic', {
          p_student_id: studentId,
          p_school_id: schoolId,
          p_amount: amount,
          p_reason: reason,
          p_admin_id: adminId || null,
        });

        if (rpcError) {
          throw rpcError;
        }

        setLoading(false);
        return { ok: true, message: 'Recarga aplicada correctamente.' };
      } catch (err: unknown) {
        logger.error('hooks.schoolAdminMutations', 'reloadWallet failed', err, { schoolId, studentId, amount });
        setError('No se pudo aplicar la recarga.');
        setLoading(false);
        return { ok: false, message: 'No se pudo aplicar la recarga.' };
      }
    },
    [adminId, schoolId],
  );

  const processRefund = useCallback(
    async (transactionId: string, studentId: string, reason: string): Promise<SchoolAdminMutationResult> => {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setLoading(false);
        return {
          ok: true,
          message: 'Modo fallback activo: reembolso simulado correctamente.',
        };
      }

      try {
        const { error: rpcError } = await supabase.rpc('process_refund_atomic', {
          p_transaction_id: transactionId,
          p_student_id: studentId,
          p_school_id: schoolId,
          p_reason: reason,
          p_admin_id: adminId || null,
        });

        if (rpcError) {
          throw rpcError;
        }

        setLoading(false);
        return { ok: true, message: 'Reembolso procesado correctamente.' };
      } catch (err: unknown) {
        logger.error('hooks.schoolAdminMutations', 'processRefund failed', err, {
          schoolId,
          transactionId,
          studentId,
        });
        setError('No se pudo procesar el reembolso.');
        setLoading(false);
        return { ok: false, message: 'No se pudo procesar el reembolso.' };
      }
    },
    [adminId, schoolId],
  );

  return {
    loading,
    error,
    reloadWallet,
    processRefund,
  };
};

export default useSchoolAdminMutations;
