
import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, Building2, DollarSign,
  Activity, ArrowUpRight, ArrowDownRight, Calendar, AlertCircle,
  CheckCircle, Clock, Package, CreditCard, BarChart3, PieChart,
  Globe, Zap, RefreshCw, Download, Filter, Eye, ChevronRight,
  Database, ShieldCheck, Landmark
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { usePlatform } from '../contexts/PlatformContext';
import { SchoolManagement } from './SchoolManagement';

// =============================================
// MOCK DATA
// =============================================

const MOCK_REVENUE_DATA = [
  { month: 'Jul', revenue: 320000, platformFee: 96000 },
  { month: 'Ago', revenue: 385000, platformFee: 115500 },
  { month: 'Sep', revenue: 412000, platformFee: 123600 },
  { month: 'Oct', revenue: 445000, platformFee: 133500 },
  { month: 'Nov', revenue: 398000, platformFee: 119400 },
  { month: 'Dic', revenue: 523000, platformFee: 156900 },
  { month: 'Ene', revenue: 456780, platformFee: 137034 }
];

const PRODUCT_DISTRIBUTION = [
  { name: 'Alimentos', value: 45, color: '#3b93ff' },
  { name: 'Bebidas', value: 25, color: '#8b5cf6' },
  { name: 'Snacks', value: 15, color: '#ec4899' },
  { name: 'Papelería', value: 10, color: '#f59e0b' },
  { name: 'Otros', value: 5, color: '#10b981' }
];

// =============================================
// METRIC CARD
// =============================================

type MetricColor = 'brand' | 'trust' | 'blue' | 'warm';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement;
  color?: MetricColor;
  subtitle?: string;
}

const metricColors: Record<MetricColor, { gradient: string; bg: string }> = {
  brand: { gradient: 'from-brand-500 to-purple-600', bg: 'bg-brand-50' },
  trust: { gradient: 'from-trust-500 to-emerald-600', bg: 'bg-trust-50' },
  blue:  { gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50' },
  warm:  { gradient: 'from-warm-500 to-red-500', bg: 'bg-warm-50' },
};

function MetricCard({ title, value, icon, color = 'brand', subtitle }: MetricCardProps) {
  const c = metricColors[color];
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-surface-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 bg-gradient-to-r ${c.gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5 truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-surface-800 tracking-tight mb-1 truncate">{value}</p>
            {subtitle && <p className="text-xs text-surface-400 truncate">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br text-white shadow-sm shrink-0 ml-3 ${c.gradient}`}>
            {React.cloneElement(icon, { size: 20 })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================

export const SuperAdminDashboard: React.FC = () => {
  const { schools } = usePlatform();
  const [activeTab, setActiveTab] = useState<'hub' | 'infrastructure'>('hub');

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="h-full bg-surface-50 flex flex-col overflow-hidden">
      {/* Tab header */}
      <div className="px-5 sm:px-8 py-4 bg-white border-b border-surface-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-1.5 rounded-lg"><Zap size={16} className="text-white" /></div>
            <span className="font-bold text-sm tracking-tight">Master Hub</span>
          </div>
          <nav className="flex gap-1" role="tablist">
            {(['hub', 'infrastructure'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${activeTab === tab ? 'bg-brand-50 text-brand-600' : 'text-surface-400 hover:bg-surface-50'}`}
              >
                {tab === 'hub' ? 'Estadísticas' : 'Infraestructura'}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Red: Online</span>
          <div className="w-2 h-2 bg-trust-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'infrastructure' ? (
          <SchoolManagement />
        ) : (
          <div className="p-5 sm:p-8 space-y-6 animate-fade-in-up pb-24 max-w-7xl mx-auto">
            <header>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-800 tracking-tight">Visibilidad Global</h1>
              <p className="text-surface-400 text-sm mt-1">Red MeCard Network — Panel ejecutivo</p>
            </header>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Campus Red" value={schools.length} icon={<Building2 />} color="brand" subtitle="Total instituciones" />
              <MetricCard title="Fondeo Global" value={formatCurrency(schools.reduce((a, b) => a + b.balance, 0))} icon={<Landmark />} color="trust" subtitle="Capital en monederos" />
              <MetricCard title="Staff Activo" value="142" icon={<Users />} color="blue" subtitle="Cajeros y gerentes" />
              <MetricCard title="SaaS Estimado" value={formatCurrency(456780)} icon={<ShieldCheck />} color="warm" subtitle="Revenue plataforma" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-surface-100 shadow-xs">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                  <h2 className="text-xl font-bold text-surface-800">Volumen Mensual</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-500 rounded-full" /><span className="text-[10px] font-medium text-surface-400">Venta Bruta</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-purple-400 rounded-full" /><span className="text-[10px] font-medium text-surface-400">MeCard Fee</span></div>
                  </div>
                </div>
                <div className="h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b93ff" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b93ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b93ff" strokeWidth={2.5} fill="url(#colRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category pie */}
              <div className="bg-surface-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-6 opacity-5"><PieChart size={120} /></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-brand-300 mb-4">Categorías Top</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={PRODUCT_DISTRIBUTION} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                          {PRODUCT_DISTRIBUTION.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  {PRODUCT_DISTRIBUTION.slice(0, 3).map(p => (
                    <div key={p.name} className="flex justify-between items-center">
                      <span className="text-xs text-surface-400">{p.name}</span>
                      <span className="font-bold text-base">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SuperAdminDashboard;
