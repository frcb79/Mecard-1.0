
import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { 
  LogOut, Building2, Zap, Landmark, Users, Terminal, Activity, Plus, 
  X, Globe, Hash, Database, RefreshCw, Info, BrainCircuit, 
  Sparkles, ChevronLeft, ChevronRight, DollarSign, Receipt, 
  CheckCircle2, ChefHat, ArrowLeftRight, ShieldCheck, Layers3,
  ExternalLink, Key
} from 'lucide-react';
import { School, OperatingUnit, Settlement, SettlementStatus, EntityOwner } from '../types';
import { MOCK_SCHOOLS, MOCK_UNITS, MOCK_TRANSACTIONS } from '../constants';
import { Button } from './Button';
import { getPlatformStrategicAudit } from '../services/geminiService';
import { SettlementService } from '../services/settlementService';

// Extender el objeto window para TypeScript
// Fix: Use the expected AIStudio type and ensure modifiers match existing global declarations (making it optional to avoid conflicts)
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

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
  const STORAGE_KEY = 'mecard_master_schools_v5';
  const SETTLEMENTS_KEY = 'mecard_settlements_v3';
  const SIDEBAR_KEY = 'mecard_sidebar_state';
  
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
      schoolUnits as OperatingUnit[],
      MOCK_TRANSACTIONS,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );
    setSettlements(prev => [newSettlement, ...prev]);
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <PlatformContext.Provider value={{ 
      schools, units: MOCK_UNITS as OperatingUnit[], settlements, activeSchool, 
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

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'amber' | 'rose' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex items-center gap-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{value}</p>
      </div>
    </div>
  );
};

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

const SchoolDetailPanel: React.FC<{ school: School }> = ({ school }) => {
  const { updateSchoolModel, settlements, runSettlement } = usePlatform();
  const [activeTab, setActiveTab] = useState<'finances' | 'settlements'>('finances');
  const model = school.businessModel;

  const banco = "646";
  const plaza = "180";
  const prefijoMeCard = "0000";
  const ccColegio = school.stpCostCenter?.padStart(3, '0') || "000";
  const cuentaCC = "0001";
  const base17 = `${banco}${plaza}${prefijoMeCard}${ccColegio}${cuentaCC}`;
  const verificador = calculateCLABEVerifier(base17);

  const schoolSettlements = settlements.filter(s => s.schoolId === school.id);

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
         <button onClick={() => setActiveTab('finances')} className={`px-10 py-6 border-b-4 transition-all font-black text-[11px] uppercase tracking-[3px] ${activeTab === 'finances' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'}`}>Arquitectura SaaS</button>
         <button onClick={() => setActiveTab('settlements')} className={`px-10 py-6 border-b-4 transition-all font-black text-[11px] uppercase tracking-[3px] ${activeTab === 'settlements' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'}`}>Cortes de Caja</button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 pb-40">
         {activeTab === 'finances' && (
           <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <StatCard title="Fondeo Campus" value={formatCurrency(school.balance)} icon={<DollarSign size={24}/>} color="emerald" />
               <StatCard title="Revenue Estimado" value={formatCurrency(school.balance * 0.045)} icon={<Activity size={24}/>} color="indigo" />
               <StatCard title="Nodo Red" value="ONLINE" icon={<Zap size={24}/>} color="amber" />
             </div>

             <div className="bg-slate-900 rounded-[64px] p-16 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5"><Database size={200}/></div>
               <div className="relative z-10 space-y-12">
                 <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter leading-none"><Landmark className="text-indigo-400" size={32}/> Nodo STP Interbancario</h3>
                 <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 p-10 bg-white/5 rounded-[48px] border border-white/10">
                    <ClabeSegment digits={banco} color="bg-slate-800 text-slate-400" label="Banco" />
                    <ClabeSegment digits={plaza} color="bg-slate-800 text-slate-400" label="Plaza" />
                    <ClabeSegment digits={prefijoMeCard} color="bg-indigo-600 text-white shadow-xl" label="Prefijo" />
                    <ClabeSegment digits={ccColegio} color="bg-amber-600 text-white shadow-xl" label="C.C." />
                    <ClabeSegment digits={cuentaCC} color="bg-emerald-600 text-white" label="ID" />
                    <ClabeSegment digits={verificador} color="bg-rose-600 text-white shadow-lg" label="D.V." />
                 </div>
                 <div className="p-8 bg-indigo-500/10 rounded-[32px] border border-indigo-500/20 flex items-center gap-6">
                    <Info className="text-indigo-400 shrink-0" size={24}/>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[2px] leading-relaxed">
                      El segmento <span className="text-amber-300 font-black">{ccColegio}</span> habilita la dispersión automática hacia el CC del campus.
                    </p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-[64px] border border-slate-100 shadow-sm p-16 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="space-y-8">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Métricas SaaS Base</h4>
                   <SaaSInputField label="Setup Fee" value={model.setupFee} onChange={(val: number) => updateSchoolModel(school.id, { setupFee: val })} prefix="$" />
                   <SaaSInputField label="Anualidad" value={model.annualFee} onChange={(val: number) => updateSchoolModel(school.id, { annualFee: val })} prefix="$" />
                   <SaaSInputField label="Renta POS" value={model.monthlyRentFee} onChange={(val: number) => updateSchoolModel(school.id, { monthlyRentFee: val })} prefix="$" />
                 </div>
                 <div className="space-y-8">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Fees por Operación</h4>
                   <SaaSInputField label="App Padre" value={model.parentAppFee} onChange={(val: number) => updateSchoolModel(school.id, { parentAppFee: val })} prefix="$" />
                   <SaaSInputField label="Comisión Tarjeta" value={model.cardDepositFeePercent} onChange={(val: number) => updateSchoolModel(school.id, { cardDepositFeePercent: val })} suffix="%" />
                   <SaaSInputField label="Fee SPEI" value={model.speiDepositFeeFixed} onChange={(val: number) => updateSchoolModel(school.id, { speiDepositFeeFixed: val })} prefix="$" />
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeTab === 'settlements' && (
           <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex justify-between items-center">
                 <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Ciclos de Liquidación</h3>
                 <Button onClick={() => runSettlement(school)} className="bg-indigo-600 px-10 py-6 rounded-[32px] font-black text-[11px] uppercase tracking-widest">
                   <RefreshCw className="mr-3" size={18}/> Ejecutar Corte
                 </Button>
              </div>

              {schoolSettlements.length === 0 ? (
                <div className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[64px] py-40 text-center grayscale opacity-30">
                   <Receipt size={100} strokeWidth={1} className="mx-auto mb-6" />
                   <p className="text-slate-500 font-black uppercase tracking-[8px]">Sin historial</p>
                </div>
              ) : (
                <div className="space-y-10">
                   {schoolSettlements.map(s => (
                     <div key={s.id} className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                           <h4 className="text-2xl font-black text-slate-800">Corte ID: {s.id.slice(-6)}</h4>
                           <span className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={14}/> {s.status}</span>
                        </div>
                        <div className="p-12 grid grid-cols-2 md:grid-cols-4 gap-12">
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Gross Revenue</p><p className="text-3xl font-black text-slate-800">{formatCurrency(s.grossRevenue)}</p></div>
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fee MeCard</p><p className="text-3xl font-black text-rose-500">-{formatCurrency(s.platformCommission)}</p></div>
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Share Colegio</p><p className="text-3xl font-black text-emerald-600">{formatCurrency(s.schoolShare)}</p></div>
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Share Vendor</p><p className="text-3xl font-black text-indigo-600">{formatCurrency(s.vendorShare)}</p></div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

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
  const [keyMissing, setKeyMissing] = useState(false);

  const handleGenerateAudit = async () => {
    // Regla: Verificar selección de API Key para modelos Pro
    if (typeof window.aistudio !== 'undefined') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setKeyMissing(true);
            return;
        }
    }

    setLoadingAi(true);
    setAiAudit(null);
    try {
        const audit = await getPlatformStrategicAudit(schools, MOCK_UNITS as any);
        setAiAudit(audit);
    } catch (e: any) {
        if (e.message === "KEY_NOT_FOUND") {
            setKeyMissing(true);
        } else {
            setAiAudit("Error al conectar con Gemini Pro.");
        }
    } finally {
        setLoadingAi(false);
    }
  };

  const handleOpenKeySelector = async () => {
    if (typeof window.aistudio !== 'undefined') {
        await window.aistudio.openSelectKey();
        setKeyMissing(false);
        // Proceder inmediatamente después del selector
        handleGenerateAudit();
    }
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans">
      <aside className={`bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-24' : 'w-80'}`}>
        <div className="p-10">
          <div className={`flex items-center gap-4 mb-16 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-indigo-600 p-3 rounded-[22px] rotate-3 shadow-2xl shrink-0"><Zap className="text-white w-7 h-7" /></div>
            {!sidebarCollapsed && <span className="text-3xl font-black text-slate-800 tracking-tighter">MeCard<span className="text-indigo-600">.</span></span>}
          </div>
          <nav className="space-y-3">
             <SidebarItem icon={<Globe size={22}/>} label="Global" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); impersonateSchool(null); }} collapsed={sidebarCollapsed} />
             <SidebarItem icon={<Building2 size={22}/>} label="Campus" active={activeTab === 'schools' || !!activeSchool} onClick={() => { setActiveTab('schools'); impersonateSchool(null); }} collapsed={sidebarCollapsed} />
             <SidebarItem icon={<BrainCircuit size={22}/>} label="AI Auditor" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} collapsed={sidebarCollapsed} />
          </nav>
        </div>
        
        <div className="mt-auto">
           <button onClick={toggleSidebar} className="w-full p-6 text-slate-300 hover:text-indigo-600 transition-all flex items-center justify-center">
              {sidebarCollapsed ? <ChevronRight size={24}/> : <ChevronLeft size={24}/>}
           </button>
           <div className="p-8 border-t border-slate-50">
              <button onClick={onLogout} className={`w-full flex items-center gap-6 px-8 py-5 text-rose-500 hover:bg-rose-50 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <LogOut size={22}/> {!sidebarCollapsed && 'Salir'}
              </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden relative bg-[#fdfdfd]">
        {!activeSchool ? (
          <div className="p-16 max-w-7xl mx-auto h-full overflow-y-auto pb-40 animate-in fade-in duration-700">
             {activeTab === 'dashboard' && (
                <div className="space-y-16">
                    <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none">Global Hub</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <StatCard title="Campus" value={schools.length} icon={<Building2 size={32}/>} color="indigo" />
                        <StatCard title="Volumen" value={formatCurrency(schools.reduce((a,b)=>a+b.balance,0))} icon={<Landmark size={32}/>} color="emerald" />
                        <StatCard title="Alumnos" value={schools.reduce((a,b)=>a+b.studentCount,0).toLocaleString()} icon={<Users size={32}/>} color="rose" />
                        <StatCard title="Nodos POS" value={MOCK_UNITS.length} icon={<Terminal size={32}/>} color="amber" />
                    </div>
                </div>
             )}

             {activeTab === 'ai' && (
                <div className="space-y-12 max-w-4xl">
                    <h2 className="text-6xl font-black text-slate-800 tracking-tighter">AI Network Auditor</h2>
                    <div className="bg-slate-900 rounded-[64px] p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><BrainCircuit size={200}/></div>
                        <div className="relative z-10 space-y-8">
                            <p className="text-indigo-400 font-black uppercase text-[11px] tracking-widest flex items-center gap-3"><Sparkles size={16}/> Gemini Pro 3.0 Strategic Analyst</p>
                            
                            {keyMissing ? (
                                <div className="bg-white/5 border border-white/10 p-10 rounded-[32px] animate-in zoom-in">
                                    <ShieldCheck className="text-amber-400 mb-6" size={48}/>
                                    <h4 className="text-2xl font-black text-white mb-2">Requiere API Key de Pago</h4>
                                    <p className="text-slate-400 mb-8 leading-relaxed">Para ejecutar análisis estratégicos con Gemini Pro 3.0, debes seleccionar una API Key de un proyecto con facturación activa.</p>
                                    <Button onClick={handleOpenKeySelector} className="bg-indigo-600 px-8 py-5 rounded-2xl font-black text-xs uppercase flex items-center gap-3">
                                        <Key size={18}/> Seleccionar API Key
                                    </Button>
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block mt-4 text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1 underline">Ver documentación de facturación <ExternalLink size={10}/></a>
                                </div>
                            ) : (
                                <div className="min-h-[250px] text-xl font-medium leading-relaxed text-indigo-100/90 whitespace-pre-wrap">
                                    {loadingAi ? (
                                        <div className="flex flex-col items-center gap-6 py-20 animate-pulse">
                                          <div className="w-16 h-16 border-8 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                          <p className="font-black text-xs uppercase tracking-[4px]">Gemini Pro está razonando...</p>
                                        </div>
                                    ) : aiAudit || "Ejecuta una auditoría para detectar anomalías o riesgos financieros en la infraestructura de MeCard."}
                                </div>
                            )}
                            
                            {!keyMissing && (
                                <Button onClick={handleGenerateAudit} disabled={loadingAi} className="bg-indigo-600 px-12 py-8 rounded-[36px] text-[12px] uppercase font-black">
                                    {loadingAi ? 'Procesando...' : 'Auditar Red'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
             )}

             {activeTab === 'schools' && (
                <div>
                    <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none mb-20">Campus Red</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

const SidebarItem = ({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[3px] transition-all relative ${active ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    {active && <div className="absolute right-6 w-2 h-2 bg-indigo-600 rounded-full shadow-lg"></div>}
  </button>
);
