import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Landmark,
  RefreshCw,
  Save,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePlatform } from '../../contexts/PlatformContext';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { logger } from '../../lib/logger';

type ModelKey = 'rent' | 'saas' | 'commission' | 'custom';
type PricingModelCode = 'A' | 'B' | 'C' | 'CUSTOM';
type SimulationStatus = 'draft' | 'proposed' | 'accepted' | 'closed' | 'archived';
type PosOwnership = 'SCHOOL' | 'CONCESSIONAIRE' | 'MIXED';

interface SchoolProfile {
  name: string;
  students: number;
  units: number;
  avgTicket: number;
  buyerPercent: number;
  operatingDays: number;
  depositMix: { card: number; spei: number; oxxo: number; cash: number };
  avgBalancePerStudent: number;
  annualYieldRate: number;
  breakagePercent: number;
  giftVolumePercent: number;
  giftMarginPercent: number;
  credentialReplacementRate: number;
  credentialReplacementFee: number;
  posOwnership: PosOwnership;
}

interface PricingModel {
  label: string;
  key: ModelKey;
  setupFee: number;
  monthlyRent: number;
  annualLicense: number;
  saasPerStudent: number;
  cafeteriaFeePercent: number;
  depositFeeCard: number;
  depositFeeSPEI: number;
  depositFeeOXXO: number;
  yearlyCardCost: number;
  mecardMargin: number;
}

interface RevenueBreakdown {
  monthlyCafeteriaSales: number;
  annualCafeteriaSales: number;
  setup: number;
  rent: number;
  saas: number;
  depositCard: number;
  depositSPEI: number;
  depositOXXO: number;
  grossCafeteriaCommission: number;
  schoolShare: number;
  concessionaireShare: number;
  mecardNetShare: number;
  credentialIssuance: number;
  credentialReplacement: number;
  floatIncome: number;
  breakage: number;
  giftMargin: number;
  operationalTotal: number;
  financialTotal: number;
  total: number;
}

interface BreakdownRow {
  label: string;
  formula: string;
  value: number;
  section: 'operational' | 'financial' | 'summary';
}

interface SimulationRow {
  id: string;
  name: string;
  status: SimulationStatus;
  pricing_model: PricingModelCode;
  school_profile: SchoolProfile;
  model_inputs: PricingModel;
  created_at: string;
}

const MODEL_PRESETS: Record<Exclude<ModelKey, 'custom'>, Omit<PricingModel, 'label' | 'key'>> = {
  rent: {
    setupFee: 25000,
    monthlyRent: 5000,
    annualLicense: 0,
    saasPerStudent: 0,
    cafeteriaFeePercent: 3,
    depositFeeCard: 3.5,
    depositFeeSPEI: 8,
    depositFeeOXXO: 10.5,
    yearlyCardCost: 140,
    mecardMargin: 5,
  },
  saas: {
    setupFee: 15000,
    monthlyRent: 0,
    annualLicense: 0,
    saasPerStudent: 45,
    cafeteriaFeePercent: 3,
    depositFeeCard: 3.5,
    depositFeeSPEI: 8,
    depositFeeOXXO: 10.5,
    yearlyCardCost: 140,
    mecardMargin: 5,
  },
  commission: {
    setupFee: 0,
    monthlyRent: 0,
    annualLicense: 0,
    saasPerStudent: 0,
    cafeteriaFeePercent: 8,
    depositFeeCard: 5,
    depositFeeSPEI: 8,
    depositFeeOXXO: 10.5,
    yearlyCardCost: 140,
    mecardMargin: 10,
  },
};

const MODELS: PricingModel[] = [
  { label: 'Modelo A — Renta Fija', key: 'rent', ...MODEL_PRESETS.rent },
  { label: 'Modelo B — SaaS por alumno', key: 'saas', ...MODEL_PRESETS.saas },
  { label: 'Modelo C — Comisión pura', key: 'commission', ...MODEL_PRESETS.commission },
];

const DEFAULT_PROFILE: SchoolProfile = {
  name: '',
  students: 500,
  units: 2,
  avgTicket: 60,
  buyerPercent: 60,
  operatingDays: 22,
  depositMix: { card: 50, spei: 30, oxxo: 10, cash: 10 },
  avgBalancePerStudent: 120,
  annualYieldRate: 10.5,
  breakagePercent: 6,
  giftVolumePercent: 5,
  giftMarginPercent: 20,
  credentialReplacementRate: 8,
  credentialReplacementFee: 80,
  posOwnership: 'SCHOOL',
};

const modelCodeByKey: Record<ModelKey, PricingModelCode> = {
  rent: 'A',
  saas: 'B',
  commission: 'C',
  custom: 'CUSTOM',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

function getActiveModel(activeModel: ModelKey, customModel: PricingModel) {
  return activeModel === 'custom' ? customModel : MODELS.find((model) => model.key === activeModel) || customModel;
}

function calcRevenue(profile: SchoolProfile, model: PricingModel): RevenueBreakdown {
  const monthlyCafeteriaSales = profile.students * profile.avgTicket * (profile.buyerPercent / 100) * profile.operatingDays;
  const annualCafeteriaSales = monthlyCafeteriaSales * 12;
  const depositTxCount = annualCafeteriaSales / Math.max(profile.avgTicket, 1);

  const setup = model.setupFee;
  const rent = model.monthlyRent * 12;
  const saas = model.saasPerStudent * profile.students * 12;
  const depositCard = annualCafeteriaSales * (profile.depositMix.card / 100) * (model.depositFeeCard / 100);
  const depositSPEI = depositTxCount * (profile.depositMix.spei / 100) * model.depositFeeSPEI;
  const depositOXXO = depositTxCount * (profile.depositMix.oxxo / 100) * model.depositFeeOXXO;
  const grossCafeteriaCommission = annualCafeteriaSales * (model.cafeteriaFeePercent / 100);
  const mecardNetShare = grossCafeteriaCommission * (model.mecardMargin / 100);

  const residualShare = Math.max(100 - model.mecardMargin, 0);
  const schoolShareBase = grossCafeteriaCommission * (residualShare / 100);
  const schoolShare = profile.posOwnership === 'CONCESSIONAIRE' ? schoolShareBase * 0.3 : schoolShareBase;
  const concessionaireShare = profile.posOwnership === 'SCHOOL' ? 0 : schoolShareBase - schoolShare;

  const credentialIssuance = profile.students * model.yearlyCardCost;
  const credentialReplacement = profile.students * (profile.credentialReplacementRate / 100) * profile.credentialReplacementFee;
  const totalFloat = profile.students * profile.avgBalancePerStudent;
  const floatIncome = totalFloat * (profile.annualYieldRate / 100);
  const breakage = annualCafeteriaSales * (profile.breakagePercent / 100);
  const giftVolume = annualCafeteriaSales * (profile.giftVolumePercent / 100);
  const giftMargin = giftVolume * (profile.giftMarginPercent / 100);

  const operationalTotal = setup + rent + saas + depositCard + depositSPEI + depositOXXO + mecardNetShare + credentialIssuance + credentialReplacement;
  const financialTotal = floatIncome + breakage + giftMargin;
  const total = operationalTotal + financialTotal;

  return {
    monthlyCafeteriaSales,
    annualCafeteriaSales,
    setup,
    rent,
    saas,
    depositCard,
    depositSPEI,
    depositOXXO,
    grossCafeteriaCommission,
    schoolShare,
    concessionaireShare,
    mecardNetShare,
    credentialIssuance,
    credentialReplacement,
    floatIncome,
    breakage,
    giftMargin,
    operationalTotal,
    financialTotal,
    total,
  };
}

function buildBreakdownRows(profile: SchoolProfile, model: PricingModel, breakdown: RevenueBreakdown): BreakdownRow[] {
  return [
    {
      label: 'Ventas cafetería mensual',
      formula: `${profile.students} alumnos x ${formatCurrency(profile.avgTicket)} x ${formatPercent(profile.buyerPercent)} x ${profile.operatingDays} días`,
      value: breakdown.monthlyCafeteriaSales,
      section: 'summary',
    },
    {
      label: 'Ventas cafetería anual',
      formula: `${formatCurrency(breakdown.monthlyCafeteriaSales)} x 12`,
      value: breakdown.annualCafeteriaSales,
      section: 'summary',
    },
    {
      label: 'Setup fee',
      formula: 'Cobro único de implementación',
      value: breakdown.setup,
      section: 'operational',
    },
    {
      label: 'Renta mensual',
      formula: `${formatCurrency(model.monthlyRent)} x 12`,
      value: breakdown.rent,
      section: 'operational',
    },
    {
      label: 'SaaS por alumno',
      formula: `${profile.students} alumnos x ${formatCurrency(model.saasPerStudent)} x 12`,
      value: breakdown.saas,
      section: 'operational',
    },
    {
      label: 'Fee depósitos tarjeta',
      formula: `${formatCurrency(breakdown.annualCafeteriaSales)} x ${formatPercent(profile.depositMix.card)} x ${formatPercent(model.depositFeeCard)}`,
      value: breakdown.depositCard,
      section: 'operational',
    },
    {
      label: 'Fee depósitos SPEI',
      formula: `Tx estimadas x ${formatPercent(profile.depositMix.spei)} x ${formatCurrency(model.depositFeeSPEI)}`,
      value: breakdown.depositSPEI,
      section: 'operational',
    },
    {
      label: 'Fee depósitos OXXO',
      formula: `Tx estimadas x ${formatPercent(profile.depositMix.oxxo)} x ${formatCurrency(model.depositFeeOXXO)}`,
      value: breakdown.depositOXXO,
      section: 'operational',
    },
    {
      label: 'Comisión bruta cafetería',
      formula: `${formatCurrency(breakdown.annualCafeteriaSales)} x ${formatPercent(model.cafeteriaFeePercent)}`,
      value: breakdown.grossCafeteriaCommission,
      section: 'operational',
    },
    {
      label: 'Margen neto MeCard sobre comisión cafetería',
      formula: `${formatCurrency(breakdown.grossCafeteriaCommission)} x ${formatPercent(model.mecardMargin)}`,
      value: breakdown.mecardNetShare,
      section: 'operational',
    },
    {
      label: profile.posOwnership === 'SCHOOL' ? 'Participación colegio' : 'Participación colegio desde concesionario',
      formula: 'Parte del remanente comercial después del margen MeCard',
      value: breakdown.schoolShare,
      section: 'operational',
    },
    {
      label: 'Participación concesionario',
      formula: profile.posOwnership === 'SCHOOL' ? 'No aplica' : 'Resto del remanente comercial',
      value: breakdown.concessionaireShare,
      section: 'operational',
    },
    {
      label: 'Emisión de credenciales',
      formula: `${profile.students} alumnos x ${formatCurrency(model.yearlyCardCost)}`,
      value: breakdown.credentialIssuance,
      section: 'operational',
    },
    {
      label: 'Reposiciones de credencial',
      formula: `${profile.students} alumnos x ${formatPercent(profile.credentialReplacementRate)} x ${formatCurrency(profile.credentialReplacementFee)}`,
      value: breakdown.credentialReplacement,
      section: 'operational',
    },
    {
      label: 'Rendimiento float',
      formula: `${profile.students} alumnos x ${formatCurrency(profile.avgBalancePerStudent)} x ${formatPercent(profile.annualYieldRate)}`,
      value: breakdown.floatIncome,
      section: 'financial',
    },
    {
      label: 'Breakage',
      formula: `${formatCurrency(breakdown.annualCafeteriaSales)} x ${formatPercent(profile.breakagePercent)}`,
      value: breakdown.breakage,
      section: 'financial',
    },
    {
      label: 'Margen gifts y colectas',
      formula: `${formatCurrency(breakdown.annualCafeteriaSales)} x ${formatPercent(profile.giftVolumePercent)} x ${formatPercent(profile.giftMarginPercent)}`,
      value: breakdown.giftMargin,
      section: 'financial',
    },
  ];
}

function Slider({ label, value, min, max, step, suffix, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{suffix === '$' ? formatCurrency(value) : `${value}${suffix || ''}`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{suffix === '$' ? formatCurrency(min) : `${min}${suffix || ''}`}</span>
        <span>{suffix === '$' ? formatCurrency(max) : `${max}${suffix || ''}`}</span>
      </div>
    </div>
  );
}

function FieldRow({ label, value, unit, onChange }: {
  label: string;
  value: number;
  unit: '$' | '%';
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-600 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {unit === '$' ? <span className="text-xs text-slate-400">$</span> : null}
        <input
          type="number"
          value={value}
          min={0}
          step={unit === '%' ? 0.5 : 50}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-24 text-right text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        {unit === '%' ? <span className="text-xs text-slate-400">%</span> : null}
      </div>
    </div>
  );
}

export default function CommercialSimulator() {
  const { schools, updateSchoolModel } = usePlatform();
  const { user } = useAuth();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_PROFILE);
  const [activeModel, setActiveModel] = useState<ModelKey>('rent');
  const [customModel, setCustomModel] = useState<PricingModel>({ label: 'Personalizado', key: 'custom', ...MODEL_PRESETS.rent });
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [simulations, setSimulations] = useState<SimulationRow[]>([]);
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [selectedSchoolId, schools]);

  useEffect(() => {
    const selectedSchool = schools.find((school) => school.id === selectedSchoolId);
    if (!selectedSchool) {
      return;
    }

    setProfile((current) => ({
      ...current,
      name: selectedSchool.name,
      students: selectedSchool.studentCount || current.students,
    }));
  }, [selectedSchoolId, schools]);

  useEffect(() => {
    if (!selectedSchoolId || !isSupabaseConfigured) {
      setSimulations([]);
      return;
    }

    const loadSimulations = async () => {
      const { data, error } = await supabase
        .from('school_simulations')
        .select('id, name, status, pricing_model, school_profile, model_inputs, created_at')
        .eq('school_id', selectedSchoolId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('commercial-simulator', 'Error loading school simulations', error, { schoolId: selectedSchoolId });
        setSimulations([]);
        return;
      }

      setSimulations((data || []) as SimulationRow[]);
    };

    void loadSimulations();
  }, [selectedSchoolId]);

  const updateProfile = (patch: Partial<SchoolProfile>) => setProfile((current) => ({ ...current, ...patch }));
  const updateMix = (key: keyof SchoolProfile['depositMix'], value: number) => {
    setProfile((current) => ({
      ...current,
      depositMix: { ...current.depositMix, [key]: value },
    }));
  };

  const activeModelData = getActiveModel(activeModel, customModel);

  const revenues = useMemo(() => {
    const results: Record<ModelKey, RevenueBreakdown> = {
      rent: calcRevenue(profile, MODELS[0]),
      saas: calcRevenue(profile, MODELS[1]),
      commission: calcRevenue(profile, MODELS[2]),
      custom: calcRevenue(profile, customModel),
    };
    return results;
  }, [customModel, profile]);

  const currentRevenue = revenues[activeModel];
  const breakdownRows = useMemo(() => buildBreakdownRows(profile, activeModelData, currentRevenue), [activeModelData, currentRevenue, profile]);

  const comparisonData = useMemo(() => {
    const keys: Array<keyof RevenueBreakdown> = ['operationalTotal', 'financialTotal', 'total', 'monthlyCafeteriaSales', 'annualCafeteriaSales'];
    const labels: Record<string, string> = {
      operationalTotal: 'Operacional',
      financialTotal: 'Financiero',
      total: 'Total',
      monthlyCafeteriaSales: 'Venta mensual',
      annualCafeteriaSales: 'Venta anual',
    };

    return keys.map((key) => ({
      name: labels[key],
      'Renta Fija': revenues.rent[key],
      'SaaS': revenues.saas[key],
      'Comisión': revenues.commission[key],
    }));
  }, [revenues]);

  const projectionData = useMemo(() => {
    const monthlyOperational = (currentRevenue.operationalTotal - currentRevenue.setup) / 12;
    const monthlyFinancial = currentRevenue.financialTotal / 12;
    return Array.from({ length: 12 }, (_, index) => ({
      mes: `Mes ${index + 1}`,
      operacional: Math.round((index === 0 ? currentRevenue.setup : 0) + monthlyOperational * (index + 1)),
      financiero: Math.round(monthlyFinancial * (index + 1)),
      total: Math.round((index === 0 ? currentRevenue.setup : 0) + monthlyOperational * (index + 1) + monthlyFinancial * (index + 1)),
    }));
  }, [currentRevenue]);

  const saveSimulation = async (status: SimulationStatus, applyToSchool = false) => {
    if (!selectedSchoolId || !isSupabaseConfigured) {
      setSaveMessage('Selecciona una escuela y asegúrate de tener Supabase configurado.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const payload = {
      school_id: selectedSchoolId,
      name: `${profile.name || 'Colegio'} · ${activeModelData.label}`,
      status,
      pricing_model: modelCodeByKey[activeModel],
      school_profile: profile,
      operator_model: {
        posOwnership: profile.posOwnership,
      },
      model_inputs: activeModelData,
      breakdown: {
        summary: currentRevenue,
        lines: breakdownRows,
      },
      updated_by: user?.id || null,
      created_by: user?.id || null,
    };

    const query = selectedSimulationId
      ? supabase.from('school_simulations').update(payload).eq('id', selectedSimulationId).select('id, name, status, pricing_model, school_profile, model_inputs, created_at').single()
      : supabase.from('school_simulations').insert(payload).select('id, name, status, pricing_model, school_profile, model_inputs, created_at').single();

    const { data, error } = await query;

    if (error) {
      logger.error('commercial-simulator', 'Error saving simulation', error, { schoolId: selectedSchoolId });
      setSaveMessage('No se pudo guardar la simulación.');
      setIsSaving(false);
      return;
    }

    const savedSimulation = data as SimulationRow;
    setSelectedSimulationId(savedSimulation.id);
    setSimulations((current) => [savedSimulation, ...current.filter((item) => item.id !== savedSimulation.id)]);

    if (applyToSchool) {
      await updateSchoolModel(selectedSchoolId, {
        setupFee: activeModelData.setupFee,
        monthlyRentFee: activeModelData.monthlyRent,
        saasPerStudent: activeModelData.saasPerStudent,
        cafeteriaFeePercent: activeModelData.cafeteriaFeePercent,
        cardDepositFeePercent: activeModelData.depositFeeCard,
        speiDepositFeeFixed: activeModelData.depositFeeSPEI,
        margins: {
          concessionaireMargin: profile.posOwnership === 'SCHOOL' ? 0 : 85,
          schoolMargin: profile.posOwnership === 'CONCESSIONAIRE' ? 15 : 95,
          mecardMargin: activeModelData.mecardMargin,
        },
      });

      const { error: businessModelError } = await supabase
        .from('school_business_models')
        .upsert({
          school_id: selectedSchoolId,
          pricing_model: modelCodeByKey[activeModel],
          status: 'accepted',
          business_model: {
            ...activeModelData,
            posOwnership: profile.posOwnership,
          },
          revenue_rules: {
            avgBalanceRange: { min: 0, max: 1000 },
            monthlyCafeteriaSales: currentRevenue.monthlyCafeteriaSales,
            annualCafeteriaSales: currentRevenue.annualCafeteriaSales,
            credentialReplacementRate: profile.credentialReplacementRate,
            credentialReplacementFee: profile.credentialReplacementFee,
          },
          pos_configuration: {
            ownerType: profile.posOwnership,
          },
          proposal_summary: {
            simulatorStatus: status,
            simulationId: savedSimulation.id,
          },
          updated_by: user?.id || null,
          created_by: user?.id || null,
        });

      if (businessModelError) {
        logger.error('commercial-simulator', 'Error syncing business model', businessModelError, { schoolId: selectedSchoolId });
        setSaveMessage('La simulación se guardó, pero no se pudo aplicar al colegio.');
        setIsSaving(false);
        return;
      }
    }

    setSaveMessage(applyToSchool ? 'Modelo aplicado al colegio.' : status === 'proposed' ? 'Propuesta guardada para el colegio.' : 'Simulación guardada.');
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center">
            <Calculator size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Simulador Comercial por Colegio</h1>
            <p className="text-xs text-slate-500">Calcula, propone y cierra el modelo de negocio para una escuela específica.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSchoolId}
            onChange={(event) => setSelectedSchoolId(event.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none min-w-[260px]"
          >
            <option value="">Selecciona un colegio</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
          <button onClick={() => void saveSimulation('draft')} disabled={isSaving || !selectedSchoolId} className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2">
            <Save size={14} /> Guardar borrador
          </button>
          <button onClick={() => void saveSimulation('proposed')} disabled={isSaving || !selectedSchoolId} className="px-4 py-2.5 rounded-2xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2">
            <Send size={14} /> Proponer
          </button>
          <button onClick={() => void saveSimulation('accepted', true)} disabled={isSaving || !selectedSchoolId} className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2">
            <TrendingUp size={14} /> Cerrar y aplicar
          </button>
        </div>
      </div>

      {saveMessage ? (
        <div className="px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-800">Perfil del Colegio</h2>
            </div>

            <Slider label="Número de estudiantes" value={profile.students} min={50} max={5000} step={50} onChange={(value) => updateProfile({ students: value })} />
            <Slider label="POS / Unidades" value={profile.units} min={1} max={20} step={1} onChange={(value) => updateProfile({ units: value })} />
            <Slider label="Ticket promedio" value={profile.avgTicket} min={20} max={150} step={5} suffix="$" onChange={(value) => updateProfile({ avgTicket: value })} />
            <Slider label="Alumnos que compran diario" value={profile.buyerPercent} min={10} max={100} step={5} suffix="%" onChange={(value) => updateProfile({ buyerPercent: value })} />
            <Slider label="Días operativos/mes" value={profile.operatingDays} min={15} max={25} step={1} onChange={(value) => updateProfile({ operatingDays: value })} />
            <Slider label="Saldo promedio alumno" value={profile.avgBalancePerStudent} min={0} max={1000} step={25} suffix="$" onChange={(value) => updateProfile({ avgBalancePerStudent: value })} />
            <Slider label="Tasa rendimiento anual" value={profile.annualYieldRate} min={4} max={15} step={0.5} suffix="%" onChange={(value) => updateProfile({ annualYieldRate: value })} />
            <Slider label="Breakage" value={profile.breakagePercent} min={0} max={15} step={0.5} suffix="%" onChange={(value) => updateProfile({ breakagePercent: value })} />
            <Slider label="Volumen gifts" value={profile.giftVolumePercent} min={0} max={20} step={1} suffix="%" onChange={(value) => updateProfile({ giftVolumePercent: value })} />
            <Slider label="Margen gifts" value={profile.giftMarginPercent} min={5} max={40} step={1} suffix="%" onChange={(value) => updateProfile({ giftMarginPercent: value })} />
            <Slider label="Reposición credencial" value={profile.credentialReplacementRate} min={0} max={30} step={1} suffix="%" onChange={(value) => updateProfile({ credentialReplacementRate: value })} />
            <Slider label="Fee reposición" value={profile.credentialReplacementFee} min={0} max={200} step={10} suffix="$" onChange={(value) => updateProfile({ credentialReplacementFee: value })} />

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-700">Mix de Depósito</p>
              <Slider label="Tarjeta" value={profile.depositMix.card} min={0} max={100} step={5} suffix="%" onChange={(value) => updateMix('card', value)} />
              <Slider label="SPEI" value={profile.depositMix.spei} min={0} max={100} step={5} suffix="%" onChange={(value) => updateMix('spei', value)} />
              <Slider label="OXXO" value={profile.depositMix.oxxo} min={0} max={100} step={5} suffix="%" onChange={(value) => updateMix('oxxo', value)} />
              <Slider label="Efectivo" value={profile.depositMix.cash} min={0} max={100} step={5} suffix="%" onChange={(value) => updateMix('cash', value)} />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-700">Operador de la POS</p>
              <div className="grid grid-cols-3 gap-2">
                {(['SCHOOL', 'CONCESSIONAIRE', 'MIXED'] as PosOwnership[]).map((ownership) => (
                  <button
                    key={ownership}
                    onClick={() => updateProfile({ posOwnership: ownership })}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${profile.posOwnership === ownership ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {ownership === 'SCHOOL' ? 'Colegio' : ownership === 'CONCESSIONAIRE' ? 'Conces.' : 'Mixto'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-800">Simulaciones guardadas</h2>
            </div>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {simulations.map((simulation) => (
                <button
                  key={simulation.id}
                  onClick={() => {
                    setSelectedSimulationId(simulation.id);
                    setProfile(simulation.school_profile);
                    setActiveModel(
                      simulation.pricing_model === 'A'
                        ? 'rent'
                        : simulation.pricing_model === 'B'
                          ? 'saas'
                          : simulation.pricing_model === 'C'
                            ? 'commission'
                            : 'custom',
                    );
                    setCustomModel({ ...simulation.model_inputs, key: 'custom', label: 'Personalizado' });
                  }}
                  className={`w-full text-left p-3 rounded-2xl border ${selectedSimulationId === simulation.id ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <p className="text-xs font-black text-slate-800">{simulation.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{simulation.status} · {simulation.pricing_model}</p>
                </button>
              ))}
              {simulations.length === 0 ? <p className="text-xs text-slate-400">Sin simulaciones guardadas para este colegio.</p> : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={16} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-800">Modelo de negocio</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[...MODELS, { label: 'Personalizado', key: 'custom' as ModelKey }].map((model) => (
                <button
                  key={model.key}
                  onClick={() => setActiveModel(model.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeModel === model.key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {model.key === 'rent' ? 'A. Renta' : model.key === 'saas' ? 'B. SaaS' : model.key === 'commission' ? 'C. Comisión' : 'Personalizado'}
                </button>
              ))}
            </div>

            {activeModel === 'custom' ? (
              <div className="space-y-3 pt-2">
                <FieldRow label="Setup Fee" value={customModel.setupFee} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, setupFee: value }))} />
                <FieldRow label="Renta mensual" value={customModel.monthlyRent} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, monthlyRent: value }))} />
                <FieldRow label="SaaS por alumno" value={customModel.saasPerStudent} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, saasPerStudent: value }))} />
                <FieldRow label="Comisión cafetería" value={customModel.cafeteriaFeePercent} unit="%" onChange={(value) => setCustomModel((current) => ({ ...current, cafeteriaFeePercent: value }))} />
                <FieldRow label="Fee depósito tarjeta" value={customModel.depositFeeCard} unit="%" onChange={(value) => setCustomModel((current) => ({ ...current, depositFeeCard: value }))} />
                <FieldRow label="Fee depósito SPEI" value={customModel.depositFeeSPEI} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, depositFeeSPEI: value }))} />
                <FieldRow label="Fee depósito OXXO" value={customModel.depositFeeOXXO} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, depositFeeOXXO: value }))} />
                <FieldRow label="Emisión credencial" value={customModel.yearlyCardCost} unit="$" onChange={(value) => setCustomModel((current) => ({ ...current, yearlyCardCost: value }))} />
                <FieldRow label="Margen neto MeCard" value={customModel.mecardMargin} unit="%" onChange={(value) => setCustomModel((current) => ({ ...current, mecardMargin: value }))} />
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {[
                  ['Setup Fee', formatCurrency(activeModelData.setupFee)],
                  ['Renta mensual', formatCurrency(activeModelData.monthlyRent)],
                  ['SaaS por alumno', formatCurrency(activeModelData.saasPerStudent)],
                  ['Comisión cafetería', formatPercent(activeModelData.cafeteriaFeePercent)],
                  ['Fee dep. tarjeta', formatPercent(activeModelData.depositFeeCard)],
                  ['Fee dep. SPEI', formatCurrency(activeModelData.depositFeeSPEI)],
                  ['Fee dep. OXXO', formatCurrency(activeModelData.depositFeeOXXO)],
                  ['Emisión credencial', formatCurrency(activeModelData.yearlyCardCost)],
                  ['Margen neto MeCard', formatPercent(activeModelData.mecardMargin)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeModel === 'custom' ? (
              <div className="flex gap-2">
                {(['rent', 'saas', 'commission'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomModel((current) => ({ ...current, ...MODEL_PRESETS[preset] }))}
                    className="flex-1 text-[10px] py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <RefreshCw size={10} className="inline mr-1" /> Copiar {preset === 'rent' ? 'A' : preset === 'saas' ? 'B' : 'C'}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { label: 'Revenue total anual', value: formatCurrency(currentRevenue.total), icon: TrendingUp },
              { label: 'Revenue operacional', value: formatCurrency(currentRevenue.operationalTotal), icon: Calculator },
              { label: 'Revenue financiero', value: formatCurrency(currentRevenue.financialTotal), icon: Landmark },
              { label: 'Venta mensual cafetería', value: formatCurrency(currentRevenue.monthlyCafeteriaSales), icon: BarChart3 },
              { label: 'Venta anual cafetería', value: formatCurrency(currentRevenue.annualCafeteriaSales), icon: Building2 },
              { label: 'Revenue alumno / año', value: formatCurrency(currentRevenue.total / Math.max(profile.students, 1)), icon: Users },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <kpi.icon size={14} className="text-indigo-600" /> {kpi.label}
                </div>
                <p className="text-lg font-black text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Comparación anual</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Renta Fija" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="SaaS" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="Comisión" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <button onClick={() => setShowBreakdown((current) => !current)} className="flex items-center justify-between w-full text-sm font-semibold text-slate-800">
              <span>Desglose Revenue y fórmulas</span>
              {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showBreakdown ? (
              <div className="mt-4 space-y-4">
                <section>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen ventas</p>
                  {breakdownRows.filter((row) => row.section === 'summary').map((row) => (
                    <div key={row.label} className="grid grid-cols-[1.4fr_1.8fr_auto] gap-3 text-xs py-2 border-b border-slate-50 items-center">
                      <span className="font-semibold text-slate-700">{row.label}</span>
                      <span className="text-slate-400">{row.formula}</span>
                      <span className="font-black text-slate-900">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </section>

                <section>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Revenue operacional</p>
                  {breakdownRows.filter((row) => row.section === 'operational').map((row) => (
                    <div key={row.label} className="grid grid-cols-[1.4fr_1.8fr_auto] gap-3 text-xs py-2 border-b border-slate-50 items-center">
                      <span className="font-semibold text-slate-700">{row.label}</span>
                      <span className="text-slate-400">{row.formula}</span>
                      <span className="font-black text-slate-900">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 font-black text-indigo-700">
                    <span>Subtotal operacional</span>
                    <span>{formatCurrency(currentRevenue.operationalTotal)}</span>
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Revenue financiero</p>
                  {breakdownRows.filter((row) => row.section === 'financial').map((row) => (
                    <div key={row.label} className="grid grid-cols-[1.4fr_1.8fr_auto] gap-3 text-xs py-2 border-b border-slate-50 items-center">
                      <span className="font-semibold text-emerald-700">{row.label}</span>
                      <span className="text-slate-400">{row.formula}</span>
                      <span className="font-black text-emerald-800">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 font-black text-emerald-700">
                    <span>Subtotal financiero</span>
                    <span>{formatCurrency(currentRevenue.financialTotal)}</span>
                  </div>
                </section>

                <div className="flex items-center justify-between text-base pt-2 border-t-2 border-slate-300 font-black text-indigo-700">
                  <span>Total anual</span>
                  <span>{formatCurrency(currentRevenue.total)}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Proyección acumulada 12 meses</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={projectionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="operacional" name="Operacional" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                <Line type="monotone" dataKey="financiero" name="Financiero" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}