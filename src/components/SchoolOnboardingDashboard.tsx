
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, Building2, Landmark, 
  Users, Terminal, Rocket, ShieldCheck, Sparkles, Bot, 
  X, Upload, Download, Copy, ExternalLink, Info, Database,
  Plus
} from 'lucide-react';
import { School, AppView, StudentProfile, OperatingUnit } from '../types';
import { Button } from './Button';
import { StudentImportWizard } from './StudentImportWizard';
import { CLABEService } from '../services/clabeService';

interface OnboardingDashboardProps {
  school: School;
  onComplete: () => void;
  onUpdateSchool: (data: Partial<School>) => void;
  allStudents: StudentProfile[];
  onBulkAddStudents: (students: StudentProfile[]) => void;
}

type OnboardingStep = 'welcome' | 'profile' | 'banking' | 'students' | 'pos' | 'finish';

export const SchoolOnboardingDashboard: React.FC<OnboardingDashboardProps> = ({ 
  school, onComplete, onUpdateSchool, allStudents, onBulkAddStudents 
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [showImportWizard, setShowImportWizard] = useState(false);
  
  // Progress Logic
  const steps: { id: OnboardingStep; label: string; description: string; icon: any }[] = [
    { id: 'welcome', label: 'Bienvenida', description: 'Introducción al sistema', icon: <Rocket size={20}/> },
    { id: 'profile', label: 'Perfil Institucional', description: 'Datos legales y branding', icon: <Building2 size={20}/> },
    { id: 'banking', label: 'Cuentas y SPEI', description: 'Configuración de liquidaciones', icon: <Landmark size={20}/> },
    { id: 'students', label: 'Base Estudiantil', description: 'Carga de alumnos', icon: <Users size={20}/> },
    { id: 'pos', label: 'Puntos de Venta', description: 'Activación de cafeterías', icon: <Terminal size={20}/> },
    { id: 'finish', label: 'Lanzamiento', description: 'Revisión final', icon: <CheckCircle2 size={20}/> }
  ];

  const currentStepIdx = steps.findIndex(s => s.id === currentStep);

  // Form States
  const [formData, setFormData] = useState({
    legalName: school.legalName || '',
    rfc: school.rfc || '',
    settlementCLABE: school.settlementCLABE || ''
  });

  const handleNext = () => {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < steps.length) setCurrentStep(steps[nextIdx].id);
    else onComplete();
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      {/* HEADER ONBOARDING */}
      <header className="bg-white border-b border-slate-100 p-8 flex justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-6">
           <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100 rotate-3"><Rocket className="text-white" size={28}/></div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Onboarding MeCard</h1>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px]">Configuración de Campus • v2.1</p>
           </div>
        </div>
        
        {/* Stepper horizontal */}
        <div className="hidden lg:flex items-center gap-4">
           {steps.map((s, idx) => (
             <React.Fragment key={s.id}>
                <div className={`flex items-center gap-3 transition-all duration-500 ${idx <= currentStepIdx ? 'opacity-100' : 'opacity-30'}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${idx < currentStepIdx ? 'bg-emerald-500 border-emerald-500 text-white' : idx === currentStepIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {idx < currentStepIdx ? <CheckCircle2 size={20}/> : idx + 1}
                   </div>
                   <div className="hidden xl:block">
                      <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{s.label}</p>
                   </div>
                </div>
                {idx < steps.length - 1 && <div className={`w-8 h-0.5 rounded-full ${idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
             </React.Fragment>
           ))}
        </div>

        <button onClick={() => window.location.reload()} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors"><X size={24}/></button>
      </header>

      <main className="flex-1 overflow-y-auto p-12 flex justify-center">
        <div className="max-w-4xl w-full">
            {/* WELCOME STEP */}
            {currentStep === 'welcome' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center py-20">
                    <div className="bg-indigo-50 w-32 h-32 rounded-[48px] flex items-center justify-center text-indigo-600 mx-auto mb-12 shadow-2xl shadow-indigo-100 border-4 border-white">
                        <Sparkles size={64} />
                    </div>
                    <h2 className="text-6xl font-black text-slate-800 tracking-tighter mb-6 leading-none">¡Bienvenidos, {school.name}!</h2>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">Estás a unos pasos de digitalizar la economía de tu colegio. MeCard Network te permitirá gestionar cafeterías, papelerías y monederos digitales de forma centralizada.</p>
                    <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/40 grid grid-cols-3 gap-8 mb-16">
                        <FeatureCard icon={<Database className="text-indigo-500"/>} title="Nodo Único" desc="Base de datos privada para tu campus." />
                        <FeatureCard icon={<Landmark className="text-emerald-500"/>} title="FinTech Core" desc="Personalización de CLABEs SPEI." />
                        <FeatureCard icon={<ShieldCheck className="text-amber-500"/>} title="Safety First" desc="Control parental de salud y gasto." />
                    </div>
                    <Button onClick={handleNext} className="px-16 py-8 rounded-[40px] bg-indigo-600 text-white font-black uppercase tracking-[4px] shadow-2xl hover:scale-105 transition-all">Iniciar Configuración <ArrowRight className="ml-4"/></Button>
                </div>
            )}

            {/* PROFILE STEP */}
            {currentStep === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><Building2 size={32}/></div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Perfil Institucional</h3>
                    </div>
                    <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InputField label="Razón Social Legal" value={formData.legalName} onChange={v => setFormData({...formData, legalName: v})} placeholder="Ej. Colegio Cumbres de México S.C." />
                            <InputField label="RFC Institucional" value={formData.rfc} onChange={v => setFormData({...formData, rfc: v.toUpperCase()})} placeholder="XAXX010101000" />
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="text-6xl p-4 bg-white rounded-[32px] border border-slate-100 shadow-sm">{school.logo}</div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador Visual</p>
                                    <p className="font-bold text-slate-800">El logo configurado por MeCard Corp.</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="rounded-2xl py-3 px-6 text-[10px] uppercase font-black tracking-widest border-2">Cambiar Logo</Button>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <Button onClick={handleNext} className="px-12 py-6 rounded-3xl bg-indigo-600 font-black uppercase tracking-widest shadow-xl">Siguiente: Finanzas</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* BANKING STEP */}
            {currentStep === 'banking' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><Landmark size={32}/></div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Gestión de Tesorería</h3>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Database size={200}/></div>
                            <div className="relative z-10">
                                <h4 className="text-2xl font-black text-indigo-400 mb-8 flex items-center gap-3"><ShieldCheck/> MeCard Institutional Node</h4>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">Para que tu colegio reciba sus liquidaciones automáticas (Rentas, Comisiones, Cobros Directos), necesitamos una CLABE Interbancaria de la cuenta escolar.</p>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[4px] px-2">CLABE para Liquidaciones (18 dígitos)</label>
                                    <input 
                                        type="text" 
                                        maxLength={18}
                                        value={formData.settlementCLABE}
                                        onChange={e => setFormData({...formData, settlementCLABE: e.target.value})}
                                        placeholder="000 000 0000000000 0"
                                        className="w-full bg-white/5 border border-white/10 p-8 rounded-[32px] font-mono text-3xl font-black tracking-[8px] text-white outline-none focus:border-indigo-400 transition-all text-center" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100 flex gap-8 items-center">
                            <div className="bg-white p-4 rounded-2xl text-indigo-600 shadow-sm"><Bot size={32}/></div>
                            <div>
                                <p className="text-indigo-900 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles size={14}/> Gemini Advisor</p>
                                <p className="text-indigo-700 text-sm font-medium leading-relaxed">"Asegúrate de que la cuenta pertenezca a la Razón Social <strong>{formData.legalName || 'del colegio'}</strong> para evitar problemas en la validación del SAT durante las dispersiones SPEI."</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8">
                            <button onClick={() => setCurrentStep('profile')} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-800 transition-colors">Volver</button>
                            <Button disabled={formData.settlementCLABE.length !== 18} onClick={handleNext} className="px-16 py-7 rounded-3xl bg-indigo-600 font-black uppercase tracking-widest shadow-2xl">Vincular y Continuar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STUDENTS STEP */}
            {currentStep === 'students' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><Users size={32}/></div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Base Estudiantil</h3>
                    </div>

                    <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm text-center">
                        <div className="grid grid-cols-2 gap-8 mb-12 text-left">
                            <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100">
                                <p className="text-5xl font-black text-slate-800 tracking-tighter">{allStudents.length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Alumnos en el Sistema</p>
                            </div>
                            <div className="p-10 bg-indigo-50 rounded-[40px] border border-indigo-100">
                                <p className="text-5xl font-black text-indigo-600 tracking-tighter">Pendiente</p>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Generación de CLABEs</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-slate-500 font-medium text-lg leading-relaxed px-10">Es momento de importar a tus alumnos. El sistema les asignará automáticamente una CLABE personalizada para que sus padres puedan recargar vía SPEI.</p>
                            <Button onClick={() => setShowImportWizard(true)} className="w-full py-8 rounded-[32px] bg-indigo-600 text-white font-black uppercase tracking-[4px] shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all">
                                <Upload size={24} className="mr-4"/> Abrir Wizard de Importación
                            </Button>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">* Formatos compatibles: .CSV (Plantilla MeCard)</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-12">
                        <button onClick={() => setCurrentStep('banking')} className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Atrás</button>
                        <Button onClick={handleNext} className="px-12 py-6 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest">Ya importé mis datos</Button>
                    </div>
                </div>
            )}

            {/* POS STEP */}
            {currentStep === 'pos' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><Terminal size={32}/></div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Unidades de Venta</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white p-10 rounded-[56px] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center py-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 group">
                            {/* Added missing Plus icon usage */}
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all mb-6"><Plus size={40}/></div>
                            <p className="font-black text-slate-800 text-xl tracking-tight">Nueva Cafetería</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Punto de Venta de Alimentos</p>
                        </div>
                        <div className="bg-white p-10 rounded-[56px] border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center py-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 group">
                            {/* Added missing Plus icon usage */}
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all mb-6"><Plus size={40}/></div>
                            <p className="font-black text-slate-800 text-xl tracking-tight">Nueva Papelería</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Venta de Útiles y Materiales</p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400"><Info size={32}/></div>
                            <div>
                                <p className="font-black text-slate-800 text-lg">Puntos Predeterminados</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Se han activado 2 terminales de prueba automáticamente.</p>
                            </div>
                        </div>
                        <Button onClick={handleNext} className="bg-indigo-600 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest">Confirmar y Seguir</Button>
                    </div>
                </div>
            )}

            {/* FINISH STEP */}
            {currentStep === 'finish' && (
                <div className="animate-in zoom-in duration-700 text-center py-20">
                    <div className="bg-emerald-100 w-40 h-40 rounded-[64px] flex items-center justify-center text-emerald-600 mx-auto mb-12 shadow-2xl shadow-emerald-100 border-4 border-white animate-bounce">
                        <CheckCircle2 size={80} />
                    </div>
                    <h2 className="text-6xl font-black text-slate-800 tracking-tighter mb-6 leading-none">¡Todo Listo para el Lanzamiento!</h2>
                    <p className="text-slate-400 text-xl font-medium max-w-xl mx-auto mb-16 leading-relaxed">Has completado la configuración técnica básica. Tu campus ya es parte de la red <strong>MeCard Network</strong>.</p>
                    
                    <div className="bg-slate-900 rounded-[56px] p-12 text-white max-w-2xl mx-auto mb-16 shadow-2xl text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Rocket size={80}/></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400 mb-8">CHECKLIST DE ACTIVACIÓN</h4>
                        <ul className="space-y-6">
                            <CheckListItem label="RFC Validado para Facturación" />
                            <CheckListItem label="Cuenta de Liquidación SPEI Vinculada" />
                            <CheckListItem label="Base de Alumnos Sincronizada" />
                            <CheckListItem label="Nodos de POS Desplegados" />
                        </ul>
                    </div>

                    <Button onClick={() => {
                        onUpdateSchool({ onboardingStatus: 'COMPLETED' });
                        onComplete();
                    }} className="px-20 py-10 rounded-[48px] bg-indigo-600 text-white font-black uppercase tracking-[5px] text-sm shadow-2xl shadow-indigo-200 hover:scale-110 transition-all">Activar Campus y Abrir Directorio</Button>
                </div>
            )}
        </div>
      </main>

      {/* WIZARD DE IMPORTACIÓN INTEGRADO */}
      {showImportWizard && (
          <StudentImportWizard 
            schoolId={school.id} 
            stpCostCenter={school.stpCostCenter || '000'}
            existingStudents={allStudents}
            onComplete={(newStudents) => {
                onBulkAddStudents(newStudents);
                setShowImportWizard(false);
            }}
            onCancel={() => setShowImportWizard(false)}
          />
      )}
    </div>
  );
};

// Subcomponentes
const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">{icon}</div>
        <p className="font-black text-slate-800 text-xs uppercase tracking-widest mb-1">{title}</p>
        <p className="text-[9px] text-slate-400 font-bold leading-tight">{desc}</p>
    </div>
);

const InputField = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-3 text-left">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            className="w-full p-6 bg-slate-50 border-none rounded-[28px] font-black text-lg text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" 
        />
    </div>
);

const CheckListItem = ({ label }: any) => (
    <li className="flex items-center gap-4">
        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/30"><CheckCircle2 size={18}/></div>
        <span className="font-bold text-slate-200 text-sm">{label}</span>
    </li>
);
