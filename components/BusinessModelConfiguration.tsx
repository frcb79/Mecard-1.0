
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Percent, TrendingUp, CreditCard, Calendar, 
  AlertCircle, CheckCircle, Info, Save, RefreshCw, Building2,
  Wallet, PieChart, ArrowRight, Calculator, X, ChevronRight,
  Landmark
} from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES (Scoped to component for this specific flow)
// ============================================

type BusinessModelType = 'PLATFORM' | 'DIRECT' | 'HYBRID';
type SettlementFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
type SettlementMethod = 'BANK_TRANSFER' | 'CHECK' | 'CARD';

interface BusinessModel {
  type: BusinessModelType;
  platformFeePercent: number;
  margins: {
    concessionaireMargin: number;
    schoolMargin: number;
    mecardMargin: number;
  };
  operatingCosts: {
    cardIssuanceFee: number;
    replacementCardFee: number;
    monthlyMaintenanceFee: number;
  };
  limits: {
    maxDailySpend: number;
    minRechargeAmount: number;
    maxRechargeAmount: number;
  };
  settlement: {
    frequency: SettlementFrequency;
    method: SettlementMethod;
    bankAccount?: {
      bank: string;
      accountNumber: string;
      clabe: string;
      beneficiary: string;
    };
  };
}

interface BusinessModelConfigurationProps {
  schoolId?: string;
  schoolName?: string;
  initialModel?: BusinessModel;
  onSave: (model: BusinessModel) => void;
  onCancel?: () => void;
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_MODEL: BusinessModel = {
  type: 'PLATFORM',
  platformFeePercent: 4.5,
  margins: {
    concessionaireMargin: 40,
    schoolMargin: 30,
    mecardMargin: 30
  },
  operatingCosts: {
    cardIssuanceFee: 50,
    replacementCardFee: 30,
    monthlyMaintenanceFee: 10
  },
  limits: {
    maxDailySpend: 200,
    minRechargeAmount: 50,
    maxRechargeAmount: 2000
  },
  settlement: {
    frequency: 'WEEKLY',
    method: 'BANK_TRANSFER'
  }
};

const BANKS = [
  'BBVA Bancomer', 'Banamex', 'Santander', 'Banorte', 'HSBC',
  'Scotiabank', 'Inbursa', 'Azteca', 'Afirme', 'BanRegio'
];

// ============================================
// MAIN COMPONENT
// ============================================

export const BusinessModelConfiguration: React.FC<BusinessModelConfigurationProps> = ({
  schoolId,
  schoolName = "Campus General",
  initialModel,
  onSave,
  onCancel
}) => {
  const [model, setModel] = useState<BusinessModel>(initialModel || DEFAULT_MODEL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Validar que los márgenes sumen 100%
  useEffect(() => {
    const total = model.margins.concessionaireMargin + 
                  model.margins.schoolMargin + 
                  model.margins.mecardMargin;
    
    if (total !== 100) {
      setErrors(prev => ({ 
        ...prev, 
        margins: `Los márgenes deben sumar 100% (actualmente: ${total}%)` 
      }));
    } else {
      setErrors(prev => {
        const { margins, ...rest } = prev;
        return rest;
      });
    }
  }, [model.margins]);

  // Validar límites
  useEffect(() => {
    if (model.limits.minRechargeAmount >= model.limits.maxRechargeAmount) {
      setErrors(prev => ({
        ...prev,
        limits: 'La recarga mínima debe ser menor que la máxima'
      }));
    } else {
      setErrors(prev => {
        const { limits, ...rest } = prev;
        return rest;
      });
    }
  }, [model.limits]);

  const updateMargins = (field: keyof BusinessModel['margins'], value: number) => {
    setModel(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [field]: value
      }
    }));
  };

  const distributeMargins = () => {
    const evenSplit = Math.floor(100 / 3);
    const remainder = 100 - (evenSplit * 3);
    
    setModel(prev => ({
      ...prev,
      margins: {
        concessionaireMargin: evenSplit + remainder,
        schoolMargin: evenSplit,
        mecardMargin: evenSplit
      }
    }));
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      alert('Por favor corrige los errores antes de guardar');
      return;
    }
    onSave(model);
    alert('✅ Configuración guardada correctamente.');
  };

  const marginsTotal = model.margins.concessionaireMargin + 
                      model.margins.schoolMargin + 
                      model.margins.mecardMargin;

  return (
    <div className="h-full bg-[#f8fafc] overflow-y-auto p-12 font-sans pb-40">
      {/* Header Premium */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">MeCard Network Command Center</p>
          <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none flex items-center gap-4">
            <PieChart size={64} className="text-indigo-600" />
            Configuración de Negocio
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[4px] mt-4 flex items-center gap-2">
            <Building2 size={14}/> {schoolName} • ID: {schoolId || 'NEW'}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-rose-500 transition-all shadow-sm">
            <X size={28}/>
          </button>
        )}
      </header>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Tipo de Modelo Bento */}
        <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Building2 size={200}/></div>
            <h2 className="text-3xl font-black text-slate-800 mb-10 tracking-tight flex items-center gap-4 relative z-10">
                Arquitectura de Operación
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {[
                    { id: 'PLATFORM', title: 'Full MeCard', desc: 'MeCard gestiona toda la pasarela de pagos y liquidaciones.' },
                    { id: 'DIRECT', title: 'Direct Bank', desc: 'La escuela gestiona sus propias cuentas y dispersiones.' },
                    { id: 'HYBRID', title: 'Modelo Híbrido', desc: 'Control compartido entre el campus y MeCard.' }
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => setModel(prev => ({ ...prev, type: type.id as BusinessModelType }))}
                        className={`p-10 rounded-[44px] border-2 text-left transition-all group ${
                            model.type === type.id
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100'
                            : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200'
                        }`}
                    >
                        <div className={`text-xl font-black mb-3 ${model.type === type.id ? 'text-indigo-700' : 'text-slate-400'}`}>{type.title}</div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{type.desc}</p>
                        {model.type === type.id && <CheckCircle size={24} className="text-indigo-600 mt-6" />}
                    </button>
                ))}
            </div>
        </div>

        {/* Distribución de Márgenes Advanced */}
        <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <Percent size={32} className="text-indigo-600" />
                        Distribución de Márgenes
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Reparto de utilidad por transacción</p>
                </div>
                <button
                    onClick={distributeMargins}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100"
                >
                    <RefreshCw size={16} />
                    Auto-Distribuir
                </button>
            </div>

            {errors.margins && (
                <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600 animate-in shake">
                    <AlertCircle size={24} />
                    <span className="font-black text-xs uppercase tracking-widest">{errors.margins}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-12">
                    {/* Concesionario Slider */}
                    <MarginSlider 
                        label="Concesionario (Cafetería)" 
                        value={model.margins.concessionaireMargin} 
                        onChange={(v) => updateMargins('concessionaireMargin', v)} 
                        color="indigo" 
                    />
                    {/* Escuela Slider */}
                    <MarginSlider 
                        label="Colegio / Campus" 
                        value={model.margins.schoolMargin} 
                        onChange={(v) => updateMargins('schoolMargin', v)} 
                        color="emerald" 
                    />
                    {/* MeCard Slider */}
                    <MarginSlider 
                        label="MeCard Platform Fee" 
                        value={model.margins.mecardMargin} 
                        onChange={(v) => updateMargins('mecardMargin', v)} 
                        color="purple" 
                    />
                </div>

                {/* KPI Result Box */}
                <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator size={140}/></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black italic tracking-tight mb-8 text-indigo-400">Ejemplo Real de Dispersión</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                <span className="text-slate-400 font-black text-xs uppercase">Venta de Alumno:</span>
                                <span className="text-5xl font-black tracking-tighter">$100.00</span>
                            </div>
                            <div className="space-y-4 pt-4">
                                <SplitItem label="Cajero recibe" val={model.margins.concessionaireMargin} color="text-indigo-400" />
                                <SplitItem label="Escuela recibe" val={model.margins.schoolMargin} color="text-emerald-400" />
                                <SplitItem label="MeCard recibe" val={model.margins.mecardMargin} color="text-purple-400" />
                            </div>
                        </div>
                    </div>
                    <div className={`mt-10 p-6 rounded-3xl text-center border-2 transition-all ${marginsTotal === 100 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        <p className="font-black text-4xl tracking-tighter">{marginsTotal}%</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{marginsTotal === 100 ? 'Distribución Balanceada' : 'Error en Distribución'}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Costos y Límites Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Costos Operativos */}
            <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-sm space-y-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                    <CreditCard className="text-indigo-600" /> Costos de Card & Admin
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <InputField label="Emisión de Tarjeta" value={model.operatingCosts.cardIssuanceFee} onChange={v => setModel({...model, operatingCosts: {...model.operatingCosts, cardIssuanceFee: v}})} prefix="$" />
                    <InputField label="Reposición (Pérdida)" value={model.operatingCosts.replacementCardFee} onChange={v => setModel({...model, operatingCosts: {...model.operatingCosts, replacementCardFee: v}})} prefix="$" />
                    <InputField label="Admin Mensual Alumno" value={model.operatingCosts.monthlyMaintenanceFee} onChange={v => setModel({...model, operatingCosts: {...model.operatingCosts, monthlyMaintenanceFee: v}})} prefix="$" />
                </div>
            </div>

            {/* Límites */}
            <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-sm space-y-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                    <Wallet className="text-indigo-600" /> Límites de Monedero
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <InputField label="Gasto Diario Default" value={model.limits.maxDailySpend} onChange={v => setModel({...model, limits: {...model.limits, maxDailySpend: v}})} prefix="$" />
                    <InputField label="Recarga Mínima" value={model.limits.minRechargeAmount} onChange={v => setModel({...model, limits: {...model.limits, minRechargeAmount: v}})} prefix="$" />
                    <InputField label="Recarga Máxima" value={model.limits.maxRechargeAmount} onChange={v => setModel({...model, limits: {...model.limits, maxRechargeAmount: v}})} prefix="$" />
                </div>
            </div>
        </div>

        {/* Liquidaciones y Datos Bancarios */}
        <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-sm space-y-12">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                <Calendar className="text-indigo-600" /> Parámetros de Liquidación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Frecuencia de Dispersión</label>
                        <select
                            value={model.settlement.frequency}
                            onChange={(e) => setModel({...model, settlement: {...model.settlement, frequency: e.target.value as SettlementFrequency}})}
                            className="w-full px-8 py-6 bg-slate-50 border-none rounded-[32px] font-black text-lg text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner appearance-none"
                        >
                            <option value="DAILY">Corte Diario</option>
                            <option value="WEEKLY">Corte Semanal (Viernes)</option>
                            <option value="BIWEEKLY">Corte Quincenal</option>
                            <option value="MONTHLY">Corte Mensual</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Método de Liquidación</label>
                        <select
                            value={model.settlement.method}
                            onChange={(e) => setModel({...model, settlement: {...model.settlement, method: e.target.value as SettlementMethod}})}
                            className="w-full px-8 py-6 bg-slate-50 border-none rounded-[32px] font-black text-lg text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner appearance-none"
                        >
                            <option value="BANK_TRANSFER">Transferencia SPEI (STP)</option>
                            <option value="CHECK">Cheque Institucional</option>
                            <option value="CARD">Carga a Tarjeta Corporativa</option>
                        </select>
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-10 rounded-[48px] border border-indigo-100 space-y-6">
                    <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3"><Landmark size={18}/> Datos del Beneficiario</h4>
                    <div className="space-y-6">
                        <select
                            className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 outline-none"
                        >
                            <option>Seleccionar Banco Destino</option>
                            {BANKS.map(b => <option key={b}>{b}</option>)}
                        </select>
                        <input placeholder="CLABE Interbancaria (18 dígitos)" className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-mono text-indigo-900 outline-none" />
                        <input placeholder="Nombre de la Institución / Empresa" className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold text-indigo-900 outline-none" />
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100">
            <Button onClick={() => setShowPreview(!showPreview)} variant="secondary" className="rounded-[28px] px-10 py-6 font-black text-[10px] uppercase tracking-[4px]">
                {showPreview ? 'Ocultar JSON' : 'Debug Model'}
            </Button>
            <div className="flex gap-4">
                {onCancel && <Button onClick={onCancel} variant="ghost" className="text-slate-400 font-black">Cancelar</Button>}
                <Button 
                    onClick={handleSave} 
                    disabled={Object.keys(errors).length > 0} 
                    className="bg-indigo-600 px-16 py-8 rounded-[36px] font-black uppercase tracking-[6px] text-xs shadow-3xl shadow-indigo-100 hover:scale-105 transition-all"
                >
                    <Save className="mr-3"/> Guardar Configuración Global
                </Button>
            </div>
        </div>

        {showPreview && (
          <pre className="p-10 bg-slate-900 text-indigo-300 rounded-[48px] text-xs font-mono overflow-auto animate-in fade-in zoom-in">
            {JSON.stringify(model, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// Subcomponentes Internos
const MarginSlider = ({ label, value, onChange, color }: any) => {
    const accentColor = color === 'emerald' ? 'accent-emerald-500' : color === 'purple' ? 'accent-purple-500' : 'accent-indigo-600';
    const textColor = color === 'emerald' ? 'text-emerald-600' : color === 'purple' ? 'text-purple-600' : 'text-indigo-600';
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <span className={`text-4xl font-black tracking-tighter ${textColor}`}>{value}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={`w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer ${accentColor}`}
            />
        </div>
    );
};

const SplitItem = ({ label, val, color }: any) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`font-black text-xl ${color}`}>${val.toFixed(2)}</span>
    </div>
);

const InputField = ({ label, value, onChange, prefix }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">{prefix}</span>}
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className={`w-full border-none bg-slate-50 rounded-[32px] ${prefix ? 'pl-12' : 'pl-6'} pr-6 py-5 font-black text-2xl text-slate-700 shadow-inner outline-none focus:ring-4 focus:ring-indigo-100 transition-all`}
            />
        </div>
    </div>
);
