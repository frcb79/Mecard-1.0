/**
 * SchoolFeesManager — Gestión Completa de Colegiaturas
 * 6 Tabs: Conceptos | Estado de Pagos | Becas | Planes de Pago | Cartera Vencida | Recordatorios
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Receipt, Plus, Edit2, Trash2, X, DollarSign, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, Download, Users, CalendarDays, ToggleLeft, ToggleRight,
  FileText, RefreshCw, GraduationCap, CreditCard,
  Bell, Send, Search, ChevronDown, ChevronUp, Zap, BarChart3
} from 'lucide-react';
import {
  SchoolFee, SchoolFeeType, FeeRecurrence, ParentPayment, ParentPaymentStatus,
  Scholarship, ScholarshipType, DiscountType,
  PaymentPlan, PaymentPlanStatus,
  FeeReminder, FeeReminderSchedule,
} from '../types';
import { MOCK_STUDENTS_LIST } from '../constants';
import { SchoolFeeService } from '../services/SchoolFeeService';
import { useToast } from './ui/Toast';

const SCHOOL_ID = 'mx_01';

// -------- Label Maps --------
const FEE_TYPE_LABELS: Record<SchoolFeeType, string> = {
  [SchoolFeeType.TUITION]: 'Colegiatura', [SchoolFeeType.ENROLLMENT]: 'Inscripción',
  [SchoolFeeType.UNIFORM]: 'Uniforme', [SchoolFeeType.EVENT]: 'Evento',
  [SchoolFeeType.MATERIAL]: 'Material', [SchoolFeeType.TRANSPORT]: 'Transporte',
  [SchoolFeeType.INSURANCE]: 'Seguro', [SchoolFeeType.OTHER]: 'Otro',
};
const RECURRENCE_LABELS: Record<FeeRecurrence, string> = {
  [FeeRecurrence.ONE_TIME]: 'Único', [FeeRecurrence.MONTHLY]: 'Mensual',
  [FeeRecurrence.BIMONTHLY]: 'Bimestral', [FeeRecurrence.QUARTERLY]: 'Trimestral',
  [FeeRecurrence.SEMESTER]: 'Semestral', [FeeRecurrence.ANNUAL]: 'Anual',
};
const STATUS_CFG: Record<ParentPaymentStatus, { label: string; color: string; bg: string }> = {
  [ParentPaymentStatus.PAID]: { label: 'Pagado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [ParentPaymentStatus.PENDING]: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50' },
  [ParentPaymentStatus.OVERDUE]: { label: 'Vencido', color: 'text-rose-600', bg: 'bg-rose-50' },
  [ParentPaymentStatus.PARTIAL]: { label: 'Parcial', color: 'text-blue-600', bg: 'bg-blue-50' },
  [ParentPaymentStatus.CANCELLED]: { label: 'Cancelado', color: 'text-slate-400', bg: 'bg-slate-50' },
};
const SCHOLARSHIP_LABELS: Record<ScholarshipType, string> = {
  [ScholarshipType.ACADEMIC]: 'Académica', [ScholarshipType.SPORTS]: 'Deportiva',
  [ScholarshipType.NEED_BASED]: 'Socioeconómica', [ScholarshipType.SIBLING]: 'Hermanos',
  [ScholarshipType.STAFF]: 'Personal', [ScholarshipType.OTHER]: 'Otra',
};
const PLAN_STATUS_LABELS: Record<PaymentPlanStatus, { label: string; color: string; bg: string }> = {
  [PaymentPlanStatus.ACTIVE]: { label: 'Activo', color: 'text-blue-600', bg: 'bg-blue-50' },
  [PaymentPlanStatus.COMPLETED]: { label: 'Completado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [PaymentPlanStatus.DEFAULTED]: { label: 'Incumplido', color: 'text-rose-600', bg: 'bg-rose-50' },
  [PaymentPlanStatus.CANCELLED]: { label: 'Cancelado', color: 'text-slate-400', bg: 'bg-slate-50' },
};
const REMINDER_SCHEDULE_LABELS: Record<FeeReminderSchedule, string> = {
  [FeeReminderSchedule.DAYS_BEFORE_7]: '7 días antes',
  [FeeReminderSchedule.DAYS_BEFORE_3]: '3 días antes',
  [FeeReminderSchedule.DAYS_BEFORE_1]: '1 día antes',
  [FeeReminderSchedule.ON_DUE_DATE]: 'Día de vencimiento',
  [FeeReminderSchedule.DAYS_AFTER_1]: '1 día después',
  [FeeReminderSchedule.DAYS_AFTER_3]: '3 días después',
  [FeeReminderSchedule.DAYS_AFTER_7]: '7 días después',
  [FeeReminderSchedule.WEEKLY_OVERDUE]: 'Semanal (vencidos)',
};

type Tab = 'concepts' | 'payments' | 'scholarships' | 'plans' | 'aging' | 'reminders';

export default function SchoolFeesManager() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('concepts');

  // Load data from service
  const [fees, setFees] = useState<SchoolFee[]>(() => SchoolFeeService.getFees(SCHOOL_ID));
  const [payments, setPayments] = useState<ParentPayment[]>(() => SchoolFeeService.getPaymentsBySchool(SCHOOL_ID));
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => SchoolFeeService.getScholarships(SCHOOL_ID));
  const [plans, setPlans] = useState<PaymentPlan[]>(() => SchoolFeeService.getPaymentPlans(SCHOOL_ID));
  const [reminders, setReminders] = useState<FeeReminder[]>(() => SchoolFeeService.getReminders(SCHOOL_ID));

  // Modals
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFee, setEditingFee] = useState<SchoolFee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<FeeReminder | null>(null);

  // Filters
  const [paymentFilter, setPaymentFilter] = useState({ fee: 'all', status: 'all', search: '' });
  const [paymentSort, setPaymentSort] = useState<'student' | 'dueDate' | 'amount' | 'status'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Fee form state
  const emptyFeeForm = { name: '', description: '', type: SchoolFeeType.TUITION, amount: '', recurrence: FeeRecurrence.MONTHLY, dueDay: '5', lateFeePercent: '', graceDays: '3', earlyPayDiscount: '', earlyPayDaysBefore: '5', allowPaymentPlan: false, maxInstallments: '3', allGrades: true, grades: '', schoolYear: '2025-2026' };
  const [feeForm, setFeeForm] = useState(emptyFeeForm);

  // Scholarship form
  const emptySchForm = { studentId: '', name: '', type: ScholarshipType.ACADEMIC, discountType: DiscountType.PERCENTAGE, discountValue: '', appliesToFeeTypes: [] as SchoolFeeType[], validFrom: '2025-08-01', validUntil: '2026-07-31', approvedBy: '', notes: '' };
  const [schForm, setSchForm] = useState(emptySchForm);

  // Reminder form
  const emptyRemForm = { name: '', schedule: FeeReminderSchedule.DAYS_BEFORE_7, feeTypes: [] as SchoolFeeType[], channel: 'notification' as FeeReminder['channel'], messageTemplate: '' };
  const [remForm, setRemForm] = useState(emptyRemForm);

  // Generation state
  const [genFeeId, setGenFeeId] = useState('');
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));

  // Refresh helper
  const reload = useCallback(() => {
    setFees(SchoolFeeService.getFees(SCHOOL_ID));
    setPayments(SchoolFeeService.getPaymentsBySchool(SCHOOL_ID));
    setScholarships(SchoolFeeService.getScholarships(SCHOOL_ID));
    setPlans(SchoolFeeService.getPaymentPlans(SCHOOL_ID));
    setReminders(SchoolFeeService.getReminders(SCHOOL_ID));
  }, []);

  // Stats
  const stats = useMemo(() => SchoolFeeService.getStats(SCHOOL_ID), [payments, fees, scholarships, plans]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    let result = payments;
    if (paymentFilter.fee !== 'all') result = result.filter(p => p.feeId === paymentFilter.fee);
    if (paymentFilter.status !== 'all') result = result.filter(p => p.status === paymentFilter.status);
    if (paymentFilter.search) {
      const q = paymentFilter.search.toLowerCase();
      result = result.filter(p => p.studentName.toLowerCase().includes(q) || p.feeName.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (paymentSort) {
        case 'student': cmp = a.studentName.localeCompare(b.studentName); break;
        case 'dueDate': cmp = a.dueDate.localeCompare(b.dueDate); break;
        case 'amount': cmp = a.amount - b.amount; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [payments, paymentFilter, paymentSort, sortDir]);

  // Aging data
  const agingBuckets = useMemo(() => SchoolFeeService.getAgingBuckets(SCHOOL_ID), [payments]);
  const totalOverdueAmount = agingBuckets.reduce((s, b) => s + b.totalAmount, 0);
  const totalOverdueCount = agingBuckets.reduce((s, b) => s + b.count, 0);

  // Scholarship impact
  const scholarshipImpact = useMemo(() => SchoolFeeService.getScholarshipImpact(SCHOOL_ID), [scholarships, payments]);

  // ======== FEE CRUD ========
  const openAddFee = () => { setEditingFee(null); setFeeForm(emptyFeeForm); setShowFeeModal(true); };
  const openEditFee = (fee: SchoolFee) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name, description: fee.description || '', type: fee.type, amount: String(fee.amount),
      recurrence: fee.recurrence, dueDay: String(fee.dueDay), lateFeePercent: fee.lateFeePercent ? String(fee.lateFeePercent) : '',
      graceDays: fee.graceDays ? String(fee.graceDays) : '3',
      earlyPayDiscount: fee.earlyPayDiscount ? String(fee.earlyPayDiscount) : '',
      earlyPayDaysBefore: fee.earlyPayDaysBefore ? String(fee.earlyPayDaysBefore) : '5',
      allowPaymentPlan: fee.allowPaymentPlan || false,
      maxInstallments: fee.maxInstallments ? String(fee.maxInstallments) : '3',
      allGrades: fee.appliesTo.all, grades: fee.appliesTo.grades?.join(', ') || '',
      schoolYear: fee.schoolYear || '2025-2026',
    });
    setShowFeeModal(true);
  };
  const saveFee = () => {
    if (!feeForm.name.trim() || !feeForm.amount) { toast.warning('Requerido', 'Nombre y monto son obligatorios'); return; }
    const feeData: SchoolFee = {
      id: editingFee?.id || `fee_${Date.now()}`, schoolId: SCHOOL_ID,
      name: feeForm.name.trim(), description: feeForm.description.trim() || undefined,
      type: feeForm.type, amount: parseFloat(feeForm.amount), recurrence: feeForm.recurrence,
      dueDay: parseInt(feeForm.dueDay) || 5,
      appliesTo: feeForm.allGrades ? { all: true } : { all: false, grades: feeForm.grades.split(',').map(g => g.trim()).filter(Boolean) },
      lateFeePercent: feeForm.lateFeePercent ? parseFloat(feeForm.lateFeePercent) : undefined,
      graceDays: feeForm.graceDays ? parseInt(feeForm.graceDays) : undefined,
      earlyPayDiscount: feeForm.earlyPayDiscount ? parseFloat(feeForm.earlyPayDiscount) : undefined,
      earlyPayDaysBefore: feeForm.earlyPayDaysBefore ? parseInt(feeForm.earlyPayDaysBefore) : undefined,
      allowPaymentPlan: feeForm.allowPaymentPlan || undefined,
      maxInstallments: feeForm.allowPaymentPlan && feeForm.maxInstallments ? parseInt(feeForm.maxInstallments) : undefined,
      schoolYear: feeForm.schoolYear || undefined,
      isActive: editingFee?.isActive ?? true, createdAt: editingFee?.createdAt || new Date().toISOString().slice(0, 10),
    };
    if (editingFee) { SchoolFeeService.updateFee(editingFee.id, feeData); toast.info('Actualizado', `${feeData.name} guardado`); }
    else { SchoolFeeService.createFee(feeData); toast.info('Creado', `${feeData.name} agregado`); }
    setShowFeeModal(false); reload();
  };
  const deleteFee = () => {
    if (deleteConfirm) { SchoolFeeService.deleteFee(deleteConfirm); toast.info('Eliminado', 'Concepto eliminado'); setDeleteConfirm(null); reload(); }
  };
  const toggleFee = (id: string) => {
    const fee = fees.find(f => f.id === id);
    if (fee) { SchoolFeeService.updateFee(id, { isActive: !fee.isActive }); reload(); }
  };

  // ======== GENERATE PAYMENTS ========
  const generatePayments = () => {
    const fee = fees.find(f => f.id === genFeeId);
    if (!fee) { toast.warning('Selecciona', 'Elige un concepto'); return; }
    const students = MOCK_STUDENTS_LIST.map(s => ({ id: s.id, name: s.fullName, parentId: s.parentId || 'parent_01' }));
    const created = SchoolFeeService.generateMonthlyPayments(SCHOOL_ID, genFeeId, students, genMonth);
    if (created.length === 0) { toast.warning('Sin cambios', 'Ya existen cobros para este periodo'); return; }
    toast.info('Generados', `${created.length} cobros creados`); reload();
  };

  // ======== LATE FEES ========
  const applyLateFees = () => {
    const result = SchoolFeeService.applyLateFees(SCHOOL_ID);
    toast.info('Recargos', `${result.markedOverdue} vencidos, ${result.feesApplied} recargos ($${result.totalLateFees.toLocaleString('es-MX')})`);
    reload();
  };

  // ======== SCHOLARSHIPS ========
  const openAddScholarship = () => { setEditingScholarship(null); setSchForm(emptySchForm); setShowScholarshipModal(true); };
  const openEditScholarship = (s: Scholarship) => {
    setEditingScholarship(s);
    setSchForm({ studentId: s.studentId, name: s.name, type: s.type, discountType: s.discountType, discountValue: String(s.discountValue), appliesToFeeTypes: s.appliesToFeeTypes, validFrom: s.validFrom, validUntil: s.validUntil, approvedBy: s.approvedBy, notes: s.notes || '' });
    setShowScholarshipModal(true);
  };
  const saveScholarship = () => {
    if (!schForm.studentId || !schForm.name || !schForm.discountValue) { toast.warning('Requerido', 'Alumno, nombre y descuento obligatorios'); return; }
    const student = MOCK_STUDENTS_LIST.find(s => s.id === schForm.studentId);
    const data: Scholarship = {
      id: editingScholarship?.id || `sch_${Date.now()}`, schoolId: SCHOOL_ID,
      studentId: schForm.studentId, studentName: student?.fullName || schForm.studentId,
      type: schForm.type, name: schForm.name.trim(), discountType: schForm.discountType,
      discountValue: parseFloat(schForm.discountValue), appliesToFeeTypes: schForm.appliesToFeeTypes,
      validFrom: schForm.validFrom, validUntil: schForm.validUntil,
      approvedBy: schForm.approvedBy || 'Administración', notes: schForm.notes || undefined,
      isActive: editingScholarship?.isActive ?? true, createdAt: editingScholarship?.createdAt || new Date().toISOString().slice(0, 10),
    };
    if (editingScholarship) { SchoolFeeService.updateScholarship(editingScholarship.id, data); toast.info('Actualizado', 'Beca actualizada'); }
    else { SchoolFeeService.createScholarship(data); toast.info('Creada', `Beca asignada a ${data.studentName}`); }
    setShowScholarshipModal(false); reload();
  };
  const deleteScholarship = (id: string) => { SchoolFeeService.deleteScholarship(id); toast.info('Eliminada', 'Beca eliminada'); reload(); };

  // ======== PAYMENT PLANS ========
  const recordInstallment = (planId: string) => {
    SchoolFeeService.recordPlanInstallment(planId);
    toast.info('Abono registrado', 'Parcialidad registrada');
    reload();
  };

  // ======== REMINDERS ========
  const openAddReminder = () => { setEditingReminder(null); setRemForm(emptyRemForm); setShowReminderModal(true); };
  const openEditReminder = (r: FeeReminder) => {
    setEditingReminder(r);
    setRemForm({ name: r.name, schedule: r.schedule, feeTypes: r.feeTypes, channel: r.channel, messageTemplate: r.messageTemplate });
    setShowReminderModal(true);
  };
  const saveReminder = () => {
    if (!remForm.name) { toast.warning('Requerido', 'Nombre obligatorio'); return; }
    const data: FeeReminder = {
      id: editingReminder?.id || `rem_${Date.now()}`, schoolId: SCHOOL_ID,
      name: remForm.name, schedule: remForm.schedule, feeTypes: remForm.feeTypes,
      channel: remForm.channel, messageTemplate: remForm.messageTemplate || '',
      isActive: editingReminder?.isActive ?? true, lastSent: editingReminder?.lastSent,
      sentCount: editingReminder?.sentCount || 0, createdAt: editingReminder?.createdAt || new Date().toISOString().slice(0, 10),
    };
    if (editingReminder) { SchoolFeeService.updateReminder(editingReminder.id, data); toast.info('Actualizado', 'Recordatorio guardado'); }
    else { SchoolFeeService.createReminder(data); toast.info('Creado', 'Recordatorio creado'); }
    setShowReminderModal(false); reload();
  };
  const deleteReminder = (id: string) => { SchoolFeeService.deleteReminder(id); toast.info('Eliminado', 'Recordatorio eliminado'); reload(); };
  const simulateReminders = () => {
    const result = SchoolFeeService.simulateSendReminders(SCHOOL_ID);
    toast.info('Recordatorios', `${result.sent} notificaciones enviadas (${result.remindersTriggered.join(', ') || 'Ninguna regla aplicó'})`);
    reload();
  };

  // ======== CSV EXPORT ========
  const exportCSV = () => {
    const rows = filteredPayments.map(p =>
      `${p.studentName},${p.feeName},${p.originalAmount || p.amount},${p.scholarshipDiscount || 0},${p.lateFeeAmount || 0},${p.amount},${p.status},${p.dueDate},${p.paidAt || ''},${p.paymentMethod || ''}`
    );
    const csv = `Alumno,Concepto,MontoOriginal,Beca,Recargo,MontoFinal,Estado,Vencimiento,Pagado,Método\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `colegiaturas_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url); toast.info('Exportado', 'CSV descargado');
  };

  const toggleSort = (col: typeof paymentSort) => {
    if (paymentSort === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setPaymentSort(col); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: typeof paymentSort }) => paymentSort === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  // ===================== TABS CONFIG =====================
  const tabs: Array<[Tab, string, React.ReactNode]> = [
    ['concepts', 'Conceptos', <FileText size={16} key="c" />],
    ['payments', 'Pagos', <DollarSign size={16} key="p" />],
    ['scholarships', 'Becas', <GraduationCap size={16} key="s" />],
    ['plans', 'Planes', <CreditCard size={16} key="pl" />],
    ['aging', 'Cartera', <BarChart3 size={16} key="a" />],
    ['reminders', 'Recordatorios', <Bell size={16} key="r" />],
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Receipt className="w-9 h-9 text-indigo-600" /> Colegiaturas y Cobros
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">Gestión completa: conceptos, becas, planes de pago, cartera vencida y recordatorios</p>
          </div>
          <div className="flex gap-2">
            <button onClick={applyLateFees} className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all" title="Detectar vencidos y aplicar recargos">
              <Zap size={16} /> Aplicar Recargos
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Esperado', value: `$${stats.totalExpected.toLocaleString('es-MX')}`, border: 'border-slate-100' },
            { label: 'Cobrado', value: `$${stats.totalPaid.toLocaleString('es-MX')}`, border: 'border-emerald-100', sub: `${stats.collectionRate}%` },
            { label: 'Pendiente', value: `$${stats.totalPending.toLocaleString('es-MX')}`, border: 'border-amber-100' },
            { label: 'Vencido', value: `$${stats.totalOverdue.toLocaleString('es-MX')}`, border: 'border-rose-100' },
            { label: 'Becas', value: `${stats.activeScholarships}`, border: 'border-purple-100', sub: `-$${stats.totalScholarshipDiscounts.toLocaleString('es-MX')}` },
            { label: 'Planes', value: `${stats.activePlans}`, border: 'border-blue-100', sub: 'activos' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white p-5 rounded-[28px] border ${kpi.border} shadow-sm`}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{kpi.label}</p>
              <p className="text-xl font-black text-slate-800 tracking-tighter">{kpi.value}</p>
              {kpi.sub && <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg mt-1 inline-block">{kpi.sub}</span>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white p-2 rounded-[24px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-x-auto">
          {tabs.map(([id, label, icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 rounded-[18px] flex items-center gap-1.5 font-black text-[10px] uppercase tracking-[1.5px] transition-all whitespace-nowrap ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ===================== TAB: CONCEPTOS ===================== */}
        {activeTab === 'concepts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <button onClick={openAddFee} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">
                <Plus size={18} /> Nuevo Concepto
              </button>
              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 ring-1 ring-inset ring-slate-100">
                <select value={genFeeId} onChange={e => setGenFeeId(e.target.value)} className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 outline-none">
                  <option value="">Concepto...</option>
                  {fees.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input type="month" value={genMonth} onChange={e => setGenMonth(e.target.value)} className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 outline-none" />
                <button onClick={generatePayments} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                  <RefreshCw size={14} /> Generar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fees.map(fee => (
                <div key={fee.id} className={`bg-white rounded-[32px] p-7 border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${fee.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${fee.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {FEE_TYPE_LABELS[fee.type]}
                      </span>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight mt-2">{fee.name}</h3>
                      {fee.description && <p className="text-xs text-slate-400 mt-1">{fee.description}</p>}
                    </div>
                    <button onClick={() => toggleFee(fee.id)} title={fee.isActive ? 'Desactivar' : 'Activar'}>
                      {fee.isActive ? <ToggleRight size={26} className="text-indigo-600" /> : <ToggleLeft size={26} className="text-slate-300" />}
                    </button>
                  </div>
                  <p className="text-3xl font-black text-slate-800 tracking-tighter mb-1">${fee.amount.toLocaleString('es-MX')}</p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {RECURRENCE_LABELS[fee.recurrence]} • Día {fee.dueDay}
                    {fee.lateFeePercent ? ` • ${fee.lateFeePercent}% recargo` : ''}
                    {fee.graceDays ? ` (${fee.graceDays}d gracia)` : ''}
                  </p>
                  {fee.earlyPayDiscount && (
                    <p className="text-[10px] font-bold text-emerald-500 mt-1">{fee.earlyPayDiscount}% desc. pronto pago ({fee.earlyPayDaysBefore}d antes)</p>
                  )}
                  {fee.allowPaymentPlan && (
                    <p className="text-[10px] font-bold text-blue-500 mt-1">Plan de pagos: hasta {fee.maxInstallments} parcialidades</p>
                  )}
                  {fee.schoolYear && (
                    <p className="text-[9px] font-bold text-slate-300 mt-1">Ciclo: {fee.schoolYear}</p>
                  )}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex-1">
                      {fee.appliesTo.all ? 'Todos los grados' : fee.appliesTo.grades?.join(', ')}
                    </span>
                    <button onClick={() => openEditFee(fee)} className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm(fee.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB: ESTADO DE PAGOS ===================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={paymentFilter.search} onChange={e => setPaymentFilter({ ...paymentFilter, search: e.target.value })}
                  placeholder="Buscar alumno o concepto..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <select value={paymentFilter.fee} onChange={e => setPaymentFilter({ ...paymentFilter, fee: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none">
                <option value="all">Todos los conceptos</option>
                {fees.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={paymentFilter.status} onChange={e => setPaymentFilter({ ...paymentFilter, status: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none">
                <option value="all">Todos</option>
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <Download size={16} /> CSV
              </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-4 cursor-pointer select-none" onClick={() => toggleSort('student')}>Alumno <SortIcon col="student" /></th>
                      <th className="p-4">Concepto</th>
                      <th className="p-4 text-right cursor-pointer select-none" onClick={() => toggleSort('amount')}>Monto <SortIcon col="amount" /></th>
                      <th className="p-4 text-center">Beca</th>
                      <th className="p-4 text-center">Recargo</th>
                      <th className="p-4 text-center cursor-pointer select-none" onClick={() => toggleSort('status')}>Estado <SortIcon col="status" /></th>
                      <th className="p-4 cursor-pointer select-none" onClick={() => toggleSort('dueDate')}>Vence <SortIcon col="dueDate" /></th>
                      <th className="p-4">Pagado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPayments.map(p => {
                      const sc = STATUS_CFG[p.status];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-700 text-sm">{p.studentName}</td>
                          <td className="p-4 text-sm text-slate-500">{p.feeName}</td>
                          <td className="p-4 text-right font-black text-slate-800">${p.amount.toLocaleString('es-MX')}</td>
                          <td className="p-4 text-center">
                            {p.scholarshipDiscount ? <span className="text-[10px] font-bold text-purple-600">-${p.scholarshipDiscount.toLocaleString('es-MX')}</span> : <span className="text-slate-200">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {p.lateFeeAmount ? <span className="text-[10px] font-bold text-rose-600">+${p.lateFeeAmount.toLocaleString('es-MX')}</span> : <span className="text-slate-200">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          </td>
                          <td className="p-4 text-xs text-slate-400 font-mono">{p.dueDate}</td>
                          <td className="p-4 text-xs text-slate-400">{p.paidAt ? `${p.paidAt} • ${p.paymentMethod}` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredPayments.length === 0 && (
                <div className="p-16 text-center opacity-30"><DollarSign size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin pagos registrados</p></div>
              )}
              <div className="p-4 border-t border-slate-50 text-xs text-slate-400 font-bold text-right">
                {filteredPayments.length} registros
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: BECAS ===================== */}
        {activeTab === 'scholarships' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[28px] border border-purple-100 shadow-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-[2px] mb-1">Becas Activas</p>
                <p className="text-2xl font-black text-purple-600 tracking-tighter">{scholarships.filter(s => s.isActive).length}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-purple-100 shadow-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-[2px] mb-1">Alumnos Beneficiados</p>
                <p className="text-2xl font-black text-purple-600 tracking-tighter">{scholarshipImpact.studentsWithScholarship}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-purple-100 shadow-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-[2px] mb-1">Descuento Total</p>
                <p className="text-2xl font-black text-purple-600 tracking-tighter">${scholarshipImpact.totalDiscount.toLocaleString('es-MX')}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={openAddScholarship} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-purple-700 transition-all">
                <Plus size={18} /> Nueva Beca
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.map(sch => (
                <div key={sch.id} className={`bg-white rounded-[32px] p-7 border shadow-sm ${sch.isActive ? 'border-purple-100' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-purple-50 text-purple-600">{SCHOLARSHIP_LABELS[sch.type]}</span>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight mt-2">{sch.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-purple-600">
                        {sch.discountType === DiscountType.PERCENTAGE ? `${sch.discountValue}%` : `$${sch.discountValue.toLocaleString('es-MX')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                      {sch.studentName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{sch.studentName}</p>
                      <p className="text-[10px] text-slate-400">{sch.validFrom} → {sch.validUntil}</p>
                    </div>
                  </div>
                  {sch.notes && <p className="text-xs text-slate-400 italic mb-2">{sch.notes}</p>}
                  <p className="text-[9px] text-slate-300 font-bold">
                    Aplica: {sch.appliesToFeeTypes.length === 0 ? 'Todos los conceptos' : sch.appliesToFeeTypes.map(t => FEE_TYPE_LABELS[t]).join(', ')}
                    {' • '}Aprobó: {sch.approvedBy}
                  </p>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    <button onClick={() => openEditScholarship(sch)} className="p-2 text-slate-300 hover:text-purple-600 rounded-xl hover:bg-purple-50"><Edit2 size={16} /></button>
                    <button onClick={() => deleteScholarship(sch.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {scholarships.length === 0 && (
                <div className="col-span-2 p-16 text-center opacity-30"><GraduationCap size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin becas</p></div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: PLANES DE PAGO ===================== */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[28px] border border-blue-100 shadow-sm">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[2px] mb-1">Planes Activos</p>
                <p className="text-2xl font-black text-blue-600 tracking-tighter">{plans.filter(p => p.status === PaymentPlanStatus.ACTIVE).length}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-emerald-100 shadow-sm">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[2px] mb-1">Completados</p>
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">{plans.filter(p => p.status === PaymentPlanStatus.COMPLETED).length}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Monto en Planes</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">${plans.reduce((s, p) => s + p.totalAmount, 0).toLocaleString('es-MX')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {plans.map(plan => {
                const progress = plan.installments > 0 ? Math.round((plan.paidInstallments / plan.installments) * 100) : 0;
                const sc = PLAN_STATUS_LABELS[plan.status];
                return (
                  <div key={plan.id} className="bg-white rounded-[32px] p-7 border border-slate-200 ring-1 ring-inset ring-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{plan.feeName}</h3>
                        <p className="text-sm text-slate-500 font-bold mt-1">{plan.studentName}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        <p className="text-lg font-black text-slate-800">${plan.totalAmount.toLocaleString('es-MX')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parcialidad</p>
                        <p className="text-lg font-black text-slate-800">${plan.installmentAmount.toLocaleString('es-MX')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progreso</p>
                        <p className="text-lg font-black text-slate-800">{plan.paidInstallments}/{plan.installments}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Próximo Pago</p>
                        <p className="text-lg font-black text-slate-800">{plan.nextDueDate}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400">{progress}% completado</span>
                        <span className="text-[10px] font-bold text-slate-400">${(plan.paidInstallments * plan.installmentAmount).toLocaleString('es-MX')} / ${plan.totalAmount.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className={`h-3 rounded-full transition-all ${plan.status === PaymentPlanStatus.COMPLETED ? 'bg-emerald-500' : plan.status === PaymentPlanStatus.DEFAULTED ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    {plan.notes && <p className="text-xs text-slate-400 italic mb-3">{plan.notes}</p>}
                    {plan.status === PaymentPlanStatus.ACTIVE && (
                      <button onClick={() => recordInstallment(plan.id)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">
                        <CheckCircle2 size={16} /> Registrar Abono
                      </button>
                    )}
                  </div>
                );
              })}
              {plans.length === 0 && (
                <div className="p-16 text-center opacity-30"><CreditCard size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin planes de pago</p></div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: CARTERA VENCIDA ===================== */}
        {activeTab === 'aging' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[28px] border border-rose-100 shadow-sm">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-[2px] mb-1">Total Cartera Vencida</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter">${totalOverdueAmount.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-rose-100 shadow-sm">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-[2px] mb-1">Pagos Vencidos</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter">{totalOverdueCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Antigüedad de Cartera Vencida</h3>
              <div className="space-y-4">
                {agingBuckets.map((bucket, colorIdx) => {
                  const pct = totalOverdueAmount > 0 ? (bucket.totalAmount / totalOverdueAmount) * 100 : 0;
                  const colors = ['bg-amber-400', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-rose-700'];
                  return (
                    <div key={bucket.range}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-black text-slate-600">{bucket.label}</span>
                        <span className="text-xs font-bold text-slate-400">{bucket.count} pagos • ${bucket.totalAmount.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-5">
                        <div className={`h-5 rounded-full ${colors[colorIdx]} transition-all flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 2)}%` }}>
                          {pct > 10 && <span className="text-[9px] font-black text-white">{pct.toFixed(0)}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {agingBuckets.some(b => b.count > 0) && (
              <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                  <h3 className="text-sm font-black text-slate-800">Detalle de Pagos Vencidos</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Concepto</th>
                      <th className="p-4 text-right">Saldo</th>
                      <th className="p-4">Vencimiento</th>
                      <th className="p-4 text-center">Días</th>
                      <th className="p-4 text-center">Recargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {agingBuckets.flatMap(b => b.payments).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(p => {
                      const days = Math.floor((Date.now() - new Date(p.dueDate).getTime()) / 86400000);
                      return (
                        <tr key={p.id} className="hover:bg-rose-50/30">
                          <td className="p-4 font-bold text-slate-700 text-sm">{p.studentName}</td>
                          <td className="p-4 text-sm text-slate-500">{p.feeName}</td>
                          <td className="p-4 text-right font-black text-rose-600">${(p.amount - (p.paidAmount || 0)).toLocaleString('es-MX')}</td>
                          <td className="p-4 text-xs font-mono text-slate-400">{p.dueDate}</td>
                          <td className="p-4 text-center"><span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">{days}d</span></td>
                          <td className="p-4 text-center">
                            {p.lateFeeAmount ? <span className="text-[10px] font-bold text-rose-600">+${p.lateFeeAmount.toLocaleString('es-MX')}</span> : <span className="text-slate-200">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalOverdueCount === 0 && (
              <div className="p-16 text-center opacity-30 bg-white rounded-[32px]"><CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-300" /><p className="font-black uppercase tracking-widest text-xs">Sin cartera vencida</p></div>
            )}
          </div>
        )}

        {/* ===================== TAB: RECORDATORIOS ===================== */}
        {activeTab === 'reminders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <button onClick={openAddReminder} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">
                <Plus size={18} /> Nuevo Recordatorio
              </button>
              <button onClick={simulateReminders} className="flex items-center gap-2 px-5 py-3 bg-amber-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all">
                <Send size={16} /> Enviar Ahora
              </button>
            </div>

            <div className="space-y-4">
              {reminders.map(rem => (
                <div key={rem.id} className={`bg-white rounded-[32px] p-7 border shadow-sm ${rem.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rem.isActive ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Bell size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{rem.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600">{REMINDER_SCHEDULE_LABELS[rem.schedule]}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500">{rem.channel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="text-right mr-3">
                        <p className="text-[10px] font-bold text-slate-400">Enviados: {rem.sentCount}</p>
                        {rem.lastSent && <p className="text-[9px] text-slate-300">Último: {rem.lastSent}</p>}
                      </div>
                      <button onClick={() => openEditReminder(rem)} className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl hover:bg-indigo-50"><Edit2 size={16} /></button>
                      <button onClick={() => deleteReminder(rem.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  {rem.messageTemplate && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-500 italic">{rem.messageTemplate}</p>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-300 mt-2 font-bold">
                    Aplica a: {rem.feeTypes.length === 0 ? 'Todos los conceptos' : rem.feeTypes.map(t => FEE_TYPE_LABELS[t]).join(', ')}
                  </p>
                </div>
              ))}
              {reminders.length === 0 && (
                <div className="p-16 text-center opacity-30"><Bell size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin recordatorios</p></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl relative my-8">
            <button onClick={() => setShowFeeModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-800"><X size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-6">{editingFee ? 'Editar Concepto' : 'Nuevo Concepto'}</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre *</label>
                <input value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="Colegiatura Mensual"
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción</label>
                <input value={feeForm.description} onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo</label>
                  <select value={feeForm.type} onChange={e => setFeeForm({ ...feeForm, type: e.target.value as SchoolFeeType })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    {Object.entries(FEE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto *</label>
                  <input type="number" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="8500"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Recurrencia</label>
                  <select value={feeForm.recurrence} onChange={e => setFeeForm({ ...feeForm, recurrence: e.target.value as FeeRecurrence })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    {Object.entries(RECURRENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Día Cobro</label>
                  <input type="number" min="1" max="28" value={feeForm.dueDay} onChange={e => setFeeForm({ ...feeForm, dueDay: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ciclo</label>
                  <input value={feeForm.schoolYear} onChange={e => setFeeForm({ ...feeForm, schoolYear: e.target.value })} placeholder="2025-2026"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Recargo %</label>
                  <input type="number" value={feeForm.lateFeePercent} onChange={e => setFeeForm({ ...feeForm, lateFeePercent: e.target.value })} placeholder="5"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Días Gracia</label>
                  <input type="number" value={feeForm.graceDays} onChange={e => setFeeForm({ ...feeForm, graceDays: e.target.value })} placeholder="3"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Desc. Pronto %</label>
                  <input type="number" value={feeForm.earlyPayDiscount} onChange={e => setFeeForm({ ...feeForm, earlyPayDiscount: e.target.value })} placeholder="3"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={feeForm.allowPaymentPlan} onChange={e => setFeeForm({ ...feeForm, allowPaymentPlan: e.target.checked })} className="accent-indigo-600 w-4 h-4" />
                  <span className="text-xs font-bold text-slate-600">Permitir plan de pagos</span>
                </label>
                {feeForm.allowPaymentPlan && (
                  <input type="number" value={feeForm.maxInstallments} onChange={e => setFeeForm({ ...feeForm, maxInstallments: e.target.value })} placeholder="3" min="2" max="12"
                    className="w-20 p-2 bg-slate-50 rounded-xl outline-none font-bold text-slate-700 text-sm" />
                )}
                {feeForm.allowPaymentPlan && <span className="text-[10px] text-slate-400 font-bold">parcialidades máx.</span>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aplica a</label>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setFeeForm({ ...feeForm, allGrades: true })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${feeForm.allGrades ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>Todos</button>
                  <button onClick={() => setFeeForm({ ...feeForm, allGrades: false })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!feeForm.allGrades ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>Grados</button>
                </div>
                {!feeForm.allGrades && (
                  <input value={feeForm.grades} onChange={e => setFeeForm({ ...feeForm, grades: e.target.value })} placeholder="1° Primaria, 2° Primaria"
                    className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                )}
              </div>
              <button onClick={saveFee} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all">
                {editingFee ? 'Guardar Cambios' : 'Crear Concepto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Modal */}
      {showScholarshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl relative my-8">
            <button onClick={() => setShowScholarshipModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-800"><X size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-6">{editingScholarship ? 'Editar Beca' : 'Nueva Beca'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Alumno *</label>
                <select value={schForm.studentId} onChange={e => setSchForm({ ...schForm, studentId: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                  <option value="">Seleccionar alumno...</option>
                  {MOCK_STUDENTS_LIST.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre Beca *</label>
                  <input value={schForm.name} onChange={e => setSchForm({ ...schForm, name: e.target.value })} placeholder="Beca Excelencia"
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo</label>
                  <select value={schForm.type} onChange={e => setSchForm({ ...schForm, type: e.target.value as ScholarshipType })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    {Object.entries(SCHOLARSHIP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo Descuento</label>
                  <select value={schForm.discountType} onChange={e => setSchForm({ ...schForm, discountType: e.target.value as DiscountType })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    <option value={DiscountType.PERCENTAGE}>Porcentaje (%)</option>
                    <option value={DiscountType.FIXED_AMOUNT}>Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Valor *</label>
                  <input type="number" value={schForm.discountValue} onChange={e => setSchForm({ ...schForm, discountValue: e.target.value })}
                    placeholder={schForm.discountType === DiscountType.PERCENTAGE ? '20' : '2000'}
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vigencia Desde</label>
                  <input type="date" value={schForm.validFrom} onChange={e => setSchForm({ ...schForm, validFrom: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vigencia Hasta</label>
                  <input type="date" value={schForm.validUntil} onChange={e => setSchForm({ ...schForm, validUntil: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aprobado por</label>
                <input value={schForm.approvedBy} onChange={e => setSchForm({ ...schForm, approvedBy: e.target.value })} placeholder="Dirección"
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notas</label>
                <input value={schForm.notes} onChange={e => setSchForm({ ...schForm, notes: e.target.value })} placeholder="Promedio 9.5+"
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
              </div>
              <button onClick={saveScholarship} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-purple-700 transition-all">
                {editingScholarship ? 'Guardar Cambios' : 'Crear Beca'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowReminderModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-800"><X size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-6">{editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre *</label>
                <input value={remForm.name} onChange={e => setRemForm({ ...remForm, name: e.target.value })} placeholder="Recordatorio 7 días antes"
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Momento</label>
                  <select value={remForm.schedule} onChange={e => setRemForm({ ...remForm, schedule: e.target.value as FeeReminderSchedule })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    {Object.entries(REMINDER_SCHEDULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Canal</label>
                  <select value={remForm.channel} onChange={e => setRemForm({ ...remForm, channel: e.target.value as 'notification' | 'email' | 'both' })} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    <option value="notification">Notificación</option>
                    <option value="email">Email</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Plantilla de Mensaje</label>
                <textarea value={remForm.messageTemplate} onChange={e => setRemForm({ ...remForm, messageTemplate: e.target.value })}
                  placeholder="Recordatorio: Su pago de {concepto} por ${monto} vence el {fecha}."
                  rows={3} className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 resize-none" />
              </div>
              <button onClick={saveReminder} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all">
                {editingReminder ? 'Guardar Cambios' : 'Crear Recordatorio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} className="text-rose-500" /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar concepto?</h3>
            <p className="text-sm text-slate-500 mb-6">Los pagos generados existentes no se eliminarán.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
              <button onClick={deleteFee} className="flex-1 py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
