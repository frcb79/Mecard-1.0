/**
 * useDashboard — Hook for Dashboard data aggregation.
 *
 * Fetches KPIs from multiple services and provides unified metrics.
 * Uses mock data from constants when Supabase is not configured.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';
import { SchoolFeeService, type FeeStats } from '../services/SchoolFeeService';
import { AccessControlService } from '../services/AccessControlService';
import { NotificationService } from '../services/notificationService';
import { getTodayStats as getPreOrderTodayStats } from '../services/PreOrderService';
import {
  MOCK_STUDENTS_LIST,
  MOCK_TRANSACTIONS,
  MOCK_PARENT_PAYMENTS,
  MOCK_UNITS,
  MOCK_ACTIVITY_LOG,
  MOCK_SCHOOLS,
} from '../constants';
import type {
  ParentPaymentStatus,
  ActivityLogEntry,
  School,
  StudentProfile,
  OperatingUnit,
} from '../types';
import { ParentPaymentStatus as PPS } from '../types';

// ─── Types ────────────────────────────────────────────

export interface DashboardMetrics {
  // Schools & units
  totalSchools: number;
  totalUnits: number;

  // Students
  totalStudents: number;

  // Finances
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
  collectionRate: number;
  totalBalance: number;
  totalTransactions: number;

  // Fee stats (from SchoolFeeService)
  feeStats: FeeStats | null;

  // Access
  attendancePercent: number;
  entrancesToday: number;
  exitesToday: number;
  currentlyOnCampus: number;
  deniedToday: number;

  // Pre-orders
  preOrdersToday: number;
  preOrdersPending: number;
  preOrderRevenue: number;

  // Notifications
  unreadNotifications: number;
}

export interface RevenueByMonth {
  month: string;
  cobrado: number;
  pendiente: number;
}

export interface CampusRow {
  id: string;
  name: string;
  students: number;
  balance: number;
  status: string;
}

export interface PaymentStatusSlice {
  name: string;
  value: number;
}

interface DashboardState {
  metrics: DashboardMetrics;
  revenueByMonth: RevenueByMonth[];
  campusData: CampusRow[];
  statusPie: PaymentStatusSlice[];
  recentActivity: ActivityLogEntry[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface StudentBalanceRow {
  school_id: string | null;
  balance: number | null;
}

interface UnitSchoolRow {
  school_id: string | null;
}

interface TransactionRow {
  id: string;
  school_id: string | null;
  amount: number | null;
  type: string | null;
  created_at: string | null;
}

interface ActivityLogRow {
  id: string;
  action?: string | null;
  actor_id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  reason?: string | null;
  details?: string | null;
  table_name?: string | null;
  entity_type?: string | null;
  record_id?: string | null;
  entity_id?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
}

// ─── Mock metric builders ─────────────────────────────

function buildMockMetrics(schools: School[]): DashboardMetrics {
  const totalStudents = MOCK_STUDENTS_LIST.length;
  const totalUnits = MOCK_UNITS.length;
  const totalBalance = schools.reduce((s, sc) => s + sc.balance, 0);
  const totalTransactions = MOCK_TRANSACTIONS.length;

  const paid = MOCK_PARENT_PAYMENTS.filter(p => p.status === PPS.PAID);
  const totalCollected = paid.reduce((s, p) => s + (p.paidAmount || p.amount), 0);
  const pendingPayments = MOCK_PARENT_PAYMENTS.filter(
    p => p.status === PPS.PENDING || p.status === PPS.OVERDUE,
  );
  const totalPending = pendingPayments.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);
  const overdueCount = MOCK_PARENT_PAYMENTS.filter(p => p.status === PPS.OVERDUE).length;

  let feeStats: FeeStats | null = null;
  try {
    feeStats = SchoolFeeService.getStats('mx_01');
  } catch {
    /* ignore */
  }

  // Access daily stats
  const today = new Date().toISOString().slice(0, 10);
  let accessStats = {
    attendancePercent: 0,
    totalEntries: 0,
    totalExits: 0,
    currentlyInCampus: 0,
    deniedAccess: 0,
  };
  try {
    const ds = AccessControlService.getDailyStats('mx_01', today);
    accessStats = ds;
  } catch {
    /* ignore */
  }

  // Pre-order stats
  let preOrderStats = { total: 0, pending: 0, revenue: 0 };
  try {
    const ps = getPreOrderTodayStats();
    preOrderStats = { total: ps.total, pending: ps.pending, revenue: ps.revenue };
  } catch {
    /* ignore */
  }

  return {
    totalSchools: schools.length,
    totalUnits,
    totalStudents,
    totalCollected,
    totalPending,
    overdueCount,
    collectionRate: feeStats?.collectionRate ?? 0,
    totalBalance,
    totalTransactions,
    feeStats,
    attendancePercent: accessStats.attendancePercent,
    entrancesToday: accessStats.totalEntries,
    exitesToday: accessStats.totalExits,
    currentlyOnCampus: accessStats.currentlyInCampus,
    deniedToday: accessStats.deniedAccess,
    preOrdersToday: preOrderStats.total,
    preOrdersPending: preOrderStats.pending,
    preOrderRevenue: preOrderStats.revenue,
    unreadNotifications: 0,
  };
}

function buildRevenueByMonth(): RevenueByMonth[] {
  const months: Record<string, RevenueByMonth> = {};
  MOCK_PARENT_PAYMENTS.forEach(p => {
    const m = p.dueDate.slice(0, 7);
    if (!months[m]) months[m] = { month: m, cobrado: 0, pendiente: 0 };
    if (p.status === PPS.PAID) months[m].cobrado += p.paidAmount || p.amount;
    else months[m].pendiente += p.amount - (p.paidAmount || 0);
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

function buildCampusData(schools: School[]): CampusRow[] {
  return schools.map(s => ({
    id: s.id,
    name: s.name,
    students:
      MOCK_STUDENTS_LIST.filter(st => st.schoolId === s.id).length ||
      s.studentCount || 0,
    balance: s.balance,
    status: s.status,
  }));
}

function buildStatusPie(): PaymentStatusSlice[] {
  const counts: Record<string, number> = {};
  MOCK_PARENT_PAYMENTS.forEach(p => {
    const label =
      p.status === PPS.PAID
        ? 'Pagado'
        : p.status === PPS.PENDING
          ? 'Pendiente'
          : p.status === PPS.OVERDUE
            ? 'Vencido'
            : 'Parcial';
    counts[label] = (counts[label] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function toActivityAction(input?: string | null): ActivityLogEntry['action'] {
  const value = (input || '').toUpperCase();
  if (value.includes('RELOAD') || value.includes('DEPOSIT')) return 'deposit';
  if (value.includes('LIMIT')) return 'limit_change';
  if (value.includes('PERMISSION')) return 'permission_create';
  if (value.includes('TRIP')) return 'trip_payment';
  return 'login';
}

function toEntityType(input?: string | null): ActivityLogEntry['entityType'] {
  const value = (input || '').toLowerCase();
  if (value.includes('wallet') || value.includes('transaction') || value.includes('profile')) return 'wallet';
  if (value.includes('student')) return 'student';
  if (value.includes('permission')) return 'permission';
  if (value.includes('trip')) return 'trip';
  if (value.includes('parent')) return 'parent';
  if (value.includes('contact')) return 'contact';
  return 'session';
}

function buildRevenueByMonthFromTransactions(rows: TransactionRow[]): RevenueByMonth[] {
  const months: Record<string, RevenueByMonth> = {};

  rows.forEach((tx) => {
    if (!tx.created_at) return;
    const month = tx.created_at.slice(0, 7);
    if (!months[month]) {
      months[month] = { month, cobrado: 0, pendiente: 0 };
    }

    const amount = tx.amount || 0;
    if (amount > 0) {
      months[month].cobrado += amount;
    }
  });

  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

function buildStatusPieFromTransactions(rows: TransactionRow[]): PaymentStatusSlice[] {
  const buckets: Record<string, number> = {
    Compras: 0,
    Recargas: 0,
    Reembolsos: 0,
    Otros: 0,
  };

  rows.forEach((tx) => {
    const txType = (tx.type || '').toUpperCase();
    if (txType === 'PURCHASE' || txType === 'FEE') {
      buckets.Compras += 1;
      return;
    }
    if (txType === 'RELOAD' || txType === 'DEPOSIT') {
      buckets.Recargas += 1;
      return;
    }
    if (txType === 'REFUND') {
      buckets.Reembolsos += 1;
      return;
    }
    buckets.Otros += 1;
  });

  return Object.entries(buckets)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

async function fetchSupabaseDashboard(schools: School[]): Promise<Pick<DashboardState, 'metrics' | 'revenueByMonth' | 'campusData' | 'statusPie' | 'recentActivity'>> {
  const [studentsRes, unitsRes, transactionsRes, activityRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('school_id, balance', { count: 'exact' })
      .eq('role', 'STUDENT'),
    supabase
      .from('operating_units')
      .select('school_id', { count: 'exact' }),
    supabase
      .from('transactions')
      .select('id, school_id, amount, type, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  if (studentsRes.error) throw studentsRes.error;
  if (unitsRes.error) throw unitsRes.error;
  if (transactionsRes.error) throw transactionsRes.error;
  if (activityRes.error) throw activityRes.error;

  const studentRows = (studentsRes.data || []) as StudentBalanceRow[];
  const unitRows = (unitsRes.data || []) as UnitSchoolRow[];
  const txRows = (transactionsRes.data || []) as TransactionRow[];
  const activityRows = (activityRes.data || []) as ActivityLogRow[];

  const studentsBySchool: Record<string, number> = {};
  const balancesBySchool: Record<string, number> = {};
  studentRows.forEach((row) => {
    if (!row.school_id) return;
    studentsBySchool[row.school_id] = (studentsBySchool[row.school_id] || 0) + 1;
    balancesBySchool[row.school_id] = (balancesBySchool[row.school_id] || 0) + (row.balance || 0);
  });

  const unitsBySchool: Record<string, number> = {};
  unitRows.forEach((row) => {
    if (!row.school_id) return;
    unitsBySchool[row.school_id] = (unitsBySchool[row.school_id] || 0) + 1;
  });

  let totalCollected = 0;
  txRows.forEach((tx) => {
    const amount = tx.amount || 0;
    if (amount > 0) totalCollected += amount;
  });

  const totalStudents = studentRows.length;
  const totalUnits = unitsRes.count || unitRows.length;
  const totalBalance = Object.values(balancesBySchool).reduce((a, b) => a + b, 0);
  const totalTransactions = transactionsRes.count || txRows.length;

  const metrics: DashboardMetrics = {
    totalSchools: schools.length,
    totalUnits,
    totalStudents,
    totalCollected,
    totalPending: 0,
    overdueCount: 0,
    collectionRate: totalCollected > 0 ? 100 : 0,
    totalBalance,
    totalTransactions,
    feeStats: null,
    attendancePercent: 0,
    entrancesToday: 0,
    exitesToday: 0,
    currentlyOnCampus: 0,
    deniedToday: 0,
    preOrdersToday: 0,
    preOrdersPending: 0,
    preOrderRevenue: 0,
    unreadNotifications: 0,
  };

  const campusData: CampusRow[] = schools.map((school) => ({
    id: school.id,
    name: school.name,
    students: studentsBySchool[school.id] || 0,
    balance: balancesBySchool[school.id] || 0,
    status: school.status,
  }));

  const recentActivity: ActivityLogEntry[] = activityRows.map((row) => {
    const actorId = row.actor_id || row.user_id || 'system';
    const userName = row.user_name || 'Sistema';
    const tableRef = row.table_name || row.entity_type || 'general';
    const recordRef = row.record_id || row.entity_id || row.id;
    const reason = row.reason || row.details || `${row.action || 'ACTIVITY'} sobre ${tableRef}`;
    const stamp = row.created_at || row.timestamp || new Date().toISOString();

    return {
      id: row.id,
      userId: actorId,
      userName,
      action: toActivityAction(row.action),
      entityType: toEntityType(tableRef),
      entityId: recordRef,
      details: reason,
      timestamp: new Date(stamp).toLocaleString('es-MX'),
    };
  });

  return {
    metrics,
    revenueByMonth: buildRevenueByMonthFromTransactions(txRows),
    campusData,
    statusPie: buildStatusPieFromTransactions(txRows),
    recentActivity,
  };
}

// ─── Hook ─────────────────────────────────────────────

export function useDashboard(schoolId: string = 'mx_01') {
  const [state, setState] = useState<DashboardState>({
    metrics: {
      totalSchools: 0,
      totalUnits: 0,
      totalStudents: 0,
      totalCollected: 0,
      totalPending: 0,
      overdueCount: 0,
      collectionRate: 0,
      totalBalance: 0,
      totalTransactions: 0,
      feeStats: null,
      attendancePercent: 0,
      entrancesToday: 0,
      exitesToday: 0,
      currentlyOnCampus: 0,
      deniedToday: 0,
      preOrdersToday: 0,
      preOrdersPending: 0,
      preOrderRevenue: 0,
      unreadNotifications: 0,
    },
    revenueByMonth: [],
    campusData: [],
    statusPie: [],
    recentActivity: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchMetrics = useCallback(
    async (schools: School[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let metrics: DashboardMetrics;
        let revenueByMonth: RevenueByMonth[];
        let campusData: CampusRow[];
        let statusPie: PaymentStatusSlice[];
        let recentActivity: ActivityLogEntry[];

        if (isSupabaseConfigured) {
          const real = await fetchSupabaseDashboard(schools);
          metrics = real.metrics;
          revenueByMonth = real.revenueByMonth;
          campusData = real.campusData;
          statusPie = real.statusPie;
          recentActivity = real.recentActivity;
        } else {
          metrics = buildMockMetrics(schools);
          revenueByMonth = buildRevenueByMonth();
          campusData = buildCampusData(schools);
          statusPie = buildStatusPie();
          recentActivity = MOCK_ACTIVITY_LOG.slice(0, 8);
        }

        setState({
          metrics,
          revenueByMonth,
          campusData,
          statusPie,
          recentActivity,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } catch (err) {
        logger.error('hooks.dashboard', 'Error fetching dashboard metrics', err, {
          schoolId,
          schoolsCount: schools.length,
        });

        // Keep UI operational with deterministic fallback on any runtime/query mismatch
        setState({
          metrics: buildMockMetrics(schools),
          revenueByMonth: buildRevenueByMonth(),
          campusData: buildCampusData(schools),
          statusPie: buildStatusPie(),
          recentActivity: MOCK_ACTIVITY_LOG.slice(0, 8),
          loading: false,
          error: 'Error al cargar métricas del dashboard. Mostrando datos fallback.',
          lastUpdated: new Date(),
        });
      }
    },
    [schoolId],
  );

  const refresh = useCallback(
    (schools: School[]) => {
      void fetchMetrics(schools);
    },
    [fetchMetrics],
  );

  // Auto-refresh every 60 seconds when Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const interval = setInterval(() => {
      // Re-fetch will need schools passed in — for now, just re-trigger
      setState(prev => ({ ...prev }));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    refresh,
    fetchMetrics,
  };
}

export default useDashboard;
