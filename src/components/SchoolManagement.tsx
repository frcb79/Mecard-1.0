import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  Edit,
  Mail,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap,
} from 'lucide-react';
import { BusinessModel, ContractType, School, SchoolStatus, TrialDuration } from '../types';
import { usePlatform } from '../contexts/PlatformContext';
import { checkTrialExpiry, getTrialWarningMessage } from '../services/trialService';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
}

const InputField = ({ label, value, onChange, type = 'text', prefix = '', suffix = '' }: InputFieldProps) => {
  const fieldId = `school-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        {prefix ? <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">{prefix}</span> : null}
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 ${prefix ? 'pl-9 pr-5' : 'px-5'} font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm`}
        />
        {suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">{suffix}</span> : null}
      </div>
    </div>
  );
};

interface ToggleSwitchProps {
  label: string;
  active: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

const ToggleSwitch = ({ label, active, onChange, description }: ToggleSwitchProps) => (
  <button
    onClick={() => onChange(!active)}
    role="switch"
    aria-checked={active}
    className="flex items-center justify-between w-full p-5 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all text-left"
  >
    <div className="max-w-[80%]">
      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">{label}</span>
      {description ? <span className="text-[9px] text-slate-400 font-bold leading-tight block mt-1">{description}</span> : null}
    </div>
    <div className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </button>
);

const DEFAULT_BUSINESS_MODEL: BusinessModel = {
  setupFee: 25000,
  annualFee: 15000,
  monthlyRentFee: 5000,
  parentAppFee: 25,
  saasPerStudent: 45,
  saasPerStaff: 25,
  chargeStaffUsage: false,
  cardDepositFeePercent: 3.5,
  speiDepositFeeFixed: 8,
  cafeteriaFeePercent: 5,
  cafeteriaFeeAutoMarkup: true,
  posMethods: {
    allowQrBarcode: true,
    allowMatricula: true,
    allowAnonymous: false,
  },
  margins: {
    concessionaireMargin: 85,
    schoolMargin: 10,
    mecardMargin: 5,
  },
  settlement: {
    frequency: 'WEEKLY',
    method: 'BANK_TRANSFER',
  },
};

const createDraftSchool = (school?: School): School => {
  if (school) {
    return {
      ...school,
      businessModel: school.businessModel || DEFAULT_BUSINESS_MODEL,
    };
  }

  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    legalName: '',
    rfc: '',
    logo: '🎓',
    studentCount: 0,
    balance: 0,
    unifiedBalance: true,
    status: SchoolStatus.PENDING,
    contractType: ContractType.TRIAL,
    trialDurationMonths: 1,
    onboardingStatus: 'PENDING',
    stpCostCenter: '',
    settlementCLABE: '',
    platformFeePercent: 4.5,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México',
    },
    contact: {
      email: '',
      phone: '',
      contactPerson: '',
      position: '',
    },
    branding: {
      primaryColor: '#4f46e5',
      secondaryColor: '#0f172a',
    },
    businessModel: DEFAULT_BUSINESS_MODEL,
    createdAt: now,
    updatedAt: now,
  };
};

interface SchoolWizardProps {
  school?: School;
  isSaving: boolean;
  onSave: (school: School) => Promise<void>;
  onCancel: () => void;
}

const SchoolWizard: React.FC<SchoolWizardProps> = ({ school, isSaving, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<School>(() => createDraftSchool(school));
  const [settlementMethod, setSettlementMethod] = useState<'BANK_TRANSFER' | 'CHECK'>(
    school?.businessModel?.settlement.method || 'BANK_TRANSFER',
  );

  const updateBusinessModel = (patch: Partial<BusinessModel>) => {
    setFormData((prev) => ({
      ...prev,
      businessModel: {
        ...prev.businessModel,
        ...patch,
      },
    }));
  };

  const updateMargins = (patch: Partial<BusinessModel['margins']>) => {
    setFormData((prev) => ({
      ...prev,
      businessModel: {
        ...prev.businessModel,
        margins: {
          ...prev.businessModel.margins,
          ...patch,
        },
      },
    }));
  };

  const updatePosMethods = (patch: Partial<BusinessModel['posMethods']>) => {
    setFormData((prev) => ({
      ...prev,
      businessModel: {
        ...prev.businessModel,
        posMethods: {
          ...prev.businessModel.posMethods,
          ...patch,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div role="dialog" aria-modal="true" aria-label="Configuración de colegio" className="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="bg-slate-900 text-white p-12 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><Building2 size={150} /></div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">Alta SaaS de Colegio</h2>
          <div className="flex gap-2 mt-4 relative z-10">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= item ? 'bg-indigo-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC]">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><Building2 size={20} className="text-indigo-600" /> Identidad del colegio</h3>
              <div className="grid grid-cols-2 gap-8">
                <InputField label="Nombre Comercial" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
                <InputField label="Razón Social" value={formData.legalName || ''} onChange={(value) => setFormData({ ...formData, legalName: value })} />
                <InputField label="RFC" value={formData.rfc || ''} onChange={(value) => setFormData({ ...formData, rfc: value.toUpperCase() })} />
                <InputField label="STP Cost Center" value={formData.stpCostCenter || ''} onChange={(value) => setFormData({ ...formData, stpCostCenter: value })} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><MapPin size={20} className="text-indigo-600" /> Dirección y contacto</h3>
              <div className="grid grid-cols-2 gap-8">
                <InputField label="Calle y Número" value={formData.address?.street || ''} onChange={(value) => setFormData({ ...formData, address: { ...formData.address!, street: value } })} />
                <InputField label="Ciudad" value={formData.address?.city || ''} onChange={(value) => setFormData({ ...formData, address: { ...formData.address!, city: value } })} />
                <InputField label="Estado" value={formData.address?.state || ''} onChange={(value) => setFormData({ ...formData, address: { ...formData.address!, state: value } })} />
                <InputField label="Código Postal" value={formData.address?.zipCode || ''} onChange={(value) => setFormData({ ...formData, address: { ...formData.address!, zipCode: value } })} />
              </div>
              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Mail size={16} /> Contacto principal</h4>
                <div className="grid grid-cols-2 gap-8">
                  <InputField label="Persona de Contacto" value={formData.contact?.contactPerson || ''} onChange={(value) => setFormData({ ...formData, contact: { ...formData.contact!, contactPerson: value } })} />
                  <InputField label="Cargo" value={formData.contact?.position || ''} onChange={(value) => setFormData({ ...formData, contact: { ...formData.contact!, position: value } })} />
                  <InputField label="Email" value={formData.contact?.email || ''} onChange={(value) => setFormData({ ...formData, contact: { ...formData.contact!, email: value } })} type="email" />
                  <InputField label="Teléfono" value={formData.contact?.phone || ''} onChange={(value) => setFormData({ ...formData, contact: { ...formData.contact!, phone: value } })} type="tel" />
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><ShieldCheck size={20} className="text-indigo-600" /> Modelo de negocio por colegio</h3>
              <div className="grid grid-cols-2 gap-8">
                <InputField label="Setup Fee" value={formData.businessModel.setupFee} onChange={(value) => updateBusinessModel({ setupFee: parseFloat(value) || 0 })} prefix="$" />
                <InputField label="Renta Mensual" value={formData.businessModel.monthlyRentFee} onChange={(value) => updateBusinessModel({ monthlyRentFee: parseFloat(value) || 0 })} prefix="$" />
                <InputField label="SaaS por Alumno" value={formData.businessModel.saasPerStudent} onChange={(value) => updateBusinessModel({ saasPerStudent: parseFloat(value) || 0 })} prefix="$" suffix="/mes" />
                <InputField label="Fee Depósitos Tarjeta" value={formData.businessModel.cardDepositFeePercent} onChange={(value) => updateBusinessModel({ cardDepositFeePercent: parseFloat(value) || 0 })} suffix="%" />
                <InputField label="Fee SPEI" value={formData.businessModel.speiDepositFeeFixed} onChange={(value) => updateBusinessModel({ speiDepositFeeFixed: parseFloat(value) || 0 })} prefix="$" />
                <InputField label="Comisión Cafetería" value={formData.businessModel.cafeteriaFeePercent} onChange={(value) => updateBusinessModel({ cafeteriaFeePercent: parseFloat(value) || 0 })} suffix="%" />
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Distribución cuando la operación es de concesionario</h4>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Concesionario" value={formData.businessModel.margins.concessionaireMargin} onChange={(value) => updateMargins({ concessionaireMargin: parseFloat(value) || 0 })} suffix="%" />
                  <InputField label="Escuela" value={formData.businessModel.margins.schoolMargin} onChange={(value) => updateMargins({ schoolMargin: parseFloat(value) || 0 })} suffix="%" />
                  <InputField label="MeCard" value={formData.businessModel.margins.mecardMargin} onChange={(value) => updateMargins({ mecardMargin: parseFloat(value) || 0 })} suffix="%" />
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><Terminal size={20} className="text-indigo-600" /> Operación POS</h3>
              <div className="space-y-4">
                <ToggleSwitch label="Escaneo QR / Código de Barras" active={formData.businessModel.posMethods.allowQrBarcode} onChange={(value) => updatePosMethods({ allowQrBarcode: value })} description="Permite credencial QR o código de barras en la venta." />
                <ToggleSwitch label="Búsqueda por Matrícula" active={formData.businessModel.posMethods.allowMatricula} onChange={(value) => updatePosMethods({ allowMatricula: value })} description="El operador puede teclear la matrícula del alumno." />
                <ToggleSwitch label="Venta Anónima" active={formData.businessModel.posMethods.allowAnonymous} onChange={(value) => updatePosMethods({ allowAnonymous: value })} description="Solo para ventas en efectivo sin alumno identificado." />
                <ToggleSwitch label="Auto-Markup Cafetería" active={formData.businessModel.cafeteriaFeeAutoMarkup} onChange={(value) => updateBusinessModel({ cafeteriaFeeAutoMarkup: value })} description="Suma automáticamente la comisión al precio final." />
                <ToggleSwitch label="Cobrar uso a personal" active={formData.businessModel.chargeStaffUsage} onChange={(value) => updateBusinessModel({ chargeStaffUsage: value })} description="Incluye licencias o uso de staff en el cobro mensual." />
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-12 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-6"><CalendarDays size={20} className="text-indigo-600" /> Contrato y liquidación</h3>
              <div className="bg-slate-900 rounded-[32px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10"><CalendarDays size={120} /></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black italic uppercase mb-2 tracking-tighter">Configuración del contrato</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Define el estatus comercial del servicio</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block ml-1">Modalidad</label>
                      <div className="flex gap-4">
                        {(['TRIAL', 'STANDARD'] as ContractType[]).map((contractType) => (
                          <button
                            key={contractType}
                            onClick={() => setFormData({ ...formData, contractType })}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.contractType === contractType ? 'bg-white text-slate-900 border-white' : 'border-white/10 text-white hover:bg-white/5'}`}
                          >
                            {contractType === 'TRIAL' ? 'Prueba' : 'Maestro'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.contractType === 'TRIAL' ? (
                      <div className="space-y-4 animate-in slide-in-from-left-4">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block ml-1">Duración de Prueba</label>
                        <div className="flex gap-3">
                          {([1, 2, 3] as TrialDuration[]).map((months) => (
                            <button
                              key={months}
                              onClick={() => setFormData({ ...formData, trialDurationMonths: months })}
                              className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.trialDurationMonths === months ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}
                            >
                              {months} {months === 1 ? 'Mes' : 'Meses'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 pt-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frecuencia de dispersión</label>
                  <select
                    value={formData.businessModel.settlement.frequency}
                    onChange={(event) => updateBusinessModel({ settlement: { ...formData.businessModel.settlement, frequency: event.target.value as BusinessModel['settlement']['frequency'] } })}
                    className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase tracking-widest outline-none shadow-sm"
                  >
                    <option value="WEEKLY">Semanal</option>
                    <option value="BIWEEKLY">Quincenal</option>
                    <option value="MONTHLY">Mensual</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de liquidación</label>
                  <div className="flex gap-4">
                    {(['BANK_TRANSFER', 'CHECK'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSettlementMethod(method);
                          updateBusinessModel({ settlement: { ...formData.businessModel.settlement, method } });
                        }}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${settlementMethod === method ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'}`}
                      >
                        {method === 'BANK_TRANSFER' ? 'Transferencia SPEI' : 'Cheque'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-12 bg-white border-t border-slate-100 flex justify-between shrink-0">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : null)}
            disabled={step === 1 || isSaving}
            className="px-10 py-5 bg-white text-slate-400 rounded-[24px] font-black uppercase text-[11px] border-2 border-slate-100 disabled:opacity-30"
          >
            Anterior
          </button>

          <div className="flex gap-4">
            <button onClick={onCancel} disabled={isSaving} className="px-10 py-5 text-slate-300 font-black uppercase text-[11px] hover:text-rose-500 transition-colors disabled:opacity-30">
              Cancelar
            </button>
            {step < 5 ? (
              <button onClick={() => setStep(step + 1)} className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[11px] shadow-xl hover:scale-105 transition-all">
                Siguiente fase
              </button>
            ) : (
              <button onClick={() => void onSave(formData)} disabled={isSaving} className="px-14 py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[11px] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100">
                {isSaving ? 'Guardando...' : 'Guardar colegio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SchoolManagement: React.FC = () => {
  const { schools, isLoading, saveSchool } = usePlatform();
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const filteredSchools = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return schools;
    }

    return schools.filter((school) =>
      [school.name, school.legalName, school.rfc, school.stpCostCenter]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [schools, searchTerm]);

  const handleSave = async (school: School) => {
    setIsSaving(true);
    await saveSchool({
      ...school,
      id: school.id || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: school.createdAt || new Date().toISOString(),
    });
    setIsSaving(false);
    setShowWizard(false);
    setEditingSchool(undefined);
  };

  return (
    <div className="p-12 h-full bg-[#FDFDFD] overflow-y-auto pb-40">
      <header className="mb-16 flex flex-wrap justify-between items-end gap-6">
        <div>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">Network Infrastructure</p>
          <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Gestión de Colegios</h1>
          <p className="text-sm text-slate-400 font-bold mt-4">Alta comercial, configuración base y operación SaaS por institución.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar colegio"
              className="pl-11 pr-5 py-4 rounded-[24px] bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none min-w-[280px]"
            />
          </div>

          <button
            onClick={() => {
              setEditingSchool(undefined);
              setShowWizard(true);
            }}
            className="bg-indigo-600 px-10 py-5 rounded-[28px] text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> Nuevo Colegio
          </button>
        </div>
      </header>

      <div className="space-y-4 mb-12">
        {schools.map((school) => {
          if (school.contractType !== 'TRIAL') {
            return null;
          }

          const status = checkTrialExpiry(school.createdAt, school.trialDurationMonths || 1);
          const message = getTrialWarningMessage(status, school.name);
          if (!message) {
            return null;
          }

          return (
            <div key={school.id} className={`p-6 rounded-3xl border flex items-center justify-between ${status.isExpired ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
              <div className="flex items-center gap-4">
                <Zap size={20} className={status.isExpired ? 'animate-pulse' : ''} />
                <p className="text-xs font-black uppercase tracking-widest">{message}</p>
              </div>
              <button onClick={() => { setEditingSchool(school); setShowWizard(true); }} className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                Actualizar contrato
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-32 text-center">
            <p className="text-sm font-black uppercase tracking-[8px] text-slate-300">Cargando colegios...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Institución</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:bg-white group-hover:scale-110 transition-all">{school.logo}</div>
                      <div>
                        <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-2">{school.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">STP CC: {school.stpCostCenter || 'Pendiente'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${school.contractType === 'TRIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {school.contractType} {school.contractType === 'TRIAL' ? `(${school.trialDurationMonths}M)` : ''}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2 text-xs font-bold text-slate-500">
                      <p>Setup: ${school.businessModel.setupFee.toLocaleString('es-MX')}</p>
                      <p>SaaS: ${school.businessModel.saasPerStudent.toLocaleString('es-MX')} / alumno</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className={`w-2 h-2 rounded-full ${school.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} /> {school.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingSchool(school); setShowWizard(true); }} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all" aria-label={`Editar ${school.name}`}>
                        <Edit size={18} />
                      </button>
                      <button disabled className="p-4 bg-white border border-slate-100 text-slate-200 rounded-2xl shadow-sm transition-all cursor-not-allowed" aria-label={`Eliminar ${school.name}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && filteredSchools.length === 0 ? (
          <div className="py-40 text-center opacity-20 grayscale flex flex-col items-center">
            <Search size={100} strokeWidth={1} className="mb-6" />
            <p className="font-black uppercase tracking-[15px]">Sin Colegios</p>
          </div>
        ) : null}
      </div>

      {showWizard ? (
        <SchoolWizard
          school={editingSchool}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => {
            if (isSaving) {
              return;
            }
            setShowWizard(false);
            setEditingSchool(undefined);
          }}
        />
      ) : null}
    </div>
  );
};

export default SchoolManagement;