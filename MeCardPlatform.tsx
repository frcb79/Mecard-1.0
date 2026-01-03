
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { 
  LogOut, Building2, Zap, Landmark, Users, Terminal, Activity, Plus, 
  ArrowRight, X, LayoutDashboard, Layers, Settings, Globe, Hash,
  Database, RefreshCw, Info, Lock, BrainCircuit, Sparkles,
  ChevronLeft, ChevronRight, DollarSign, CreditCard, Percent,
  Receipt, ShieldCheck, Cpu, Share2, Rocket, CheckCircle2, ChefHat, ArrowLeftRight
} from 'lucide-react';
import { School, OperatingUnit, EntityOwner, Settlement, SettlementStatus } from './types';
import { MOCK_SCHOOLS, MOCK_UNITS, MOCK_TRANSACTIONS } from './constants';
import { Button } from './components/Button';
import { getPlatformStrategicAudit } from './services/geminiService';
import { SettlementService } from './services/settlementService';

// ==========================================
// 1. CONTEXTO GLOBAL DE PLATAFORMA
// ==========================================

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  addSchool: (school: School) => void;
  updateSchoolModel: (id: string, updates: Partial<School['businessModel']>) => void;
  impersonateSchool: (school: School | null) => void;
  runSettlement: (school: School) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORAGE_KEY = 'mecard_master_schools_v4';
  const SETTLEMENTS_KEY = 'mecard_settlements_v2';
  const SIDEBAR_KEY = 'mecard_sidebar_collapsed';
  
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_SCHOOLS;
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem(SETTLEMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
    localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify(settlements));
    localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed));
  }, [schools, settlements, sidebarCollapsed]);

  const addSchool = (school: School) => setSchools(prev => [school, ...prev]);
  
  const updateSchoolModel = (id: string, updates: Partial<School['businessModel']>) => {
    setSchools(prev => prev.map(s => s.id === id ? { 
        ...s, 
        businessModel: { ...s.businessModel, ...updates } 
    } : s));
    if (activeSchool?.id === id) {
      setActiveSchool(prev => prev ? { ...prev, businessModel: { ...prev.businessModel, ...updates } } : null);
    }
  };

  const impersonateSchool = (school: School | null) => setActiveSchool(school);
  
  const runSettlement = (school: School) => {
    const schoolUnits = MOCK_UNITS.filter(u => u.schoolId === school.id);
    const newSettlement = SettlementService.calculate(
      school,
      schoolUnits as any,
      MOCK_TRANSACTIONS,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );
    setSettlements(prev => [newSettlement, ...prev]);
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <PlatformContext.Provider value={{ 
      schools, units: MOCK_UNITS as any, settlements, activeSchool, 
      addSchool, updateSchoolModel, impersonateSchool, runSettlement,
      sidebarCollapsed, toggleSidebar
    }}>
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
// 2. UTILIDADES TÉCNICAS
// ==========================================

const calculateCLABEVerifier = (base17: string): string => {
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += (parseInt(base17[i]) * weights[i]) % 10;
  }
  const mod = sum % 10;
  return mod === 0 ? '0' : (10 - mod).toString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

// ==========================================
// 3. COMPONENTES ATÓMICOS
// ==========================================

const StatCard = ({ title, value, icon, color }: any) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex items-center gap-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center ${colors[color as keyof typeof colors]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{value}</p>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-10 py-6 flex items-center gap-3 border-b-4 transition-all font-black text-[11px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const ClabeSegment = ({ digits, color, label }: { digits: string, color: string, label: string }) => (
  <div className="flex flex-col items-center gap-2 group cursor-help flex-1 min-w-[70px]">
    <div className={`w-full text-center px-2 py-4 rounded-2xl font-mono text-2xl font-black tracking-widest transition-all group-hover:scale-105 shadow-sm border border-white/10 ${color}`}>
      {digits}
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 text-center leading-tight h-4">{label}</span>
  </div>
);

const SaaSInputField = ({ label, value, onChange, prefix, suffix }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">{prefix}</span>}
      <input 
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full border-none bg-slate-50 rounded-[28px] ${prefix ? 'pl-12' : 'pl-6'} ${suffix ? 'pr-16' : 'pr-6'} py-5 font-black text-2xl text-slate-700 shadow-inner outline-none focus:ring-4 focus:ring-indigo-100 transition-all`}
      />
      {suffix && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">{suffix}</span>}
    </div>
  </div>
);

// ==========================================
// 4. PANEL DE LIQUIDACIONES
// ==========================================

const SettlementsPanel: React.FC<{ school: School }> = ({ school }) => {
  const { settlements, runSettlement } = usePlatform();
  const schoolSettlements = settlements.filter(s => s.schoolId === school.id);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Ciclos de Liquidación</h3>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px] mt-1">Dispersiones SPEI Automatizadas</p>
         </div>
         <Button onClick={() => runSettlement(school)} className="bg-indigo-600 px-10 py-6 rounded-[32px] shadow-2xl shadow-indigo-100 font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">
           <RefreshCw className="mr-3" size={18}/> Ejecutar Corte de Red
         </Button>
      </div>

      {schoolSettlements.length === 0 ? (
        <div className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[64px] py-40 text-center flex flex-col items-center grayscale opacity-30">
           <Receipt size={100} strokeWidth={1} className="mb-6" />
           <p className="text-slate-500 font-black uppercase tracking-[8px]">Sin historial de liquidación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 pb-40">
           {schoolSettlements.map(s => (
             <div key={s.id} className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all">
                <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50/20">
                   <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">ID: {s.id}</p>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tight">Período {new Date(s.periodStart).toLocaleDateString()} — {new Date(s.periodEnd).toLocaleDateString()}</h4>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={14}/> {s.status}</span>
                      <Button size="sm" variant="secondary" className="rounded-xl px-6">XML Audit</Button>
                   </div>
                </div>
                <div className="p-12 grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-slate-50">
                   <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</p><p className="text-3xl font-black text-slate-800">{formatCurrency(s.grossRevenue)}</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fee MeCard (4.5%)</p><p className="text-3xl font-black text-rose-500">-{formatCurrency(s.platformCommission)}</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dispersión Colegio</p><p className="text-3xl font-black text-emerald-600">{formatCurrency(s.schoolShare)}</p></div>
                   <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dispersión Vendor</p><p className="text-3xl font-black text-indigo-600">{formatCurrency(s.vendorShare)}</p></div>
                </div>
                <div className="p-12 bg-slate-50/10">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">Nodos de Liquidación SPEI</p>
                   <div className="space-y-4">
                      {s.disbursements.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-8 bg-white rounded-[40px] border border-slate-50 shadow-sm hover:border-indigo-100 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-400 border border-slate-100">{d.recipientType === 'SCHOOL' ? <Building2 size={32}/> : <ChefHat size={32}/>}</div>
                              <div><p className="font-black text-slate-800 text-lg leading-none mb-2">{d.recipientName}</p><p className="text-[10px] font-mono text-slate-400 tracking-widest">{d.clabe}</p></div>
                           </div>
                           <div className="text-right"><p className="font-black text-slate-800 text-2xl tracking-tighter">{formatCurrency(d.amount)}</p><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Enviado vía SPEI</span></div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. PANEL DE DETALLE DE INSTITUCIÓN
// ==========================================

const SchoolDetailPanel: React.FC<{ school: School }> = ({ school }) => {
  const { updateSchoolModel } = usePlatform();
  const [activeTab, setActiveTab] = useState<'finances' | 'settlements' | 'units'>('finances');
  const model = school.businessModel;

  const toggleMarkup = () => {
    updateSchoolModel(school.id, { cafeteriaFeeAutoMarkup: !model.cafeteriaFeeAutoMarkup });
  };

  const banco = "646";
  const plaza = "180";
  const prefijoMeCard = "0000";
  const ccColegio = school.stpCostCenter?.padStart(3, '0') || "000";
  const cuentaCC = "0001";
  const base17 = `${banco}${plaza}${prefijoMeCard}${ccColegio}${cuentaCC}`;
  const verificador = calculateCLABEVerifier(base17);

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-500 bg-[#fdfdfd]">
      <header className="p-10 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="text-6xl bg-slate-50 p-6 rounded-[36px] shadow-inner border border-slate-100">{school.logo}</div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{school.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-4">
               <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl">ID: {school.id}</span>
               <span className="flex items-center gap-2"><Hash size={12}/> STP C.C.: <span className="text-slate-800 font-black">{school.stpCostCenter}</span></span>
               <span className="flex items-center gap-2"><Users size={12}/> {school.studentCount} Alumnos</span>
            </p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-5 bg-slate-50 rounded-3xl text-slate-300 hover:text-indigo-600 transition-all hover:scale-105"><X size={28}/></button>
      </header>

      <div className="flex px-10 bg-white border-b border-slate-50 overflow-x-auto scrollbar-hide shrink-0">
         <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<Landmark size={18}/>} label="Modelo de Negocio" />
         <TabButton active={activeTab === 'settlements'} onClick={() => setActiveTab('settlements')} icon={<ArrowLeftRight size={18}/>} label="Liquidaciones" />
         <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<Terminal size={18}/>} label="Nodos Operativos" />
      </div>

      <div className="flex-1 overflow-y-auto p-12 pb-40">
         {activeTab === 'finances' && (
           <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <StatCard title="Fondeo de Campus" value={formatCurrency(school.balance)} icon={<DollarSign size={24}/>} color="emerald" />
               <StatCard title="Revenue SaaS Estimado" value={formatCurrency(school.balance * 0.05)} icon={<Activity size={24}/>} color="indigo" />
               <StatCard title="Estatus Nodo Red" value="ONLINE" icon={<Zap size={24}/>} color="amber" />
             </div>

             <div className="bg-slate-900 rounded-[64px] p-16 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5"><Database size={200}/></div>
               <div className="relative z-10 space-y-12">
                 <div>
                   <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter leading-none"><Landmark className="text-indigo-400" size={32}/> Nodo STP Interbancario</h3>
                   <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[4px] mt-2">Nomenclatura Técnica de 18 Dígitos</p>
                 </div>

                 <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 p-10 bg-white/5 rounded-[48px] border border-white/10">
                    <ClabeSegment digits={banco} color="bg-slate-800 text-slate-400" label="Banco STP" />
                    <ClabeSegment digits={plaza} color="bg-slate-800 text-slate-400" label="Plaza CDMX" />
                    <ClabeSegment digits={prefijoMeCard} color="bg-indigo-600 text-white shadow-xl" label="Prefijo MeCard" />
                    <ClabeSegment digits={ccColegio} color="bg-amber-600 text-white shadow-xl shadow-amber-900/30" label="C.C. Colegio" />
                    <ClabeSegment digits={cuentaCC} color="bg-emerald-600 text-white" label="ID Alumno" />
                    <ClabeSegment digits={verificador} color="bg-rose-600 text-white shadow-lg" label="D.V." />
                 </div>

                 <div className="p-8 bg-indigo-500/10 rounded-[32px] border border-indigo-500/20 flex items-center gap-6">
                    <Info className="text-indigo-400 shrink-0" size={24}/>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[2px] leading-relaxed">
                      Estructura validada: Dígito Verificador <span className="text-white font-black">{verificador}</span>. El segmento <span className="text-amber-300 font-black">{ccColegio}</span> habilita la dispersión automática hacia el CC del campus.
                    </p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-[64px] border border-slate-100 shadow-sm p-16 space-y-12">
               <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><Layers size={28}/></div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Configuración SaaS del Campus</h3>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="space-y-8">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Métricas SaaS Base</h4>
                   <SaaSInputField label="Setup Fee (Implementación)" value={model.setupFee} onChange={(val: number) => updateSchoolModel(school.id, { setupFee: val })} prefix="$" />
                   <SaaSInputField label="Anualidad Institucional" value={model.annualFee} onChange={(val: number) => updateSchoolModel(school.id, { annualFee: val })} prefix="$" />
                   <SaaSInputField label="Renta Mensual Nodos POS" value={model.monthlyRentFee} onChange={(val: number) => updateSchoolModel(school.id, { monthlyRentFee: val })} prefix="$" />
                 </div>

                 <div className="space-y-8">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Fees por Operación</h4>
                   <SaaSInputField label="Fee App Padre/Mes" value={model.parentAppFee} onChange={(val: number) => updateSchoolModel(school.id, { parentAppFee: val })} prefix="$" suffix="/usuario" />
                   <SaaSInputField label="Comisión Gateway Tarjeta" value={model.cardDepositFeePercent} onChange={(val: number) => updateSchoolModel(school.id, { cardDepositFeePercent: val })} suffix="%" />
                   <SaaSInputField label="Fee SPEI Fijo (Dispersión)" value={model.speiDepositFeeFixed} onChange={(val: number) => updateSchoolModel(school.id, { speiDepositFeeFixed: val })} prefix="$" />
                 </div>
               </div>

               <div className="pt-12 border-t border-slate-50">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-10">Lógica de Comisión Cafetería</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <SaaSInputField label="% Comisión sobre Venta" value={model.cafeteriaFeePercent} onChange={(val: number) => updateSchoolModel(school.id, { cafeteriaFeePercent: val })} suffix="%" />
                   <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[40px] border border-slate-100 group">
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Algoritmo de Cobro</p>
                       <p className="text-2xl font-black text-indigo-600 transition-all">
                         {model.cafeteriaFeeAutoMarkup ? 'Auto-Markup' : 'Descuento Vendor'}
                       </p>
                     </div>
                     <button onClick={toggleMarkup} className={`w-20 h-10 rounded-full transition-all relative ${model.cafeteriaFeeAutoMarkup ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                       <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-xl ${model.cafeteriaFeeAutoMarkup ? 'right-1.5' : 'left-1.5'}`}></div>
                     </button>
                   </div>
                 </div>
                 <div className="mt-10 p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex gap-6 items-center">
                    <Info className="text-indigo-400" size={24}/>
                    <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-relaxed">
                       {model.cafeteriaFeeAutoMarkup 
                         ? "Modo MASTER: El precio final del producto se incrementa automáticamente para cubrir la comisión de red." 
                         : "Modo PARTNER: La comisión se deduce directamente de la liquidación final enviada al concesionario."}
                    </p>
                 </div>
               </div>
             </div>
           </div>
         )}
         {activeTab === 'settlements' && <SettlementsPanel school={school} />}
      </div>
    </div>
  );
};

// ==========================================
// 6. COMPONENTE PRINCIPAL
// ==========================================

export default function MeCardPlatform({ onLogout }: { onLogout?: () => void }) {
  return (
    <PlatformProvider>
      <PlatformUI onLogout={onLogout} />
    </PlatformProvider>
  );
}

const PlatformUI = ({ onLogout }: { onLogout?: () => void }) => {
  const { schools, activeSchool, impersonateSchool, sidebarCollapsed, toggleSidebar } = usePlatform();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'ai'>('dashboard');
  const [aiAudit, setAiAudit] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAudit = async () => {
    setLoadingAi(true);
    const audit = await getPlatformStrategicAudit(schools, MOCK_UNITS);
    setAiAudit(audit);
    setLoadingAi(false);
  };

  const SidebarItem = ({ icon, label, id, active, onClick }: any) => (
    <button 
      onClick={() => onClick(id)} 
      className={`w-full flex items-center gap-6 px-8 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[3px] transition-all relative group ${active ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}
      title={sidebarCollapsed ? label : ''}
    >
      <span className="shrink-0">{icon}</span>
      {!sidebarCollapsed && <span className="whitespace-nowrap">{label}</span>}
      {active && <div className="absolute right-6 w-2 h-2 bg-indigo-600 rounded-full shadow-lg"></div>}
    </button>
  );

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans">
      <aside className={`bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-24' : 'w-80'}`}>
        <div className="p-10">
          <div className={`flex items-center gap-4 mb-16 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-indigo-600 p-3 rounded-[22px] rotate-3 shadow-2xl shrink-0"><Zap className="text-white w-7 h-7" /></div>
            {!sidebarCollapsed && <span className="text-3xl font-black text-slate-800 tracking-tighter">MeCard<span className="text-indigo-600">.</span></span>}
          </div>
          <nav className="space-y-3">
            <SidebarItem id="dashboard" icon={<Globe size={22}/>} label="Global Dashboard" active={activeTab === 'dashboard'} onClick={(t: any) => { setActiveTab(t); impersonateSchool(null); }} />
            <SidebarItem id="schools" icon={<Building2 size={22}/>} label="Red de Colegios" active={activeTab === 'schools' || !!activeSchool} onClick={(t: any) => { setActiveTab(t); impersonateSchool(null); }} />
            <SidebarItem id="ai" icon={<BrainCircuit size={22}/>} label="AI Strategies" active={activeTab === 'ai'} onClick={(t: any) => setActiveTab(t)} />
          </nav>
        </div>
        
        <div className="mt-auto">
           <button onClick={toggleSidebar} className="w-full p-6 text-slate-300 hover:text-indigo-600 transition-all flex items-center justify-center">
              {sidebarCollapsed ? <ChevronRight size={24}/> : <ChevronLeft size={24}/>}
           </button>
           <div className="p-8 border-t border-slate-50">
              <button onClick={onLogout} className={`w-full flex items-center gap-6 px-8 py-5 text-rose-500 hover:bg-rose-50 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all ${sidebarCollapsed ? 'justify-center' : ''}`} title={sidebarCollapsed ? 'Cerrar Sesión' : ''}>
                <LogOut size={22}/> {!sidebarCollapsed && 'Cerrar Sesión'}
              </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden relative bg-[#fdfdfd]">
        {!activeSchool ? (
          <div className="p-16 max-w-7xl mx-auto h-full overflow-y-auto pb-40 animate-in fade-in duration-700">
             {activeTab === 'dashboard' && (
                <div className="space-y-16">
                    <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none">Global Network</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <StatCard title="Colegios Activos" value={schools.length} icon={<Building2 size={32}/>} color="indigo" />
                        <StatCard title="Volumen Global" value={formatCurrency(schools.reduce((a,b)=>a+b.balance,0))} icon={<Landmark size={32}/>} color="emerald" />
                        <StatCard title="Alumnos en Red" value={schools.reduce((a,b)=>a+b.studentCount,0).toLocaleString()} icon={<Users size={32}/>} color="rose" />
                        <StatCard title="Nodos de Venta" value={MOCK_UNITS.length} icon={<Terminal size={32}/>} color="amber" />
                    </div>
                </div>
             )}

             {activeTab === 'ai' && (
                <div className="space-y-12 max-w-4xl">
                    <header>
                        <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Gemini Audit</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[6px] mt-4">Análisis Predictivo de Riesgos y Roadmap</p>
                    </header>
                    <div className="bg-slate-900 rounded-[64px] p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><BrainCircuit size={200}/></div>
                        <div className="relative z-10 space-y-8">
                            <p className="text-indigo-400 font-black uppercase text-[11px] tracking-widest flex items-center gap-3"><Sparkles size={16}/> Gemini Pro 2.0 Strategic Advisor</p>
                            <div className="min-h-[250px] text-xl font-medium leading-relaxed text-indigo-100/90 whitespace-pre-wrap">
                                {loadingAi ? (
                                    <div className="flex flex-col items-center gap-6 py-20 animate-pulse">
                                      <div className="w-16 h-16 border-8 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                      <p className="font-black text-xs uppercase tracking-[4px]">Analizando arquitectura de red...</p>
                                    </div>
                                ) : aiAudit || "Presiona para ejecutar auditoría de seguridad y financiera en tiempo real sobre los nodos activos."}
                            </div>
                            <Button onClick={handleGenerateAudit} className="bg-indigo-600 px-12 py-8 rounded-[36px] text-[12px] shadow-2xl shadow-indigo-500/20">Generar Auditoría Estratégica</Button>
                        </div>
                    </div>
                </div>
             )}

             {activeTab === 'schools' && (
                <div>
                    <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none">Instituciones</h1>
                        <Button className="bg-indigo-600 px-12 py-7 rounded-[40px] text-[12px] hover:scale-105 transition-all">
                          <Plus size={24} className="mr-2"/> Registrar Campus MeCard
                        </Button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-40">
                        {schools.map(s => (
                            <div key={s.id} onClick={() => impersonateSchool(s)} className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all cursor-pointer group relative overflow-hidden animate-in zoom-in">
                                <div className="absolute top-0 right-0 p-12 text-slate-50 opacity-10 group-hover:scale-110 transition-transform"><Building2 size={120}/></div>
                                <div className="flex justify-between items-start mb-12 relative z-10">
                                    <div className="text-8xl bg-slate-50 p-10 rounded-[48px] group-hover:bg-indigo-50 shadow-inner border border-slate-100 transition-all">{s.logo}</div>
                                    <div className="text-right">
                                        <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Activo</span>
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
                </div>
             )}
          </div>
        ) : (
          <SchoolDetailPanel school={activeSchool} />
        )}
      </main>
    </div>
  );
};
