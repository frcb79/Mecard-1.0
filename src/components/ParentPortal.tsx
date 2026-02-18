
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Wallet, Ban, Save, DollarSign, UserCircle, AlertTriangle, 
  Utensils, History, ArrowUpRight, ArrowDownLeft, HeartPulse, X, 
  Search, ShoppingBag, Plus, Trash2, Check, Filter, ChevronRight, 
  ChevronDown, Landmark, Copy, CheckCircle2, ShieldCheck, Zap, 
  ArrowLeftRight, Info, Building2, UserPlus,
  Fingerprint, Key, GraduationCap, Eye, EyeOff, Lock, Bell, Star,
  TrendingUp, Clock, Sliders, BarChart3, Settings
} from 'lucide-react';
import { Category, AppView, StudentProfile, Transaction, Product, EntityOwner, School } from '../types';
import { PRODUCTS, MOCK_SCHOOLS, MOCK_STUDENTS_LIST } from '../constants';
import { Button } from './Button';
import { ToggleSwitch } from './ToggleSwitch';
import '../styles/parentTheme.css';

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

  // Guard: If no student, return empty state
  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No hay estudiante seleccionado</p>
          <p className="text-gray-400 text-sm mt-2">Por favor, vincula un estudiante para continuar</p>
        </div>
      </div>
    );
  }

  const [dailyLimit, setDailyLimit] = useState<number | string>(student.dailyLimit);
  const [restrictions, setRestrictions] = useState<Category[]>(
    student.restrictions?.restrictedCategories || []
  );
  const [restrictedProducts, setRestrictedProducts] = useState<string[]>(
    student.restrictions?.restrictedProducts || []
  );
  const [allergies, setAllergies] = useState<string[]>(
    student.restrictions?.allergens || []
  );
  
  const [depositStep, setDepositStep] = useState<'amount' | 'method' | 'summary' | 'processing' | 'success' | 'spei_instructions'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | null>(null);

  useEffect(() => {
    setDailyLimit(student.dailyLimit);
    setRestrictions(student.restrictions?.restrictedCategories || []);
    setRestrictedProducts(student.restrictions?.restrictedProducts || []);
    setAllergies(student.restrictions?.allergens || []);
  }, [student.id, student.dailyLimit, student.restrictions]);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 pb-40">
            {/* HEADER - Mobile Optimized */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
              <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">Mi Familia</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] md:text-[11px] tracking-[3px] md:tracking-[4px] mt-2 flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-600" /> Control Parental MeCard
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                  <button className="p-3 md:p-4 bg-white border border-slate-100 rounded-2xl md:rounded-3xl text-slate-400 hover:text-emerald-600 active:bg-emerald-50 transition-all shadow-sm flex-1 md:flex-none">
                    <Bell size={20} md:size={24}/>
                  </button>
                  <button onClick={() => setIsLinking(true)} className="bg-gradient-to-r from-emerald-600 to-sky-600 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[24px] text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center gap-2 md:gap-3 hover:shadow-lg active:scale-95 transition-all shadow-lg shadow-emerald-200/50 flex-1 md:flex-none">
                    <UserPlus size={16} md:size={18}/> <span className="hidden sm:inline">Vincular</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STUDENTS SELECTOR - Carousel Style Mobile */}
            <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
              <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                  {students.map((s, idx) => {
                      const isActive = activeStudentIndex === idx;
                      return (
                          <div 
                            key={s.id} 
                            onClick={() => onSwitchStudent(idx)} 
                            className={`flex-shrink-0 w-56 md:w-auto parent-card group cursor-pointer ${isActive ? 'ring-2 ring-emerald-600 bg-gradient-to-br from-emerald-50 to-sky-50' : 'hover:shadow-lg'}`}
                          >
                              <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img src={s.photo} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                                    {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-600 border-2 border-white rounded-full"></div>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-800 text-sm md:text-lg truncate leading-none mb-1">{s.name.split(' ')[0]}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.grade}</p>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  <div 
                    onClick={() => setIsLinking(true)} 
                    className="flex-shrink-0 w-56 md:w-auto parent-card border-dashed border-2 border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-300 hover:text-emerald-400 cursor-pointer group transition-all"
                  >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN STUDENT HUB & ACTIVITY - Mobile Optimized Stack */}
            <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
              <div className="parent-grid--wide">
                 {/* Student Card */}
                 <div className="parent-card parent-card--featured relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 pointer-events-none"><UserCircle size={200}/></div>
                  <div className="relative z-10 flex flex-col sm:flex-row gap-6 md:gap-10">
                      <div className="shrink-0 flex flex-col items-center sm:items-start">
                          <img src={student.photo} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl md:rounded-[48px] object-cover border-4 md:border-8 border-white shadow-lg" />
                          <div className="mt-4 md:mt-6 flex gap-2 flex-wrap justify-center sm:justify-start">
                             <span className="bg-emerald-50 text-emerald-600 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest">Activo</span>
                             <span className="bg-sky-50 text-sky-600 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest">{activeSchool.logo}</span>
                          </div>
                      </div>
                      <div className="flex-1 space-y-6 md:space-y-8">
                          <div>
                            <h2 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none mb-2 md:mb-4">{student.name}</h2>
                            <p className="text-base md:text-xl font-bold text-emerald-600/60 uppercase tracking-[2px] md:tracking-[4px]">{student.grade}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-6 md:gap-12">
                             <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Saldo Monedero</p>
                                <p className={`text-4xl md:text-6xl font-black tracking-tighter ${student.balance < 50 ? 'text-rose-500' : 'text-emerald-600'}`}>${student.balance.toFixed(2)}</p>
                             </div>
                             <div className="flex flex-col justify-end gap-3 sm:gap-0">
                                <button onClick={() => onNavigate(AppView.PARENT_WALLET)} className="bg-gradient-to-r from-emerald-600 to-sky-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                  <Wallet size={20} md:size={28}/>
                                  <span className="text-xs md:text-sm font-black">Billetera</span>
                                </button>
                             </div>
                          </div>
                      </div>
                  </div>
                 </div>

                 {/* Activity Card */}
                 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-[56px] p-6 md:p-10 text-white relative overflow-hidden parent-card">
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10"><TrendingUp size={140}/></div>
                  <div className="relative z-10">
                      <h3 className="text-lg md:text-xl font-black italic tracking-tight mb-6 md:mb-8">Consumo de Hoy</h3>
                      <div className="space-y-4 md:space-y-6">
                         <div className="flex justify-between items-end flex-wrap gap-2">
                            <p className="text-2xl md:text-4xl font-black tracking-tighter leading-none">${student.spentToday} <span className="text-white/20 text-base md:text-xl font-bold">/ ${student.dailyLimit}</span></p>
                            <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Saldo Seguro</p>
                         </div>
                         <div className="w-full h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 shadow-glow rounded-full" style={{ width: `${(student.spentToday / student.dailyLimit) * 100}%` }}></div>
                         </div>
                      </div>
                  </div>
                  <div className="relative z-10 pt-6 md:pt-10 border-t border-white/5 mt-6 md:mt-8">
                      <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 md:mb-4 leading-relaxed italic">Análisis de gasto esta semana</p>
                      <button onClick={() => onNavigate(AppView.PARENT_SETTINGS)} className="w-full py-4 md:py-5 bg-white/5 border border-white/10 rounded-xl md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <Sliders size={14}/> Gestionar Límites
                      </button>
                  </div>
                 </div>
              </div>
            </div>

            {/* QUICK ACTIONS GRID - Mobile Responsive */}
            <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
                <div className="parent-grid">
                    <ActionCard onClick={() => onNavigate(AppView.PARENT_WALLET)} icon={<Zap size={20} />} title="Recargar Ya" desc="Abono instantáneo" color="bg-amber-50 text-amber-600" />
                    <ActionCard onClick={() => onNavigate(AppView.PARENT_SETTINGS)} icon={<HeartPulse size={20} />} title="Alergias" desc="Bloqueos médicos" color="bg-rose-50 text-rose-600" />
                    <ActionCard onClick={() => onNavigate(AppView.PARENT_LIMITS)} icon={<Sliders size={20} />} title="Límites" desc="Control parental" color="bg-emerald-50 text-emerald-600" />
                    <ActionCard onClick={() => onNavigate(AppView.PARENT_REPORTS)} icon={<BarChart3 size={20} />} title="Reportes" desc="Análisis de consumo" color="bg-sky-50 text-sky-600" />
                </div>
            </div>

            {/* ACTIVITY SECTION - Mobile Optimized */}
            <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-4 md:space-y-8">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-0 md:px-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 md:gap-4"><History className="text-emerald-600" size={24} md:size={32}/> Actividad Reciente</h3>
                  <button onClick={() => onNavigate(AppView.PARENT_REPORTS)} className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Ver Historial Completo →</button>
               </div>
               <div className="parent-card">
                  <div className="divide-y divide-slate-100">
                    {transactions.slice(0, 4).map((tx, idx) => (
                      <div key={tx.id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-all group cursor-default gap-4 sm:gap-0">
                          <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto flex-1">
                              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-[28px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border flex-shrink-0 ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                  {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : <ShoppingBag size={20} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                  <p className="font-black text-slate-800 text-base md:text-xl leading-none mb-1 md:mb-2 truncate">{tx.item}</p>
                                  <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                                    <Clock size={10}/> {tx.date} • {tx.location}
                                  </p>
                              </div>
                          </div>
                          <div className="text-right sm:text-right w-full sm:w-auto">
                             <p className={`text-2xl md:text-4xl font-black tracking-tighter whitespace-nowrap ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                  {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                             </p>
                             <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-widest">Exitosa</p>
                          </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* MODAL VINCULACIÓN */}
            {isLinking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl md:rounded-[64px] shadow-2xl w-full max-w-xl p-8 md:p-16 relative animate-in zoom-in duration-300">
                        <button onClick={() => setIsLinking(false)} className="absolute top-6 md:top-12 right-6 md:right-12 text-slate-300 hover:text-slate-800 transition-all"><X size={24} md:size={32}/></button>
                        {linkStep === 'form' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-8 md:mb-12">
                                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl md:rounded-[40px] flex items-center justify-center text-emerald-600 mx-auto mb-6 md:mb-8"><UserPlus size={40} md:size={48}/></div>
                                  <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">Vincular Estudiante</h3>
                                  <p className="text-slate-400 font-medium mt-2 md:mt-3 text-sm">Ingresa los datos escolares para localizar.</p>
                                </div>
                                <div className="space-y-6 md:space-y-10 my-8 md:my-12">
                                    <div className="space-y-2 md:space-y-3">
                                      <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Nombre Completo</label>
                                      <input type="text" value={linkForm.fullName} onChange={e => setLinkForm({...linkForm, fullName: e.target.value})} placeholder="Ej. Ana García" className="w-full p-4 md:p-8 bg-slate-50 border-none rounded-lg md:rounded-[32px] font-black text-base md:text-xl text-slate-700 outline-none focus:ring-4 focus:ring-emerald-100 transition-all shadow-inner"/>
                                    </div>
                                    <div className="space-y-2 md:space-y-3">
                                      <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Clave Colegio</label>
                                      <input type="text" value={linkForm.schoolKey} onChange={e => setLinkForm({...linkForm, schoolKey: e.target.value.toUpperCase()})} placeholder="CUMBRES24" className="w-full p-4 md:p-8 bg-slate-50 border-none rounded-lg md:rounded-[32px] font-black text-base md:text-xl text-emerald-600 tracking-[4px] md:tracking-[8px] outline-none focus:ring-4 focus:ring-emerald-100 transition-all shadow-inner text-center"/>
                                    </div>
                                </div>
                                <Button disabled={!linkForm.fullName || !linkForm.schoolKey || isSearching} onClick={handleSearchStudent} className="w-full py-4 md:py-8 rounded-xl md:rounded-[40px] bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black uppercase tracking-[4px] md:tracking-[5px] text-[10px] md:text-xs shadow-lg shadow-emerald-200/50">
                                  {isSearching ? <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></div> : 'Localizar en la Red'}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in zoom-in duration-500 text-center">
                                <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter mb-8 md:mb-12 italic uppercase">¡Encontrado!</h3>
                                <div className="bg-gradient-to-br from-emerald-50 to-sky-50 p-6 md:p-12 rounded-2xl md:rounded-[56px] mb-8 md:mb-12 flex flex-col items-center border border-emerald-100">
                                    <img src={foundStudent?.photo} className="w-32 h-32 md:w-40 md:h-40 rounded-xl md:rounded-[48px] object-cover mb-6 md:mb-8 border-4 md:border-8 border-white shadow-lg" />
                                    <h4 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">{foundStudent?.name}</h4>
                                    <p className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1 md:mt-2">{foundStudent?.grade}</p>
                                </div>
                                <div className="flex gap-3 md:gap-4">
                                  <button onClick={() => setLinkStep('form')} className="flex-1 py-4 md:py-7 rounded-lg md:rounded-[32px] bg-slate-100 text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-slate-200 transition-all">Es otro</button>
                                  <Button onClick={finalizeLinking} className="flex-[2] py-4 md:py-7 rounded-lg md:rounded-[40px] bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black uppercase tracking-[3px] md:tracking-[4px] shadow-lg shadow-emerald-200/50">Confirmar</Button>
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
  <button 
    onClick={onClick} 
    className={`parent-card group flex flex-col text-left transition-all hover:shadow-lg active:scale-95 ${color}`}
  >
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-[24px] flex items-center justify-center mb-4 md:mb-8 transition-all group-hover:scale-110 shadow-sm ${color}`}>
          {icon}
      </div>
      <h4 className="font-black text-slate-800 text-base md:text-lg leading-tight mb-1 md:mb-2">{title}</h4>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
  </button>
);

const NavCard = ({ onClick, icon, title, color }: any) => (
    <button 
      onClick={onClick} 
      className="parent-card group text-left hover:shadow-lg hover:-translate-y-1 transition-all"
    >
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 transition-all group-hover:scale-110 ${color === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' : color === 'sky' ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
            {icon}
        </div>
        <p className="font-black text-slate-800 text-sm md:text-base leading-tight">{title}</p>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Gestionar</p>
    </button>
);
export default ParentPortal;
