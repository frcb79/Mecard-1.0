import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleX, HandCoins, Plus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MOCK_SCHOOLS } from '../../constants';
import { getRefundService } from '../../services/supabaseRefunds';
import type { PendingSchoolRefund } from '../../types';
import { useToast } from '../ui/Toast';

interface AdminSchoolRefundsBatchProcessorProps {
  schoolId?: string;
}

export default function AdminSchoolRefundsBatchProcessor({ schoolId }: AdminSchoolRefundsBatchProcessorProps) {
  const toast = useToast();
  const refundService = useMemo(() => getRefundService(supabase), []);
  const [refunds, setRefunds] = useState<PendingSchoolRefund[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId || MOCK_SCHOOLS[0]?.id || '');
  const [reason, setReason] = useState<'service_not_used' | 'partial_service' | 'error_correction' | 'other'>('service_not_used');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);

  const load = async () => {
    if (!isSupabaseConfigured) {
      setRefunds([]);
      return;
    }
    const data = await refundService.getPendingSchoolRefunds(selectedSchoolId ? { schoolId: selectedSchoolId } : undefined);
    setRefunds(data);
  };

  useEffect(() => {
    load();
  }, [selectedSchoolId]);

  const createRefund = async () => {
    if (!isSupabaseConfigured) {
      toast.warning('Supabase no configurado', 'No es posible crear batches aún.');
      return;
    }
    if (!selectedSchoolId || !description || amount <= 0) {
      toast.warning('Faltan datos', 'Captura escuela, descripción y monto.');
      return;
    }
    const created = await refundService.createPendingSchoolRefund({
      schoolId: selectedSchoolId,
      reason,
      description,
      items: [{ amount, description, date: new Date().toISOString().slice(0, 10) }],
    });
    if (!created) {
      toast.error('No se pudo crear', 'Revisa la conexión y el esquema desplegado.');
      return;
    }
    setDescription('');
    setAmount(0);
    toast.success('Batch creado', `Batch ${created.batch_number} generado.`);
    await load();
  };

  const approve = async (refundId: string) => {
    const result = await refundService.approvePendingRefund(refundId, 'system');
    if (!result.success) {
      toast.error('No se pudo aprobar', result.error || 'Error desconocido');
      return;
    }
    toast.success('Batch aprobado');
    await load();
  };

  const reject = async (refundId: string) => {
    const result = await refundService.rejectPendingRefund(refundId, 'Rejected from admin console', 'system');
    if (!result.success) {
      toast.error('No se pudo rechazar', result.error || 'Error desconocido');
      return;
    }
    toast.success('Batch rechazado');
    await load();
  };

  const settle = async (refundId: string) => {
    const result = await refundService.settleApprovedRefund(refundId, {
      method: 'bank_transfer',
      reference: `SET-${Date.now()}`,
      notes: 'Settled from admin console',
    }, 'system');
    if (!result.success) {
      toast.error('No se pudo liquidar', result.error || 'Error desconocido');
      return;
    }
    toast.success('Batch liquidado', result.settlementId || '');
    await load();
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Manual 15-Day Refund Workflow</p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <HandCoins className="w-6 h-6 text-cyan-600" /> Batches Escolares
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <select value={selectedSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)} className="rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none">
          {MOCK_SCHOOLS.map((school) => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
        <select value={reason} onChange={(event) => setReason(event.target.value as typeof reason)} className="rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none">
          <option value="service_not_used">Servicio no prestado</option>
          <option value="partial_service">Servicio parcial</option>
          <option value="error_correction">Corrección de error</option>
          <option value="other">Otro</option>
        </select>
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" className="rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none" />
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} placeholder="Monto" className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none" />
          <button onClick={createRefund} className="shrink-0 rounded-2xl bg-cyan-600 px-4 py-3 text-white inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
            <Plus size={14} /> Crear
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {refunds.slice(0, 10).map((refund) => (
          <div key={refund.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">Batch #{refund.batch_number}</p>
                <p className="text-xs text-slate-500 mt-1">{refund.description}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Vence {refund.batch_due_date}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black tracking-tighter text-slate-900">${refund.total_amount_pending.toFixed(2)}</p>
                <span className="px-2 py-1 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest">{refund.status}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {refund.status === 'pending' && (
                <>
                  <button onClick={() => approve(refund.id)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-white font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={14} /> Aprobar</button>
                  <button onClick={() => reject(refund.id)} className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-white font-black text-[10px] uppercase tracking-widest"><CircleX size={14} /> Rechazar</button>
                </>
              )}
              {refund.status === 'approved' && (
                <button onClick={() => settle(refund.id)} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-white font-black text-[10px] uppercase tracking-widest"><HandCoins size={14} /> Liquidar</button>
              )}
            </div>
          </div>
        ))}
        {!refunds.length && <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-slate-400">No hay batches cargados.</div>}
      </div>
    </section>
  );
}