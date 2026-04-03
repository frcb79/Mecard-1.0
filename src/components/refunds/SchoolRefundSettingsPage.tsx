import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import SchoolSettingsPanel from './SchoolSettingsPanel';
import AdminSettlementsTracker from './AdminSettlementsTracker';

export default function SchoolRefundSettingsPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-[28px] border border-slate-200 p-8 text-center text-slate-500">
          Esta cuenta no tiene una escuela asociada para administrar refunds.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-500 mb-2">School Refund Settings</p>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Configuración de Escuela</h1>
          <p className="text-slate-500 font-medium mt-2">Multiplicador de conversión de pools a puntos y visibilidad de liquidaciones.</p>
        </header>
        <SchoolSettingsPanel defaultSchoolId={schoolId} />
        <AdminSettlementsTracker schoolId={schoolId} />
      </div>
    </div>
  );
}