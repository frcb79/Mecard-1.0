import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock,
  Zap, ShieldCheck, HeartPulse, X, Share2
} from 'lucide-react';

/**
 * NOTA: Para cumplir con el mandato de archivo único, 
 * los servicios y subcomponentes se definen aquí mismo.
 */

// --- MOCK / SERVICE LOGIC ---
// En una app real, esto vendría de supabaseClient.ts
const mockSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        or: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null })
        })
      }),
      single: async () => ({ data: { favorites: [] }, error: null })
    }),
    update: () => ({ eq: async () => ({ error: null }) })
  }),
  rpc: async () => ({ data: [], error: null })
};

const socialService = {
  async findPotentialFriend(schoolId: string, userId: string) {
    // Simulación de carga de perfil
    return { 
      data: {
        id: userId,
        full_name: "Estudiante MeCard",
        student_id: "ID-88291",
        balance: 1250.50,
        favorites: ['1', '3'],
        favorites_public: true
      }, 
      error: null 
    };
  },
  async getReceivedGifts(userId: string) {
    return { 
      data: [
        {
          id: 'g1',
          sender_id: 'u2',
          redemption_code: 'MC-8291',
          created_at: new Date().toISOString(),
          status: 'pending',
          item: { name: 'Combo Hamburguesa Premium', price: 15.00 },
          sender: { full_name: 'Carlos Pérez' }
        },
        {
          id: 'g2',
          sender_id: 'u3',
          redemption_code: 'MC-1102',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending',
          item: { name: 'Refresco Grande', price: 3.50 },
          sender: { full_name: 'Ana García' }
        }
      ], 
      error: null 
    };
  },
  async sendThankYouMessage(giftId: string, senderId: string, text: string) {
    console.log(`Gracias enviadas por ${giftId}: ${text}`);
    return true;
  },
  async updateProfile(userId: string, updates: any) {
    console.log(`Perfil actualizado para ${userId}`, updates);
    return true;
  },
  async toggleFavorite(userId: string, productId: string) {
    return ['1', '3', productId];
  }
};

const inventoryService = {
  async getInventory(schoolId: string) {
    return [
      { id: '1', name: 'Pizza Pepperoni', price: 12.00, category: 'Comida', image_url: '' },
      { id: '2', name: 'Ensalada César', price: 8.50, category: 'Saludable', image_url: '' },
      { id: '3', name: 'Jugo Natural', price: 4.00, category: 'Bebidas', image_url: '' },
      { id: '4', name: 'Brownie de Chocolate', price: 5.00, category: 'Postres', image_url: '' },
    ];
  }
};

// --- UI COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  };
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const MeCardSocial = ({ currentStudent, onSendGift }: any) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-black italic text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-indigo-600"/> RED SOCIAL
        </h3>
        <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Ver solicitudes</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 text-center">
        <div className="max-w-xs">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Search size={32} />
          </div>
          <p className="text-sm font-bold text-slate-800 mb-2">Busca a tus amigos</p>
          <p className="text-xs text-slate-400 mb-6">Encuentra a tus compañeros para ver qué les gusta y enviarles sorpresas.</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Nombre o ID del alumno..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-none text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function App({ userId = "mock-user", schoolId = "mock-school" }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'social' | 'gifts' | 'explore'>('wallet');
  const [myGifts, setMyGifts] = useState<GiftType[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [sendingComment, setSendingComment] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [userId, schoolId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await socialService.findPotentialFriend(schoolId, userId);
      if (profileData) setProfile(profileData);

      const { data: giftsData } = await socialService.getReceivedGifts(userId);
      setMyGifts(giftsData || []);

      const products = await inventoryService.getInventory(schoolId);
      setAllProducts(products);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!profile) return;
    try {
      const newFavorites = await socialService.toggleFavorite(userId, productId);
      setProfile({ ...profile, favorites: newFavorites });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavoritesPrivacy = async () => {
    if (!profile) return;
    const newVal = !profile.favorites_public;
    await socialService.updateProfile(userId, { favorites_public: newVal });
    setProfile({ ...profile, favorites_public: newVal });
  };

  const handleSendThankYou = async (gift: GiftType) => {
    const text = commentTexts[gift.id];
    if (!text?.trim()) return;

    setSendingComment(gift.id);
    try {
      await socialService.sendThankYouMessage(gift.id, gift.sender_id, text);
      setMyGifts(prev => prev.map(g => g.id === gift.id ? { ...g, thank_you_message: text } : g));
      setCommentTexts(prev => ({ ...prev, [gift.id]: '' }));
    } catch (e) {
      console.error('Error enviando agradecimiento:', e);
    } finally {
      setSendingComment(null);
    }
  };

  const healthScore = useMemo(() => Math.floor(Math.random() * (95 - 70 + 1)) + 70, []);

  if (loading && !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#fcfdfe] overflow-hidden font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white px-10 py-6 border-b border-slate-100 flex justify-between items-center z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter">Student Hub</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">MeCard Network</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Total</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter leading-none">${profile?.balance.toFixed(2)}</p>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
          <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative">
            <Bell size={20}/>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <div className="bg-white border-b border-slate-100 flex px-10 overflow-x-auto scrollbar-hide shrink-0">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={16}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={16}/>} label="Descubrir" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={16}/>} label="Amigos" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={16}/>} label="Mis Regalos" />
      </div>

      <main className="flex-1 overflow-y-auto bg-[#fcfdfe]">
        {/* VISTA: BILLETERA / INICIO */}
        {activeTab === 'wallet' && (
          <div className="p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* MeCard Principal */}
                <div className="lg:col-span-8 bg-indigo-600 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between group border border-white/10">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                      <Wallet size={200} />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                           <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">NETWORK ID</p>
                           <p className="font-mono text-xl tracking-[4px]">{profile?.student_id}</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                          <Zap size={28} className="text-yellow-400 fill-yellow-400"/>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">SALDO DISPONIBLE</p>
                        <h2 className="text-8xl font-black tracking-tighter leading-none">${profile?.balance.toFixed(2)}</h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-end pt-8 border-t border-white/10 mt-8">
                       <p className="text-xl font-black uppercase tracking-tighter italic opacity-80">{profile?.full_name}</p>
                       <div className="bg-white p-4 rounded-[24px] shadow-xl hover:scale-110 transition-transform cursor-pointer">
                         <QrCode size={36} className="text-slate-900" />
                       </div>
                    </div>
                </div>

                {/* Sidebar Bento: Salud */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-full">
                        <div className="flex items-center gap-4 text-rose-500 mb-4">
                            <HeartPulse size={24}/>
                            <h3 className="font-black text-xs uppercase tracking-widest italic">Health Score</h3>
                        </div>
                        <div>
                          <p className="text-5xl font-black text-slate-800 tracking-tighter mb-4">{healthScore}<span className="text-lg text-slate-300">/100</span></p>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${healthScore}%` }}></div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 italic tracking-widest">IA Health Analysis Active</p>
                    </div>
                </div>
             </div>

             {/* Configuración de Privacidad */}
             <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile?.favorites_public ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {profile?.favorites_public ? <Globe size={24} /> : <Lock size={24} />}
                   </div>
                   <div>
                      <p className="font-black text-slate-800 text-base italic">Privacidad de Wishlist</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {profile?.favorites_public 
                          ? 'Tus amigos pueden ver tus favoritos para darte mejores sorpresas.' 
                          : 'Tu lista de deseos es privada y nadie puede verla.'}
                      </p>
                   </div>
                </div>
                <Button onClick={toggleFavoritesPrivacy} variant="secondary" className="px-8 shadow-sm text-[10px] uppercase tracking-widest">
                  {profile?.favorites_public ? 'Hacer Privado' : 'Hacer Público'}
                </Button>
             </div>
          </div>
        )}

        {/* VISTA: CATÁLOGO / DESCUBRIR */}
        {activeTab === 'explore' && (
          <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
              <div>
                <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Descubrir</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[5px] mt-4 flex items-center gap-2">Explora y marca tus favoritos</p>
              </div>
              <div className="relative w-full md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                 <input placeholder="Filtrar catálogo..." className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {allProducts.map(product => {
                const isFavorite = profile?.favorites?.includes(product.id);
                return (
                  <div key={product.id} className="bg-white p-5 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all relative group">
                    <button 
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-11 h-11 rounded-[20px] bg-white/95 backdrop-blur shadow-md flex items-center justify-center transition-all active:scale-75 hover:scale-110 border border-slate-50"
                    >
                      <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'} />
                    </button>
                    <div className="aspect-square bg-slate-50 rounded-[32px] mb-5 overflow-hidden flex items-center justify-center border border-slate-50 shadow-inner">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <ShoppingBag className="text-slate-200" size={50} strokeWidth={1}/>
                      )}
                    </div>
                    <div className="px-2">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 leading-none">{product.category}</p>
                        <h4 className="font-black text-slate-800 text-sm mb-3 truncate leading-tight italic">{product.name}</h4>
                        <div className="flex justify-between items-center">
                           <p className="font-black text-emerald-600 text-lg tracking-tighter leading-none">${product.price}</p>
                           <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300 group-hover:text-indigo-600 transition-colors">
                              <ChevronRight size={16}/>
                           </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA: RED SOCIAL */}
        {activeTab === 'social' && (
          <div className="h-full p-10 max-w-7xl mx-auto">
            <MeCardSocial 
              currentStudent={profile} 
              onSendGift={() => loadStudentData()} 
            />
          </div>
        )}

        {/* VISTA: REGALOS RECIBIDOS (Audit Log) */}
        {activeTab === 'gifts' && (
          <div className="p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center px-4">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Regalos</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[5px] mt-3 italic leading-none">Historial de detalles recibidos</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">
                      {myGifts.length} Pendientes
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {myGifts.map(gift => (
                  <div key={gift.id} className="bg-white rounded-[56px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 transition-all hover:shadow-2xl group border-l-4 border-l-indigo-600/20 hover:border-l-indigo-600">
                     <div className="flex gap-8 items-center md:w-1/2 relative">
                        <div className="w-32 h-32 bg-indigo-50/50 rounded-[44px] flex items-center justify-center text-indigo-600 relative shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-500 border border-indigo-100/50">
                            <ShoppingBag size={56} strokeWidth={1.5} />
                            <div className="absolute -top-3 -right-3 bg-rose-500 text-white p-3 rounded-2xl shadow-xl ring-4 ring-white">
                               <Gift size={24} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                               <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><User size={10}/></div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate leading-none">
                                  Enviado por: <span className="text-indigo-600 font-black">{(gift as any).sender?.full_name || 'Amigo Anónimo'}</span>
                               </p>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 mb-6 truncate tracking-tight italic">{gift.item?.name}</h4>
                            <div className="flex items-center gap-6">
                                <div className="bg-slate-900 px-8 py-5 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group/code">
                                   <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-50 group-hover/code:opacity-100 transition-opacity"></div>
                                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[5px] mb-2 leading-none">REDEMPTION CODE</p>
                                   <p className="text-4xl font-black text-indigo-400 tracking-[8px] font-mono leading-none">{gift.redemption_code}</p>
                                </div>
                                <div className="text-slate-300 flex flex-col items-center shrink-0">
                                   <Clock size={20} strokeWidth={2.5}/>
                                   <p className="text-[8px] font-black uppercase mt-2 tracking-widest leading-none">{new Date(gift.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0 md:pl-12">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3">
                              <MessageSquare size={16} className="text-indigo-400" /> Agradecimiento
                           </p>
                           <Share2 size={16} className="text-slate-200 cursor-pointer hover:text-indigo-400 transition-colors"/>
                        </div>
                        <div className="relative">
                           {gift.thank_you_message ? (
                             <div className="bg-emerald-50/50 p-8 rounded-[36px] border border-emerald-100 text-sm font-bold text-emerald-800 italic shadow-inner relative overflow-hidden group/msg">
                               <div className="absolute -top-6 -right-6 text-emerald-100/30 rotate-12 transition-transform group-hover/msg:scale-125 duration-700">
                                 <MessageSquare size={100} fill="currentColor"/>
                               </div>
                               <span className="relative z-10">"{gift.thank_you_message}"</span>
                             </div>
                           ) : (
                             <div className="relative">
                               <textarea 
                                   placeholder="Envía un mensaje para agradecer..."
                                   className="w-full bg-slate-50 border-none rounded-[40px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100/50 resize-none h-32 shadow-inner transition-all placeholder:text-slate-300 placeholder:italic"
                                   value={commentTexts[gift.id] || ''}
                                   onChange={(e) => setCommentTexts(prev => ({ ...prev, [gift.id]: e.target.value }))}
                               />
                               <button 
                                   onClick={() => handleSendThankYou(gift)}
                                   disabled={sendingComment === gift.id || !commentTexts[gift.id]?.trim()}
                                   className="absolute bottom-5 right-5 w-14 h-14 bg-indigo-600 text-white rounded-[24px] shadow-2xl hover:bg-indigo-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-90 flex items-center justify-center group/btn shadow-indigo-100"
                               >
                                   {sendingComment === gift.id ? (
                                     <RefreshCw size={24} className="animate-spin" />
                                   ) : (
                                     <Send size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                                   )}
                               </button>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}

                {myGifts.length === 0 && (
                  <div className="py-40 bg-white rounded-[80px] border-4 border-dashed border-slate-100 text-center flex flex-col items-center justify-center grayscale opacity-10">
                     <Gift size={100} className="text-slate-300 mb-10" strokeWidth={1}/>
                     <p className="text-slate-500 font-black uppercase text-base tracking-[12px] italic leading-none">Tu buzón está vacío</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-6 flex items-center gap-4 border-b-[6px] transition-all font-black text-[10px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
  >
    <span className={`${active ? 'scale-110 rotate-3 transition-transform duration-300' : ''}`}>{icon}</span> {label}
  </button>
);
