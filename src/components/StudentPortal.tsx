
import React, { useMemo } from 'react';
import { 
  CreditCard, QrCode, Utensils, History, ArrowRight, Zap, 
  ShieldCheck, HeartPulse, Star, TrendingUp, ShoppingBag, 
  ArrowDownLeft, Clock, Info, Bot, Sparkles, ArrowUpRight, Landmark,
  Lock, Ban, Coffee, Pizza, LayoutGrid, X
} from 'lucide-react';
import { AppView, StudentProfile, Transaction, Category } from '../types';
import { PRODUCTS } from '../constants';
import { Button } from './Button';

interface StudentPortalProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  student: StudentProfile;
  transactions: Transaction[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ view, onNavigate, student, transactions }) => {
  const spentPercentage = (student.spentToday / student.dailyLimit) * 100;
  const firstName = student.name.split(' ')[0];

  const blockedProductsList = useMemo(() => {
    return PRODUCTS.filter(p => student.restrictedProducts?.includes(p.id));
  }, [student.restrictedProducts]);

  const renderContent = () => {
    switch (view) {
      case AppView.STUDENT_DASHBOARD:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="mb-12">
              <p className="text-indigo-500 font-black uppercase text-[11px] tracking-[6px] mb-4">MeCard Student Portal</p>
              <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">¡Hola, {firstName}! 👋</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
              <div className="lg:col-span-2 bg-slate-950 rounded-[64px] p-12 text-white relative overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[140px] opacity-30 group-hover:scale-110 transition-transform duration-[3000ms]"></div>
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[300px]">
                  <div className="flex justify-between items-start">
                    <div className="bg-white/10 p-6 rounded-[32px] backdrop-blur-2xl border border-white/10 shadow-2xl">
                       <Zap size={36} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400 mb-2">NETWORK PASSPORT</p>
                      <p className="font-mono text-sm opacity-40">MECARD-ID: {student.id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[4px] opacity-40 mb-4">Saldo Disponible</p>
                      <p className="text-9xl font-black tracking-tighter leading-none">${student.balance.toFixed(2)}</p>
                    </div>
                    <button onClick={() => onNavigate(AppView.STUDENT_ID)} className="bg-white text-slate-950 p-8 rounded-[40px] hover:scale-110 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
                      <QrCode size={48} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[64px] p-12 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-10 text-indigo-600">
                    <TrendingUp size={32} />
                    <h3 className="text-[12px] font-black uppercase tracking-[4px]">Límite Diario</h3>
                  </div>
                  <div className="flex justify-between items-end mb-6">
                    <p className="text-5xl font-black text-slate-800 tracking-tighter leading-none">${student.spentToday.toFixed(0)} <span className="text-slate-200 text-3xl">/ ${student.dailyLimit}</span></p>
                  </div>
                  <div className="w-full h-6 bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-4 shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${spentPercentage > 90 ? 'bg-rose-500 shadow-rose-200 shadow-lg' : 'bg-indigo-600 shadow-indigo-200 shadow-lg'}`} style={{ width: `${spentPercentage}%` }}></div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo actual: {spentPercentage.toFixed(0)}% del total diario</p>
                </div>
                <button onClick={() => onNavigate(AppView.STUDENT_HISTORY)} className="w-full py-6 rounded-[32px] bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">Ver Detalle de Gastos</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-2xl font-black text-slate-800 px-6 flex items-center gap-4"><History size={28} className="text-indigo-600" /> Actividad Reciente</h3>
                <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-10 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-[28px] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          {tx.type === 'deposit' ? <ArrowDownLeft size={28} className="text-emerald-500"/> : <ShoppingBag size={28}/>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-xl leading-none mb-2">{tx.item}</p>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{tx.date} • {tx.location}</p>
                        </div>
                      </div>
                      <p className={`font-black text-3xl tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-black text-slate-800 px-6 flex items-center gap-4"><ShieldCheck size={28} className="text-emerald-600" /> Seguridad y Salud</h3>
                <div className="space-y-6">
                  {student.allergies.length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 p-12 rounded-[56px] flex items-center gap-10 shadow-xl shadow-rose-100/50">
                       <div className="bg-rose-500 p-6 rounded-[32px] text-white shadow-2xl animate-pulse"><HeartPulse size={40}/></div>
                       <div>
                          <p className="text-rose-600 font-black text-[11px] uppercase tracking-[4px] mb-2">ALERTA MÉDICA</p>
                          <p className="text-rose-950 font-black text-2xl tracking-tight leading-tight">Prohibido: {student.allergies.join(', ')}</p>
                       </div>
                    </div>
                  )}
                  {student.restrictedCategories.length > 0 && (
                    <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm">
                       <div className="flex items-center gap-4 mb-8">
                          <Ban size={24} className="text-rose-400" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Categorías Restringidas por Padres</p>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          {student.restrictedCategories.map(cat => (
                            <span key={cat} className="flex items-center gap-3 bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                               <Lock size={14}/> {cat}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}
                  <div className="bg-indigo-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-10"><ShieldCheck size={120}/></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400 mb-6">MECARD PROTECTION</h4>
                      <p className="text-indigo-100 text-lg font-medium leading-relaxed">Tu cuenta está protegida con encriptación bancaria y controles de seguridad institucional.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case AppView.STUDENT_ID:
        return (
          <div className="flex flex-col items-center justify-center h-full p-12 animate-in zoom-in duration-700">
            <div className="w-full max-w-md">
               <div className="bg-white p-16 rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] text-center border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600 shadow-lg shadow-indigo-100"></div>
                  <h2 className="text-3xl font-black mb-12 text-slate-800 tracking-tighter uppercase tracking-[8px]">MECARD PAY</h2>
                  <div className="bg-slate-950 p-12 rounded-[56px] mb-12 shadow-2xl relative group">
                      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${student.id}`} alt="QR Pay" className="w-full h-auto invert mix-blend-screen scale-95" />
                  </div>
                  <p className="font-mono text-5xl tracking-[16px] font-black text-indigo-600 mb-8 leading-none">{student.id}</p>
                  <p className="text-slate-400 font-black uppercase text-[12px] tracking-[6px]">Válido para todas las unidades POS</p>
                  <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className="mt-16 text-slate-300 font-black text-[11px] uppercase tracking-[4px] hover:text-indigo-600 transition-colors">Finalizar Cobro</button>
               </div>
            </div>
          </div>
        );

      case AppView.STUDENT_HISTORY:
        return (
          <div className="animate-in slide-in-from-right-10 duration-700">
             <header className="mb-12">
                <p className="text-indigo-500 font-black uppercase text-[11px] tracking-[6px] mb-4">Consumo Inteligente</p>
                <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">Mi Historial</h1>
             </header>
             <div className="bg-white rounded-[64px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden divide-y divide-slate-50">
                {transactions.length === 0 ? (
                  <div className="p-40 text-center text-slate-200 font-black uppercase italic tracking-[10px]">Sin movimientos</div>
                ) : (
                  transactions.map((tx) => (
                     <div key={tx.id} className="flex items-center justify-between p-12 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-10">
                           <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-sm ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                              {tx.type === 'deposit' ? <ArrowUpRight size={36} /> : <ShoppingBag size={36} />}
                           </div>
                           <div>
                              <p className="font-black text-slate-800 text-2xl tracking-tight leading-none mb-3">{tx.item}</p>
                              <div className="flex gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-2"><Clock size={16}/> {tx.date}</span>
                                 <span className="flex items-center gap-2"><Landmark size={16}/> {tx.location}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-4xl font-black tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                             {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                           </p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">TRANS-ID: {tx.id}</p>
                        </div>
                     </div>
                  ))
                )}
             </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-200 text-center py-40">
            <Info size={100} strokeWidth={1} className="mb-10 opacity-20" />
            <p className="font-black uppercase tracking-[10px]">Módulo en Expansión</p>
          </div>
        );
    }
  };

  return (
    <div className="p-12 lg:p-20 max-w-7xl mx-auto h-full overflow-y-auto pb-40">
      {renderContent()}
    </div>
  );
};
