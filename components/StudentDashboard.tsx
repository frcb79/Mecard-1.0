
import React, { useState, useEffect } from 'react';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock,
  Zap, ArrowUpRight, TrendingUp, ShieldCheck
} from 'lucide-react';
import { socialService } from '../services/supabaseSocial';
import { inventoryService } from '../services/supabaseInventory';
import { Friend, Gift as GiftType, Transaction } from '../types';
import { MeCardSocial } from './MeCardSocial';
import { Button } from './Button';

interface StudentDashboardProps {
  userId: string;
  schoolId: string;
  transactions?: Transaction[];
}

export default function StudentDashboard({ userId, schoolId, transactions = [] }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'social' | 'gifts' | 'explore'>('wallet');
  const [myGifts, setMyGifts] = useState<GiftType[]>([]);
  const [profile, setProfile] = useState<Friend | null>(null);
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

      const products = await inventoryService.getInventory('all');
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
      setCommentTexts(prev => ({ ...prev, [gift.id]: '' }));
      alert('¡Mensaje de agradecimiento enviado!');
    } catch (e) {
      console.error('Error enviando agradecimiento:', e);
    } finally {
      setSendingComment(null);
    }
  };

  if (loading && !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="bg-white px-10 py-6 border-b border-slate-200 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter">Student Hub</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Ecosistema Social MeCard</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Total</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${profile?.balance.toFixed(2)}</p>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
          <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative">
            <Bell size={20}/>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-100 flex px-10 overflow-x-auto scrollbar-hide shrink-0">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={16}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={16}/>} label="Descubrir" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={16}/>} label="Círculo Social" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={16}/>} label="Mis Regalos" />
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        {activeTab === 'wallet' && (
          <div className="p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Card */}
                <div className="lg:col-span-2 bg-indigo-600 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Wallet size={200} /></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                           <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">ID ESTUDIANTE</p>
                           <p className="font-mono text-xl tracking-[2px]">{profile?.student_id}</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl"><Zap size={28} className="text-yellow-400 fill-yellow-400"/></div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">SALDO DISPONIBLE</p>
                        <h2 className="text-8xl font-black tracking-tighter leading-none">${profile?.balance.toFixed(2)}</h2>
                    </div>
                    <div className="relative z-10 flex justify-between items-end pt-8 border-t border-white/10 mt-8">
                       <p className="text-2xl font-black uppercase tracking-tighter italic">{profile?.full_name}</p>
                       <div className="bg-white p-4 rounded-3xl shadow-xl hover:scale-110 transition-transform cursor-pointer"><QrCode size={40} className="text-slate-900" /></div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 text-indigo-600 mb-6">
                            <TrendingUp size={24}/>
                            <h3 className="font-black text-xs uppercase tracking-widest">Límite Diario</h3>
                        </div>
                        <p className="text-4xl font-black text-slate-800 tracking-tighter mb-4">$200.00</p>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 w-[65%] rounded-full shadow-lg"></div>
                        </div>
                    </div>
                    <div className="bg-emerald-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={100}/></div>
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-emerald-400 mb-4">PROTECCIÓN MECARD</p>
                        <p className="text-sm font-medium leading-relaxed">Tu cuenta está blindada con cifrado bancario 256-bit.</p>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[40px] p-8 border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile?.favorites_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {profile?.favorites_public ? <Globe size={24} /> : <Lock size={24} />}
                   </div>
                   <div>
                      <p className="font-black text-slate-800 text-base">Visibilidad de Wishlist</p>
                      <p className="text-xs text-slate-500 font-medium">{profile?.favorites_public ? 'Tus amigos pueden ver tus favoritos para enviarte regalos.' : 'Tu lista de deseos es totalmente privada.'}</p>
                   </div>
                </div>
                <Button onClick={toggleFavoritesPrivacy} variant="secondary" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8">
                  {profile?.favorites_public ? 'Ocultar' : 'Hacer Público'}
                </Button>
             </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end px-4">
              <div>
                <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">Catálogo Digital</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[5px] mt-2 flex items-center gap-2"><Star size={12} className="text-amber-400 fill-amber-400"/> Crea tu wishlist marcando tus favoritos</p>
              </div>
              <div className="relative w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                 <input placeholder="Buscar..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {allProducts.map(product => {
                const isFavorite = profile?.favorites?.includes(product.id);
                return (
                  <div key={product.id} className="bg-white p-5 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all relative group">
                    <button 
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all active:scale-75 group-hover:scale-110"
                    >
                      <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'} />
                    </button>
                    <div className="aspect-square bg-slate-50 rounded-[32px] mb-5 overflow-hidden flex items-center justify-center border border-slate-50">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ShoppingBag className="text-slate-200" size={50} />
                      )}
                    </div>
                    <div className="px-2">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.category}</p>
                        <h4 className="font-black text-slate-800 text-base mb-2 truncate leading-tight">{product.name}</h4>
                        <div className="flex justify-between items-center">
                           <p className="font-black text-emerald-600 text-xl tracking-tighter">${product.price}</p>
                           <button className="p-2 bg-slate-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="h-[calc(100vh-140px)]">
            <MeCardSocial 
              currentStudent={profile} 
              allStudents={[]} 
              onSendGift={() => loadStudentData()} 
            />
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center px-4">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">Mis Regalos</h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[5px] mt-2 italic">Detalles enviados por tu red de amigos</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">{myGifts.length} Disponibles</span>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {myGifts.map(gift => (
                  <div key={gift.id} className="bg-white rounded-[56px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 transition-all hover:shadow-2xl group">
                     {/* Info Section */}
                     <div className="flex gap-8 items-center md:w-1/2 relative">
                        <div className="w-32 h-32 bg-indigo-50 rounded-[44px] flex items-center justify-center text-indigo-600 relative shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-500">
                            <ShoppingBag size={56} strokeWidth={1.5} />
                            <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-xl animate-bounce">
                               <Gift size={24} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                               <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><User size={12}/></div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                  Enviado por: <span className="text-indigo-600 font-black">{(gift as any).sender?.full_name || 'Un Amigo'}</span>
                               </p>
                            </div>
                            <h4 className="text-3xl font-black text-slate-800 mb-6 truncate tracking-tight">{gift.item?.name}</h4>
                            <div className="flex items-center gap-6">
                                <div className="bg-slate-900 px-8 py-5 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
                                   <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[4px] mb-2">CÓDIGO DE CANJE</p>
                                   <p className="text-4xl font-black text-indigo-400 tracking-[8px] font-mono leading-none">{gift.redemption_code}</p>
                                </div>
                                <div className="text-slate-300 flex flex-col items-center">
                                   <Clock size={24} />
                                   <p className="text-[8px] font-black uppercase mt-2 tracking-widest">{new Date(gift.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Gratitude Section */}
                     <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0 md:pl-12">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3">
                              <MessageSquare size={16} className="text-indigo-400" /> Enviar Agradecimiento
                           </p>
                           <Star size={18} className="text-amber-400 fill-amber-400 opacity-20 group-hover:opacity-100 transition-opacity duration-1000"/>
                        </div>
                        <div className="relative">
                           <textarea 
                              placeholder="Escribe un mensaje de agradecimiento aquí..."
                              className="w-full bg-slate-50 border-none rounded-[32px] p-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 resize-none h-28 shadow-inner transition-all"
                              value={commentTexts[gift.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [gift.id]: e.target.value }))}
                           />
                           <button 
                              onClick={() => handleSendThankYou(gift)}
                              disabled={sendingComment === gift.id || !commentTexts[gift.id]?.trim()}
                              className="absolute bottom-5 right-5 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:bg-indigo-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-90 flex items-center justify-center group/btn"
                           >
                              {sendingComment === gift.id ? <RefreshCw size={24} className="animate-spin" /> : <Send size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
                
                {myGifts.length === 0 && (
                  <div className="py-40 bg-white rounded-[72px] border-4 border-dashed border-slate-100 text-center flex flex-col items-center justify-center grayscale opacity-20">
                     <Gift size={100} className="text-slate-300 mb-8" strokeWidth={1}/>
                     <p className="text-slate-500 font-black uppercase text-sm tracking-[10px] italic">Buzón de regalos vacío</p>
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
    className={`px-8 py-6 flex items-center gap-4 border-b-4 transition-all font-black text-[10px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
  >
    <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span> {label}
  </button>
);
