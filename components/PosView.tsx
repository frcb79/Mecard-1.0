
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
  const accentColor = isCafeteria ? 'bg-orange-500' : 'bg-blue-600';

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
      
      // Validación de Categoría Bloqueada
      const blockedByCategory = cart.filter(item => student.restrictedCategories.includes(item.category));
      if (blockedByCategory.length > 0) {
          alert(`🚫 BLOQUEADO POR CATEGORÍA: Santiago tiene prohibida la categoría: ${blockedByCategory[0].category}`);
          handleTryBlockedItem(blockedByCategory[0].category);
          return;
      }

      // Validación de Producto Bloqueado Específicamente
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
          <div className="h-screen flex items-center justify-center bg-gray-100 p-8">
              <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 relative group animate-in zoom-in duration-500">
                  <button onClick={() => setViewMode('inventory')} className="absolute top-6 right-6 p-4 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Settings size={24}/></button>
                  <div className={`p-10 ${accentColor} text-white text-center`}>
                      <div className="bg-white/20 p-6 rounded-[32px] w-fit mx-auto mb-6 backdrop-blur-md ring-1 ring-white/30">
                        {isCafeteria ? <Utensils className="w-12 h-12" /> : <PenTool className="w-12 h-12" />}
                      </div>
                      <h1 className="text-3xl font-black tracking-tight">{isCafeteria ? 'Cafetería Escolar' : 'Papelería Escolar'}</h1>
                      <p className="opacity-80 font-bold uppercase text-[10px] tracking-widest mt-2">Punto de Venta Inteligente</p>
                  </div>
                  <div className="p-10">
                      <form onSubmit={handleScan}>
                          <div className="relative mb-8">
                              <ScanLine className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                              <input type="text" autoFocus value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="Escanea credencial..." className="w-full pl-16 pr-8 py-6 text-lg border-none bg-slate-50 rounded-3xl focus:ring-4 focus:ring-indigo-100 transition-all font-black text-slate-700 placeholder:text-slate-300 shadow-inner"/>
                          </div>
                          <Button type="submit" className="w-full py-6 rounded-3xl text-[12px] font-black uppercase tracking-widest bg-indigo-600 shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all">Identificar Alumno</Button>
                      </form>
                  </div>
              </div>
          </div>
      );
  }

  if (scanStage === 'verify') {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-8 fixed inset-0 z-50 animate-in fade-in duration-300">
             <div className="max-w-4xl w-full bg-white rounded-[56px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in slide-in-from-bottom-8 duration-500">
                <div className="w-full md:w-5/12 bg-slate-100 relative min-h-[400px]">
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-12"><p className="text-white/60 text-[10px] font-black uppercase tracking-[3px] mb-2">Identidad Confirmada</p><p className="text-white text-4xl font-black leading-tight tracking-tight">{student.name}</p></div>
                </div>
                <div className="w-full md:w-7/12 p-12 flex flex-col justify-between bg-white relative">
                    <div className="absolute top-10 right-10">
                        <div className={`px-4 py-2 rounded-2xl border ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600'}`}>
                           <p className="text-[10px] font-black uppercase tracking-widest">{student.status === 'Active' ? 'Vigente' : 'Inactiva'}</p>
                        </div>
                    </div>
                    <div>
                        <div className="mb-10 pt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{student.name}</h2>
                            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-1">{student.grade}</p>
                        </div>

                        {student.allergies.length > 0 && isCafeteria && (
                            <div className="p-8 bg-rose-50 border-2 border-rose-500 rounded-[32px] mb-8 animate-pulse flex items-center gap-6">
                                <div className="bg-rose-500 p-4 rounded-2xl text-white shadow-lg"><HeartPulse size={32}/></div>
                                <div>
                                    <p className="text-rose-600 font-black text-xs uppercase tracking-widest">ALERTA MÉDICA: Alergias</p>
                                    <p className="text-rose-800 font-black text-xl leading-tight">{student.allergies.join(', ')}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-8 rounded-[32px] bg-indigo-50 border border-indigo-100"><p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Saldo MeCard</p><p className="text-4xl font-black text-indigo-700 tracking-tighter">${student.balance.toFixed(2)}</p></div>
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Disponible Hoy</p><p className="text-4xl font-black text-slate-700 tracking-tighter">${Math.max(0, student.dailyLimit - student.spentToday).toFixed(2)}</p></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={cancelSession} className="flex-1 py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest">X Cancelar</Button>
                        <Button onClick={confirmStudent} className="flex-2 py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest bg-indigo-600 shadow-2xl shadow-indigo-100">Abrir Ticket <ArrowRight size={20} className="ml-2"/></Button>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Sugerencia IA Flotante */}
      {aiSuggestion && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-6">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shrink-0"><Sparkles className="text-white" size={24}/></div>
              <div className="flex-1">
                 <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2"><Bot size={14}/> Asistente Gemini sugiere:</p>
                 <p className="font-bold text-base leading-snug">{aiSuggestion}</p>
              </div>
              <button onClick={() => setAiSuggestion(null)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20}/></button>
           </div>
        </div>
      )}

      {/* Sidebar Categorías */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center"><h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CATEGORÍAS</h2><LayoutGrid size={18} className="text-slate-200"/></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button onClick={() => setSelectedCategory('All')} className={`w-full flex items-center px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? `bg-indigo-50 text-indigo-700 shadow-inner` : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}><LayoutGrid className="w-5 h-5 mr-4" />Todo el Menú</button>
            {allowedCategories.map(cat => {
                const isBlocked = student.restrictedCategories.includes(cat);
                return (
                    <button key={cat} onClick={() => isBlocked ? handleTryBlockedItem(cat) : setSelectedCategory(cat as Category)} className={`w-full flex items-center px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${isBlocked ? 'opacity-40 grayscale cursor-not-allowed bg-rose-50 text-rose-500' : selectedCategory === cat ? `bg-indigo-50 text-indigo-700 shadow-inner` : 'text-slate-400 hover:bg-slate-50'}`}>
                        <span className="mr-4">{getCategoryIcon(cat)}</span>
                        {cat}
                        {isBlocked && <Ban size={14} className="absolute right-4 text-rose-500" />}
                    </button>
                );
            })}
        </div>
        <div className="p-6"><button onClick={() => setViewMode('inventory')} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-indigo-100"><Settings size={18}/> PANEL INVENTARIO</button></div>
      </div>

      {/* Grid de Productos */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-10 py-8 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
            <div><h1 className="text-2xl font-black text-slate-800 tracking-tighter">MECARD POS</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terminal Activa • {mode.toUpperCase()}</p></div>
            <div className="relative w-[400px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" /><input type="text" placeholder="Busca alimentos o matrícula..." className="w-full pl-16 pr-8 py-4 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-bold text-slate-700" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 bg-[#fdfdfd]">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-40">
                {filteredProducts.map(product => {
                    const isCategoryBlocked = student.restrictedCategories.includes(product.category);
                    const isProductBlocked = student.restrictedProducts?.includes(product.id);
                    const isBlocked = isCategoryBlocked || isProductBlocked;
                    
                    return (
                        <div key={product.id} className={`${isBlocked ? 'opacity-30 grayscale cursor-not-allowed relative group' : 'hover:scale-105 transition-transform duration-300'}`}>
                            <ProductCard product={product} onAdd={() => isBlocked ? handleTryBlockedItem(product.category) : addToCart(product)} />
                            {isBlocked && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-rose-500/80 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">{isProductBlocked ? 'PROHIBIDO' : 'CATEGORÍA BLOQUEADA'}</div></div>}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Ticket Activo */}
      <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.05)] z-20">
        <div className={`p-10 ${isCafeteria ? 'bg-indigo-600' : 'bg-blue-700'} text-white relative overflow-hidden animate-in slide-in-from-right-10 duration-500`}>
             <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-6">
                    <img src={student.photo} className="w-20 h-20 bg-white rounded-3xl object-cover border-4 border-white/20 shadow-2xl" />
                    <div><h3 className="font-black text-white text-2xl tracking-tighter leading-none">{student.name}</h3><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Ticket #TX-{Date.now().toString().slice(-4)}</p></div>
                 </div>
                 <button onClick={cancelSession} className="bg-white/10 hover:bg-rose-500 p-4 rounded-2xl transition-all shadow-lg"><X size={24}/></button>
            </div>
            <div className="mt-10 flex justify-between items-end relative z-10 pt-8 border-t border-white/10">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">SALDO DISPONIBLE</div>
                <div className="text-5xl font-black tracking-tighter">${student.balance.toFixed(2)}</div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/20">
            <div className="flex justify-between items-center"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RESUMEN DE COMPRA</h3><span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl uppercase tracking-widest">{cart.reduce((a, b) => a + b.quantity, 0)} ITEMS</span></div>
            {cart.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-200 text-center px-10"><ShoppingCart size={64} strokeWidth={1} className="mb-6 opacity-20" /><p className="font-black uppercase text-[11px] tracking-widest">Escanea productos para empezar</p></div>
            )}
            {cart.map(item => (
                <div key={item.id} className="flex items-center gap-5 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-50 shadow-sm" />
                    <div className="flex-1 min-w-0"><h4 className="font-black text-slate-800 text-base truncate">{item.name}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">CANT: {item.quantity}</p></div>
                    <div className="text-right"><p className="font-black text-slate-800 text-xl tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p><button onClick={() => removeFromCart(item.id)} className="text-[9px] font-black text-rose-300 hover:text-rose-500 uppercase tracking-widest mt-1">QUITAR</button></div>
                </div>
            ))}
        </div>

        <div className="p-12 bg-white border-t border-slate-100 shadow-[0_-30px_60px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between text-5xl font-black text-slate-800 mb-10 tracking-tighter"><span>Total</span><span className="text-indigo-600">${total.toFixed(2)}</span></div>
            <Button className={`w-full py-8 rounded-[32px] text-[12px] font-black uppercase tracking-[4px] shadow-2xl transition-all ${cart.length > 0 ? `bg-indigo-600 shadow-indigo-100 hover:scale-[1.03]` : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`} disabled={cart.length === 0 || isProcessing} onClick={handleCheckout}>
                {isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <><CreditCard className="mr-4" size={24}/> Confirmar Cobro</>}
            </Button>
        </div>
      </div>
    </div>
  );
};
