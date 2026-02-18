
import React, { useMemo } from 'react';
import {
  CreditCard, QrCode, Utensils, History, ArrowRight, Zap,
  ShieldCheck, HeartPulse, Star, TrendingUp, ShoppingBag,
  ArrowDownLeft, Clock, Info, Sparkles, ArrowUpRight, Landmark,
  Lock, Ban, Coffee, LayoutGrid, X
} from 'lucide-react';
import { AppView, StudentProfile, Transaction, Category } from '../types';
import { PRODUCTS } from '../constants';

interface StudentPortalProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  student: StudentProfile;
  transactions: Transaction[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ view, onNavigate, student, transactions }) => {
  const spentPercentage = Math.min((student.spentToday / student.dailyLimit) * 100, 100);
  const firstName = student.name.split(' ')[0];

  const blockedProductsList = useMemo(() => {
    return PRODUCTS.filter(p => student.restrictedProducts?.includes(p.id));
  }, [student.restrictedProducts]);

  const renderContent = () => {
    switch (view) {
      case AppView.STUDENT_DASHBOARD:
        return (
          <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <header>
              <p className="text-brand-500 font-semibold uppercase text-xs tracking-widest mb-1">MeCard Student Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-800 tracking-tight">¡Hola, {firstName}! 👋</h1>
            </header>

            {/* Balance + Daily Limit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Balance Card */}
              <div className="lg:col-span-2 bg-surface-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg group">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500 rounded-full blur-[100px] opacity-20 group-hover:scale-110 transition-transform duration-[2000ms]" />
                <div className="relative z-10 flex flex-col justify-between min-h-[200px]">
                  <div className="flex justify-between items-start">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <Zap size={24} className="text-warm-400 fill-warm-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-300 mb-1">Network Passport</p>
                      <p className="font-mono text-xs opacity-40">ID: {student.id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-8">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-2">Saldo Disponible</p>
                      <p className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none">${student.balance.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => onNavigate(AppView.STUDENT_ID)}
                      className="bg-white text-surface-900 p-4 sm:p-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                      aria-label="Ver código QR"
                    >
                      <QrCode size={32} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Limit Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6 text-brand-500">
                    <TrendingUp size={22} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Límite Diario</h3>
                  </div>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-surface-800 tracking-tight">${student.spentToday.toFixed(0)}</span>
                    <span className="text-surface-300 text-xl font-bold mb-0.5">/ ${student.dailyLimit}</span>
                  </div>
                  <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${spentPercentage > 90 ? 'bg-danger' : 'bg-brand-500'}`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-surface-400">{spentPercentage.toFixed(0)}% del total diario</p>
                </div>
                <button
                  onClick={() => onNavigate(AppView.STUDENT_HISTORY)}
                  className="w-full mt-4 py-3 rounded-xl bg-surface-50 text-surface-500 text-xs font-semibold hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  Ver Detalle de Gastos
                </button>
              </div>
            </div>

            {/* Activity + Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
                  <History size={20} className="text-brand-500" /> Actividad Reciente
                </h3>
                <div className="bg-white rounded-2xl border border-surface-100 shadow-xs overflow-hidden divide-y divide-surface-50">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center text-surface-400 group-hover:scale-105 transition-transform">
                          {tx.type === 'deposit' ? <ArrowDownLeft size={18} className="text-trust-500" /> : <ShoppingBag size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-800 text-sm">{tx.item}</p>
                          <p className="text-xs text-surface-400">{tx.date} · {tx.location}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-lg tracking-tight ${tx.type === 'deposit' ? 'text-trust-500' : 'text-surface-800'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Health */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-trust-500" /> Seguridad y Salud
                </h3>
                <div className="space-y-3">
                  {student.allergies.length > 0 && (
                    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
                      <div className="bg-danger p-3 rounded-xl text-white shrink-0"><HeartPulse size={22} /></div>
                      <div>
                        <p className="text-danger text-xs font-semibold uppercase tracking-wider mb-1">Alerta Médica</p>
                        <p className="text-red-900 font-bold text-sm">Prohibido: {student.allergies.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {student.restrictedCategories.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <Ban size={16} className="text-danger" />
                        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Categorías Restringidas</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {student.restrictedCategories.map(cat => (
                          <span key={cat} className="flex items-center gap-1.5 bg-surface-50 text-surface-600 px-3 py-1.5 rounded-lg border border-surface-100 text-xs font-medium">
                            <Lock size={12} /> {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-surface-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={80} /></div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">MeCard Protection</h4>
                    <p className="text-surface-300 text-sm leading-relaxed">Tu cuenta está protegida con encriptación bancaria y controles de seguridad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case AppView.STUDENT_ID:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
            <div className="w-full max-w-sm">
              <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl text-center border border-surface-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-500" />
                <h2 className="text-lg font-bold mb-6 text-surface-800 uppercase tracking-widest">MeCard Pay</h2>
                <div className="bg-surface-900 p-6 rounded-2xl mb-6 shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${student.id}`}
                    alt="Código QR de pago"
                    className="w-full h-auto invert mix-blend-screen"
                  />
                </div>
                <p className="font-mono text-2xl tracking-[8px] font-bold text-brand-500 mb-3">{student.id}</p>
                <p className="text-surface-400 text-xs tracking-wider">Válido para todas las unidades POS</p>
                <button
                  onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)}
                  className="mt-8 text-surface-400 text-xs font-medium hover:text-brand-500 transition-colors"
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </div>
        );

      case AppView.STUDENT_HISTORY:
        return (
          <div className="animate-fade-in-up space-y-5">
            <header>
              <p className="text-brand-500 font-semibold uppercase text-xs tracking-widest mb-1">Consumo Inteligente</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-800 tracking-tight">Mi Historial</h1>
            </header>
            <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden divide-y divide-surface-50">
              {transactions.length === 0 ? (
                <div className="py-20 text-center text-surface-300 font-medium">Sin movimientos</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-surface-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs
                        ${tx.type === 'deposit' ? 'bg-trust-50 text-trust-500 border border-trust-100' : 'bg-surface-50 text-surface-400 border border-surface-100'}`}>
                        {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : <ShoppingBag size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-surface-800 text-sm">{tx.item}</p>
                        <div className="flex gap-3 text-xs text-surface-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {tx.date}</span>
                          <span className="flex items-center gap-1"><Landmark size={12} /> {tx.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold tracking-tight ${tx.type === 'deposit' ? 'text-trust-500' : 'text-surface-800'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-surface-300">ID: {tx.id}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-surface-300 text-center py-20">
            <Info size={64} strokeWidth={1} className="mb-6 opacity-30" />
            <p className="font-semibold text-sm uppercase tracking-wider">Módulo en Desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto h-full overflow-y-auto pb-24">
      {renderContent()}
    </div>
  );
};
