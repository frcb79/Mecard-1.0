
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Trash2, CreditCard, ScanLine, AlertTriangle,
  LayoutGrid, Utensils, PenTool, X, ArrowRight, ShoppingBag,
  ShoppingCart, Bot, Gift, Zap, ChevronRight, Receipt, Loader2,
  ChefHat, Package, Plus, Minus, Hash, Tag, Store, CheckCircle2
} from 'lucide-react';
import { Product, CartItem, Category, StudentProfile } from '../types';
import { PRODUCTS, MOCK_STUDENT } from '../constants';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { useToast } from './ui/Toast';
import { getSmartUpsell } from '../services/geminiService';
import { rewardsService } from '../services/rewardsService';
import { socialService } from '../services/supabaseSocial';
import { usePaymentService, useInventoryService } from '../contexts/ServiceContext';
import { useAuth } from '../hooks/useAuth';
import { CartOrder } from '../services/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ScanStage = 'idle' | 'verify' | 'active';

interface PosViewStandalone {
  mode?: 'cafeteria' | 'stationery';
}

export const PosView: React.FC<PosViewStandalone> = ({ mode = 'cafeteria' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const paymentService = usePaymentService();
  const inventoryService = useInventoryService();
  
  // Local cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiUpsell, setAiUpsell] = useState<string | null>(null);
  const [loadingUpsell, setLoadingUpsell] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  // Gift redemption state
  const [giftRedemptionCode, setGiftRedemptionCode] = useState('');
  const [isRedeemingGift, setIsRedeemingGift] = useState(false);
  const [giftRedemptionSuccess, setGiftRedemptionSuccess] = useState<string | null>(null);
  
  // Get current student (from auth context or use mock)
  const student: StudentProfile = {
    ...MOCK_STUDENT,
    // Override with authenticated user if available
    ...(user?.id && { id: user.id, name: user.name || 'Estudiante' }),
  };

  const isCafeteria = mode === 'cafeteria';

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.id !== productId);
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    setAiUpsell(null);
    setTransactionError(null);
  };

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
        toast.warning('Alumno no encontrado', 'No está registrado en este campus.');
        setStudentIdInput('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setTransactionError(null);
    setTransactionSuccess(false);

    try {
      // Create cart order for payment service
      const order: CartOrder = {
        studentId: student.id,
        schoolId: student.schoolId || 'school-001',
        items: cart,
        total,
        clabeFrom: student.clabePersonal || '646180000000000000',
        timestamp: new Date(),
        metadata: {
          posMode: mode,
          timestamp: new Date().toISOString(),
        },
      };

      // Process transaction
      const result = await paymentService.processTransaction(order);

      if (result.status === 'completed') {
        // 🏆 MeCard Rewards: Calculate and record points
        try {
          // Step 1: Get school rewards config
          const schoolConfig = await rewardsService.mockGetSchoolRewardsConfig(
            student.schoolId || 'school-001'
          );

          // Step 2: Calculate points earned
          const { markupAmount, pointsEarned } = rewardsService.calculatePointsFromPurchase(
            total,
            schoolConfig
          );

          // Step 3: Get old tier before update
          const oldPointsData = await rewardsService.mockGetStudentRewardsPoints(
            student.id,
            student.schoolId || 'school-001'
          );
          const oldTier = oldPointsData.tier;

          // Step 4: Record points transaction
          await rewardsService.mockProcessRedemption(student.id, 'pos-' + result.transactionId, pointsEarned);

          // Step 5: Update state to show points earned
          setAiUpsell(
            `🎉 ${student.name} ganó ${pointsEarned} puntos!`
          );

          // Step 6: Check tier elevation
          const newPointsData = await rewardsService.mockGetStudentRewardsPoints(
            student.id,
            student.schoolId || 'school-001'
          );
          
          if (newPointsData.tier !== oldTier) {
            const tierInfo = rewardsService.getTierInfo(newPointsData.tier);
          }
        } catch (rewardError) {
          // Continue with transaction even if rewards fail
        }

        // Decrement inventory for each item
        for (const item of cart) {
          try {
            await inventoryService.decrementStock(item.id, item.quantity);
          } catch (err) {
            // Continue even if inventory update fails
          }
        }

        setTransactionSuccess(true);
        clearCart();
        setScanStage('idle');
        setStudentIdInput('');
        
        // Show success for 2 seconds then reset
        setTimeout(() => {
          setTransactionSuccess(false);
        }, 2000);
      } else {
        setTransactionError(result.message || 'Transacción fallida');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar transacción';
      setTransactionError(errorMessage);
      console.error('Transaction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeemGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRedemptionCode.trim()) {
      setTransactionError('Ingresa un código de regalo');
      return;
    }

    setIsRedeemingGift(true);
    setTransactionError(null);
    setGiftRedemptionSuccess(null);

    try {
      const redeemedGift = await socialService.redeemGift(giftRedemptionCode, '');
      setGiftRedemptionSuccess(`¡Regalo canjeado! Recibiste ${redeemedGift.product_name}`);
      setGiftRedemptionCode('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setGiftRedemptionSuccess(null);
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Código inválido o ya canjeado';
      setTransactionError(errorMessage);
    } finally {
      setIsRedeemingGift(false);
    }
  };

  if (scanStage === 'idle') {
      return (
          <div className="h-screen flex items-center justify-center bg-surface-900 p-4 sm:p-8 overflow-hidden">
              <div className="max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className={cn("px-8 py-12 text-white text-center relative overflow-hidden", isCafeteria ? "bg-brand-500" : "bg-blue-600")}>
                      <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Zap size={120} /></div>
                      <div className="bg-white/20 p-6 rounded-2xl w-fit mx-auto mb-6 backdrop-blur-sm border border-white/20 relative z-10">
                        {isCafeteria ? <Utensils size={40} /> : <Store size={40} />}
                      </div>
                      <h1 className="text-3xl font-extrabold tracking-tight relative z-10">MeCard Gateway</h1>
                      <p className="opacity-60 text-xs font-semibold uppercase tracking-widest mt-2 relative z-10">{isCafeteria ? 'Servicio de Cafetería' : 'Tienda Escolar'}</p>
                  </div>
                  <div className="p-8 space-y-5 bg-white">
                      <form onSubmit={handleScan} className="space-y-4">
                          <div className="relative">
                              <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 w-5 h-5" />
                              <input
                                type="text"
                                autoFocus
                                value={studentIdInput}
                                onChange={(e) => setStudentIdInput(e.target.value)}
                                placeholder="Escanear ID del Alumno..."
                                className="w-full pl-12 pr-4 py-4 text-base bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all font-medium placeholder-surface-400"
                              />
                          </div>
                          <Button type="submit" className="w-full py-4 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all">Abrir Terminal de Venta</Button>
                      </form>
                      <div className="pt-4 border-t border-surface-100">
                         <button
                            onClick={() => navigate('/student/gifts')}
                            className="w-full py-3.5 flex items-center justify-center gap-3 bg-trust-50 text-trust-600 rounded-xl font-semibold text-sm hover:bg-trust-100 transition-all border border-trust-100"
                         >
                            <Gift size={18} /> Canjear Código Digital
                         </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const accentActive = isCafeteria ? 'bg-brand-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md';
  const accentIcon = isCafeteria ? 'bg-brand-50 text-brand-600' : 'bg-blue-50 text-blue-600';

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden relative">
      {/* Category Sidebar */}
      <div className="w-64 bg-white border-r border-surface-100 flex flex-col z-20">
        <div className="px-5 py-5 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">Categorías</h2>
            <div className={cn("p-2.5 rounded-xl", accentIcon)}>
                {isCafeteria ? <ChefHat size={18}/> : <Package size={18}/>}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <button onClick={() => setSelectedCategory('All')} className={cn(
              "w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold transition-all",
              selectedCategory === 'All' ? accentActive : "text-surface-500 hover:bg-surface-50"
            )}>
                <LayoutGrid className="w-4 h-4 mr-3" />Todo el Stock
            </button>
            {allowedCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat as Category)} className={cn(
                "w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold transition-all",
                selectedCategory === cat ? accentActive : "text-surface-500 hover:bg-surface-50"
              )}>
                {cat}
              </button>
            ))}
        </div>
        <div className="p-3 border-t border-surface-100">
            <button onClick={() => setScanStage('idle')} className="w-full py-3 rounded-xl bg-surface-50 text-surface-400 font-semibold text-xs hover:text-danger-500 hover:bg-danger-50 transition-all flex items-center justify-center gap-2">
                <ArrowRight className="rotate-180" size={16}/> Salir
            </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-6 py-4 border-b border-surface-100 flex justify-between items-center shadow-xs z-10">
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", isCafeteria ? "bg-brand-500" : "bg-blue-600")}>
                    {isCafeteria ? <Utensils size={20}/> : <Store size={20}/>}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-surface-800 leading-none">{mode === 'cafeteria' ? 'Cafetería' : 'Tienda'}</h1>
                  <p className="text-[10px] font-medium text-surface-400 mt-0.5 flex items-center gap-1"><Zap size={10}/> Terminal Activo</p>
                </div>
            </div>
            <div className="relative w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300 w-4 h-4" />
                <input type="text" placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 transition-all text-sm font-medium text-surface-700 placeholder-surface-400" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-24">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                ))}
            </div>
        </div>
      </div>

      {/* Cart & Customer Sidebar */}
      <div className="w-96 bg-white border-l border-surface-100 flex flex-col h-full z-30">
        <div className={cn("px-6 py-5 text-white relative overflow-hidden shrink-0", isCafeteria ? "bg-surface-900" : "bg-blue-950")}>
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none rotate-12"><Receipt size={140}/></div>
             <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-3">
                    <img src={student.photo} alt={`Foto de ${student.name}`} className="w-12 h-12 bg-white rounded-xl object-cover border-2 border-white/10 shadow-md" />
                    <div>
                        <h3 className="font-bold text-white text-sm leading-tight">{student.name}</h3>
                        <p className="text-[10px] font-medium text-surface-400 mt-0.5">{student.id} · {student.grade}</p>
                    </div>
                 </div>
                 <button onClick={() => setScanStage('idle')} className="bg-white/10 hover:bg-danger-500 p-2 rounded-lg transition-all border border-white/10" aria-label="Cerrar cuenta del estudiante"><X size={16}/></button>
            </div>
            <div className="mt-4 flex justify-between items-end border-t border-white/10 pt-4 relative z-10">
                <div>
                  <p className="text-[10px] font-medium text-surface-500 mb-1">Cartera Digital</p>
                  <div className="text-4xl font-extrabold tracking-tight leading-none">${student.balance.toFixed(2)}</div>
                </div>
            </div>
        </div>

        {/* Gift Redemption Section */}
        {scanStage === 'active' && (
          <div className="px-5 pt-4 border-b border-surface-100">
            <div className="space-y-3 pb-4">
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">Canjear Regalo</p>
              <form onSubmit={handleRedeemGift} className="flex gap-2">
                <div className="flex-1 relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trust-500" />
                  <input
                    type="text"
                    placeholder="Código (6 dígitos)"
                    value={giftRedemptionCode}
                    onChange={(e) => setGiftRedemptionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full pl-9 pr-3 py-2.5 border border-trust-100 bg-trust-50 rounded-xl text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-trust-500 placeholder-trust-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRedeemingGift || giftRedemptionCode.length < 6}
                  className="px-3.5 py-2.5 bg-trust-600 text-white font-semibold text-xs rounded-xl hover:bg-trust-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  {isRedeemingGift ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                </button>
              </form>

              {giftRedemptionSuccess && (
                <div className="p-3 bg-trust-50 border border-trust-200 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-trust-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-trust-800 font-medium">{giftRedemptionSuccess}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-hide">
            <div className="flex justify-between items-center mb-1 px-1">
                <h4 className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">Artículos</h4>
                <button onClick={clearCart} className="text-[10px] font-semibold text-danger-500 hover:underline uppercase tracking-wider">Vaciar</button>
            </div>
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-surface-300 opacity-30">
                    <ShoppingCart size={64} strokeWidth={1} />
                    <p className="mt-3 font-medium text-xs tracking-wider">Sin artículos</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-surface-100 shadow-xs group hover:border-brand-200 transition-all animate-fade-in">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-surface-50" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-surface-800 text-sm truncate leading-tight">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">×{item.quantity}</span>
                               <span className="text-[10px] text-surface-300 font-mono">#{item.id.slice(-4)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-surface-800 text-base leading-none">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-medium text-danger-400 hover:text-danger-600 mt-1 opacity-0 group-hover:opacity-100 transition-all">Quitar</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* AI Strategic Intelligence Card */}
        {aiUpsell && (
            <div className="mx-5 mb-4 p-4 bg-brand-50/50 border border-brand-100 rounded-xl animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5"><Bot size={48}/></div>
                <div className="flex items-center gap-2 text-brand-600 mb-2">
                    {loadingUpsell ? <Loader2 size={14} className="animate-spin"/> : <Bot size={16} />}
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Sugerencia Gemini</span>
                </div>
                <p className="text-surface-700 text-xs font-medium leading-relaxed">{aiUpsell}</p>
            </div>
        )}

        <div className="p-5 bg-white border-t border-surface-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] relative z-40">
            {transactionSuccess && (
                <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="text-success-600 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-success-900 text-sm">Transacción Exitosa</p>
                        <p className="text-success-700 text-xs">Tu pago ha sido procesado</p>
                    </div>
                </div>
            )}
            
            {transactionError && (
                <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="text-danger-600 flex-shrink-0" size={18} />
                    <div>
                        <p className="font-semibold text-danger-900 text-sm">Error en Transacción</p>
                        <p className="text-danger-700 text-xs">{transactionError}</p>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-end mb-5">
                <div>
                    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-1">Total</p>
                    <span className="text-4xl font-extrabold text-surface-900 tracking-tight leading-none">${total.toFixed(2)}</span>
                </div>
                <div className="text-right">
                    <div className={cn(
                      "px-3.5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider border flex items-center gap-1.5",
                      student.balance >= total ? "bg-success-50 text-success-600 border-success-100" : "bg-danger-50 text-danger-600 border-danger-100"
                    )}>
                        {student.balance >= total ? <><CheckCircle2 size={12}/> Fondos OK</> : <><AlertTriangle size={12}/> Sin fondos</>}
                    </div>
                </div>
            </div>
            <Button 
                className="w-full py-4 rounded-xl text-sm font-semibold shadow-sm relative overflow-hidden group transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-brand-500 hover:bg-brand-600 text-white" 
                disabled={cart.length === 0 || isProcessing || student.balance < total} 
                onClick={handleCheckout}
            >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <><CreditCard size={20} /> Confirmar Compra</>}
                </span>
            </Button>
        </div>
      </div>
    </div>
  );
};
export default PosView;
