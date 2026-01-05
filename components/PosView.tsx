
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Trash2, CreditCard, Filter, ScanLine, AlertTriangle, 
  LayoutGrid, Coffee, Pizza, Utensils, PenTool, Book, Shirt, 
  Monitor, Check, X, ArrowRight, Settings, ShoppingBag, 
  ShoppingCart, HeartPulse, Ban, Sparkles, Bot, Gift,
  Zap, ChevronRight, Receipt, Loader2, ChefHat, Package
} from 'lucide-react';
import { Product, CartItem, Category, StudentProfile, AppView } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { getSmartUpsell } from '../services/geminiService';

interface PosViewProps {
  mode: 'cafeteria' | 'stationery';
  cart: CartItem[];
  student: StudentProfile;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  onPurchase: (total: number) => void;
  onNavigate: (view: AppView) => void;
}

type ScanStage = 'idle' | 'verify' | 'active';

export const PosView: React.FC<PosViewProps> = ({ mode, cart, student, addToCart, removeFromCart, clearCart, onPurchase, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiUpsell, setAiUpsell] = useState<string | null>(null);
  const [loadingUpsell, setLoadingUpsell] = useState(false);

  const isCafeteria = mode === 'cafeteria';
  const accentColor = isCafeteria ? 'indigo' : 'blue';

  useEffect(() => {
    if (cart.length > 0 && isCafeteria) {
      triggerUpsell();
    } else {
      setAiUpsell(null);
    }
  }, [cart.length]);

  const triggerUpsell = async () => {
    setLoadingUpsell(true);
    const suggestion = await getSmartUpsell(cart, PRODUCTS);
    setAiUpsell(suggestion);
    setLoadingUpsell(false);
  };

  const allowedCategories = useMemo(() => {
    if (isCafeteria) return [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];
    return [Category.SUPPLIES, Category.UNIFORMS, Category.BOOKS, Category.TECH];
  }, [isCafeteria]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (!allowedCategories.includes(p.category)) return false;
      if (!p.isAvailable) return false;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, allowedCategories]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const term = studentIdInput.toLowerCase().trim();
    if (term === student.id || student.name.toLowerCase().includes(term)) {
        setScanStage('verify');
    } else {
        alert("Alumno no encontrado.");
        setStudentIdInput('');
    }
  };

  const handleCheckout = () => {
      if (student.balance < total) { alert("❌ SALDO INSUFICIENTE"); return; }
      setIsProcessing(true);
      setTimeout(() => {
          onPurchase(total);
          setIsProcessing(false);
          setScanStage('idle');
          setStudentIdInput('');
          setAiUpsell(null);
      }, 1200);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (scanStage === 'idle') {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-900 p-8 font-sans">
              <div className="max-w-xl w-full glass rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden relative animate-in zoom-in duration-700">
                  <div className={`p-16 ${isCafeteria ? 'bg-indigo-600/90' : 'bg-blue-600/90'} text-white text-center relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                          <Zap size={180} />
                      </div>
                      <div className="bg-white/20 p-10 rounded-[48px] w-fit mx-auto mb-10 backdrop-blur-xl ring-1 ring-white/30 relative z-10 animate-float shadow-2xl">
                        {isCafeteria ? <Utensils className="w-20 h-20" /> : <PenTool className="w-20 h-20" />}
                      </div>
                      <h1 className="text-6xl font-black tracking-tighter relative z-10">MeCard Terminal</h1>
                      <p className="opacity-60 font-black uppercase text-[11px] tracking-[6px] mt-4 relative z-10">{isCafeteria ? 'SISTEMA DE ALIMENTOS' : 'SISTEMA DE PAPELERÍA'}</p>
                  </div>
                  <div className="p-16 space-y-8">
                      <form onSubmit={handleScan} className="space-y-6">
                          <div className="relative">
                              <ScanLine className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-400 w-10 h-10 opacity-40" />
                              <input 
                                type="text" 
                                autoFocus 
                                value={studentIdInput} 
                                onChange={(e) => setStudentIdInput(e.target.value)} 
                                placeholder="Identificar Alumno..." 
                                className="w-full pl-20 pr-10 py-10 text-3xl border-none bg-slate-50 rounded-[40px] focus:ring-8 focus:ring-indigo-100 transition-all font-black shadow-inner placeholder-slate-300"
                              />
                          </div>
                          <Button type="submit" className="w-full py-10 rounded-[40px] text-[14px] font-black uppercase tracking-[5px] bg-indigo-600 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Abrir Registro de Venta</Button>
                      </form>
                      <div className="pt-10 border-t border-slate-100">
                         <button 
                            onClick={() => onNavigate(AppView.POS_GIFT_REDEEM)} 
                            className="w-full py-8 flex items-center justify-center gap-5 bg-emerald-50 text-emerald-600 rounded-[40px] font-black uppercase tracking-widest text-[12px] hover:bg-emerald-100 transition-all group shadow-sm"
                         >
                            <Gift size={24} className="group-hover:animate-bounce"/> Canjear Código Digital
                         </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans relative">
      {/* Category Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Categorías</h2>
            <div className={`p-3 rounded-2xl bg-${accentColor}-50 text-${accentColor}-600`}>
                {isCafeteria ? <Utensils size={20}/> : <PenTool size={20}/>}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <button onClick={() => setSelectedCategory('All')} className={`w-full flex items-center px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? `bg-${accentColor}-600 text-white shadow-2xl shadow-${accentColor}-100` : 'text-slate-400 hover:bg-slate-50'}`}>
                <LayoutGrid className="w-5 h-5 mr-4" />Todo el Menú
            </button>
            {allowedCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat as Category)} className={`w-full flex items-center px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? `bg-${accentColor}-600 text-white shadow-2xl shadow-${accentColor}-100` : 'text-slate-400 hover:bg-slate-50'}`}>
                {cat}
              </button>
            ))}
        </div>
        <div className="p-8 border-t border-slate-50">
            <button onClick={() => setScanStage('idle')} className="w-full py-5 rounded-[24px] bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-3">
                <ArrowRight className="rotate-180" size={16}/> Cerrar Terminal
            </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3`}>
                    {isCafeteria ? <ChefHat size={28}/> : <Package size={28}/>}
                </div>
                <div>
                   <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{mode === 'cafeteria' ? 'CAFETERÍA' : 'STATIONERY'} POS</h1>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">NODO ACTIVO: MX-UNIT-01</p>
                </div>
            </div>
            <div className="relative w-[450px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                <input type="text" placeholder="Buscar por nombre o SKU..." className="w-full pl-16 pr-8 py-5 rounded-[32px] border-none bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-black text-slate-700 shadow-inner placeholder-slate-300" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 scrollbar-hide">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 pb-40">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                ))}
                {filteredProducts.length === 0 && (
                   <div className="col-span-full py-40 text-center opacity-20 grayscale flex flex-col items-center">
                      <ShoppingBag size={120} strokeWidth={1} />
                      <p className="text-2xl font-black uppercase tracking-[10px] mt-8">Sin resultados</p>
                   </div>
                )}
            </div>
        </div>
      </div>

      {/* Cart & Student Info Sidebar */}
      <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-30">
        <div className={`p-12 ${isCafeteria ? 'bg-slate-950' : 'bg-blue-950'} text-white relative overflow-hidden shrink-0`}>
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Receipt size={240}/></div>
             <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-6">
                    <img src={student.photo} className="w-20 h-20 bg-white rounded-[32px] object-cover border-4 border-white/10 shadow-2xl animate-float" />
                    <div>
                        <h3 className="font-black text-white text-2xl tracking-tighter leading-none mb-2">{student.name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[4px] text-indigo-400">Verificado • {student.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setScanStage('idle')} className="bg-white/10 hover:bg-rose-500 p-4 rounded-2xl transition-all shadow-lg"><X size={20}/></button>
            </div>
            <div className="mt-12 flex justify-between items-end border-t border-white/10 pt-8 relative z-10">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-500 mb-2">Crédito Disponible</p>
                   <div className="text-7xl font-black tracking-tighter leading-none">${student.balance.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[6px] mb-4">Artículos en Carrito</h4>
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 scale-90">
                    <ShoppingCart size={100} strokeWidth={1} />
                    <p className="mt-6 font-black uppercase text-[12px] tracking-[8px]">Esperando Selección</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex items-center gap-6 bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-300 group hover:border-indigo-200 transition-all">
                        <img src={item.image} className="w-16 h-16 rounded-[20px] object-cover shrink-0 shadow-sm border border-slate-50" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-800 text-lg truncate leading-none mb-2">{item.name}</h4>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-800 text-2xl tracking-tighter leading-none">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-all">Remover</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Floating AI Insights */}
        {aiUpsell && (
            <div className="mx-10 mb-6 p-6 glass border border-indigo-100 rounded-[40px] animate-in slide-in-from-bottom-8 relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700"><Bot size={60}/></div>
                <div className="flex items-center gap-3 text-indigo-600 mb-3">
                    {loadingUpsell ? <Loader2 size={16} className="animate-spin"/> : <Bot size={18} className="animate-float" />}
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Sugerencia Estratégica AI</span>
                </div>
                <p className="text-indigo-900 text-sm font-bold leading-relaxed">{aiUpsell}</p>
            </div>
        )}

        <div className="p-12 bg-white border-t border-slate-100 shadow-[0_-30px_60px_rgba(0,0,0,0.03)] relative z-40 shrink-0">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] mb-2">Total a Pagar</p>
                    <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">${total.toFixed(2)}</span>
                </div>
                <div className="text-right">
                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${student.balance >= total ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {student.balance >= total ? 'FONDOS OK' : 'CRÉDITO INSUF.'}
                    </span>
                </div>
            </div>
            <Button 
                className="w-full py-10 rounded-[44px] text-[15px] font-black uppercase tracking-[6px] shadow-3xl shadow-indigo-100 relative overflow-hidden group transition-all active:scale-95 disabled:grayscale" 
                disabled={cart.length === 0 || isProcessing || student.balance < total} 
                onClick={handleCheckout}
            >
                <span className="relative z-10 flex items-center justify-center gap-4">
                    {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <><CreditCard size={28} className="group-hover:rotate-12 transition-transform" /> Procesar Cobro Digital</>}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Button>
            <button onClick={clearCart} className="w-full mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[4px] hover:text-slate-600 transition-colors">Vaciar Carrito</button>
        </div>
      </div>
    </div>
  );
};
