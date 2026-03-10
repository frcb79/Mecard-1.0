import React from 'react';
import PlatformSettingsPanel from './PlatformSettingsPanel';
import AdminPoolRefundsManager from './AdminPoolRefundsManager';
import AdminSchoolRefundsBatchProcessor from './AdminSchoolRefundsBatchProcessor';
import AdminSettlementsTracker from './AdminSettlementsTracker';

export default function RefundPolicyAdminPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <p className="text-[10px] font-black uppercase tracking-[4px] text-indigo-500 mb-2">Refund Policy Console</p>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Reembolsos y Conversión a Puntos</h1>
          <p className="text-slate-500 font-medium mt-2">Configuración global, cola de pools expirados, batches escolares y ledger de liquidaciones.</p>
        </header>
        <PlatformSettingsPanel />
        <AdminPoolRefundsManager />
        <AdminSchoolRefundsBatchProcessor />
        <AdminSettlementsTracker />
      </div>
    </div>
  );
}