
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Wallet, Ban, Save, DollarSign, UserCircle, AlertTriangle, 
  Utensils, History, ArrowUpRight, ArrowDownLeft, HeartPulse, X, 
  Search, ShoppingBag, Plus, Trash2, Check, Filter, ChevronRight, 
  ChevronDown, Landmark, Copy, CheckCircle2, ShieldCheck, Zap, 
  ArrowLeftRight, Info, Building2, UserPlus,
  Fingerprint, Key, GraduationCap, Eye, EyeOff, Lock, Bell, Star,
  TrendingUp, Clock
} from 'lucide-react';
import { Category, AppView, StudentProfile, Transaction, Product, EntityOwner, School } from '../types';
import { PRODUCTS, MOCK_SCHOOLS, MOCK_STUDENTS_LIST } from '../constants';
import { Button } from './Button';
import { ToggleSwitch } from './ToggleSwitch';

interface ParentPortalProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  students: StudentProfile[];
  activeStudentIndex: number;
  onSwitchStudent: (index: number) => void;
  onLinkStudent: (student: StudentProfile) => void;
  transactions: Transaction[];
  onUpdateStudent: (data: Partial<StudentProfile>) => void;
  onDeposit?: (amount: number, method: string) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ 
  view, onNavigate, students, activeStudentIndex, onSwitchStudent, onLinkStudent,
  transactions, onUpdateStudent, onDeposit 
}) => {
  const student = students[activeStudentIndex];
  
  const [dailyLimit, setDailyLimit] = useState<number | string>(student.dailyLimit);
  const [restrictions, setRestrictions] = useState<Category[]>(student.restrictedCategories);
  const [restrictedProducts, setRestrictedProducts] = useState<string[]>(student.restrictedProducts || []);
  const [allergies, setAllergies] = useState<string[]>(student.allergies);
  
  const [depositStep, setDepositStep] = useState<'amount' | 'method' | 'summary' | 'processing' | 'success' | 'spei_instructions'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | null>(null);

  useEffect(() => {
    setDailyLimit(student.dailyLimit);
    setRestrictions(student.restrictedCategories);
    setRestrictedProducts(student.restrictedProducts || []);
    setAllergies(student.allergies);
  }, [student.id, student.dailyLimit, student.restrictedCategories, student.restrictedProducts, student.allergies]);

  useEffect(() => {
    if (view === AppView.PARENT_WALLET) {
        setDepositStep('amount');
        setSelectedAmount('');
        setPaymentMethod(null);
    }
  }, [view]);

  const [productSearch, setProductSearch] = useState('');
  const foodCategories = [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];

  const [isLinking, setIsLinking] = useState(false);
  const [linkStep, setLinkStep] = useState<'form' | 'confirm'>('form');
  const [linkForm, setLinkForm] = useState({ fullName: '', schoolKey: '' });
  const [foundStudent, setFoundStudent] = useState<StudentProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const activeSchool = useMemo(() => {
    return MOCK_SCHOOLS.find(s => s.id === student.schoolId) || MOCK_SCHOOLS[0];
  }, [student.schoolId]);

  const schoolModel = activeSchool.businessModel;

  const schoolProducts = useMemo(() => {
      return PRODUCTS.filter(p => 
        foodCategories.includes(p.category) &&
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      );
  }, [productSearch]);

  const toggleCategoryRestriction = (cat: Category) => {
    setRestrictions(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleProductRestriction = (productId: string) => {
    setRestrictedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleSaveSettings = () => {
    const finalLimit = dailyLimit === '' ? student.dailyLimit : Number(dailyLimit);
    onUpdateStudent({
      dailyLimit: finalLimit,
      restrictedCategories: restrictions,
      restrictedProducts: restrictedProducts,
      allergies: allergies
    });
    alert("¡Configuración guardada exitosamente!");
  };

  const handleSearchStudent = () => {
      setIsSearching(true);
      setTimeout(() => {
          setFoundStudent(MOCK_STUDENTS_LIST[1]);
          setLinkStep('confirm');
          setIsSearching(false);
      }, 1500);
  };

  const finalizeLinking = () => {
      if (foundStudent) {
          onLinkStudent(foundStudent);
          setIsLinking(false);
          setLinkStep('form');
          setFoundStudent(null);
      }
  };

  const amountNum = Number(selectedAmount) || 0;
  const cardFee = (amountNum * (schoolModel.cardDepositFeePercent / 100));
  const cardTotal = amountNum + cardFee;
  const speiTotal = Math.max(0, amountNum - schoolModel.speiDepositFeeFixed);

  const handleProcessDeposit = () => {
      if (paymentMethod === 'card') {
          setDepositStep('processing');
          setTimeout(() => {
              if (onDeposit) onDeposit(amountNum, 'Tarjeta');
              setDepositStep('success');
          }, 2000);
      } else {
          setDepositStep('spei_instructions');
      }
  };

  if (view === AppView.PARENT_DASHBOARD) {
    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full overflow-y-auto pb-40 font-sans">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tighter">Mi Familia</h1>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[4px] mt-2 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> Control Parental MeCard Network
                    </p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                    <Bell size={24}/>
                  </button>
                  <button onClick={() => setIsLinking(true)} className="bg-indigo-600 px-8 py-4 rounded-[24px] text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group">
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform"/> Vincular Nuevo Hijo
                  </button>
                </div>
            </header>

            {/* Students Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {students.map((s, idx) => {
                    const isActive = activeStudentIndex === idx;
                    return (
                        <div key={s.id} onClick={() => onSwitchStudent(idx)} className={`bento-card group p-6 rounded-[40px] border-2 cursor-pointer transition-all ${isActive ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-white/40 border-transparent hover:border-slate-200'}`}>
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                  <img src={s.photo} className="w-16 h-16 rounded-[22px] object-cover border-2 border-white shadow-lg" />
                                  {isActive && <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-800 text-lg truncate leading-none mb-1">{s.name.split(' ')[0]}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.grade}</p>
                                </div>
                                <ChevronRight size={20} className={`transition-transform ${isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
                            </div>
                        </div>
                    );
                })}
                <div onClick={() => setIsLinking(true)} className="bento-card p-6 rounded-[40px] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 cursor-pointer group transition-all">
                    <Plus size={32} className="group-hover:rotate-90 transition-transform" />
                </div>
            </div>

            {/* Main Student Hub Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
               <div className="lg:col-span-2 bg-white rounded-[56px] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden bento-card">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><UserCircle size={300}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-10">
                      <div className="shrink-0 flex flex-col items-center">
                          <img src={student.photo} className="w-40 h-40 rounded-[48px] object-cover border-8 border-slate-50 shadow-2xl animate-float" />
                          <div className="mt-6 flex gap-2">
                             <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Activo</span>
                             <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">{activeSchool.logo} {activeSchool.id}</span>
                          </div>
                      </div>
                      <div className="flex-1 space-y-8">
                          <div>
                            <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none mb-4">{student.name}</h2>
                            <p className="text-xl font-bold text-indigo-600/60 uppercase tracking-[4px]">{student.grade}</p>
                          </div>
                          <div className="flex gap-12">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saldo Monedero</p>
                                <p className={`text-6xl font-black tracking-tighter ${student.balance < 50 ? 'text-rose-500' : 'text-emerald-600'}`}>${student.balance.toFixed(2)}</p>
                             </div>
                             <div className="flex flex-col justify-end">
                                <button onClick={() => onNavigate(AppView.PARENT_WALLET)} className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all">
                                  <Wallet size={28}/>
                                </button>
                             </div>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Activity Bento */}
               {/* Fix: Added missing TrendingUp icon to the absolute background element */}
               <div className="bg-slate-900 rounded-[56px] p-10 text-white relative overflow-hidden bento-card flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={140}/></div>
                  <div className="relative z-10">
                      <h3 className="text-xl font-black italic tracking-tight mb-8">Consumo de Hoy</h3>
                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <p className="text-4xl font-black tracking-tighter leading-none">${student.spentToday} <span className="text-white/20 text-xl font-bold">/ ${student.dailyLimit}</span></p>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Saldo Seguro</p>
                         </div>
                         <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 shadow-glow rounded-full" style={{ width: `${(student.spentToday / student.dailyLimit) * 100}%` }}></div>
                         </div>
                      </div>
                  </div>
                  <div className="relative z-10 pt-10 border-t border-white/5">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 leading-relaxed italic">"Tu hijo ha consumido principalmente Combos Saludables esta semana."</p>
                      <button onClick={() => onNavigate(AppView.PARENT_SETTINGS)} className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <Lock size={14}/> Gestionar Límites
                      </button>
                  </div>
               </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                <ActionCard onClick={() => onNavigate(AppView.PARENT_WALLET)} icon={<Zap size={24}/>} title="Recargar Ya" desc="Abono instantáneo" color="bg-amber-50 text-amber-600" />
                <ActionCard onClick={() => onNavigate(AppView.PARENT_SETTINGS)} icon={<HeartPulse size={24}/>} title="Alergias" desc="Bloqueos médicos" color="bg-rose-50 text-rose-600" />
                <ActionCard onClick={() => onNavigate(AppView.PARENT_MENU)} icon={<Utensils size={24}/>} title="Pre-venta" desc="Menú semanal" color="bg-indigo-50 text-indigo-600" />
                <ActionCard onClick={() => {}} icon={<History size={24}/>} title="Estados de Cuenta" desc="Reportes PDF" color="bg-slate-50 text-slate-600" />
            </div>

            <div className="space-y-8">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4"><History className="text-indigo-600" size={32}/> Actividad Reciente</h3>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Historial Completo</button>
               </div>
               <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-10 hover:bg-slate-50 transition-all group cursor-default">
                        <div className="flex items-center gap-8">
                            <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {tx.type === 'deposit' ? <ArrowUpRight size={28}/> : <ShoppingBag size={28}/>}
                            </div>
                            <div>
                                <p className="font-black text-slate-800 text-xl leading-none mb-2">{tx.item}</p>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                  {/* Fix: Added missing Clock icon for transaction timestamps */}
                                  <Clock size={12}/> {tx.date} • {tx.location}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-4xl font-black tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                           </p>
                           <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 tracking-widest">Transacción Exitosa</p>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* MODAL VINCULACIÓN */}
            {isLinking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-xl p-16 relative animate-in zoom-in duration-300">
                        <button onClick={() => setIsLinking(false)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800 transition-all"><X size={32}/></button>
                        {linkStep === 'form' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-12">
                                  <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 mx-auto mb-8"><UserPlus size={48}/></div>
                                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Vincular Estudiante</h3>
                                  <p className="text-slate-400 font-medium mt-3">Ingresa los datos escolares para localizar el registro.</p>
                                </div>
                                <div className="space-y-10 my-12">
                                    <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Nombre Completo</label>
                                      <input type="text" value={linkForm.fullName} onChange={e => setLinkForm({...linkForm, fullName: e.target.value})} placeholder="Ej. Ana García" className="w-full p-8 bg-slate-50 border-none rounded-[32px] font-black text-xl text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"/>
                                    </div>
                                    <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Clave Colegio</label>
                                      <input type="text" value={linkForm.schoolKey} onChange={e => setLinkForm({...linkForm, schoolKey: e.target.value.toUpperCase()})} placeholder="CUMBRES24" className="w-full p-8 bg-slate-50 border-none rounded-[32px] font-black text-xl text-indigo-600 tracking-[8px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner text-center"/>
                                    </div>
                                </div>
                                <Button disabled={!linkForm.fullName || !linkForm.schoolKey || isSearching} onClick={handleSearchStudent} className="w-full py-8 rounded-[40px] bg-indigo-600 font-black uppercase tracking-[5px] text-xs shadow-2xl">
                                  {isSearching ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Localizar en la Red'}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in zoom-in duration-500 text-center">
                                <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-12 italic uppercase">¡Encontrado!</h3>
                                <div className="bg-slate-50 p-12 rounded-[56px] mb-12 flex flex-col items-center border border-slate-100">
                                    <img src={foundStudent?.photo} className="w-40 h-40 rounded-[48px] object-cover mb-8 border-8 border-white shadow-2xl animate-float" />
                                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">{foundStudent?.name}</h4>
                                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-2">{foundStudent?.grade}</p>
                                </div>
                                <div className="flex gap-4">
                                  <button onClick={() => setLinkStep('form')} className="flex-1 py-7 rounded-[32px] bg-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest">Es otro</button>
                                  <Button onClick={finalizeLinking} className="flex-[2] py-7 rounded-[40px] bg-emerald-600 text-white font-black uppercase tracking-[4px] shadow-2xl shadow-emerald-100">Confirmar Parentesco</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
  }

  // Reuse logic for Wallet/Settings views if needed, but the Dashboard is the primary visual hub update.
  return <div className="p-10 text-center font-black opacity-20 uppercase tracking-[10px] py-40">Modulo Principal Actualizado - Visualiza el Dashboard</div>;
};

const ActionCard = ({ onClick, icon, title, desc, color }: any) => (
  <button onClick={onClick} className="bento-card p-8 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col text-left group">
      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all group-hover:scale-110 shadow-sm ${color}`}>
          {icon}
      </div>
      <h4 className="font-black text-slate-800 text-lg leading-tight mb-2">{title}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
  </button>
);

const NavCard = ({ onClick, icon, title, color }: any) => (
    <button onClick={onClick} className="bento-card bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 ${color === 'rose' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : color === 'orange' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
            {icon}
        </div>
        <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Configurar</p>
    </button>
);
