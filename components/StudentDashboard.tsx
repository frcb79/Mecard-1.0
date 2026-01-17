import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock,
  Zap, ArrowUpRight, ShieldCheck, HeartPulse 
} from 'lucide-react';

// --- IMPORTANTE: Estas rutas deben existir en tu proyecto de Vercel ---
// Si los servicios están en otra ubicación, ajusta las rutas.
import { socialService } from '../services/supabaseSocial';
import { inventoryService } from '../services/supabaseInventory';

// --- TYPES (Basados en tu estructura) ---
interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  description: string;
  created_at: string;
}

interface GiftType {
  id: string;
  sender_id: string;
  sender?: { full_name: string };
  item: { name: string; price: number };
  redemption_code: string;
  created_at: string;
}

interface Profile {
  id: string;
  student_id: string;
  full_name: string;
  balance: number;
  favorites: string[];
  favorites_public: boolean;
  school_id: string;
}

interface StudentDashboardProps {
  userId: string;
  schoolId: string;
  transactions?: Transaction[];
}

// --- COMPONENTES AUXILIARES ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border-2 border-slate-200 text-slate-600 hover:bg-slate-50'
  };
  return (
    <button 
      disabled={disabled || loading}
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {loading ? <RefreshCw className="animate-spin" size={14} /> : children}
    </button>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-6 flex items-center gap-4 border-b-4 transition-all font-black text-[10px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
  >
    <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span> {label}
  </button>
);

export default function StudentDashboard({ userId, schoolId, transactions = [] }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'social' | 'gifts' | 'explore'>('wallet');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myGifts, setMyGifts] = useState<GiftType[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para interacción de comentarios
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [sendingComment, setSendingComment] = useState<string | null>(null);

  // 1. CARGA DE DATOS REALES DESDE SUPABASE
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar Perfil
        const { data: profileData } = await socialService.findPotentialFriend(schoolId, userId);
        if (profileData) setProfile(profileData);

        // Cargar Regalos Recibidos
        const { data: giftsData } = await socialService.getReceivedGifts(userId);
        setMyGifts(giftsData || []);

        // Cargar Catálogo de Productos
        const products = await inventoryService.getInventory('all');
        setAllProducts(products || []);
      } catch (error) {
        console.error("Error cargando datos de Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, schoolId]);

  // 2. FUNCIONALIDADES DE WISHLIST Y PRIVACIDAD
  const handleToggleFavorite = async (productId: string) => {
    if (!profile) return;
    try {
      const newFavorites = await socialService.toggleFavorite(userId, productId);
      setProfile({ ...profile, favorites: newFavorites });
    } catch (e) {
      console.error("Error toggle favorite:", e);
    }
  };

  const toggleFavoritesPrivacy = async () => {
    if (!profile) return;
    const newVal = !profile.favorites_public;
    try {
      await socialService.updateProfile(userId, { favorites_public: newVal });
      setProfile({ ...profile, favorites_public: newVal });
    } catch (e) {
      console.error("Error updating privacy:", e);
    }
  };

  // 3. AGRADECIMIENTOS
  const handleSendThankYou = async (gift: GiftType) => {
    const text = commentTexts[gift.id];
    if (!text?.trim()) return;

    setSendingComment(gift.id);
    try {
      await socialService.sendThankYouMessage(gift.id, gift.sender_id, text);
      setCommentTexts(prev => ({ ...prev, [gift.id]: '' }));
      // Nota: Evitamos alert() por UX, pero aquí confirmamos la acción
    } catch (e) {
      console.error('Error enviando agradecimiento:', e);
    } finally {
      setSendingComment(null);
    }
  };

  // Score simulado por ahora (puedes conectarlo a un servicio de salud si existe)
  const healthScore = useMemo(() => 88, []);

  if (loading && !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-400 italic">Conectando con MeCard Cloud...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* HEADER DINÁMICO */}
      <header className="bg-white px-10 py-6 border-b border-slate-200 flex justify-between items-center z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter leading-none">Student Hub</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mt-1">MeCard Social Network</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Balance</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${profile?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative">
            <Bell size={20}/>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="bg-white border-b border-slate-100 flex px-10 overflow-x-auto scrollbar-hide shrink-0">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={16}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={16}/>} label="Descubrir" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={16}/>} label="Amigos" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={16}/>} label="Regalos" />
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc]/50">
        
        {/* TAB: BILLETERA */}
        {activeTab === 'wallet' && (
          <div className="p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* PASAPORTE ESTUDIANTIL (Tarjeta) */}
              <div className="lg:col-span-8 bg-indigo-600 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden min-h-[350px] flex flex-col justify-between group border border-white/10">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Wallet size={200} />
                </div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">NETWORK ID</p>
                    <p className="font-mono text-xl tracking-[4px]">{profile?.student_id || '---- ----'}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                    <Zap size={28} className="text-yellow-400 fill-yellow-400"/>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">SALDO DISPONIBLE</p>
                  <h2 className="text-8xl font-black tracking-tighter leading-none">${profile?.balance?.toFixed(2)}</h2>
                </div>

                <div className="relative z-10 flex justify-between items-end pt-8 border-t border-white/10 mt-8">
                  <div>
                    <p className="text-xl font-black uppercase tracking-tighter italic opacity-80">{profile?.full_name}</p>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Estudiante Certificado</p>
                  </div>
                  <div className="bg-white p-5 rounded-[24px] shadow-xl hover:scale-110 transition-transform cursor-pointer">
                    <QrCode size={36} className="text-slate-900" />
                  </div>
                </div>
              </div>

              {/* SIDEBAR BENTO */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-[200px]">
                  <div className="flex items-center gap-4 text-rose-500 mb-4">
                    <HeartPulse size={24}/>
                    <h3 className="font-black text-xs uppercase tracking-widest">Health Score</h3>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter mb-4">{healthScore}<span className="text-lg text-slate-300">/100</span></p>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${healthScore}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[160px]">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={100}/></div>
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-indigo-400 mb-4">Seguridad Activa</p>
                  <p className="text-sm font-medium leading-relaxed opacity-90 italic">Control de gastos habilitado por institución.</p>
                </div>
              </div>
            </div>

            {/* PRIVACIDAD DE WISHLIST */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile?.favorites_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {profile?.favorites_public ? <Globe size={24} /> : <Lock size={24} />}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base italic">Privacidad de Deseos</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {profile?.favorites_public ? 'Tus amigos pueden ver qué regalos te gustaría recibir.' : 'Tu wishlist es actualmente privada.'}
                  </p>
                </div>
              </div>
              <Button onClick={toggleFavoritesPrivacy} variant="secondary">
                {profile?.favorites_public ? 'Hacer Privado' : 'Hacer Público'}
              </Button>
            </div>
          </div>
        )}

        {/* TAB: EXPLORAR / WISHLIST */}
        {activeTab === 'explore' && (
          <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end px-4">
              <div>
                <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Catálogo</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[5px] mt-3">Marca con corazón para añadir a tu lista de deseos</p>
              </div>
              <div className="relative w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                 <input placeholder="Buscar producto..." className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {allProducts.map(product => {
                const isFavorite = profile?.favorites?.includes(product.id);
                return (
                  <div key={product.id} className="bg-white p-5 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
                    <button 
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-75"
                    >
                      <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-200'} />
                    </button>
                    <div className="aspect-square bg-slate-50 rounded-[32px] mb-5 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBag size={40} /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.category || 'Categoría'}</p>
                      <h4 className="font-black text-slate-800 text-sm mb-3 truncate leading-tight italic">{product.name}</h4>
                      <p className="font-black text-emerald-600 text-lg tracking-tighter">${product.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: REGALOS RECIBIDOS */}
        {activeTab === 'gifts' && (
          <div className="p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none mb-10 px-4">Mis Regalos</h3>
            
            <div className="grid grid-cols-1 gap-8">
              {myGifts.map(gift => (
                <div key={gift.id} className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 group hover:shadow-2xl transition-all">
                  
                  {/* Info del Regalo */}
                  <div className="flex gap-8 items-center md:w-1/2">
                    <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 relative shrink-0">
                      <ShoppingBag size={56} />
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-xl animate-bounce">
                        <Gift size={24} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        De: <span className="text-indigo-600 font-black">{gift.sender?.full_name || 'Un Amigo'}</span>
                      </p>
                      <h4 className="text-3xl font-black text-slate-800 mb-6 tracking-tight italic leading-none">{gift.item.name}</h4>
                      <div className="bg-slate-900 px-8 py-5 rounded-[32px] border border-white/5 shadow-2xl inline-block">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[4px] mb-2">CÓDIGO CANJE</p>
                        <p className="text-4xl font-black text-indigo-400 tracking-[8px] font-mono leading-none">{gift.redemption_code}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acción de Agradecimiento */}
                  <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0 md:pl-12">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3 mb-4">
                      <MessageSquare size={16} className="text-indigo-400" /> Dar las gracias
                    </p>
                    <div className="relative">
                      <textarea 
                        placeholder="Escribe un mensaje..."
                        value={commentTexts[gift.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [gift.id]: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-[32px] p-6 text-sm font-bold text-slate-700 outline-none h-28 resize-none shadow-inner focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                      <button 
                        onClick={() => handleSendThankYou(gift)}
                        disabled={sendingComment === gift.id || !commentTexts[gift.id]?.trim()}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl disabled:opacity-20 transition-all active:scale-90"
                      >
                        {sendingComment === gift.id ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {myGifts.length === 0 && (
                <div className="py-40 bg-white rounded-[72px] border-4 border-dashed border-slate-100 text-center grayscale opacity-20 flex flex-col items-center">
                  <Gift size={80} className="mb-6" strokeWidth={1} />
                  <p className="font-black uppercase tracking-[10px] text-sm italic">Tu buzón está vacío</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: AMIGOS (MeCardSocial) */}
        {activeTab === 'social' && (
          <div className="h-full">
            {/* Aquí asumo que tu MeCardSocial ya está configurado para Supabase */}
            <p className="text-center p-20 font-black uppercase text-slate-300 tracking-[5px]">Integra aquí tu MeCardSocial.tsx</p>
          </div>
        )}

      </main>
    </div>
  );
}
