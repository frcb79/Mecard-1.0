import React, { useEffect, useMemo, useState } from 'react';
import { School2, Save } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MOCK_SCHOOLS } from '../../constants';
import { getRefundService } from '../../services/supabaseRefunds';
import { useToast } from '../ui/Toast';

interface SchoolSettingsPanelProps {
  defaultSchoolId?: string;
}

export default function SchoolSettingsPanel({ defaultSchoolId }: SchoolSettingsPanelProps) {
  const toast = useToast();
  const refundService = useMemo(() => getRefundService(supabase), []);
  const initialSchoolId = defaultSchoolId || MOCK_SCHOOLS[0]?.id || '';

  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async (targetSchoolId: string) => {
    if (!targetSchoolId) return;
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setMultiplier(1);
        return;
      }

      const settings = await refundService.getSchoolSettings(targetSchoolId);
      setMultiplier(settings?.pool_points_multiplier ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings(schoolId);
  }, [schoolId]);

  const handleSave = async () => {
    if (!schoolId) return;
    if (!isSupabaseConfigured) {
      toast.warning('Supabase no configurado', 'Configura la conexión antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      const result = await refundService.updateSchoolSettings(schoolId, { pool_points_multiplier: multiplier });
      if (!result.success) {
        toast.error('No se pudo guardar', result.error || 'Error desconocido');
        return;
      }
      toast.success('Escuela actualizada', 'El multiplicador de puntos fue guardado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">School Refund Controls</p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <School2 className="w-6 h-6 text-emerald-600" /> Escuela
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Escuela</span>
          <select
            value={schoolId}
            onChange={(event) => setSchoolId(event.target.value)}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none"
          >
            {MOCK_SCHOOLS.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pool Points Multiplier</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={multiplier}
            onChange={(event) => setMultiplier(Number(event.target.value))}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading || !schoolId}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[2px] disabled:opacity-60"
        >
          <Save size={14} /> {saving ? 'Guardando' : 'Guardar Escuela'}
        </button>
      </div>
    </section>
  );
}