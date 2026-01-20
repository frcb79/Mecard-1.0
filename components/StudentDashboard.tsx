import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCodeReact from 'qrcode.react';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock,
  Zap, ArrowUpRight, ShieldCheck, HeartPulse, Activity,
  Sparkles, Coffee, ExternalLink, AlertCircle
} from 'lucide-react';

// ✅ Usar tipos centralizados
import { 
  StudentProfile, 
  Product, 
  Gift as GiftType,
  Category 
} from '../types';

import { socialService } from '../services/supabaseSocial';
import { inventoryService } from '../services/supabaseInventory';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Badge component
const Badge = ({ children, variant = 'indigo' }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-100 text-slate-500 border-slate-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Tab Button
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-10 py-6 flex items-center gap-4 border-b-4 transition-all font-black text-[10px] uppercase tracking-[3px] whitespace-nowrap group ${
      active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    <span className={`${active ? 'scale-125 rotate-6' : 'group-hover:scale-110'} transition-transform`}>{icon}</span> 
    {label}
  </button>
);

export default function StudentDashboard() {
  // ✅ AUTH PROTECTION
  const { user, isAuthenticated, isStudent } = useAuth();
  
  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  const userId = user.id;
  const schoolId = user.schoolId!;

  // State
  const [activeTab, setActiveTab] = useState<'wallet' | 'explore' | 'social' | 'gifts'>('wallet');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Ref para prevenir race conditions
  const isTogglingRef = useRef(new Set<string>());

  // ✅ CARGA INICIAL
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar perfil
        const { data: profileData, error: profileError } = await socialService.findPotentialFriend(schoolId, userId);
        if (profileError) throw profileError;
        if (profileData) setProfile(profileData);

        // Cargar regalos
        const { data: giftData, error: giftError } = await socialService.getReceivedGifts(userId);
        if (giftError) throw giftError;
        setGifts(giftData || []);

        // Cargar productos
        const inventory = await inventoryService.getInventory(schoolId);
        setProducts(inventory || []);
        
      } catch (err: any) {
        console.error("Error inicializando dashboard:", err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    
    initDashboard();
  }, [userId, schoolId]);

  // ✅ REALTIME SUBSCRIPTION - Balance updates
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel(`student:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'students',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log('Balance actualizado:', payload.new);
        setProfile(prev => prev ? { ...prev, ...payload.new as any } : null);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // ✅ PRODUCTOS FILTRADOS POR RESTRICCIONES
  const availableProducts = useMemo(() => {
    if (!profile?.restrictions) return products;
    
    return products.filter(product => {
      // Categorías restringidas
      if (profile.restrictions.restrictedCategories?.includes(product.category)) {
        return false;
      }
      
      // Productos específicos restringidos
      if (profile.restrictions.restrictedProducts?.includes(product.id)) {
        return false;
      }
      
      // Alérgenos
      if (product.allergens && profile.restrictions.allergens) {
        const hasAllergen = product.allergens.some(allergen => 
          profile.restrictions.allergens.includes(allergen)
        );
        if (hasAllergen) return false;
      }
      
      // TODO: Implementar restricciones horarias
      
      return true;
    });
  }, [products, profile]);

  // ✅ REGALOS ACTIVOS vs EXPIRADOS
  const { activeGifts, expiredGifts } = useMemo(() => {
    const active: GiftType[] = [];
    const expired: GiftType[] = [];
    
    gifts.forEach(gift => {
      if (gift.status === 'redeemed') return;
      
      const expiryDate = new Date(gift.expires_at);
      const now = new Date();
      
      if (gift.status === 'pending' && expiryDate > now) {
        active.push(gift);
      } else {
        expired.push(gift);
      }
    });
    
    return { activeGifts: active, expiredGifts: expired };
  }, [gifts]);

  // ✅ TOGGLE WISHLIST CON PROTECCIÓN
  const toggleWishlist = async (productId: string) => {
    if (!profile) return;
    
    // Prevenir doble clic
    if (isTogglingRef.current.has(productId)) return;
    
    isTogglingRef.current.add(productId);
    setActionLoading(productId);
    
    try {
      const newFavs = await socialService.toggleFavorite(userId, productId);
      setProfile({ ...profile, favorites: newFavs });
    } catch (e: any) {
      console.error('Error toggling favorite:', e);
      setError(e.message);
    } finally {
      setActionLoading(null);
      isTogglingRef.current.delete(productId);
    }
  };

  // ✅ TOGGLE PRIVACY
  const togglePrivacy = async () => {
    if (!profile) return;
    const newVal = !profile.favorites_public;
    
    try {
      await socialService.updateProfile(userId, { favorites_public: newVal });
      setProfile({ ...profile, favorites_public: newVal });
    } catch (e: any) {
      console.error('Error updating privacy:', e);
      setError(e.message);
    }
  };

  // ✅ LOADING STATE
  if (loading && !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[11px] font-black uppercase tracking-[8px] text-slate-400 animate-pulse">
          Sincronizando MeCard Cloud...
        </p>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error && !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <AlertCircle size={64} className="text-rose-500 mb-4" />
        <p className="text-xl font-bold text-slate-800 mb-2">Error al cargar</p>
        <p className="text-sm text-slate-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ✅ CALCULAR PORCENTAJE DE LÍMITE DIARIO
  const dailyLimitPercent = profile?.dailyLimit 
    ? Math.min((profile.spentToday / profile.dailyLimit) * 100, 100)
    : 0;
  const limitReached = profile?.spentToday >= (profile?.dailyLimit || Infinity);

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] overflow-hidden font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* HEADER */}
      <header className="bg-white px-12 py-8 border-b border-slate-100 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 italic tracking-tighter leading-none">
              MeCard<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mt-2">
              Centro Operativo Estudiantil
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
               Balance Actual
             </p>
             <p className="text-3xl font-black text-emerald-600 tracking-tighter">
               ${profile?.balance.toFixed(2)}
             </p>
             
             {/* ✅ LÍMITE DIARIO */}
             {profile?.dailyLimit && (
               <p className="text-[9px] font-bold text-slate-400 mt-1">
                 Gastado hoy: ${profile.spentToday.toFixed(2)} / ${profile.dailyLimit.toFixed(2)}
               </p>
             )}
          </div>
          
          <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative group">
            <Bell size={22} className="group-hover:rotate-12 transition-transform"/>
            {activeGifts.length > 0 && (
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            )}
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="bg-white border-b border-slate-50 flex px-12 overflow-x-auto scrollbar-hide shrink-0 shadow-sm">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={18}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={18}/>} label="Explorar Catálogo" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={18}/>} label="Red Social" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={18}/>} label={`Mis Regalos (${activeGifts.length})`} />
      </nav>

      {/* CONTENIDO */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 p-12">
        <div className="max-w-7xl mx-auto h-full">
          
          {/* TAB: WALLET */}
          {activeTab === 'wallet' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* ✅ TARJETA PASAPORTE CON QR REAL */}
                <div className="lg:col-span-8 bg-indigo-600 rounded-[56px] p-16 text-white shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-between group border border-white/10">
                  <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                    <Wallet size={300} strokeWidth={1} />
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <Badge variant="slate" className="bg-white/10 text-white border-white/20 mb-4">
                        Verified Student Account
                      </Badge>
                      <p className="font-mono text-2xl tracking-[6px] opacity-80">{profile?.studentId}</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-[28px] backdrop-blur-md border border-white/20 shadow-xl">
                      <Sparkles size={32} className="text-yellow-300 animate-pulse"/>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[5px] mb-3">
                      SALDO DISPONIBLE
                    </p>
                    <h2 className="text-9xl font-black tracking-tighter leading-none">
                      ${profile?.balance.toFixed(2)}
                    </h2>
                  </div>

                  <div className="relative z-10 flex justify-between items-end pt-12 border-t border-white/10 mt-12">
                    <div>
                      <p className="text-2xl font-black uppercase tracking-tighter italic opacity-95">
                        {profile?.fullName}
                      </p>
                      <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[4px] mt-1">
                        Status: {profile?.status}
                      </p>
                    </div>
                    
                    {/* ✅ QR CODE REAL */}
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer">
                      {profile?.credential?.qrCode ? (
                        <QRCodeReact 
                          value={profile.credential.qrCode}
                          size={120}
                          level="H"
                          includeMargin={false}
                        />
                      ) : (
                        <QrCode size={48} className="text-slate-900" />
                      )}
                    </div>
                  </div>
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-4 space-y-8">
                  {/* ✅ NUTRITIONAL SCORE */}
                  <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[240px]">
                    <div className="flex items-center gap-4 text-rose-500">
                      <HeartPulse size={24}/>
                      <h3 className="font-black text-xs uppercase tracking-widest leading-none">
                        Nutritional Score
                      </h3>
                    </div>
                    <div>
                      <p className="text-6xl font-black text-slate-800 tracking-tighter mb-4">
                        {profile?.health_score || 92}
                        <span className="text-lg text-slate-300">/100</span>
                      </p>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all" 
                          style={{ width: `${profile?.health_score || 92}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* ✅ LÍMITE DIARIO */}
                  <div className={`p-10 rounded-[48px] shadow-sm transition-all ${
                    limitReached 
                      ? 'bg-rose-50 border-2 border-rose-200' 
                      : 'bg-slate-900'
                  }`}>
                    <div className="flex items-center gap-3 mb-6">
                      <Clock size={20} className={limitReached ? 'text-rose-600' : 'text-indigo-400'} />
                      <h4 className={`text-[10px] font-black uppercase tracking-[4px] ${
                        limitReached ? 'text-rose-600' : 'text-indigo-400'
                      }`}>
                        Límite Diario
                      </h4>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-2xl font-black ${limitReached ? 'text-rose-600' : 'text-white'}`}>
                          ${profile?.spentToday.toFixed(2)}
                        </span>
                        <span className={`text-sm font-bold ${limitReached ? 'text-rose-400' : 'text-slate-400'}`}>
                          / ${profile?.dailyLimit.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            dailyLimitPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${dailyLimitPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    {limitReached && (
                      <p className="text-xs font-bold text-rose-600 italic">
                        ⚠️ Has alcanzado tu límite diario
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ACCIONES RÁPIDAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white rounded-[40px] p-10 border border-slate-100 flex items-center justify-between shadow-sm group hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all ${profile?.favoritesPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {profile?.favoritesPublic ? <Globe size={28}/> : <Lock size={28}/>}
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-lg italic leading-none mb-2">Wishlist Pública</p>
                          <p className="text-xs text-slate-500 font-medium">Permite que tus amigos vean tus antojos favoritos.</p>
                       </div>
                    </div>
                    <button onClick={togglePrivacy} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
                       {profile?.favoritesPublic ? 'Hacer Privada' : 'Hacer Pública'}
                    </button>
                 </div>

                 <div className="bg-indigo-50 rounded-[40px] p-10 border border-indigo-100 flex items-center justify-between shadow-sm group">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-indigo-600 shadow-sm">
                          <Activity size={28}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-lg italic leading-none mb-2">Historial Completo</p>
                          <p className="text-xs text-slate-500 font-medium italic">Revisa cada centavo gastado este mes.</p>
                       </div>
                    </div>
                    <button className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm hover:scale-110 transition-all">
                       <ChevronRight size={24}/>
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: EXPLORAR */}
          {activeTab === 'explore' && (
            <div className="space-y-12 animate-in fade-in duration-500 pb-20">
               <div className="flex justify-between items-end mb-10">
                  <div>
                    <h3 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Cafetería</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[6px] mt-4">
                      Marca tus favoritos para recibirlos como regalo
                    </p>
                    
                    {/* ✅ INDICADOR DE RESTRICCIONES */}
                    {profile?.restrictions && (
                      <div className="flex gap-2 mt-4">
                        {profile.restrictions.restrictedCategories.length > 0 && (
                          <Badge variant="rose">
                            {profile.restrictions.restrictedCategories.length} categorías restringidas
                          </Badge>
                        )}
                        {profile.restrictions.allergens.length > 0 && (
                          <Badge variant="amber">
                            {profile.restrictions.allergens.length} alérgenos
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative w-80">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                     <input placeholder="Buscar producto..." className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                  </div>
               </div>

               {/* ✅ PRODUCTOS FILTRADOS POR RESTRICCIONES */}
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {availableProducts.map(item => {
                    const isFav = profile?.favorites.includes(item.id);
                    const hasAllergen = item.allergens?.some(a => 
                      profile?.restrictions?.allergens.includes(a)
                    );
                    
                    return (
                      <div key={item.id} className="bg-white p-6 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                        {/* Wishlist button */}
                        <button 
                          onClick={() => toggleWishlist(item.id)}
                          disabled={actionLoading === item.id}
                          className={`absolute top-6 right-6 z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isFav ? 'bg-rose-50 text-rose-500 shadow-lg' : 'bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-400'}`}
                        >
                          {actionLoading === item.id ? (
                            <RefreshCw className="animate-spin" size={16}/>
                          ) : (
                            <Heart size={20} className={isFav ? 'fill-current' : ''} />
                          )}
                        </button>
                        
                        {/* ✅ Badge de alérgeno */}
                        {hasAllergen && (
                          <div className="absolute top-6 left-6 z-10">
                            <Badge variant="amber">⚠️ Alérgeno</Badge>
                          </div>
                        )}
                        
                        <div className="aspect-square bg-slate-50 rounded-[40px] mb-6 flex items-center justify-center overflow-hidden border border-slate-50">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <Coffee size={48} className="text-slate-200" strokeWidth={1}/>
                          )}
                        </div>

                        <div>
                          <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                            {item.category}
                          </p>
                          <h4 className="font-black text-slate-800 text-sm mb-4 leading-tight truncate italic">
                            {item.name}
                          </h4>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-black text-slate-800 tracking-tighter">
                              ${item.price.toFixed(2)}
                            </span>
                            <Badge variant="emerald">Disponible</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
               
               {/* ✅ PRODUCTOS BLOQUEADOS */}
               {products.length !== availableProducts.length && (
                 <div className="mt-12 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <div className="flex items-center gap-4 text-slate-500">
                     <Lock size={24} />
                     <div>
                       <p className="font-bold text-sm">
                         {products.length - availableProducts.length} productos ocultos
                       </p>
                       <p className="text-xs opacity-70">
                         Algunos productos están restringidos por tus padres o contienen alérgenos
                       </p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* TAB: MIS REGALOS */}
          {activeTab === 'gifts' && (
             <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                <div className="text-center mb-16">
                  <h3 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter mb-4">
                    Mis Regalos
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[10px]">
                    Cupones listos para canjear en caja
                  </p>
                </div>

                {/* ✅ REGALOS ACTIVOS */}
                {activeGifts.length > 0 && (
                  <div className="space-y-8">
                    <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">
                      📦 {activeGifts.length} Disponibles
                    </h4>
                    
                    {activeGifts.map(gift => (
                      <div key={gift.id} className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 items-center group hover:shadow-2xl transition-all relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-3 h-full bg-indigo-600"></div>
                         
                         {/* Producto */}
                         <div className="flex-1 flex items-center gap-8">
                            <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 relative shrink-0">
                               {gift.item?.image_url ? (
                                 <img src={gift.item.image_url} alt="" className="w-full h-full object-cover rounded-[40px]" />
                               ) : (
                                 <Coffee size={56} />
                               )}
                               <div className="absolute -top-3 -right-3 bg-rose-500 text-white p-3 rounded-2xl shadow-xl animate-bounce">
                                  <Gift size={24} />
                               </div>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-2">
                                 REGALADO POR: <span className="text-indigo-600">{gift.sender?.full_name}</span>
                               </p>
                               <h4 className="text-3xl font-black text-slate-800 mb-6 italic tracking-tight">
                                 {gift.item?.name}
                               </h4>
                               <div className="flex gap-4">
                                  <Badge variant="indigo">
                                    {new Date(gift.created_at).toLocaleDateString()}
                                  </Badge>
                                  <Badge variant="emerald">Disponible</Badge>
                                  <Badge variant="slate">
                                    Expira: {new Date(gift.expires_at).toLocaleDateString()}
                                  </Badge>
                               </div>
                               
                               {/* ✅ Mensaje del regalo */}
                               {gift.message && (
                                 <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                                   <p className="text-xs text-slate-600 italic">"{gift.message}"</p>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* ✅ CÓDIGO POS */}
                         <div className="bg-slate-900 px-12 py-8 rounded-[40px] text-center border border-white/5 shadow-2xl group-hover:scale-105 transition-transform">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[6px] mb-4">
                              SCAN POS CODE
                            </p>
                            <p className="text-5xl font-black text-indigo-400 tracking-[10px] font-mono leading-none">
                              {gift.redemption_code}
                            </p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ REGALOS EXPIRADOS */}
                {expiredGifts.length > 0 && (
                  <div className="space-y-6 mt-16">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      ⏰ {expiredGifts.length} Expirados
                    </h4>
                    {expiredGifts.map(gift => (
                      <div key={gift.id} className="bg-slate-50 rounded-3xl p-8 opacity-50 grayscale">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-600">{gift.item?.name}</p>
                            <p className="text-xs text-slate-400">
                              De {gift.sender?.full_name} - Expiró el {new Date(gift.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="slate">Expirado</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ ESTADO VACÍO */}
                {activeGifts.length === 0 && expiredGifts.length === 0 && (
                  <div className="py-40 bg-white rounded-[72px] border-4 border-dashed border-slate-100 text-center grayscale opacity-20 flex flex-col items-center">
                     <Gift size={100} strokeWidth={1} className="mb-6"/>
                     <p className="text-sm font-black uppercase tracking-[10px] italic">
                       Buzón de sorpresas vacío
                     </p>
                  </div>
                )}
             </div>
          )}

          {/* TAB: SOCIAL */}
          {activeTab === 'social' && (
             <div className="h-full flex items-center justify-center animate-in fade-in duration-500">
                <div className="text-center max-w-md">
                   <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mx-auto mb-8">
                      <Users size={48} strokeWidth={1} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                     Mi Red MeCard
                   </h3>
                   <p className="text-slate-400 font-medium text-sm mt-4 italic leading-relaxed">
                     Esta sección requiere integrar el componente `MeCardSocial.tsx`. 
                     Aquí podrás buscar amigos y enviarles regalos con un solo clic.
                   </p>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ✅ ERROR TOAST (si hay errores) */}
      {error && (
        <div className="fixed bottom-8 right-8 bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <AlertCircle size={20} />
          <div>
            <p className="font-bold text-sm">Error</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-4 text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-4 px-12 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Conexión Segura MeCard Engine v2.6
            </p>
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">
              Datos Protegidos con RLS
            </p>
         </div>
      </footer>
    </div>
  );
}
