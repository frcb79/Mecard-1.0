import { useState, useCallback } from 'react';
import { poolService } from '../src/services/supabasePool';
import { supabase } from '../src/lib/supabaseClient';

// Local type definitions to avoid import issues
interface BirthdayPool {
  id: string;
  birthdayStudentId: string;
  birthdayStudentName: string;
  birthdayDate: string;
  targetAmount: number;
  collectedAmount: number;
  status: 'OPEN' | 'FUNDED' | 'DELIVERED' | 'EXPIRED' | 'REFUNDED';
  message?: string;
  createdAt: string;
  expiresAt: string;
  targetItem?: { id: string; name: string; image?: string; price: number };
  contributors?: any[];
  productChangeCount?: number;
  lastProductChangeAt?: string | null;
}

interface PoolProductSwapResult {
  success: boolean;
  message: string;
  poolData?: any;
  refundTotal?: number;
  affectedContributors?: number;
  error?: string;
}

interface UsePoolsOptions {
  autoLoad?: boolean;
}

export function usePools(options: UsePoolsOptions = { autoLoad: true }) {
  const [pools, setPools] = useState<BirthdayPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPool, setCurrentPool] = useState<any | null>(null);

  /**
   * Carga los pools activos para el usuario actual (parent)
   */
  const loadParentPools = useCallback(async (parentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('birthday_pools')
        .select(`
          *,
          birthday_student:students(full_name, id),
          contributions:pool_contributions(*)
        `)
        .eq('creator_id', parentId)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      const transformed = data?.map((pool: any) => ({
        id: pool.id,
        birthdayStudentId: pool.birthday_student_id,
        birthdayStudentName: pool.birthday_student?.full_name,
        birthdayDate: pool.birthday_date,
        targetAmount: pool.target_amount,
        collectedAmount: pool.collected_amount,
        status: pool.status,
        message: pool.message,
        createdAt: pool.created_at,
        expiresAt: pool.expires_at,
        targetItem: {
          id: pool.target_product_id,
          name: pool.target_product_name,
          image: pool.target_product_image,
          price: pool.target_amount,
        },
        contributors: pool.contributions || [],
        productChangeCount: pool.product_change_count,
        lastProductChangeAt: pool.last_product_change_at,
      })) || [];

      setPools(transformed);
      setError(null);
      return transformed;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar pools';
      setError(errorMsg);
      console.error('Error loading pools:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga los detalles completos de un pool específico
   */
  const getPoolDetails = useCallback(async (poolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await poolService.getPoolDetails(poolId);
      setCurrentPool(details);
      return details;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar detalles del pool';
      setError(errorMsg);
      console.error('Error getting pool details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia el producto de un pool
   */
  const swapProduct = useCallback(
    async (
      poolId: string,
      creatorId: string,
      newProductId: string,
      newProductName: string,
      newProductPrice: number,
      reason?: string
    ): Promise<PoolProductSwapResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await poolService.swapPoolProduct(
          poolId,
          creatorId,
          newProductId,
          newProductName,
          newProductPrice,
          reason
        );

        if (result.success) {
          // Recargar el pool actualizado
          await getPoolDetails(poolId);
          
          // Actualizar la lista de pools
          setPools((prev) =>
            prev.map((p) =>
              p.id === poolId
                ? {
                    ...p,
                    targetItem: {
                      id: newProductId,
                      name: newProductName,
                      image: p.targetItem?.image,
                      price: newProductPrice,
                    },
                  }
                : p
            )
          );
        } else {
          setError(result.message);
        }

        return result;
      } catch (err: any) {
        const errorMsg = err.message || 'Error al cambiar producto';
        setError(errorMsg);
        console.error('Error swapping product:', err);
        return {
          success: false,
          message: errorMsg,
          error: errorMsg,
        };
      } finally {
        setLoading(false);
      }
    },
    [getPoolDetails]
  );

  /**
   * Obtiene el historial de cambios de un pool
   */
  const getChangeHistory = useCallback(async (poolId: string) => {
    setError(null);
    try {
      return await poolService.getProductChangeHistory(poolId);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar historial';
      setError(errorMsg);
      console.error('Error getting change history:', err);
      return [];
    }
  }, []);

  /**
   * Obtiene los reembolsos de un pool
   */
  const getRefunds = useCallback(async (poolId: string) => {
    setError(null);
    try {
      return await poolService.getPoolRefunds(poolId);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar reembolsos';
      setError(errorMsg);
      console.error('Error getting refunds:', err);
      return [];
    }
  }, []);

  /**
   * Crea un nuevo pool de cumpleaños
   */
  const createPool = useCallback(
    async (poolData: {
      birthdayStudentId: string;
      creatorId: string;
      creatorType: 'STUDENT' | 'PARENT';
      targetProductId: string;
      targetProductName: string;
      targetProductImage: string;
      targetAmount: number;
      birthdayDate: string;
      expiresAt: string;
      message?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: createError } = await supabase
          .from('birthday_pools')
          .insert({
            birthday_student_id: poolData.birthdayStudentId,
            creator_id: poolData.creatorId,
            creator_type: poolData.creatorType,
            target_product_id: poolData.targetProductId,
            target_product_name: poolData.targetProductName,
            target_product_image: poolData.targetProductImage,
            target_amount: poolData.targetAmount,
            birthday_date: poolData.birthdayDate,
            expires_at: poolData.expiresAt,
            message: poolData.message || null,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Recargar pools
        if (poolData.creatorType === 'PARENT') {
          await loadParentPools(poolData.creatorId);
        }

        return { success: true, data };
      } catch (err: any) {
        const errorMsg = err.message || 'Error al crear pool';
        setError(errorMsg);
        console.error('Error creating pool:', err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [loadParentPools]
  );

  return {
    pools,
    currentPool,
    loading,
    error,
    loadParentPools,
    getPoolDetails,
    swapProduct,
    getChangeHistory,
    getRefunds,
    createPool,
  };
}
