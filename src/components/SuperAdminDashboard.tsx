
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

// ============================================
// TYPES & MOCKS
// ============================================

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
  { name: 'Alimentos', value: 45, color: '#6366f1' },
  { name: 'Bebidas', value: 25, color: '#8b5cf6' },
  { name: 'Snacks', value: 15, color: '#ec4899' },
  { name: 'Papelería', value: 10, color: '#f59e0b' },
  { name: 'Otros', value: 5, color: '#10b981' }
];

// ============================================
// SUB-COMPONENTS
// ============================================

const MetricCard = ({ title, value, change, icon, color = 'indigo', subtitle }: any) => {
  const colorClasses: any = {
    indigo: 'from-indigo-500 to-purple-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className={`h-1.5 bg-gradient-to-r ${colorClasses[color]}`} />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg ${colorClasses[color]}`}>
            {React.cloneElement(icon, { size: 24 })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SuperAdminDashboard: React.FC = () => {
  const { schools } = usePlatform();
  const [activeTab, setActiveTab] = useState<'hub' | 'infrastructure'>('hub');
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="h-full bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      {/* Super Sidebar Tab Switcher */}
      <div className="px-12 py-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-xl"><Zap size={20} className="text-white"/></div>
               <span className="font-black text-lg tracking-tighter italic uppercase">Master Hub</span>
            </div>
            <nav className="flex gap-4">
               <button onClick={() => setActiveTab('hub')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'hub' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>Estadísticas</button>
               <button onClick={() => setActiveTab('infrastructure')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'infrastructure' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>Infraestructura</button>
            </nav>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Status de Red: ONLINE</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'infrastructure' ? (
          <SchoolManagement />
        ) : (
          <div className="p-12 space-y-12 animate-in fade-in duration-700 pb-40">
             <header>
                <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Visibilidad Global</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[8px] mt-6">Red MeCard Network • 2025 Architecture</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard title="Campus Red" value={schools.length} icon={<Building2/>} color="indigo" subtitle="Total instituciones" />
                <MetricCard title="Fondeo Global" value={formatCurrency(schools.reduce((a,b)=>a+b.balance,0))} icon={<Landmark/>} color="green" subtitle="Capital en monederos" />
                <MetricCard title="Staff Activo" value="142" icon={<Users/>} color="blue" subtitle="Cajeros y gerentes" />
                <MetricCard title="SaaS Estimado" value={formatCurrency(456780)} icon={<ShieldCheck/>} color="orange" subtitle="Revenue plataforma" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm">
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Volumen Mensual</h2>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Venta Bruta</span></div>
                         <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full"></div><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mecard Fee</span></div>
                      </div>
                   </div>
                   <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={MOCK_REVENUE_DATA}>
                            <defs>
                              <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                            <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fill="url(#colRev)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                   <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><PieChart size={200}/></div>
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black italic tracking-tighter mb-10 text-indigo-400">Categorías Top</h3>
                      <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                               <Pie data={PRODUCT_DISTRIBUTION} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                  {PRODUCT_DISTRIBUTION.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                               </Pie>
                               <Tooltip />
                            </RechartsPie>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="space-y-4 pt-10 border-t border-white/5">
                      {PRODUCT_DISTRIBUTION.slice(0, 3).map(p => (
                        <div key={p.name} className="flex justify-between items-center px-2">
                           <span className="text-[10px] font-black uppercase text-slate-400">{p.name}</span>
                           <span className="font-black text-xl tracking-tighter">{p.value}%</span>
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
