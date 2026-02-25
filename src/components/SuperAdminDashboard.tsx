/**
 * SuperAdminDashboard — Panel Ejecutivo de la Red MeCard
 * KPIs reales, gráficas, tabla de campus, actividad reciente
 */

import React, { useState, useMemo } from 'react';
import {
  Building2, Users, DollarSign, Zap, ShieldCheck, Landmark,
  TrendingUp, ArrowUpRight, Activity, AlertTriangle,
  GraduationCap, CreditCard, BarChart3, Globe, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { usePlatform } from '../contexts/PlatformContext';
import { SchoolManagement } from './SchoolManagement';
import { SchoolFeeService } from '../services/SchoolFeeService';
import { MOCK_STUDENTS_LIST, MOCK_TRANSACTIONS, MOCK_PARENT_PAYMENTS, MOCK_UNITS, MOCK_ACTIVITY_LOG } from '../constants';
import { ParentPaymentStatus } from '../types';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type Tab = 'hub' | 'infrastructure';

export const SuperAdminDashboard: React.FC = () => {
  const { schools } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('hub');

  const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v);

  // ===== Aggregate KPIs from real mock data =====
  const kpis = useMemo(() => {
    const totalStudents = MOCK_STUDENTS_LIST.length;
    const totalUnits = MOCK_UNITS.length;
    const totalBalance = schools.reduce((s, sc) => s + sc.balance, 0);
    const totalTransactions = MOCK_TRANSACTIONS.length;

    const paid = MOCK_PARENT_PAYMENTS.filter(p => p.status === ParentPaymentStatus.PAID);
    const totalCollected = paid.reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const pending = MOCK_PARENT_PAYMENTS.filter(p => p.status === ParentPaymentStatus.PENDING || p.status === ParentPaymentStatus.OVERDUE);
    const totalPending = pending.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0);
    const overdueCount = MOCK_PARENT_PAYMENTS.filter(p => p.status === ParentPaymentStatus.OVERDUE).length;

    const feeStats = SchoolFeeService.getStats('mx_01');

    return { totalStudents, totalUnits, totalBalance, totalTransactions, totalCollected, totalPending, overdueCount, feeStats };
  }, [schools]);

  // ===== Revenue by month chart =====
  const revenueByMonth = useMemo(() => {
    const months: Record<string, { month: string; cobrado: number; pendiente: number }> = {};
    MOCK_PARENT_PAYMENTS.forEach(p => {
      const m = p.dueDate.slice(0, 7);
      if (!months[m]) months[m] = { month: m, cobrado: 0, pendiente: 0 };
      if (p.status === ParentPaymentStatus.PAID) months[m].cobrado += p.paidAmount || p.amount;
      else months[m].pendiente += p.amount - (p.paidAmount || 0);
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  // ===== Campus table data =====
  const campusData = useMemo(() =>
    schools.map(s => ({
      id: s.id, name: s.name, students: MOCK_STUDENTS_LIST.filter(st => st.schoolId === s.id).length || Math.floor(Math.random() * 400 + 100),
      balance: s.balance, status: s.status,
    })),
  [schools]);

  // ===== Payment status pie =====
  const statusPie = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_PARENT_PAYMENTS.forEach(p => {
      const label = p.status === ParentPaymentStatus.PAID ? 'Pagado' : p.status === ParentPaymentStatus.PENDING ? 'Pendiente' : p.status === ParentPaymentStatus.OVERDUE ? 'Vencido' : 'Parcial';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  // ===== Activity log =====
  const recentActivity = useMemo(() => MOCK_ACTIVITY_LOG.slice(0, 8), []);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col overflow-hidden">
      {/* Tab header */}
      <div className="px-5 sm:px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">Red: Online</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
            </header>

            {/* KPI Grid — 2 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KPICard label="Campus" value={schools.length} icon={<Building2 size={18} />} color="indigo" />
              <KPICard label="Alumnos" value={kpis.totalStudents} icon={<GraduationCap size={18} />} color="purple" />
              <KPICard label="Fondeo Global" value={fmt(kpis.totalBalance)} icon={<Landmark size={18} />} color="emerald" />
              <KPICard label="Unidades Op." value={kpis.totalUnits} icon={<Building2 size={18} />} color="blue" />
              <KPICard label="Cobrado" value={fmt(kpis.totalCollected)} icon={<DollarSign size={18} />} color="emerald" sub="colegiaturas" />
              <KPICard label="Pendiente" value={fmt(kpis.totalPending)} icon={<CreditCard size={18} />} color="amber" />
              <KPICard label="Vencidos" value={kpis.overdueCount} icon={<AlertTriangle size={18} />} color="rose" sub="cobros atrasados" />
              <KPICard label="Tasa Cobranza" value={`${kpis.feeStats.collectionRate}%`} icon={<TrendingUp size={18} />} color="indigo" sub={kpis.feeStats.collectionRate >= 80 ? 'Saludable' : 'Atención'} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area chart — Revenue */}
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
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
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
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
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" /> Campus de la Red
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
                        <td className="p-4 font-bold text-sm text-slate-700">{c.name}</td>
                        <td className="p-4 text-center text-sm font-black text-slate-600">{c.students}</td>
                        <td className="p-4 text-right text-sm font-black text-emerald-600">{fmt(c.balance)}</td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">Activo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" /> Actividad Reciente
              </h3>
              <div className="space-y-3">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl">
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
function KPICard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className={`bg-white p-6 rounded-[32px] border border-${color}-100 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] font-black text-${color}-400 uppercase tracking-[3px]`}>{label}</p>
        <span className={`text-${color}-400`}>{icon}</span>
      </div>
      <p className={`text-2xl font-black text-${color}-600 tracking-tighter`}>{value}</p>
      {sub && <p className={`text-[10px] font-bold text-${color}-400 mt-1`}>{sub}</p>}
    </div>
  );
}

export default SuperAdminDashboard;
