import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { MOCK_STUDENT_TRANSACTIONS } from '../constants';
import { TransactionType } from '../types';

type Period = 'today' | 'week' | 'month';

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  'Torta': { label: 'Tortas/Sandwiches', emoji: '🥪', color: 'bg-amber-100 text-amber-700' },
  'Sandwich': { label: 'Tortas/Sandwiches', emoji: '🥪', color: 'bg-amber-100 text-amber-700' },
  'Jugo': { label: 'Bebidas', emoji: '🧃', color: 'bg-cyan-100 text-cyan-700' },
  'Limonada': { label: 'Bebidas', emoji: '🧃', color: 'bg-cyan-100 text-cyan-700' },
  'Agua': { label: 'Bebidas', emoji: '🧃', color: 'bg-cyan-100 text-cyan-700' },
  'Ensalada': { label: 'Ensaladas', emoji: '🥗', color: 'bg-emerald-100 text-emerald-700' },
  'Pizza': { label: 'Comida Caliente', emoji: '🍕', color: 'bg-red-100 text-red-700' },
  'Hot Dog': { label: 'Comida Caliente', emoji: '🌭', color: 'bg-red-100 text-red-700' },
  'Brownie': { label: 'Snacks', emoji: '🍫', color: 'bg-purple-100 text-purple-700' },
  'Galletas': { label: 'Snacks', emoji: '🍪', color: 'bg-purple-100 text-purple-700' },
};

function categorize(desc: string): string {
  for (const [keyword] of Object.entries(CATEGORY_MAP)) {
    if (desc.toLowerCase().includes(keyword.toLowerCase())) return keyword;
  }
  return 'Otro';
}

export default function StudentReportsView() {
  const [period, setPeriod] = useState<Period>('week');

  const txns = MOCK_STUDENT_TRANSACTIONS;

  const stats = useMemo(() => {
    const now = new Date();
    const filtered = txns.filter(t => {
      const d = new Date(t.date);
      if (period === 'today') return d.toDateString() === now.toDateString();
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return d >= monthAgo;
    });

    const purchases = filtered.filter(t => t.amount < 0 && t.type !== TransactionType.GIFT_SENT);
    const deposits = filtered.filter(t => t.amount > 0);
    const totalSpent = purchases.reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalDeposited = deposits.reduce((s, t) => s + t.amount, 0);
    const avgPurchase = purchases.length > 0 ? totalSpent / purchases.length : 0;

    // Category breakdown
    const catMap = new Map<string, number>();
    purchases.forEach(t => {
      const cat = categorize(t.description);
      const info = CATEGORY_MAP[cat] || { label: 'Otros', emoji: '📦', color: 'bg-slate-100 text-slate-700' };
      const label = info.label;
      catMap.set(label, (catMap.get(label) || 0) + Math.abs(t.amount));
    });
    const categories = [...catMap.entries()]
      .map(([label, amount]) => ({ label, amount, percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    // Daily breakdown (for bar chart)
    const dailyMap = new Map<string, number>();
    purchases.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('es-MX', { weekday: 'short' });
      dailyMap.set(day, (dailyMap.get(day) || 0) + Math.abs(t.amount));
    });
    const daily = [...dailyMap.entries()].map(([day, amount]) => ({ day, amount }));
    const maxDaily = Math.max(...daily.map(d => d.amount), 1);

    // Top products
    const prodMap = new Map<string, { count: number; total: number }>();
    purchases.forEach(t => {
      const name = t.description.split(' + ')[0];
      const existing = prodMap.get(name) || { count: 0, total: 0 };
      prodMap.set(name, { count: existing.count + 1, total: existing.total + Math.abs(t.amount) });
    });
    const topProducts = [...prodMap.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalSpent, totalDeposited, avgPurchase, purchaseCount: purchases.length, categories, daily, maxDaily, topProducts };
  }, [txns, period]);

  const periodLabels = { today: 'Hoy', week: 'Esta Semana', month: 'Este Mes' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Mis Reportes</h1>
            <p className="text-xs text-slate-500">Resumen de mis gastos</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {(['today', 'week', 'month'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${period === p ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Gastado', value: `$${stats.totalSpent.toFixed(2)}`, icon: <TrendingDown size={16} />, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Depositado', value: `$${stats.totalDeposited.toFixed(2)}`, icon: <TrendingUp size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Promedio', value: `$${stats.avgPurchase.toFixed(2)}`, icon: <DollarSign size={16} />, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Compras', value: `${stats.purchaseCount}`, icon: <ShoppingCart size={16} />, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-100`}>
              <div className={`flex items-center gap-1 mb-1 ${s.color}`}>{s.icon}<span className="text-[10px] font-bold uppercase">{s.label}</span></div>
              <p className="text-xl font-black text-slate-800">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📊 Gasto por Categoría</h3>
            {stats.categories.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin datos para este período</p>
            ) : (
              <div className="space-y-3">
                {stats.categories.map(cat => {
                  const info = Object.values(CATEGORY_MAP).find(c => c.label === cat.label) || { emoji: '📦', color: 'bg-slate-100 text-slate-700' };
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <span>{info.emoji}</span> {cat.label}
                        </span>
                        <span className="text-xs font-black text-slate-800">${cat.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${cat.percent}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right">{cat.percent.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📅 Gasto Diario</h3>
            {stats.daily.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin datos</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {stats.daily.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-600">${d.amount.toFixed(0)}</span>
                    <div className="w-full bg-emerald-100 rounded-t-lg relative" style={{ height: `${(d.amount / stats.maxDaily) * 100}%`, minHeight: '8px' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">🏆 Lo que más compro</h3>
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin datos</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {stats.topProducts.map((p, i) => {
                  const cat = categorize(p.name);
                  const info = CATEGORY_MAP[cat] || { emoji: '📦', color: 'bg-slate-100 text-slate-700' };
                  return (
                    <div key={p.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{info.emoji} {p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.count}x • ${p.total.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
