/**
 * Barrel exports for all hooks.
 * Import from '@/hooks' or '../hooks' to use.
 */

// ─── Phase 4 Module Connectivity Hooks ────────────────
export { useDashboard } from './useDashboard';
export type { DashboardMetrics, RevenueByMonth, CampusRow, PaymentStatusSlice } from './useDashboard';

export { useFees } from './useFees';

export { useAccess } from './useAccess';
export type { DailyStats, AttendanceSummary } from './useAccess';

export { useStudents, useStudent } from './useStudents';

export { useProducts } from './useProducts';

export { usePreOrders, useStudentPreOrders } from './usePreOrders';
export type { PreOrderTodayStats } from './usePreOrders';

export { useSchoolData } from './useSchoolData';

// ─── Existing Hooks ──────────────────────────────────
export { useAuth } from './useAuth';
export { useNotifications } from './useNotifications';
export { usePos } from './usePos';
export { useProductSearch } from './useProductSearch';
export { useRealtimeTransactions, useRealtimeTransaction } from './useRealtime';
export { useRewards } from './useRewards';
export { useTransactions } from './useTransactions';
