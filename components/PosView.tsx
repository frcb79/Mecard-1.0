
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, CreditCard, Filter, ScanLine, AlertTriangle, LayoutGrid, Coffee, Pizza, Utensils, PenTool, Book, Shirt, Monitor, Check, X, ArrowRight, Settings, ShoppingBag, ShoppingCart, HeartPulse, Ban, Sparkles, Bot } from 'lucide-react';
import { Product, CartItem, Category, StudentProfile } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { InventoryManagementView } from './InventoryManagementView';
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

type ScanStage = 'idle' | 'verify' | 'active';
type ViewMode = 'sales' | 'inventory';

export const PosView: React.FC<PosViewProps> = ({ mode, cart, student, addToCart, removeFromCart, clearCart, onPurchase }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('sales');
  const [localProducts, setLocalProducts] = useState<Product[]>(PRODUCTS);
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
    return localProducts.filter(p => {
      if (!allowedCategories.includes(p.category)) return false;
      if (viewMode === 'sales' && !p.isAvailable) return false;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, allowedCategories, localProducts, viewMode]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const term = studentIdInput.toLowerCase().trim();
    if (term === student.id || student.name.toLowerCase().includes(term)) {
        setScanStage('verify');
    } else {
        alert("Alumno no encontrado.\nPrueba ID: 2024001\nO Nombre: Santiago");
        setStudentIdInput('');
    }
  };

  const handleTryBlockedItem = async (cat: Category) => {
      setLoadingAi(true);
      const suggestion = await getHealthyAlternatives(cat, localProducts.filter(p => allowedCategories.includes(p.category)));
      setAiSuggestion(suggestion);
      setLoadingAi(false);
      setTimeout(() => setAiSuggestion(null), 8000);
  };

  const confirmStudent = () => setScanStage('active');
  const cancelSession = () => { setStudentIdInput(''); setScanStage('idle'); clearCart(); setAiSuggestion(null); };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
      if (student.balance < total) { alert("❌ SALDO INSUFICIENTE: Recargar en caja."); return; }
      
      const blockedByCategory = cart.filter(item => student.restrictedCategories.includes(item.category));
      if (blockedByCategory.length > 0) {
          alert(`🚫 BLOQUEADO POR CATEGORÍA: Santiago tiene prohibida la categoría: ${blockedByCategory[0].category}`);
          handleTryBlockedItem(blockedByCategory[0].category);
          return;
      }

      const blockedByProduct = cart.filter(item => student.restrictedProducts?.includes(item.id));
      if (blockedByProduct.length > 0) {
          alert(`🚫 PRODUCTO BLOQUEADO: El padre ha bloqueado específicamente: ${blockedByProduct[0].name}`);
          handleTryBlockedItem(blockedByProduct[0].category);
          return;
      }

      const remainingDailyLimit = student.dailyLimit - student.spentToday;
      if (total > remainingDailyLimit) { alert(`⚠️ LÍMITE EXCEDIDO: Santiago solo tiene $${remainingDailyLimit.toFixed(2)} disponibles hoy.`); return; }

      setIsProcessing(true);
      setTimeout(() => {
          onPurchase(total);
          setIsProcessing(false);
          setScanStage('idle');
          setStudentIdInput('');
          alert("✅ Pago realizado con éxito.");
      }, 800);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case Category.HOT_MEALS: return <Utensils size={16}/>;
        case Category.COMBO_MEALS: return <Pizza size={16}/>;
        case Category.DRINKS: return <Coffee size={16}/>;
        case Category.SUPPLIES: return <PenTool size={16}/>;
        case Category.BOOKS: return <Book size={16}/>;
        case Category.UNIFORMS: return <Shirt size={16}/>;
        case Category.TECH: return <Monitor size={16}/>;
        default: return <LayoutGrid size={16}/>;
    }
  };

  if (scanStage === 'idle') {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50 p-8">
              <div className="max-w-md w-full bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 relative group animate-in zoom-in duration-500">
                  <button onClick={() => setViewMode('inventory')} className="absolute top-6 right-6 p-4 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Settings size={24}/></button>
                  <div className={`p-12 ${accentColor} text-white text-center`}>
                      <div className="bg-white/20 p-8 rounded-[40px] w-fit mx-auto mb-6 backdrop-blur-xl ring-1 ring-white/30 shadow-2xl">
                        {isCafeteria ? <Utensils className="w-16 h-16" /> : <PenTool className="w-16 h-16" />}
                      </div>
                      <h1 className="text-4xl font-black tracking-tighter">{isCafeteria ? 'Cafetería' : 'Papelería'}</h1>
                      <p className="opacity-80 font-bold uppercase text-[10px] tracking-[4px] mt-3">Sistema de Venta MeCard</p>
                  </div>
                  <div className="p-12">
                      <form onSubmit={handleScan}>
                          <div className="relative mb-8">
                              <ScanLine className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 w-8 h-8 opacity-40" />
                              <input type="text" autoFocus value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="Escanear credencial..." className="w-full pl-16 pr-8 py-8 text-xl border-none bg-slate-50 rounded-[32px] focus:ring-4 focus:ring-indigo-100 transition-all font-black text-slate-700 placeholder:text-slate-300 shadow-inner"/>
                          </div>
                          <Button type="submit" className="w-full py-8 rounded-[32px] text-[12px] font-black uppercase tracking-[4px] bg-indigo-600 shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all">Identificar Alumno</Button>
                      </form>
                  </div>
              </div>
          </div>
      );
  }

  if (scanStage === 'verify') {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-8 fixed inset-0 z-50 animate-in fade-in duration-300">
             <div className="max-w-4xl w-full bg-white rounded-[64px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in slide-in-from-bottom-8 duration-500">
                <div className="w-full md:w-5/12 bg-slate-100 relative min-h-[500px]">
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-12">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[3px] mb-2">Identidad Confirmada</p>
                        <p className="text-white text-5xl font-black leading-tight tracking-tighter">{student.name}</p>
                    </div>
                </div>
                <div className="w-full md:w-7/12 p-16 flex flex-col justify-between bg-white relative">
                    <div className="absolute top-12 right-12">
                        <div className={`px-6 py-3 rounded-2xl border-2 ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                           <p className="text-[10px] font-black uppercase tracking-widest">{student.status === 'Active' ? 'Vigente' : 'Inactiva'}</p>
                        </div>
                    </div>
                    <div>
                        <div className="mb-12">
                            <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-3">{student.name}</h2>
                            <p className="text-indigo-600 font-black text-sm uppercase tracking-[4px]">{student.grade}</p>
                        </div>

                        {student.allergies.length > 0 && isCafeteria && (
                            <div className="p-8 bg-rose-50 border-2 border-rose-500 rounded-[40px] mb-10 flex items-center gap-8 animate-pulse shadow-xl shadow-rose-100">
                                <div className="bg-rose-500 p-6 rounded-[28px] text-white shadow-2xl"><HeartPulse size={40}/></div>
                                <div>
                                    <p className="text-rose-600 font-black text-xs uppercase tracking-widest mb-1">ALERTA MÉDICA</p>
                                    <p className="text-rose-900 font-black text-2xl tracking-tight leading-none">Alergias: {student.allergies.join(', ')}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="p-10 rounded-[40px] bg-indigo-50 border border-indigo-100 shadow-inner">
                                <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">Saldo MeCard</p>
                                <p className="text-5xl font-black text-indigo-700 tracking-tighter leading-none">${student.balance.toFixed(2)}</p>
                            </div>
                            <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Disponible Hoy</p>
                                <p className="text-5xl font-black text-slate-700 tracking-tighter leading-none">${Math.max(0, student.dailyLimit - student.spentToday).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Button variant="secondary" onClick={cancelSession} className="flex-1 py-8 rounded-[32px] text-[12px] font-black uppercase tracking-widest">X Cancelar</Button>
                        <Button onClick={confirmStudent} className="flex-[2] py-8 rounded-[32px] text-[12px] font-black uppercase tracking-[4px] bg-indigo-600 shadow-2xl shadow-indigo-100">Abrir Ticket <ArrowRight size={24} className="ml-3"/></Button>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {aiSuggestion && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl animate-in slide-in-from-bottom-12 duration-500">
           <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border border-white/10 flex items-center gap-8 backdrop-blur-2xl bg-opacity-95">
              <div className="bg-indigo-600 p-6 rounded-[28px] shadow-2xl shrink-0"><Sparkles className="text-white" size={32}/></div>
              <div className="flex-1">
                 <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[4px] mb-2 flex items-center gap-2"><Bot size={16}/> Gemini Assistant Sugiere:</p>
                 <p className="font-bold text-lg leading-snug tracking-tight">{aiSuggestion}</p>
              </div>
              <button onClick={() => setAiSuggestion(null)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
           </div>
        </div>
      )}

      {/* Sidebar Categorías - Premium Look */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-2xl">
        <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Categorías</h2>
            <LayoutGrid size={20} className="text-slate-200"/>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <button onClick={() => setSelectedCategory('All')} className={`w-full flex items-center px-8 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? `bg-indigo-600 text-white shadow-2xl shadow-indigo-100` : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                <LayoutGrid className="w-5 h-5 mr-4" />Todo el Menú
            </button>
            {allowedCategories.map(cat => {
                const isBlocked = student.restrictedCategories.includes(cat);
                return (
                    <button key={cat} onClick={() => isBlocked ? handleTryBlockedItem(cat) : setSelectedCategory(cat as Category)} className={`w-full flex items-center px-8 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all relative ${isBlocked ? 'opacity-30 grayscale cursor-not-allowed bg-rose-50 text-rose-500 border border-rose-100' : selectedCategory === cat ? `bg-indigo-600 text-white shadow-2xl shadow-indigo-100` : 'text-slate-400 hover:bg-slate-50'}`}>
                        <span className="mr-4">{getCategoryIcon(cat)}</span>
                        {cat}
                        {isBlocked && <Ban size={16} className="absolute right-6 text-rose-500" />}
                    </button>
                );
            })}
        </div>
        <div className="p-8 border-t border-slate-50">
            <button onClick={() => setViewMode('inventory')} className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-indigo-100"><Settings size={20}/> PANEL INVENTARIO</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">MeCard POS</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{mode.toUpperCase()} ESCUELA • CENTRAL NODE</p>
            </div>
            <div className="relative w-[500px]">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-300 w-6 h-6" />
                <input type="text" placeholder="Buscar productos..." className="w-full pl-20 pr-10 py-5 rounded-[32px] border-none bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-base font-bold text-slate-700 shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-40">
                {filteredProducts.map(product => {
                    const isCategoryBlocked = student.restrictedCategories.includes(product.category);
                    const isProductBlocked = student.restrictedProducts?.includes(product.id);
                    const isBlocked = isCategoryBlocked || isProductBlocked;
                    
                    return (
                        <div key={product.id} className={`transition-all duration-300 ${isBlocked ? 'opacity-20 grayscale cursor-not-allowed pointer-events-none' : 'hover:-translate-y-2 hover:shadow-2xl'}`}>
                            <ProductCard product={product} onAdd={() => isBlocked ? handleTryBlockedItem(product.category) : addToCart(product)} />
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="w-[500px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.08)] z-20">
        <div className={`p-12 ${isCafeteria ? 'bg-slate-950' : 'bg-blue-950'} text-white relative overflow-hidden animate-in slide-in-from-right-10 duration-500`}>
             <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-8">
                    <img src={student.photo} className="w-24 h-24 bg-white rounded-[32px] object-cover border-4 border-white/10 shadow-2xl" />
                    <div>
                        <h3 className="font-black text-white text-3xl tracking-tighter leading-none mb-2">{student.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400">TICKET ABIERTO</p>
                    </div>
                 </div>
                 <button onClick={cancelSession} className="bg-white/10 hover:bg-rose-500 p-5 rounded-3xl transition-all shadow-xl backdrop-blur-md"><X size={28}/></button>
            </div>
            <div className="mt-12 flex justify-between items-end relative z-10 pt-10 border-t border-white/10">
                <div className="text-[10px] font-black uppercase tracking-[4px] text-slate-500">Saldo Disponible</div>
                <div className="text-6xl font-black tracking-tighter leading-none">${student.balance.toFixed(2)}</div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-slate-50/20">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Carrito de Compra</h3>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl uppercase tracking-widest">{cart.reduce((a, b) => a + b.quantity, 0)} PRODUCTOS</span>
            </div>
            {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-200 text-center px-12 py-20">
                    <div className="bg-white p-12 rounded-[56px] shadow-sm mb-8">
                        <ShoppingCart size={80} strokeWidth={1} className="opacity-20" />
                    </div>
                    <p className="font-black uppercase text-[12px] tracking-[6px]">Esperando Productos</p>
                </div>
            )}
            {cart.map(item => (
                <div key={item.id} className="flex items-center gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 animate-in slide-in-from-right-4 duration-300 group">
                    <img src={item.image} className="w-20 h-20 rounded-[28px] object-cover shrink-0 border border-slate-50 shadow-sm transition-transform group-hover:scale-105" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-xl leading-none truncate mb-2">{item.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CANTIDAD: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-slate-800 text-2xl tracking-tighter mb-2">${(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-rose-300 hover:text-rose-500 uppercase tracking-widest transition-colors">Quitar</button>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-16 bg-white border-t border-slate-100 shadow-[0_-40px_100px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between text-6xl font-black text-slate-800 mb-12 tracking-tighter leading-none">
                <span className="text-slate-200">Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
            <Button className={`w-full py-10 rounded-[48px] text-[14px] font-black uppercase tracking-[6px] shadow-2xl transition-all ${cart.length > 0 ? `bg-indigo-600 shadow-indigo-100 hover:scale-[1.03] active:scale-95` : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`} disabled={cart.length === 0 || isProcessing} onClick={handleCheckout}>
                {isProcessing ? <div className="w-8 h-8 border-8 border-white border-t-transparent rounded-full animate-spin"></div> : <><CreditCard className="mr-5" size={32}/> Cobrar Ahora</>}
            </Button>
        </div>
      </div>
    </div>
  );
};
