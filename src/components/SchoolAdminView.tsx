import React, { useState, useMemo } from 'react';
import { 
  Users, Utensils, Plus, Wallet, Search, Filter, 
  ShieldCheck, Upload, X, Landmark, HeartPulse,
  ChefHat, PenTool, LayoutGrid, CheckCircle2, MoreVertical,
  Activity, PieChart, Store, ArrowUpRight, TrendingUp, AlertTriangle
} from 'lucide-react';
import { StudentProfile, OperatingUnit, EntityOwner, TransactionType, UserStatus } from '../types';
import { Button } from './Button';
import { SchoolAdminStudentsView } from './SchoolAdminStudentsView';
import { useToast } from './ui/Toast';
import { MOCK_STUDENT_TRANSACTIONS } from '../constants';

interface StatCardProps { title: string; value: string | number; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; trend?: string; subtitle?: string; }
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 flex items-center space-x-5 transition-all duration-300">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white flex items-center justify-center`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1">{title}</p>
      <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-2">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">{trend}</span>
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
  onReloadWallet: (studentId: string, amount: number, reason: string) => Promise<{ ok: boolean; message: string }>;
}> = ({ onUpdateStudent, allStudents, onBulkAddStudents, operatingUnits, onAddUnit, onUpdateUnit, onDeleteUnit, onReloadWallet }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'units'>('dashboard');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState<'CAFETERIA' | 'STATIONERY'>('CAFETERIA');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Dynamic KPIs — computed from all available mock transactions
  const allTransactions = MOCK_STUDENT_TRANSACTIONS;
  const purchaseTransactions = allTransactions.filter(t => t.type === TransactionType.PURCHASE);
  const totalSales = purchaseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
  const avgTicket = purchaseTransactions.length > 0 ? totalSales / purchaseTransactions.length : 0;
  const totalBalance = allStudents.reduce((a, b) => a + b.balance, 0);
  const allergiesCount = allStudents.filter(s => (s.restrictions?.allergens?.length ?? 0) > 0).length;
  // Per-unit revenue based on transaction distribution
  const unitDailyRevenue = (unitId: string, idx: number) => {
    const share = idx === 0 ? 0.65 : 0.35; // Cafetería gets ~65%
    return totalSales * share;
  };

  const handleDeleteStudent = (id: string) => {
      setShowDeleteConfirm(id);
  };

  const confirmDeleteStudent = () => {
    if (showDeleteConfirm) {
      // In a real app this would call a service
      toast.info('Procesando', `Alumno eliminado`);
      setShowDeleteConfirm(null);
    }
  };

  const handleToggleStudent = (id: string) => {
      const student = allStudents.find(s => s.id === id);
      if (student) {
          onUpdateStudent(id, { status: student.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE });
      }
  };

  return (
    <div className="p-5 md:p-8 h-full overflow-y-auto bg-[#F8FAFC] font-sans">
      <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[4px] mb-2">School Executive Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Gestión Institucional</h1>
          <p className="text-slate-500 font-medium mt-2">Monitoreo operativo, ventas y salud financiera escolar</p>
            </div>
            
        <div className="flex bg-white p-2 rounded-2xl border border-slate-200 ring-1 ring-inset ring-slate-100 relative z-10 animate-in slide-in-from-right-4 duration-500" role="tablist" aria-label="Secciones de administración">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={18}/>} label="Dashboard" />
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18}/>} label="Directorio" />
                <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<Store size={18}/>} label="Unidades POS" />
            </div>
        </header>

        <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Master KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Población Red" value={allStudents.length} icon={Users} color="bg-indigo-600" trend={`${allStudents.filter(s => s.status === UserStatus.ACTIVE).length} activos`} />
                  <StatCard title="Saldo en Red" value={`$${totalBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} icon={Landmark} color="bg-emerald-500" trend="Capital Escolar" />
                  <StatCard title="Ventas Período" value={`$${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} icon={Activity} color="bg-orange-600" trend={`${purchaseTransactions.length} compras • Ticket prom. $${avgTicket.toFixed(0)}`} />
                  <StatCard title="Salud Estudiantil" value={allergiesCount} icon={HeartPulse} color="bg-rose-500" subtitle="Alumnos con Alergias" />
                </div>

                {/* Second Row: Units Status and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 bg-white rounded-[32px] p-6 md:p-8 border border-slate-200 ring-1 ring-inset ring-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 text-slate-50 opacity-10"><PieChart size={200}/></div>
                      <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight flex items-center gap-3"><TrendingUp className="text-indigo-600"/> Rendimiento por Unidad</h3>
                      <div className="space-y-4 relative z-10">
                         {operatingUnits.map((unit, idx) => (
                           <div key={unit.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors border border-slate-200">{unit.type === 'CAFETERIA' ? <ChefHat size={24}/> : <PenTool size={24}/>}</div>
                                <div>
                                   <p className="font-black text-slate-800 text-lg tracking-tight">{unit.name}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{unit.type} • {unit.ownerType}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-800 text-xl tracking-tighter">${unitDailyRevenue(unit.id, idx).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Activa Hoy</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-indigo-900 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between border border-indigo-800">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <p className="text-indigo-300 font-black uppercase text-[10px] tracking-[3px] mb-4">Próxima Liquidación</p>
                        <h4 className="text-3xl font-black tracking-tighter mb-3 leading-none">Recuperación de Comisiones</h4>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">El próximo viernes se liquidarán las rentas y comisiones de los concesionarios activos.</p>
                      </div>
                      <div className="pt-6 border-t border-white/10 mt-6">
                        <div className="flex justify-between items-end">
                            <div><p className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-1">Monto Estimado</p><p className="text-4xl font-black tracking-tighter">${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div>
                            <button className="p-3 bg-white text-indigo-900 rounded-xl transition-all"><ArrowUpRight size={20}/></button>
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
                onReloadWallet={onReloadWallet}
              />
            )}

            {activeTab === 'units' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
                {operatingUnits.map(unit => (
                 <div key={unit.id} className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100 flex flex-col items-center text-center group transition-all">
                   <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all mb-6">{unit.type === 'CAFETERIA' ? <ChefHat size={36}/> : <PenTool size={36}/>}</div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{unit.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{unit.type} • {unit.ownerType}</p>
                      
                   <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-slate-100">
                        <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cajeros</p><p className="font-black text-slate-800 text-lg">2 Activos</p></div>
                        <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><span className={`${unit.isActive ? 'text-emerald-500' : 'text-slate-400'} font-black text-[9px] uppercase tracking-widest flex items-center justify-end gap-1`}><CheckCircle2 size={12}/> {unit.isActive ? 'Activa' : 'Inactiva'}</span></div>
                      </div>

                   <button onClick={() => toast.info('Terminales', `${unit.name} — Gestión de terminales disponible en V2`)} className="mt-8 w-full py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-[2px] hover:bg-indigo-50 hover:text-indigo-600 transition-all">Gestionar Terminales</button>
                   </div>
                ))}
                
               <div onClick={() => setShowAddUnitModal(true)} className="border-2 border-dashed border-slate-300 rounded-[32px] p-8 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:border-indigo-400 cursor-pointer transition-all group">
                 <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 mb-4 transition-all"><Plus size={30}/></div>
                 <p className="font-black text-slate-800 text-lg tracking-tight">Nueva Unidad</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Cafetería o Papelería</p>
                </div>
              </div>
            )}
        </div>

        {/* ===== ADD UNIT MODAL ===== */}
        {showAddUnitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
            <div className="bg-white rounded-[32px] p-12 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowAddUnitModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800"><X size={28}/></button>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">Nueva Unidad Operativa</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre</label>
                  <input value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="Ej. Cafetería Norte"
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipo</label>
                  <div className="flex gap-3">
                    {[{ val: 'CAFETERIA' as const, icon: <ChefHat size={20}/>, label: 'Cafetería' }, { val: 'STATIONERY' as const, icon: <PenTool size={20}/>, label: 'Papelería' }].map(t => (
                      <button key={t.val} onClick={() => setNewUnitType(t.val)}
                        className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${newUnitType === t.val ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => {
                  if (!newUnitName.trim()) { toast.warning('Requerido', 'Ingresa un nombre para la unidad'); return; }
                  onAddUnit({ id: `unit_${Date.now()}`, name: newUnitName.trim(), type: newUnitType, schoolId: 'school-001', ownerType: EntityOwner.SCHOOL } as OperatingUnit);
                  setNewUnitName(''); setShowAddUnitModal(false);
                  toast.info('Unidad Creada', `${newUnitName} agregada exitosamente`);
                }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all">
                  Crear Unidad
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== DELETE CONFIRMATION DIALOG ===== */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
            <div className="bg-white rounded-[32px] p-10 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar alumno?</h3>
              <p className="text-sm text-slate-500 mb-8">Esta acción no se puede deshacer. El alumno perderá acceso a la plataforma.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
                <button onClick={confirmDeleteStudent} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

interface TabButtonProps { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }
const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button 
    onClick={onClick} 
    role="tab"
    aria-selected={active}
    className={`px-6 md:px-8 py-3 rounded-xl flex items-center gap-2.5 transition-all font-black text-[10px] uppercase tracking-[2px] ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
  >
    {icon} <span>{label}</span>
  </button>
);
export default SchoolAdminView;
