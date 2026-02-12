/**
 * useRewards Hook
 * Gestiona estado y lógica de rewards para componentes React
 */

import { useState, useEffect, useCallback } from 'react';
import {
  StudentRewardsPoints,
  SchoolRewardsConfig,
  MarketplaceProduct,
  PointsTransaction,
  StudentRedemption
} from '../types';
import { rewardsService } from '../services/rewardsService';

interface UseRewardsOptions {
  studentId?: string;
  schoolId?: string;
  autoLoad?: boolean;
}

interface UseRewardsState {
  // Data
  studentPoints: StudentRewardsPoints | null;
  config: SchoolRewardsConfig | null;
  products: MarketplaceProduct[];
  transactions: PointsTransaction[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  loadStudentPoints: () => Promise<void>;
  loadConfig: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadTransactionHistory: () => Promise<void>;
  processRedemption: (productId: string) => Promise<StudentRedemption | null>;
  refresh: () => Promise<void>;
}

export const useRewards = (options: UseRewardsOptions = {}): UseRewardsState => {
  const { studentId, schoolId, autoLoad = true } = options;

  // State
  const [studentPoints, setStudentPoints] = useState<StudentRewardsPoints | null>(null);
  const [config, setConfig] = useState<SchoolRewardsConfig | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load student points
  const loadStudentPoints = useCallback(async () => {
    if (!studentId || !schoolId) return;

    try {
      setError(null);
      const points = await rewardsService.mockGetStudentRewardsPoints(studentId, schoolId);
      setStudentPoints(points);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando puntos');
    }
  }, [studentId, schoolId]);

  // Load school config
  const loadConfig = useCallback(async () => {
    if (!schoolId) return;

    try {
      setError(null);
      const cfg = await rewardsService.mockGetSchoolRewardsConfig(schoolId);
      setConfig(cfg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando configuración');
    }
  }, [schoolId]);

  // Load marketplace products
  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const prods = await rewardsService.mockGetMarketplaceProducts(schoolId);
      setProducts(prods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    }
  }, [schoolId]);

  // Load transaction history
  const loadTransactionHistory = useCallback(async () => {
    if (!studentId) return;

    try {
      setError(null);
      const txs = await rewardsService.mockGetPointsTransactionHistory(studentId);
      setTransactions(txs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando historial');
    }
  }, [studentId]);

  // Process redemption
  const processRedemption = useCallback(
    async (productId: string): Promise<StudentRedemption | null> => {
      if (!studentId || !studentPoints) return null;

      const product = products.find(p => p.id === productId);
      if (!product) {
        setError('Producto no encontrado');
        return null;
      }

      // Validate
      const validation = rewardsService.validateRedemption(studentPoints, product);
      if (!validation.valid) {
        setError(validation.reason || 'No puedes hacer este canje');
        return null;
      }

      try {
        setError(null);
        const redemption = await rewardsService.mockProcessRedemption(
          studentId,
          productId,
          product.pointsCost
        );

        // Update local state
        setStudentPoints({
          ...studentPoints,
          totalPoints: studentPoints.totalPoints - product.pointsCost,
          redeemedThisCycle: studentPoints.redeemedThisCycle + product.pointsCost,
          lastUpdated: new Date().toISOString()
        });

        return redemption;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error procesando canje');
        return null;
      }
    },
    [studentId, studentPoints, products]
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadStudentPoints(), loadConfig(), loadProducts(), loadTransactionHistory()]);
    } finally {
      setLoading(false);
    }
  }, [loadStudentPoints, loadConfig, loadProducts, loadTransactionHistory]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    studentPoints,
    config,
    products,
    transactions,
    loading,
    error,
    loadStudentPoints,
    loadConfig,
    loadProducts,
    loadTransactionHistory,
    processRedemption,
    refresh
  };
};
