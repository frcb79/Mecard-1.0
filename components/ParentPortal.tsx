
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Wallet, Ban, Save, DollarSign, UserCircle, AlertTriangle, 
  Utensils, History, ArrowUpRight, ArrowDownLeft, HeartPulse, X, 
  Search, ShoppingBag, Plus, Trash2, Check, Filter, ChevronRight, 
  ChevronDown, Landmark, Copy, CheckCircle2, ShieldCheck, Zap, 
  ArrowLeftRight, Info, Building2, UserPlus,
  Fingerprint, Key, GraduationCap, Eye, EyeOff, Lock
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
  
  // Estados locales para el formulario de ajustes
  const [dailyLimit, setDailyLimit] = useState<number | string>(student.dailyLimit);
  const [restrictions, setRestrictions] = useState<Category[]>(student.restrictedCategories);
  const [restrictedProducts, setRestrictedProducts] = useState<string[]>(student.restrictedProducts || []);
  const [allergies, setAllergies] = useState<string[]>(student.allergies);
  
  // Estado para Recargas (Wallet)
  const [depositStep, setDepositStep] = useState<'amount' | 'method' | 'summary' | 'processing' | 'success' | 'spei_instructions'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | null>(null);

  // Sincronizar estados locales cuando el alumno seleccionado cambia o se guardan cambios (SOLUCIÓN AL BUG DEL CERO)
  useEffect(() => {
    setDailyLimit(student.dailyLimit);
    setRestrictions(student.restrictedCategories);
    setRestrictedProducts(student.restrictedProducts || []);
    setAllergies(student.allergies);
  }, [student.id, student.dailyLimit, student.restrictedCategories, student.restrictedProducts, student.allergies]);

  // REINICIAR flujo de recarga al entrar a la sección de Wallet
  useEffect(() => {
    if (view === AppView.PARENT_WALLET) {
        setDepositStep('amount');
        setSelectedAmount('');
        setPaymentMethod(null);
    }
  }, [view]);

  // Filtro de búsqueda para productos en settings
  const [productSearch, setProductSearch] = useState('');

  const foodCategories = [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];

  // Estado para Vinculación de Nuevo Hijo
  const [isLinking, setIsLinking] = useState(false);
  const [linkStep, setLinkStep] = useState<'form' | 'confirm'>('form');
  const [linkForm, setLinkForm] = useState({
      fullName: '',
      schoolKey: ''
  });
  const [foundStudent, setFoundStudent] = useState<StudentProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const activeSchool = useMemo(() => {
    return MOCK_SCHOOLS.find(s => s.id === student.schoolId) || MOCK_SCHOOLS[0];
  }, [student.schoolId]);

  const schoolModel = activeSchool.businessModel;

  const schoolProducts = useMemo(() => {
      return PRODUCTS.filter(p => 
        p.unitId && activeSchool.id === 'mx_01' && // Mock filter logic
        p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        foodCategories.includes(p.category)
      );
  }, [productSearch, activeSchool.id]);

  const toggleCategoryRestriction = (cat: Category) => {
    setRestrictions(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleProductRestriction = (productId: string) => {
    setRestrictedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleSaveSettings = () => {
    // Si el campo está vacío, mantenemos el valor actual o 0
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
          const validKeys = ['CUMBRES24', 'MECARD24', 'ABC123'];
          const normalizedKey = linkForm.schoolKey.toUpperCase();
          const normalizedName = linkForm.fullName.toLowerCase();
          if (validKeys.includes(normalizedKey) && normalizedName.includes('ana')) {
              setFoundStudent(MOCK_STUDENTS_LIST[1]);
              setLinkStep('confirm');
          } else {
              alert("No se encontró ningún registro.");
          }
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

  // VISTA 1: DASHBOARD FAMILIAR
  if (view === AppView.PARENT_DASHBOARD) {
    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-40">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Mi Familia</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Control Parental • MeCard Wallet</p>
                </div>
                <button onClick={() => setIsLinking(true)} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"><UserPlus size={16}/> Vincular otro hijo</button>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mb-8">
                {students.map((s, idx) => {
                    const school = MOCK_SCHOOLS.find(sch => sch.id === s.schoolId);
                    return (
                        <button key={s.id} onClick={() => onSwitchStudent(idx)} className={`min-w-[240px] p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 text-left ${activeStudentIndex === idx ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white/50 border-slate-100 hover:border-slate-300'}`}>
                            <img src={s.photo} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                            <div className="flex-1 min-w-0"><p className="font-black text-slate-800 text-sm truncate leading-none mb-1">{s.name}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{school?.logo} {school?.name.split(' ')[0]}</p></div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-12 animate-in slide-in-from-bottom-6 duration-500">
                <div className="p-10 flex flex-col md:flex-row md:items-center gap-10">
                    <div className="relative shrink-0"><img src={student.photo} alt={student.name} className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-50 shadow-2xl" /></div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3"><h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">{student.name}</h2><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">{activeSchool.name}</span></div>
                        <p className="text-indigo-600 font-black text-sm uppercase tracking-widest mt-2">{student.grade}</p>
                    </div>
                    <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Disponible</p><p className={`text-6xl font-black tracking-tighter ${student.balance < 50 ? 'text-rose-500' : 'text-indigo-600'}`}>${student.balance.toFixed(2)}</p></div>
                </div>
                <div className="bg-slate-50/50 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-50">
                    <NavCard onClick={() => onNavigate(AppView.PARENT_WALLET)} icon={<Wallet size={24}/>} title="Recargar Saldo" color="indigo" />
                    <NavCard onClick={() => onNavigate(AppView.PARENT_MENU)} icon={<Utensils size={24}/>} title="Pre-venta" color="orange" />
                    <NavCard onClick={() => onNavigate(AppView.PARENT_SETTINGS)} icon={<Ban size={24}/>} title="Límites y Alergias" color="rose" />
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><History className="text-indigo-600"/> Actividad Reciente</h3>
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-10">
                {transactions.slice(0, 5).map((tx, idx) => (
                    <div key={tx.id} className={`flex items-center justify-between p-8 hover:bg-slate-50 transition-colors ${idx !== 4 ? 'border-b border-slate-50' : ''}`}>
                        <div className="flex items-center gap-6"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{tx.type === 'deposit' ? <ArrowUpRight /> : <ArrowDownLeft />}</div><div><p className="font-black text-slate-800 text-base">{tx.item}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tx.date} • {tx.location}</p></div></div>
                        <span className={`text-2xl font-black tracking-tighter ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'}`}>{tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* MODAL VINCULACIÓN */}
            {isLinking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-12 relative animate-in zoom-in duration-300">
                        <button onClick={() => setIsLinking(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800 transition-all"><X size={32}/></button>
                        {linkStep === 'form' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter text-center">Vincular Estudiante</h3>
                                <div className="space-y-8 my-10">
                                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nombre Alumno</label><input type="text" value={linkForm.fullName} onChange={e => setLinkForm({...linkForm, fullName: e.target.value})} placeholder="Ej. Ana García" className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-xl text-slate-700 outline-none"/></div>
                                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clave Colegio</label><input type="text" value={linkForm.schoolKey} onChange={e => setLinkForm({...linkForm, schoolKey: e.target.value.toUpperCase()})} placeholder="CUMBRES24" className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-xl text-indigo-600 tracking-widest outline-none"/></div>
                                </div>
                                <Button disabled={!linkForm.fullName || !linkForm.schoolKey || isSearching} onClick={handleSearchStudent} className="w-full py-8 rounded-[32px] bg-indigo-600 font-black uppercase tracking-[4px]">Localizar Estudiante</Button>
                            </div>
                        )}
                        {linkStep === 'confirm' && foundStudent && (
                            <div className="animate-in fade-in zoom-in duration-500 text-center">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-10">¡Localizado!</h3>
                                <div className="bg-slate-50 p-10 rounded-[48px] mb-12 flex flex-col items-center">
                                    <img src={foundStudent.photo} className="w-32 h-32 rounded-[40px] object-cover mb-4" />
                                    <h4 className="text-2xl font-black text-slate-800">{foundStudent.name}</h4>
                                </div>
                                <Button onClick={finalizeLinking} className="w-full py-7 rounded-3xl bg-emerald-600 text-white font-black uppercase tracking-widest">Confirmar Vinculación</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
  }

  // VISTA 2: RECARGAS ONLINE (WALLET)
  if (view === AppView.PARENT_WALLET) {
    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-40">
             <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className="mb-8 text-sm font-black text-slate-400 hover:text-indigo-600 flex items-center gap-2 group transition-all">
                <ArrowDownLeft className="group-hover:rotate-45 transition-transform" size={20}/> VOLVER A MI FAMILIA
            </button>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-10">Billetera MeCard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Visual Card Display */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden h-[300px] flex flex-col justify-between">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                         <div className="flex justify-between items-start">
                             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                                 <Zap size={24} className="text-yellow-300 fill-yellow-300"/>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[3px] opacity-60">Digital Wallet</span>
                         </div>
                         <div>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Saldo de {student.name.split(' ')[0]}</p>
                             <p className="text-6xl font-black tracking-tighter">${student.balance.toFixed(2)}</p>
                         </div>
                         <div className="flex justify-between items-center pt-6 border-t border-white/10">
                             <span className="font-mono text-xs opacity-50">**** **** **** {student.id.slice(-4)}</span>
                             <div className="flex -space-x-2">
                                 <div className="w-8 h-8 rounded-full bg-rose-500/80 border border-white/20"></div>
                                 <div className="w-8 h-8 rounded-full bg-amber-500/80 border border-white/20"></div>
                             </div>
                         </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-4">
                        <ShieldCheck className="text-emerald-600" size={24}/>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-relaxed">Transacciones seguras procesadas por MeCard Network.</p>
                    </div>
                </div>

                {/* Flow de Recarga */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 min-h-[500px] flex flex-col">
                        {depositStep === 'amount' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Monto a abonar</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Selecciona o ingresa una cantidad</p>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {['100', '200', '500', '1000'].map(amt => (
                                        <button 
                                            key={amt} 
                                            onClick={() => setSelectedAmount(amt)}
                                            className={`py-6 rounded-3xl border-2 font-black transition-all ${selectedAmount === amt ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative mb-auto pb-12">
                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-3xl">$</span>
                                    <input 
                                        type="number" 
                                        value={selectedAmount}
                                        onChange={(e) => setSelectedAmount(e.target.value)}
                                        placeholder="Otro monto..." 
                                        className="w-full bg-slate-50 border-none rounded-[32px] pl-16 pr-8 py-8 font-black text-4xl text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none"
                                    />
                                </div>
                                <Button disabled={!selectedAmount || Number(selectedAmount) <= 0} onClick={() => setDepositStep('method')} className="w-full py-8 rounded-[32px] bg-indigo-600 font-black uppercase tracking-widest shadow-2xl shadow-indigo-100">Siguiente</Button>
                            </div>
                        )}

                        {depositStep === 'method' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter">Método de Pago</h2>
                                <div className="space-y-4 mb-auto">
                                    <button 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`w-full flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><CreditCard size={28}/></div>
                                        <div className="text-left"><p className="font-black text-slate-800 uppercase tracking-widest text-xs">Tarjeta Bancaria</p><p className="text-[10px] text-slate-400 font-bold">Abono instantáneo (+{schoolModel.cardDepositFeePercent}% fee)</p></div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('spei')}
                                        className={`w-full flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all ${paymentMethod === 'spei' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${paymentMethod === 'spei' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Landmark size={28}/></div>
                                        <div className="text-left"><p className="font-black text-slate-800 uppercase tracking-widest text-xs">Transferencia SPEI</p><p className="text-[10px] text-slate-400 font-bold">Cargo fijo de ${schoolModel.speiDepositFeeFixed} por abono</p></div>
                                    </button>
                                </div>
                                <div className="flex gap-4 pt-12">
                                    <button onClick={() => setDepositStep('amount')} className="flex-1 py-7 bg-slate-50 text-slate-400 rounded-[32px] font-black text-[10px] uppercase tracking-widest">Atrás</button>
                                    <Button disabled={!paymentMethod} onClick={() => setDepositStep('summary')} className="flex-[2] py-8 rounded-[32px] bg-indigo-600 font-black uppercase tracking-widest">Revisar Pago</Button>
                                </div>
                            </div>
                        )}

                        {depositStep === 'summary' && (
                             <div className="animate-in zoom-in duration-500 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter text-center">Resumen de Transacción</h2>
                                <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 space-y-6 flex-1 mb-8">
                                    <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                        <span>Subtotal solicitado</span>
                                        <span className="text-slate-800 text-base">${amountNum.toFixed(2)}</span>
                                    </div>
                                    {paymentMethod === 'card' ? (
                                        <>
                                            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                                <span>Cargo por Tarjeta ({schoolModel.cardDepositFeePercent}%)</span>
                                                <span className="text-rose-500 text-base">+ ${cardFee.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                                                <span className="font-black text-slate-800 uppercase text-xs">Total a Pagar</span>
                                                <span className="text-4xl font-black text-indigo-600 tracking-tighter">${cardTotal.toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                                <span>Comisión SPEI Institucional</span>
                                                <span className="text-rose-500 text-base">- ${schoolModel.speiDepositFeeFixed.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                                                <span className="font-black text-slate-800 uppercase text-xs">Monto a Reflejar</span>
                                                <span className="text-4xl font-black text-emerald-600 tracking-tighter">${speiTotal.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setDepositStep('method')} className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest">Atrás</button>
                                    <Button onClick={handleProcessDeposit} className="flex-[2] py-6 rounded-3xl bg-indigo-600 font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Pagar con {paymentMethod === 'card' ? 'Tarjeta' : 'SPEI'}</Button>
                                </div>
                            </div>
                        )}

                        {depositStep === 'spei_instructions' && (
                             <div className="animate-in fade-in zoom-in duration-500 flex-1 flex flex-col text-center">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">Instrucciones SPEI</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10 leading-relaxed">Transfiere desde tu banca móvil a la siguiente CLABE personalizada de {student.name}:</p>
                                <div className="bg-slate-900 p-10 rounded-[48px] text-white space-y-10 mb-12 shadow-2xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Landmark size={120}/></div>
                                     <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-6">
                                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px]">CLABE MECARD INTERBANCARIA</span>
                                         <Copy size={18} className="text-white/40 cursor-pointer hover:text-white transition-colors"/>
                                     </div>
                                     <p className="font-mono text-3xl font-black text-center tracking-[4px] text-white">646 180 0000 123 0001 5</p>
                                     <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Concepto Sugerido</p>
                                         <p className="font-black text-sm text-indigo-200">ABONO MECARD {student.id}</p>
                                     </div>
                                </div>
                                <Button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className="w-full py-8 rounded-[32px] bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl">Finalizar / Volver</Button>
                            </div>
                        )}

                        {depositStep === 'processing' && (
                             <div className="flex-1 flex flex-col items-center justify-center text-center animate-pulse">
                                <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Procesando Pago</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Validando con MeCard Network Gateway...</p>
                            </div>
                        )}

                        {depositStep === 'success' && (
                             <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                                <div className="bg-emerald-100 w-28 h-28 rounded-full flex items-center justify-center text-emerald-600 mb-10 shadow-xl shadow-emerald-100 border-4 border-white">
                                    <ShieldCheck size={56} />
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">¡Recarga Exitosa!</h2>
                                <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed">Se han abonado <span className="text-indigo-600 font-black">${amountNum.toFixed(2)}</span> al monedero de {student.name} exitosamente.</p>
                                <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className="w-full py-7 rounded-[32px] bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Regresar a Inicio</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // VISTA 3: AJUSTES (LIMITES Y BLOQUEOS)
  if (view === AppView.PARENT_SETTINGS) {
    return (
        <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto pb-64 font-sans">
            <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className="mb-8 text-sm font-black text-slate-400 hover:text-indigo-600 flex items-center gap-2 group transition-all"><X className="group-hover:rotate-90 transition-transform" size={20}/> CERRAR CONFIGURACIÓN</button>
            <div className="mb-12">
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Límites y Alergias</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-2">Control Parental para {student.name}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                {/* Límite y Categorías */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 p-10">
                        <div className="flex items-center mb-8 text-indigo-600 gap-4"><DollarSign size={28}/><h3 className="text-xl font-black text-slate-800">Límite Diario</h3></div>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl">$</span>
                            <input 
                                type="number" 
                                value={dailyLimit} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDailyLimit(val === '' ? '' : Number(val));
                                }} 
                                className="w-full border-none bg-slate-50 rounded-[32px] pl-14 pr-8 py-6 font-black text-4xl text-slate-700 shadow-inner outline-none focus:ring-4 focus:ring-indigo-100 transition-all" 
                            />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Monto máximo que {student.name.split(' ')[0]} puede gastar por día.</p>
                    </div>

                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 p-10">
                        <div className="flex items-center mb-8 text-amber-500 gap-4"><Ban size={28}/><h3 className="text-xl font-black text-slate-800">Bloqueo de Categoría</h3></div>
                        <div className="space-y-2">
                            {foodCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{cat}</span>
                                    <ToggleSwitch label="" enabled={restrictions.includes(cat)} onChange={() => toggleCategoryRestriction(cat)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bloqueo de Productos Específicos (CATÁLOGO) */}
                <div className="lg:col-span-2 bg-white rounded-[56px] shadow-sm border border-slate-100 p-12 flex flex-col h-full min-h-[700px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                           <div className="flex items-center gap-4 text-rose-500 mb-2"><Lock size={28}/><h3 className="text-2xl font-black text-slate-800 tracking-tight">Bloqueo por Producto</h3></div>
                           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Busca y bloquea artículos individuales del menú</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input 
                                placeholder="Buscar artículo..." 
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pb-10 scrollbar-hide">
                        {schoolProducts.map(product => {
                            const isBlocked = restrictedProducts.includes(product.id) || restrictions.includes(product.category);
                            const isIndividuallyBlocked = restrictedProducts.includes(product.id);
                            
                            return (
                                <div key={product.id} className={`p-5 rounded-[32px] border-2 transition-all flex items-center gap-5 ${isBlocked ? 'bg-rose-50/30 border-rose-100 grayscale-[0.5]' : 'bg-white border-slate-50 hover:border-slate-200 shadow-sm'}`}>
                                    <div className="relative shrink-0">
                                        <img src={product.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
                                        {isBlocked && (
                                            <div className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-xl border-2 border-white shadow-lg animate-in zoom-in">
                                                <Ban size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black text-sm truncate leading-none mb-1 ${isBlocked ? 'text-rose-900' : 'text-slate-800'}`}>{product.name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.category} • ${product.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleProductRestriction(product.id)}
                                        className={`p-4 rounded-2xl transition-all ${isIndividuallyBlocked ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-indigo-600'}`}
                                        title={isIndividuallyBlocked ? "Desbloquear artículo" : "Bloquear artículo"}
                                    >
                                        {isIndividuallyBlocked ? <Lock size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            );
                        })}
                        {schoolProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-20 opacity-20 text-center grayscale">
                                <Search size={64} className="mb-4" />
                                <p className="font-black uppercase text-[12px] tracking-widest">No se encontraron productos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center z-50 animate-in slide-in-from-bottom-10">
                 <Button onClick={handleSaveSettings} className="w-full max-w-lg py-8 rounded-[40px] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 font-black uppercase tracking-[5px] text-[12px] hover:scale-105 transition-all">
                   <Save className="w-6 h-6 mr-4" /> Guardar Todos los Cambios
                </Button>
            </div>
        </div>
    );
  }
  return <div className="p-10 text-center font-black opacity-20">VISTA EN CONSTRUCCIÓN</div>;
};

const NavCard = ({ onClick, icon, title, color }: any) => (
    <button onClick={onClick} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 ${color === 'rose' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : color === 'orange' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
            {icon}
        </div>
        <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Configurar</p>
    </button>
);
