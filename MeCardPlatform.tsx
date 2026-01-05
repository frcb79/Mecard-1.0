
import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { 
  LogOut, Building2, Zap, Landmark, Users, Terminal, Activity, Plus, 
  X, Globe, Hash, Database, RefreshCw, Info, BrainCircuit, 
  Sparkles, ChevronLeft, ChevronRight, DollarSign, Receipt, 
  CheckCircle2, ChefHat, ArrowLeftRight, ShieldCheck, Layers3,
  ExternalLink, Key, LayoutGrid, Monitor
} from 'lucide-react';
import { School, OperatingUnit, Settlement, SettlementStatus, EntityOwner } from './types';
import { MOCK_SCHOOLS, MOCK_UNITS, MOCK_TRANSACTIONS } from './constants';
import { Button } from './components/Button';
import { getPlatformStrategicAudit } from './services/geminiService';
import { SettlementService } from './services/settlementService';
import { usePlatform } from './contexts/PlatformContext';

// Utilidades técnicas
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function MeCardPlatform({ onLogout }: { onLogout?: () => void }) {
  const { schools, activeSchool, impersonateSchool } = usePlatform();
  const [activeTab, setActiveTab] = useState<'network' | 'ai' | 'audit'>('network');
  const [aiAudit, setAiAudit] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAudit = async () => {
    setLoadingAi(true);
    try {
        const audit = await getPlatformStrategicAudit(schools, MOCK_UNITS as any);
        setAiAudit(audit);
    } catch (e) {
        setAiAudit("Error al conectar con la inteligencia estratégica.");
    } finally {
        setLoadingAi(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#f8fafc] flex flex-col overflow-y-auto p-12 font-sans pb-40">
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">MeCard Network Command Center</p>
            <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none">Visibilidad Global</h1>
            <div className="flex gap-4 mt-8">
                <button onClick={() => setActiveTab('network')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'network' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100'}`}>Infraestructura</button>
                <button onClick={() => setActiveTab('ai')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100'}`}>Gemini Strategic</button>
            </div>
        </header>

        {activeTab === 'network' && (
            <div className="space-y-16 animate-in fade-in duration-700">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard title="Campus Red" value={schools.length} icon={<Building2 size={32}/>} color="indigo" />
                    <StatCard title="Volumen Red" value={formatCurrency(schools.reduce((a,b)=>a+b.balance,0))} icon={<Landmark size={32}/>} color="emerald" />
                    <StatCard title="Alumnos" value={schools.reduce((a,b)=>a+b.studentCount,0).toLocaleString()} icon={<Users size={32}/>} color="rose" />
                    <StatCard title="Nodos Activos" value={MOCK_UNITS.length} icon={<Monitor size={32}/>} color="amber" />
                </div>

                {/* Modules Map */}
                <div className="bg-white rounded-[64px] p-16 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12"><Layers3 size={300}/></div>
                    <div className="relative z-10">
                        {/* Fix: Changed Layers to Layers3 to match imported icon */}
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-12 flex items-center gap-4"><Layers3 className="text-indigo-600"/> Módulos de la Plataforma</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ModuleIndicator title="POS Gateway" status="Active" desc="Nodos de cobro en cafeterías y tiendas." icon={<Terminal/>}/>
                            <ModuleIndicator title="FinTech Core" status="Active" desc="Integración SPEI, STP y Monederos." icon={<Landmark/>}/>
                            <ModuleIndicator title="Parent Control" status="Active" desc="App de padres para salud y gasto." icon={<ShieldCheck/>}/>
                            <ModuleIndicator title="Student Hub" status="Active" desc="Red social, regalos y health score." icon={<Users/>}/>
                            <ModuleIndicator title="Inventory AI" status="Active" desc="Gestión masiva de stock inteligente." icon={<Package/>}/>
                            <ModuleIndicator title="Settlement Engine" status="Active" desc="Dispersión automática de comisiones." icon={<RefreshCw/>}/>
                        </div>
                    </div>
                </div>

                {/* School List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {schools.map(s => (
                        <div key={s.id} className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-10">
                                <div className="text-7xl bg-slate-50 p-8 rounded-[36px] shadow-inner border border-slate-100 group-hover:bg-indigo-50 transition-colors">{s.logo}</div>
                                <div className="text-right">
                                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Nodo Operativo</span>
                                    <p className="text-4xl font-black text-slate-800 mt-6 tracking-tighter">{formatCurrency(s.balance)}</p>
                                </div>
                            </div>
                            <h4 className="text-3xl font-black text-slate-800 mb-4">{s.name}</h4>
                            <div className="grid grid-cols-2 gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100"><Users size={16}/> {s.studentCount} Alumnos</span>
                                <span className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100"><Monitor size={16}/> {MOCK_UNITS.filter(u=>u.schoolId === s.id).length} Unidades</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto animate-in zoom-in duration-500">
                <div className="bg-slate-900 rounded-[64px] p-20 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><BrainCircuit size={200}/></div>
                    <div className="relative z-10 space-y-10">
                        <p className="text-indigo-400 font-black uppercase text-[12px] tracking-[6px] flex items-center gap-3"><Sparkles size={20}/> Estrategia Gemini Pro 3.0</p>
                        <h2 className="text-5xl font-black tracking-tighter leading-none">Auditoría Inteligente de Red</h2>
                        <div className="min-h-[250px] text-xl font-medium leading-relaxed text-indigo-100/90 whitespace-pre-wrap italic">
                            {loadingAi ? (
                                <div className="flex flex-col items-center gap-8 py-20 animate-pulse">
                                  <div className="w-20 h-20 border-8 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                  <p className="font-black text-xs uppercase tracking-[6px]">Gemini está razonando sobre la infraestructura...</p>
                                </div>
                            ) : aiAudit || "El sistema está listo para auditar los flujos financieros de los 450k usuarios activos."}
                        </div>
                        <Button onClick={handleGenerateAudit} disabled={loadingAi} className="bg-indigo-600 px-16 py-8 rounded-[40px] text-[14px] uppercase font-black shadow-2xl shadow-indigo-500/20">Ejecutar Escaneo Estratégico</Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

const StatCard = ({ title, value, icon, color }: any) => {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex items-center gap-8 hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{value}</p>
            </div>
        </div>
    );
};

const ModuleIndicator = ({ title, status, desc, icon }: any) => (
    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] hover:bg-white hover:shadow-xl transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> {status}</span>
        </div>
        <h5 className="font-black text-slate-800 text-lg mb-2">{title}</h5>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
);

const Package = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
