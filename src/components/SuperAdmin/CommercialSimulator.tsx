/**
 * Simulador Comercial — Herramienta interna de ventas MeCard
 * Permite modelar escenarios de pricing antes de presentar propuesta a un colegio.
 * Calcula revenue MeCard bajo distintas configuraciones de negocio.
 *
 * @role SUPER_ADMIN
 * @route /admin/sales/simulator
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Users, Building2, DollarSign, Calculator,
  BarChart3, ArrowRight, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, Cell
} from 'recharts';

// ─── Types ──────────────────────────────────────────

interface SchoolProfile {
  name: string;
  students: number;
  units: number;
  avgTicket: number;
  buyerPercent: number;
  operatingDays: number;
  depositMix: { card: number; spei: number; oxxo: number; cash: number };
}

interface PricingModel {
  label: string;
  key: 'rent' | 'saas' | 'commission' | 'custom';
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
  setup: number;
  rent: number;
  saas: number;
  depositCard: number;
  depositSPEI: number;
  depositOXXO: number;
  cafeteria: number;
  cards: number;
  total: number;
}

// ─── Presets ─────────────────────────────────────────

const MODEL_PRESETS: Record<string, Omit<PricingModel, 'label' | 'key'>> = {
  rent: {
    setupFee: 25000, monthlyRent: 5000, annualLicense: 0,
    saasPerStudent: 0, cafeteriaFeePercent: 3, depositFeeCard: 3.5,
    depositFeeSPEI: 8, depositFeeOXXO: 10.5, yearlyCardCost: 140, mecardMargin: 5,
  },
  saas: {
    setupFee: 15000, monthlyRent: 0, annualLicense: 0,
    saasPerStudent: 45, cafeteriaFeePercent: 3, depositFeeCard: 3.5,
    depositFeeSPEI: 8, depositFeeOXXO: 10.5, yearlyCardCost: 140, mecardMargin: 5,
  },
  commission: {
    setupFee: 0, monthlyRent: 0, annualLicense: 0,
    saasPerStudent: 0, cafeteriaFeePercent: 8, depositFeeCard: 5,
    depositFeeSPEI: 8, depositFeeOXXO: 10.5, yearlyCardCost: 0, mecardMargin: 10,
  },
};

const MODELS: PricingModel[] = [
  { label: 'Modelo A — Renta Fija', key: 'rent', ...MODEL_PRESETS.rent },
  { label: 'Modelo B — SaaS per Student', key: 'saas', ...MODEL_PRESETS.saas },
  { label: 'Modelo C — Comisión Pura', key: 'commission', ...MODEL_PRESETS.commission },
];

// ─── Calculator ─────────────────────────────────────

function calcRevenue(profile: SchoolProfile, model: PricingModel): RevenueBreakdown {
  const monthlyVolume = profile.students * profile.avgTicket * (profile.buyerPercent / 100) * profile.operatingDays;
  const annualVolume = monthlyVolume * 12;

  const depositTxCount = annualVolume / Math.max(profile.avgTicket, 1);

  const setup = model.setupFee;
  const rent = model.monthlyRent * 12;
  const saas = model.saasPerStudent * profile.students * 12;
  const depositCard = annualVolume * (profile.depositMix.card / 100) * (model.depositFeeCard / 100);
  const depositSPEI = depositTxCount * (profile.depositMix.spei / 100) * model.depositFeeSPEI;
  const depositOXXO = depositTxCount * (profile.depositMix.oxxo / 100) * model.depositFeeOXXO;
  const grossCafeteria = annualVolume;
  const cafeteria = grossCafeteria * (model.cafeteriaFeePercent / 100) * (model.mecardMargin / 100);
  const cards = profile.students * model.yearlyCardCost;

  const total = setup + rent + saas + depositCard + depositSPEI + depositOXXO + cafeteria + cards;
  return { setup, rent, saas, depositCard, depositSPEI, depositOXXO, cafeteria, cards, total };
}

// ─── Formatters ──────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ─── Slider Component ────────────────────────────────

function Slider({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step: number; suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{suffix === '$' ? fmt(value) : `${value}${suffix || ''}`}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{suffix === '$' ? fmt(min) : `${min}${suffix || ''}`}</span>
        <span>{suffix === '$' ? fmt(max) : `${max}${suffix || ''}`}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────

export default function CommercialSimulator() {
  // School profile state
  const [profile, setProfile] = useState<SchoolProfile>({
    name: '', students: 500, units: 2, avgTicket: 60, buyerPercent: 60,
    operatingDays: 22, depositMix: { card: 50, spei: 30, oxxo: 10, cash: 10 },
  });

  // Active model tab
  const [activeModel, setActiveModel] = useState<'rent' | 'saas' | 'commission' | 'custom'>('rent');
  const [customModel, setCustomModel] = useState<PricingModel>({
    label: 'Personalizado', key: 'custom', ...MODEL_PRESETS.rent,
  });

  const [showBreakdown, setShowBreakdown] = useState(true);

  const updateProfile = (patch: Partial<SchoolProfile>) => setProfile((p) => ({ ...p, ...patch }));
  const updateMix = (key: keyof SchoolProfile['depositMix'], val: number) => {
    setProfile((p) => ({ ...p, depositMix: { ...p.depositMix, [key]: val } }));
  };

  // Compute revenue for all models + custom
  const revenues = useMemo(() => {
    const results: Record<string, RevenueBreakdown> = {};
    for (const m of MODELS) {
      results[m.key] = calcRevenue(profile, m);
    }
    results.custom = calcRevenue(profile, customModel);
    return results;
  }, [profile, customModel]);

  const currentRevenue = revenues[activeModel];

  // Charts data
  const comparisonData = useMemo(() => {
    const sources = ['rent', 'saas', 'depositCard', 'depositSPEI', 'depositOXXO', 'cafeteria', 'cards'] as const;
    return sources.map((src) => ({
      name: { rent: 'Renta', saas: 'SaaS', depositCard: 'Dep. Card', depositSPEI: 'Dep. SPEI', depositOXXO: 'Dep. OXXO', cafeteria: 'Comisión Caf.', cards: 'Tarjetas' }[src],
      'Renta Fija': revenues.rent[src],
      'SaaS': revenues.saas[src],
      'Comisión': revenues.commission[src],
    }));
  }, [revenues]);

  const projectionData = useMemo(() => {
    const monthly = (currentRevenue.total - currentRevenue.setup) / 12;
    return Array.from({ length: 12 }, (_, i) => ({
      mes: `Mes ${i + 1}`,
      acumulado: Math.round((i === 0 ? currentRevenue.setup : 0) + monthly * (i + 1)),
    }));
  }, [currentRevenue]);

  const roiMonths = currentRevenue.setup > 0
    ? Math.ceil(currentRevenue.setup / ((currentRevenue.total - currentRevenue.setup) / 12))
    : 0;

  const activeModelData = activeModel === 'custom'
    ? customModel
    : MODELS.find((m) => m.key === activeModel)!;

  // ─── Render ──────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Simulador Comercial</h1>
          <p className="text-xs text-slate-500">Modela escenarios de pricing antes de presentar propuesta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT PANEL — School Profile ═══ */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-800">Perfil del Colegio</h2>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Nombre (referencia)</label>
              <input
                type="text" value={profile.name} placeholder="Ej. Colegio Cumbres"
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="mt-1 w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <Slider label="Número de estudiantes" value={profile.students} min={50} max={5000} step={50} onChange={(v) => updateProfile({ students: v })} />
            <Slider label="Cafeterías / Unidades" value={profile.units} min={1} max={10} step={1} onChange={(v) => updateProfile({ units: v })} />
            <Slider label="Ticket promedio/día" value={profile.avgTicket} min={20} max={150} step={5} suffix="$" onChange={(v) => updateProfile({ avgTicket: v })} />
            <Slider label="Alumnos que compran diario" value={profile.buyerPercent} min={10} max={100} step={5} suffix="%" onChange={(v) => updateProfile({ buyerPercent: v })} />
            <Slider label="Días operativos/mes" value={profile.operatingDays} min={15} max={25} step={1} onChange={(v) => updateProfile({ operatingDays: v })} />

            {/* Deposit Mix */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">Mix de Depósito</p>
              <Slider label="Tarjeta" value={profile.depositMix.card} min={0} max={100} step={5} suffix="%" onChange={(v) => updateMix('card', v)} />
              <Slider label="SPEI" value={profile.depositMix.spei} min={0} max={100} step={5} suffix="%" onChange={(v) => updateMix('spei', v)} />
              <Slider label="OXXO" value={profile.depositMix.oxxo} min={0} max={100} step={5} suffix="%" onChange={(v) => updateMix('oxxo', v)} />
              <Slider label="Efectivo" value={profile.depositMix.cash} min={0} max={100} step={5} suffix="%" onChange={(v) => updateMix('cash', v)} />
              {(() => {
                const sum = profile.depositMix.card + profile.depositMix.spei + profile.depositMix.oxxo + profile.depositMix.cash;
                return sum !== 100 ? (
                  <p className="text-xs text-amber-600 font-medium mt-1">⚠ Los porcentajes suman {sum}% (deben sumar 100%)</p>
                ) : null;
              })()}
            </div>

            <div className="bg-indigo-50 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-medium text-indigo-700 uppercase tracking-wider">Volumen depósitos/mes estimado</p>
              <p className="text-lg font-bold text-indigo-900">
                {fmt(profile.students * profile.avgTicket * (profile.buyerPercent / 100) * profile.operatingDays)}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ CENTER PANEL — Pricing Model ═══ */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-800">Modelo de Negocio</h2>
            </div>

            {/* Model Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {[...MODELS, { label: 'Personalizado', key: 'custom' as const }].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveModel(m.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeModel === m.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.key === 'rent' ? 'A. Renta Fija' : m.key === 'saas' ? 'B. SaaS' : m.key === 'commission' ? 'C. Comisión' : 'Personalizado'}
                </button>
              ))}
            </div>

            {/* Model Parameters */}
            <div className="space-y-3 pt-2">
              {activeModel === 'custom' ? (
                <>
                  <FieldRow label="Setup Fee" value={customModel.setupFee} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, setupFee: v }))} />
                  <FieldRow label="Renta Mensual" value={customModel.monthlyRent} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, monthlyRent: v }))} />
                  <FieldRow label="SaaS por Alumno/mes" value={customModel.saasPerStudent} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, saasPerStudent: v }))} />
                  <FieldRow label="Comisión Cafetería" value={customModel.cafeteriaFeePercent} unit="%" onChange={(v) => setCustomModel((m) => ({ ...m, cafeteriaFeePercent: v }))} />
                  <FieldRow label="Fee Depósito Card" value={customModel.depositFeeCard} unit="%" onChange={(v) => setCustomModel((m) => ({ ...m, depositFeeCard: v }))} />
                  <FieldRow label="Fee Depósito SPEI" value={customModel.depositFeeSPEI} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, depositFeeSPEI: v }))} />
                  <FieldRow label="Fee Depósito OXXO" value={customModel.depositFeeOXXO} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, depositFeeOXXO: v }))} />
                  <FieldRow label="Costo Tarjeta/año" value={customModel.yearlyCardCost} unit="$" onChange={(v) => setCustomModel((m) => ({ ...m, yearlyCardCost: v }))} />
                  <FieldRow label="Margen MeCard" value={customModel.mecardMargin} unit="%" onChange={(v) => setCustomModel((m) => ({ ...m, mecardMargin: v }))} />
                </>
              ) : (
                <div className="space-y-2">
                  {[
                    ['Setup Fee', fmt(activeModelData.setupFee)],
                    ['Renta Mensual', fmt(activeModelData.monthlyRent)],
                    ['SaaS/Alumno/mes', fmt(activeModelData.saasPerStudent)],
                    ['Comisión Cafetería', fmtPct(activeModelData.cafeteriaFeePercent)],
                    ['Fee Dep. Card', fmtPct(activeModelData.depositFeeCard)],
                    ['Fee Dep. SPEI', fmt(activeModelData.depositFeeSPEI) + ' c/u'],
                    ['Fee Dep. OXXO', fmt(activeModelData.depositFeeOXXO) + ' c/u'],
                    ['Tarjeta/año', fmt(activeModelData.yearlyCardCost)],
                    ['Margen MeCard', fmtPct(activeModelData.mecardMargin)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{l}</span>
                      <span className="font-semibold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick reset */}
            {activeModel === 'custom' && (
              <div className="flex gap-2">
                {(['rent', 'saas', 'commission'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setCustomModel((m) => ({ ...m, ...MODEL_PRESETS[k] }))}
                    className="flex-1 text-[10px] py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <RefreshCw size={10} className="inline mr-1" />
                    Copiar {k === 'rent' ? 'A' : k === 'saas' ? 'B' : 'C'}
                  </button>
                ))}
              </div>
            )}

            {/* Model description */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              {activeModel === 'rent' && 'Ingreso predecible con renta mensual fija. Ideal para colegios medianos que buscan costos estables. Setup fee se recupera con la renta recurrente.'}
              {activeModel === 'saas' && 'Escala con el número de alumnos. Sin renta fija mensual. Ideal para colegios grandes donde el ingreso per-student supera la renta fija.'}
              {activeModel === 'commission' && 'Sin costos fijos para el colegio. Todo el ingreso MeCard viene de comisiones sobre transacciones. Ideal para venta consultiva donde el colegio resiste costos fijos.'}
              {activeModel === 'custom' && 'Combina libremente los parámetros de los 3 modelos. Útil para propuestas negociadas o escenarios híbridos.'}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Financial Projection ═══ */}
        <div className="lg:col-span-5 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Revenue Anual', value: fmt(currentRevenue.total), color: 'indigo', icon: TrendingUp },
              { label: 'Revenue Mensual', value: fmt((currentRevenue.total - currentRevenue.setup) / 12), color: 'emerald', icon: DollarSign },
              { label: 'Revenue/Alumno/Año', value: fmt(currentRevenue.total / Math.max(profile.students, 1)), color: 'purple', icon: Users },
              { label: `ROI Setup ${roiMonths > 0 ? `(${roiMonths} meses)` : '(sin setup)'}`, value: roiMonths > 0 ? `${roiMonths} meses` : 'N/A', color: 'amber', icon: BarChart3 },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon size={14} className={`text-${kpi.color}-600`} />
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Comparación de Modelos (Revenue Anual)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Renta Fija" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="SaaS" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="Comisión" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center justify-between w-full text-sm font-semibold text-slate-800"
            >
              <span>Desglose de Revenue — {activeModel === 'custom' ? 'Personalizado' : activeModelData.label}</span>
              {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showBreakdown && (
              <div className="mt-3 space-y-2">
                {[
                  ['Setup Fee (one-time)', currentRevenue.setup],
                  ['Renta Mensual × 12', currentRevenue.rent],
                  ['SaaS per Student × 12', currentRevenue.saas],
                  ['Comisión Depósitos Card', currentRevenue.depositCard],
                  ['Comisión Depósitos SPEI', currentRevenue.depositSPEI],
                  ['Comisión Depósitos OXXO', currentRevenue.depositOXXO],
                  ['Comisión Cafetería (margen MeCard)', currentRevenue.cafeteria],
                  ['Emisión Tarjetas', currentRevenue.cards],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600">{label as string}</span>
                    <span className="font-semibold text-slate-800">{fmt(value as number)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 font-bold">
                  <span className="text-indigo-700">TOTAL ANUAL</span>
                  <span className="text-indigo-700">{fmt(currentRevenue.total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 12-month Projection */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Proyección Acumulada 12 Meses</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={projectionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="acumulado" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field Row for Custom Model ──────────────────────

function FieldRow({ label, value, unit, onChange }: {
  label: string; value: number; unit: '$' | '%'; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-600 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {unit === '$' && <span className="text-xs text-slate-400">$</span>}
        <input
          type="number" value={value} min={0} step={unit === '%' ? 0.5 : 100}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 text-right text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        {unit === '%' && <span className="text-xs text-slate-400">%</span>}
      </div>
    </div>
  );
}
