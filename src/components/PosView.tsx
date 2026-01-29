
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Trash2, CreditCard, ScanLine, AlertTriangle, 
  LayoutGrid, Utensils, PenTool, X, ArrowRight, ShoppingBag, 
  ShoppingCart, Bot, Gift, Zap, ChevronRight, Receipt, Loader2, 
  ChefHat, Package, Plus, Minus, Hash, Tag, Store, CheckCircle2
} from 'lucide-react';
import { Product, CartItem, Category, StudentProfile, AppView } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { getSmartUpsell } from '../services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
      const timer = setTimeout(() => triggerUpsell(), 800);
      return () => clearTimeout(timer);
    } else {
      setAiUpsell(null);
    }
  }, [cart.length, isCafeteria]);

  const triggerUpsell = async () => {
    setLoadingUpsell(true);
    try {
      const suggestion = await getSmartUpsell(cart, PRODUCTS);
      setAiUpsell(suggestion);
    } finally {
      setLoadingUpsell(false);
    }
  };

  const allowedCategories = useMemo(() => {
    if (isCafeteria) return [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];
    return [Category.SUPPLIES, Category.UNIFORMS, Category.BOOKS, Category.TECH];
  }, [isCafeteria]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (!allowedCategories.includes(p.category)) return false;
      if (!p.isAvailable) return false;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
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
        alert("Alumno no registrado en este campus.");
        setStudentIdInput('');
    }
  };

  const handleCheckout = () => {
      if (student.balance < total) { alert("⚠️ FONDOS INSUFICIENTES"); return; }
      setIsProcessing(true);
      setTimeout(() => {
          onPurchase(total);
          setIsProcessing(false);
          setScanStage('idle');
          setStudentIdInput('');
          setAiUpsell(null);
      }, 1500);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (scanStage === 'idle') {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-900 p-8 font-sans overflow-hidden">
              <div className="max-w-2xl w-full glass rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in duration-1000">
                  <div className={cn("p-20 text-white text-center relative overflow-hidden", isCafeteria ? "bg-indigo-600/90" : "bg-blue-600/90")}>
                      <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                          <Zap size={220} />
                      </div>
                      <div className="bg-white/20 p-12 rounded-[48px] w-fit mx-auto mb-12 backdrop-blur-3xl ring-1 ring-white/30 relative z-10 animate-float shadow-2xl">
                        {isCafeteria ? <Utensils className="w-24 h-24" /> : <Store className="w-24 h-24" />}
                      </div>
                      <h1 className="text-6xl font-black tracking-tighter relative z-10 leading-none">MeCard Gateway</h1>
                      <p className="opacity-60 font-black uppercase text-[12px] tracking-[8px] mt-6 relative z-10">{isCafeteria ? 'SERVICIO DE CAFETERÍA' : 'TIENDA ESCOLAR'}</p>
                  </div>
                  <div className="p-20 space-y-10 bg-white/60 backdrop-blur-2xl">
                      <form onSubmit={handleScan} className="space-y-8">
                          <div className="relative group">
                              <div className="absolute inset-0 bg-indigo-600/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <ScanLine className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-400 w-12 h-12 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                              <input 
                                type="text" 
                                autoFocus 
                                value={studentIdInput} 
                                onChange={(e) => setStudentIdInput(e.target.value)} 
                                placeholder="Escanear ID del Alumno..." 
                                className="w-full pl-24 pr-10 py-10 text-3xl border-none bg-slate-50/50 rounded-[40px] focus:ring-8 focus:ring-indigo-100 transition-all font-black shadow-inner placeholder-slate-400 relative z-10"
                              />
                          </div>
                          <Button type="submit" className="w-full py-10 rounded-[40px] text-[15px] font-black uppercase tracking-[6px] bg-indigo-600 shadow-3xl shadow-indigo-200/50 hover:scale-[1.02] active:scale-95 transition-all">Abrir Terminal de Venta</Button>
                      </form>
                      <div className="pt-10 border-t border-slate-200/50 flex flex-col gap-4">
                         <button 
                            onClick={() => onNavigate(AppView.POS_GIFT_REDEEM)} 
                            className="w-full py-8 flex items-center justify-center gap-6 bg-emerald-50 text-emerald-600 rounded-[40px] font-black uppercase tracking-widest text-[13px] hover:bg-emerald-100 transition-all group border border-emerald-100"
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
        <div className="p-12 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[5px]">Directorio</h2>
            <div className={cn("p-3 rounded-2xl", isCafeteria ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600")}>
                {isCafeteria ? <ChefHat size={22}/> : <Package size={22}/>}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <button onClick={() => setSelectedCategory('All')} className={cn(
              "w-full flex items-center px-8 py-5 rounded-[28px] text-[12px] font-black uppercase tracking-widest transition-all",
              selectedCategory === 'All' 
                ? `bg-${accentColor}-600 text-white shadow-2xl shadow-${accentColor}-100` 
                : "text-slate-400 hover:bg-slate-50"
            )}>
                <LayoutGrid className="w-5 h-5 mr-4" />Todo el Stock
            </button>
            {allowedCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat as Category)} className={cn(
                "w-full flex items-center px-8 py-5 rounded-[28px] text-[12px] font-black uppercase tracking-widest transition-all",
                selectedCategory === cat 
                  ? `bg-${accentColor}-600 text-white shadow-2xl shadow-${accentColor}-100` 
                  : "text-slate-400 hover:bg-slate-50"
              )}>
                {cat}
              </button>
            ))}
        </div>
        <div className="p-8 border-t border-slate-50">
            <button onClick={() => setScanStage('idle')} className="w-full py-5 rounded-[24px] bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-3">
                <ArrowRight className="rotate-180" size={18}/> Salir de Terminal
            </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-6">
                <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3", isCafeteria ? "bg-indigo-600" : "bg-blue-600")}>
                    {isCafeteria ? <Utensils size={28}/> : <Store size={28}/>}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{mode.toUpperCase()} MODE</h1>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-2"><Zap size={10}/> Nodo Operativo: 01</p>
                </div>
            </div>
            <div className="relative w-[500px]">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                <input type="text" placeholder="Buscar por Nombre o SKU..." className="w-full pl-18 pr-8 py-6 rounded-full border-none bg-slate-50 focus:bg-white focus:ring-8 focus:ring-indigo-50 transition-all font-bold text-slate-700 shadow-inner placeholder-slate-400" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 scrollbar-hide">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 pb-40">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                ))}
            </div>
        </div>
      </div>

      {/* Cart & Customer (Premium Retina Sidebar) */}
      <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[-30px_0_70px_rgba(0,0,0,0.06)] z-30">
        <div className={cn("p-12 text-white relative overflow-hidden shrink-0", isCafeteria ? "bg-slate-950" : "bg-blue-950")}>
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Receipt size={260}/></div>
             <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-6">
                    <img src={student.photo} className="w-20 h-20 bg-white rounded-[32px] object-cover border-4 border-white/10 shadow-2xl animate-float" />
                    <div>
                        <h3 className="font-black text-white text-2xl tracking-tighter leading-none mb-2">{student.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400">{student.id} • {student.grade}</p>
                    </div>
                 </div>
                 <button onClick={() => setScanStage('idle')} className="bg-white/10 hover:bg-rose-500 p-4 rounded-2xl transition-all shadow-lg border border-white/10"><X size={20}/></button>
            </div>
            <div className="mt-12 flex justify-between items-end border-t border-white/10 pt-10 relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-500 mb-2">Cartera Digital</p>
                  <div className="text-7xl font-black tracking-tighter leading-none">${student.balance.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
            <div className="flex justify-between items-center mb-2 px-2">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[6px]">Artículos</h4>
                <button onClick={clearCart} className="text-[10px] font-black text-rose-500 hover:underline uppercase tracking-widest">Vaciar Todo</button>
            </div>
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 scale-90">
                    <ShoppingCart size={110} strokeWidth={1} />
                    <p className="mt-6 font-black uppercase text-[12px] tracking-[10px]">Sin Selección</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex items-center gap-6 bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-500 group hover:border-indigo-200 transition-all">
                        <img src={item.image} className="w-16 h-16 rounded-[24px] object-cover shrink-0 shadow-sm border border-slate-50" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-800 text-lg truncate leading-none mb-2">{item.name}</h4>
                            <div className="flex items-center gap-4">
                               <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">x{item.quantity}</p>
                               <span className="text-[10px] font-bold text-slate-300 font-mono">SKU: {item.id.slice(-4)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-800 text-2xl tracking-tighter leading-none">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-[11px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 ml-auto">Eliminar</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* AI Strategic Intelligence Card */}
        {aiUpsell && (
            <div className="mx-10 mb-6 p-6 glass border border-indigo-100 rounded-[40px] animate-in slide-in-from-bottom-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:scale-150 transition-transform duration-1000"><Bot size={70}/></div>
                <div className="flex items-center gap-3 text-indigo-600 mb-3">
                    {loadingUpsell ? <Loader2 size={18} className="animate-spin"/> : <Bot size={20} className="animate-float" />}
                    <span className="text-[12px] font-black uppercase tracking-widest italic">Inteligencia Gemini</span>
                </div>
                <p className="text-indigo-950 text-sm font-bold leading-relaxed">{aiUpsell}</p>
            </div>
        )}

        <div className="p-12 bg-white border-t border-slate-100 shadow-[0_-30px_60px_rgba(0,0,0,0.03)] relative z-40">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[8px] mb-3">Total a Liquidar</p>
                    <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">${total.toFixed(2)}</span>
                </div>
                <div className="text-right">
                    <div className={cn(
                      "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2",
                      student.balance >= total ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                        {student.balance >= total ? <><CheckCircle2 size={14}/> Fondos OK</> : <><AlertTriangle size={14}/> Crítico</>}
                    </div>
                </div>
            </div>
            <Button 
                className="w-full py-10 rounded-[48px] text-[17px] font-black uppercase tracking-[8px] shadow-3xl shadow-indigo-100 relative overflow-hidden group transition-all active:scale-95 disabled:grayscale" 
                disabled={cart.length === 0 || isProcessing || student.balance < total} 
                onClick={handleCheckout}
            >
                <span className="relative z-10 flex items-center justify-center gap-5">
                    {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <><CreditCard size={32} className="group-hover:rotate-12 transition-transform" /> Confirmar Compra</>}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </Button>
        </div>
      </div>
    </div>
  );
};
