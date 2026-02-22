import React, { useState } from 'react';
import { Star, Gift, Clock, Trophy, Crown, TrendingUp, Zap, ChevronRight, Award, Sparkles } from 'lucide-react';

// Demo data — no Supabase needed
const DEMO_POINTS = {
  total: 2450,
  earnedThisCycle: 780,
  redeemedThisCycle: 200,
  tier: 'SILVER' as const,
  cycleEnd: '2026-06-30',
  multiplier: 1.25,
};

const TIER_INFO: Record<string, { label: string; icon: string; color: string; next: string; nextAt: number }> = {
  BRONZE: { label: 'Bronce', icon: '🥉', color: 'from-amber-600 to-amber-800', next: 'Plata', nextAt: 500 },
  SILVER: { label: 'Plata', icon: '🥈', color: 'from-slate-400 to-slate-600', next: 'Oro', nextAt: 1500 },
  GOLD: { label: 'Oro', icon: '🥇', color: 'from-yellow-400 to-amber-500', next: 'Platino', nextAt: 5000 },
  PLATINUM: { label: 'Platino', icon: '💎', color: 'from-purple-500 to-indigo-600', next: '', nextAt: 0 },
};

const DEMO_PRODUCTS = [
  { id: 'rp1', name: 'Libreta Premium', emoji: '📓', points: 500, category: 'Útiles', available: true, popular: true },
  { id: 'rp2', name: 'Playera del Colegio', emoji: '👕', points: 1200, category: 'Ropa', available: true, popular: false },
  { id: 'rp3', name: 'Día sin Uniforme', emoji: '🎉', points: 800, category: 'Experiencias', available: true, popular: true },
  { id: 'rp4', name: 'Almuerzo Gratis', emoji: '🍽️', points: 350, category: 'Comida', available: true, popular: true },
  { id: 'rp5', name: 'USB 32GB', emoji: '💻', points: 1500, category: 'Tecnología', available: true, popular: false },
  { id: 'rp6', name: 'Pelota de Fútbol', emoji: '⚽', points: 2000, category: 'Deportes', available: true, popular: false },
  { id: 'rp7', name: 'Stickers Pack', emoji: '✨', points: 150, category: 'Útiles', available: true, popular: true },
  { id: 'rp8', name: 'Audífonos', emoji: '🎧', points: 3000, category: 'Tecnología', available: false, popular: false },
];

const DEMO_HISTORY = [
  { id: 'h1', type: 'earn' as const, desc: 'Compra en cafetería', points: 45, date: '2026-02-20' },
  { id: 'h2', type: 'earn' as const, desc: 'Compra en cafetería', points: 30, date: '2026-02-19' },
  { id: 'h3', type: 'redeem' as const, desc: 'Canjeado: Stickers Pack', points: -150, date: '2026-02-18' },
  { id: 'h4', type: 'earn' as const, desc: 'Compra refacción', points: 60, date: '2026-02-17' },
  { id: 'h5', type: 'earn' as const, desc: 'Bonus: Compra consecutiva', points: 100, date: '2026-02-16' },
  { id: 'h6', type: 'redeem' as const, desc: 'Canjeado: Almuerzo Gratis', points: -350, date: '2026-02-14' },
];

type Tab = 'points' | 'redeem' | 'history';

export default function StudentRewardsView() {
  const [tab, setTab] = useState<Tab>('points');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [redeemConfirm, setRedeemConfirm] = useState<string | null>(null);

  const pts = DEMO_POINTS;
  const tier = TIER_INFO[pts.tier];
  const progressToNext = tier.nextAt > 0 ? (pts.earnedThisCycle / tier.nextAt) * 100 : 100;

  const categories = ['Todos', ...new Set(DEMO_PRODUCTS.map(p => p.category))];
  const filteredProducts = selectedCategory === 'Todos'
    ? DEMO_PRODUCTS
    : DEMO_PRODUCTS.filter(p => p.category === selectedCategory);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'points', label: 'Mis Puntos', icon: <Star size={16} /> },
    { id: 'redeem', label: 'Canjear', icon: <Gift size={16} /> },
    { id: 'history', label: 'Historial', icon: <Clock size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <Trophy size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Mis Premios</h1>
            <p className="text-xs text-slate-500">Puntos y recompensas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Points Tab */}
        {tab === 'points' && (
          <div className="space-y-4">
            {/* Main Points Card */}
            <div className={`bg-gradient-to-br ${tier.color} rounded-3xl p-6 md:p-8 text-white shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/70 text-xs font-bold flex items-center gap-1.5"><Zap size={14} /> Puntos Disponibles</p>
                  <h2 className="text-4xl md:text-5xl font-black">{pts.total.toLocaleString()}</h2>
                </div>
                <Crown className="text-white/20" size={56} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className="text-white/70 text-[10px] font-bold uppercase">Nivel</p>
                    <p className="font-black">{tier.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-[10px] font-bold">Multiplicador</p>
                  <p className="text-yellow-300 font-black">{(pts.multiplier * 100).toFixed(0)}%</p>
                </div>
              </div>

              {tier.next && (
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70 text-xs font-bold">Progreso a {tier.next}</span>
                    <span className="text-yellow-300 text-xs font-bold">{(tier.nextAt - pts.earnedThisCycle).toLocaleString()} pts</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-yellow-300 h-full rounded-full transition-all" style={{ width: `${Math.min(progressToNext, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Este Ciclo', value: pts.earnedThisCycle.toLocaleString(), icon: <TrendingUp size={16} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                { label: 'Canjeados', value: pts.redeemedThisCycle.toLocaleString(), icon: <Gift size={16} />, bg: 'bg-purple-50', color: 'text-purple-600' },
                { label: 'Expira', value: new Date(pts.cycleEnd).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }), icon: <Clock size={16} />, bg: 'bg-amber-50', color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className={`flex items-center gap-1 mb-2 ${s.color}`}>{s.icon}<span className="text-[10px] font-bold uppercase">{s.label}</span></div>
                  <p className="text-xl font-black text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tier Benefits */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <Award className="text-amber-600 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-black text-amber-900 mb-1">Beneficios Nivel {tier.label}</p>
                  <ul className="text-xs text-amber-800 space-y-0.5">
                    <li>• Ganas {(pts.multiplier * 100).toFixed(0)}% puntos extra por compra</li>
                    <li>• Acceso prioritario a productos limitados</li>
                    <li>• Validez hasta {new Date(pts.cycleEnd).toLocaleDateString('es-MX')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Tab */}
        {tab === 'redeem' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === c ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map(p => {
                const canAfford = pts.total >= p.points;
                return (
                  <div key={p.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${!p.available ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                          {p.popular && <Sparkles size={12} className="text-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400">{p.category}</p>
                        <p className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1"><Star size={12} /> {p.points.toLocaleString()} pts</p>
                      </div>
                    </div>
                    {p.available ? (
                      redeemConfirm === p.id ? (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setRedeemConfirm(null)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">Cancelar</button>
                          <button onClick={() => { setRedeemConfirm(null); alert('🎉 ¡Canjeado! (Demo)'); }} className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">Confirmar</button>
                        </div>
                      ) : (
                        <button onClick={() => canAfford && setRedeemConfirm(p.id)} disabled={!canAfford}
                          className={`w-full mt-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${canAfford ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                          {canAfford ? 'Canjear' : 'Puntos insuficientes'}
                        </button>
                      )
                    ) : (
                      <p className="mt-3 text-center text-xs text-slate-400 font-bold">Agotado</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            {DEMO_HISTORY.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.type === 'earn' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {h.type === 'earn' ? <TrendingUp size={14} className="text-emerald-600" /> : <Gift size={14} className="text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{h.desc}</p>
                  <p className="text-[10px] text-slate-400">{new Date(h.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`font-black text-sm ${h.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {h.points > 0 ? '+' : ''}{h.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Demo Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-bold">🎮 Modo Demo — datos de ejemplo</p>
        </div>
      </div>
    </div>
  );
}
