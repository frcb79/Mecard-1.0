import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { 
  LogOut, Building2, Zap, Landmark, Users, 
  Terminal, Activity, Plus, Store, ArrowRight, 
  X, ChefHat, PenTool, Layers, Wallet, Percent, DollarSign,
  ShieldCheck, TrendingUp, CheckCircle2, Globe, Hash,
  Database, RefreshCw, Info, Settings, UserPlus, LifeBuoy, 
  Utensils, ScanLine, Search, Tag, MessageSquare, Send, 
  ShoppingBag, Receipt, BrainCircuit, Sparkles, Rocket,
  ArrowLeftRight, Copy, Cpu, Lock
} from 'lucide-react';

// ==========================================
// 1. DEFINICIONES DE TIPOS (Integrados)
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  UNIT_MANAGER = 'UNIT_MANAGER',
  POS_OPERATOR = 'POS_OPERATOR'
}

export enum EntityOwner {
  SCHOOL = 'SCHOOL',
  CONCESSIONAIRE = 'CONCESSIONAIRE'
}

export enum OperatingUnitType {
  CAFETERIA = 'CAFETERIA',
  STATIONERY = 'STATIONERY'
}

export interface OperatingUnit {
  id: string;
  schoolId: string;
  name: string;
  type: OperatingUnitType;
  ownerType: EntityOwner;
}

export interface School {
  id: string;
  name: string;
  logo: string;
  studentCount: number;
  balance: number;
  stpCostCenter: string;
  branding: { primary: string; secondary: string; };
  businessModel: {
    setupFee: number;
    monthlyRentFee: number;
    annualFee: number;
    parentAppFee: number;
    cardDepositFeePercent: number;
    speiDepositFeeFixed: number;
    cafeteriaFeePercent: number;
    cafeteriaFeeAutoMarkup: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  unitId?: string;
}

export interface Settlement {
  id: string;
  schoolId: string;
  periodStart: string;
  periodEnd: string;
  grossRevenue: number;
  platformCommission: number;
  schoolShare: number;
  vendorShare: number;
  status: 'PENDING' | 'PAID';
  disbursements: {
      id: string;
      recipientName: string;
      recipientType: 'SCHOOL' | 'VENDOR';
      amount: number;
      clabe: string;
  }[];
}

// ==========================================
// 2. BASE DE DATOS MOCK (Integrada)
// ==========================================

const MOCK_SCHOOLS: School[] = [
  { 
    id: 'mx_01', name: 'Colegio Cumbres', logo: '🏔️', studentCount: 1250, balance: 450000, stpCostCenter: '123',
    branding: { primary: '#4f46e5', secondary: '#818cf8' },
    businessModel: { setupFee: 25000, monthlyRentFee: 5000, annualFee: 15000, parentAppFee: 25, cardDepositFeePercent: 3.5, speiDepositFeeFixed: 8, cafeteriaFeePercent: 5.0, cafeteriaFeeAutoMarkup: true }
  },
  { 
    id: 'mx_02', name: 'Instituto Irlandés', logo: '🍀', studentCount: 980, balance: 210000, stpCostCenter: '124',
    branding: { primary: '#10b981', secondary: '#34d399' },
    businessModel: { setupFee: 25000, monthlyRentFee: 5000, annualFee: 15000, parentAppFee: 25, cardDepositFeePercent: 3.5, speiDepositFeeFixed: 8, cafeteriaFeePercent: 5.0, cafeteriaFeeAutoMarkup: false }
  }
];

const MOCK_UNITS: OperatingUnit[] = [
    { id: 'u1', schoolId: 'mx_01', name: 'Cafetería Central', type: OperatingUnitType.CAFETERIA, ownerType: EntityOwner.CONCESSIONAIRE },
    { id: 'u2', schoolId: 'mx_01', name: 'Papelería Secundaria', type: OperatingUnitType.STATIONERY, ownerType: EntityOwner.SCHOOL },
    { id: 'u3', schoolId: 'mx_02', name: 'Snack Bar', type: OperatingUnitType.CAFETERIA, ownerType: EntityOwner.SCHOOL }
];

const INITIAL_SETTLEMENTS: Settlement[] = [
    {
        id: 'set_001', schoolId: 'mx_01', periodStart: '2024-01-01', periodEnd: '2024-01-07',
        grossRevenue: 150000, platformCommission: 6750, schoolShare: 25000, vendorShare: 118250, status: 'PAID',
        disbursements: [
            { id: 'd1', recipientName: 'Colegio Cumbres AC', recipientType: 'SCHOOL', amount: 25000, clabe: '646180000012300015' },
            { id: 'd2', recipientName: 'Concesiones Alim. SA', recipientType: 'VENDOR', amount: 118250, clabe: '646180000099900018' }
        ]
    }
];

// ==========================================
// 3. LOGICA Y CONTEXTO
// ==========================================

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  currentUser: User | null;
  addSchool: (school: School) => void;
  updateSchoolModel: (id: string, updates: Partial<School['businessModel']>) => void;
  impersonateSchool: (school: School | null) => void;
  addUnit: (unit: OperatingUnit) => void;
  login: (role: string) => void;
  logout: () => void;
  runSettlement: (school: School) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [units, setUnits] = useState<OperatingUnit[]>(MOCK_UNITS);
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const addSchool = (school: School) => setSchools(prev => [school, ...prev]);
  const updateSchoolModel = (id: string, updates: any) => setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: { ...s.businessModel, ...updates } } : s));
  const impersonateSchool = (school: School | null) => setActiveSchool(school);
  const addUnit = (unit: OperatingUnit) => setUnits(prev => [...prev, unit]);

  const login = (role: string) => {
      const mockUser: User = {
          id: `usr_${Date.now()}`,
          name: role === 'SUPER_ADMIN' ? 'Admin Global' : 'Usuario Demo',
          email: 'demo@mecard.com',
          role: role as UserRole,
          schoolId: 'mx_01'
      };
      setCurrentUser(mockUser);
  };

  const logout = () => { setCurrentUser(null); setActiveSchool(null); };

  const runSettlement = (school: School) => {
      // Simulación de cálculo de liquidación
      const newSettlement: Settlement = {
          id: `set_${Date.now()}`,
          schoolId: school.id,
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          grossRevenue: Math.floor(Math.random() * 50000) + 10000,
          platformCommission: 0,
          schoolShare: 0,
          vendorShare: 0,
          status: 'PENDING',
          disbursements: []
      };
      newSettlement.platformCommission = newSettlement.grossRevenue * 0.045;
      newSettlement.schoolShare = newSettlement.grossRevenue * 0.10;
      newSettlement.vendorShare = newSettlement.grossRevenue - newSettlement.platformCommission - newSettlement.schoolShare;
      newSettlement.disbursements = [
          { id: `d_${Date.now()}_1`, recipientName: school.name, recipientType: 'SCHOOL', amount: newSettlement.schoolShare, clabe: `646180${school.stpCostCenter}00015` },
          { id: `d_${Date.now()}_2`, recipientName: 'Proveedor Externo', recipientType: 'VENDOR', amount: newSettlement.vendorShare, clabe: '646180000099900018' }
      ];
      setSettlements(prev => [newSettlement, ...prev]);
      alert("Corte de Caja y Liquidación Generada Exitosamente");
  };

  return (
    <PlatformContext.Provider value={{ schools, units, settlements, activeSchool, currentUser, addSchool, updateSchoolModel, impersonateSchool, addUnit, login, logout, runSettlement }}>
      {children}
    </PlatformContext.Provider>
  );
};

const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform error");
  return context;
};

// ==========================================
// 4. COMPONENTES DE UI (Integrados)
// ==========================================

const Button = ({ children, onClick, className, disabled, variant = 'primary', size = 'md' }: any) => {
  const baseStyle = "transition-all active:scale-95 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2";
  const sizes: any = { sm: "text-[9px] py-2 px-4", md: "text-[11px] py-4 px-6", lg: "text-[12px] py-6 px-10" };
  const variants: any = {
    primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50",
    secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    emerald: "bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600"
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600' };
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p><p className="text-3xl font-black text-slate-800 tracking-tighter mt-1">{value}</p></div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-5 flex items-center gap-3 border-b-4 transition-all font-black text-[10px] uppercase tracking-[2px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const ClabeSegment = ({ digits, color, label }: { digits: string, color: string, label: string }) => (
  <div className="flex flex-col items-center gap-2 group cursor-help flex-1 min-w-[60px]">
    <div className={`w-full text-center px-2 py-3 rounded-xl font-mono text-xl font-black tracking-widest transition-all group-hover:scale-105 shadow-sm border border-white/10 ${color}`}>{digits}</div>
    <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 text-center leading-tight h-3">{label}</span>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[2px] transition-all relative group ${active ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
    <span className="shrink-0">{icon}</span>
    <span className="whitespace-nowrap">{label}</span>
    {active && <div className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg"></div>}
  </button>
);

const SaaSVar = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="font-black text-lg tracking-tight">{value}</p>
  </div>
);

// ==========================================
// 5. PANELES Y VISTAS (Lógica Consolidada)
// ==========================================

const SchoolDetailPanel: React.FC<{ school: School }> = ({ school }) => {
  const { units, addUnit, settlements, runSettlement } = usePlatform();
  const [activeTab, setActiveTab] = useState<'finances' | 'settlements' | 'units'>('finances');
  const [showAddPOS, setShowAddPOS] = useState(false);

  const schoolUnits = units.filter(u => u.schoolId === school.id);
  const schoolSettlements = settlements.filter(s => s.schoolId === school.id);
  const model = school.businessModel;
  const banco = "646"; const plaza = "180"; const prefijoMeCard = "0000"; const ccColegio = school.stpCostCenter?.padStart(3, '0') || "000"; const cuentaCC = "0001"; const verificador = "5";

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-500 bg-[#fdfdfd]">
      <header className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="text-4xl bg-slate-50 p-4 rounded-3xl shadow-inner border border-slate-100">{school.logo}</div>
          <div><h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{school.name}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-4"><span><Hash size={10} className="inline mr-1"/> STP C.C.: <span className="text-indigo-600 font-black">{school.stpCostCenter}</span></span><span>•</span><span><Users size={10} className="inline mr-1"/> {school.studentCount} Alumnos</span></p></div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex px-8 bg-white border-b border-slate-50 overflow-x-auto scrollbar-hide shrink-0">
           <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<Landmark size={16}/>} label="Finanzas SaaS" />
           <TabButton active={activeTab === 'settlements'} onClick={() => setActiveTab('settlements')} icon={<ArrowLeftRight size={16}/>} label="Liquidaciones SPEI" />
           <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<Terminal size={16}/>} label="Nodos POS" />
        </div>
        <div className="flex-1 overflow-y-auto p-10 pb-40">
           {activeTab === 'finances' && (
             <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Fondeo Institucional" value={`$${school.balance.toLocaleString()}`} icon={<Wallet size={20}/>} color="emerald" />
                 <StatCard title="Revenue Estimado" value={`$${(school.balance * (model.cafeteriaFeePercent / 100)).toLocaleString()}`} icon={<Activity size={20}/>} color="indigo" />
                 <StatCard title="Estatus Gateway" value="ONLINE" icon={<ShieldCheck size={20}/>} color="amber" />
               </div>
               <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Database size={150}/></div>
                 <div className="relative z-10 space-y-10">
                   <div><h3 className="text-2xl font-black flex items-center gap-4 tracking-tighter"><Landmark className="text-indigo-400" size={24}/> Nodo STP Interbancario</h3><p className="text-slate-500 font-bold uppercase text-[8px] tracking-[3px] mt-1">Nomenclatura Técnica de 18 Dígitos</p></div>
                   <div className="flex flex-wrap md:flex-nowrap justify-between gap-2 p-8 bg-white/5 rounded-[32px] border border-white/10">
                      <ClabeSegment digits={banco} color="bg-indigo-600 text-white" label="Banco" />
                      <ClabeSegment digits={plaza} color="bg-emerald-600 text-white" label="Plaza" />
                      <ClabeSegment digits={prefijoMeCard} color="bg-slate-700 text-indigo-300" label="Prefijo" />
                      <ClabeSegment digits={ccColegio} color="bg-amber-600 text-white" label="C.C." />
                      <ClabeSegment digits={cuentaCC} color="bg-indigo-500 text-white" label="Cuenta" />
                      <ClabeSegment digits={verificador} color="bg-rose-600 text-white" label="DC" />
                   </div>
                 </div>
               </div>
               <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Configuración de Negocio</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <SaaSVar label="Setup" value={`$${model.setupFee.toLocaleString()}`} />
                     <SaaSVar label="Renta/Mes" value={`$${model.monthlyRentFee.toLocaleString()}`} />
                     <SaaSVar label="Fee Tarjeta" value={`${model.cardDepositFeePercent}%`} />
                     <SaaSVar label="Fee Cafetería" value={`${model.cafeteriaFeePercent}%`} />
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'settlements' && (
               <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                   <div className="flex justify-between items-center">
                       <div><h3 className="text-2xl font-black text-slate-800">Liquidaciones</h3><p className="text-slate-400 text-[10px] font-black uppercase">Dispersiones vía SPEI</p></div>
                       <Button onClick={() => runSettlement(school)} variant="emerald"><RefreshCw size={16}/> Ejecutar Corte</Button>
                   </div>
                   <div className="space-y-4">
                       {schoolSettlements.map(s => (
                           <div key={s.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                               <div className="flex justify-between mb-6">
                                   <div><p className="text-xs font-black text-slate-800">Corte: {s.id}</p><p className="text-[10px] text-slate-400">{new Date(s.periodStart).toLocaleDateString()}</p></div>
                                   <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black">{s.status}</span>
                               </div>
                               <div className="grid grid-cols-3 gap-4 mb-6">
                                   <div><p className="text-[8px] uppercase text-slate-400 font-black">Venta Bruta</p><p className="text-xl font-black text-slate-800">${s.grossRevenue.toLocaleString()}</p></div>
                                   <div><p className="text-[8px] uppercase text-slate-400 font-black">Comisión</p><p className="text-xl font-black text-rose-500">-${s.platformCommission.toLocaleString()}</p></div>
                                   <div><p className="text-[8px] uppercase text-slate-400 font-black">Neto</p><p className="text-xl font-black text-emerald-600">${(s.grossRevenue - s.platformCommission).toLocaleString()}</p></div>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                                   {s.disbursements.map(d => (
                                       <div key={d.id} className="flex justify-between text-[10px] font-mono text-slate-500">
                                           <span>SPEI &gt; {d.recipientName} ({d.recipientType})</span>
                                           <span className="font-bold text-slate-700">${d.amount.toLocaleString()}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'units' && (
             <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                   <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter">Terminales Activas</h3><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Puntos de venta configurados</p></div>
                   <Button onClick={() => setShowAddPOS(true)} variant="primary"><Plus size={16}/> Nueva Terminal</Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {schoolUnits.map(unit => (
                       <div key={unit.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                           <div className="flex items-center gap-5">
                               <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{unit.type === 'CAFETERIA' ? <ChefHat size={24}/> : <PenTool size={24}/>}</div>
                               <div><h4 className="text-lg font-black text-slate-800 tracking-tight">{unit.name}</h4><p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{unit.type} • {unit.ownerType}</p></div>
                           </div>
                       </div>
                   ))}
               </div>
             </div>
           )}
        </div>
      </div>
      {showAddPOS && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-lg p-12 relative animate-in zoom-in duration-300">
                <button onClick={() => setShowAddPOS(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800 transition-all"><X size={24}/></button>
                <div className="mb-8 text-center"><h3 className="text-2xl font-black text-slate-800 tracking-tighter">Instalar Terminal</h3><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-2">Expansión de Red para {school.name}</p></div>
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); addUnit({ id: `u_${Date.now()}`, schoolId: school.id, name: fd.get('name') as string, type: fd.get('type') as any, ownerType: fd.get('owner') as any }); setShowAddPOS(false); }} className="space-y-6">
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Nombre</label><input name="name" required className="w-full p-4 rounded-[20px] bg-slate-50 border-none outline-none font-black text-slate-700 shadow-inner" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Tipo</label><select name="type" className="w-full p-4 rounded-[20px] bg-slate-50 border-none outline-none font-black text-slate-700 text-xs"><option value="CAFETERIA">CAFETERÍA</option><option value="STATIONERY">PAPELERÍA</option></select></div>
                        <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Dueño</label><select name="owner" className="w-full p-4 rounded-[20px] bg-slate-50 border-none outline-none font-black text-slate-700 text-xs"><option value="CONCESSIONAIRE">CONCESIONARIO</option><option value="SCHOOL">ESCUELA</option></select></div>
                    </div>
                    <Button type="submit" className="w-full mt-4" size="lg">Activar Nodo</Button>
                </form>
              </div>
          </div>
      )}
    </div>
  );
};

const AIAuditView = () => {
    const manifest = `
# MeCard v5.0 - STRATEGIC MANIFEST
- Architecture: Single-File Monolith (Deployment Safe).
- Core: Multi-tenant School Management with STP Banking Integration.
- Logic: Automatic Fee Calculation & Split Settlements.
- AI: Gemini Pro 2.0 Integration for Risk Analysis.
    `.trim();

    return (
        <div className="p-16 max-w-4xl mx-auto h-full overflow-y-auto animate-in fade-in duration-700">
             <header className="mb-12">
                 <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Gemini Context</h1>
                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[6px] mt-4">Auditoría de Arquitectura Viva</p>
             </header>
             <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl mb-10">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><BrainCircuit size={200}/></div>
                 <h3 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3 mb-6"><Sparkles size={18}/> System Manifest</h3>
                 <pre className="font-mono text-sm text-indigo-100/80 whitespace-pre-wrap leading-relaxed">{manifest}</pre>
                 <div className="mt-8 flex gap-4">
                     <Button variant="emerald" onClick={() => navigator.clipboard.writeText(manifest)}>Copiar Contexto</Button>
                 </div>
             </div>
        </div>
    );
};

// --- ORCHESTRATOR PRINCIPAL ---

const PlatformUI = ({ onLogout }: { onLogout?: () => void }) => {
  const { currentUser, activeSchool, login, logout, impersonateSchool } = usePlatform();
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'ai'>('infrastructure');

  if (!currentUser) {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50">
              <div className="p-12 bg-white rounded-[48px] shadow-xl text-center border border-slate-100 max-w-lg w-full">
                  <div className="mb-8 flex justify-center"><div className="bg-indigo-600 p-4 rounded-[24px] shadow-lg shadow-indigo-200"><Zap className="text-white" size={32}/></div></div>
                  <h1 className="text-4xl font-black text-slate-800 mb-2">MeCard<span className="text-indigo-600">.</span></h1>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[4px] mb-10">School Operating System</p>
                  <Button onClick={() => login('SUPER_ADMIN')} className="w-full" size="lg">Iniciar como Super Admin</Button>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="bg-indigo-600 p-3 rounded-[22px] rotate-3 shadow-2xl shadow-indigo-100 shrink-0"><Zap className="text-white w-7 h-7" /></div>
            <span className="text-3xl font-black text-slate-800 tracking-tighter">MeCard<span className="text-indigo-600">.</span></span>
          </div>
          <nav className="space-y-3">
             <SidebarItem icon={<Globe size={22}/>} label="Red Global" active={activeTab === 'infrastructure'} onClick={() => { setActiveTab('infrastructure'); impersonateSchool(null); }} />
             <SidebarItem icon={<BrainCircuit size={22}/>} label="Gemini AI" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-slate-50">
          <button onClick={logout} className="w-full flex items-center gap-6 px-8 py-5 text-rose-500 hover:bg-rose-50 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all"><LogOut size={22}/> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden relative bg-[#fdfdfd]">
         {activeTab === 'infrastructure' && !activeSchool && (
             <div className="p-12 h-full overflow-y-auto">
                 <h1 className="text-6xl font-black text-slate-800 tracking-tighter mb-12">Dashboard</h1>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {usePlatform().schools.map(s => (
                         <div key={s.id} onClick={() => impersonateSchool(s)} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
                             <div className="text-6xl mb-6">{s.logo}</div>
                             <h3 className="text-3xl font-black text-slate-800">{s.name}</h3>
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{s.studentCount} Alumnos • {formatCurrency(s.balance)}</p>
                         </div>
                     ))}
                 </div>
             </div>
         )}
         
         {activeSchool && <SchoolDetailPanel school={activeSchool} />}
         {activeTab === 'ai' && <AIAuditView />}
      </main>
    </div>
  );
};

export default function MeCardPlatform() {
  return <PlatformProvider><PlatformUI /></PlatformProvider>;
}
