
import React, { useState, useEffect } from 'react';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock
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
  
  // Estado para gestionar los comentarios de agradecimiento
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

      // Cargar productos para que el alumno pueda marcar favoritos
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
      {/* Header */}
      <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 italic">MeCard Social</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mi Espacio</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
            <p className="text-lg font-black text-emerald-600">${profile?.balance.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 flex px-8 overflow-x-auto scrollbar-hide shrink-0">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={14}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={14}/>} label="Catálogo" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={14}/>} label="Amigos" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={14}/>} label="Mis Regalos" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* VISTA: BILLETERA */}
        {activeTab === 'wallet' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={150} /></div>
                <div className="relative z-10">
                   <p className="text-indigo-200 font-black uppercase text-[9px] mb-2">ID: {profile?.student_id}</p>
                   <h2 className="text-5xl font-black mb-10">${profile?.balance.toFixed(2)}</h2>
                   <div className="flex justify-between items-end">
                      <p className="text-lg font-black uppercase">{profile?.full_name}</p>
                      <div className="bg-white p-2 rounded-xl shadow-lg"><QrCode size={30} className="text-slate-900" /></div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] p-6 border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile?.favorites_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {profile?.favorites_public ? <Globe size={20} /> : <Lock size={20} />}
                   </div>
                   <div>
                      <p className="font-black text-slate-800 text-sm">Privacidad de Favoritos</p>
                      <p className="text-xs text-slate-400">{profile?.favorites_public ? 'Tus amigos pueden ver qué te gusta.' : 'Tu lista de deseos es privada.'}</p>
                   </div>
                </div>
                <Button onClick={toggleFavoritesPrivacy} variant="secondary" size="sm" className="rounded-xl font-black text-[10px] uppercase">
                  {profile?.favorites_public ? 'Hacer Privado' : 'Hacer Público'}
                </Button>
             </div>
          </div>
        )}

        {/* VISTA: CATÁLOGO PARA FAVORITOS */}
        {activeTab === 'explore' && (
          <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end px-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase">Explorar Catálogo</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[4px]">Marca con ❤️ los productos que te gustaría recibir</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map(product => {
                const isFavorite = profile?.favorites?.includes(product.id);
                return (
                  <div key={product.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
                    <button 
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all active:scale-75"
                    >
                      <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'} />
                    </button>
                    <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="text-slate-200" size={40} />
                      )}
                    </div>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{product.category}</p>
                    <h4 className="font-black text-slate-800 text-sm mb-1 truncate">{product.name}</h4>
                    <p className="font-black text-emerald-600 text-base">${product.price}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA: SOCIAL */}
        {activeTab === 'social' && (
          <div className="h-[calc(100vh-140px)]">
            <MeCardSocial 
              currentStudent={profile} 
              allStudents={[]} 
              onSendGift={() => loadStudentData()} 
            />
          </div>
        )}

        {/* VISTA: REGALOS RECIBIDOS */}
        {activeTab === 'gifts' && (
          <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center px-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Mis Regalos Recibidos</h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[4px] mt-1 italic">Historial de detalles y canjes</p>
                </div>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black">{myGifts.length} Disponibles</span>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {myGifts.map(gift => (
                  <div key={gift.id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-md flex flex-col md:flex-row gap-8 transition-all hover:shadow-lg">
                     {/* Info del Producto */}
                     <div className="flex gap-6 items-center md:w-1/2">
                        <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 relative shrink-0 shadow-inner">
                            <ShoppingBag size={40} />
                            <div className="absolute -top-1 -right-1 bg-rose-500 text-white p-1.5 rounded-xl shadow-lg">
                               <Gift size={16} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <User size={12} className="text-indigo-400" />
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Enviado por: <span className="text-indigo-600">{(gift as any).sender?.full_name || 'Un amigo'}</span>
                               </p>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">{gift.item?.name}</h4>
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                   <p className="text-[7px] font-black text-slate-400 uppercase">Código Canje</p>
                                   <p className="text-xl font-black text-indigo-600 tracking-[4px] font-mono leading-none">{gift.redemption_code}</p>
                                </div>
                                <div className="text-slate-300 flex flex-col items-center">
                                   <Clock size={20} />
                                   <p className="text-[7px] font-black uppercase mt-0.5">{new Date(gift.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Interfaz de Agradecimiento */}
                     <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <MessageSquare size={14} className="text-indigo-400" /> Enviar Agradecimiento
                        </p>
                        <div className="relative">
                           <textarea 
                              placeholder="¡Muchas gracias por el detalle!..."
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-100 resize-none h-20 shadow-inner"
                              value={commentTexts[gift.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [gift.id]: e.target.value }))}
                           />
                           <button 
                              onClick={() => handleSendThankYou(gift)}
                              disabled={sendingComment === gift.id || !commentTexts[gift.id]?.trim()}
                              className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all active:scale-90"
                           >
                              {sendingComment === gift.id ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
                
                {myGifts.length === 0 && (
                  <div className="py-20 bg-white rounded-[56px] border-4 border-dashed border-slate-100 text-center flex flex-col items-center">
                     <Gift size={64} className="text-slate-100 mb-6" strokeWidth={1}/>
                     <p className="text-slate-400 font-black uppercase text-[10px] tracking-[6px] italic">Aún no has recibido regalos</p>
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
    className={`px-6 py-4 flex items-center gap-3 border-b-2 transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
  >
    {icon} {label}
  </button>
);
