import React, { useEffect, useMemo, useState } from 'react';
import { Settings2, Save, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { getRefundService } from '../../services/supabaseRefunds';
import type { PlatformSettings } from '../../types';
import { useToast } from '../ui/Toast';

const DEFAULT_SETTINGS: Omit<PlatformSettings, 'id' | 'updated_at'> = {
  pool_to_points_exchange_rate: 1,
  pool_points_expiry_days: 30,
  school_refund_batch_interval_days: 15,
  default_pos_accepts_cash: false,
  updated_by: undefined,
};

export default function PlatformSettingsPanel() {
  const toast = useToast();
  const refundService = useMemo(() => getRefundService(supabase), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_SETTINGS);

  const loadSettings = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setForm(DEFAULT_SETTINGS);
        return;
      }

      const settings = await refundService.getPlatformSettings();
      if (settings) {
        setForm({
          pool_to_points_exchange_rate: settings.pool_to_points_exchange_rate,
          pool_points_expiry_days: settings.pool_points_expiry_days,
          school_refund_batch_interval_days: settings.school_refund_batch_interval_days,
          default_pos_accepts_cash: settings.default_pos_accepts_cash,
          updated_by: settings.updated_by,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!isSupabaseConfigured) {
      toast.warning('Supabase no configurado', 'Configura variables reales antes de guardar cambios.');
      return;
    }

    setSaving(true);
    try {
      const result = await refundService.updatePlatformSettings(form, 'system');
      if (!result.success) {
        toast.error('No se pudo guardar', result.error || 'Error desconocido');
        return;
      }

      toast.success('Configuración guardada', 'La política global de reembolsos fue actualizada.');
      await loadSettings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Global Refund Controls</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-indigo-600" /> Plataforma
          </h2>
        </div>
        <button
          onClick={loadSettings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recargar
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Vista en modo local. Los cambios no se persistirán hasta configurar credenciales reales de Supabase.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rate Pool to Points</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.pool_to_points_exchange_rate}
            onChange={(event) => setForm((current) => ({ ...current, pool_to_points_exchange_rate: Number(event.target.value) }))}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none ring-0"
          />
        </label>

        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pool Expiry Days</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.pool_points_expiry_days}
            onChange={(event) => setForm((current) => ({ ...current, pool_points_expiry_days: Number(event.target.value) }))}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none ring-0"
          />
        </label>

        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">School Batch Interval</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.school_refund_batch_interval_days}
            onChange={(event) => setForm((current) => ({ ...current, school_refund_batch_interval_days: Number(event.target.value) }))}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none ring-0"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 mt-6 md:mt-7">
          <input
            type="checkbox"
            checked={form.default_pos_accepts_cash}
            onChange={(event) => setForm((current) => ({ ...current, default_pos_accepts_cash: event.target.checked }))}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="font-bold text-slate-700">POS acepta efectivo por defecto</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[2px] disabled:opacity-60"
        >
          <Save size={14} /> {saving ? 'Guardando' : 'Guardar Configuración'}
        </button>
      </div>
    </section>
  );
}