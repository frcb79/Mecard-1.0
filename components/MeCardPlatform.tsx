
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { 
  LogOut, Building2, Zap, Landmark, Users, Save, ShieldCheck, 
  ChevronLeft, PanelLeftClose, PanelLeftOpen, QrCode, PenTool, 
  Activity, Plus, Calendar, DollarSign, Percent, TrendingUp, 
  Utensils, ChefHat, ShoppingBag, Clock, CheckCircle2, Search, 
  Settings, CreditCard, ArrowRight, X, Copy, Check, History, 
  LayoutDashboard, Store, Trash2, Edit3, HeartPulse, Palette,
  ArrowLeftRight, ArrowUpRight, HelpCircle, AlertCircle, Smartphone, Wallet,
  UserPlus, Shield, Terminal, Sparkles, Bot, BrainCircuit, FileCode, Cpu,
  Share2, Database, Network, ExternalLink, GraduationCap, Layers, Rocket
} from 'lucide-react';
import { School, OperatingUnit, EntityOwner, UserRole } from '../types';
import { PRODUCTS, MOCK_SCHOOLS, MOCK_UNITS } from '../constants';
import { getPlatformStrategicAudit } from '../services/geminiService';
import { Button } from './Button';

// ==========================================
// 1. CONTEXTO GLOBAL DE PLATAFORMA (Reparado)
// ==========================================

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  activeSchool: School | null;
  addSchool: (school: School) => void;
  updateSchool: (id: string, data: Partial<School>) => void;
  impersonateSchool: (school: School | null) => void;
  addUnit: (unit: OperatingUnit) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [units, setUnits] = useState<OperatingUnit[]>(MOCK_UNITS);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  const addSchool = (school: School) => {
    setSchools(prev => [school, ...prev]);
  };

  const updateSchool = (id: string, data: Partial<School>) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    if (activeSchool?.id === id) {
      setActiveSchool(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const impersonateSchool = (school: School | null) => {
    setActiveSchool(school);
  };

  const addUnit = (unit: OperatingUnit) => {
    setUnits(prev => [...prev, unit]);
  };

  return (
    <PlatformContext.Provider value={{ schools, units, activeSchool, addSchool, updateSchool, impersonateSchool, addUnit }}>
      {children}
    </PlatformContext.Provider>
  );
};

const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
};

// ==========================================
// 2. UTILIDADES
// ==========================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

// ==========================================
// 3. COMPONENTES DE VISTA
// ==========================================

const SchoolDetailPanel: React.FC<{ school: School }> = ({ school }) => {
  const { updateSchool, units, addUnit } = usePlatform();
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'pos_setup'>('overview');
  const [showAddPOS, setShowAddPOS] = useState(false);

  const schoolUnits = useMemo(() => units.filter(u => u.schoolId === school.id), [units, school.id]);

  const handleCreatePOS = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const newUnit: OperatingUnit = {
          id: `unit_${Date.now()}`,
          schoolId: school.id,
          name: formData.get('name') as string,
          type: formData.get('type') as any,
          ownerType: formData.get('owner') as any,
          managerId: `mgr_${Date.now()}`
      };
      addUnit(newUnit);
      setShowAddPOS(false);
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-500 bg-[#fdfdfd]">
      <header className="p-10 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-5xl bg-slate-50 p-4 rounded-3xl shadow-inner border border-slate-100">{school.logo}</div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{school.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">ID: {school.id} • Centro de Costos STP: {school.stpCostCenter}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex px-10 bg-white border-b border-slate-50 overflow-x-auto scrollbar-hide">
           {/* Fixed syntax error in onClick handler below */}
           <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<ArrowLeftRight size={18}/>} label="Finanzas" />
           <TabButton active={activeTab === 'pos_setup'} onClick={() => setActiveTab('pos_setup')} icon={<Terminal size={18}/>} label="Puntos de Venta" />
           <TabButton active={activeTab === 'business'} onClick={() => setActiveTab('business')} icon={<Landmark size={18}/>} label="Configuración SaaS" />
        </div>

        <div className="flex-1 overflow-y-auto p-12 pb-40">
           {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
               <StatCard title="Alumnos" value={school.studentCount} icon={<Users size={24}/>} color="indigo" />
               <StatCard title="Saldo Red" value={formatCurrency(school.balance)} icon={<Landmark size={24}/>} color="emerald" />
               <StatCard title="Comisión Estimada" value={formatCurrency(school.balance * (school.businessModel.cafeteriaFeePercent/100))} icon={<Activity size={24}/>} color="amber" />
               <div className="md:col-span-3 h-64 bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100 flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">Monitor de Flujos Activo</div>
             </div>
           )}

           {activeTab === 'pos_setup' && (
             <div className="space-y-12">
                <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Unidades Operativas</h3>
                    <button onClick={() => setShowAddPOS(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-3"><Plus size={18}/> Nueva Unidad</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {schoolUnits.map(unit => (
                        <div key={unit.id} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">{unit.type === 'CAFETERIA' ? <ChefHat size={32}/> : <PenTool size={32}/>}</div>
                                <div><h4 className="text-xl font-black text-slate-800">{unit.name}</h4><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{unit.type} • {unit.ownerType}</p></div>
                            </div>
                            <button className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-indigo-600"><ArrowRight size={24}/></button>
                        </div>
                    ))}
                </div>
             </div>
           )}

           {activeTab === 'business' && (
             <div className="bg-slate-900 rounded-[56px] p-12 text-white space-y-8">
                <h3 className="text-2xl font-black flex items-center gap-4"><Landmark className="text-indigo-400"/> Modelo Económico</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10"><p className="text-[10px] text-slate-500 uppercase font-black mb-2">Comisión Cafetería</p><p className="text-4xl font-black">{school.businessModel.cafeteriaFeePercent}%</p></div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10"><p className="text-[10px] text-slate-500 uppercase font-black mb-2">Renta Mensual</p><p className="text-4xl font-black">{formatCurrency(school.businessModel.monthlyRentFee)}</p></div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Modal POS */}
      {showAddPOS && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-16 relative animate-in zoom-in duration-300">
                <button onClick={() => setShowAddPOS(false)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800"><X size={32}/></button>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-10">Desplegar Unidad</h3>
                <form onSubmit={handleCreatePOS} className="space-y-8">
                   <input name="name" required placeholder="Nombre de la Unidad" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 shadow-inner" />
                   <div className="grid grid-cols-2 gap-6">
                        <select name="type" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-sm">
                            <option value="CAFETERIA">CAFETERÍA</option>
                            <option value="STATIONERY">PAPELERÍA</option>
                        </select>
                        <select name="owner" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-sm">
                            <option value={EntityOwner.CONCESSIONAIRE}>CONCESIONARIO</option>
                            <option value={EntityOwner.SCHOOL}>ESCUELA</option>
                        </select>
                   </div>
                   <Button type="submit" className="w-full py-8 rounded-[32px] bg-indigo-600 font-black uppercase tracking-widest shadow-2xl">Activar Unidad POS</Button>
                </form>
              </div>
          </div>
      )}
    </div>
  );
};

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================

export default function MeCardPlatform({ onLogout }: { onLogout?: () => void }) {
  return (
    <PlatformProvider>
      <PlatformUI onLogout={onLogout} />
    </PlatformProvider>
  );
}

const PlatformUI = ({ onLogout }: { onLogout?: () => void }) => {
  const { schools, activeSchool, impersonateSchool, addSchool } = usePlatform();
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'ai_audit'>('infrastructure');
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [auditView, setAuditView] = useState<'manifest' | 'dashboard'>('manifest');

  const systemManifest = useMemo(() => {
    return `
# MeCard v4.5 - FULL PROJECT CONTEXT FOR GEMINI

## 1. Core Architecture
- Multi-tenant school network management.
- FinTech Layer: STP Bank Integration (Personalized CLABE per student).
- POS Layer: High-performance terminals for Cafeteria/Stationery with medical alerts validation.
- Parental Layer: Real-time spending limits, product-level bans, and healthy alternative suggestions via AI.

## 2. Technical Stack
- React 19, Lucide Icons, Recharts, Tailwind CSS.
- AI Core: Gemini Flash for fast nutritional alerts, Gemini Pro for strategic audits.

## 3. Business Logic
- Multi-fee management (Setup, Rents, App Fees).
- Dynamic Commissioning: Automatic Markup vs Vendor Discounting.
- Scalable Entity Hierarchy: Platform -> School -> Units (POS) -> Staff -> Students.
    `.trim();
  }, []);

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newSchool: School = {
        id: `mx_${Date.now().toString().slice(-3)}`,
        name: formData.get('name') as string,
        logo: formData.get('logo') as string,
        studentCount: Number(formData.get('students')),
        balance: 0,
        stpCostCenter: (100 + schools.length).toString(),
        // Added missing required properties from the School interface
        platformFeePercent: 4.5,
        onboardingStatus: 'PENDING',
        branding: { primary: '#4f46e5', secondary: '#818cf8' },
        businessModel: {
            setupFee: Number(formData.get('setup')),
            annualFee: 15000,
            monthlyRentFee: Number(formData.get('rent')),
            parentAppFee: 25,
            cardDepositFeePercent: 3.5,
            speiDepositFeeFixed: 8.0,
            cafeteriaFeePercent: Number(formData.get('fee')),
            cafeteriaFeeAutoMarkup: true
        }
    };
    addSchool(newSchool);
    setShowAddSchool(false);
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="bg-indigo-600 p-3 rounded-[22px] rotate-3 shadow-2xl shadow-indigo-100 shrink-0"><Zap className="text-white w-7 h-7" /></div>
            <span className="text-3xl font-black text-slate-800 tracking-tighter">MeCard<span className="text-indigo-600">.</span></span>
          </div>
          <nav className="space-y-3">
            <SidebarItem icon={<Building2 size={22}/>} label="Instituciones" active={activeTab === 'infrastructure'} onClick={() => { setActiveTab('infrastructure'); impersonateSchool(null); }} />
            <SidebarItem icon={<BrainCircuit size={22}/>} label="Gemini Context" active={activeTab === 'ai_audit'} onClick={() => setActiveTab('ai_audit')} />
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-slate-50">
          <button onClick={onLogout} className="w-full flex items-center gap-6 px-8 py-5 text-rose-500 hover:bg-rose-50 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all"><LogOut size={22}/> Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-hidden relative bg-[#fdfdfd]">
        {activeTab === 'infrastructure' && !activeSchool && (
          <div className="p-16 max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in duration-700 pb-40">
             <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div>
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[8px] mb-4">PLATFORM CORE</p>
                    <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none">Red Global</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab('ai_audit')} className="bg-slate-900 text-white px-10 py-6 rounded-[40px] font-black text-[12px] uppercase tracking-widest flex items-center gap-4 group shadow-2xl shadow-slate-200">
                        <Share2 size={24}/> Manifiesto Gemini
                    </button>
                    <button onClick={() => setShowAddSchool(true)} className="bg-indigo-600 text-white px-10 py-6 rounded-[40px] font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-4 group">
                        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500"/> Registrar Colegio
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {schools.map(s => (
                    <div key={s.id} onClick={() => impersonateSchool(s)} className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all cursor-pointer group relative overflow-hidden animate-in zoom-in">
                        <div className="absolute top-0 right-0 p-10 text-slate-50 opacity-10 group-hover:scale-110 transition-transform"><Building2 size={120}/></div>
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div className="text-8xl bg-slate-50 p-10 rounded-[48px] group-hover:bg-indigo-50 shadow-inner border border-slate-100">{s.logo}</div>
                            <div className="text-right">
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Activo</span>
                                <p className="text-5xl font-black text-slate-800 mt-8 tracking-tighter">{formatCurrency(s.balance)}</p>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-4">{s.name}</h3>
                        <div className="flex gap-6 text-slate-400 font-bold text-[12px] uppercase tracking-widest">
                           <span className="flex items-center gap-2"><Users size={20}/> {s.studentCount} Alumnos</span>
                           <span className="flex items-center gap-2"><Landmark size={20}/> CC: {s.stpCostCenter}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Onboarding (REPARADO) */}
            {showAddSchool && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-4xl p-16 relative animate-in zoom-in duration-300">
                        <button onClick={() => setShowAddSchool(false)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800"><X size={32}/></button>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-12">Nuevo Despliegue Escolar</h3>
                        <form onSubmit={handleRegisterSchool} className="space-y-10">
                           <div className="grid grid-cols-2 gap-10">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Institución</label>
                                 <input name="name" required placeholder="Ej. Colegio Americano" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-lg shadow-inner" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Logo (Emoji)</label>
                                    <input name="logo" required placeholder="🎓" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-3xl shadow-inner text-center" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Alumnos</label>
                                    <input name="students" type="number" required placeholder="800" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-xl shadow-inner text-center" />
                                </div>
                              </div>
                           </div>
                           <div className="p-10 bg-indigo-50/50 rounded-[48px] border border-indigo-100 flex gap-10">
                                <div className="flex-1 space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Setup Fee ($)</label>
                                    <input name="setup" type="number" defaultValue="25000" className="w-full p-5 rounded-2xl bg-white border border-indigo-100 font-black text-indigo-700" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Renta Mensual ($)</label>
                                    <input name="rent" type="number" defaultValue="5000" className="w-full p-5 rounded-2xl bg-white border border-indigo-100 font-black text-indigo-700" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Comisión (%)</label>
                                    <input name="fee" type="number" step="0.1" defaultValue="5.0" className="w-full p-5 rounded-2xl bg-white border border-indigo-100 font-black text-indigo-700" />
                                </div>
                           </div>
                           <Button type="submit" className="w-full py-8 rounded-[32px] bg-indigo-600 text-white font-black uppercase tracking-[5px] shadow-2xl shadow-indigo-100">Registrar e Instalar Infraestructura</Button>
                        </form>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeSchool && <SchoolDetailPanel school={activeSchool} />}

        {activeTab === 'ai_audit' && (
           <div className="p-16 max-w-5xl mx-auto h-full overflow-y-auto animate-in fade-in duration-700">
              <header className="mb-16 flex justify-between items-center">
                 <div>
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[8px] mb-4">BRAIN CORE STRATEGY</p>
                    <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">Contexto Gemini</h1>
                 </div>
                 <button onClick={() => {
                     navigator.clipboard.writeText(systemManifest);
                     alert("✅ ¡Manifiesto copiado! Pégalo en tu chat con Gemini.");
                 }} className="bg-indigo-600 text-white px-10 py-5 rounded-[28px] font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-3"><Copy size={20}/> Copiar para Gemini</button>
              </header>

              <div className="bg-white border-2 border-slate-100 rounded-[64px] p-12 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-600"><Bot size={150}/></div>
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><Rocket className="text-indigo-600"/> Manifiesto del Proyecto</h3>
                  <pre className="text-slate-600 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-10 rounded-[32px] border border-slate-100 shadow-inner">
                    {systemManifest}
                  </pre>
              </div>

              <div className="mt-12 p-10 bg-indigo-50 border border-indigo-100 rounded-[40px] flex gap-8 items-center">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg"><Cpu size={32}/></div>
                  <div>
                      <p className="text-indigo-900 font-black text-lg leading-tight">Instrucción para Gemini:</p>
                      <p className="text-indigo-700 font-medium text-xs mt-1">"Actúa como un experto desarrollador. Te daré el contexto técnico del proyecto MeCard para que entiendas la lógica de mi código..."</p>
                      {/* Fixed missing Sparkles icon usage here if intended, adding it to match previous views' style */}
                      <p className="text-indigo-400 font-black uppercase text-[11px] tracking-widest flex items-center gap-3 mt-4"><Sparkles size={16}/> Gemini Pro 2.0 en línea</p>
                  </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[3px] transition-all relative group ${active ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
    <span className="shrink-0">{icon}</span>
    <span className="whitespace-nowrap">{label}</span>
    {active && <div className="absolute right-6 w-2 h-2 bg-indigo-600 rounded-full shadow-lg"></div>}
  </button>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-10 py-6 flex items-center gap-3 border-b-4 transition-all font-black text-[11px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, icon, color }: any) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  return (
    <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex items-center gap-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center ${colors[color as keyof typeof colors]}`}>{icon}</div>
      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p><p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{value}</p></div>
    </div>
  );
};
