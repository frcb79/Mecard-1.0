
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Trash2, CreditCard, Filter, ScanLine, AlertTriangle, 
  LayoutGrid, Coffee, Pizza, Utensils, PenTool, Book, Shirt, 
  Monitor, Check, X, ArrowRight, Settings, ShoppingBag, 
  ShoppingCart, HeartPulse, Ban, Sparkles, Bot, Gift 
} from 'lucide-react';
import { Product, CartItem, Category, StudentProfile, AppView } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { GiftRedemptionView } from './GiftRedemptionView';
import { getHealthyAlternatives } from '../services/geminiService';

interface PosViewProps {
  mode: 'cafeteria' | 'stationery';
  cart: CartItem[];
  student: StudentProfile;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  onPurchase: (total: number) => void;
}

type ScanStage = 'idle' | 'verify' | 'active' | 'gift_redeem';

export const PosView: React.FC<PosViewProps> = ({ mode, cart, student, addToCart, removeFromCart, clearCart, onPurchase }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const isCafeteria = mode === 'cafeteria';
  const accentColor = isCafeteria ? 'bg-indigo-600' : 'bg-blue-600';

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

  if (scanStage === 'gift_redeem') {
    return <GiftRedemptionView unitId="unit_01" onBack={() => setScanStage('idle')} />;
  }

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
      }, 800);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (scanStage === 'idle') {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50 p-8">
              <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 relative animate-in zoom-in duration-500">
                  <div className={`p-12 ${accentColor} text-white text-center`}>
                      <div className="bg-white/20 p-8 rounded-[40px] w-fit mx-auto mb-6 backdrop-blur-xl ring-1 ring-white/30">
                        {isCafeteria ? <Utensils className="w-16 h-16" /> : <PenTool className="w-16 h-16" />}
                      </div>
                      <h1 className="text-4xl font-black tracking-tighter">{isCafeteria ? 'Cafetería' : 'Papelería'}</h1>
                      <p className="opacity-80 font-bold uppercase text-[10px] tracking-[4px] mt-3">POS MECCARD NETWORK</p>
                  </div>
                  <div className="p-12 space-y-6">
                      <form onSubmit={handleScan}>
                          <div className="relative mb-6">
                              <ScanLine className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 w-8 h-8 opacity-40" />
                              <input type="text" autoFocus value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="Identificar Alumno..." className="w-full pl-16 pr-8 py-8 text-xl border-none bg-slate-50 rounded-[32px] focus:ring-4 focus:ring-indigo-100 transition-all font-black shadow-inner"/>
                          </div>
                          <Button type="submit" className="w-full py-8 rounded-[32px] text-[12px] font-black uppercase tracking-[4px] bg-indigo-600 shadow-2xl">Venta Directa</Button>
                      </form>
                      <div className="pt-6 border-t border-slate-100">
                         <button onClick={() => setScanStage('gift_redeem')} className="w-full py-6 flex items-center justify-center gap-4 bg-emerald-50 text-emerald-600 rounded-[32px] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-100 transition-all">
                            <Gift size={20}/> Canjear Código de Regalo
                         </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-2xl">
        <div className="p-12 border-b border-slate-100">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Categorías</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <button onClick={() => setSelectedCategory('All')} className={`w-full flex items-center px-8 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? `bg-indigo-600 text-white shadow-2xl` : 'text-slate-400 hover:bg-slate-50'}`}>
                <LayoutGrid className="w-5 h-5 mr-4" />Todo
            </button>
            {allowedCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat as Category)} className={`w-full flex items-center px-8 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? `bg-indigo-600 text-white shadow-2xl` : 'text-slate-400 hover:bg-slate-50'}`}>
                {cat}
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{mode.toUpperCase()} POS</h1>
            <div className="relative w-[500px]">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-300 w-6 h-6" />
                <input type="text" placeholder="Buscar..." className="w-full pl-20 pr-10 py-5 rounded-[32px] border-none bg-slate-50 focus:bg-white transition-all font-bold text-slate-700 shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 pb-40">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                ))}
            </div>
        </div>
      </div>

      <div className="w-[500px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-20">
        <div className={`p-12 ${isCafeteria ? 'bg-slate-950' : 'bg-blue-950'} text-white`}>
             <div className="flex justify-between items-start">
                 <div className="flex items-center gap-6">
                    <img src={student.photo} className="w-20 h-20 bg-white rounded-[32px] object-cover border-4 border-white/10" />
                    <div>
                        <h3 className="font-black text-white text-2xl tracking-tighter">{student.name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[5px] text-indigo-400">TICKET ABIERTO</p>
                    </div>
                 </div>
                 <button onClick={() => setScanStage('idle')} className="bg-white/10 hover:bg-rose-500 p-4 rounded-2xl transition-all"><X/></button>
            </div>
            <div className="mt-10 flex justify-between items-end border-t border-white/10 pt-8">
                <div className="text-[10px] font-black uppercase tracking-[4px] text-slate-500">Saldo</div>
                <div className="text-5xl font-black tracking-tighter">${student.balance.toFixed(2)}</div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6">
            {cart.map(item => (
                <div key={item.id} className="flex items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-lg truncate leading-none mb-1">{item.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-slate-800 text-xl tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest">Quitar</button>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-12 bg-white border-t border-slate-100 shadow-xl">
            <div className="flex justify-between text-5xl font-black text-slate-800 mb-10 tracking-tighter">
                <span className="text-slate-200">Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full py-8 rounded-[36px] text-[14px] font-black uppercase tracking-[6px] shadow-2xl" disabled={cart.length === 0 || isProcessing} onClick={handleCheckout}>
                {isProcessing ? 'Procesando...' : 'Cobrar Ahora'}
            </Button>
        </div>
      </div>
    </div>
  );
};
