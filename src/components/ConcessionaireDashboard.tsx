
import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, ArrowUpRight, 
  ChefHat, Clock, AlertCircle, CheckCircle2, Landmark, BarChart3,
  Percent, Wallet, Receipt, LayoutDashboard, Package, UserPlus,
  Settings, Save, Plus
} from 'lucide-react';
import { OperatingUnit, School, SalesData, Product, Category, UserRole } from '../types';
import { MOCK_SCHOOLS, MOCK_UNITS, SALES_DATA, PRODUCTS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryManagementView } from './InventoryManagementView';
import { SmartStaffManager } from './SmartStaffManager';

interface ConcessionaireDashboardProps {
  unit?: OperatingUnit;
}

export const ConcessionaireDashboard: React.FC<ConcessionaireDashboardProps> = ({ unit: unitProp }) => {
  const unit = unitProp || MOCK_UNITS[0];
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'staff' | 'config'>('sales');
  const [localInventory, setLocalInventory] = useState<Product[]>(PRODUCTS.filter(p => p.unitId === unit.id || p.unitId === 'unit_01'));
  
  const school = MOCK_SCHOOLS.find(s => s.id === unit.schoolId) || MOCK_SCHOOLS[0];
  const feePercent = school.businessModel.cafeteriaFeePercent;
  
  const totalSales = SALES_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const schoolCommission = totalSales * (feePercent / 100);
  const netProfit = totalSales - schoolCommission;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-sm">
              <ChefHat size={26}/>
           </div>
           <div>
              <div className="flex items-center gap-3 mb-0.5">
                <h1 className="text-2xl font-black text-slate-800 tracking-tighter">{unit.name}</h1>
                <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100">Concesionario</span>
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{school.name} · Manager: ID_MGR_01</p>
           </div>
        </div>

        <div className="flex bg-slate-100/60 p-1.5 rounded-2xl" role="tablist">
           <TabBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<LayoutDashboard size={14}/>} label="Ventas" />
           <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={14}/>} label="Menú" />
           <TabBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users size={14}/>} label="Staff" />
           <TabBtn active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={14}/>} label="Ajustes" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 pb-24">
        {activeTab === 'sales' && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
             {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="Venta Bruta" value={`$${totalSales.toLocaleString()}`} icon={<ShoppingBag/>} color="bg-indigo-600" />
              <KpiCard title={`Comisión (${feePercent}%)`} value={`$${schoolCommission.toLocaleString()}`} icon={<Percent/>} color="bg-rose-500" subtitle={school.businessModel.cafeteriaFeeAutoMarkup ? "Incluida en precio" : "Descuento directo"} />
              <KpiCard title="Utilidad Neta" value={`$${netProfit.toLocaleString()}`} icon={<Wallet/>} color="bg-emerald-500" trend="+12% mensual" />
              <KpiCard title="Tickets Hoy" value="48" icon={<Receipt/>} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 tracking-tighter mb-8 flex items-center gap-2"><BarChart3 className="text-indigo-500" size={20}/> Rendimiento Semanal</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.06)'}} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-sm flex flex-col justify-center">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Próxima Liquidación</h4>
                 <p className="text-4xl font-black tracking-tighter mb-3">${netProfit.toLocaleString()}</p>
                 <p className="text-sm text-slate-400 leading-relaxed mb-8">Pago programado para el Viernes 27 de Octubre vía transferencia SPEI.</p>
                 <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Solicitar Adelanto</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="max-w-7xl mx-auto h-full animate-in slide-in-from-bottom-6 duration-500">
             <InventoryManagementView 
                products={localInventory} 
                onUpdateProducts={setLocalInventory} 
                allowedCategories={[Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS]}
                entityName={unit.name}
             />
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-6 duration-500">
             <SmartStaffManager 
                currentUserRole={UserRole.UNIT_MANAGER} 
                operatingUnits={[unit]} 
             />
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-3xl mx-auto bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm animate-in fade-in duration-300">
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">Configuración del Punto</h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horario de Atención</label>
                   <div className="grid grid-cols-2 gap-4">
                      <input type="time" defaultValue="07:00" className="p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all" />
                      <input type="time" defaultValue="16:00" className="p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all" />
                   </div>
                </div>
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex gap-3">
                   <AlertCircle className="text-amber-600 shrink-0" size={18}/>
                   <p className="text-xs font-bold text-amber-800 leading-relaxed">Los cambios en el porcentaje de comisión deben ser autorizados por el Administrador del Colegio desde el Panel Maestro.</p>
                </div>
                <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Save size={16}/> Guardar Preferencias</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabBtn: React.FC<TabBtnProps> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} role="tab" aria-selected={active} className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'}`}>
    {icon} <span>{label}</span>
  </button>
);

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactElement<{ size?: number }>;
  color: string;
  subtitle?: string;
  trend?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, subtitle, trend }) => (
  <div className="bg-white p-6 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-105 transition-transform`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{value}</h3>
    {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-2">{subtitle}</p>}
    {trend && <p className="text-[10px] font-black text-emerald-500 mt-2">{trend}</p>}
  </div>
);
export default ConcessionaireDashboard;
