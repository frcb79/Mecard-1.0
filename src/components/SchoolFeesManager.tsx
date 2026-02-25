/**
 * SchoolFeesManager — Gestión de Colegiaturas y Cobros Escolares
 * Tabs: Conceptos de Cobro | Estado de Pagos | Generar Cobros
 */

import React, { useState, useMemo } from 'react';
import {
  Receipt, Plus, Edit2, Trash2, X, DollarSign, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, Filter, Download, Users, CalendarDays, ToggleLeft, ToggleRight,
  FileText, ArrowRight, RefreshCw
} from 'lucide-react';
import { SchoolFee, SchoolFeeType, FeeRecurrence, ParentPayment, ParentPaymentStatus } from '../types';
import { MOCK_SCHOOL_FEES, MOCK_PARENT_PAYMENTS, MOCK_STUDENTS_LIST } from '../constants';
import { useToast } from './ui/Toast';

const FEE_TYPE_LABELS: Record<SchoolFeeType, string> = {
  [SchoolFeeType.TUITION]: 'Colegiatura',
  [SchoolFeeType.ENROLLMENT]: 'Inscripción',
  [SchoolFeeType.UNIFORM]: 'Uniforme',
  [SchoolFeeType.EVENT]: 'Evento',
  [SchoolFeeType.MATERIAL]: 'Material',
  [SchoolFeeType.TRANSPORT]: 'Transporte',
  [SchoolFeeType.INSURANCE]: 'Seguro',
  [SchoolFeeType.OTHER]: 'Otro',
};

const RECURRENCE_LABELS: Record<FeeRecurrence, string> = {
  [FeeRecurrence.ONE_TIME]: 'Único',
  [FeeRecurrence.MONTHLY]: 'Mensual',
  [FeeRecurrence.BIMONTHLY]: 'Bimestral',
  [FeeRecurrence.QUARTERLY]: 'Trimestral',
  [FeeRecurrence.SEMESTER]: 'Semestral',
  [FeeRecurrence.ANNUAL]: 'Anual',
};

const STATUS_CONFIG: Record<ParentPaymentStatus, { label: string; color: string; bg: string }> = {
  [ParentPaymentStatus.PAID]: { label: 'Pagado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [ParentPaymentStatus.PENDING]: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50' },
  [ParentPaymentStatus.OVERDUE]: { label: 'Vencido', color: 'text-rose-600', bg: 'bg-rose-50' },
  [ParentPaymentStatus.PARTIAL]: { label: 'Parcial', color: 'text-blue-600', bg: 'bg-blue-50' },
  [ParentPaymentStatus.CANCELLED]: { label: 'Cancelado', color: 'text-slate-400', bg: 'bg-slate-50' },
};

type Tab = 'concepts' | 'payments' | 'generate';

export default function SchoolFeesManager() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('concepts');
  const [fees, setFees] = useState<SchoolFee[]>(MOCK_SCHOOL_FEES);
  const [payments, setPayments] = useState<ParentPayment[]>(MOCK_PARENT_PAYMENTS);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFee, setEditingFee] = useState<SchoolFee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<{ fee: string; status: string }>({ fee: 'all', status: 'all' });

  // Fee form state
  const [feeForm, setFeeForm] = useState({ name: '', description: '', type: SchoolFeeType.TUITION, amount: '', recurrence: FeeRecurrence.MONTHLY, dueDay: '5', lateFeePercent: '', allGrades: true, grades: '' });

  // Generation state
  const [genFeeId, setGenFeeId] = useState('');
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));

  // Stats
  const stats = useMemo(() => {
    const totalExpected = payments.reduce((s, p) => s + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === ParentPaymentStatus.PAID).reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const totalPending = payments.filter(p => p.status === ParentPaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0);
    const totalOverdue = payments.filter(p => p.status === ParentPaymentStatus.OVERDUE).reduce((s, p) => s + p.amount, 0);
    return { totalExpected, totalPaid, totalPending, totalOverdue, rate: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0 };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (paymentFilter.fee !== 'all') result = result.filter(p => p.feeId === paymentFilter.fee);
    if (paymentFilter.status !== 'all') result = result.filter(p => p.status === paymentFilter.status);
    return result;
  }, [payments, paymentFilter]);

  const openAddFee = () => {
    setEditingFee(null);
    setFeeForm({ name: '', description: '', type: SchoolFeeType.TUITION, amount: '', recurrence: FeeRecurrence.MONTHLY, dueDay: '5', lateFeePercent: '', allGrades: true, grades: '' });
    setShowFeeModal(true);
  };

  const openEditFee = (fee: SchoolFee) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name, description: fee.description || '', type: fee.type, amount: String(fee.amount),
      recurrence: fee.recurrence, dueDay: String(fee.dueDay), lateFeePercent: fee.lateFeePercent ? String(fee.lateFeePercent) : '',
      allGrades: fee.appliesTo.all, grades: fee.appliesTo.grades?.join(', ') || '',
    });
    setShowFeeModal(true);
  };

  const saveFee = () => {
    if (!feeForm.name.trim() || !feeForm.amount) { toast.warning('Requerido', 'Nombre y monto son obligatorios'); return; }
    const feeData: SchoolFee = {
      id: editingFee?.id || `fee_${Date.now()}`,
      schoolId: 'mx_01', name: feeForm.name.trim(), description: feeForm.description.trim() || undefined,
      type: feeForm.type, amount: parseFloat(feeForm.amount), recurrence: feeForm.recurrence,
      dueDay: parseInt(feeForm.dueDay) || 5,
      appliesTo: feeForm.allGrades ? { all: true } : { all: false, grades: feeForm.grades.split(',').map(g => g.trim()).filter(Boolean) },
      lateFeePercent: feeForm.lateFeePercent ? parseFloat(feeForm.lateFeePercent) : undefined,
      isActive: editingFee?.isActive ?? true, createdAt: editingFee?.createdAt || new Date().toISOString().slice(0, 10),
    };
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? feeData : f));
      toast.info('Actualizado', `${feeData.name} guardado`);
    } else {
      setFees([...fees, feeData]);
      toast.info('Creado', `${feeData.name} agregado`);
    }
    setShowFeeModal(false);
  };

  const deleteFee = () => {
    if (deleteConfirm) {
      setFees(fees.filter(f => f.id !== deleteConfirm));
      toast.info('Eliminado', 'Concepto eliminado');
      setDeleteConfirm(null);
    }
  };

  const toggleFee = (id: string) => {
    setFees(fees.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const generatePayments = () => {
    const fee = fees.find(f => f.id === genFeeId);
    if (!fee) { toast.warning('Selecciona', 'Elige un concepto de cobro'); return; }
    const students = MOCK_STUDENTS_LIST;
    const newPayments: ParentPayment[] = students.map((s, i) => ({
      id: `pay_gen_${Date.now()}_${i}`, feeId: fee.id, feeName: `${fee.name} — ${genMonth}`,
      parentId: s.parentId || 'parent_01', studentId: s.id, studentName: s.fullName || s.name,
      amount: fee.amount, status: ParentPaymentStatus.PENDING,
      dueDate: `${genMonth}-${String(fee.dueDay).padStart(2, '0')}`,
    }));
    setPayments([...payments, ...newPayments]);
    toast.info('Generados', `${newPayments.length} cobros creados para ${fee.name}`);
  };

  const exportCSV = () => {
    const rows = filteredPayments.map(p => `${p.studentName},${p.feeName},${p.amount},${p.status},${p.dueDate},${p.paidAt || ''},${p.paymentMethod || ''}`);
    const csv = `Alumno,Concepto,Monto,Estado,Vencimiento,Pagado,Método\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `colegiaturas_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.info('Exportado', 'Archivo CSV descargado');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Receipt className="w-9 h-9 text-indigo-600" /> Colegiaturas y Cobros
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">Gestiona conceptos de cobro, genera pagos y da seguimiento</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Esperado</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">${stats.totalExpected.toLocaleString('es-MX')}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-2">Cobrado</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">${stats.totalPaid.toLocaleString('es-MX')}</p>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg mt-2 inline-block">{stats.rate}%</span>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[3px] mb-2">Pendiente</p>
            <p className="text-3xl font-black text-amber-600 tracking-tighter">${stats.totalPending.toLocaleString('es-MX')}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-rose-100 shadow-sm">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] mb-2">Vencido</p>
            <p className="text-3xl font-black text-rose-600 tracking-tighter">${stats.totalOverdue.toLocaleString('es-MX')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-3 rounded-[28px] border border-slate-100 shadow-sm w-fit">
          {([['concepts', 'Conceptos', <FileText size={16} key="c"/>], ['payments', 'Pagos', <DollarSign size={16} key="p"/>], ['generate', 'Generar', <RefreshCw size={16} key="g"/>]] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)}
              className={`px-8 py-3 rounded-[22px] flex items-center gap-2 font-black text-[11px] uppercase tracking-[2px] transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* TAB: Conceptos */}
        {activeTab === 'concepts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button onClick={openAddFee} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">
                <Plus size={18} /> Nuevo Concepto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fees.map(fee => (
                <div key={fee.id} className={`bg-white rounded-[40px] p-8 border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${fee.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${fee.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {FEE_TYPE_LABELS[fee.type]}
                      </span>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight mt-3">{fee.name}</h3>
                      {fee.description && <p className="text-xs text-slate-400 mt-1">{fee.description}</p>}
                    </div>
                    <button onClick={() => toggleFee(fee.id)} className="text-slate-300 hover:text-indigo-600 transition-all" title={fee.isActive ? 'Desactivar' : 'Activar'}>
                      {fee.isActive ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} />}
                    </button>
                  </div>

                  <p className="text-4xl font-black text-slate-800 tracking-tighter mb-1">${fee.amount.toLocaleString('es-MX')}</p>
                  <p className="text-[10px] font-bold text-slate-400">{RECURRENCE_LABELS[fee.recurrence]} • Día {fee.dueDay}{fee.lateFeePercent ? ` • ${fee.lateFeePercent}% recargo` : ''}</p>

                  <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50">
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

        {/* TAB: Estado de Pagos */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap gap-3 items-center">
              <select value={paymentFilter.fee} onChange={e => setPaymentFilter({ ...paymentFilter, fee: e.target.value })}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none">
                <option value="all">Todos los conceptos</option>
                {fees.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={paymentFilter.status} onChange={e => setPaymentFilter({ ...paymentFilter, status: e.target.value })}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none">
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={exportCSV} className="ml-auto flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <Download size={16} /> Exportar CSV
              </button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Alumno</th>
                    <th className="p-6">Concepto</th>
                    <th className="p-6 text-right">Monto</th>
                    <th className="p-6 text-center">Estado</th>
                    <th className="p-6">Vencimiento</th>
                    <th className="p-6">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.map(p => {
                    const sc = STATUS_CONFIG[p.status];
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 font-bold text-slate-700 text-sm">{p.studentName}</td>
                        <td className="p-6 text-sm text-slate-500">{p.feeName}</td>
                        <td className="p-6 text-right font-black text-slate-800">${p.amount.toLocaleString('es-MX')}</td>
                        <td className="p-6 text-center">
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </td>
                        <td className="p-6 text-xs text-slate-400 font-mono">{p.dueDate}</td>
                        <td className="p-6 text-xs text-slate-400">{p.paidAt ? `${p.paidAt} • ${p.paymentMethod}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="p-16 text-center opacity-30"><DollarSign size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin pagos registrados</p></div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Generar Cobros */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><CalendarDays size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Generar Cobros Masivos</h3>
                  <p className="text-xs text-slate-400 mt-1">Selecciona un concepto y mes para crear pagos pendientes</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Concepto de Cobro</label>
                  <select value={genFeeId} onChange={e => setGenFeeId(e.target.value)}
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100">
                    <option value="">Seleccionar concepto...</option>
                    {fees.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name} — ${f.amount.toLocaleString('es-MX')}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mes</label>
                  <input type="month" value={genMonth} onChange={e => setGenMonth(e.target.value)}
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>

                {genFeeId && (
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <Users size={20} className="text-indigo-600" />
                      <p className="font-bold text-indigo-700 text-sm">Se generarán <span className="font-black">{MOCK_STUDENTS_LIST.length} cobros</span> para alumnos activos</p>
                    </div>
                    <p className="text-xs text-indigo-500 mt-2 ml-8">Total a cobrar: <span className="font-black">${((fees.find(f => f.id === genFeeId)?.amount || 0) * MOCK_STUDENTS_LIST.length).toLocaleString('es-MX')}</span></p>
                  </div>
                )}

                <button onClick={generatePayments}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <RefreshCw size={18} /> Generar Cobros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[48px] p-12 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowFeeModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800"><X size={28} /></button>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">{editingFee ? 'Editar Concepto' : 'Nuevo Concepto de Cobro'}</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre *</label>
                <input value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="Colegiatura Mensual"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Descripción</label>
                <input value={feeForm.description} onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} placeholder="Opcional..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipo</label>
                  <select value={feeForm.type} onChange={e => setFeeForm({ ...feeForm, type: e.target.value as SchoolFeeType })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700">
                    {Object.entries(FEE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monto *</label>
                  <input type="number" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="8500"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Recurrencia</label>
                  <select value={feeForm.recurrence} onChange={e => setFeeForm({ ...feeForm, recurrence: e.target.value as FeeRecurrence })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700">
                    {Object.entries(RECURRENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Día Cobro</label>
                  <input type="number" min="1" max="28" value={feeForm.dueDay} onChange={e => setFeeForm({ ...feeForm, dueDay: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Recargo %</label>
                  <input type="number" value={feeForm.lateFeePercent} onChange={e => setFeeForm({ ...feeForm, lateFeePercent: e.target.value })} placeholder="5"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Aplica a</label>
                <div className="flex gap-3 mb-2">
                  <button onClick={() => setFeeForm({ ...feeForm, allGrades: true })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${feeForm.allGrades ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>Todos</button>
                  <button onClick={() => setFeeForm({ ...feeForm, allGrades: false })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!feeForm.allGrades ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>Grados específicos</button>
                </div>
                {!feeForm.allGrades && (
                  <input value={feeForm.grades} onChange={e => setFeeForm({ ...feeForm, grades: e.target.value })} placeholder="1° Primaria, 2° Primaria"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                )}
              </div>
              <button onClick={saveFee} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all">
                {editingFee ? 'Guardar Cambios' : 'Crear Concepto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} className="text-rose-500" /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar concepto?</h3>
            <p className="text-sm text-slate-500 mb-8">Los pagos generados existentes no se eliminarán.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
              <button onClick={deleteFee} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
