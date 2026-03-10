/**
 * Predicción de Demanda de Cafetería — Proyección de ventas y demanda por producto
 * Media móvil 4 semanas × factor estacional, heat map, sugerencias de preparación.
 * Visible según ownerType: CONCESSIONAIRE→UNIT_MANAGER, SCHOOL→SCHOOL_ADMIN.
 *
 * @role UNIT_MANAGER, SCHOOL_ADMIN (if ownerType=SCHOOL)
 * @route /unit/demand-forecast
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus, ShoppingCart, AlertTriangle,
  ChefHat, Package, Flame, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';

// ─── Types ──────────────────────────────────────────

interface ProductForecast {
  id: string;
  name: string;
  category: string;
  avgDailySales: number;
  predictionTomorrow: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  suggestion: string;
  currentStock: number;
  needsRestock: boolean;
}

interface HeatCell {
  day: string;
  slot: string;
  volume: number;
}

// ─── Mock Data ──────────────────────────────────────

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const DAY_FACTORS: Record<string, number> = { Lun: 0.90, Mar: 0.95, Mié: 1.00, Jue: 1.05, Vie: 1.15 };
const SLOTS = ['7-9am', '9-11am', '11am-1pm', '1-3pm'];

// 2 weeks of daily sales + 1 week prediction
function generateWeeklyData() {
  const baseDaily = 4200;
  const data = [];
  // Past 10 working days (2 weeks)
  for (let w = 0; w < 2; w++) {
    for (let d = 0; d < 5; d++) {
      const dayName = DAYS[d];
      const factor = DAY_FACTORS[dayName];
      const noise = 0.9 + Math.random() * 0.2; // ±10%
      data.push({
        label: `S${w + 1} ${dayName}`,
        real: Math.round(baseDaily * factor * noise),
        prediction: null as number | null,
        lower: null as number | null,
        upper: null as number | null,
      });
    }
  }
  // Next 5 days prediction
  for (let d = 0; d < 5; d++) {
    const dayName = DAYS[d];
    const factor = DAY_FACTORS[dayName];
    const avg = data.reduce((s, x) => s + (x.real ?? 0), 0) / data.length;
    const pred = Math.round(avg * factor);
    data.push({
      label: `Próx ${dayName}`,
      real: null,
      prediction: pred,
      lower: Math.round(pred * 0.85),
      upper: Math.round(pred * 1.15),
    });
  }
  return data;
}

const WEEKLY_DATA = generateWeeklyData();

const PRODUCT_FORECASTS: ProductForecast[] = [
  { id: 'p1', name: 'Menú del Día', category: 'Combo', avgDailySales: 85, predictionTomorrow: 92, trend: 'up', trendPercent: 12, suggestion: 'Preparar +15%', currentStock: 100, needsRestock: false },
  { id: 'p2', name: 'Combo Hamburguesa', category: 'Combo', avgDailySales: 62, predictionTomorrow: 65, trend: 'stable', trendPercent: 3, suggestion: 'Mantener', currentStock: 70, needsRestock: false },
  { id: 'p3', name: 'Wrap Pollo', category: 'Platillo', avgDailySales: 48, predictionTomorrow: 55, trend: 'up', trendPercent: 15, suggestion: 'Preparar +20%', currentStock: 40, needsRestock: true },
  { id: 'p4', name: 'Quesadillas', category: 'Platillo', avgDailySales: 72, predictionTomorrow: 70, trend: 'stable', trendPercent: -2, suggestion: 'Mantener', currentStock: 80, needsRestock: false },
  { id: 'p5', name: 'Agua Natural', category: 'Bebida', avgDailySales: 120, predictionTomorrow: 130, trend: 'up', trendPercent: 8, suggestion: 'Reabastecer +10%', currentStock: 90, needsRestock: true },
  { id: 'p6', name: 'Hot Dog', category: 'Platillo', avgDailySales: 55, predictionTomorrow: 48, trend: 'down', trendPercent: -13, suggestion: 'Reducir -15%', currentStock: 65, needsRestock: false },
  { id: 'p7', name: 'Jugo Naranja', category: 'Bebida', avgDailySales: 45, predictionTomorrow: 42, trend: 'down', trendPercent: -8, suggestion: 'Reducir -10%', currentStock: 50, needsRestock: false },
  { id: 'p8', name: 'Fruta Picada', category: 'Snack', avgDailySales: 38, predictionTomorrow: 44, trend: 'up', trendPercent: 16, suggestion: 'Preparar +20%', currentStock: 30, needsRestock: true },
  { id: 'p9', name: 'Smoothie Fresa', category: 'Bebida', avgDailySales: 32, predictionTomorrow: 35, trend: 'up', trendPercent: 9, suggestion: 'Preparar +10%', currentStock: 40, needsRestock: false },
  { id: 'p10', name: 'Sincronizada', category: 'Platillo', avgDailySales: 42, predictionTomorrow: 40, trend: 'stable', trendPercent: -4, suggestion: 'Mantener', currentStock: 50, needsRestock: false },
  { id: 'p11', name: 'Granola', category: 'Snack', avgDailySales: 28, predictionTomorrow: 30, trend: 'stable', trendPercent: 5, suggestion: 'Mantener', currentStock: 35, needsRestock: false },
  { id: 'p12', name: 'Galletas', category: 'Snack', avgDailySales: 22, predictionTomorrow: 20, trend: 'down', trendPercent: -10, suggestion: 'Reducir -10%', currentStock: 25, needsRestock: false },
];

// Heat map data: random-ish volumes by day × slot
const HEAT_DATA: HeatCell[] = [];
for (const day of DAYS) {
  for (const slot of SLOTS) {
    const base = slot === '11am-1pm' ? 1800 : slot === '9-11am' ? 800 : slot === '7-9am' ? 400 : 600;
    HEAT_DATA.push({ day, slot, volume: Math.round(base * DAY_FACTORS[day] * (0.85 + Math.random() * 0.3)) });
  }
}

// ─── Utils ──────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('es-MX').format(n);

function heatColor(volume: number): string {
  const max = 2200;
  const ratio = Math.min(volume / max, 1);
  if (ratio < 0.25) return 'bg-emerald-100 text-emerald-800';
  if (ratio < 0.50) return 'bg-emerald-200 text-emerald-900';
  if (ratio < 0.75) return 'bg-emerald-400 text-white';
  return 'bg-emerald-600 text-white';
}

// ─── Main Component ──────────────────────────────────

export default function CafeteriaDemandForecast() {
  const [productFilter, setProductFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(PRODUCT_FORECASTS.map((p) => p.category));
    return ['all', ...cats];
  }, []);

  const filteredProducts = useMemo(() =>
    PRODUCT_FORECASTS.filter((p) => productFilter === 'all' || p.category === productFilter)
  , [productFilter]);

  const topProducts = useMemo(() =>
    [...PRODUCT_FORECASTS].sort((a, b) => b.avgDailySales - a.avgDailySales).slice(0, 3)
  , []);

  const avgDailySales = useMemo(() =>
    Math.round(WEEKLY_DATA.filter((d) => d.real !== null).reduce((s, d) => s + (d.real ?? 0), 0) / WEEKLY_DATA.filter((d) => d.real !== null).length)
  , []);

  const predictionTomorrow = useMemo(() => {
    const next = WEEKLY_DATA.find((d) => d.prediction !== null);
    return next?.prediction ?? 0;
  }, []);

  const restockProducts = PRODUCT_FORECASTS.filter((p) => p.needsRestock);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Predicción de Demanda</h1>
          <p className="text-xs text-slate-500">Proyección de ventas basada en histórico de las últimas 4 semanas</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ChefHat size={14} className="text-orange-600" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Venta Prom/Día</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{fmt(avgDailySales)}</p>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-indigo-600" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Predicción Mañana</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{fmt(predictionTomorrow)}</p>
          <span className={`text-[10px] font-medium ${predictionTomorrow > avgDailySales ? 'text-emerald-600' : 'text-amber-600'}`}>
            {predictionTomorrow > avgDailySales ? '↑' : '↓'} {Math.abs(((predictionTomorrow - avgDailySales) / avgDailySales) * 100).toFixed(0)}% vs promedio
          </span>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-red-500" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Productos Estrella</span>
          </div>
          <div className="space-y-0.5">
            {topProducts.map((p, i) => (
              <p key={p.id} className="text-[10px] text-slate-700">
                <span className="font-bold">{i + 1}.</span> {p.name} ({p.avgDailySales}/día)
              </p>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber-600" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Por Agotarse</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{restockProducts.length}</p>
          <span className="text-[10px] text-amber-600 font-medium">productos bajo stock</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT: Charts ═══ */}
        <div className="lg:col-span-8 space-y-4">
          {/* Weekly Projection Chart */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Proyección Semanal de Ventas ($)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip formatter={(v: number | null) => v != null ? fmt(v) : '—'} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {/* Confidence interval */}
                <Area type="monotone" dataKey="upper" stroke="none" fill="#c7d2fe" fillOpacity={0.3} name="Límite sup." />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#c7d2fe" fillOpacity={0.3} name="Límite inf." />
                {/* Real sales */}
                <Line type="monotone" dataKey="real" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Venta real" connectNulls={false} />
                {/* Prediction */}
                <Line type="monotone" dataKey="prediction" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, strokeWidth: 2 }} name="Predicción" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Demand Table */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Demanda por Producto</h3>
              </div>
              <div className="flex gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductFilter(cat)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      productFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/50">
                    <th className="text-left py-2.5 px-4 font-semibold text-slate-600">Producto</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-slate-600">Categoría</th>
                    <th className="text-right py-2.5 px-2 font-semibold text-slate-600">Prom/día</th>
                    <th className="text-right py-2.5 px-2 font-semibold text-slate-600">Pred. mañana</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-slate-600">Tendencia</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-slate-600">Stock</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-slate-600">Sugerencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{p.category}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">{p.avgDailySales}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900">{p.predictionTomorrow}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                          p.trend === 'up' ? 'text-emerald-600' : p.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                        }`}>
                          {p.trend === 'up' ? <ArrowUp size={10} /> : p.trend === 'down' ? <ArrowDown size={10} /> : <Minus size={10} />}
                          {Math.abs(p.trendPercent)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-medium ${p.needsRestock ? 'text-red-600' : 'text-slate-600'}`}>
                          {p.currentStock}
                          {p.needsRestock && <AlertTriangle size={10} className="inline ml-0.5 text-red-500" />}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          p.suggestion.startsWith('Preparar') || p.suggestion.startsWith('Reabastecer')
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.suggestion.startsWith('Reducir')
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-50 text-slate-600'
                        }`}>
                          {p.suggestion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Heat Map + Restock ═══ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Heat Map */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Heat Map Semanal (Volumen $)</h3>
            <div className="space-y-1.5">
              {/* Header */}
              <div className="grid grid-cols-5 gap-1 pl-12">
                {SLOTS.map((s) => (
                  <div key={s} className="text-[9px] text-slate-500 text-center font-medium">{s}</div>
                ))}
              </div>
              {/* Rows */}
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-5 gap-1 items-center">
                  <div className="text-[10px] font-semibold text-slate-700 w-10 text-right pr-2">{day}</div>
                  {SLOTS.map((slot) => {
                    const cell = HEAT_DATA.find((c) => c.day === day && c.slot === slot);
                    const vol = cell?.volume ?? 0;
                    return (
                      <div
                        key={`${day}-${slot}`}
                        className={`rounded-lg py-2 text-center text-[9px] font-bold ${heatColor(vol)}`}
                        title={`${day} ${slot}: ${fmt(vol)}`}
                      >
                        {fmt(vol).replace('MXN', '').trim()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-center">
              <span className="text-[9px] text-slate-500">Bajo</span>
              <div className="flex gap-0.5">
                {['bg-emerald-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-600'].map((c) => (
                  <div key={c} className={`w-4 h-3 rounded ${c}`} />
                ))}
              </div>
              <span className="text-[9px] text-slate-500">Alto</span>
            </div>
          </div>

          {/* Restock Alerts */}
          <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Productos por Agotarse</h3>
            </div>
            {restockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Sin alertas de stock</p>
            ) : (
              <div className="space-y-2.5">
                {restockProducts.map((p) => {
                  const deficit = p.predictionTomorrow - p.currentStock;
                  return (
                    <div key={p.id} className="bg-amber-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-900">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                          Reabastecer
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-amber-700">
                        <span>Stock: {p.currentStock}</span>
                        <span>Predicción: {p.predictionTomorrow}</span>
                        {deficit > 0 && <span className="font-bold text-red-600">Faltante: {deficit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] p-5">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">💡 Cómo funciona</h3>
            <ul className="space-y-1.5 text-[10px] text-indigo-700">
              <li>• La predicción usa el promedio de las últimas 4 semanas del mismo día</li>
              <li>• Factor estacional: Lunes ×0.90, Viernes ×1.15</li>
              <li>• Tendencia ↑: ventas subieron +10% vs semana anterior</li>
              <li>• Tendencia ↓: ventas bajaron -10% vs semana anterior</li>
              <li>• Zona sombreada = intervalo de confianza ±15%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
