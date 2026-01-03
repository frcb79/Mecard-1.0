
import React, { useMemo } from 'react';
import { 
  CreditCard, QrCode, Utensils, History, ArrowRight, Zap, 
  ShieldCheck, HeartPulse, Star, TrendingUp, ShoppingBag, 
  ArrowDownLeft, Clock, Info, Bot, Sparkles, ArrowUpRight, Landmark,
  Lock, Ban, Coffee, Pizza, LayoutGrid
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

  // Obtener los objetos de producto completos para los bloqueos específicos
  const blockedProductsList = useMemo(() => {
    return PRODUCTS.filter(p => student.restrictedProducts?.includes(p.id));
  }, [student.restrictedProducts]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case Category.HOT_MEALS: return <Utensils size={18}/>;
        case Category.COMBO_MEALS: return <Pizza size={18}/>;
        case Category.DRINKS: return <Coffee size={18}/>;
        case Category.SNACKS: return <HeartPulse size={18}/>;
        default: return <LayoutGrid size={18}/>;
    }
  };

  if (view === AppView.STUDENT_DASHBOARD) {
    return (
      <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-40">
        <header className="mb-10 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter">¡Hola, {firstName}! 👋</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[3px] mt-1">Mi Perfil Escolar • MeCard Student</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado: Activo</p>
            </div>
          </div>
        </header>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* DIGITAL CARD MINI */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group animate-in slide-in-from-bottom-6 duration-500">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                   <Zap size={28} className="text-yellow-300 fill-yellow-300" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[4px] opacity-40 mb-1">MECARD NETWORK</p>
                  <p className="font-mono text-xs opacity-60">ID: {student.id}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[2px] opacity-50 mb-2">Mi Saldo Disponible</p>
                  <p className="text-7xl font-black tracking-tighter">${student.balance.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => onNavigate(AppView.STUDENT_ID)}
                  className="bg-white text-slate-900 p-5 rounded-3xl hover:scale-110 transition-all shadow-xl"
                >
                  <QrCode size={32} />
                </button>
              </div>
            </div>
          </div>

          {/* DAILY LIMIT PROGRESS */}
          <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm flex flex-col justify-between animate-in slide-in-from-bottom-6 duration-500 delay-100">
            <div>
              <div className="flex items-center gap-3 mb-6 text-indigo-600">
                <TrendingUp size={24} />
                <h3 className="text-[11px] font-black uppercase tracking-widest">Límite Diario</h3>
              </div>
              <div className="flex justify-between items-end mb-4">
                <p className="text-4xl font-black text-slate-800 tracking-tighter">${student.spentToday.toFixed(0)} <span className="text-slate-300 text-xl">/ ${student.dailyLimit}</span></p>
              </div>
              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ${spentPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${spentPercentage}%` }}
                ></div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Has usado el {spentPercentage.toFixed(0)}% hoy</p>
            </div>
            <button 
               onClick={() => onNavigate(AppView.STUDENT_MENU)}
               className="mt-8 flex items-center justify-between w-full p-6 bg-slate-50 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
               Ir a la Cafetería <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* RECENT ACTIVITY */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <History className="text-indigo-600" /> Mis Compras
              </h3>
              <button onClick={() => onNavigate(AppView.STUDENT_HISTORY)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Ver todo</button>
            </div>
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              {transactions.slice(0, 3).map((tx, idx) => (
                <div key={tx.id} className={`flex items-center justify-between p-7 hover:bg-slate-50 transition-all ${idx !== 2 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                      {tx.type === 'deposit' ? <ArrowDownLeft size={20} className="text-emerald-500"/> : <ShoppingBag size={20}/>}
                    </div>
                    <div>
                      <p className="font-black text-slate-700 text-sm leading-none mb-1">{tx.item}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-black text-lg tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROLES DE CONSUMO (BLOQUEOS CONFIGURADOS POR PADRES) */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight px-4 flex items-center gap-3">
              <Lock className="text-rose-500" /> Controles de Consumo
            </h3>
            <div className="space-y-4">
              {/* Categorías Bloqueadas */}
              {student.restrictedCategories.length > 0 && (
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categorías Restringidas</p>
                   <div className="flex flex-wrap gap-3">
                      {student.restrictedCategories.map(cat => (
                        <div key={cat} className="flex items-center gap-3 bg-rose-50 text-rose-600 px-5 py-3 rounded-2xl border border-rose-100">
                           {getCategoryIcon(cat)}
                           <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                           <Ban size={14} className="ml-1 opacity-60" />
                        </div>
                      ))}
                   </div>
                   <p className="text-[9px] font-bold text-rose-300 mt-4 uppercase tracking-widest">* No puedes comprar artículos de estas secciones</p>
                </div>
              )}

              {/* Productos Bloqueados */}
              {blockedProductsList.length > 0 && (
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4 delay-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Artículos Específicos Bloqueados</p>
                   <div className="space-y-3">
                      {blockedProductsList.map(prod => (
                        <div key={prod.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                <img src={prod.image} className="w-12 h-12 rounded-xl object-cover grayscale opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Ban className="text-rose-500/40" size={24} />
                                </div>
                              </div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm leading-none">{prod.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Bloqueo Individual</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 text-rose-500">
                               <span className="text-[10px] font-black uppercase tracking-widest">PROHIBIDO</span>
                               <Lock size={16} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Alertas Médicas */}
              {student.allergies.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] flex items-center gap-6 animate-pulse">
                   <div className="bg-rose-500 p-4 rounded-2xl text-white shadow-lg"><HeartPulse size={24}/></div>
                   <div>
                      <p className="text-rose-600 font-black text-[10px] uppercase tracking-widest mb-1">Cuidado con las Alergias</p>
                      <p className="text-rose-900 font-black text-lg leading-tight">{student.allergies.join(', ')}</p>
                   </div>
                </div>
              )}

              {student.restrictedCategories.length === 0 && blockedProductsList.length === 0 && student.allergies.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] flex items-center gap-6">
                   <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg"><ShieldCheck size={24}/></div>
                   <div>
                      <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-1">Perfil de Consumo Libre</p>
                      <p className="text-emerald-900 font-black text-lg leading-tight">No tienes restricciones configuradas.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === AppView.STUDENT_ID) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in zoom-in duration-500">
        <div className="w-full max-w-sm">
           <div className="bg-white p-12 rounded-[56px] shadow-2xl text-center border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h2 className="text-2xl font-black mb-10 text-slate-800 tracking-tighter uppercase tracking-[4px]">PAGO MECARD</h2>
              
              <div className="bg-slate-900 p-10 rounded-[48px] mb-10 shadow-2xl shadow-indigo-100 transform hover:scale-105 transition-transform duration-500">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${student.id}`} 
                    alt="QR Pay" 
                    className="w-full h-auto invert mix-blend-screen" 
                  />
              </div>
              
              <p className="font-mono text-4xl tracking-[12px] font-black text-indigo-600 mb-6">{student.id}</p>
              <div className="flex flex-col items-center gap-2">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Presenta este código en caja</p>
                 <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full mt-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Código Encriptado Seguro</span>
                 </div>
              </div>
              
              <button 
                onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)}
                className="mt-12 text-slate-400 font-black text-[10px] uppercase tracking-[2px] hover:text-indigo-600 transition-colors"
              >
                Volver al Inicio
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (view === AppView.STUDENT_HISTORY) {
    return (
      <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto pb-24">
         <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className="mb-8 text-sm font-black text-slate-400 hover:text-indigo-600 flex items-center gap-2 group transition-all">
            <ArrowDownLeft className="group-hover:rotate-45 transition-transform" size={20}/> VOLVER AL DASHBOARD
        </button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-10">Historial de Consumo</h1>

        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
           {transactions.length === 0 ? (
             <div className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest">No hay transacciones aún</div>
           ) : (
             transactions.map((tx, idx) => (
                <div key={tx.id} className={`flex items-center justify-between p-10 hover:bg-slate-50 transition-colors ${idx !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                   <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                         {tx.type === 'deposit' ? <ArrowUpRight /> : <ShoppingBag />}
                      </div>
                      <div>
                         <p className="font-black text-slate-800 text-xl leading-tight mb-2">{tx.item}</p>
                         <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={12}/> {tx.date}</span>
                            <span className="flex items-center gap-1"><Landmark size={12}/> {tx.location}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-3xl font-black tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest mt-2 inline-block">Confirmado</span>
                   </div>
                </div>
             ))
           )}
        </div>
      </div>
    );
  }

  return <div className="p-10 text-center font-black opacity-20">VISTA EN CONSTRUCCIÓN</div>;
};
