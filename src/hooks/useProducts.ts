/**
 * useProducts — Centralized hook for product catalog access.
 *
 * Replaces direct imports of PRODUCTS from constants.
 * Provides filtering helpers for category, unit, availability.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRODUCTS } from '../constants';
import type { Product, Category } from '../types';

// ─── Types ────────────────────────────────────────────

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────

export function useProducts(options?: { unitId?: string; category?: Category }) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    error: null,
  });

  const loadProducts = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let filtered = [...PRODUCTS];

      if (options?.unitId) {
        filtered = filtered.filter(p => p.unitId === options.unitId);
      }
      if (options?.category) {
        filtered = filtered.filter(p => p.category === options.category);
      }

      setState({ products: filtered, loading: false, error: null });
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar catálogo de productos',
      }));
    }
  }, [options?.unitId, options?.category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Filter helpers ──

  const availableProducts = useMemo(
    () => state.products.filter(p => p.isAvailable),
    [state.products],
  );

  const getByCategory = useCallback(
    (cat: Category) => state.products.filter(p => p.category === cat),
    [state.products],
  );

  const getByUnit = useCallback(
    (unitId: string) => state.products.filter(p => p.unitId === unitId),
    [state.products],
  );

  const getAvailable = useCallback(
    () => state.products.filter(p => p.isAvailable),
    [state.products],
  );

  const getById = useCallback(
    (productId: string) => state.products.find(p => p.id === productId),
    [state.products],
  );

  const getFeatured = useCallback(
    () => state.products.filter(p => p.isFeatured),
    [state.products],
  );

  const categories = useMemo(() => {
    const cats = new Set(state.products.map(p => p.category));
    return Array.from(cats);
  }, [state.products]);

  const priceRange = useMemo(() => {
    if (state.products.length === 0) return { min: 0, max: 0 };
    const prices = state.products.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [state.products]);

  return {
    ...state,
    availableProducts,
    categories,
    priceRange,
    refresh: loadProducts,
    getByCategory,
    getByUnit,
    getAvailable,
    getById,
    getFeatured,
  };
}

export default useProducts;
