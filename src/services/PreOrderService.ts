/**
 * PRE-ORDER SERVICE
 * LocalStorage-backed demo service for pre-ordering system
 * Manages CRUD operations and status transitions for pre-orders
 */

import { PreOrder, PreOrderStatus, PreOrderItem, Category } from '../types';
import { MOCK_PRE_ORDERS } from '../constants';

const STORAGE_KEY = 'mecard_pre_orders';

function loadOrders(): PreOrder[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Seed with mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PRE_ORDERS));
  return [...MOCK_PRE_ORDERS];
}

function saveOrders(orders: PreOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ── PICKUP SLOTS (configurable per school) ──
export const PICKUP_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00',
];

// ── QUERIES ──

export function getAllPreOrders(): PreOrder[] {
  return loadOrders();
}

export function getPreOrdersByStudent(studentId: string): PreOrder[] {
  return loadOrders().filter(o => o.studentId === studentId);
}

export function getActivePreOrdersByStudent(studentId: string): PreOrder[] {
  const active = [PreOrderStatus.PENDING, PreOrderStatus.CONFIRMED, PreOrderStatus.PREPARING, PreOrderStatus.READY];
  return loadOrders()
    .filter(o => o.studentId === studentId && active.includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPendingOrders(): PreOrder[] {
  const fulfillable = [PreOrderStatus.PENDING, PreOrderStatus.CONFIRMED, PreOrderStatus.PREPARING, PreOrderStatus.READY];
  return loadOrders()
    .filter(o => fulfillable.includes(o.status))
    .sort((a, b) => {
      // Sort by pickup time ascending
      const timeA = a.pickupTime.replace(':', '');
      const timeB = b.pickupTime.replace(':', '');
      return timeA.localeCompare(timeB);
    });
}

export function getPreOrderById(id: string): PreOrder | undefined {
  return loadOrders().find(o => o.id === id);
}

// ── MUTATIONS ──

export function createPreOrder(data: {
  studentId: string;
  studentName: string;
  schoolId: string;
  unitId: string;
  items: PreOrderItem[];
  pickupTime: string;
  pickupDate: string;
  notes?: string;
}): PreOrder {
  const orders = loadOrders();
  const total = data.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  const newOrder: PreOrder = {
    id: `po_${Date.now()}`,
    ...data,
    total,
    status: PreOrderStatus.CONFIRMED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updatePreOrderStatus(
  orderId: string,
  newStatus: PreOrderStatus,
  extra?: { preparedBy?: string; cancelledReason?: string }
): PreOrder | null {
  const orders = loadOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...(extra?.preparedBy && { preparedBy: extra.preparedBy }),
    ...(extra?.cancelledReason && { cancelledReason: extra.cancelledReason }),
  };

  saveOrders(orders);
  return orders[idx];
}

export function cancelPreOrder(orderId: string, reason?: string): PreOrder | null {
  return updatePreOrderStatus(orderId, PreOrderStatus.CANCELLED, { cancelledReason: reason || 'Cancelado por el alumno' });
}

// ── STATS ──

export function getTodayStats() {
  const today = new Date().toISOString().slice(0, 10);
  const orders = loadOrders().filter(o => o.pickupDate === today);
  
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === PreOrderStatus.PENDING || o.status === PreOrderStatus.CONFIRMED).length,
    preparing: orders.filter(o => o.status === PreOrderStatus.PREPARING).length,
    ready: orders.filter(o => o.status === PreOrderStatus.READY).length,
    pickedUp: orders.filter(o => o.status === PreOrderStatus.PICKED_UP).length,
    cancelled: orders.filter(o => o.status === PreOrderStatus.CANCELLED).length,
    revenue: orders.filter(o => o.status !== PreOrderStatus.CANCELLED).reduce((sum, o) => sum + o.total, 0),
  };
}
