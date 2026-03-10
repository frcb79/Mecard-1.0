import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, TimerReset, Trophy } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { getRefundService } from '../../services/supabaseRefunds';
import type { PoolPointConversion } from '../../types';
import { useToast } from '../ui/Toast';

interface AdminPoolRefundsManagerProps {
  schoolId?: string;
}

export default function AdminPoolRefundsManager({ schoolId }: AdminPoolRefundsManagerProps) {
  const toast = useToast();
  const refundService = useMemo(() => getRefundService(supabase), []);
  const [items, setItems] = useState<PoolPointConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setItems([]);
        return;
      }
      const data = await refundService.getPoolPointConversions(schoolId ? { schoolId } : undefined);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [schoolId]);

  const runConversion = async () => {
    if (!isSupabaseConfigured) {
      toast.warning('Supabase no configurado', 'El job diario necesita credenciales reales.');
      return;
    }
    setRunning(true);
    try {
      const result = await refundService.convertExpiredPoolRefundsToPoints();
      toast.success('Job ejecutado', `Colas creadas: ${result.queued || 0} · conversiones: ${result.converted}`);
      await load();
    } finally {
      setRunning(false);
    }
  };

  const pending = items.filter((item) => item.status === 'pending').length;
  const converted = items.filter((item) => item.status === 'converted').length;
  const failed = items.filter((item) => item.status === 'failed').length;

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Expired Pool Conversion Queue</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500" /> Pools a Puntos
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recargar
          </button>
          <button onClick={runConversion} className="px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
            <TimerReset size={14} className={running ? 'animate-spin' : ''} /> {running ? 'Procesando' : 'Ejecutar Job'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pendientes', value: pending, tone: 'text-amber-600 bg-amber-50' },
          { label: 'Convertidos', value: converted, tone: 'text-emerald-600 bg-emerald-50' },
          { label: 'Fallidos', value: failed, tone: 'text-rose-600 bg-rose-50' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl px-4 py-4 ${card.tone}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{card.label}</p>
            <p className="text-3xl font-black tracking-tighter mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="py-3">Pool</th>
              <th className="py-3">Perfil</th>
              <th className="py-3">Monto</th>
              <th className="py-3">Puntos</th>
              <th className="py-3">Elegible</th>
              <th className="py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {items.slice(0, 12).map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-mono text-xs">{item.pool_id.slice(0, 8)}</td>
                <td className="py-3 font-mono text-xs">{item.contributor_profile_id.slice(0, 8)}</td>
                <td className="py-3 font-black">${item.original_contribution_amount.toFixed(2)}</td>
                <td className="py-3 font-black">{item.points_awarded ?? '—'}</td>
                <td className="py-3">{new Date(item.eligible_at).toLocaleDateString('es-MX')}</td>
                <td className="py-3"><span className="px-2 py-1 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest">{item.status}</span></td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No hay conversiones registradas todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}