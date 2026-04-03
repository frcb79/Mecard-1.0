/**
 * BirthdayGifts — Colectas de cumpleaños y wishlist
 * Permite a estudiantes y padres:
 * - Ver próximos cumpleaños de compañeros
 * - Configurar su propia wishlist de cumpleaños
 * - Contribuir a una "vaquita" (colecta grupal) para regalar algo
 * - MeCard sourcea el producto del marketplace y cobra comisión
 *
 * @role STUDENT, PARENT
 * @route /student/birthday, /parent/birthday
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Cake, Gift, Heart, Plus, Users, Search, ChevronRight,
  Star, PartyPopper, ShoppingBag, Sparkles, Check, X,
  CreditCard, Clock, TrendingUp, AlertCircle, Loader2
} from 'lucide-react';
import type { BirthdayStudent, WishlistItem, BirthdayPool } from '../types';
import { birthdayService } from '../services/birthdayService';
import { useAuth } from '../hooks/useAuth';

// ─── Mock Data ──────────────────────────────────────

const MOCK_MARKETPLACE_ITEMS: WishlistItem[] = [
  { id: 'bw1', name: 'Audífonos Bluetooth', emoji: '🎧', price: 450, category: 'Tech' },
  { id: 'bw2', name: 'Mochila Deportiva', emoji: '🎒', price: 380, category: 'Accesorios' },
  { id: 'bw3', name: 'Set de Colores Prismacolor', emoji: '🎨', price: 290, category: 'Escolar' },
  { id: 'bw4', name: 'Balón de Fútbol Nike', emoji: '⚽', price: 350, category: 'Deportes' },
  { id: 'bw5', name: 'Libro Harry Potter Ilustrado', emoji: '📚', price: 420, category: 'Libros' },
  { id: 'bw6', name: 'Termo Stanley 500ml', emoji: '🧊', price: 280, category: 'Accesorios' },
  { id: 'bw7', name: 'Kit de Papelería Kawaii', emoji: '✏️', price: 180, category: 'Escolar' },
  { id: 'bw8', name: 'Voucher Cafetería $200', emoji: '🍕', price: 200, category: 'Comida' },
  { id: 'bw9', name: 'Lego Set Mini', emoji: '🧱', price: 320, category: 'Juguetes' },
  { id: 'bw10', name: 'Funda para Tablet', emoji: '📱', price: 250, category: 'Tech' },
];

const today = new Date();
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().slice(0, 10);
};

const MOCK_UPCOMING_BIRTHDAYS: BirthdayStudent[] = [
  {
    id: 'stu_003', fullName: 'Diego Ramírez', grade: '4° Primaria - B',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    birthday: addDays(today, 3),
    wishlist: [MOCK_MARKETPLACE_ITEMS[0], MOCK_MARKETPLACE_ITEMS[3], MOCK_MARKETPLACE_ITEMS[7]],
    daysUntil: 3,
  },
  {
    id: 'stu_004', fullName: 'Valentina Martínez', grade: '4° Primaria - A',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    birthday: addDays(today, 8),
    wishlist: [MOCK_MARKETPLACE_ITEMS[2], MOCK_MARKETPLACE_ITEMS[5], MOCK_MARKETPLACE_ITEMS[6]],
    daysUntil: 8,
  },
  {
    id: 'stu_006', fullName: 'Camila Torres', grade: '4° Primaria - A',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    birthday: addDays(today, 15),
    wishlist: [MOCK_MARKETPLACE_ITEMS[1], MOCK_MARKETPLACE_ITEMS[4], MOCK_MARKETPLACE_ITEMS[9]],
    daysUntil: 15,
  },
  {
    id: 'stu_007', fullName: 'Emiliano Ruiz', grade: '3° Primaria - C',
    birthday: addDays(today, 22),
    wishlist: [MOCK_MARKETPLACE_ITEMS[3], MOCK_MARKETPLACE_ITEMS[8]],
    daysUntil: 22,
  },
];

const MOCK_POOLS: BirthdayPool[] = [
  {
    id: 'pool_01',
    birthdayStudentId: 'stu_003',
    birthdayStudentName: 'Diego Ramírez',
    birthdayDate: addDays(today, 3),
    targetItem: MOCK_MARKETPLACE_ITEMS[0],
    targetAmount: 450,
    collectedAmount: 320,
    contributors: [
      { id: 'c1', poolId: 'pool_01', contributorId: 'stu_004', contributorType: 'STUDENT' as const, contributorName: 'Valentina M.', amount: 80, refunded: false, createdAt: addDays(today, -2) },
      { id: 'c2', poolId: 'pool_01', contributorId: 'stu_006', contributorType: 'STUDENT' as const, contributorName: 'Camila T.', amount: 100, refunded: false, createdAt: addDays(today, -1) },
      { id: 'c3', poolId: 'pool_01', contributorId: 'parent_02', contributorType: 'PARENT' as const, contributorName: 'Mamá de Mateo', amount: 90, refunded: false, createdAt: addDays(today, -1) },
      { id: 'c4', poolId: 'pool_01', contributorId: 'stu_007', contributorType: 'STUDENT' as const, contributorName: 'Emiliano R.', amount: 50, refunded: false, createdAt: addDays(today, 0) },
    ],
    status: 'OPEN',
    createdAt: addDays(today, -5),
    expiresAt: addDays(today, 2),
  },
  {
    id: 'pool_02',
    birthdayStudentId: 'stu_004',
    birthdayStudentName: 'Valentina Martínez',
    birthdayDate: addDays(today, 8),
    targetItem: MOCK_MARKETPLACE_ITEMS[2],
    targetAmount: 290,
    collectedAmount: 120,
    contributors: [
      { id: 'c5', poolId: 'pool_02', contributorId: 'stu_003', contributorType: 'STUDENT' as const, contributorName: 'Diego R.', amount: 60, refunded: false, createdAt: addDays(today, -1) },
      { id: 'c6', poolId: 'pool_02', contributorId: 'parent_01', contributorType: 'PARENT' as const, contributorName: 'Papá de Santiago', amount: 60, refunded: false, createdAt: addDays(today, 0) },
    ],
    status: 'OPEN',
    createdAt: addDays(today, -3),
    expiresAt: addDays(today, 7),
  },
];

// ─── Formatters ─────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

// ─── Component ──────────────────────────────────────

type Tab = 'upcoming' | 'mywishlist' | 'pools';

export default function BirthdayGifts() {
  const { user } = useAuth();
  const schoolId = user?.schoolId || '';

  const [tab, setTab] = useState<Tab>('upcoming');
  const [search, setSearch] = useState('');
  const [myWishlist, setMyWishlist] = useState<WishlistItem[]>([
    MOCK_MARKETPLACE_ITEMS[0], MOCK_MARKETPLACE_ITEMS[4],
  ]);
  const [myBirthday] = useState('2015-06-18');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<BirthdayStudent | null>(null);
  const [contributePoolId, setContributePoolId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [pools, setPools] = useState<BirthdayPool[]>(MOCK_POOLS);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayStudent[]>(MOCK_UPCOMING_BIRTHDAYS);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch from service, fallback to mocks
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bdayRes, poolRes] = await Promise.all([
        birthdayService.getUpcomingBirthdays(schoolId),
        birthdayService.getActivePools(schoolId),
      ]);
      if (bdayRes.data.length > 0) setUpcomingBirthdays(bdayRes.data);
      if (poolRes.data.length > 0) setPools(poolRes.data);
    } catch {
      // Keep mock fallback
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredBirthdays = useMemo(() => {
    if (!search) return upcomingBirthdays;
    return upcomingBirthdays.filter(s =>
      s.fullName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, upcomingBirthdays]);

  const availableMarketplaceItems = useMemo(() => {
    const idsInWishlist = new Set(myWishlist.map(w => w.id));
    return MOCK_MARKETPLACE_ITEMS.filter(item => !idsInWishlist.has(item.id));
  }, [myWishlist]);

  const handleContribute = async (poolId: string) => {
    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) return;

    setActionLoading(true);
    try {
      const result = await birthdayService.contribute({
        poolId,
        contributorId: user?.id || 'current_user',
        contributorType: (user as any)?.role === 'PARENT' ? 'PARENT' : 'STUDENT',
        contributorName: user?.fullName || 'Tú',
        amount,
      });
      if (result.success && result.pool) {
        setPools(prev => prev.map(p => p.id === poolId ? result.pool! : p));
      } else {
        // Fallback: update locally
        setPools(prev => prev.map(p => {
          if (p.id !== poolId) return p;
          const newCollected = Math.min(p.collectedAmount + amount, p.targetAmount);
          return {
            ...p,
            collectedAmount: newCollected,
            status: newCollected >= p.targetAmount ? 'FUNDED' as const : p.status,
            contributors: [...p.contributors, {
              id: `c_${Date.now()}`,
              poolId,
              contributorId: user?.id || 'current_user',
              contributorType: 'STUDENT' as const,
              contributorName: user?.fullName || 'Tú',
              amount,
              refunded: false,
              createdAt: new Date().toISOString().slice(0, 10),
            }],
          };
        }));
      }
    } catch {
      // Fallback: update locally
      setPools(prev => prev.map(p => {
        if (p.id !== poolId) return p;
        const newCollected = Math.min(p.collectedAmount + amount, p.targetAmount);
        return {
          ...p,
          collectedAmount: newCollected,
          status: newCollected >= p.targetAmount ? 'FUNDED' as const : p.status,
          contributors: [...p.contributors, {
            id: `c_${Date.now()}`,
            poolId,
            contributorId: user?.id || 'current_user',
            contributorType: 'STUDENT' as const,
            contributorName: user?.fullName || 'Tú',
            amount,
            refunded: false,
            createdAt: new Date().toISOString().slice(0, 10),
          }],
        };
      }));
    } finally {
      setActionLoading(false);
    }
    setContributeAmount('');
    setContributePoolId(null);
  };

  const handleStartPool = async (student: BirthdayStudent, item: WishlistItem) => {
    setActionLoading(true);
    try {
      const result = await birthdayService.createPool({
        birthdayStudentId: student.id,
        creatorId: user?.id || 'current_user',
        creatorType: (user as any)?.role === 'PARENT' ? 'PARENT' : 'STUDENT',
        targetProductName: item.name,
        targetProductId: item.id,
        targetAmount: item.price,
        birthdayDate: student.birthday,
        expiresAt: student.birthday,
      });
      if (result.data) {
        const pool = { ...result.data, birthdayStudentName: student.fullName, targetItem: item };
        setPools(prev => [pool, ...prev]);
      } else {
        // Fallback: local pool
        createLocalPool(student, item);
      }
    } catch {
      createLocalPool(student, item);
    } finally {
      setActionLoading(false);
    }
    setSelectedStudent(null);
    setTab('pools');
  };

  const createLocalPool = (student: BirthdayStudent, item: WishlistItem) => {
    const newPool: BirthdayPool = {
      id: `pool_${Date.now()}`,
      birthdayStudentId: student.id,
      birthdayStudentName: student.fullName,
      birthdayDate: student.birthday,
      targetItem: item,
      targetAmount: item.price,
      collectedAmount: 0,
      contributors: [],
      status: 'OPEN',
      createdAt: new Date().toISOString().slice(0, 10),
      expiresAt: student.birthday,
    };
    setPools(prev => [newPool, ...prev]);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'upcoming', label: 'Próximos', icon: <Cake size={16} />, badge: upcomingBirthdays.filter(b => b.daysUntil <= 7).length },
    { id: 'mywishlist', label: 'Mi Wishlist', icon: <Heart size={16} /> },
    { id: 'pools', label: 'Colectas', icon: <Users size={16} />, badge: pools.filter(p => p.status === 'OPEN').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
            <Cake size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Cumpleaños</h1>
            <p className="text-xs text-slate-500">Regalos colectivos y wishlists de compañeros</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${tab === t.id ? 'bg-pink-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {t.icon} {t.label}
              {t.badge && t.badge > 0 && (
                <span className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${tab === t.id ? 'bg-white text-pink-600' : 'bg-pink-500 text-white'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            <span className="ml-2 text-sm text-slate-500">Cargando...</span>
          </div>
        )}

        {/* ═══ TAB: Upcoming Birthdays ═══ */}
        {tab === 'upcoming' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text" placeholder="Buscar compañero..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm border-none outline-none bg-transparent"
                />
              </div>
            </div>

            {filteredBirthdays.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <Cake className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-bold">No hay cumpleaños próximos</p>
              </div>
            ) : (
              filteredBirthdays.map(student => {
                const existingPool = pools.find(p => p.birthdayStudentId === student.id && p.status === 'OPEN');
                return (
                  <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {student.photo ? (
                          <img src={student.photo} alt={student.fullName} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-black text-lg">
                            {student.fullName.charAt(0)}
                          </div>
                        )}
                        {student.daysUntil <= 3 && (
                          <span className="absolute -top-1 -right-1 text-sm">🎂</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{student.fullName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.daysUntil <= 3
                              ? 'bg-pink-100 text-pink-700'
                              : student.daysUntil <= 7
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {student.daysUntil === 0 ? '¡Hoy!' : student.daysUntil === 1 ? '¡Mañana!' : `en ${student.daysUntil} días`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{student.grade} · {fmtDate(student.birthday)}</p>

                        {/* Wishlist preview */}
                        {student.wishlist.length > 0 && (
                          <div className="mt-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quiere para su cumple:</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {student.wishlist.map(item => (
                                <span key={item.id} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 rounded-lg text-[10px] font-medium text-pink-700 border border-pink-100">
                                  {item.emoji} {item.name} <span className="text-pink-400 ml-0.5">{fmt(item.price)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {existingPool ? (
                            <button
                              onClick={() => { setContributePoolId(existingPool.id); setTab('pools'); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold"
                            >
                              <TrendingUp size={12} /> Contribuir a colecta ({Math.round(existingPool.collectedAmount / existingPool.targetAmount * 100)}%)
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-xl text-[10px] font-bold"
                            >
                              <PartyPopper size={12} /> Iniciar Colecta
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200"
                          >
                            <Gift size={12} /> Regalar Directo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ TAB: My Wishlist ═══ */}
        {tab === 'mywishlist' && (
          <div className="space-y-4">
            {/* My birthday info */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3">
                <Cake size={24} />
                <div>
                  <p className="text-sm font-bold opacity-90">Tu cumpleaños</p>
                  <p className="text-xl font-black">{fmtDate(myBirthday)}</p>
                </div>
              </div>
              <p className="text-xs mt-2 opacity-80">
                Agrega productos que te gustaría recibir. Tus compañeros y sus papás podrán verlos y organizar una vaquita.
              </p>
            </div>

            {/* Current wishlist */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Heart size={14} className="text-pink-500" /> Mi Lista de Deseos ({myWishlist.length})
                </h3>
                <button
                  onClick={() => setShowAddItem(!showAddItem)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-xl text-[10px] font-bold"
                >
                  <Plus size={12} /> Agregar
                </button>
              </div>

              {myWishlist.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs text-slate-400 font-medium">Tu lista está vacía. ¡Agrega lo que quieres!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myWishlist.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.category} · {fmt(item.price)}</p>
                      </div>
                      <button
                        onClick={() => setMyWishlist(prev => prev.filter(w => w.id !== item.id))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add item from marketplace */}
            {showAddItem && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-pink-500" /> Catálogo MeCard
                </h3>
                {availableMarketplaceItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Ya agregaste todos los productos disponibles.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableMarketplaceItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMyWishlist(prev => [...prev, item]);
                        }}
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-left"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{fmt(item.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Pools (Colectas) ═══ */}
        {tab === 'pools' && (
          <div className="space-y-4">
            {pools.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <Users className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-bold">No hay colectas activas</p>
                <p className="text-xs text-slate-400 mt-1">Ve a "Próximos" para iniciar una vaquita</p>
              </div>
            ) : (
              pools.map(pool => {
                const progress = Math.min((pool.collectedAmount / pool.targetAmount) * 100, 100);
                const remaining = pool.targetAmount - pool.collectedAmount;
                const isContributing = contributePoolId === pool.id;

                return (
                  <div key={pool.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${pool.status === 'FUNDED' ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-100'}`}>
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${pool.status === 'FUNDED' ? 'bg-emerald-100' : 'bg-pink-100'}`}>
                        {pool.status === 'FUNDED' ? '🎉' : pool.targetItem.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">
                          {pool.targetItem.name} para {pool.birthdayStudentName}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Cumple: {fmtDate(pool.birthdayDate)} · {pool.contributors.length} participantes
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pool.status === 'FUNDED' ? 'bg-emerald-100 text-emerald-700' :
                        pool.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                        pool.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {pool.status === 'FUNDED' ? '¡Completa!' : pool.status === 'OPEN' ? 'Abierta' : pool.status === 'DELIVERED' ? 'Entregado' : pool.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">{fmt(pool.collectedAmount)} / {fmt(pool.targetAmount)}</span>
                        <span className="font-bold text-pink-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pool.status === 'FUNDED' ? 'bg-emerald-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {pool.status === 'OPEN' && remaining > 0 && (
                        <p className="text-[10px] text-slate-400 mt-1">Faltan {fmt(remaining)} para completar</p>
                      )}
                    </div>

                    {/* Contributors */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Participantes</p>
                      <div className="flex flex-wrap gap-1">
                        {pool.contributors.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-lg text-[10px] text-slate-600 border border-slate-100">
                            {c.contributorName} <span className="font-bold text-pink-600">{fmt(c.amount)}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contribute */}
                    {pool.status === 'OPEN' && (
                      <div>
                        {isContributing ? (
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                              <input
                                type="number"
                                value={contributeAmount}
                                onChange={e => setContributeAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-pink-400"
                                min={1}
                                max={remaining}
                              />
                            </div>
                            <button
                              onClick={() => handleContribute(pool.id)}
                              disabled={!contributeAmount || parseFloat(contributeAmount) <= 0 || actionLoading}
                              className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold disabled:bg-slate-300"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => { setContributePoolId(null); setContributeAmount(''); }}
                              className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setContributePoolId(pool.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition-colors"
                            >
                              <CreditCard size={14} /> Contribuir
                            </button>
                            {[50, 100].map(amt => (
                              <button
                                key={amt}
                                onClick={() => {
                                  setContributeAmount(String(amt));
                                  setContributePoolId(pool.id);
                                  setTimeout(() => handleContribute(pool.id), 0);
                                }}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-pink-50 hover:text-pink-600 transition-colors"
                              >
                                ${amt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {pool.status === 'FUNDED' && (
                      <div className="bg-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <Check size={14} /> ¡Colecta completa! MeCard entregará el regalo el día del cumpleaños.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ Modal: Select item for new pool ═══ */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-6">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Regalar a {selectedStudent.fullName}</h3>
                  <p className="text-[10px] text-slate-400">Cumple {fmtDate(selectedStudent.birthday)}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4">
                {selectedStudent.wishlist.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider mb-2">Su lista de deseos</p>
                    <div className="space-y-2">
                      {selectedStudent.wishlist.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.category} · {fmt(item.price)}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleStartPool(selectedStudent, item)}
                              className="px-2 py-1 bg-pink-600 text-white rounded-lg text-[9px] font-bold"
                            >
                              Vaquita
                            </button>
                            <button className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold">
                              Regalar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-xs text-slate-400">Este compañero no ha creado su wishlist aún</p>
                  </div>
                )}

                {/* Quick amounts for direct gift */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">O regala saldo directo</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 200].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setSelectedStudent(null)}
                        className="py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        {fmt(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-pink-50 border border-pink-100 rounded-2xl p-4">
          <p className="text-xs text-pink-800 font-medium">
            🎂 <strong>¿Cómo funciona?</strong> Los compañeros y papás pueden contribuir a una vaquita para comprar el regalo que tú quieres. MeCard se encarga de comprarlo y entregarlo el día de tu cumple. Si la colecta no se completa, el dinero se devuelve a cada participante.
          </p>
        </div>
      </div>
    </div>
  );
}
