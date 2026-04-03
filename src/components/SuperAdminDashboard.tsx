/**
 * SuperAdminDashboard — Panel Ejecutivo de la Red MeCard
 * KPIs reales, gráficas, tabla de campus, actividad reciente
 */

import React, { useState, useEffect } from 'react';
import {
  Building2, Users, DollarSign, Zap, ShieldCheck, Landmark,
  TrendingUp, ArrowUpRight, Activity, AlertTriangle,
  GraduationCap, CreditCard, BarChart3, Globe, Eye, Fingerprint
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { usePlatform } from '../contexts/PlatformContext';
import { SchoolManagement } from './SchoolManagement';
import { useDashboard } from '../hooks/useDashboard';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type Tab = 'hub' | 'infrastructure';

export const SuperAdminDashboard: React.FC = () => {
  const { schools } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('hub');

  const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v);

  // ===== Use dashboard hook for all data =====
  const {
    metrics: kpis,
    revenueByMonth,
    campusData,
    statusPie,
    recentActivity,
    loading,
    fetchMetrics,
  } = useDashboard();

  // Trigger fetch when schools change
  useEffect(() => {
    if (schools.length > 0) {
      void fetchMetrics(schools);
    }
  }, [schools, fetchMetrics]);

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Tab header */}
      <div className="px-5 sm:px-8 py-4 bg-white/85 backdrop-blur-sm border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-xl"><Zap size={16} className="text-white" /></div>
            <span className="font-black text-sm tracking-tight">Master Hub</span>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-2xl" role="tablist">
            {([['hub', 'Estadísticas'], ['infrastructure', 'Infraestructura']] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id as Tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all ${activeTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Sincronizado</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'infrastructure' ? (
          <SchoolManagement />
        ) : (
          <div className="p-5 sm:p-8 space-y-8 pb-24 max-w-7xl mx-auto animate-in fade-in duration-300">
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <Globe className="w-9 h-9 text-indigo-600" /> Visibilidad Global
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1">Red MeCard Network — Panel ejecutivo en tiempo real</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Fingerprint size={12} className="text-slate-500" /> Nodo Seguridad: <span className="font-mono text-slate-700">MX-NET-01-ACTIVE</span>
              </div>
            </header>

            {/* KPI Grid — 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KPICard label="Campus" value={kpis.totalSchools} icon={<Building2 size={18} />} tone="indigo" />
              <KPICard label="Alumnos" value={kpis.totalStudents} icon={<GraduationCap size={18} />} tone="violet" />
              <KPICard label="Fondeo Global" value={fmt(kpis.totalBalance)} icon={<Landmark size={18} />} tone="emerald" />
              <KPICard label="Unidades Op." value={kpis.totalUnits} icon={<Building2 size={18} />} tone="sky" />
              <KPICard label="Cobrado" value={fmt(kpis.totalCollected)} icon={<DollarSign size={18} />} tone="emerald" sub="colegiaturas" />
              <KPICard label="Pendiente" value={fmt(kpis.totalPending)} icon={<CreditCard size={18} />} tone="amber" />
              <KPICard label="Vencidos" value={kpis.overdueCount} icon={<AlertTriangle size={18} />} tone="rose" sub="cobros atrasados" />
              <KPICard label="Tasa Cobranza" value={`${kpis.collectionRate}%`} icon={<TrendingUp size={18} />} tone="indigo" sub={kpis.collectionRate >= 80 ? 'Saludable' : 'Atencion'} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area chart — Revenue */}
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-indigo-600" /> Cobranza Mensual
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueByMonth}>
                    <defs>
                      <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPendiente" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString('es-MX')}`} />
                    <Legend />
                    <Area type="monotone" dataKey="cobrado" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorCobrado)" name="Cobrado" />
                    <Area type="monotone" dataKey="pendiente" stroke="#f59e0b" strokeWidth={2} fill="url(#colorPendiente)" name="Pendiente" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart — Payment Status */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" /> Estado de Pagos
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                  {statusPie.map((s, i) => (
                    <div key={s.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs font-bold text-slate-500">{s.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-700">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campus Table */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" /> Campus de la Red
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="p-4 rounded-l-xl">Campus</th>
                      <th className="p-4 text-center">Alumnos</th>
                      <th className="p-4 text-right">Fondeo</th>
                      <th className="p-4 text-center rounded-r-xl">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campusData.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 font-bold text-sm text-slate-700">{c.name}</td>
                        <td className="p-5 text-center text-sm font-black text-slate-600">{c.students}</td>
                        <td className="p-5 text-right text-sm font-black text-emerald-600">{fmt(c.balance)}</td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" /> Actividad Reciente
              </h3>
              <div className="space-y-3">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{a.details}</p>
                      <p className="text-[10px] text-slate-400">{a.userName} • {a.timestamp}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${a.action.includes('create') ? 'bg-emerald-50 text-emerald-600' : a.action.includes('delete') ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {a.action.split('_')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== KPI Card Component =====
function KPICard({ label, value, icon, tone, sub }: { label: string; value: string | number; icon: React.ReactNode; tone: 'indigo' | 'violet' | 'emerald' | 'sky' | 'amber' | 'rose'; sub?: string }) {
  const toneClasses = {
    indigo: {
      card: 'border-indigo-100 ring-indigo-100/70',
      label: 'text-indigo-500',
      value: 'text-indigo-700',
      sub: 'text-indigo-500',
      icon: 'text-indigo-500'
    },
    violet: {
      card: 'border-violet-100 ring-violet-100/70',
      label: 'text-violet-500',
      value: 'text-violet-700',
      sub: 'text-violet-500',
      icon: 'text-violet-500'
    },
    emerald: {
      card: 'border-emerald-100 ring-emerald-100/70',
      label: 'text-emerald-500',
      value: 'text-emerald-700',
      sub: 'text-emerald-500',
      icon: 'text-emerald-500'
    },
    sky: {
      card: 'border-sky-100 ring-sky-100/70',
      label: 'text-sky-500',
      value: 'text-sky-700',
      sub: 'text-sky-500',
      icon: 'text-sky-500'
    },
    amber: {
      card: 'border-amber-100 ring-amber-100/70',
      label: 'text-amber-500',
      value: 'text-amber-700',
      sub: 'text-amber-500',
      icon: 'text-amber-500'
    },
    rose: {
      card: 'border-rose-100 ring-rose-100/70',
      label: 'text-rose-500',
      value: 'text-rose-700',
      sub: 'text-rose-500',
      icon: 'text-rose-500'
    }
  } as const;

  const cls = toneClasses[tone];

  return (
    <div className={`bg-white p-6 rounded-[32px] border ring-1 ring-inset ${cls.card}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] font-black uppercase tracking-[3px] ${cls.label}`}>{label}</p>
        <span className={cls.icon}>{icon}</span>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${cls.value}`}>{value}</p>
      {sub && <p className={`text-[10px] font-bold mt-1 ${cls.sub}`}>{sub}</p>}
    </div>
  );
}

export default SuperAdminDashboard;
