
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Wallet, Ban, Save, DollarSign, UserCircle, AlertTriangle, 
  Utensils, History, ArrowUpRight, ArrowDownLeft, HeartPulse, X, 
  Search, ShoppingBag, Plus, Trash2, Check, Filter, ChevronRight, 
  ChevronDown, Landmark, Copy, CheckCircle2, ShieldCheck, Zap, 
  ArrowLeftRight, Info, Building2, UserPlus,
  Fingerprint, Key, GraduationCap, Eye, EyeOff, Lock, Bell, Star,
  TrendingUp, Clock, MapPin, Users
} from 'lucide-react';
import { Category, StudentProfile, Transaction, Product, EntityOwner, School, TransactionType } from '../types';
import { PRODUCTS, MOCK_SCHOOLS, MOCK_STUDENTS_LIST } from '../constants';
import { Button } from './Button';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from './ui/Toast';

interface ParentPortalProps {
  students: StudentProfile[];
  activeStudentIndex: number;
  onSwitchStudent: (index: number) => void;
  onLinkStudent: (student: StudentProfile) => void;
  transactions: Transaction[];
  onUpdateStudent: (data: Partial<StudentProfile>) => void;
  onDeposit?: (amount: number, method: string) => void;
  forceOpenLinking?: boolean;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students, activeStudentIndex, onSwitchStudent, onLinkStudent,
  transactions, onUpdateStudent, onDeposit, forceOpenLinking = false
}) => {
  const navigate = useNavigate();
  const student = students[activeStudentIndex];
  const hasStudents = students.length > 0;

  const toast = useToast();
  const [dailyLimit, setDailyLimit] = useState<number | string>(student?.dailyLimit ?? '');
  const [restrictions, setRestrictions] = useState<Category[]>(
    student?.restrictions?.restrictedCategories || []
  );
  const [restrictedProducts, setRestrictedProducts] = useState<string[]>(
    student?.restrictions?.restrictedProducts || []
  );
  const [allergies, setAllergies] = useState<string[]>(
    student?.restrictions?.allergens || []
  );
  
  const [depositStep, setDepositStep] = useState<'amount' | 'method' | 'summary' | 'processing' | 'success' | 'spei_instructions'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | null>(null);

  useEffect(() => {
    if (!student) return;
    setDailyLimit(student.dailyLimit);
    setRestrictions(student.restrictions?.restrictedCategories || []);
    setRestrictedProducts(student.restrictions?.restrictedProducts || []);
    setAllergies(student.restrictions?.allergens || []);
  }, [student]);



  const [productSearch, setProductSearch] = useState('');
  const foodCategories = [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];

  const [isLinking, setIsLinking] = useState(false);
    useEffect(() => {
      if (!hasStudents || forceOpenLinking) {
        setIsLinking(true);
      }
    }, [forceOpenLinking, hasStudents]);

  const [linkStep, setLinkStep] = useState<'form' | 'confirm'>('form');
  const [linkForm, setLinkForm] = useState({ fullName: '', schoolKey: '' });
  const [foundStudent, setFoundStudent] = useState<StudentProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const activeSchool = useMemo(() => {
    if (!student) return MOCK_SCHOOLS[0];
    return MOCK_SCHOOLS.find(s => s.id === student.schoolId) || MOCK_SCHOOLS[0];
  }, [student]);

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
    if (!student) return;
    const finalLimit = dailyLimit === '' ? student.dailyLimit : Number(dailyLimit);
    onUpdateStudent({
      dailyLimit: finalLimit,
      restrictions: {
        ...student.restrictions,
        restrictedCategories: restrictions,
        restrictedProducts,
        allergens: allergies,
      },
    });
    toast.success('Guardado', '¡Configuración guardada exitosamente!');
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

  const linkingModal = isLinking && (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-6">
          <div role="dialog" aria-modal="true" aria-label="Vincular estudiante" className="bg-white rounded-t-3xl sm:rounded-3xl md:rounded-[64px] shadow-2xl w-full max-w-xl p-6 md:p-16 relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsLinking(false)} className="absolute top-4 right-4 md:top-12 md:right-12 text-slate-300 hover:text-slate-800 transition-all" aria-label="Cerrar vinculación"><X size={24}/></button>
              {linkStep === 'form' ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="text-center mb-6 md:mb-12">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-50 rounded-2xl md:rounded-[40px] flex items-center justify-center text-indigo-600 mx-auto mb-4 md:mb-8"><UserPlus size={32}/></div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">Vincular Estudiante</h3>
                        <p className="text-slate-400 font-medium mt-2 md:mt-3 text-sm">Ingresa los datos escolares para localizar el registro.</p>
                      </div>
                      <div className="space-y-5 md:space-y-10 my-6 md:my-12">
                          <div className="space-y-2 md:space-y-3">
                            <label htmlFor="link-fullname" className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Nombre Completo</label>
                            <input id="link-fullname" type="text" value={linkForm.fullName} onChange={e => setLinkForm({...linkForm, fullName: e.target.value})} placeholder="Ej. Ana García" className="w-full p-4 md:p-8 bg-slate-50 border-none rounded-2xl md:rounded-[32px] font-black text-base md:text-xl text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"/>
                          </div>
                          <div className="space-y-2 md:space-y-3">
                            <label htmlFor="link-schoolkey" className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Clave Colegio</label>
                            <input id="link-schoolkey" type="text" value={linkForm.schoolKey} onChange={e => setLinkForm({...linkForm, schoolKey: e.target.value.toUpperCase()})} placeholder="CUMBRES24" className="w-full p-4 md:p-8 bg-slate-50 border-none rounded-2xl md:rounded-[32px] font-black text-base md:text-xl text-indigo-600 tracking-[4px] md:tracking-[8px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner text-center"/>
                          </div>
                      </div>
                      <Button disabled={!linkForm.fullName || !linkForm.schoolKey || isSearching} onClick={handleSearchStudent} className="w-full py-4 md:py-8 rounded-2xl md:rounded-[40px] bg-indigo-600 font-black uppercase tracking-widest md:tracking-[5px] text-xs shadow-2xl">
                        {isSearching ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Localizar en la Red'}
                      </Button>
                  </div>
              ) : (
                  <div className="animate-in zoom-in duration-500 text-center">
                      <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter mb-6 md:mb-12 italic uppercase">¡Encontrado!</h3>
                      <div className="bg-slate-50 p-6 md:p-12 rounded-2xl md:rounded-[56px] mb-6 md:mb-12 flex flex-col items-center border border-slate-100">
                          <img src={foundStudent?.photo} alt={`Foto de ${foundStudent?.fullName}`} className="w-24 h-24 md:w-40 md:h-40 rounded-2xl md:rounded-[48px] object-cover mb-4 md:mb-8 border-4 md:border-8 border-white shadow-2xl" />
                          <h4 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">{foundStudent?.fullName}</h4>
                          <p className="text-xs md:text-sm font-bold text-indigo-600 uppercase tracking-widest mt-2">{foundStudent?.grade}</p>
                      </div>
                      <div className="flex gap-3 md:gap-4">
                        <button onClick={() => setLinkStep('form')} className="flex-1 py-4 md:py-7 rounded-2xl md:rounded-[32px] bg-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest">Es otro</button>
                        <Button onClick={finalizeLinking} className="flex-[2] py-4 md:py-7 rounded-2xl md:rounded-[40px] bg-emerald-600 text-white font-black uppercase tracking-widest md:tracking-[4px] shadow-2xl shadow-emerald-100">Confirmar</Button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  if (!hasStudents) {
    return (
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto h-full overflow-y-auto pb-40 font-sans">
        <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">Mi Familia</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] md:text-[11px] tracking-[3px] md:tracking-[4px] mt-1 md:mt-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Control Parental MeCard Network
            </p>
          </div>
        </header>

        <div className="bg-white rounded-3xl md:rounded-[56px] p-8 md:p-12 border border-slate-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
            <UserPlus size={36} />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Aun no tienes estudiantes vinculados</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Vincula tu primer estudiante para activar monedero, limites y reportes familiares.
          </p>
          <button
            onClick={() => setIsLinking(true)}
            className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 inline-flex items-center gap-3"
          >
            <UserPlus size={16} /> Vincular Estudiante
          </button>
        </div>
        {linkingModal}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No hay estudiante seleccionado</p>
          <button
            onClick={() => onSwitchStudent(0)}
            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest"
          >
            Restablecer Seleccion
          </button>
        </div>
      </div>
    );
  }

  return (
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto h-full overflow-y-auto pb-40 font-sans">
            <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">Mi Familia</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] md:text-[11px] tracking-[3px] md:tracking-[4px] mt-1 md:mt-2 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> Control Parental MeCard Network
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg">👩</span>
                      <span className="text-xs font-bold text-slate-700">María González</span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase">Madre</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                  <button onClick={() => navigate('/parent/notifications')} className="p-3 md:p-4 bg-white border border-slate-100 rounded-2xl md:rounded-3xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm" aria-label="Notificaciones">
                    <Bell size={20}/>
                  </button>
                  <button onClick={() => setIsLinking(true)} className="bg-indigo-600 px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[24px] text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center gap-2 md:gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group flex-1 md:flex-none justify-center">
                    <UserPlus size={16} className="group-hover:scale-110 transition-transform"/> Vincular Hijo
                  </button>
                </div>
            </header>

            {/* Students Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
                {students.map((s, idx) => {
                    const isActive = activeStudentIndex === idx;
                    return (
                        <div key={s.id} onClick={() => onSwitchStudent(idx)} className={`bento-card group p-4 md:p-6 rounded-2xl md:rounded-[40px] border-2 cursor-pointer transition-all ${isActive ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-white/40 border-transparent hover:border-slate-200'}`}>
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="relative">
                                  <img src={s.photo} alt={`Foto de ${s.fullName.split(' ')[0]}`} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[22px] object-cover border-2 border-white shadow-lg" />
                                  {isActive && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-indigo-600 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-800 text-base md:text-lg truncate leading-none mb-1">{s.fullName.split(' ')[0]}</p>
                                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.grade}</p>
                                </div>
                                <ChevronRight size={18} className={`transition-transform ${isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
                            </div>
                        </div>
                    );
                })}
                <div onClick={() => setIsLinking(true)} className="bento-card p-4 md:p-6 rounded-2xl md:rounded-[40px] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 cursor-pointer group transition-all">
                    <Plus size={28} className="group-hover:rotate-90 transition-transform" />
                </div>
            </div>

            {/* Main Student Hub Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-12">
               <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[56px] p-5 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden bento-card">
                  <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 pointer-events-none"><UserCircle size={200}/></div>
                  <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-10">
                      <div className="shrink-0 flex flex-row sm:flex-col items-center gap-4 sm:gap-0">
                          <img src={student.photo} alt={`Foto de ${student.fullName}`} className="w-20 h-20 md:w-40 md:h-40 rounded-2xl md:rounded-[48px] object-cover border-4 md:border-8 border-slate-50 shadow-2xl" />
                          <div className="sm:mt-4 md:mt-6 flex gap-2 flex-wrap">
                             <span className="bg-emerald-50 text-emerald-600 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest">Activo</span>
                             <span className="bg-indigo-50 text-indigo-600 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest">{activeSchool.logo} {activeSchool.id}</span>
                          </div>
                      </div>
                      <div className="flex-1 space-y-4 md:space-y-8">
                          <div>
                            <h2 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none mb-2 md:mb-4">{student.fullName}</h2>
                            <p className="text-sm md:text-xl font-bold text-indigo-600/60 uppercase tracking-[2px] md:tracking-[4px]">{student.grade}</p>
                          </div>
                          <div className="flex items-end gap-4 md:gap-12">
                             <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Saldo Monedero</p>
                                <p className={`text-3xl md:text-6xl font-black tracking-tighter ${student.balance < 50 ? 'text-rose-500' : 'text-emerald-600'}`}>${student.balance.toFixed(2)}</p>
                             </div>
                             <div className="flex flex-col justify-end">
                                <button onClick={() => navigate('/parent/wallet')} className="bg-indigo-600 p-3 md:p-5 rounded-2xl md:rounded-3xl text-white shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all">
                                  <Wallet size={22}/>
                                </button>
                             </div>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Activity Bento */}
               <div className="bg-slate-900 rounded-3xl md:rounded-[56px] p-5 md:p-10 text-white relative overflow-hidden bento-card flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10"><TrendingUp size={100}/></div>
                  <div className="relative z-10">
                      <h3 className="text-lg md:text-xl font-black italic tracking-tight mb-4 md:mb-8">Consumo de Hoy</h3>
                      <div className="space-y-4 md:space-y-6">
                         <div className="flex justify-between items-end">
                            <p className="text-2xl md:text-4xl font-black tracking-tighter leading-none">${student.spentToday} <span className="text-white/20 text-base md:text-xl font-bold">/ ${student.dailyLimit}</span></p>
                            <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Saldo Seguro</p>
                         </div>
                         <div className="w-full h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 shadow-glow rounded-full" style={{ width: `${(student.spentToday / student.dailyLimit) * 100}%` }}></div>
                         </div>
                      </div>
                  </div>
                  <div className="relative z-10 pt-6 md:pt-10 mt-4 md:mt-0 border-t border-white/5">
                      <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 md:mb-4 leading-relaxed italic">"Tu hijo ha consumido principalmente Combos Saludables esta semana."</p>
                      <button onClick={() => navigate('/parent/limits')} className="w-full py-3 md:py-5 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 md:gap-3">
                        <Lock size={14}/> Gestionar Límites
                      </button>
                  </div>
               </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
                <ActionCard onClick={() => navigate('/parent/wallet')} icon={<Zap size={24}/>} title="Recargar Ya" desc="Abono instantáneo" color="bg-amber-50 text-amber-600" />
                <ActionCard onClick={() => navigate('/parent/limits')} icon={<HeartPulse size={24}/>} title="Alergias y Límites" desc="Bloqueos y control" color="bg-rose-50 text-rose-600" />
                <ActionCard onClick={() => navigate('/parent/reports')} icon={<Utensils size={24}/>} title="Reportes" desc="Consumo semanal" color="bg-indigo-50 text-indigo-600" />
                <ActionCard onClick={() => navigate('/parent/trips')} icon={<MapPin size={24}/>} title="Viajes" desc="Excursiones y pagos" color="bg-teal-50 text-teal-600" />
            </div>

            {/* Co-parent Activity Log */}
            <div className="bg-white rounded-2xl md:rounded-[40px] border border-slate-100 p-4 md:p-8 mb-6 md:mb-12 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm md:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-indigo-500" /> Actividad Familiar
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Co-padre: Roberto González</span>
              </div>
              <div className="space-y-2">
                {[
                  { icon: '💰', action: 'Depositó $500.00 a Santiago', by: 'María G.', time: 'Hace 2h', device: 'iPhone' },
                  { icon: '🔒', action: 'Cambió límite diario a $200', by: 'Roberto G.', time: 'Hace 5h', device: 'Android' },
                  { icon: '📋', action: 'Envió permiso de salida', by: 'María G.', time: 'Ayer', device: 'Web' },
                  { icon: '🎓', action: 'Inscribió a Santiago en Campamento', by: 'Roberto G.', time: 'Hace 2 días', device: 'Android' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 md:p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="text-lg">{log.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-slate-700 truncate">{log.action}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400">{log.by} • {log.time} • {log.device}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:space-y-8">
               <div className="flex justify-between items-center px-1 md:px-4">
                  <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 md:gap-4"><History className="text-indigo-600" size={24}/> Actividad Reciente</h3>
                  <button onClick={() => navigate('/parent/reports')} className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Historial</button>
               </div>
               <div className="bg-white rounded-2xl md:rounded-[56px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                  {transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 md:p-10 hover:bg-slate-50 transition-all group cursor-default">
                        <div className="flex items-center gap-3 md:gap-8 flex-1 min-w-0">
                            <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[28px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border shrink-0 ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {tx.type === TransactionType.DEPOSIT ? <ArrowUpRight size={20}/> : <ShoppingBag size={20}/>}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-800 text-sm md:text-xl leading-none mb-1 md:mb-2 truncate">{tx.item}</p>
                                <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 md:gap-3">
                                  <Clock size={10}/> {tx.date} • {tx.location}
                                </p>
                            </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                            <p className={`text-xl md:text-4xl font-black tracking-tighter ${tx.type === TransactionType.DEPOSIT ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {tx.type === TransactionType.DEPOSIT ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                           </p>
                           <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase mt-1 md:mt-2 tracking-widest hidden sm:block">Transacción Exitosa</p>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {linkingModal}
        </div>
    );
};

interface ActionCardProps { onClick: () => void; icon: React.ReactNode; title: string; desc: string; color: string; }
const ActionCard = ({ onClick, icon, title, desc, color }: ActionCardProps) => (
  <button onClick={onClick} className="bento-card p-4 md:p-8 bg-white rounded-2xl md:rounded-[48px] border border-slate-100 shadow-sm flex flex-col text-left group">
      <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center mb-3 md:mb-8 transition-all group-hover:scale-110 shadow-sm ${color}`}>
          {icon}
      </div>
      <h4 className="font-black text-slate-800 text-sm md:text-lg leading-tight mb-1 md:mb-2">{title}</h4>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
  </button>
);

interface NavCardProps { onClick: () => void; icon: React.ReactNode; title: string; color: string; }
const NavCard = ({ onClick, icon, title, color }: NavCardProps) => (
    <button onClick={onClick} className="bento-card bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 ${color === 'rose' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : color === 'orange' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
            {icon}
        </div>
        <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Configurar</p>
    </button>
);
export default ParentPortal;
