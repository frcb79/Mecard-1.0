/**
 * ParentFeesView — Vista de Colegiaturas para Padres
 * Cards por hijo, lista de pagos, botón "Pagar", historial
 */

import React, { useState, useMemo } from 'react';
import {
  Receipt, DollarSign, Clock, AlertTriangle, CheckCircle2, CreditCard, Download,
  ChevronDown, ChevronRight, FileText, Banknote, ExternalLink
} from 'lucide-react';
import { ParentPayment, ParentPaymentStatus } from '../types';
import { MOCK_PARENT_PAYMENTS } from '../constants';
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
  const [payments, setPayments] = useState<ParentPayment[]>(MOCK_PARENT_PAYMENTS.filter(p => p.parentId === parentId));
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<ParentPayment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('SPEI');
  const [processingPay, setProcessingPay] = useState(false);

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
    return { totalDue, totalPaid, overdue, pendingCount: pending.length };
  }, [payments]);

  const simulatePayment = () => {
    if (!payModal) return;
    setProcessingPay(true);
    setTimeout(() => {
      setPayments(prev => prev.map(p =>
        p.id === payModal.id ? { ...p, status: ParentPaymentStatus.PAID, paidAmount: p.amount, paidAt: new Date().toISOString().slice(0, 10), paymentMethod: selectedMethod, referenceNumber: `REF-${Date.now()}` } : p
      ));
      setProcessingPay(false);
      setPayModal(null);
      toast.info('¡Pago exitoso!', `Se procesó el pago por $${payModal.amount.toLocaleString('es-MX')}`);
    }, 1500);
  };

  const exportReceipts = () => {
    const paid = payments.filter(p => p.status === ParentPaymentStatus.PAID);
    const rows = paid.map(p => `${p.studentName},${p.feeName},${p.amount},${p.paidAt},${p.paymentMethod},${p.referenceNumber}`);
    const csv = `Alumno,Concepto,Monto,Fecha Pago,Método,Referencia\n${rows.join('\n')}`;
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[3px] mb-2">Por Pagar</p>
            <p className="text-3xl font-black text-amber-600 tracking-tighter">${summary.totalDue.toLocaleString('es-MX')}</p>
            <p className="text-[10px] font-bold text-amber-400 mt-2">{summary.pendingCount} pago{summary.pendingCount !== 1 ? 's' : ''} pendiente{summary.pendingCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-2">Pagado</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">${summary.totalPaid.toLocaleString('es-MX')}</p>
          </div>
          {summary.overdue > 0 && (
            <div className="bg-white p-8 rounded-[40px] border border-rose-100 shadow-sm">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] mb-2">Vencidos</p>
              <p className="text-3xl font-black text-rose-600 tracking-tighter">{summary.overdue}</p>
              <p className="text-[10px] font-bold text-rose-400 mt-2">Realiza el pago cuanto antes</p>
            </div>
          )}
        </div>

        {/* Per-Child Cards */}
        <div className="space-y-6">
          {Object.entries(groupedByStudent).map(([studentId, group]) => {
            const isExpanded = expandedChild === studentId || expandedChild === null;
            const studentPending = group.payments.filter(p => p.status === ParentPaymentStatus.PENDING || p.status === ParentPaymentStatus.OVERDUE);
            const studentDue = studentPending.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);

            return (
              <div key={studentId} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedChild(expandedChild === studentId ? null : studentId)}
                  className="w-full flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all text-left">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg tracking-tighter">
                      {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{group.name}</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">{group.payments.length} cobros • {studentPending.length} pendiente{studentPending.length !== 1 ? 's' : ''}</p>
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
                      return (
                        <div key={payment.id} className="p-6 px-8 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} ${sc.color}`}>{sc.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 text-sm truncate">{payment.feeName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Vence: {payment.dueDate}
                              {payment.paidAt && ` • Pagado: ${payment.paidAt}`}
                              {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-800">${payment.amount.toLocaleString('es-MX')}</p>
                            {payment.paidAmount && payment.paidAmount < payment.amount && (
                              <p className="text-[10px] text-blue-500 font-bold">Pagado: ${payment.paidAmount.toLocaleString('es-MX')}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {canPay && (
                            <button onClick={() => setPayModal(payment)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm">
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
          <div className="bg-white rounded-[48px] p-12 w-full max-w-md shadow-2xl space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Realizar Pago</h3>
              <p className="text-xs text-slate-400 mt-2">{payModal.feeName} • {payModal.studentName}</p>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-3xl text-center">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Monto a Pagar</p>
              <p className="text-4xl font-black text-indigo-600 tracking-tighter mt-2">${(payModal.amount - (payModal.paidAmount || 0)).toLocaleString('es-MX')}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</p>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selectedMethod === m.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <span className={`${selectedMethod === m.id ? 'text-indigo-600' : 'text-slate-300'}`}>{m.icon}</span>
                  <span className={`text-sm font-bold ${selectedMethod === m.id ? 'text-indigo-700' : 'text-slate-500'}`}>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} disabled={processingPay}
                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={simulatePayment} disabled={processingPay}
                className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-75">
                {processingPay ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</span>
                ) : 'Confirmar Pago'}
              </button>
            </div>

            <p className="text-[9px] text-slate-300 text-center font-bold">Simulación de pago en modo demo. En producción se conectará con pasarela de pago real.</p>
          </div>
        </div>
      )}
    </div>
  );
}
