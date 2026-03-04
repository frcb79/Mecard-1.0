import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Wallet, QrCode, History, UtensilsCrossed, Gift, Star, Bell,
  MapPin, ShieldCheck, Settings, Sparkles, Award, TrendingUp,
  ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, Zap, ShoppingCart, ChefHat
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MOCK_STUDENT_TRANSACTIONS, MOCK_STUDENT_NOTIFICATIONS, MOCK_STUDENT_GIFTS_RECEIVED } from '../constants';
import { useStudent } from '../hooks/useStudents';
import { getFinancialEducation, getHealthChallenges } from '../services/geminiService';
import { getActivePreOrdersByStudent } from '../services/PreOrderService';
import { PreOrderStatus } from '../types';

export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();
  const { student: hookStudent } = useStudent(user?.id);
  const [dailyLesson, setDailyLesson] = useState('');
  const [dailyChallenge, setDailyChallenge] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    loadAIContent();
  }, []);

  const loadAIContent = async () => {
    setAiLoading(true);
    try {
      const [lesson, challenge] = await Promise.all([
        getFinancialEducation(10, 'cafeteria'),
        getHealthChallenges(10, [], []),
      ]);
      setDailyLesson(lesson);
      setDailyChallenge(challenge);
    } catch (e) {
      console.error('AI content error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const student = hookStudent!;
  const recentTxns = MOCK_STUDENT_TRANSACTIONS.slice(0, 4);
  const unreadNotifs = MOCK_STUDENT_NOTIFICATIONS.filter(n => !n.read).length;
  const pendingGifts = MOCK_STUDENT_GIFTS_RECEIVED.filter(g => g.status === 'PENDING').length;
  const activePreOrders = getActivePreOrdersByStudent(student.id);
  const available = student.dailyLimit - student.spentToday;
  const spentPercent = Math.min((student.spentToday / student.dailyLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg overflow-hidden">
                {student.photo ? (
                  <img src={student.photo} alt="" className="w-full h-full object-cover" />
                ) : <span>👦</span>}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  ¡Hola, {(student as any).name?.split(' ')[0] || 'Santiago'}! 👋
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold">{student.grade}</span>
                  <span>Matrícula: {student.id}</span>
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/student/notifications')} className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
              <Bell size={20} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unreadNotifs}</span>
              )}
            </button>
          </div>
        </header>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 md:p-8 text-white mb-6 shadow-xl shadow-emerald-200/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[3px]">Mi Saldo</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1">${student.balance.toFixed(2)}</h2>
            </div>
            <button onClick={() => navigate('/student/id')} className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors">
              <QrCode size={24} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-emerald-100 text-[10px] font-bold uppercase">Gastado hoy</p>
              <p className="text-lg font-black">${student.spentToday.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-emerald-100 text-[10px] font-bold uppercase">Disponible</p>
              <p className="text-lg font-black">${available.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-emerald-100 mb-1">
              <span>Límite diario</span>
              <span>${student.spentToday.toFixed(0)} / ${student.dailyLimit.toFixed(0)}</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${spentPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mb-6">
          {[
            { path: '/student/id', icon: <QrCode size={20} />, label: 'Credencial', color: 'from-emerald-500 to-emerald-600' },
            { path: '/student/menu', icon: <UtensilsCrossed size={20} />, label: 'Menú', color: 'from-teal-500 to-teal-600' },
            { path: '/student/preorder', icon: <ShoppingCart size={20} />, label: 'Pre-Orden', color: 'from-indigo-500 to-indigo-600' },
            { path: '/student/history', icon: <History size={20} />, label: 'Historial', color: 'from-cyan-500 to-cyan-600' },
            { path: '/student/gifts', icon: <Gift size={20} />, label: 'Regalos', color: 'from-pink-500 to-pink-600' },
            { path: '/student/rewards', icon: <Star size={20} />, label: 'Premios', color: 'from-amber-500 to-amber-600' },
            { path: '/student/reports', icon: <TrendingUp size={20} />, label: 'Reportes', color: 'from-indigo-500 to-indigo-600' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-1.5 p-3 md:p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                {a.icon}
              </div>
              <span className="text-[10px] md:text-xs font-bold text-slate-600">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={16} /> Últimas Compras</h3>
              <button onClick={() => navigate('/student/history')} className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline">
                Ver todo <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {t.amount > 0 ? <ArrowDownLeft size={14} className="text-emerald-600" /> : <ArrowUpRight size={14} className="text-rose-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{t.description}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={8} />
                        {new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">            {/* Active Pre-Orders */}
            {activePreOrders.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ChefHat size={16} className="text-indigo-600" /> Pre-Órdenes Activas
                  </h3>
                  <button onClick={() => navigate('/student/preorder')} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                    Ver todo <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {activePreOrders.slice(0, 2).map(o => {
                    const statusLabel = o.status === PreOrderStatus.CONFIRMED ? 'Confirmado'
                      : o.status === PreOrderStatus.PREPARING ? '🔥 Preparando'
                      : o.status === PreOrderStatus.READY ? '✅ ¡Listo!' : o.status;
                    const isReady = o.status === PreOrderStatus.READY;
                    return (
                      <div key={o.id} className={`flex items-center justify-between p-3 rounded-xl ${
                        isReady ? 'bg-emerald-50 border border-emerald-200 animate-pulse' : 'bg-white/70'
                      }`}>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{o.items.map(i => i.productName).join(', ')}</p>
                          <p className="text-[10px] text-slate-400">Recoge: {o.pickupTime}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Pending Gifts */}
            {pendingGifts > 0 && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl">🎁</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Tienes {pendingGifts} regalo{pendingGifts > 1 ? 's' : ''} pendiente{pendingGifts > 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-slate-500">Ve al POS a canjear tu código</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/student/gifts')} className="px-3 py-2 bg-pink-500 text-white rounded-xl text-[10px] font-bold hover:bg-pink-600">
                    Ver
                  </button>
                </div>
              </div>
            )}

            {/* Rewards Preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Star size={16} /> MeCard Rewards</h3>
                <button onClick={() => navigate('/student/rewards')} className="text-amber-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  Ir <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="text-3xl">🏆</div>
                <div className="flex-1">
                  <p className="text-2xl font-black text-slate-800">1,250</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Puntos MeCard</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">Gold</span>
                  <p className="text-[10px] text-slate-400 mt-1">x1.5 puntos</p>
                </div>
              </div>
            </div>

            {/* AI Learning Mini */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Lección del Día</h3>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                  Preparando tu lección…
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{dailyLesson || 'Ahorra un poco cada día y verás cómo crece tu alcancía 🐷'}</p>
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Award size={12} className="text-teal-600" />
                      <span className="text-[10px] font-bold text-teal-700 uppercase">Reto de Hoy</span>
                    </div>
                    <p className="text-xs text-slate-600">{dailyChallenge || 'Elige una fruta en vez de un snack hoy 🍎'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Quick Nav */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { path: '/student/trips', icon: '🗺️', label: 'Viajes', desc: 'Próximas excursiones' },
            { path: '/student/permissions', icon: '📋', label: 'Permisos', desc: 'Permisos de salida' },
            { path: '/student/notifications', icon: '🔔', label: 'Notificaciones', desc: `${unreadNotifs} sin leer` },
            { path: '/student/settings', icon: '⚙️', label: 'Configuración', desc: 'Mi perfil' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all text-left">
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-700">{a.label}</p>
                <p className="text-[10px] text-slate-400">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Demo Banner */}
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <Zap size={18} className="text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-emerald-900 text-xs">Modo Demo</p>
            <p className="text-emerald-700 text-[10px]">Datos de ejemplo — se conectará a Supabase en producción.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
