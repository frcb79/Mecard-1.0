/**
 * Dashboard Cobranza Escolar — Resumen ejecutivo de cobros escuela→padres
 * Semáforo visual, KPIs, cobro por concepto, top deudores, tendencia.
 * Complementa SchoolFeesManager (CRUD granular).
 *
 * @role SCHOOL_ADMIN, SCHOOL_FINANCE
 * @route /school/collections
 */

import React, { useState, useMemo } from 'react';
import {
  HandCoins, TrendingUp, AlertTriangle, CheckCircle2,
  Users, Bell, ChevronRight, Receipt, ArrowRight,
  GraduationCap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Types ──────────────────────────────────────────

interface FeePaymentSummary {
  concept: string;
  type: string;
  expected: number;
  collected: number;
  pending: number;
  overdue: number;
}

interface StudentDebt {
  id: string;
  name: string;
  grade: string;
  totalDebt: number;
  pendingConcepts: number;
  maxOverdueDays: number;
  lastActivity: string;
  parentEmail: string;
}

interface ReminderLog {
  date: string;
  type: string;
  recipients: number;
  concept: string;
}

// ─── Mock Data ──────────────────────────────────────

const FEE_SUMMARY: FeePaymentSummary[] = [
  { concept: 'Colegiatura', type: 'TUITION', expected: 850000, collected: 720000, pending: 85000, overdue: 45000 },
  { concept: 'Inscripción', type: 'ENROLLMENT', expected: 320000, collected: 310000, pending: 10000, overdue: 0 },
  { concept: 'Transporte', type: 'TRANSPORT', expected: 180000, collected: 155000, pending: 15000, overdue: 10000 },
  { concept: 'Uniforme', type: 'UNIFORM', expected: 95000, collected: 88000, pending: 7000, overdue: 0 },
  { concept: 'Seguro', type: 'INSURANCE', expected: 65000, collected: 62000, pending: 3000, overdue: 0 },
  { concept: 'Material', type: 'MATERIAL', expected: 45000, collected: 40000, pending: 5000, overdue: 0 },
];

const STUDENT_DEBTS: StudentDebt[] = [
  { id: 'st1', name: 'García López, Roberto', grade: '4° Primaria', totalDebt: 18500, pendingConcepts: 3, maxOverdueDays: 45, lastActivity: '2026-01-25', parentEmail: 'roberto.papa@email.com' },
  { id: 'st2', name: 'Martínez Ruiz, Valeria', grade: '2° Secundaria', totalDebt: 15200, pendingConcepts: 2, maxOverdueDays: 38, lastActivity: '2026-02-01', parentEmail: 'val.mama@email.com' },
  { id: 'st3', name: 'Hernández Soto, Diego', grade: '6° Primaria', totalDebt: 12800, pendingConcepts: 2, maxOverdueDays: 30, lastActivity: '2026-02-10', parentEmail: 'diego.padre@email.com' },
  { id: 'st4', name: 'Pérez Ávila, Sofía', grade: '3° Primaria', totalDebt: 11500, pendingConcepts: 2, maxOverdueDays: 28, lastActivity: '2026-02-08', parentEmail: 'sofia.fam@email.com' },
  { id: 'st5', name: 'López Mendoza, Juan', grade: '1° Secundaria', totalDebt: 9800, pendingConcepts: 1, maxOverdueDays: 22, lastActivity: '2026-02-15', parentEmail: 'juan.papa@email.com' },
  { id: 'st6', name: 'Rodríguez Vega, Ana', grade: '5° Primaria', totalDebt: 8500, pendingConcepts: 2, maxOverdueDays: 20, lastActivity: '2026-02-18', parentEmail: 'ana.mama@email.com' },
  { id: 'st7', name: 'Torres Flores, Miguel', grade: '4° Primaria', totalDebt: 7200, pendingConcepts: 1, maxOverdueDays: 18, lastActivity: '2026-02-20', parentEmail: 'migue.fam@email.com' },
  { id: 'st8', name: 'Sánchez Díaz, Camila', grade: '3° Secundaria', totalDebt: 6800, pendingConcepts: 1, maxOverdueDays: 15, lastActivity: '2026-02-22', parentEmail: 'cam.papa@email.com' },
  { id: 'st9', name: 'Ramírez Cruz, Pablo', grade: '2° Primaria', totalDebt: 5600, pendingConcepts: 1, maxOverdueDays: 12, lastActivity: '2026-02-25', parentEmail: 'pablo.mama@email.com' },
  { id: 'st10', name: 'Morales Luna, Isabella', grade: '6° Primaria', totalDebt: 4500, pendingConcepts: 1, maxOverdueDays: 10, lastActivity: '2026-03-01', parentEmail: 'isa.fam@email.com' },
];

const MONTHLY_TREND = [
  { mes: 'Oct', rate: 88.5 },
  { mes: 'Nov', rate: 91.2 },
  { mes: 'Dic', rate: 85.3 },
  { mes: 'Ene', rate: 87.8 },
  { mes: 'Feb', rate: 89.5 },
  { mes: 'Mar', rate: 84.7 },
];

const REMINDER_LOG: ReminderLog[] = [
  { date: '2026-03-08', type: 'Preventivo (7d antes)', recipients: 45, concept: 'Colegiatura Abril' },
  { date: '2026-03-01', type: 'Vencimiento hoy', recipients: 12, concept: 'Colegiatura Marzo' },
  { date: '2026-02-25', type: 'Mora semanal', recipients: 8, concept: 'Colegiatura Febrero' },
  { date: '2026-02-18', type: 'Preventivo (7d antes)', recipients: 48, concept: 'Colegiatura Marzo' },
];

// ─── Utils ──────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

// ─── Main Component ──────────────────────────────────

export default function SchoolCollectionsDashboard() {
  const [notifiedStudents, setNotifiedStudents] = useState<Set<string>>(new Set());

  const totals = useMemo(() => {
    const expected = FEE_SUMMARY.reduce((s, f) => s + f.expected, 0);
    const collected = FEE_SUMMARY.reduce((s, f) => s + f.collected, 0);
    const pending = FEE_SUMMARY.reduce((s, f) => s + f.pending, 0);
    const overdue = FEE_SUMMARY.reduce((s, f) => s + f.overdue, 0);
    const rate = expected > 0 ? (collected / expected) * 100 : 0;
    const studentsWithDebt = STUDENT_DEBTS.length;
    return { expected, collected, pending, overdue, rate, studentsWithDebt };
  }, []);

  const conceptChartData = useMemo(() =>
    FEE_SUMMARY.map((f) => ({
      name: f.concept,
      Cobrado: f.collected,
      Pendiente: f.pending,
      Vencido: f.overdue,
    }))
  , []);

  const gaugeColor = totals.rate >= 90 ? '#10b981' : totals.rate >= 75 ? '#f59e0b' : '#ef4444';
  const gaugeLabel = totals.rate >= 90 ? 'Saludable' : totals.rate >= 75 ? 'Atención' : 'Crítico';

  const handleNotify = (studentId: string) => {
    setNotifiedStudents((prev) => new Set([...prev, studentId]));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <HandCoins size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Cobranza Escolar</h1>
            <p className="text-xs text-slate-500">Resumen ejecutivo de cobros · Marzo 2026</p>
          </div>
        </div>
        <a href="/school/fees" className="hidden md:flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          Gestión detallada <ArrowRight size={14} />
        </a>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Esperado Mes" value={fmt(totals.expected)} icon={Receipt} color="slate" />
        <KpiCard label="Cobrado" value={fmt(totals.collected)} icon={CheckCircle2} color="emerald" />
        <KpiCard label="Tasa Cobro" value={`${totals.rate.toFixed(1)}%`} icon={TrendingUp}
          color={totals.rate >= 90 ? 'emerald' : totals.rate >= 75 ? 'amber' : 'red'} />
        <KpiCard label="Pendiente" value={fmt(totals.pending)} icon={AlertTriangle}
          color={totals.pending > 0 ? 'amber' : 'emerald'} />
        <KpiCard label="Vencido" value={fmt(totals.overdue)} icon={AlertTriangle}
          color={totals.overdue > 0 ? 'red' : 'emerald'}
          sub={`${totals.studentsWithDebt} alumnos`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gauge + Concept Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gauge Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Semáforo de Cobro</p>
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={gaugeColor} strokeWidth="10"
                    strokeDasharray={`${(totals.rate / 100) * 314} 314`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{totals.rate.toFixed(0)}%</span>
                  <span className="text-[10px] font-medium" style={{ color: gaugeColor }}>{gaugeLabel}</span>
                </div>
              </div>
            </div>

            {/* Concept Chart */}
            <div className="md:col-span-2 bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Cobro por Concepto</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={conceptChartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Cobrado" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} stackId="a" />
                  <Bar dataKey="Pendiente" fill="#94a3b8" radius={[0, 0, 0, 0]} barSize={12} stackId="a" />
                  <Bar dataKey="Vencido" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={12} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Students with Debt */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-red-500" />
                <h3 className="text-sm font-semibold text-slate-800">Top Alumnos con Mayor Adeudo</h3>
              </div>
              <span className="text-[10px] text-slate-400">{STUDENT_DEBTS.length} alumnos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/50">
                    <th className="text-left py-2.5 px-4 font-semibold text-slate-600">Alumno</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-slate-600">Grado</th>
                    <th className="text-right py-2.5 px-2 font-semibold text-slate-600">Adeudo</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-slate-600">Conceptos</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-slate-600">Días Mora</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-slate-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDENT_DEBTS.map((st, i) => (
                    <tr key={st.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{i + 1}</span>
                          <span className="font-medium text-slate-800">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">{st.grade}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-red-600">{fmt(st.totalDebt)}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{st.pendingConcepts}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-medium ${
                          st.maxOverdueDays >= 30 ? 'text-red-600' : st.maxOverdueDays >= 15 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {st.maxOverdueDays}d
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {notifiedStudents.has(st.id) ? (
                          <span className="text-[10px] text-emerald-600 font-medium">✓ Notificado</span>
                        ) : (
                          <button
                            onClick={() => handleNotify(st.id)}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                          >
                            <Bell size={10} className="inline mr-1" />
                            Notificar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Monthly Trend */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Tendencia de Cobro Mensual</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MONTHLY_TREND} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${Number(v).toFixed(1)}%`} />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} name="Tasa Cobro" />
                {/* Meta line at 90% */}
                <Line type="monotone" dataKey={() => 90} stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Meta 90%" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Debt Distribution */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Distribución por Concepto</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={FEE_SUMMARY.filter((f) => f.overdue > 0 || f.pending > 0).map((f) => ({
                    name: f.concept,
                    value: f.pending + f.overdue,
                  }))}
                  cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  paddingAngle={2} dataKey="value"
                >
                  {FEE_SUMMARY.filter((f) => f.overdue > 0 || f.pending > 0).map((_, i) => (
                    <Cell key={i} fill={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'][i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {FEE_SUMMARY.filter((f) => f.overdue > 0 || f.pending > 0).map((f, i) => (
                <div key={f.concept} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'][i] }} />
                    <span className="text-slate-600">{f.concept}</span>
                  </div>
                  <span className="font-medium text-slate-800">{fmt(f.pending + f.overdue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminder Log */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Recordatorios Enviados</h3>
              <a href="/school/fees" className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">
                Configurar →
              </a>
            </div>
            <div className="space-y-3">
              {REMINDER_LOG.map((r, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Bell size={12} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{r.type}</p>
                    <p className="text-[10px] text-slate-500">{r.concept} · {r.recipients} destinatarios</p>
                    <p className="text-[10px] text-slate-400">{r.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.FC<{ size?: number; className?: string }>;
  color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={`text-${color}-600`} />
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
