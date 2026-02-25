/**
 * SchoolFeeService — Servicio de Colegiaturas y Cobros Escolares
 * Incluye: CRUD fees, payments, becas, planes de pago, recargos automáticos,
 * detección PENDING→OVERDUE, aging buckets, recordatorios
 * Mock implementation con localStorage
 */

import {
  SchoolFee, ParentPayment, ParentPaymentStatus, SchoolFeeType,
  Scholarship, ScholarshipType, DiscountType,
  PaymentPlan, PaymentPlanStatus,
  FeeReminder, FeeReminderSchedule
} from '../types';
import {
  MOCK_SCHOOL_FEES, MOCK_PARENT_PAYMENTS,
  MOCK_SCHOLARSHIPS, MOCK_PAYMENT_PLANS, MOCK_FEE_REMINDERS
} from '../constants';

// ---- Storage Keys ----
const FEES_KEY = 'mecard_school_fees';
const PAYMENTS_KEY = 'mecard_parent_payments';
const SCHOLARSHIPS_KEY = 'mecard_scholarships';
const PLANS_KEY = 'mecard_payment_plans';
const REMINDERS_KEY = 'mecard_fee_reminders';

// ---- Loader/Saver helpers ----
function load<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [...fallback];
  } catch { return [...fallback]; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const loadFees = () => load<SchoolFee>(FEES_KEY, MOCK_SCHOOL_FEES);
const saveFees = (d: SchoolFee[]) => save(FEES_KEY, d);
const loadPayments = () => load<ParentPayment>(PAYMENTS_KEY, MOCK_PARENT_PAYMENTS);
const savePayments = (d: ParentPayment[]) => save(PAYMENTS_KEY, d);
const loadScholarships = () => load<Scholarship>(SCHOLARSHIPS_KEY, MOCK_SCHOLARSHIPS);
const saveScholarships = (d: Scholarship[]) => save(SCHOLARSHIPS_KEY, d);
const loadPlans = () => load<PaymentPlan>(PLANS_KEY, MOCK_PAYMENT_PLANS);
const savePlans = (d: PaymentPlan[]) => save(PLANS_KEY, d);
const loadReminders = () => load<FeeReminder>(REMINDERS_KEY, MOCK_FEE_REMINDERS);
const saveReminders = (d: FeeReminder[]) => save(REMINDERS_KEY, d);

// ---- Aging bucket helper ----
export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  payments: ParentPayment[];
}

export interface FeeStats {
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalLateFees: number;
  totalScholarshipDiscounts: number;
  collectionRate: number;
  overdueCount: number;
  pendingCount: number;
  paidCount: number;
  activePlans: number;
  activeScholarships: number;
}

export const SchoolFeeService = {
  // =============================================
  // FEES (School-side) CRUD
  // =============================================

  getFees(schoolId: string): SchoolFee[] {
    return loadFees().filter(f => f.schoolId === schoolId);
  },

  createFee(fee: SchoolFee): SchoolFee {
    const fees = loadFees();
    fees.push(fee);
    saveFees(fees);
    return fee;
  },

  updateFee(id: string, updates: Partial<SchoolFee>): SchoolFee | null {
    const fees = loadFees();
    const idx = fees.findIndex(f => f.id === id);
    if (idx === -1) return null;
    fees[idx] = { ...fees[idx], ...updates };
    saveFees(fees);
    return fees[idx];
  },

  deleteFee(id: string): boolean {
    const fees = loadFees();
    const filtered = fees.filter(f => f.id !== id);
    if (filtered.length === fees.length) return false;
    saveFees(filtered);
    return true;
  },

  // =============================================
  // PAYMENTS
  // =============================================

  getPaymentsBySchool(schoolId: string, filters?: {
    feeId?: string; status?: ParentPaymentStatus; studentName?: string; grade?: string;
  }): ParentPayment[] {
    const fees = loadFees().filter(f => f.schoolId === schoolId);
    const feeIds = new Set(fees.map(f => f.id));
    let payments = loadPayments().filter(p => feeIds.has(p.feeId));

    if (filters?.feeId) payments = payments.filter(p => p.feeId === filters.feeId);
    if (filters?.status) payments = payments.filter(p => p.status === filters.status);
    if (filters?.studentName) {
      const q = filters.studentName.toLowerCase();
      payments = payments.filter(p => p.studentName.toLowerCase().includes(q));
    }
    return payments;
  },

  getPaymentsByParent(parentId: string): ParentPayment[] {
    return loadPayments().filter(p => p.parentId === parentId);
  },

  getPaymentsByStudent(studentId: string): ParentPayment[] {
    return loadPayments().filter(p => p.studentId === studentId);
  },

  processPayment(paymentId: string, method: string, reference: string, partialAmount?: number): ParentPayment | null {
    const payments = loadPayments();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;

    const payment = payments[idx];
    const remaining = payment.amount - (payment.paidAmount || 0);
    const payAmount = partialAmount && partialAmount < remaining ? partialAmount : remaining;
    const newPaidAmount = (payment.paidAmount || 0) + payAmount;
    const isFullyPaid = newPaidAmount >= payment.amount;

    payments[idx] = {
      ...payment,
      status: isFullyPaid ? ParentPaymentStatus.PAID : ParentPaymentStatus.PARTIAL,
      paidAt: new Date().toISOString(),
      paidAmount: newPaidAmount,
      paymentMethod: method,
      referenceNumber: reference,
    };
    savePayments(payments);
    return payments[idx];
  },

  generateMonthlyPayments(
    schoolId: string, feeId: string,
    students: Array<{ id: string; name: string; parentId: string }>,
    month?: string
  ): ParentPayment[] {
    const fees = loadFees();
    const fee = fees.find(f => f.id === feeId && f.schoolId === schoolId);
    if (!fee) return [];

    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = `${targetMonth}-${String(fee.dueDay).padStart(2, '0')}`;

    const scholarships = loadScholarships().filter(s => s.schoolId === schoolId && s.isActive);
    const payments = loadPayments();
    const newPayments: ParentPayment[] = [];

    students.forEach((s, i) => {
      // Check if payment already exists for this student/fee/month
      const existing = payments.find(p => p.feeId === feeId && p.studentId === s.id && p.dueDate === dueDate);
      if (existing) return;

      // Apply scholarship if applicable
      const scholarship = scholarships.find(sch =>
        sch.studentId === s.id &&
        (sch.appliesToFeeTypes.length === 0 || sch.appliesToFeeTypes.includes(fee.type)) &&
        dueDate >= sch.validFrom && dueDate <= sch.validUntil
      );

      let amount = fee.amount;
      let scholarshipDiscount = 0;
      if (scholarship) {
        if (scholarship.discountType === DiscountType.PERCENTAGE) {
          scholarshipDiscount = Math.round((fee.amount * scholarship.discountValue) / 100);
        } else {
          scholarshipDiscount = Math.min(scholarship.discountValue, fee.amount);
        }
        amount = fee.amount - scholarshipDiscount;
      }

      newPayments.push({
        id: `pay_gen_${Date.now()}_${i}`,
        feeId: fee.id,
        feeName: `${fee.name} — ${targetMonth}`,
        parentId: s.parentId,
        studentId: s.id,
        studentName: s.name,
        amount,
        originalAmount: fee.amount,
        status: ParentPaymentStatus.PENDING,
        dueDate,
        scholarshipId: scholarship?.id,
        scholarshipDiscount: scholarshipDiscount > 0 ? scholarshipDiscount : undefined,
      });
    });

    if (newPayments.length > 0) {
      payments.push(...newPayments);
      savePayments(payments);
    }
    return newPayments;
  },

  // =============================================
  // LATE FEES & AUTO-OVERDUE
  // =============================================

  applyLateFees(schoolId: string): { markedOverdue: number; feesApplied: number; totalLateFees: number } {
    const fees = loadFees().filter(f => f.schoolId === schoolId);
    const feeMap = new Map(fees.map(f => [f.id, f]));
    const payments = loadPayments();
    const today = new Date().toISOString().slice(0, 10);

    let markedOverdue = 0;
    let feesApplied = 0;
    let totalLateFees = 0;

    payments.forEach((p, idx) => {
      if (p.status !== ParentPaymentStatus.PENDING && p.status !== ParentPaymentStatus.PARTIAL) return;
      const fee = feeMap.get(p.feeId);
      if (!fee) return;

      const graceDays = fee.graceDays || 0;
      const dueDate = new Date(p.dueDate);
      const graceEnd = new Date(dueDate);
      graceEnd.setDate(graceEnd.getDate() + graceDays);

      if (today > graceEnd.toISOString().slice(0, 10)) {
        if (p.status === ParentPaymentStatus.PENDING) {
          payments[idx] = { ...p, status: ParentPaymentStatus.OVERDUE };
          markedOverdue++;
        }

        if (!p.lateFeeApplied && fee.lateFeePercent && fee.lateFeePercent > 0) {
          const baseAmount = p.originalAmount || p.amount;
          const lateFeeAmount = Math.round((baseAmount * fee.lateFeePercent) / 100);
          payments[idx] = {
            ...payments[idx],
            lateFeeApplied: true,
            lateFeeAmount,
            amount: (p.originalAmount || p.amount) - (p.scholarshipDiscount || 0) + lateFeeAmount,
          };
          feesApplied++;
          totalLateFees += lateFeeAmount;
        }
      }
    });

    savePayments(payments);
    return { markedOverdue, feesApplied, totalLateFees };
  },

  getOverduePayments(schoolId: string): ParentPayment[] {
    return this.getPaymentsBySchool(schoolId, { status: ParentPaymentStatus.OVERDUE });
  },

  // =============================================
  // AGING BUCKETS (Cartera Vencida)
  // =============================================

  getAgingBuckets(schoolId: string): AgingBucket[] {
    const overdue = this.getPaymentsBySchool(schoolId).filter(
      p => p.status === ParentPaymentStatus.OVERDUE || (p.status === ParentPaymentStatus.PARTIAL && new Date(p.dueDate) < new Date())
    );
    const today = new Date();

    const buckets: AgingBucket[] = [
      { label: '1-15 días', range: '1-15', count: 0, totalAmount: 0, payments: [] },
      { label: '16-30 días', range: '16-30', count: 0, totalAmount: 0, payments: [] },
      { label: '31-60 días', range: '31-60', count: 0, totalAmount: 0, payments: [] },
      { label: '61-90 días', range: '61-90', count: 0, totalAmount: 0, payments: [] },
      { label: '90+ días', range: '90+', count: 0, totalAmount: 0, payments: [] },
    ];

    overdue.forEach(p => {
      const due = new Date(p.dueDate);
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = p.amount - (p.paidAmount || 0);

      let bucketIdx = 0;
      if (daysOverdue <= 15) bucketIdx = 0;
      else if (daysOverdue <= 30) bucketIdx = 1;
      else if (daysOverdue <= 60) bucketIdx = 2;
      else if (daysOverdue <= 90) bucketIdx = 3;
      else bucketIdx = 4;

      buckets[bucketIdx].count++;
      buckets[bucketIdx].totalAmount += remaining;
      buckets[bucketIdx].payments.push(p);
    });

    return buckets;
  },

  // =============================================
  // SCHOLARSHIPS / BECAS
  // =============================================

  getScholarships(schoolId: string): Scholarship[] {
    return loadScholarships().filter(s => s.schoolId === schoolId);
  },

  createScholarship(scholarship: Scholarship): Scholarship {
    const items = loadScholarships();
    items.push(scholarship);
    saveScholarships(items);
    return scholarship;
  },

  updateScholarship(id: string, updates: Partial<Scholarship>): Scholarship | null {
    const items = loadScholarships();
    const idx = items.findIndex(s => s.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    saveScholarships(items);
    return items[idx];
  },

  deleteScholarship(id: string): boolean {
    const items = loadScholarships();
    const filtered = items.filter(s => s.id !== id);
    if (filtered.length === items.length) return false;
    saveScholarships(filtered);
    return true;
  },

  getScholarshipImpact(schoolId: string): { totalDiscount: number; studentsWithScholarship: number; byType: Record<string, number> } {
    const scholarships = loadScholarships().filter(s => s.schoolId === schoolId && s.isActive);
    const payments = this.getPaymentsBySchool(schoolId);
    const totalDiscount = payments.reduce((s, p) => s + (p.scholarshipDiscount || 0), 0);
    const studentsWithScholarship = new Set(scholarships.map(s => s.studentId)).size;
    const byType: Record<string, number> = {};
    scholarships.forEach(s => {
      byType[s.type] = (byType[s.type] || 0) + 1;
    });
    return { totalDiscount, studentsWithScholarship, byType };
  },

  // =============================================
  // PAYMENT PLANS / PLANES DE PAGO
  // =============================================

  getPaymentPlans(schoolId: string): PaymentPlan[] {
    return loadPlans().filter(p => p.schoolId === schoolId);
  },

  createPaymentPlan(plan: PaymentPlan): PaymentPlan {
    const plans = loadPlans();
    plans.push(plan);
    savePlans(plans);
    return plan;
  },

  updatePaymentPlan(id: string, updates: Partial<PaymentPlan>): PaymentPlan | null {
    const plans = loadPlans();
    const idx = plans.findIndex(p => p.id === id);
    if (idx === -1) return null;
    plans[idx] = { ...plans[idx], ...updates };
    savePlans(plans);
    return plans[idx];
  },

  recordPlanInstallment(planId: string): PaymentPlan | null {
    const plans = loadPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return null;

    const plan = plans[idx];
    const newPaid = plan.paidInstallments + 1;
    const isComplete = newPaid >= plan.installments;

    plans[idx] = {
      ...plan,
      paidInstallments: newPaid,
      status: isComplete ? PaymentPlanStatus.COMPLETED : PaymentPlanStatus.ACTIVE,
      nextDueDate: isComplete ? plan.nextDueDate : (() => {
        const next = new Date(plan.nextDueDate);
        next.setMonth(next.getMonth() + 1);
        return next.toISOString().slice(0, 10);
      })(),
    };
    savePlans(plans);
    return plans[idx];
  },

  // =============================================
  // FEE REMINDERS / RECORDATORIOS
  // =============================================

  getReminders(schoolId: string): FeeReminder[] {
    return loadReminders().filter(r => r.schoolId === schoolId);
  },

  createReminder(reminder: FeeReminder): FeeReminder {
    const items = loadReminders();
    items.push(reminder);
    saveReminders(items);
    return reminder;
  },

  updateReminder(id: string, updates: Partial<FeeReminder>): FeeReminder | null {
    const items = loadReminders();
    const idx = items.findIndex(r => r.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    saveReminders(items);
    return items[idx];
  },

  deleteReminder(id: string): boolean {
    const items = loadReminders();
    const filtered = items.filter(r => r.id !== id);
    if (filtered.length === items.length) return false;
    saveReminders(filtered);
    return true;
  },

  simulateSendReminders(schoolId: string): { sent: number; remindersTriggered: string[] } {
    const reminders = loadReminders().filter(r => r.schoolId === schoolId && r.isActive);
    const payments = this.getPaymentsBySchool(schoolId);
    const today = new Date();
    let sent = 0;
    const triggered: string[] = [];

    reminders.forEach(r => {
      const pendingPayments = payments.filter(p =>
        p.status === ParentPaymentStatus.PENDING || p.status === ParentPaymentStatus.OVERDUE
      );

      let matchCount = 0;
      pendingPayments.forEach(p => {
        const due = new Date(p.dueDate);
        const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let shouldSend = false;
        switch (r.schedule) {
          case FeeReminderSchedule.DAYS_BEFORE_7: shouldSend = diffDays === 7; break;
          case FeeReminderSchedule.DAYS_BEFORE_3: shouldSend = diffDays === 3; break;
          case FeeReminderSchedule.DAYS_BEFORE_1: shouldSend = diffDays === 1; break;
          case FeeReminderSchedule.ON_DUE_DATE: shouldSend = diffDays === 0; break;
          case FeeReminderSchedule.DAYS_AFTER_1: shouldSend = diffDays === -1; break;
          case FeeReminderSchedule.DAYS_AFTER_3: shouldSend = diffDays === -3; break;
          case FeeReminderSchedule.DAYS_AFTER_7: shouldSend = diffDays === -7; break;
          case FeeReminderSchedule.WEEKLY_OVERDUE: shouldSend = diffDays < 0 && diffDays % 7 === 0; break;
        }
        if (shouldSend) matchCount++;
      });

      if (matchCount > 0) {
        sent += matchCount;
        triggered.push(r.name);
      }
    });

    return { sent, remindersTriggered: triggered };
  },

  // =============================================
  // COMPREHENSIVE STATS
  // =============================================

  getStats(schoolId: string): FeeStats {
    const payments = this.getPaymentsBySchool(schoolId);
    const totalExpected = payments.reduce((s, p) => s + (p.originalAmount || p.amount), 0);
    const paidPayments = payments.filter(p => p.status === ParentPaymentStatus.PAID);
    const totalPaid = paidPayments.reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const totalPending = payments.filter(p => p.status === ParentPaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0);
    const overduePayments = payments.filter(p => p.status === ParentPaymentStatus.OVERDUE);
    const totalOverdue = overduePayments.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);
    const totalLateFees = payments.reduce((s, p) => s + (p.lateFeeAmount || 0), 0);
    const totalScholarshipDiscounts = payments.reduce((s, p) => s + (p.scholarshipDiscount || 0), 0);

    const scholarships = loadScholarships().filter(s => s.schoolId === schoolId && s.isActive);
    const plans = loadPlans().filter(p => p.schoolId === schoolId && p.status === PaymentPlanStatus.ACTIVE);

    return {
      totalExpected,
      totalPaid,
      totalPending,
      totalOverdue,
      totalLateFees,
      totalScholarshipDiscounts,
      collectionRate: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0,
      overdueCount: overduePayments.length,
      pendingCount: payments.filter(p => p.status === ParentPaymentStatus.PENDING).length,
      paidCount: paidPayments.length,
      activePlans: plans.length,
      activeScholarships: scholarships.length,
    };
  },

  getFamilyStatement(parentId: string): {
    parentId: string;
    children: Array<{
      studentId: string;
      studentName: string;
      payments: ParentPayment[];
      totalDue: number;
      totalPaid: number;
      scholarship?: Scholarship;
    }>;
    grandTotalDue: number;
    grandTotalPaid: number;
  } {
    const payments = loadPayments().filter(p => p.parentId === parentId);
    const scholarships = loadScholarships();
    const children: Record<string, { studentName: string; payments: ParentPayment[]; scholarship?: Scholarship }> = {};

    payments.forEach(p => {
      if (!children[p.studentId]) {
        const sch = scholarships.find(s => s.studentId === p.studentId && s.isActive);
        children[p.studentId] = { studentName: p.studentName, payments: [], scholarship: sch };
      }
      children[p.studentId].payments.push(p);
    });

    const childrenArr = Object.entries(children).map(([studentId, data]) => ({
      studentId,
      studentName: data.studentName,
      payments: data.payments,
      totalDue: data.payments.filter(p => p.status !== ParentPaymentStatus.PAID && p.status !== ParentPaymentStatus.CANCELLED)
        .reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0),
      totalPaid: data.payments.filter(p => p.status === ParentPaymentStatus.PAID)
        .reduce((s, p) => s + (p.paidAmount || p.amount), 0),
      scholarship: data.scholarship,
    }));

    return {
      parentId,
      children: childrenArr,
      grandTotalDue: childrenArr.reduce((s, c) => s + c.totalDue, 0),
      grandTotalPaid: childrenArr.reduce((s, c) => s + c.totalPaid, 0),
    };
  },
};
