import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, setDoc, getDoc, collection, query, 
  onSnapshot, updateDoc, arrayUnion, arrayRemove, addDoc, 
  where, serverTimestamp, getDocs
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  Wallet, Users, Gift, Star, Bell, QrCode, ShoppingBag, 
  Globe, Lock, Heart, Search, CheckCircle2, RefreshCw,
  MessageSquare, Send, User, ChevronRight, Clock,
  Zap, ArrowUpRight, ShieldCheck, HeartPulse, Search as SearchIcon
} from 'lucide-react';

// --- CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mecard-student-hub';

// --- COMPONENTES ATÓMICOS ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border-2 border-slate-200 text-slate-600 hover:bg-slate-50'
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-6 flex items-center gap-4 border-b-4 transition-all font-black text-[10px] uppercase tracking-[3px] whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
  >
    <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span> {label}
  </button>
);

// --- COMPONENTE SOCIAL (MECARD SOCIAL) ---
const MeCardSocial = ({ currentStudent, onSendGift }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isGifting, setIsGifting] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      // Nota: En Firestore real no hay búsqueda por texto parcial flexible sin índices, 
      // aquí buscamos coincidencia exacta o filtramos en memoria por simplicidad del entorno.
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.id !== currentStudent.id && p.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
      setSearchResults(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const sendGift = async (friend, product) => {
    if (currentStudent.balance < product.price) {
      alert("Saldo insuficiente");
      return;
    }
    setIsGifting(true);
    try {
      // 1. Descontar saldo
      const myRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentStudent.id);
      await updateDoc(myRef, { balance: currentStudent.balance - product.price });

      // 2. Crear el regalo
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'gifts'), {
        sender_id: currentStudent.id,
        sender_name: currentStudent.full_name,
        receiver_id: friend.id,
        item: product,
        redemption_code: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        status: 'pending'
      });

      alert(`¡Regalo enviado a ${friend.full_name}!`);
      setSelectedFriend(null);
      onSendGift();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGifting(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
        <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter mb-6">Buscar Amigos</h3>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del estudiante..." 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] border-none text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <RefreshCw className="animate-spin" /> : 'Buscar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {searchResults.map(friend => (
          <div key={friend.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600 font-black text-xl italic">
                {friend.full_name.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">{friend.full_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{friend.school_name || 'Estudiante MeCard'}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setSelectedFriend(friend)}>Enviar Regalo</Button>
          </div>
        ))}
      </div>

      {selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[48px] p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Regalar a {selectedFriend.full_name}</h2>
              <button onClick={() => setSelectedFriend(null)} className="text-slate-300 hover:text-slate-600 font-black text-xl">×</button>
            </div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[4px]">Selecciona un producto de tu saldo</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Aquí idealmente cargarías productos reales. Usaremos una lista rápida */}
              {[
                {id: 'p1', name: 'Combo Burger', price: 85},
                {id: 'p2', name: 'Malteada Pro', price: 45},
                {id: 'p3', name: 'Pizza Slice', price: 35},
                {id: 'p4', name: 'Donut Kit', price: 25}
              ].map(prod => (
                <button 
                  key={prod.id} 
                  onClick={() => sendGift(selectedFriend, prod)}
                  disabled={isGifting}
                  className="p-6 bg-slate-50 rounded-[32px] text-left hover:bg-indigo-600 hover:text-white transition-all group border border-slate-100"
                >
                  <p className="font-black text-lg mb-1">{prod.name}</p>
                  <p className="font-mono text-xl opacity-60 group-hover:opacity-100">${prod.price}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('wallet');
  const [myGifts, setMyGifts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [sendingComment, setSendingComment] = useState(null);

  // 1. Autenticación y Carga Inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Escucha de datos en tiempo real (Perfil, Regalos, Productos)
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
    
    // Perfil
    const unsubProfile = onSnapshot(profileRef, async (snap) => {
      if (!snap.exists()) {
        // Inicialización automática si es la primera vez
        const initialData = {
          full_name: "Estudiante MeCard",
          student_id: `2024-MC-${user.uid.slice(0, 4).toUpperCase()}`,
          balance: 500.00,
          favorites: [],
          favorites_public: true,
          daily_limit: 200.00,
          spent_today: 0,
          school_name: "Instituto Tecnológico MeCard"
        };
        await setDoc(profileRef, initialData);
        setProfile({ id: user.uid, ...initialData });
      } else {
        setProfile({ id: user.uid, ...snap.data() });
      }
      setLoading(false);
    });

    // Regalos recibidos
    const giftsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'gifts'),
      where('receiver_id', '==', user.uid)
    );
    const unsubGifts = onSnapshot(giftsQuery, (snap) => {
      setMyGifts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Productos
    const productsQuery = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubProducts = onSnapshot(productsQuery, async (snap) => {
      if (snap.empty) {
        // Crear productos semilla
        const seed = [
          { name: "Combo Pizza Pro", price: 65, category: "Almuerzo", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
          { name: "Ensalada César", price: 55, category: "Saludable", image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400" },
          { name: "Jugo Natural", price: 25, category: "Bebidas", image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400" }
        ];
        for (const p of seed) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), p);
      }
      setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubProfile();
      unsubGifts();
      unsubProducts();
    };
  }, [user]);

  // --- ACCIONES ---
  const handleToggleFavorite = async (productId) => {
    if (!profile) return;
    const isFav = profile.favorites?.includes(productId);
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
    await updateDoc(profileRef, {
      favorites: isFav ? arrayRemove(productId) : arrayUnion(productId)
    });
  };

  const toggleFavoritesPrivacy = async () => {
    if (!profile) return;
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
    await updateDoc(profileRef, { favorites_public: !profile.favorites_public });
  };

  const handleSendThankYou = async (gift) => {
    const text = commentTexts[gift.id];
    if (!text?.trim()) return;
    setSendingComment(gift.id);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
        gift_id: gift.id,
        receiver_id: gift.sender_id,
        sender_id: user.uid,
        message: text,
        created_at: serverTimestamp()
      });
      setCommentTexts(prev => ({ ...prev, [gift.id]: '' }));
      alert("Agradecimiento enviado");
    } catch (e) {
      console.error(e);
    } finally {
      setSendingComment(null);
    }
  };

  const healthScore = useMemo(() => 85, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">Cargando MeCard Hub...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white px-10 py-6 border-b border-slate-200 flex justify-between items-center z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter">Student Hub</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Ecosistema Social</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${profile?.balance?.toFixed(2)}</p>
          </div>
          <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 transition-all">
            <Bell size={20}/>
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="bg-white border-b border-slate-100 flex px-10 overflow-x-auto scrollbar-hide shrink-0">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<Wallet size={16}/>} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<ShoppingBag size={16}/>} label="Descubrir" />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Users size={16}/>} label="Amigos" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={<Gift size={16}/>} label="Mis Regalos" />
      </nav>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc]/50">
        
        {activeTab === 'wallet' && (
          <div className="p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Tarjeta Visual */}
              <div className="lg:col-span-8 bg-indigo-600 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden min-h-[350px] flex flex-col justify-between group border border-white/10">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Wallet size={200} /></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">STUDENT ID</p>
                    <p className="font-mono text-xl tracking-[4px]">{profile?.student_id}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl"><Zap size={28} className="text-yellow-400 fill-yellow-400"/></div>
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[4px] mb-2">SALDO DISPONIBLE</p>
                  <h2 className="text-8xl font-black tracking-tighter leading-none">${profile?.balance?.toFixed(2)}</h2>
                </div>
                <div className="relative z-10 flex justify-between items-end pt-8 border-t border-white/10 mt-8">
                  <div>
                    <p className="text-xl font-black uppercase tracking-tighter italic opacity-80">{profile?.full_name}</p>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{profile?.school_name}</p>
                  </div>
                  <div className="bg-white p-5 rounded-[24px] shadow-xl hover:scale-110 transition-transform cursor-pointer">
                    <QrCode size={36} className="text-slate-900" />
                  </div>
                </div>
              </div>

              {/* Sidebar Bento */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Analizado por Gemini AI</p>
                </div>
                <div className="bg-emerald-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[160px]">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={100}/></div>
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-emerald-400 mb-4">Seguridad</p>
                  <p className="text-sm font-medium leading-relaxed opacity-90 italic">Protección parental activa en esta cuenta.</p>
                </div>
              </div>
            </div>

            {/* Privacidad */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile?.favorites_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {profile?.favorites_public ? <Globe size={24} /> : <Lock size={24} />}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base italic">Privacidad de Wishlist</p>
                  <p className="text-xs text-slate-500 font-medium">{profile?.favorites_public ? 'Tus amigos pueden ver qué regalos te gustaría recibir.' : 'Tu lista de deseos es privada.'}</p>
                </div>
              </div>
              <Button onClick={toggleFavoritesPrivacy} variant="secondary">
                {profile?.favorites_public ? 'Hacer Privado' : 'Hacer Público'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end px-4">
              <div>
                <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Catálogo</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[5px] mt-3">Añade a tu wishlist para recibir regalos</p>
              </div>
              <div className="relative w-72">
                 <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                 <input placeholder="Buscar..." className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm text-sm font-bold text-slate-600 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {allProducts.map(product => {
                const isFavorite = profile?.favorites?.includes(product.id);
                return (
                  <div key={product.id} className="bg-white p-5 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
                    <button 
                      onClick={() => handleToggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-110"
                    >
                      <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-200'} />
                    </button>
                    <div className="aspect-square rounded-[32px] mb-5 overflow-hidden">
                      <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.category}</p>
                      <h4 className="font-black text-slate-800 text-sm mb-3 truncate leading-tight italic">{product.name}</h4>
                      <p className="font-black text-emerald-600 text-lg tracking-tighter">${product.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'social' && <MeCardSocial currentStudent={profile} onSendGift={() => {}} />}

        {activeTab === 'gifts' && (
          <div className="p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none mb-10">Mis Regalos</h3>
            
            <div className="grid grid-cols-1 gap-8">
              {myGifts.map(gift => (
                <div key={gift.id} className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 group hover:shadow-2xl transition-all">
                  <div className="flex gap-8 items-center md:w-1/2">
                    <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center text-indigo-600 relative shrink-0">
                      <ShoppingBag size={56} />
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-xl animate-bounce"><Gift size={24} /></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">De: <span className="text-indigo-600 font-black">{gift.sender_name}</span></p>
                      <h4 className="text-3xl font-black text-slate-800 mb-6 tracking-tight italic">{gift.item.name}</h4>
                      <div className="bg-slate-900 px-8 py-5 rounded-[32px] border border-white/5 shadow-2xl">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[4px] mb-2">CÓDIGO CANJE</p>
                        <p className="text-4xl font-black text-indigo-400 tracking-[8px] font-mono leading-none">{gift.redemption_code}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0 md:pl-12">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3 mb-4"><MessageSquare size={16} className="text-indigo-400" /> Dar las gracias</p>
                    <div className="relative">
                      <textarea 
                        placeholder="Dile algo a tu amigo..."
                        value={commentTexts[gift.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [gift.id]: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-[32px] p-6 text-sm font-bold text-slate-700 outline-none h-28 resize-none shadow-inner"
                      />
                      <button 
                        onClick={() => handleSendThankYou(gift)}
                        disabled={sendingComment === gift.id || !commentTexts[gift.id]?.trim()}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-20 transition-all active:scale-90"
                      >
                        {sendingComment === gift.id ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {myGifts.length === 0 && (
                <div className="py-40 bg-white rounded-[72px] border-4 border-dashed border-slate-100 text-center grayscale opacity-20 flex flex-col items-center">
                  <Gift size={80} className="mb-6" />
                  <p className="font-black uppercase tracking-[10px] text-sm">Buzón vacío</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
