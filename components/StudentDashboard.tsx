// ============================================
// ARCHIVO: src/components/StudentDashboard.tsx
// VERSIÓN CON BÚSQUEDA INTEGRADA
// ============================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Wallet,
  Users,
  Gift,
  Bell,
  ShoppingBag,
  Globe,
  Lock,
  Heart,
  Search,
  RefreshCw,
  ChevronRight,
  Clock,
  Zap,
  ShieldCheck,
  HeartPulse,
  Activity,
  Sparkles,
  Coffee,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useProductSearch } from '../hooks/useProductSearch';
import { supabase } from '../lib/supabaseClient';

// Componentes de búsqueda
import { ProductSearch } from '../components/ProductSearch';
import { CategoryFilter } from '../components/CategoryFilter';
import { SortSelector } from '../components/SortSelector';
import { PriceRangeFilter } from '../components/PriceRangeFilter';
import { TransactionHistory } from '../components/TransactionHistory';
import { NotificationBell } from '../components/NotificationBell';

import {
  StudentProfile,
  Product,
  Gift as GiftType,
  Category,
} from '../types';

// ============================================
// UI COMPONENTS
// ============================================
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
<TabButton 
  active={activeTab === 'history'} 
  onClick={() => setActiveTab('history')} 
  icon={<Activity size={18}/>} 
  label="Historial" 
/>
{activeTab === 'history' && (
  <div className="animate-in fade-in duration-500">
    <TransactionHistory 
      studentId={userId} 
      studentName={profile?.fullName || ''} 
    />
  </div>
)}
*/
// ============================================
// MAIN COMPONENT
// ============================================
export default function StudentDashboard() {
  // ✅ AUTH PROTECTION
  const { user, isAuthenticated, isStudent } = useAuth();
  
  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  const userId = user.id;
  const schoolId = user.schoolId!;

  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState<'wallet' | 'explore' | 'social' | 'gifts' | 'history'>('wallet');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isTogglingRef = useRef(new Set<string>());
 
  // ============================================
  // BÚSQUEDA Y FILTROS
  // ============================================
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filteredProducts,
    totalResults,
    clearFilters,
    isFiltering,
    maxPrice
  } = useProductSearch({ products });

  // Categorías disponibles
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))) as Category[];
  }, [products]);

  // ============================================
  // DATA LOADING
  // ============================================
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Cargar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        if (profileData) {
          setProfile({
            id: profileData.id,
            userId: profileData.id,
            studentId: profileData.student_id || '',
            fullName: profileData.full_name || '',
            firstName: profileData.full_name?.split(' ')[0] || '',
            lastName: profileData.full_name?.split(' ').slice(1).join(' ') || '',
            grade: profileData.grade || '',
            schoolId: profileData.school_id,
            balance: profileData.balance || 0,
            dailyLimit: 100,
            spentToday: 0,
            totalSpent: 0,
            restrictions: {
              restrictedCategories: [],
              restrictedProducts: [],
              allergens: []
            },
            parentId: '',
            parentName: '',
            photo: profileData.photo,
            enrollmentDate: profileData.created_at,
            status: 'ACTIVE',
            createdAt: profileData.created_at,
            updatedAt: profileData.created_at,
            credential: {
              id: profileData.id,
              studentId: profileData.student_id || '',
              qrCode: `MECARD_${profileData.student_id}`,
              issuedAt: profileData.created_at,
              isActive: true,
              usageCount: 0
            },
            favorites: profileData.favorites || [],
            favoritesPublic: profileData.favorites_public || false
          });
        }

        // 2. Cargar productos
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('status', 'active');

        if (inventoryError) throw inventoryError;
        if (inventoryData) {
          setProducts(inventoryData.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category as Category,
            price: item.price,
            image: item.image_url,
            calories: item.calories,
            isAvailable: true,
            ownerType: 'SCHOOL',
            unitId: item.unit_id,
            allergens: item.allergens || []
          })));
        }

        setGifts([]);

      } catch (err: any) {
        console.error('Error cargando dashboard:', err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboard();
  }, [userId, schoolId]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel(`student:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        setProfile(prev => prev ? { 
          ...prev, 
          balance: payload.new.balance || prev.balance 
        } : null);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const activeGifts = useMemo(() => {
    return gifts.filter(gift => {
      if (gift.status !== 'pending') return false;
      const expiryDate = new Date(gift.expires_at);
      return expiryDate > new Date();
    });
  }, [gifts]);

  const expiredGifts = useMemo(() => {
    return gifts.filter(g => g.status === 'expired' || g.status === 'redeemed');
  }, [gifts]);

  // ============================================
  // ACTIONS
  // ============================================
  const toggleWishlist = async (productId: string) => {
    if (!profile) return;
    if (isTogglingRef.current.has(productId)) return;
    
    isTogglingRef.current.add(productId);
    setActionLoading(productId);
    
    try {
      const currentFavorites = profile.favorites || [];
      const isFavorite = currentFavorites.includes(productId);
      const newFavorites = isFavorite
        ? currentFavorites.filter(id => id !== productId)
        : [...currentFavorites, productId];

      const { error } = await supabase
        .from('profiles')
        .update({ favorites: newFavorites })
        .eq('id', userId);

      if (error) throw error;

      setProfile({ ...profile, favorites: newFavorites });
    } catch (e: any) {
      console.error('Error toggling favorite:', e);
      setError('No se pudo actualizar favoritos');
    } finally {
      setActionLoading(null);
      isTogglingRef.current.delete(productId);
    }
  };

  const togglePrivacy = async () => {
    if (!profile) return;
    const newVal = !profile.favoritesPublic;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorites_public: newVal })
        .eq('id', userId);

      if (error) throw error;
      setProfile({ ...profile, favoritesPublic: newVal });
    } catch (e: any) {
      console.error('Error updating privacy:', e);
      setError('No se pudo actualizar privacidad');
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[11px] font-black uppercase tracking-[8px] text-slate-400 animate-pulse">
          Cargando MeCard...
        </p>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <AlertCircle size={64} className="text-rose-500 mb-4" />
        <p className="text-xl font-bold text-slate-800 mb-2">Error al cargar</p>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  const dailyLimitPercent = profile?.dailyLimit 
    ? Math.min((profile.spentToday / profile.dailyLimit) * 100, 100)
    : 0;

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
             {profile?.dailyLimit && (
               <p className="text-[9px] font-bold text-slate-400 mt-1">
                 Hoy: ${profile.spentToday.toFixed(2)} / ${profile.dailyLimit.toFixed(2)}
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

      {/* NAVIGATION */}
      <nav className="bg-white border-b border-slate-50 flex px-12 overflow-x-auto scrollbar-hide shrink-0 shadow-sm">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={18}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={18}/>} label="Explorar Catálogo" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={18}/>} label="Red Social" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={18}/>} label={`Mis Regalos (${activeGifts.length})`} />
      </nav>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 p-12">
        <div className="max-w-7xl mx-auto h-full">
          
          {/* TAB: WALLET */}
          {activeTab === 'wallet' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* CARD PRINCIPAL */}
                <div className="lg:col-span-8 bg-indigo-600 rounded-[56px] p-16 text-white shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-between group border border-white/10">
                  <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                    <Wallet size={300} strokeWidth={1} />
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <Badge variant="slate" className="bg-white/10 text-white border-white/20 mb-4">
                        Verified Student
                      </Badge>
                      <p className="font-mono text-2xl tracking-[6px] opacity-80">
                        {profile?.studentId}
                      </p>
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
                        Status: Active
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer">
                      <div className="w-32 h-32 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <p className="text-white text-xs text-center font-mono">
                          {profile?.credential?.qrCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[240px]">
                    <div className="flex items-center gap-4 text-rose-500">
                      <HeartPulse size={24}/>
                      <h3 className="font-black text-xs uppercase tracking-widest leading-none">
                        Nutritional Score
                      </h3>
                    </div>
                    <div>
                      <p className="text-6xl font-black text-slate-800 tracking-tighter mb-4">
                        92<span className="text-lg text-slate-300">/100</span>
                      </p>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center min-h-[140px] group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={120}/>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400 mb-2">
                      Smart Safety
                    </h4>
                    <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                      Límites configurados por tus padres.
                    </p>
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
                          <p className="font-black text-slate-800 text-lg italic leading-none mb-2">
                            Wishlist Pública
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Tus amigos ven tus favoritos.
                          </p>
                       </div>
                    </div>
                    <button 
                      onClick={togglePrivacy} 
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                    >
                       {profile?.favoritesPublic ? 'Privada' : 'Pública'}
                    </button>
                 </div>

                 <div className="bg-indigo-50 rounded-[40px] p-10 border border-indigo-100 flex items-center justify-between shadow-sm group">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-indigo-600 shadow-sm">
                          <Activity size={28}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-lg italic leading-none mb-2">
                            Historial
                          </p>
                          <p className="text-xs text-slate-500 font-medium italic">
                            Revisa tus compras.
                          </p>
                       </div>
                    </div>
                    <button className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm hover:scale-110 transition-all">
                       <ChevronRight size={24}/>
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: EXPLORAR CON BÚSQUEDA ✨ */}
          {activeTab === 'explore' && (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
              
              {/* HEADER CON BÚSQUEDA */}
              <div className="flex justify-between items-center gap-6">
                <div>
                  <h3 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
                    Cafetería
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[6px] mt-4">
                    {totalResults} {totalResults === 1 ? 'producto' : 'productos'} disponibles
                  </p>
                </div>
                
                {/* Buscador */}
                <div className="flex-1 max-w-md">
                  <ProductSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
              </div>
              
              {/* PANEL DE FILTROS */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                
                {/* Categorías */}
                <div>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">
                    Categorías
                  </p>
                  <CategoryFilter
                    categories={availableCategories}
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                  />
                </div>
                
                {/* Precio y Orden */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 max-w-xs w-full">
                    <PriceRangeFilter
                      min={0}
                      max={maxPrice}
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <SortSelector value={sortBy} onChange={setSortBy} />
                    
                    {isFiltering && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* RESULTADOS */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search size={48} className="text-slate-300" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">
                    No se encontraron productos
                  </h4>
                  <p className="text-slate-500 mb-6">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                  {isFiltering && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                    >
                      Mostrar Todos los Productos
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {filteredProducts.map(item => {
                    const isFav = profile?.favorites.includes(item.id);
                    
                    return (
                      <div key={item.id} className="bg-white p-6 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
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
                        
                        <div className="aspect-square bg-slate-50 rounded-[40px] mb-6 flex items-center justify-center overflow-hidden border border-slate-50">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                            <Badge variant="emerald">Stock OK</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REGALOS */}
          {activeTab === 'gifts' && (
             <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                <div className="text-center mb-16">
                  <h3 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter mb-4">
                    Mis Regalos
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[10px]">
                    Cupones listos para canjear
                  </p>
                </div>

                {activeGifts.length === 0 && (
                  <div className="py-40 bg-white rounded-[72px] border-4 border-dashed border-slate-100 text-center grayscale opacity-20 flex flex-col items-center">
                     <Gift size={100} strokeWidth={1} className="mb-6"/>
                     <p className="text-sm font-black uppercase tracking-[10px] italic">
                       Sin regalos pendientes
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
                     Red MeCard
                   </h3>
                   <p className="text-slate-400 font-medium text-sm mt-4 italic leading-relaxed">
                     Próximamente: busca amigos y envía regalos.
                   </p>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ERROR TOAST */}
      {error && (
        <div className="fixed bottom-8 right-8 bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 z-50">
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
              MeCard Engine v2.6
            </p>
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">
              Datos Protegidos
            </p>
         </div>
      </footer>
    </div>
  );
}
