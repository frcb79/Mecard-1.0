
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Utensils, Plus, Wallet, Search, Filter, 
  ShieldCheck, Upload, X, Landmark, HeartPulse,
  ChefHat, PenTool, LayoutGrid, CheckCircle2, MoreVertical,
  Activity, PieChart, Store, ArrowUpRight, TrendingUp, Truck, ShoppingCart
} from 'lucide-react';
import { StudentProfile, OperatingUnit, EntityOwner, Supplier } from '../types';
import { Button } from './Button';
import { SchoolAdminStudentsView } from './SchoolAdminStudentsView';
import SupplierManagementView from './SupplierManagementView';
import PurchaseOrderView from './PurchaseOrderView';
import { getSuppliers } from '../services/supplierService';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex items-center space-x-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
    <div className={`p-6 rounded-[32px] ${color} bg-opacity-10 text-white flex items-center justify-center transition-transform group-hover:scale-110`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2">{title}</p>
      <h3 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-3">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">{trend}</span>
        </div>
      )}
    </div>
  </div>
);

export const SchoolAdminView: React.FC<{
  onUpdateStudent: (id: string, data: Partial<StudentProfile>) => void;
  allStudents: StudentProfile[];
  onBulkAddStudents: (newStudents: StudentProfile[]) => void;
  operatingUnits: OperatingUnit[];
  onAddUnit: (unit: OperatingUnit) => void;
  onUpdateUnit: (id: string, updates: Partial<OperatingUnit>) => void;
  onDeleteUnit: (id: string) => void;
}> = ({ onUpdateStudent, allStudents, onBulkAddStudents, operatingUnits, onAddUnit, onUpdateUnit, onDeleteUnit }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'units' | 'suppliers' | 'purchase_orders'>('dashboard');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const schoolId = "mx_01"; // Hardcoded for now
  const userId = "user_123"; // Hardcoded for now

  useEffect(() => {
    if (activeTab === 'purchase_orders' || activeTab === 'suppliers') {
      getSuppliers(schoolId).then(setSuppliers).catch(console.error);
    }
  }, [activeTab, schoolId]);

  const handleDeleteStudent = (id: string) => {
      // Logic handled via parent state usually, simulation here
      alert(`Eliminando alumno ${id}`);
  };

  const handleToggleStudent = (id: string) => {
      const student = allStudents.find(s => s.id === id);
      if (student) {
          onUpdateStudent(id, { status: student.status === 'Active' ? 'Inactive' : 'Active' });
      }
  };

  return (
    <div className="p-12 h-full overflow-y-auto bg-[#f8fafc] font-sans">
        <header className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="text-indigo-500 font-black uppercase text-[11px] tracking-[6px] mb-4">Master Control Panel</p>
                <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">Gestión Institucional</h1>
            </div>
            
            <div className="flex bg-white p-2.5 rounded-[32px] shadow-sm border border-slate-100 relative z-10 animate-in slide-in-from-right-4 duration-500">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={18}/>} label="Dashboard" />
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18}/>} label="Directorio" />
                <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<Store size={18}/>} label="Unidades POS" />
                <TabButton active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Truck size={18}/>} label="Proveedores" />
                <TabButton active={activeTab === 'purchase_orders'} onClick={() => setActiveTab('purchase_orders')} icon={<ShoppingCart size={18}/>} label="Órdenes de Compra" />
            </div>
        </header>

        <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Master KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard title="Población Red" value={allStudents.length} icon={Users} color="bg-indigo-600" trend="+12 Alumnos" />
                  <StatCard title="Saldo en Red" value={`$${(allStudents.reduce((a,b)=>a+b.balance,0)).toLocaleString()}`} icon={Landmark} color="bg-emerald-500" trend="Capital Escolar" />
                  <StatCard title="Ventas Hoy" value="$14,250" icon={Activity} color="bg-orange-600" trend="78 Operaciones" />
                  <StatCard title="Salud Estudiantil" value={allStudents.filter(s=>s.allergies.length>0).length} icon={HeartPulse} color="bg-rose-500" subtitle="Alumnos con Alergias" />
                </div>

                {/* Second Row: Units Status and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 text-slate-50 opacity-10"><PieChart size={200}/></div>
                      <h3 className="text-2xl font-black text-slate-800 mb-10 tracking-tight flex items-center gap-4"><TrendingUp className="text-indigo-600"/> Rendimiento por Unidad</h3>
                      <div className="space-y-6 relative z-10">
                         {operatingUnits.map(unit => (
                           <div key={unit.id} className="flex items-center justify-between p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">{unit.type === 'CAFETERIA' ? <ChefHat size={32}/> : <PenTool size={32}/>}</div>
                                <div>
                                   <p className="font-black text-slate-800 text-xl tracking-tight">{unit.name}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{unit.type} • {unit.ownerType}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-800 text-2xl tracking-tighter">$8,240.00</p>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Activa Hoy</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-indigo-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[4px] mb-6">Próxima Liquidación</p>
                        <h4 className="text-4xl font-black tracking-tighter mb-4 leading-none">Recuperación de Comisiones</h4>
                        <p className="text-indigo-200 text-lg font-medium leading-relaxed opacity-80">El próximo viernes se liquidarán las rentas y comisiones de los concesionarios activos.</p>
                      </div>
                      <div className="pt-10 border-t border-white/10 mt-10">
                        <div className="flex justify-between items-end">
                            <div><p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">Monto Estimado</p><p className="text-5xl font-black tracking-tighter">$24,150.00</p></div>
                            <button className="p-5 bg-white text-indigo-900 rounded-3xl shadow-xl hover:scale-110 transition-all"><ArrowUpRight size={28}/></button>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <SchoolAdminStudentsView 
                schoolId="mx_01"
                students={allStudents}
                onUpdateStudent={onUpdateStudent}
                onAddStudent={(s) => onBulkAddStudents([s])}
                onDeleteStudent={handleDeleteStudent}
                onToggleStatus={handleToggleStudent}
              />
            )}
            
            {activeTab === 'suppliers' && (
              <SupplierManagementView schoolId="mx_01" />
            )}

            {activeTab === 'purchase_orders' && (
              <PurchaseOrderView 
                schoolId={schoolId}
                suppliers={suppliers}
                operatingUnits={operatingUnits}
                userId={userId}
              />
            )}

            {activeTab === 'units' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in duration-500">
                {operatingUnits.map(unit => (
                   <div key={unit.id} className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-2xl transition-all">
                      <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all mb-8 shadow-inner">{unit.type === 'CAFETERIA' ? <ChefHat size={48}/> : <PenTool size={48}/>}</div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{unit.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{unit.type} • {unit.ownerType}</p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-slate-50">
                        <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cajeros</p><p className="font-black text-slate-800 text-lg">2 Activos</p></div>
                        <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><span className="text-emerald-500 font-black text-[9px] uppercase tracking-widest flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Online</span></div>
                      </div>

                      <button className="mt-10 w-full py-5 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-[2px] hover:bg-indigo-50 hover:text-indigo-600 transition-all">Gestionar Terminales</button>
                   </div>
                ))}
                
                <div className="border-4 border-dashed border-slate-200 rounded-[56px] p-12 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 hover:border-indigo-400 cursor-pointer transition-all group">
                   <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-indigo-600 mb-6 transition-all"><Plus size={40}/></div>
                   <p className="font-black text-slate-800 text-xl tracking-tight">Nueva Unidad</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Cafetería o Papelería</p>
                </div>
              </div>
            )}
        </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-10 py-4 rounded-[22px] flex items-center gap-3 transition-all font-black text-[11px] uppercase tracking-[3px] ${active ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
  >
    {icon} <span>{label}</span>
  </button>
);
