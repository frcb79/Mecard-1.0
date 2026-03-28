/**
 * Monitor de Cobros MeCard — Dashboard ejecutivo de cobranza MeCard→Escuelas
 * Semáforo por escuela, aging de cartera, tendencia de cobro.
 * Complementa BillingOperationsPanel (que lista facturas individuales).
 *
 * @role SUPER_ADMIN
 * @route /admin/billing/collections
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  HandCoins, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, X, Filter, Search, Building2, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart, ResponsiveContainer, Cell
} from 'recharts';
import { usePlatform } from '../../contexts/PlatformContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { logger } from '../../lib/logger';

// ─── Types ──────────────────────────────────────────

interface SchoolCollectionRecord {
  id: string;
  name: string;
  contractType: 'TRIAL' | 'STANDARD';
  totalBilled: number;
  totalCollected: number;
  pending: number;
  overdue: number;
  avgDaysToCollect: number;
  lastPaymentDate: string;
  lastInvoiceNumber: string;
  invoiceCount: number;
  overdueInvoices: number;
  maxOverdueDays: number;
}

type SemaphoreStatus = 'green' | 'yellow' | 'red';

interface TransactionLite {
  id: string;
  school_id: string | null;
  amount: number | null;
  type: string | null;
  created_at: string | null;
}

// ─── Mock Data ──────────────────────────────────────

const MOCK_SCHOOLS: SchoolCollectionRecord[] = [
  { id: 's1', name: 'Colegio Cumbres México', contractType: 'STANDARD', totalBilled: 540000, totalCollected: 510000, pending: 30000, overdue: 0, avgDaysToCollect: 8, lastPaymentDate: '2026-03-05', lastInvoiceNumber: 'INV-2026-03-CUM01', invoiceCount: 12, overdueInvoices: 0, maxOverdueDays: 0 },
  { id: 's2', name: 'Instituto Americano', contractType: 'STANDARD', totalBilled: 380000, totalCollected: 340000, pending: 25000, overdue: 15000, avgDaysToCollect: 14, lastPaymentDate: '2026-02-20', lastInvoiceNumber: 'INV-2026-03-IAM01', invoiceCount: 10, overdueInvoices: 1, maxOverdueDays: 12 },
  { id: 's3', name: 'Colegio San Patricio', contractType: 'STANDARD', totalBilled: 290000, totalCollected: 290000, pending: 0, overdue: 0, avgDaysToCollect: 5, lastPaymentDate: '2026-03-08', lastInvoiceNumber: 'INV-2026-03-CSP01', invoiceCount: 8, overdueInvoices: 0, maxOverdueDays: 0 },
  { id: 's4', name: 'Liceo Europeo', contractType: 'STANDARD', totalBilled: 420000, totalCollected: 320000, pending: 45000, overdue: 55000, avgDaysToCollect: 22, lastPaymentDate: '2026-01-28', lastInvoiceNumber: 'INV-2026-02-LEU01', invoiceCount: 11, overdueInvoices: 2, maxOverdueDays: 35 },
  { id: 's5', name: 'Escuela Bilingüe del Valle', contractType: 'TRIAL', totalBilled: 85000, totalCollected: 85000, pending: 0, overdue: 0, avgDaysToCollect: 7, lastPaymentDate: '2026-03-06', lastInvoiceNumber: 'INV-2026-03-EBV01', invoiceCount: 3, overdueInvoices: 0, maxOverdueDays: 0 },
  { id: 's6', name: 'Instituto Tepeyac', contractType: 'STANDARD', totalBilled: 310000, totalCollected: 250000, pending: 20000, overdue: 40000, avgDaysToCollect: 18, lastPaymentDate: '2026-02-10', lastInvoiceNumber: 'INV-2026-02-ITE01', invoiceCount: 9, overdueInvoices: 2, maxOverdueDays: 28 },
  { id: 's7', name: 'Colegio Williams', contractType: 'STANDARD', totalBilled: 475000, totalCollected: 460000, pending: 15000, overdue: 0, avgDaysToCollect: 9, lastPaymentDate: '2026-03-04', lastInvoiceNumber: 'INV-2026-03-CWI01', invoiceCount: 12, overdueInvoices: 0, maxOverdueDays: 0 },
  { id: 's8', name: 'Centro Escolar Lomas', contractType: 'TRIAL', totalBilled: 52000, totalCollected: 32000, pending: 8000, overdue: 12000, avgDaysToCollect: 20, lastPaymentDate: '2026-02-15', lastInvoiceNumber: 'INV-2026-02-CEL01', invoiceCount: 2, overdueInvoices: 1, maxOverdueDays: 22 },
  { id: 's9', name: 'Colegio Madrid', contractType: 'STANDARD', totalBilled: 520000, totalCollected: 505000, pending: 15000, overdue: 0, avgDaysToCollect: 6, lastPaymentDate: '2026-03-07', lastInvoiceNumber: 'INV-2026-03-CMA01', invoiceCount: 12, overdueInvoices: 0, maxOverdueDays: 0 },
  { id: 's10', name: 'Concesionario Don Pepe (Independiente)', contractType: 'STANDARD', totalBilled: 180000, totalCollected: 135000, pending: 15000, overdue: 30000, avgDaysToCollect: 25, lastPaymentDate: '2026-02-01', lastInvoiceNumber: 'INV-2026-02-CDP01', invoiceCount: 6, overdueInvoices: 2, maxOverdueDays: 38 },
];

const MOCK_AGING_BUCKETS = [
  { label: '1-15 días', count: 4, amount: 48000, color: '#fbbf24' },
  { label: '16-30 días', count: 3, amount: 55000, color: '#f97316' },
  { label: '31-60 días', count: 2, amount: 42000, color: '#ef4444' },
  { label: '61-90 días', count: 1, amount: 7000, color: '#dc2626' },
  { label: '90+ días', count: 0, amount: 0, color: '#991b1b' },
];

const MOCK_TREND_DATA = [
  { mes: 'Oct', facturado: 280000, cobrado: 265000 },
  { mes: 'Nov', facturado: 295000, cobrado: 280000 },
  { mes: 'Dic', facturado: 260000, cobrado: 250000 },
  { mes: 'Ene', facturado: 310000, cobrado: 285000 },
  { mes: 'Feb', facturado: 325000, cobrado: 300000 },
  { mes: 'Mar', facturado: 340000, cobrado: 310000 },
];

// ─── Utils ──────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

function getSemaphore(school: SchoolCollectionRecord): SemaphoreStatus {
  if (school.overdue === 0 && school.avgDaysToCollect <= 10) return 'green';
  if (school.maxOverdueDays <= 15 && school.avgDaysToCollect <= 20) return 'yellow';
  return 'red';
}

const SEMAPHORE_STYLES: Record<SemaphoreStatus, { bg: string; text: string; label: string; dot: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Al día', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Atención', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', label: 'Crítico', dot: 'bg-red-500' },
};

// ─── Main Component ──────────────────────────────────

export default function CollectionsMonitor() {
  const { schools } = usePlatform();
  const [filterStatus, setFilterStatus] = useState<SemaphoreStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolCollectionRecord | null>(null);
  const [schoolRecords, setSchoolRecords] = useState<SchoolCollectionRecord[]>(MOCK_SCHOOLS);
  const [agingBuckets, setAgingBuckets] = useState(MOCK_AGING_BUCKETS);
  const [trendData, setTrendData] = useState(MOCK_TREND_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollections = async () => {
      if (!isSupabaseConfigured) {
        setSchoolRecords(MOCK_SCHOOLS);
        setAgingBuckets(MOCK_AGING_BUCKETS);
        setTrendData(MOCK_TREND_DATA);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: txError } = await supabase
          .from('transactions')
          .select('id, school_id, amount, type, created_at')
          .order('created_at', { ascending: false })
          .limit(5000);

        if (txError) throw txError;

        const txRows = (data || []) as TransactionLite[];
        const txBySchool: Record<string, TransactionLite[]> = {};

        txRows.forEach((tx) => {
          if (!tx.school_id) return;
          if (!txBySchool[tx.school_id]) txBySchool[tx.school_id] = [];
          txBySchool[tx.school_id].push(tx);
        });

        const now = Date.now();

        const records: SchoolCollectionRecord[] = schools.map((school) => {
          const recordsBySchool = txBySchool[school.id] || [];

          let billed = 0;
          let collected = 0;
          let pending = 0;
          let overdue = 0;
          let overdueInvoices = 0;
          let maxOverdueDays = 0;
          let ageSum = 0;
          let ageCount = 0;
          let lastPaymentDate = '-';

          recordsBySchool.forEach((tx) => {
            const amount = tx.amount || 0;
            const txType = (tx.type || '').toUpperCase();
            const createdAt = tx.created_at ? new Date(tx.created_at) : null;
            const ageDays = createdAt ? Math.max(0, Math.floor((now - createdAt.getTime()) / 86400000)) : 0;

            if (amount < 0 || txType === 'PURCHASE' || txType === 'FEE') {
              const invoiceAmount = Math.abs(amount);
              billed += invoiceAmount;

              if (ageDays > 30) {
                overdue += invoiceAmount;
                overdueInvoices += 1;
                maxOverdueDays = Math.max(maxOverdueDays, ageDays);
              } else {
                pending += invoiceAmount;
              }

              if (createdAt) {
                ageSum += ageDays;
                ageCount += 1;
              }
              return;
            }

            if (amount > 0 && txType !== 'REFUND') {
              collected += amount;
              if (createdAt) {
                lastPaymentDate = createdAt.toISOString().slice(0, 10);
              }
            }
          });

          return {
            id: school.id,
            name: school.name,
            contractType: school.contractType === 'TRIAL' ? 'TRIAL' : 'STANDARD',
            totalBilled: Math.round(billed),
            totalCollected: Math.round(collected),
            pending: Math.max(0, Math.round(pending)),
            overdue: Math.max(0, Math.round(overdue)),
            avgDaysToCollect: ageCount > 0 ? Math.round(ageSum / ageCount) : 0,
            lastPaymentDate,
            lastInvoiceNumber: `AUTO-${school.id.slice(0, 6).toUpperCase()}`,
            invoiceCount: recordsBySchool.length,
            overdueInvoices,
            maxOverdueDays,
          };
        });

        const trendMap: Record<string, { mes: string; facturado: number; cobrado: number }> = {};
        txRows.forEach((tx) => {
          if (!tx.created_at) return;
          const dt = new Date(tx.created_at);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (!trendMap[key]) {
            trendMap[key] = {
              mes: dt.toLocaleDateString('es-MX', { month: 'short' }),
              facturado: 0,
              cobrado: 0,
            };
          }

          const amount = tx.amount || 0;
          const txType = (tx.type || '').toUpperCase();
          if (amount < 0 || txType === 'PURCHASE' || txType === 'FEE') {
            trendMap[key].facturado += Math.abs(amount);
          } else if (amount > 0 && txType !== 'REFUND') {
            trendMap[key].cobrado += amount;
          }
        });

        const sortedTrend = Object.entries(trendMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([, value]) => value);

        const buckets = [
          { label: '1-15 días', count: 0, amount: 0, color: '#fbbf24' },
          { label: '16-30 días', count: 0, amount: 0, color: '#f97316' },
          { label: '31-60 días', count: 0, amount: 0, color: '#ef4444' },
          { label: '61-90 días', count: 0, amount: 0, color: '#dc2626' },
          { label: '90+ días', count: 0, amount: 0, color: '#991b1b' },
        ];

        txRows.forEach((tx) => {
          const amount = tx.amount || 0;
          const txType = (tx.type || '').toUpperCase();
          if (!(amount < 0 || txType === 'PURCHASE' || txType === 'FEE') || !tx.created_at) return;

          const ageDays = Math.max(0, Math.floor((now - new Date(tx.created_at).getTime()) / 86400000));
          const value = Math.abs(amount);

          if (ageDays <= 15) {
            buckets[0].count += 1;
            buckets[0].amount += value;
          } else if (ageDays <= 30) {
            buckets[1].count += 1;
            buckets[1].amount += value;
          } else if (ageDays <= 60) {
            buckets[2].count += 1;
            buckets[2].amount += value;
          } else if (ageDays <= 90) {
            buckets[3].count += 1;
            buckets[3].amount += value;
          } else {
            buckets[4].count += 1;
            buckets[4].amount += value;
          }
        });

        setSchoolRecords(records.length > 0 ? records : MOCK_SCHOOLS);
        setTrendData(sortedTrend.length > 0 ? sortedTrend : MOCK_TREND_DATA);
        setAgingBuckets(buckets);
      } catch (err: unknown) {
        logger.error('superAdmin.collectionsMonitor', 'Error loading collections data', err);
        setError('No se pudieron cargar métricas reales. Mostrando datos fallback.');
        setSchoolRecords(MOCK_SCHOOLS);
        setAgingBuckets(MOCK_AGING_BUCKETS);
        setTrendData(MOCK_TREND_DATA);
      } finally {
        setLoading(false);
      }
    };

    void loadCollections();
  }, [schools]);

  // Calculated metrics
  const totals = useMemo(() => {
    const billed = schoolRecords.reduce((s, sc) => s + sc.totalBilled, 0);
    const collected = schoolRecords.reduce((s, sc) => s + sc.totalCollected, 0);
    const overdue = schoolRecords.reduce((s, sc) => s + sc.overdue, 0);
    const pending = schoolRecords.reduce((s, sc) => s + sc.pending, 0);
    const rate = billed > 0 ? (collected / billed) * 100 : 0;
    return { billed, collected, overdue, pending, rate };
  }, [schoolRecords]);

  const semaphoreCounts = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0 };
    schoolRecords.forEach((s) => { counts[getSemaphore(s)]++; });
    return counts;
  }, [schoolRecords]);

  const filteredSchools = useMemo(() => {
    return schoolRecords
      .filter((s) => filterStatus === 'all' || getSemaphore(s) === filterStatus)
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [filterStatus, search, schoolRecords]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <HandCoins size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Monitor de Cobros</h1>
          <p className="text-xs text-slate-500">Seguimiento de cobranza MeCard → Escuelas e Independientes</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Facturado" value={fmt(totals.billed)} icon={FileText} color="slate" />
        <KpiCard label="Total Cobrado" value={fmt(totals.collected)} icon={CheckCircle2} color="emerald" />
        <KpiCard label="Tasa de Cobro" value={`${totals.rate.toFixed(1)}%`} icon={TrendingUp}
          color={totals.rate >= 90 ? 'emerald' : totals.rate >= 75 ? 'amber' : 'red'}
          badge={totals.rate >= 90 ? 'Saludable' : totals.rate >= 75 ? 'Atención' : 'Crítico'} />
        <KpiCard label="Cartera Vencida" value={fmt(totals.overdue)} icon={AlertTriangle}
          color={totals.overdue === 0 ? 'emerald' : 'red'}
          badge={totals.overdue > 0 ? `${schoolRecords.filter((s) => s.overdue > 0).length} escuelas` : undefined} />
      </div>

      {loading && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
          Cargando métricas de cobranza en tiempo real...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          {error}
        </div>
      )}

      {/* Semaphore Counters */}
      <div className="grid grid-cols-3 gap-3">
        {(['green', 'yellow', 'red'] as const).map((status) => {
          const style = SEMAPHORE_STYLES[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4 transition-all ${
                filterStatus === status ? 'ring-2 ring-indigo-400 border-indigo-300' : ''
              } bg-white hover:shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${style.dot}`} />
                <span className="text-xs font-medium text-slate-500">{style.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{semaphoreCounts[status]}</p>
              <p className="text-[10px] text-slate-400">escuela{semaphoreCounts[status] !== 1 ? 's' : ''}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ LEFT: School Table ═══ */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} placeholder="Buscar escuela..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            {filterStatus !== 'all' && (
              <button onClick={() => setFilterStatus('all')} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <X size={12} /> Limpiar filtro
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Escuela</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">Contrato</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600">Facturado</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600">Cobrado</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600">Vencido</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600">Días Prom</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600">Status</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => {
                    const sem = getSemaphore(school);
                    const style = SEMAPHORE_STYLES[sem];
                    return (
                      <tr key={school.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{school.name}</div>
                          <div className="text-[10px] text-slate-400">{school.invoiceCount} facturas</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            school.contractType === 'TRIAL' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {school.contractType}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-700">{fmt(school.totalBilled)}</td>
                        <td className="py-3 px-2 text-right font-medium text-emerald-700">{fmt(school.totalCollected)}</td>
                        <td className="py-3 px-2 text-right font-medium text-red-600">{school.overdue > 0 ? fmt(school.overdue) : '—'}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-medium ${school.avgDaysToCollect <= 10 ? 'text-emerald-600' : school.avgDaysToCollect <= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                            {school.avgDaysToCollect}d
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => setSelectedSchool(school)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Charts ═══ */}
        <div className="space-y-4">
          {/* Aging Chart */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Aging de Cartera MeCard</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agingBuckets} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={70} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                  {agingBuckets.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {agingBuckets.map((b) => (
                <div key={b.label} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-slate-500">{b.label}</span>
                  </div>
                  <span className="font-medium text-slate-700">{b.count} fact. · {fmt(b.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tendencia de Cobro (6 meses)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="facturado" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} name="Facturado" />
                <Area type="monotone" dataKey="cobrado" stroke="#10b981" fill="#d1fae5" strokeWidth={2} name="Cobrado" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ DRAWER — School Detail ═══ */}
      {selectedSchool && (
        <SchoolDrawer school={selectedSchool} onClose={() => setSelectedSchool(null)} />
      )}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, badge }: {
  label: string; value: string; icon: React.FC<{ size?: number; className?: string }>;
  color: string; badge?: string;
}) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={`text-${color}-600`} />
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
          color === 'emerald' ? 'bg-emerald-50 text-emerald-700'
            : color === 'amber' ? 'bg-amber-50 text-amber-700'
            : color === 'red' ? 'bg-red-50 text-red-700'
            : 'bg-slate-50 text-slate-600'
        }`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── School Detail Drawer ─────────────────────────────

function SchoolDrawer({ school, onClose }: { school: SchoolCollectionRecord; onClose: () => void }) {
  const sem = getSemaphore(school);
  const style = SEMAPHORE_STYLES[sem];
  const collectionRate = school.totalBilled > 0 ? ((school.totalCollected / school.totalBilled) * 100).toFixed(1) : '0';

  // Mock timeline events
  const timeline = [
    { date: '2026-03-08', event: 'Factura INV-2026-03 emitida', type: 'issued' as const },
    { date: school.lastPaymentDate, event: `Pago recibido — ${school.lastInvoiceNumber}`, type: 'paid' as const },
    ...(school.overdue > 0 ? [
      { date: '2026-02-25', event: `Recordatorio enviado — ${fmt(school.overdue)} vencido`, type: 'reminder' as const },
      { date: '2026-02-10', event: 'Factura marcada como vencida', type: 'overdue' as const },
    ] : []),
    { date: '2026-01-10', event: 'Factura INV-2026-01 pagada', type: 'paid' as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">{school.name}</h2>
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Facturado', fmt(school.totalBilled)],
              ['Cobrado', fmt(school.totalCollected)],
              ['Tasa Cobro', `${collectionRate}%`],
              ['Vencido', fmt(school.overdue)],
              ['Días Prom Cobro', `${school.avgDaysToCollect} días`],
              ['Max Días Mora', `${school.maxOverdueDays} días`],
            ].map(([l, v]) => (
              <div key={l} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-500">{l}</p>
                <p className="text-sm font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>

          {/* Collection Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Historial de Cobro</h3>
            <div className="space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      event.type === 'paid' ? 'bg-emerald-500'
                        : event.type === 'overdue' ? 'bg-red-500'
                        : event.type === 'reminder' ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-medium text-slate-800">{event.event}</p>
                    <p className="text-[10px] text-slate-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {school.overdue > 0 && (
            <div className="bg-red-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-red-800">Acciones Recomendadas</p>
              <ul className="space-y-1.5 text-xs text-red-700">
                <li className="flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                  Enviar recordatorio de cobro ({fmt(school.overdue)} vencido)
                </li>
                {school.maxOverdueDays >= 30 && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                    Evaluar suspensión de servicio (mora &gt;30 días)
                  </li>
                )}
                {school.maxOverdueDays >= 60 && (
                  <li className="flex items-start gap-2">
                    <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                    Iniciar escalamiento legal (mora &gt;60 días)
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
