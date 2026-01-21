// ==============================
// LINEA 1 – IMPORTS
// ==============================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import {
  Wallet,
  Users,
  Gift,
  Star,
  Bell,
  QrCode,
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
import { socialService } from '../services/supabaseSocial';
import { inventoryService } from '../services/supabaseInventory';
import { supabase } from '../lib/supabase';

import {
  StudentProfile,
  Product,
  Gift as GiftType,
} from '../types';

// ==============================
// UI COMPONENTS
// ==============================
const Badge = ({ children, variant = 'indigo' }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[variant]}`}>
      {children}
    </span>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 border-b-4 transition-all font-black text-[10px] uppercase tracking-widest ${
      active
        ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
        : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// ==============================
// MAIN COMPONENT
// ==============================
export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();

  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  const userId = user!.id;
  const schoolId = user!.school_id;

  // ==============================
  // STATE
  // ==============================
  const [activeTab, setActiveTab] = useState<'wallet' | 'explore' | 'gifts' | 'social'>('wallet');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toggleRef = useRef(new Set<string>());

  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const profileData = await socialService.getStudentProfile(userId);
        const inventory = await inventoryService.getInventory(schoolId);
        const receivedGifts = await socialService.getReceivedGifts(userId);

        setProfile(profileData);
        setProducts(inventory || []);
        setGifts(receivedGifts || []);
      } catch (e: any) {
        console.error(e);
        setError('Error cargando tu información');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId, schoolId]);

  // ==============================
  // REALTIME BALANCE UPDATES
  // ==============================
  useEffect(() => {
    const channel = supabase
      .channel(`student-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${userId}` },
        payload => {
          setProfile(prev => (prev ? { ...prev, ...payload.new } : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ==============================
  // DERIVED DATA
  // ==============================
  const availableProducts = useMemo(() => {
    if (!profile?.restrictions) return products;
    return products.filter(p => {
      if (profile.restrictions.restrictedProducts?.includes(p.id)) return false;
      if (profile.restrictions.restrictedCategories?.includes(p.category)) return false;
      if (p.allergens?.some(a => profile.restrictions.allergens?.includes(a))) return false;
      return true;
    });
  }, [products, profile]);

  const activeGifts = gifts.filter(g => g.status === 'pending');
  const expiredGifts = gifts.filter(g => g.status !== 'pending');

  // ==============================
  // HANDLERS
  // ==============================
  const toggleWishlist = async (productId: string) => {
    if (!profile || toggleRef.current.has(productId)) return;

    toggleRef.current.add(productId);
    try {
      const favorites = await socialService.toggleFavorite(userId, productId);
      setProfile({ ...profile, favorites });
    } catch {
      setError('No se pudo actualizar favoritos');
    } finally {
      toggleRef.current.delete(productId);
    }
  };

  // ==============================
  // STATES
  // ==============================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <AlertCircle size={64} className="text-rose-500 mb-4" />
        <p className="font-bold">No se pudo cargar tu perfil</p>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* HEADER */}
      <header className="bg-white px-10 py-6 border-b flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic">
            MeCard<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Dashboard del Estudiante
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Saldo
          </p>
          <p className="text-3xl font-black text-emerald-600">
            ${profile.balance.toFixed(2)}
          </p>
        </div>
      </header>

      {/* NAV */}
      <nav className="bg-white flex px-10 border-b">
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={Wallet} label="Billetera" />
        <TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={ShoppingBag} label="Explorar" />
        <TabButton active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} icon={Gift} label={`Regalos (${activeGifts.length})`} />
        <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={Users} label="Social" />
      </nav>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'wallet' && (
          <div className="bg-indigo-600 text-white rounded-3xl p-12 flex justify-between items-center">
            <div>
              <p className="uppercase text-indigo-200 text-xs tracking-widest">Alumno</p>
              <h2 className="text-4xl font-black italic">{profile.full_name}</h2>
              <p className="mt-2 font-mono tracking-widest">{profile.student_id}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl">
              {profile.credential?.qr_code ? (
                <QRCode value={profile.credential.qr_code} size={120} />
              ) : (
                <QrCode size={80} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {availableProducts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl shadow">
                <h4 className="font-bold">{p.name}</h4>
                <p className="text-sm text-slate-500">${p.price.toFixed(2)}</p>
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="mt-4 text-rose-500"
                >
                  <Heart />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="space-y-6">
            {activeGifts.map(g => (
              <div key={g.id} className="bg-white p-6 rounded-3xl shadow">
                <p className="font-bold">{g.item?.name}</p>
                <p className="text-xs text-slate-500">Código: {g.redemption_code}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="text-center text-slate-400 mt-20">
            <Users size={64} className="mx-auto mb-4" />
            <p>Red social MeCard próximamente</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t px-10 py-4 flex justify-between text-xs font-bold text-slate-400">
        <span>MeCard Engine</span>
        <span className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-500" />
          Seguridad Activa
        </span>
      </footer>
    </div>
  );
}
