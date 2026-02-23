
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
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Header */}
      <header className="px-6 py-5 bg-white border-b border-surface-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-warm-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <ChefHat size={24}/>
           </div>
           <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-surface-800">{unit.name}</h1>
                <span className="bg-warm-50 text-warm-600 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border border-warm-100">Concesionario</span>
              </div>
              <p className="text-surface-400 font-medium text-xs">{school.name} · Manager: ID_MGR_01</p>
           </div>
        </div>

        <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-100" role="tablist">
           <TabBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<LayoutDashboard size={16}/>} label="Ventas" />
           <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={16}/>} label="Menú" />
           <TabBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users size={16}/>} label="Staff" />
           <TabBtn active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={16}/>} label="Ajustes" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-24">
        {activeTab === 'sales' && (
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
             {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Venta Bruta" value={`$${totalSales.toLocaleString()}`} icon={<ShoppingBag/>} color="bg-brand-500" />
              <KpiCard title={`Comisión (${feePercent}%)`} value={`$${schoolCommission.toLocaleString()}`} icon={<Percent/>} color="bg-danger-500" subtitle={school.businessModel.cafeteriaFeeAutoMarkup ? "Incluida en precio" : "Descuento directo"} />
              <KpiCard title="Utilidad Neta" value={`$${netProfit.toLocaleString()}`} icon={<Wallet/>} color="bg-trust-500" trend="+12% mensual" />
              <KpiCard title="Tickets Hoy" value="48" icon={<Receipt/>} color="bg-warm-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-surface-100 shadow-xs">
                <h3 className="text-base font-bold text-surface-800 mb-6 flex items-center gap-2"><BarChart3 className="text-brand-500" size={18}/> Rendimiento Semanal</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)'}} />
                      <Bar dataKey="revenue" fill="#3b93ff" radius={[8, 8, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-surface-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-center">
                 <h4 className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-4">Próxima Liquidación</h4>
                 <p className="text-3xl font-extrabold tracking-tight mb-3">${netProfit.toLocaleString()}</p>
                 <p className="text-sm text-surface-400 leading-relaxed mb-6">Pago programado para el Viernes 27 de Octubre vía transferencia SPEI.</p>
                 <button className="w-full py-3.5 bg-white text-surface-900 rounded-xl font-semibold text-xs">Solicitar Adelanto</button>
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
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-surface-100 shadow-xs animate-fade-in">
             <h3 className="text-xl font-bold text-surface-800 mb-6">Configuración del Punto</h3>
             <div className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">Horario de Atención</label>
                   <div className="grid grid-cols-2 gap-3">
                      <input type="time" defaultValue="07:00" className="p-3.5 bg-surface-50 rounded-xl border border-surface-200 font-medium text-surface-700 focus:ring-2 focus:ring-brand-100 focus:border-brand-300" />
                      <input type="time" defaultValue="16:00" className="p-3.5 bg-surface-50 rounded-xl border border-surface-200 font-medium text-surface-700 focus:ring-2 focus:ring-brand-100 focus:border-brand-300" />
                   </div>
                </div>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl flex gap-3">
                   <AlertCircle className="text-warning-600 shrink-0" size={18}/>
                   <p className="text-xs font-medium text-warning-800 leading-relaxed">Los cambios en el porcentaje de comisión deben ser autorizados por el Administrador del Colegio desde el Panel Maestro.</p>
                </div>
                <button className="w-full py-3.5 bg-surface-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-800 transition-colors"><Save size={16}/> Guardar Preferencias</button>
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
  <button onClick={onClick} role="tab" aria-selected={active} className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold text-xs ${active ? 'bg-brand-500 text-white shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}>
    {icon} <span>{label}</span>
  </button>
);

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  color: string;
  subtitle?: string;
  trend?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, subtitle, trend }) => (
  <div className="bg-white p-5 rounded-2xl shadow-xs border border-surface-100 hover:shadow-sm transition-all group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-extrabold text-surface-800 tracking-tight">{value}</h3>
    {subtitle && <p className="text-xs text-surface-400 mt-1.5">{subtitle}</p>}
    {trend && <p className="text-xs font-semibold text-trust-500 mt-1.5">{trend}</p>}
  </div>
);
export default ConcessionaireDashboard;
