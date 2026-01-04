
import React, { useState, useMemo } from 'react';
import { 
  Heart, X, Star, Gift, Sparkles, Zap, TrendingUp, 
  Users, Crown, Medal, Trophy, Target, Fire, Info
} from 'lucide-react';
import { StudentProfile, Product } from '../types';
import { PRODUCTS } from '../constants';

interface MeCardSocialProps {
  currentStudent: StudentProfile;
  allStudents: StudentProfile[];
  // Fix: Prop type should match App.tsx which expects (recipientId, productId)
  onSendGift: (recipientId: string, productId: string) => void;
}

export const MeCardSocial: React.FC<MeCardSocialProps> = ({
  currentStudent,
  allStudents,
  onSendGift
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<StudentProfile | null>(null);
  const [animating, setAnimating] = useState<'like' | 'pass' | null>(null);

  const potentialFriends = useMemo(() => {
    return allStudents.filter(s => 
      s.id !== currentStudent.id &&
      s.schoolId === currentStudent.schoolId &&
      s.status === 'Active'
    );
  }, [allStudents, currentStudent]);

  const currentFriend = potentialFriends[currentIndex];

  const giftProducts = useMemo(() => {
    return PRODUCTS.filter(p => 
      p.price <= 50
    ).slice(0, 6);
  }, []);

  const handleSwipe = (action: 'like' | 'pass') => {
    setAnimating(action);
    setTimeout(() => {
      if (action === 'like') {
        setSelectedFriend(currentFriend);
        setShowGiftModal(true);
      }
      setCurrentIndex((prev) => (prev + 1) % potentialFriends.length);
      setAnimating(null);
    }, 300);
  };

  // Added local handleSendGift to close modal and call the prop
  const handleSendGift = (productId: string) => {
    if (selectedFriend) {
      onSendGift(selectedFriend.id, productId);
      setShowGiftModal(false);
    }
  };

  if (!currentFriend) return (
    <div className="h-full flex items-center justify-center bg-slate-900">
      <div className="text-center text-white p-10">
        <Users size={64} className="mx-auto mb-6 opacity-20" />
        <p className="text-2xl font-black tracking-tighter">¡No hay más perfiles hoy!</p>
        <p className="text-slate-400 mt-2">Vuelve mañana para conocer a más alumnos.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-900 overflow-hidden relative font-sans">
      <div className="max-w-md mx-auto h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-8 pt-4">
           <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Zap size={20} className="text-yellow-400 fill-yellow-400"/>
              <p className="text-white font-black text-lg tracking-tighter">${currentStudent.balance.toFixed(2)}</p>
           </div>
           <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[4px]">MeCard Discovery</p>
        </div>

        <div className={`flex-1 relative transition-transform duration-300 ${animating === 'like' ? 'translate-x-full rotate-12 opacity-0' : animating === 'pass' ? '-translate-x-full -rotate-12 opacity-0' : ''}`}>
           <div className="h-full rounded-[48px] overflow-hidden relative shadow-2xl border-4 border-white/5">
              <img src={currentFriend.photo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-10">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">Nivel 4</span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">{currentFriend.grade}</span>
                 </div>
                 <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">{currentFriend.name.split(' ')[0]}</h2>
                 <p className="text-indigo-200/60 font-medium mt-2 leading-relaxed">"Me encanta el basket y los frappés de la cafetería central. ¡Hola!"</p>
              </div>
           </div>
        </div>

        <div className="flex justify-center items-center gap-8 py-10">
           <button onClick={() => handleSwipe('pass')} className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-rose-500 border border-white/10 hover:bg-rose-500 hover:text-white transition-all shadow-xl"><X size={32}/></button>
           <button onClick={() => handleSwipe('like')} className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-all border-4 border-white/20"><Heart size={40} fill="white"/></button>
           <button className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-amber-400 border border-white/10 hover:bg-amber-400 hover:text-white transition-all shadow-xl"><Star size={32} fill="currentColor"/></button>
        </div>
      </div>

      {showGiftModal && selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-12 relative animate-in zoom-in duration-300">
              <button onClick={() => setShowGiftModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800 transition-colors"><X size={32}/></button>
              <div className="text-center mb-10">
                 <div className="bg-indigo-50 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner"><Gift size={48}/></div>
                 <h3 className="text-3xl font-black text-slate-800 tracking-tighter">¡Regala un snack a {selectedFriend.name.split(' ')[0]}!</h3>
                 <p className="text-slate-400 font-medium mt-2">Usa tu saldo MeCard para invitarle algo.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 {giftProducts.map(p => (
                    <button key={p.id} onClick={() => handleSendGift(p.id)} className="p-6 bg-slate-50 rounded-[32px] border-2 border-transparent hover:border-indigo-600 hover:bg-white transition-all text-left group">
                       <img src={p.image} className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-sm" />
                       <p className="font-black text-slate-800 text-sm leading-none mb-1">{p.name}</p>
                       <p className="text-indigo-600 font-black tracking-tighter">${p.price.toFixed(2)}</p>
                    </button>
                 ))}
              </div>
              <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">El regalo se enviará como un ticket prepagado al wallet de {selectedFriend.name.split(' ')[0]}</p>
           </div>
        </div>
      )}
    </div>
  );
};
