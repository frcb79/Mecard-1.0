import { supabase } from '../lib/supabaseClient';
import { Product, BirthdayPool, PoolContribution } from '../types';
import { NotificationService } from './notificationService';

export interface ProductChangeHistoryRow {
  id: string;
  pool_id: string;
  old_product_id: string | null;
  old_product_name: string | null;
  new_product_id: string;
  new_product_name: string;
  old_price: number | null;
  new_price: number;
  changed_by: string;
  refund_total: number | null;
  change_reason: string | null;
  is_rejected: boolean;
  created_at: string;
}

export interface PoolRefundRow {
  id: string;
  pool_id: string;
  product_change_id: string;
  contributor_id: string;
  original_amount_contributed: number;
  refund_amount: number;
  refund_method: 'wallet' | 'original_payment';
  status: 'pending' | 'processed' | 'failed' | 'cancelled';
  processed_at: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export const poolService = {
  /**
   * Obtiene el historial de cambios de producto para un pool
   */
  async getProductChangeHistory(poolId: string): Promise<ProductChangeHistoryRow[]> {
    try {
      const { data, error } = await supabase
        .from('product_change_history')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product change history:', error);
      return [];
    }
  },

  /**
   * Obtiene los reembolsos asociados a un cambio de producto
   */
  async getPoolRefunds(poolId: string): Promise<PoolRefundRow[]> {
    try {
      const { data, error } = await supabase
        .from('pool_refunds')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pool refunds:', error);
      return [];
    }
  },

  /**
   * Cambia el producto de un pool y calcula reembolsos pro-rata si es necesario
   * @param poolId - ID del pool
   * @param creatorId - ID del creador (debe ser el parent que creó el pool)
   * @param newProductId - ID del nuevo producto
   * @param newProductName - Nombre del nuevo producto
   * @param newProductPrice - Precio del nuevo producto
   * @param reason - Razón del cambio (opcional)
   * @returns SwapResult con detalles de la operación
   */
  async swapPoolProduct(
    poolId: string,
    creatorId: string,
    newProductId: string,
    newProductName: string,
    newProductPrice: number,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    poolData?: any;
    refundTotal?: number;
    affectedContributors?: number;
    error?: string;
  }> {
    try {
      // 1. Obtener datos actuales del pool
      const { data: poolData, error: poolError } = await supabase
        .from('birthday_pools')
        .select('*, contributions:pool_contributions(*)')
        .eq('id', poolId)
        .single();

      if (poolError) throw new Error(`Pool no encontrado: ${poolError.message}`);
      if (!poolData) throw new Error('Pool no existe');

      // 2. Verificar que el creador sea quien hace el cambio
      if (poolData.creator_id !== creatorId) {
        throw new Error('Solo el creador del pool puede cambiar el producto');
      }

      // 3. Verificar que el pool no esté en estado terminal
      if (['DELIVERED', 'REFUNDED'].includes(poolData.status)) {
        throw new Error(`No se puede cambiar producto en estado ${poolData.status}`);
      }

      // 4. Obtener el producto anterior si existe
      const oldProductData = poolData.target_product_id
        ? await supabase
            .from('products')
            .select('id, name, price')
            .eq('id', poolData.target_product_id)
            .single()
        : { data: null };

      const oldPrice = oldProductData.data?.price || null;

      // 5. Si el nuevo producto es más caro que lo recaudado, rechazar
      if (newProductPrice > poolData.collected_amount) {
        return {
          success: false,
          message: `El producto cuesta $${newProductPrice} pero solo se han recaudado $${poolData.collected_amount}. Se requieren $${(newProductPrice - poolData.collected_amount).toFixed(2)} adicionales.`,
          poolData,
        };
      }

      // 6. Calcular refundo si la nuevo producto es más barato
      const refundTotal =
        poolData.collected_amount > newProductPrice
          ? parseFloat((poolData.collected_amount - newProductPrice).toFixed(2))
          : 0;

      // 7. Crear registro de cambio de producto
      const { data: changeHistoryData, error: changeError } = await supabase
        .from('product_change_history')
        .insert({
          pool_id: poolId,
          old_product_id: poolData.target_product_id,
          old_product_name: poolData.target_product_name,
          new_product_id: newProductId,
          new_product_name: newProductName,
          old_price: oldPrice,
          new_price: newProductPrice,
          changed_by: creatorId,
          refund_total: refundTotal > 0 ? refundTotal : null,
          change_reason: reason,
          is_rejected: false,
        })
        .select()
        .single();

      if (changeError) throw new Error(`Error registrando cambio: ${changeError.message}`);

      // 8. Si hay reembolso, calcular pro-rata y crear registros
      if (refundTotal > 0 && poolData.pool_contributions && poolData.pool_contributions.length > 0) {
        const contributions = poolData.pool_contributions as any[];
        const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
        const autoRefundToPointsAt = new Date(`${poolData.birthday_date}T12:00:00.000Z`);
        autoRefundToPointsAt.setUTCDate(autoRefundToPointsAt.getUTCDate() + 30);

        const refunds: Array<{
          pool_id: string;
          product_change_id: string;
          contributor_id: string;
          original_amount_contributed: number;
          refund_amount: number;
          refund_method: string;
          status: string;
          auto_refund_to_points_at: string;
        }> = contributions.map((contrib) => {
          // Cálculo pro-rata: (contribución / total) * refundo total
          const proportionalRefund = parseFloat(
            ((contrib.amount / totalCollected) * refundTotal).toFixed(2)
          );
          return {
            pool_id: poolId,
            product_change_id: changeHistoryData.id,
            contributor_id: contrib.contributor_id,
            original_amount_contributed: contrib.amount,
            refund_amount: proportionalRefund,
            refund_method: 'wallet',
            status: 'pending',
            auto_refund_to_points_at: autoRefundToPointsAt.toISOString(),
          };
        });

        const { error: refundError } = await supabase
          .from('pool_refunds')
          .insert(refunds);

        if (refundError) {
          console.error('Error creating refund records:', refundError);
          // No lanzar error aquí porque el cambio de producto fue exitoso
          // pero notificar al usuario que los reembolsos pueden fallar
        }
      }

      // 9. Actualizar el pool con el nuevo producto
      const { error: updateError } = await supabase
        .from('birthday_pools')
        .update({
          target_product_id: newProductId,
          target_product_name: newProductName,
          product_change_count: poolData.product_change_count + 1,
          last_product_change_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', poolId);

      if (updateError) throw new Error(`Error actualizando pool: ${updateError.message}`);

      // 10. Si hay reembolsos, procesarlos asincronamente
      if (refundTotal > 0) {
        await poolService.processPoolRefunds(poolId, changeHistoryData.id).catch((err) => {
          console.error('Error processing refunds:', err);
        });
      }

      // 11. Notificar a los contribuyentes del cambio
      try {
        await poolService.notifyContributorsOfChange(
          poolId,
          oldProductData.data?.name || poolData.target_product_name,
          newProductName,
          refundTotal
        );
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError);
      }

      return {
        success: true,
        message: refundTotal > 0
          ? `Producto canjeado. Se procesarán reembolsos por $${refundTotal.toFixed(2)} a los contribuyentes.`
          : 'Producto canjeado exitosamente.',
        poolData: { ...poolData, target_product_id: newProductId, target_product_name: newProductName },
        refundTotal,
        affectedContributors: poolData.pool_contributions?.length || 0,
      };
    } catch (error) {
      console.error('Error swapping pool product:', error);
      return {
        success: false,
        message: 'Error al cambiar el producto del pool',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Procesa los reembolsos pendientes para un cambio de producto
   */
  async processPoolRefunds(poolId: string, productChangeId: string): Promise<void> {
    try {
      const { data: poolRow } = await supabase
        .from('birthday_pools')
        .select('birthday_student_id')
        .eq('id', poolId)
        .single();

      const { data: birthdayStudent } = await supabase
        .from('students')
        .select('id, school_id')
        .eq('id', poolRow?.birthday_student_id)
        .maybeSingle();

      // 1. Obtener todos los reembolsos pendientes para esto cambio
      const { data: refunds, error: refundError } = await supabase
        .from('pool_refunds')
        .select('*')
        .eq('product_change_id', productChangeId)
        .eq('status', 'pending');

      if (refundError) throw refundError;
      if (!refunds || refunds.length === 0) return;

      // 2. Para cada reembolso, crear una transacción de billetera
      for (const refund of refunds) {
        try {
          const { data: contributorStudent } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', refund.contributor_id)
            .maybeSingle();

          const transactionStudentId = contributorStudent?.id || birthdayStudent?.id;

          let transactionId: string | null = null;

          if (transactionStudentId && birthdayStudent?.school_id) {
            const { data: transaction, error: txError } = await supabase
              .from('transactions')
              .insert({
                school_id: birthdayStudent.school_id,
                student_id: transactionStudentId,
                type: 'refund',
                status: 'completed',
                amount: refund.refund_amount,
                notes: `Pool product swap refund for pool ${poolId}`,
                refund_reason: 'pool_cheaper',
                refund_type: 'pool',
                metadata: {
                  pool_id: poolId,
                  refund_id: refund.id,
                  beneficiary_profile_id: refund.contributor_id,
                  reason: 'Product swap',
                },
              })
              .select('id')
              .single();

            if (txError) {
              await supabase
                .from('pool_refunds')
                .update({ status: 'failed' })
                .eq('id', refund.id);
              continue;
            }

            transactionId = transaction.id;
          }

          // 3. Actualizar el balance del contributor en profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', refund.contributor_id)
            .single();

          const newBalance = (profile?.balance || 0) + refund.refund_amount;

          await supabase
            .from('profiles')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq('id', refund.contributor_id);

          // 4. Marcar reembolso como procesado
          await supabase
            .from('pool_refunds')
            .update({
              status: 'processed',
              processed_at: new Date().toISOString(),
              transaction_id: transactionId,
            })
            .eq('id', refund.id);
        } catch (error) {
          console.error(`Error processing refund ${refund.id}:`, error);
          await supabase
            .from('pool_refunds')
            .update({ status: 'failed' })
            .eq('id', refund.id);
        }
      }
    } catch (error) {
      console.error('Error in processPoolRefunds:', error);
      throw error;
    }
  },

  /**
   * Rechaza un cambio de producto (revierte la acción)
   */
  async rejectPoolSwap(poolId: string, changeHistoryId: string, reason: string): Promise<void> {
    try {
      // 1. Marcar el cambio como rechazado
      const { error: rejectError } = await supabase
        .from('product_change_history')
        .update({ is_rejected: true })
        .eq('id', changeHistoryId);

      if (rejectError) throw rejectError;

      // 2. Cancelar todos los reembolsos asociados
      const { error: cancelError } = await supabase
        .from('pool_refunds')
        .update({ status: 'cancelled' })
        .eq('product_change_id', changeHistoryId)
        .eq('status', 'pending');

      if (cancelError) throw cancelError;

      // 3. Obtener el producto anterior y restaurar
      const { data: history } = await supabase
        .from('product_change_history')
        .select('old_product_id, old_product_name')
        .eq('id', changeHistoryId)
        .single();

      if (history && history.old_product_id) {
        await supabase
          .from('birthday_pools')
          .update({
            target_product_id: history.old_product_id,
            target_product_name: history.old_product_name,
          })
          .eq('id', poolId);
      }
    } catch (error) {
      console.error('Error rejecting pool swap:', error);
      throw error;
    }
  },

  /**
   * Notifica a todos los contribuyentes sobre un cambio de producto
   */
  async notifyContributorsOfChange(
    poolId: string,
    oldProductName: string,
    newProductName: string,
    refundAmount: number
  ): Promise<void> {
    try {
      // 1. Obtener todos los contribuyentes
      const { data: contributions } = await supabase
        .from('pool_contributions')
        .select('contributor_id, contributor_name, amount')
        .eq('pool_id', poolId);

      if (!contributions || contributions.length === 0) return;

      // 2. Para cada contribuyente, enviar notificación
      for (const contrib of contributions) {
        const notificationMessage =
          refundAmount > 0
            ? `Fue canjeado de "${oldProductName}" a "${newProductName}". Recibirás un reembolso según tu aporte.`
            : `Fue canjeado de "${oldProductName}" a "${newProductName}".`;

        try {
          // Registrar en tabla de notificaciones
          await supabase
            .from('notifications')
            .insert({
              recipient_id: contrib.contributor_id,
              recipient_role: 'STUDENT',
              type: 'POOL_PRODUCT_SWAP',
              title: 'Regalo canjeado',
              body: notificationMessage,
              data: {
                poolId,
                oldProduct: oldProductName,
                newProduct: newProductName,
                refundAmount: refundAmount > 0 ? refundAmount : 0,
              },
            });
        } catch (error) {
          console.error(`Error notifying contributor ${contrib.contributor_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error notifying contributors of change:', error);
    }
  },

  /**
   * Obtiene detalles completos de un pool incluyendo historial y reembolsos
   */
  async getPoolDetails(poolId: string): Promise<any> {
    try {
      const { data: pool } = await supabase
        .from('birthday_pools')
        .select(
          `
          *,
          contributions:pool_contributions(*),
          changes:product_change_history(*),
          refunds:pool_refunds(*)
        `
        )
        .eq('id', poolId)
        .single();

      return pool;
    } catch (error) {
      console.error('Error fetching pool details:', error);
      return null;
    }
  },
};
