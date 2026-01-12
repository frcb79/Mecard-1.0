import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para gestionar las recargas de saldo de los padres
 * hacia las tarjetas de los alumnos.
 */
export const parentDepositService = {
  /**
   * Procesa un depósito de saldo utilizando un RPC para asegurar atomicidad.
   * @param parentId ID del padre que realiza la recarga
   * @param studentId ID del alumno (perfil) que recibe el saldo
   * @param amount Monto a depositar
   * @param schoolId ID de la escuela para registro de auditoría
   */
  async processDeposit(
    parentId: string,
    studentId: string,
    amount: number,
    schoolId: string
  ) {
    try {
      // Validamos que el monto sea positivo
      if (amount <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }

      // 1. Llamamos a la función RPC en Postgres para actualizar el balance
      // y crear la transacción en un solo paso (atomicidad)
      const { data, error } = await supabase.rpc('process_student_deposit', {
        p_student_id: studentId,
        p_amount: amount,
        p_parent_id: parentId,
        p_school_id: schoolId
      });

      if (error) throw error;

      // 2. Registramos la transacción de éxito para el historial de la App
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          school_id: schoolId,
          student_id: studentId,
          type: 'DEPOSIT',
          amount: amount,
          status: 'COMPLETED',
          metadata: {
            method: 'STRIPE_CREDIT_CARD',
            parent_id: parentId,
            description: 'Recarga de saldo vía App'
          }
        }]);

      if (txError) console.error('Error registrando auditoría:', txError);

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en parentDepositService:', error.message);
      throw new Error(error.message || 'No se pudo procesar la recarga');
    }
  },

  /**
   * Obtiene el historial de depósitos realizados por un padre específico
   */
  async getParentDepositHistory(parentId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'DEPOSIT')
      .contains('metadata', { parent_id: parentId })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export default parentDepositService;