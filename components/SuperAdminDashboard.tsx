
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Building2, DollarSign, 
  Activity, ArrowUpRight, ArrowDownRight, Calendar, AlertCircle,
  CheckCircle, Clock, Package, CreditCard, BarChart3, PieChart,
  Globe, Zap, RefreshCw, Download, Filter, Eye, ChevronRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// ============================================
// TYPES
// ============================================

interface School {
  id: string;
  name: string;
  studentsCount: number;
  revenue: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  growth: number;
  lastSettlement: Date;
}

interface DashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  platformRevenue: number;
  averageTicket: number;
  transactionsToday: number;
  transactionsMonth: number;
  growth: {
    schools: number;
    students: number;
    revenue: number;
  };
}

interface RevenueData {
  month: string;
  revenue: number;
  platformFee: number;
  transactions: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_METRICS: DashboardMetrics = {
  totalSchools: 47,
  activeSchools: 43,
  totalStudents: 28450,
  activeStudents: 26890,
  totalRevenue: 4567890,
  monthlyRevenue: 456780,
  platformRevenue: 137034,
  averageTicket: 145.50,
  transactionsToday: 1247,
  transactionsMonth: 31420,
  growth: {
    schools: 12.5,
    students: 8.3,
    revenue: 23.7
  }
};

const MOCK_REVENUE_DATA: RevenueData[] = [
  { month: 'Jul', revenue: 320000, platformFee: 96000, transactions: 2200 },
  { month: 'Ago', revenue: 385000, platformFee: 115500, transactions: 2650 },
  { month: 'Sep', revenue: 412000, platformFee: 123600, transactions: 2830 },
  { month: 'Oct', revenue: 445000, platformFee: 133500, transactions: 3060 },
  { month: 'Nov', revenue: 398000, platformFee: 119400, transactions: 2740 },
  { month: 'Dic', revenue: 523000, platformFee: 156900, transactions: 3600 },
  { month: 'Ene', revenue: 456780, platformFee: 137034, transactions: 3142 }
];

const MOCK_TOP_SCHOOLS: School[] = [
  { id: 'mx_01', name: 'Colegio Madison', studentsCount: 1234, revenue: 85420, status: 'ACTIVE', growth: 15.2, lastSettlement: new Date('2026-01-10') },
  { id: 'mx_02', name: 'Instituto Tecnológico', studentsCount: 987, revenue: 72350, status: 'ACTIVE', growth: 8.7, lastSettlement: new Date('2026-01-10') },
  { id: 'mx_03', name: 'Escuela Benito Juárez', studentsCount: 856, revenue: 65280, status: 'ACTIVE', growth: 12.4, lastSettlement: new Date('2026-01-09') },
  { id: 'mx_04', name: 'Colegio Americano', studentsCount: 1450, revenue: 98760, status: 'ACTIVE', growth: 22.1, lastSettlement: new Date('2026-01-10') },
  { id: 'mx_05', name: 'Instituto Victoria', studentsCount: 654, revenue: 48920, status: 'ACTIVE', growth: -3.2, lastSettlement: new Date('2026-01-08') },
  { id: 'mx_06', name: 'Colegio Simón Bolívar', studentsCount: 923, revenue: 67450, status: 'ACTIVE', growth: 18.9, lastSettlement: new Date('2026-01-10') },
  { id: 'mx_07', name: 'Escuela Montessori', studentsCount: 432, revenue: 35670, status: 'ACTIVE', growth: 6.5, lastSettlement: new Date('2026-01-09') },
  { id: 'mx_08', name: 'Instituto Cambridge', studentsCount: 1123, revenue: 82340, status: 'ACTIVE', growth: 14.8, lastSettlement: new Date('2026-01-10') },
  { id: 'mx_09', name: 'Colegio Internacional', studentsCount: 789, revenue: 58920, status: 'ACTIVE', growth: 9.3, lastSettlement: new Date('2026-01-09') },
  { id: 'mx_10', name: 'Escuela del Valle', studentsCount: 567, revenue: 42180, status: 'PENDING', growth: 0, lastSettlement: new Date('2026-01-07') }
];

const MOCK_ALERTS: Alert[] = [
  { id: '1', type: 'warning', title: 'Saldo Bajo', message: '3 escuelas con saldo inferior a $5,000', timestamp: new Date('2026-01-11T14:30:00') },
  { id: '2', type: 'info', title: 'Nuevo Registro', message: 'Escuela "Instituto Hidalgo" completó onboarding', timestamp: new Date('2026-01-11T12:15:00') },
  { id: '3', type: 'error', title: 'Fallo en Settlement', message: 'Error al transferir a Colegio del Valle (mx_10)', timestamp: new Date('2026-01-11T10:45:00') },
  { id: '4', type: 'success', title: 'Meta Alcanzada', message: 'Revenue mensual superó los $450K MXN', timestamp: new Date('2026-01-11T09:00:00') }
];

const PRODUCT_DISTRIBUTION = [
  { name: 'Alimentos', value: 45, color: '#6366f1' },
  { name: 'Bebidas', value: 25, color: '#8b5cf6' },
  { name: 'Snacks', value: 15, color: '#ec4899' },
  { name: 'Papelería', value: 10, color: '#f59e0b' },
  { name: 'Otros', value: 5, color: '#10b981' }
];

// ============================================
// COMPONENTS
// ============================================

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  subtitle,
  color = 'indigo'
}) => {
  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`h-2 bg-gradient-to-r ${colorClasses[color] || colorClasses.indigo}`} />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{value}</p>
            {subtitle && (
              <p className="text-xs font-bold text-slate-400">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-3">
                <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                  trend === 'down' ? 'bg-rose-50 text-rose-600' : 
                  'bg-slate-50 text-slate-600'
                }`}>
                    {trend === 'up' && <ArrowUpRight size={12} className="mr-1" />}
                    {trend === 'down' && <ArrowDownRight size={12} className="mr-1" />}
                    {change > 0 ? '+' : ''}{change}%
                </div>
                <span className="text-[9px] font-bold text-slate-400 ml-1">vs mes anterior</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg ${colorClasses[color] || colorClasses.indigo}`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertBadge: React.FC<{ alert: Alert }> = ({ alert }) => {
  const typeConfig = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: AlertCircle },
    error: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: AlertCircle },
    info: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: Clock },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: CheckCircle }
  };

  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-3xl border ${config.bg} ${config.border} hover:scale-[1.02] transition-transform cursor-pointer`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-xl bg-white/50 shadow-sm`}>
            <Icon className={config.text} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-black uppercase text-[10px] tracking-widest ${config.text}`}>{alert.title}</h4>
          <p className="text-sm font-bold text-slate-600 mt-1 leading-tight">{alert.message}</p>
          <p className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-wider">
            {alert.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {alert.timestamp.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SuperAdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const metrics = MOCK_METRICS;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  return (
    <div className="h-full bg-[#f8fafc] overflow-y-auto p-12 font-sans pb-40">
      {/* Header Premium */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">MeCard Network Operations</p>
          <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none flex items-center gap-4">
            <Globe size={64} className="text-indigo-600" />
            Super Hub
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[4px] mt-4 flex items-center gap-2">
            Vista Global de Infraestructura • 47 Campus Activos
          </p>
        </div>
        <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
            >
              <option value="7d">7 días</option>
              <option value="30d">30 días</option>
              <option value="90d">90 días</option>
              <option value="1y">1 año</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm group"
            >
              <RefreshCw size={24} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
            <button className="bg-indigo-600 px-8 py-4 rounded-[24px] text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group">
              <Download size={18} className="group-hover:translate-y-0.5 transition-transform"/> Exportar Red
            </button>
        </div>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <MetricCard
          title="Escuelas Activas"
          value={metrics.activeSchools}
          change={metrics.growth.schools}
          trend="up"
          icon={<Building2 size={32} />}
          subtitle={`de ${metrics.totalSchools} contratadas`}
          color="indigo"
        />
        <MetricCard
          title="Estudiantes Red"
          value={formatNumber(metrics.activeStudents)}
          change={metrics.growth.students}
          trend="up"
          icon={<Users size={32} />}
          subtitle={`Total alumnos: ${formatNumber(metrics.totalStudents)}`}
          color="green"
        />
        <MetricCard
          title="Revenue Global"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.growth.revenue}
          trend="up"
          icon={<DollarSign size={32} />}
          subtitle={`${formatCurrency(metrics.monthlyRevenue)} este mes`}
          color="blue"
        />
        <MetricCard
          title="Platform Share"
          value={formatCurrency(metrics.platformRevenue)}
          change={15.2}
          trend="up"
          icon={<TrendingUp size={32} />}
          subtitle={`${((metrics.platformRevenue / metrics.monthlyRevenue) * 100).toFixed(1)}% de comisión total`}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Histórico de Ingresos</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Distribución Mensual Red vs MeCard Fee</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee MeCard</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="platformFee" 
                  stroke="#c084fc" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPlatform)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Distribution Pie */}
        <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Activity size={180}/></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black italic tracking-tighter mb-8 text-indigo-400">Categorías Top</h2>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                    <Pie
                        data={PRODUCT_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                    >
                        {PRODUCT_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', color: '#1e293b' }} />
                    </RechartsPie>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-8 space-y-4 relative z-10">
            {PRODUCT_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-lg shadow-indigo-500/20" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.name}</span>
                </div>
                <span className="font-black text-xl tracking-tighter text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Top Schools Table */}
        <div className="lg:col-span-2 bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Campus Líderes</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Clasificación por volumen de transacciones</p>
            </div>
            <button className="flex items-center gap-2 p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
                <Filter size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Escuela</th>
                  <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumnos</th>
                  <th className="text-right py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Crecimiento</th>
                  <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_TOP_SCHOOLS.map((school, index) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg shadow-inner group-hover:bg-white transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg tracking-tight">{school.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{school.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className="font-black text-slate-700">{formatNumber(school.studentsCount)}</span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <span className="font-black text-slate-800 text-lg tracking-tighter">{formatCurrency(school.revenue)}</span>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                        school.growth > 0 ? 'bg-emerald-50 text-emerald-600' : 
                        school.growth < 0 ? 'bg-rose-50 text-rose-600' : 
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {school.growth > 0 ? <ArrowUpRight size={14} /> : 
                         school.growth < 0 ? <ArrowDownRight size={14} /> : null}
                        {school.growth > 0 ? '+' : ''}{school.growth}%
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`inline-block px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                        school.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        school.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {school.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Bento Sidebar */}
        <div className="space-y-8">
            <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm h-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Alertas de Red</h2>
                    <Zap size={24} className="text-amber-500 fill-amber-500 animate-pulse" />
                </div>
                <div className="space-y-6">
                    {MOCK_ALERTS.map((alert) => (
                    <AlertBadge key={alert.id} alert={alert} />
                    ))}
                </div>
                <button className="w-full mt-10 py-5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-[4px] rounded-3xl transition-all flex items-center justify-center gap-3">
                    Historial Completo <ChevronRight size={16}/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
