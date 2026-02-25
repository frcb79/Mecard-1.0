/**
 * ParentFeesView — Vista de Colegiaturas para Padres
 * Cards por hijo, lista de pagos, becas, planes de pago, pagos parciales
 */

import React, { useState, useMemo } from 'react';
import {
  Receipt, DollarSign, Clock, AlertTriangle, CheckCircle2, CreditCard, Download,
  ChevronDown, ChevronRight, FileText, Banknote, ExternalLink, GraduationCap,
  Calendar, TrendingUp
} from 'lucide-react';
import { ParentPayment, ParentPaymentStatus, PaymentPlanStatus } from '../types';
import { SchoolFeeService } from '../services/SchoolFeeService';
import { useToast } from './ui/Toast';

const STATUS_CONFIG: Record<ParentPaymentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  [ParentPaymentStatus.PAID]: { label: 'Pagado', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14} /> },
  [ParentPaymentStatus.PENDING]: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14} /> },
  [ParentPaymentStatus.OVERDUE]: { label: 'Vencido', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AlertTriangle size={14} /> },
  [ParentPaymentStatus.PARTIAL]: { label: 'Parcial', color: 'text-blue-600', bg: 'bg-blue-50', icon: <DollarSign size={14} /> },
  [ParentPaymentStatus.CANCELLED]: { label: 'Cancelado', color: 'text-slate-400', bg: 'bg-slate-50', icon: <FileText size={14} /> },
};

const PAYMENT_METHODS = [
  { id: 'SPEI', label: 'SPEI / Transferencia', icon: <Banknote size={20} /> },
  { id: 'CARD', label: 'Tarjeta de Crédito / Débito', icon: <CreditCard size={20} /> },
  { id: 'OXXO', label: 'Pago en OXXO', icon: <ExternalLink size={20} /> },
];

export default function ParentFeesView() {
  const toast = useToast();
  const parentId = 'parent_01'; // Demo: logged-in parent

  const familyStatement = useMemo(() => SchoolFeeService.getFamilyStatement(parentId), []);
  const paymentPlans = useMemo(() =>
    SchoolFeeService.getPaymentPlans('mx_01').filter(p => p.parentId === parentId),
  []);
  const scholarships = useMemo(() =>
    SchoolFeeService.getScholarships('mx_01').filter(s =>
      familyStatement.children.some(c => c.studentId === s.studentId) && s.isActive
    ),
  [familyStatement]);

  const [payments, setPayments] = useState<ParentPayment[]>(() => SchoolFeeService.getPaymentsByParent(parentId));
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<ParentPayment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('SPEI');
  const [processingPay, setProcessingPay] = useState(false);
  const [partialMode, setPartialMode] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  // Group by student
  const groupedByStudent = useMemo(() => {
    const groups: Record<string, { name: string; payments: ParentPayment[] }> = {};
    payments.forEach(p => {
      if (!groups[p.studentId]) groups[p.studentId] = { name: p.studentName, payments: [] };
      groups[p.studentId].payments.push(p);
    });
    return groups;
  }, [payments]);

  // Summary
  const summary = useMemo(() => {
    const pending = payments.filter(p => p.status === ParentPaymentStatus.PENDING || p.status === ParentPaymentStatus.OVERDUE);
    const totalDue = pending.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);
    const paid = payments.filter(p => p.status === ParentPaymentStatus.PAID);
    const totalPaid = paid.reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const overdue = payments.filter(p => p.status === ParentPaymentStatus.OVERDUE).length;
    const totalScholarships = payments.reduce((s, p) => s + (p.scholarshipDiscount || 0), 0);
    return { totalDue, totalPaid, overdue, pendingCount: pending.length, totalScholarships };
  }, [payments]);

  // Upcoming dues (next 30 days)
  const upcomingDues = useMemo(() => {
    const today = new Date();
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    return payments.filter(p =>
      (p.status === ParentPaymentStatus.PENDING) &&
      new Date(p.dueDate) >= today && new Date(p.dueDate) <= in30
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [payments]);

  const simulatePayment = () => {
    if (!payModal) return;
    setProcessingPay(true);
    const payAmount = partialMode && partialAmount ? parseFloat(partialAmount) : undefined;
    setTimeout(() => {
      const result = SchoolFeeService.processPayment(payModal.id, selectedMethod, `REF-${Date.now()}`, payAmount);
      if (result) {
        setPayments(SchoolFeeService.getPaymentsByParent(parentId));
        toast.info('¡Pago exitoso!', `Se procesó el pago por $${(payAmount || (payModal.amount - (payModal.paidAmount || 0))).toLocaleString('es-MX')}`);
      }
      setProcessingPay(false);
      setPayModal(null);
      setPartialMode(false);
      setPartialAmount('');
    }, 1500);
  };

  const exportReceipts = () => {
    const paid = payments.filter(p => p.status === ParentPaymentStatus.PAID);
    const rows = paid.map(p => `${p.studentName},${p.feeName},${p.originalAmount || p.amount},${p.scholarshipDiscount || 0},${p.amount},${p.paidAt},${p.paymentMethod},${p.referenceNumber}`);
    const csv = `Alumno,Concepto,MontoOriginal,Beca,MontoFinal,Fecha Pago,Método,Referencia\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `recibos_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.info('Exportado', 'Recibos descargados');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Receipt className="w-9 h-9 text-indigo-600" /> Colegiaturas y Pagos
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-1">Revisa tu estado de cuenta y realiza pagos en línea</p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[3px] mb-1">Por Pagar</p>
            <p className="text-2xl font-black text-amber-600 tracking-tighter">${summary.totalDue.toLocaleString('es-MX')}</p>
            <p className="text-[10px] font-bold text-amber-400 mt-1">{summary.pendingCount} pendiente{summary.pendingCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-1">Pagado</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${summary.totalPaid.toLocaleString('es-MX')}</p>
          </div>
          {summary.overdue > 0 && (
            <div className="bg-white p-6 rounded-[32px] border border-rose-100 shadow-sm">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] mb-1">Vencidos</p>
              <p className="text-2xl font-black text-rose-600 tracking-tighter">{summary.overdue}</p>
              <p className="text-[10px] font-bold text-rose-400 mt-1">Paga cuanto antes</p>
            </div>
          )}
          {summary.totalScholarships > 0 && (
            <div className="bg-white p-6 rounded-[32px] border border-purple-100 shadow-sm">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[3px] mb-1">Becas</p>
              <p className="text-2xl font-black text-purple-600 tracking-tighter">-${summary.totalScholarships.toLocaleString('es-MX')}</p>
              <p className="text-[10px] font-bold text-purple-400 mt-1">descuento aplicado</p>
            </div>
          )}
        </div>

        {/* Upcoming Timeline */}
        {upcomingDues.length > 0 && (
          <div className="bg-white rounded-[32px] p-6 border border-indigo-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" /> Próximos Vencimientos
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {upcomingDues.slice(0, 5).map(p => {
                const daysLeft = Math.ceil((new Date(p.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={p.id} className="min-w-[180px] bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{p.dueDate}</p>
                    <p className="text-sm font-bold text-slate-700 mt-1 truncate">{p.feeName}</p>
                    <p className="text-lg font-black text-slate-800 mt-1">${p.amount.toLocaleString('es-MX')}</p>
                    <p className="text-[10px] font-bold text-indigo-500 mt-1">
                      {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `En ${daysLeft} días`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scholarships Banner */}
        {scholarships.length > 0 && (
          <div className="bg-purple-50/50 rounded-[32px] p-6 border border-purple-100">
            <h3 className="text-sm font-black text-purple-800 tracking-tight mb-3 flex items-center gap-2">
              <GraduationCap size={18} className="text-purple-600" /> Becas Vigentes
            </h3>
            <div className="flex gap-3 flex-wrap">
              {scholarships.map(s => (
                <div key={s.id} className="bg-white rounded-2xl px-4 py-3 border border-purple-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-700">{s.studentName}</p>
                  <p className="text-sm font-black text-purple-600">
                    {s.name}: {s.discountType === 'PERCENTAGE' ? `${s.discountValue}%` : `$${s.discountValue.toLocaleString('es-MX')}`}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{s.validFrom} → {s.validUntil}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Plans */}
        {paymentPlans.length > 0 && (
          <div className="bg-blue-50/50 rounded-[32px] p-6 border border-blue-100">
            <h3 className="text-sm font-black text-blue-800 tracking-tight mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Planes de Pago Activos
            </h3>
            <div className="space-y-3">
              {paymentPlans.filter(p => p.status === PaymentPlanStatus.ACTIVE).map(plan => {
                const progress = plan.installments > 0 ? Math.round((plan.paidInstallments / plan.installments) * 100) : 0;
                return (
                  <div key={plan.id} className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{plan.feeName} — {plan.studentName}</p>
                        <p className="text-[10px] text-slate-400">Parcialidad: ${plan.installmentAmount.toLocaleString('es-MX')} • Próximo: {plan.nextDueDate}</p>
                      </div>
                      <p className="text-lg font-black text-blue-600">{plan.paidInstallments}/{plan.installments}</p>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-Child Cards */}
        <div className="space-y-6">
          {Object.entries(groupedByStudent).map(([studentId, group]) => {
            const isExpanded = expandedChild === studentId || expandedChild === null;
            const studentPending = group.payments.filter(p => p.status === ParentPaymentStatus.PENDING || p.status === ParentPaymentStatus.OVERDUE);
            const studentDue = studentPending.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);
            const studentScholarship = scholarships.find(s => s.studentId === studentId);

            return (
              <div key={studentId} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedChild(expandedChild === studentId ? null : studentId)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg tracking-tighter">
                      {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{group.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-400 font-bold">{group.payments.length} cobros • {studentPending.length} pendiente{studentPending.length !== 1 ? 's' : ''}</p>
                        {studentScholarship && (
                          <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                            Beca {studentScholarship.discountType === 'PERCENTAGE' ? `${studentScholarship.discountValue}%` : `$${studentScholarship.discountValue}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {studentDue > 0 && <span className="text-lg font-black text-amber-600">${studentDue.toLocaleString('es-MX')}</span>}
                    {isExpanded ? <ChevronDown size={20} className="text-slate-300" /> : <ChevronRight size={20} className="text-slate-300" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-50 divide-y divide-slate-50">
                    {group.payments.sort((a, b) => {
                      const order: Record<ParentPaymentStatus, number> = { [ParentPaymentStatus.OVERDUE]: 0, [ParentPaymentStatus.PENDING]: 1, [ParentPaymentStatus.PARTIAL]: 2, [ParentPaymentStatus.PAID]: 3, [ParentPaymentStatus.CANCELLED]: 4 };
                      return order[a.status] - order[b.status];
                    }).map(payment => {
                      const sc = STATUS_CONFIG[payment.status];
                      const canPay = payment.status === ParentPaymentStatus.PENDING || payment.status === ParentPaymentStatus.OVERDUE || payment.status === ParentPaymentStatus.PARTIAL;
                      const remaining = payment.amount - (payment.paidAmount || 0);
                      return (
                        <div key={payment.id} className="p-5 px-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} ${sc.color}`}>{sc.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 text-sm truncate">{payment.feeName}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <p className="text-[10px] text-slate-400">Vence: {payment.dueDate}</p>
                              {payment.scholarshipDiscount && payment.scholarshipDiscount > 0 && (
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                  Beca -${payment.scholarshipDiscount.toLocaleString('es-MX')}
                                </span>
                              )}
                              {payment.lateFeeAmount && payment.lateFeeAmount > 0 && (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                  Recargo +${payment.lateFeeAmount.toLocaleString('es-MX')}
                                </span>
                              )}
                              {payment.paidAt && <span className="text-[10px] text-slate-400">Pagado: {payment.paidAt} • {payment.paymentMethod}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-800">${payment.amount.toLocaleString('es-MX')}</p>
                            {payment.originalAmount && payment.originalAmount !== payment.amount && (
                              <p className="text-[9px] text-slate-300 line-through">${payment.originalAmount.toLocaleString('es-MX')}</p>
                            )}
                            {payment.paidAmount && payment.paidAmount > 0 && payment.paidAmount < payment.amount && (
                              <p className="text-[10px] text-blue-500 font-bold">Abonado: ${payment.paidAmount.toLocaleString('es-MX')}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {canPay && (
                            <button onClick={() => { setPayModal(payment); setPartialMode(false); setPartialAmount(''); }}
                              className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm">
                              Pagar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <button onClick={exportReceipts} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
            <Download size={16} /> Descargar Recibos
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <DollarSign size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Realizar Pago</h3>
              <p className="text-xs text-slate-400 mt-1">{payModal.feeName} • {payModal.studentName}</p>
            </div>

            {/* Amount breakdown */}
            <div className="bg-indigo-50/50 p-5 rounded-2xl space-y-2">
              {payModal.originalAmount && payModal.originalAmount !== payModal.amount && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Monto original</span>
                  <span className="text-slate-500">${payModal.originalAmount.toLocaleString('es-MX')}</span>
                </div>
              )}
              {payModal.scholarshipDiscount && payModal.scholarshipDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-purple-500">Beca aplicada</span>
                  <span className="text-purple-600 font-bold">-${payModal.scholarshipDiscount.toLocaleString('es-MX')}</span>
                </div>
              )}
              {payModal.lateFeeAmount && payModal.lateFeeAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-rose-500">Recargo por mora</span>
                  <span className="text-rose-600 font-bold">+${payModal.lateFeeAmount.toLocaleString('es-MX')}</span>
                </div>
              )}
              {payModal.paidAmount && payModal.paidAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-blue-500">Abonado previamente</span>
                  <span className="text-blue-600 font-bold">-${payModal.paidAmount.toLocaleString('es-MX')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-indigo-100">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Saldo a Pagar</span>
                <span className="text-2xl font-black text-indigo-600">${(payModal.amount - (payModal.paidAmount || 0)).toLocaleString('es-MX')}</span>
              </div>
            </div>

            {/* Partial payment toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={partialMode} onChange={e => setPartialMode(e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                <span className="text-xs font-bold text-slate-600">Pago parcial</span>
              </label>
              {partialMode && (
                <input type="number" value={partialAmount} onChange={e => setPartialAmount(e.target.value)}
                  placeholder={`Máx: ${(payModal.amount - (payModal.paidAmount || 0)).toLocaleString('es-MX')}`}
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</p>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedMethod === m.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <span className={`${selectedMethod === m.id ? 'text-indigo-600' : 'text-slate-300'}`}>{m.icon}</span>
                  <span className={`text-sm font-bold ${selectedMethod === m.id ? 'text-indigo-700' : 'text-slate-500'}`}>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPayModal(null); setPartialMode(false); setPartialAmount(''); }} disabled={processingPay}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={simulatePayment} disabled={processingPay}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-75">
                {processingPay ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</span>
                ) : 'Confirmar Pago'}
              </button>
            </div>

            <p className="text-[9px] text-slate-300 text-center font-bold">Simulación de pago en modo demo.</p>
          </div>
        </div>
      )}
    </div>
  );
}
