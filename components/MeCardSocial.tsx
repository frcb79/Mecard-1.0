
import React, { useState, useEffect } from 'react';
import { 
  Users, Heart, Gift, Search, Star, Lock, Globe, UserPlus, Zap, X, 
  ShoppingBag, AlertCircle, CheckCircle, Loader2, Trash2
} from 'lucide-react';
import { socialService } from '../services/supabaseSocial';
import { inventoryService } from '../services/supabaseInventory';
import { Friend, Product } from '../types';
import { Button } from './Button';

export const MeCardSocial: React.FC<{ 
  currentStudent: any; 
  allStudents: any[]; 
  onSendGift: (recipientId: string, productId: string) => void;
}> = ({ currentStudent, allStudents, onSendGift }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendFavorites, setFriendFavorites] = useState<any[]>([]);
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendSearch, setAddFriendSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [searching, setSearching] = useState(false);
  
  const [sendingGift, setSendingGift] = useState(false);
  const [giftStatus, setGiftStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    code?: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    loadFriends();
  }, [currentStudent.id]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await socialService.getFriends(currentStudent.id);
      setFriends(data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFriend = async () => {
    if (!addFriendSearch.trim()) return;
    setSearching(true);
    // Fix: Destructure 'data' from the result of findPotentialFriend to set state correctly
    const { data } = await socialService.findPotentialFriend(currentStudent.schoolId, addFriendSearch.trim());
    setSearchResult(data);
    setSearching(false);
  };

  const handleAddFriend = async (friend: Friend) => {
    try {
      await socialService.addFriend(currentStudent.id, friend.id);
      setShowAddFriend(false);
      loadFriends();
      setGiftStatus({ type: 'success', message: `¡${friend.full_name} agregado!` });
      setTimeout(() => setGiftStatus({ type: null, message: '' }), 3000);
    } catch (err: any) {
      setGiftStatus({ type: 'error', message: err.message });
    }
  };

  const handleGiftPurchase = async (product: any) => {
    if (!selectedFriend) return;
    setSendingGift(true);
    try {
      const { code } = await socialService.sendGift(
        currentStudent.id,
        selectedFriend.id,
        { id: product.id, name: product.name, price: product.price },
        currentStudent.schoolId,
        `¡Para ti! 🎁`
      );
      setGiftStatus({ type: 'success', message: `¡Regalo enviado!`, code });
      onSendGift(selectedFriend.id, product.id);
    } catch (err: any) {
      setGiftStatus({ type: 'error', message: err.message });
    } finally {
      setSendingGift(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-full text-indigo-500 animate-pulse"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden font-sans relative">
      {/* Listado lateral de amigos */}
      <div className="w-1/3 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white italic">Amigos</h2>
              <button onClick={() => setShowAddFriend(true)} className="p-2 bg-indigo-600 text-white rounded-xl"><UserPlus size={18}/></button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
              <input 
                className="w-full pl-8 pr-4 py-2 bg-white/5 border-none rounded-xl text-xs text-white outline-none" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {filteredFriends.map(f => (
             <button key={f.id} onClick={() => setSelectedFriend(f)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedFriend?.id === f.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">{f.full_name[0]}</div>
                <div className="text-left truncate">
                   <p className="text-xs font-black">{f.full_name}</p>
                   <p className="text-[9px] opacity-50 uppercase">{f.grade}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Panel de Perfil/Regalo */}
      <div className="flex-1 flex flex-col bg-slate-950/50 relative">
        {selectedFriend ? (
          <div className="p-8 h-full flex flex-col animate-in slide-in-from-right-4">
             <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl">{selectedFriend.full_name[0]}</div>
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter">{selectedFriend.full_name}</h3>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedFriend.grade}</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-6">Sugerencias para Regalo</h4>
                <div className="grid grid-cols-2 gap-4">
                   {allStudents[0] && ( // Mocking items
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center group hover:border-indigo-500 transition-all">
                         <div className="w-full aspect-square bg-slate-800 rounded-2xl mb-4"></div>
                         <p className="text-white text-xs font-bold mb-3">Snack Sorpresa</p>
                         <Button onClick={() => handleGiftPurchase({id: '1', name: 'Snack', price: 25})} size="sm" className="w-full text-[9px] uppercase font-black">Enviar 🎁</Button>
                      </div>
                   )}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
             <Users size={64} className="opacity-10 mb-4" />
             <p className="font-black uppercase text-[10px] tracking-[5px]">Selecciona un amigo</p>
          </div>
        )}
        
        {giftStatus.message && (
          <div className="absolute bottom-8 left-8 right-8 animate-in slide-in-from-bottom-4">
             <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${giftStatus.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100' : 'bg-rose-950/90 border-rose-500 text-rose-100'}`}>
                {giftStatus.type === 'success' ? <CheckCircle className="text-emerald-400"/> : <AlertCircle className="text-rose-400"/>}
                <div className="flex-1">
                   <p className="text-xs font-black">{giftStatus.message}</p>
                   {giftStatus.code && <p className="font-mono text-lg font-black tracking-widest mt-1">CÓDIGO: {giftStatus.code}</p>}
                </div>
                <button onClick={() => setGiftStatus({type: null, message: ''})}><X size={16}/></button>
             </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Amigo */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
           <div className="bg-white rounded-[40px] p-10 w-full max-sm relative">
              <button onClick={() => setShowAddFriend(false)} className="absolute top-8 right-8 text-slate-300"><X/></button>
              <h3 className="text-2xl font-black mb-8 italic">Vincular Amigo</h3>
              <div className="space-y-6">
                 <input 
                   className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-indigo-600" 
                   placeholder="ID de Alumno..."
                   value={addFriendSearch}
                   onChange={e => setAddFriendSearch(e.target.value)}
                 />
                 <Button onClick={handleSearchFriend} className="w-full" disabled={searching}>{searching ? 'Buscando...' : 'Localizar'}</Button>
                 {searchResult && (
                    <div className="p-4 bg-indigo-50 rounded-2xl flex items-center justify-between animate-in zoom-in">
                       <p className="text-sm font-black">{searchResult.full_name}</p>
                       <button onClick={() => handleAddFriend(searchResult)} className="p-2 bg-indigo-600 text-white rounded-xl"><UserPlus size={16}/></button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
