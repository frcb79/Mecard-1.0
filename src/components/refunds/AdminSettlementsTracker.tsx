import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { getRefundService } from '../../services/supabaseRefunds';
import type { SchoolRefundSettlement } from '../../types';

interface AdminSettlementsTrackerProps {
  schoolId?: string;
}

export default function AdminSettlementsTracker({ schoolId }: AdminSettlementsTrackerProps) {
  const refundService = useMemo(() => getRefundService(supabase), []);
  const [items, setItems] = useState<SchoolRefundSettlement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setItems([]);
        return;
      }
      const settlements = await refundService.getSettlements(schoolId ? { schoolId } : undefined);
      setItems(settlements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [schoolId]);

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Settlement Ledger</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Landmark className="w-6 h-6 text-violet-600" /> Liquidaciones
          </h2>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recargar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="py-3">Referencia</th>
              <th className="py-3">Método</th>
              <th className="py-3">Monto</th>
              <th className="py-3">Estado</th>
              <th className="py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {items.slice(0, 12).map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-mono text-xs">{item.settlement_reference}</td>
                <td className="py-3">{item.settlement_method}</td>
                <td className="py-3 font-black">${item.total_settled_amount.toFixed(2)}</td>
                <td className="py-3"><span className="px-2 py-1 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest">{item.status}</span></td>
                <td className="py-3">{new Date(item.settled_at).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">Sin liquidaciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}