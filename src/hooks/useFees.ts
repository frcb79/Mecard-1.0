/**
 * useFees — Hook wrapping SchoolFeeService for fee management views.
 *
 * Provides typed state + CRUD actions for:
 * fees, payments, scholarships, payment plans, reminders, stats, aging.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  SchoolFeeService,
  type AgingBucket,
  type FeeStats,
} from '../services/SchoolFeeService';
import type {
  SchoolFee,
  ParentPayment,
  Scholarship,
  PaymentPlan,
  FeeReminder,
  ParentPaymentStatus,
} from '../types';

// ─── Types ────────────────────────────────────────────

interface FeesState {
  fees: SchoolFee[];
  payments: ParentPayment[];
  scholarships: Scholarship[];
  paymentPlans: PaymentPlan[];
  reminders: FeeReminder[];
  stats: FeeStats | null;
  agingBuckets: AgingBucket[];
  overduePayments: ParentPayment[];
  loading: boolean;
  error: string | null;
}

interface PaymentFilters {
  feeId?: string;
  status?: ParentPaymentStatus;
  studentName?: string;
  grade?: string;
}

// ─── Hook ─────────────────────────────────────────────

export function useFees(schoolId: string) {
  const [state, setState] = useState<FeesState>({
    fees: [],
    payments: [],
    scholarships: [],
    paymentPlans: [],
    reminders: [],
    stats: null,
    agingBuckets: [],
    overduePayments: [],
    loading: true,
    error: null,
  });

  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>({});

  // ── Load all data ──

  const loadAll = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const fees = SchoolFeeService.getFees(schoolId);
      const payments = SchoolFeeService.getPaymentsBySchool(schoolId, paymentFilters);
      const scholarships = SchoolFeeService.getScholarships(schoolId);
      const paymentPlans = SchoolFeeService.getPaymentPlans(schoolId);
      const reminders = SchoolFeeService.getReminders(schoolId);
      const stats = SchoolFeeService.getStats(schoolId);
      const agingBuckets = SchoolFeeService.getAgingBuckets(schoolId);
      const overduePayments = SchoolFeeService.getOverduePayments(schoolId);

      setState({
        fees,
        payments,
        scholarships,
        paymentPlans,
        reminders,
        stats,
        agingBuckets,
        overduePayments,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useFees] Error loading data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar datos de colegiaturas',
      }));
    }
  }, [schoolId, paymentFilters]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Fee CRUD ──

  const createFee = useCallback(
    (fee: SchoolFee) => {
      const created = SchoolFeeService.createFee(fee);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updateFee = useCallback(
    (id: string, updates: Partial<SchoolFee>) => {
      const updated = SchoolFeeService.updateFee(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteFee = useCallback(
    (id: string) => {
      const deleted = SchoolFeeService.deleteFee(id);
      loadAll();
      return deleted;
    },
    [loadAll],
  );

  // ── Payment actions ──

  const processPayment = useCallback(
    (paymentId: string, method: string, reference: string, partialAmount?: number) => {
      const result = SchoolFeeService.processPayment(paymentId, method, reference, partialAmount);
      loadAll();
      return result;
    },
    [loadAll],
  );

  const generateMonthlyPayments = useCallback(
    (
      feeId: string,
      students: Array<{ id: string; name: string; parentId: string }>,
      month?: string,
    ) => {
      const result = SchoolFeeService.generateMonthlyPayments(schoolId, feeId, students, month);
      loadAll();
      return result;
    },
    [schoolId, loadAll],
  );

  const applyLateFees = useCallback(() => {
    const result = SchoolFeeService.applyLateFees(schoolId);
    loadAll();
    return result;
  }, [schoolId, loadAll]);

  // ── Scholarship CRUD ──

  const createScholarship = useCallback(
    (scholarship: Scholarship) => {
      const created = SchoolFeeService.createScholarship(scholarship);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updateScholarship = useCallback(
    (id: string, updates: Partial<Scholarship>) => {
      const updated = SchoolFeeService.updateScholarship(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteScholarship = useCallback(
    (id: string) => {
      const result = SchoolFeeService.deleteScholarship(id);
      loadAll();
      return result;
    },
    [loadAll],
  );

  const getScholarshipImpact = useCallback(() => {
    return SchoolFeeService.getScholarshipImpact(schoolId);
  }, [schoolId]);

  // ── Payment Plan CRUD ──

  const createPaymentPlan = useCallback(
    (plan: PaymentPlan) => {
      const created = SchoolFeeService.createPaymentPlan(plan);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updatePaymentPlan = useCallback(
    (id: string, updates: Partial<PaymentPlan>) => {
      const updated = SchoolFeeService.updatePaymentPlan(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const recordPlanInstallment = useCallback(
    (planId: string) => {
      const result = SchoolFeeService.recordPlanInstallment(planId);
      loadAll();
      return result;
    },
    [loadAll],
  );

  // ── Reminder CRUD ──

  const createReminder = useCallback(
    (reminder: FeeReminder) => {
      const created = SchoolFeeService.createReminder(reminder);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updateReminder = useCallback(
    (id: string, updates: Partial<FeeReminder>) => {
      const updated = SchoolFeeService.updateReminder(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteReminder = useCallback(
    (id: string) => {
      const result = SchoolFeeService.deleteReminder(id);
      loadAll();
      return result;
    },
    [loadAll],
  );

  const simulateSendReminders = useCallback(() => {
    const result = SchoolFeeService.simulateSendReminders(schoolId);
    loadAll();
    return result;
  }, [schoolId, loadAll]);

  // ── Family statement ──

  const getFamilyStatement = useCallback((parentId: string) => {
    return SchoolFeeService.getFamilyStatement(parentId);
  }, []);

  // ── Parent / Student payments ──

  const getPaymentsByParent = useCallback((parentId: string) => {
    return SchoolFeeService.getPaymentsByParent(parentId);
  }, []);

  const getPaymentsByStudent = useCallback((studentId: string) => {
    return SchoolFeeService.getPaymentsByStudent(studentId);
  }, []);

  return {
    // State
    ...state,
    paymentFilters,

    // Refresh
    refresh: loadAll,
    setPaymentFilters,

    // Fee CRUD
    createFee,
    updateFee,
    deleteFee,

    // Payment actions
    processPayment,
    generateMonthlyPayments,
    applyLateFees,

    // Scholarships
    createScholarship,
    updateScholarship,
    deleteScholarship,
    getScholarshipImpact,

    // Payment plans
    createPaymentPlan,
    updatePaymentPlan,
    recordPlanInstallment,

    // Reminders
    createReminder,
    updateReminder,
    deleteReminder,
    simulateSendReminders,

    // Queries
    getFamilyStatement,
    getPaymentsByParent,
    getPaymentsByStudent,
  };
}

export default useFees;
