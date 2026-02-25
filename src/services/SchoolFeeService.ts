/**
 * SchoolFeeService — Servicio de Colegiaturas y Cobros Escolares
 * Mock implementation con localStorage
 */

import { SchoolFee, ParentPayment, ParentPaymentStatus } from '../types';
import { MOCK_SCHOOL_FEES, MOCK_PARENT_PAYMENTS } from '../constants';

const FEES_KEY = 'mecard_school_fees';
const PAYMENTS_KEY = 'mecard_parent_payments';

function loadFees(): SchoolFee[] {
  try {
    const stored = localStorage.getItem(FEES_KEY);
    return stored ? JSON.parse(stored) : [...MOCK_SCHOOL_FEES];
  } catch { return [...MOCK_SCHOOL_FEES]; }
}

function saveFees(fees: SchoolFee[]) {
  localStorage.setItem(FEES_KEY, JSON.stringify(fees));
}

function loadPayments(): ParentPayment[] {
  try {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    return stored ? JSON.parse(stored) : [...MOCK_PARENT_PAYMENTS];
  } catch { return [...MOCK_PARENT_PAYMENTS]; }
}

function savePayments(payments: ParentPayment[]) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export const SchoolFeeService = {
  // ---- FEES (School-side) ----

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

  // ---- PAYMENTS ----

  getPaymentsBySchool(schoolId: string, filters?: { feeId?: string; status?: ParentPaymentStatus; grade?: string }): ParentPayment[] {
    const fees = loadFees().filter(f => f.schoolId === schoolId);
    const feeIds = new Set(fees.map(f => f.id));
    let payments = loadPayments().filter(p => feeIds.has(p.feeId));
    
    if (filters?.feeId) payments = payments.filter(p => p.feeId === filters.feeId);
    if (filters?.status) payments = payments.filter(p => p.status === filters.status);
    return payments;
  },

  getPaymentsByParent(parentId: string): ParentPayment[] {
    return loadPayments().filter(p => p.parentId === parentId);
  },

  getPaymentsByStudent(studentId: string): ParentPayment[] {
    return loadPayments().filter(p => p.studentId === studentId);
  },

  processPayment(paymentId: string, method: string, reference: string): ParentPayment | null {
    const payments = loadPayments();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;
    payments[idx] = {
      ...payments[idx],
      status: ParentPaymentStatus.PAID,
      paidAt: new Date().toISOString(),
      paidAmount: payments[idx].amount,
      paymentMethod: method,
      referenceNumber: reference,
    };
    savePayments(payments);
    return payments[idx];
  },

  generateMonthlyPayments(schoolId: string, feeId: string, students: Array<{ id: string; name: string; parentId: string }>): ParentPayment[] {
    const fees = loadFees();
    const fee = fees.find(f => f.id === feeId && f.schoolId === schoolId);
    if (!fee) return [];

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), fee.dueDay);
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);

    const payments = loadPayments();
    const newPayments: ParentPayment[] = students.map((s, i) => ({
      id: `pay_gen_${Date.now()}_${i}`,
      feeId: fee.id,
      feeName: fee.name,
      parentId: s.parentId,
      studentId: s.id,
      studentName: s.name,
      amount: fee.amount,
      status: ParentPaymentStatus.PENDING,
      dueDate: dueDate.toISOString().slice(0, 10),
    }));

    payments.push(...newPayments);
    savePayments(payments);
    return newPayments;
  },

  getOverduePayments(schoolId: string): ParentPayment[] {
    return this.getPaymentsBySchool(schoolId, { status: ParentPaymentStatus.OVERDUE });
  },

  getStats(schoolId: string) {
    const payments = this.getPaymentsBySchool(schoolId);
    const totalExpected = payments.reduce((s, p) => s + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === ParentPaymentStatus.PAID).reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const totalPending = payments.filter(p => p.status === ParentPaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0);
    const totalOverdue = payments.filter(p => p.status === ParentPaymentStatus.OVERDUE).reduce((s, p) => s + p.amount, 0);
    return { totalExpected, totalPaid, totalPending, totalOverdue, collectionRate: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0 };
  },
};
