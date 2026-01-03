
import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, ArrowUpRight, 
  ChefHat, Clock, AlertCircle, CheckCircle2, Landmark, BarChart3,
  Percent, Wallet, Receipt, LayoutDashboard, Package, UserPlus,
  Settings, Save, Plus
} from 'lucide-react';
import { OperatingUnit, School, SalesData, Product, Category, UserRole } from '../types';
import { MOCK_SCHOOLS, SALES_DATA, PRODUCTS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryManagementView } from './InventoryManagementView';
import { SmartStaffManager } from './SmartStaffManager';

interface ConcessionaireDashboardProps {
  unit: OperatingUnit;
}

export const ConcessionaireDashboard: React.FC<ConcessionaireDashboardProps> = ({ unit }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'staff' | 'config'>('sales');
  const [localInventory, setLocalInventory] = useState<Product[]>(PRODUCTS.filter(p => p.unitId === unit.id || p.unitId === 'unit_01'));
  
  const school = MOCK_SCHOOLS.find(s => s.id === unit.schoolId) || MOCK_SCHOOLS[0];
  const feePercent = school.businessModel.cafeteriaFeePercent;
  
  const totalSales = SALES_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const schoolCommission = totalSales * (feePercent / 100);
  const netProfit = totalSales - schoolCommission;

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] font-sans">
      {/* HEADER DINÁMICO */}
      <header className="p-10 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-orange-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-orange-100 rotate-3">
              <ChefHat size={40}/>
           </div>
           <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">{unit.name}</h1>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border border-orange-100">Concesionario</span>
              </div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px]">{school.name} • Manager: ID_MGR_01</p>
           </div>
        </div>

        <div className="flex bg-slate-50 p-2 rounded-[28px] border border-slate-100">
           <TabBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<LayoutDashboard size={18}/>} label="Ventas" />
           <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18}/>} label="Menú" />
           <TabBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users size={18}/>} label="Staff" />
           <TabBtn active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={18}/>} label="Ajustes" />
        </div>
      </header>

      {/* CONTENIDO SCROLLABLE */}
      <main className="flex-1 overflow-y-auto p-10 pb-32">
        {activeTab === 'sales' && (
          <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
             {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <KpiCard title="Venta Bruta" value={`$${totalSales.toLocaleString()}`} icon={<ShoppingBag/>} color="bg-indigo-600" />
              <KpiCard title={`Comisión (${feePercent}%)`} value={`$${schoolCommission.toLocaleString()}`} icon={<Percent/>} color="bg-rose-500" subtitle={school.businessModel.cafeteriaFeeAutoMarkup ? "Incluida en precio" : "Descuento directo"} />
              <KpiCard title="Utilidad Neta" value={`$${netProfit.toLocaleString()}`} icon={<Wallet/>} color="bg-emerald-500" trend="+12% mensual" />
              <KpiCard title="Tickets Hoy" value="48" icon={<Receipt/>} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3"><BarChart3 className="text-indigo-600"/> Rendimiento Semanal</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-indigo-900 rounded-[48px] p-10 text-white shadow-xl flex flex-col justify-center">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Próxima Liquidación</h4>
                 <p className="text-4xl font-black tracking-tighter mb-4">${netProfit.toLocaleString()}</p>
                 <p className="text-sm text-indigo-200 leading-relaxed mb-8">Pago programado para el Viernes 27 de Octubre vía transferencia SPEI.</p>
                 <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest">Solicitar Adelanto</button>
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
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm animate-in zoom-in duration-500">
             <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-10">Configuración del Punto</h3>
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Horario de Atención</label>
                   <div className="grid grid-cols-2 gap-4">
                      <input type="time" defaultValue="07:00" className="p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-700 outline-none" />
                      <input type="time" defaultValue="16:00" className="p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-700 outline-none" />
                   </div>
                </div>
                <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px] flex gap-6">
                   <AlertCircle className="text-amber-600 shrink-0" size={24}/>
                   <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase">Nota: Los cambios en el porcentaje de comisión deben ser autorizados por el Administrador del Colegio desde el Panel Maestro.</p>
                </div>
                <button className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"><Save size={18}/> Guardar Preferencias</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} <span>{label}</span>
  </button>
);

const KpiCard = ({ title, value, icon, color, subtitle, trend }: any) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
    {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-2">{subtitle}</p>}
    {trend && <p className="text-[10px] font-black text-emerald-500 mt-2 uppercase tracking-widest">{trend}</p>}
  </div>
);
