
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, CheckCircle, XCircle, MapPin, Users,
  DollarSign, Building2, Mail, FileText, X, ChevronLeft, 
  ShieldCheck, Smartphone, Terminal, Briefcase, BarChart3, Info, 
  Landmark, Zap, Shield, CreditCard, Percent,
  ArrowRightLeft, BadgeDollarSign, HeartPulse, CalendarDays,
  Filter, MoreVertical, RefreshCw
} from 'lucide-react';
import { School, SchoolStatus, ContractType, TrialDuration, BusinessModel } from '../types';
import { Button } from './Button';
import { checkTrialExpiry, getTrialWarningMessage } from '../services/trialService';

// ============================================
// UI SUB-COMPONENTS
// ============================================

const InputField = ({ label, value, onChange, type = "text", prefix = "", suffix = "" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">{prefix}</span>}
      <input 
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 ${prefix ? 'pl-9' : 'px-5'} font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm`}
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">{suffix}</span>}
    </div>
  </div>
);

const ToggleSwitch = ({ label, active, onChange, description }: any) => (
  <button onClick={() => onChange(!active)} className="flex items-center justify-between w-full p-5 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all text-left">
    <div className="max-w-[80%]">
      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">{label}</span>
      {description && <span className="text-[9px] text-slate-400 font-bold leading-tight block mt-1">{description}</span>}
    </div>
    <div className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </button>
);

// ============================================
// WIZARD COMPONENT
// ============================================

interface SchoolWizardProps {
  school?: School;
  onSave: (school: Partial<School>) => void;
  onCancel: () => void;
}

const SchoolWizard: React.FC<SchoolWizardProps> = ({ school, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<School>>(school || {
    name: '', legalName: '', rfc: '', contractType: 'TRIAL', trialDurationMonths: 1, status: 'PENDING', stpCostCenter: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'México' },
    contact: { email: '', phone: '', contactPerson: '', position: '' },
    studentCount: 0,
    logo: '🎓',
    businessModel: {
      setupFee: 25000, monthlyRentFee: 5000, annualFee: 15000,
      saasPerStudent: 45, saasPerStaff: 25, chargeStaffUsage: false,
      platformFeePercent: 5, parentAppFee: 25, cardDepositFeePercent: 3.5, speiDepositFeeFixed: 8,
      cafeteriaFeePercent: 5.0, // Added missing required property to satisfy BusinessModel type
      margins: { concessionaireMargin: 85, schoolMargin: 10, mecardMargin: 5 },
      cafeteriaFeeAutoMarkup: true,
      posMethods: { allowQrBarcode: true, allowMatricula: true, allowAnonymous: false },
      settlement: { frequency: 'WEEKLY', method: 'BANK_TRANSFER' }
    } as BusinessModel
  });

  const updateBusiness = (field: string, value: any) => {
    setFormData(prev => ({ 
        ...prev, 
        businessModel: { ...prev.businessModel!, [field]: value } as BusinessModel
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div className="bg-white rounded-[56px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-12 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><Building2 size={150}/></div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Nodo Institucional</h2>
          <div className="flex gap-2 mt-4 relative z-10">
             {[1,2,3,4,5].map(s => <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-white/10'}`} />)}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC]">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in">
               <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><Building2 size={20} className="text-indigo-600"/> Identidad del Campus</h3>
               <div className="grid grid-cols-2 gap-8">
                  <InputField label="Nombre Comercial" value={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} />
                  <InputField label="Razón Social" value={formData.legalName} onChange={(v:any)=>setFormData({...formData, legalName: v})} />
                  <InputField label="RFC" value={formData.rfc} onChange={(v:any)=>setFormData({...formData, rfc: v.toUpperCase()})} />
                  <InputField label="STP Cost Center" value={formData.stpCostCenter} onChange={(v:any)=>setFormData({...formData, stpCostCenter: v})} />
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-12 animate-in fade-in">
               <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><ShieldCheck size={20} className="text-indigo-600"/> Acuerdo y Liquidación</h3>
               
               {/* Lógica de Periodo de Prueba */}
               <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><CalendarDays size={120}/></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black italic uppercase mb-2 tracking-tighter">Configuración del Contrato</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Define el estatus legal del servicio</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block ml-1">Modalidad</label>
                          <div className="flex gap-4">
                            {(['TRIAL', 'STANDARD'] as ContractType[]).map(t => (
                              <button 
                                key={t} 
                                onClick={() => setFormData({...formData, contractType: t})}
                                className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.contractType === t ? 'bg-white text-slate-900 border-white' : 'border-white/10 text-white hover:bg-white/5'}`}
                              >
                                {t === 'TRIAL' ? 'Prueba' : 'Maestro'}
                              </button>
                            ))}
                          </div>
                       </div>

                       {formData.contractType === 'TRIAL' && (
                         <div className="space-y-4 animate-in slide-in-from-left-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block ml-1">Duración de Prueba</label>
                            <div className="flex gap-3">
                              {([1, 2, 3] as TrialDuration[]).map(m => (
                                <button 
                                  key={m} 
                                  onClick={() => setFormData({...formData, trialDurationMonths: m})}
                                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.trialDurationMonths === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}
                                >
                                  {m} {m === 1 ? 'Mes' : 'Meses'}
                                </button>
                              ))}
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
               </div>

               {/* Métricas de Liquidación */}
               <div className="grid grid-cols-2 gap-10 pt-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frecuencia de Dispersión</label>
                     <select 
                        value={formData.businessModel?.settlement.frequency}
                        onChange={(e) => updateBusiness('settlement', { ...formData.businessModel!.settlement, frequency: e.target.value })}
                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase tracking-widest outline-none shadow-sm"
                     >
                        <option value="WEEKLY">Semanal (Viernes)</option>
                        <option value="BIWEEKLY">Quincenal</option>
                        <option value="MONTHLY">Mensual</option>
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                     <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">Transferencia SPEI</button>
                        <button className="flex-1 py-4 bg-white border border-slate-100 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cheque</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {step > 1 && step < 5 && (
              <div className="py-40 text-center opacity-20 grayscale flex flex-col items-center">
                  <Info size={80} strokeWidth={1} className="mb-6" />
                  <p className="font-black uppercase tracking-[10px]">Fase {step} de Configuración</p>
              </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-12 bg-white border-t border-slate-100 flex justify-between shrink-0">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : null} 
            disabled={step === 1} 
            className="px-10 py-5 bg-white text-slate-400 rounded-[24px] font-black uppercase text-[11px] border-2 border-slate-100 disabled:opacity-30"
          >
            Anterior
          </button>
          
          <div className="flex gap-4">
            <button onClick={onCancel} className="px-10 py-5 text-slate-300 font-black uppercase text-[11px] hover:text-rose-500 transition-colors">Cancelar</button>
            {step < 5 ? (
                <button onClick={() => setStep(step + 1)} className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[11px] shadow-xl hover:scale-105 transition-all">Siguiente Fase</button>
            ) : (
                <button onClick={() => onSave(formData)} className="px-14 py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[11px] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">Activar Nodo</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | undefined>();

  const handleSave = (data: Partial<School>) => {
    if (editingSchool) {
      setSchools(prev => prev.map(s => s.id === editingSchool.id ? { ...s, ...data } as School : s));
    } else {
      const newSchool: School = {
        ...data,
        id: `mx_${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        studentCount: 0,
        balance: 0,
        platformFeePercent: 5,
        onboardingStatus: 'PENDING',
        status: 'PENDING',
      } as School;
      setSchools([newSchool, ...schools]);
    }
    setShowWizard(false);
    setEditingSchool(undefined);
  };

  return (
    <div className="p-12 h-full bg-[#FDFDFD] overflow-y-auto pb-40">
      <header className="mb-16 flex justify-between items-end">
        <div>
           <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">Network Infrastructure</p>
           <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Gestión de Nodos</h1>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-indigo-600 px-10 py-5 rounded-[28px] text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20}/> Nuevo Colegio
        </button>
      </header>

      {/* Alertas de Prueba */}
      <div className="space-y-4 mb-12">
         {schools.map(s => {
           if (s.contractType === 'TRIAL') {
             const status = checkTrialExpiry(s.createdAt, s.trialDurationMonths || 1);
             const msg = getTrialWarningMessage(status, s.name);
             if (msg) {
               return (
                 <div key={s.id} className={`p-6 rounded-3xl border flex items-center justify-between ${status.isExpired ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    <div className="flex items-center gap-4">
                       <Zap size={20} className={status.isExpired ? 'animate-pulse' : ''} />
                       <p className="text-xs font-black uppercase tracking-widest">{msg}</p>
                    </div>
                    <button onClick={() => { setEditingSchool(s); setShowWizard(true); }} className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">Actualizar Contrato</button>
                 </div>
               );
             }
           }
           return null;
         })}
      </div>

      <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
           <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Institución</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {schools.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                   <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:bg-white group-hover:scale-110 transition-all">{s.logo}</div>
                         <div>
                            <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-2">{s.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">STP CC: {s.stpCostCenter}</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-10 py-8">
                      <span className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${s.contractType === 'TRIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {s.contractType} {s.contractType === 'TRIAL' && `(${s.trialDurationMonths}M)`}
                      </span>
                   </td>
                   <td className="px-10 py-8">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <div className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div> {s.status}
                      </span>
                   </td>
                   <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingSchool(s); setShowWizard(true); }} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all"><Edit size={18}/></button>
                         <button onClick={() => setSchools(prev => prev.filter(x => x.id !== s.id))} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-2xl shadow-sm transition-all"><Trash2 size={18}/></button>
                      </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
        
        {schools.length === 0 && (
           <div className="py-40 text-center opacity-10 grayscale flex flex-col items-center">
              <Search size={100} strokeWidth={1} className="mb-6" />
              <p className="font-black uppercase tracking-[15px]">Sin Nodos</p>
           </div>
        )}
      </div>

      {showWizard && (
        <SchoolWizard 
          school={editingSchool} 
          onSave={handleSave} 
          onCancel={() => { setShowWizard(false); setEditingSchool(undefined); }} 
        />
      )}
    </div>
  );
};

export default SchoolManagement;
