/**
 * usePreOrders — Hook wrapping PreOrderService for pre-order management.
 *
 * Provides typed state + actions for orders, stats, and status transitions.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllPreOrders,
  getPreOrdersByStudent,
  getActivePreOrdersByStudent,
  getPendingOrders,
  getPreOrderById,
  createPreOrder as serviceCreatePreOrder,
  updatePreOrderStatus as serviceUpdateStatus,
  cancelPreOrder as serviceCancelPreOrder,
  getTodayStats,
  PICKUP_SLOTS,
} from '../services/PreOrderService';
import type { PreOrder, PreOrderStatus, PreOrderItem } from '../types';

// ─── Types ────────────────────────────────────────────

export interface PreOrderTodayStats {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
  pickedUp: number;
  cancelled: number;
  revenue: number;
}

interface PreOrdersState {
  orders: PreOrder[];
  pendingOrders: PreOrder[];
  todayStats: PreOrderTodayStats;
  loading: boolean;
  error: string | null;
}

interface CreatePreOrderData {
  studentId: string;
  studentName: string;
  schoolId: string;
  unitId: string;
  items: PreOrderItem[];
  pickupTime: string;
  pickupDate: string;
  notes?: string;
}

// ─── Hook: usePreOrders (all) ─────────────────────────

export function usePreOrders() {
  const [state, setState] = useState<PreOrdersState>({
    orders: [],
    pendingOrders: [],
    todayStats: { total: 0, pending: 0, preparing: 0, ready: 0, pickedUp: 0, cancelled: 0, revenue: 0 },
    loading: true,
    error: null,
  });

  const loadAll = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const orders = getAllPreOrders();
      const pendingOrders = getPendingOrders();
      const todayStats = getTodayStats();

      setState({
        orders,
        pendingOrders,
        todayStats,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('[usePreOrders] Error loading pre-orders:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar pre-órdenes',
      }));
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createPreOrder = useCallback(
    (data: CreatePreOrderData) => {
      const created = serviceCreatePreOrder(data);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updatePreOrderStatus = useCallback(
    (orderId: string, newStatus: PreOrderStatus, extra?: { preparedBy?: string; cancelledReason?: string }) => {
      const updated = serviceUpdateStatus(orderId, newStatus, extra);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const cancelPreOrder = useCallback(
    (orderId: string, reason?: string) => {
      const result = serviceCancelPreOrder(orderId, reason);
      loadAll();
      return result;
    },
    [loadAll],
  );

  return {
    ...state,
    pickupSlots: PICKUP_SLOTS,
    refresh: loadAll,
    createPreOrder,
    updatePreOrderStatus,
    cancelPreOrder,
    getById: getPreOrderById,
  };
}

// ─── Hook: useStudentPreOrders ────────────────────────

export function useStudentPreOrders(studentId: string) {
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const all = getPreOrdersByStudent(studentId);
      const active = getActivePreOrdersByStudent(studentId);
      setOrders(all);
      setActiveOrders(active);
      setLoading(false);
    } catch (err) {
      console.error('[useStudentPreOrders] Error:', err);
      setError('Error al cargar pre-órdenes del alumno');
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) loadOrders();
  }, [studentId, loadOrders]);

  const createPreOrder = useCallback(
    (data: CreatePreOrderData) => {
      const created = serviceCreatePreOrder(data);
      loadOrders();
      return created;
    },
    [loadOrders],
  );

  const cancelPreOrder = useCallback(
    (orderId: string, reason?: string) => {
      const result = serviceCancelPreOrder(orderId, reason);
      loadOrders();
      return result;
    },
    [loadOrders],
  );

  return {
    orders,
    activeOrders,
    loading,
    error,
    pickupSlots: PICKUP_SLOTS,
    refresh: loadOrders,
    createPreOrder,
    cancelPreOrder,
  };
}

export default usePreOrders;
