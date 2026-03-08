import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, Search, Star, Package,
  AlertTriangle, Info, X, ShieldCheck, Send
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { useParentStudents } from '../hooks/useParentStudents';
import ParentNoStudentsState from './ParentNoStudentsState';
import { useAuth } from '../hooks/useAuth';
import { rewardsService } from '../services/rewardsService';

// ===== TYPES =====

interface RewardProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryEmoji: string;
  pointsCost: number;
  imageEmoji: string;
  stock: number;
  popularityScore: number;
  isHealthConcern: boolean;     // flagged based on parent restrictions
  healthNote?: string;
}

// ===== FALLBACK DATA =====

const DEFAULT_REWARDS: RewardProduct[] = [
  {
    id: 'rw-001',
    name: 'Audífonos Bluetooth',
    description: 'Audífonos inalámbricos con cancelación de ruido, ideales para clases virtuales.',
    category: 'Tecnología',
    categoryEmoji: '💻',
    pointsCost: 2500,
    imageEmoji: '🎧',
    stock: 5,
    popularityScore: 92,
    isHealthConcern: false,
  },
  {
    id: 'rw-002',
    name: 'Set de Colores Profesional',
    description: '48 colores de madera de alta calidad para artistas jóvenes.',
    category: 'Útiles',
    categoryEmoji: '📚',
    pointsCost: 800,
    imageEmoji: '🎨',
    stock: 12,
    popularityScore: 85,
    isHealthConcern: false,
  },
  {
    id: 'rw-003',
    name: 'Balón de Fútbol Adidas',
    description: 'Balón oficial tamaño 4, ideal para recreo y entrenamiento.',
    category: 'Deportes',
    categoryEmoji: '⚽',
    pointsCost: 1200,
    imageEmoji: '⚽',
    stock: 8,
    popularityScore: 95,
    isHealthConcern: false,
  },
  {
    id: 'rw-004',
    name: 'Kit de Dulces Surtidos',
    description: 'Caja con 20 dulces variados: gomitas, paletas, chocolates.',
    category: 'Entretenimiento',
    categoryEmoji: '🎮',
    pointsCost: 300,
    imageEmoji: '🍬',
    stock: 20,
    popularityScore: 88,
    isHealthConcern: true,
    healthNote: 'Contiene azúcares — podría conflictuar con restricciones de Snacks',
  },
  {
    id: 'rw-005',
    name: 'Gift Card Amazon $200',
    description: 'Tarjeta de regalo Amazon por valor de $200 MXN.',
    category: 'Gift Cards',
    categoryEmoji: '🎁',
    pointsCost: 1800,
    imageEmoji: '🎁',
    stock: 3,
    popularityScore: 97,
    isHealthConcern: false,
  },
  {
    id: 'rw-006',
    name: 'Pase VIP Día de Campo',
    description: 'Acceso VIP al próximo evento de día de campo escolar con actividades extras.',
    category: 'Experiencias',
    categoryEmoji: '🎫',
    pointsCost: 500,
    imageEmoji: '🏕️',
    stock: 15,
    popularityScore: 80,
    isHealthConcern: false,
  },
  {
    id: 'rw-007',
    name: 'Pack de Snacks Saludables',
    description: 'Barras de granola, frutos secos y jugo natural por una semana.',
    category: 'Entretenimiento',
    categoryEmoji: '🎮',
    pointsCost: 400,
    imageEmoji: '🥜',
    stock: 10,
    popularityScore: 72,
    isHealthConcern: false,
  },
  {
    id: 'rw-008',
    name: 'Mochila Escolar Premium',
    description: 'Mochila ergonómica con compartimentos para laptop y lonchera.',
    category: 'Útiles',
    categoryEmoji: '📚',
    pointsCost: 2000,
    imageEmoji: '🎒',
    stock: 4,
    popularityScore: 90,
    isHealthConcern: false,
  },
  {
    id: 'rw-009',
    name: 'Refresco y Papas Combo',
    description: 'Combo de refresco grande y papas fritas para el recreo.',
    category: 'Entretenimiento',
    categoryEmoji: '🎮',
    pointsCost: 150,
    imageEmoji: '🍟',
    stock: 30,
    popularityScore: 75,
    isHealthConcern: true,
    healthNote: 'Bebida azucarada y fritura — revisar restricciones de Drinks y Snacks',
  },
];

const CATEGORIES = [
  { id: 'ALL', label: 'Todos', emoji: '📋' },
  { id: 'Tecnología', label: 'Tecnología', emoji: '💻' },
  { id: 'Útiles', label: 'Útiles', emoji: '📚' },
  { id: 'Deportes', label: 'Deportes', emoji: '⚽' },
  { id: 'Entretenimiento', label: 'Entretenimiento', emoji: '🎮' },
  { id: 'Gift Cards', label: 'Gift Cards', emoji: '🎁' },
  { id: 'Experiencias', label: 'Experiencias', emoji: '🎫' },
];

// ===== COMPONENT =====

export default function ParentRewardsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const { students: parentStudents, loading: studentsLoading } = useParentStudents();
  const parentId = user?.id || 'parent_demo';
  const parentName = user?.fullName || 'Familia Demo';

  const children = useMemo(() => {
    return parentStudents.map((student, idx) => {
      const points = Number((student as any)?.rewardsPoints?.availablePoints || (student as any)?.rewardsPoints?.points || 0);
      return {
        id: student.id,
        name: (student as any).name || student.fullName || 'Estudiante',
        photo: student.photo ? '👤' : idx % 2 === 0 ? '👦' : '👧',
        grade: student.grade,
        points,
      };
    });
  }, [parentStudents]);

  const [selectedChild, setSelectedChild] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showHealthOnly, setShowHealthOnly] = useState(false);
  const [useFamilyPool, setUseFamilyPool] = useState(true);
  const [purchasedPoints, setPurchasedPoints] = useState(0);
  const [pointsTopupOpen, setPointsTopupOpen] = useState(false);
  const [topupPoints, setTopupPoints] = useState('250');
  const [topupPreset, setTopupPreset] = useState<number | null>(250);
  const [studentPurchasesEnabled, setStudentPurchasesEnabled] = useState(true);
  const [suggestionCategory, setSuggestionCategory] = useState('Tecnología');
  const [suggestionText, setSuggestionText] = useState('');
  const [products, setProducts] = useState<RewardProduct[]>(DEFAULT_REWARDS);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (children.length === 0) {
      setSelectedChild('');
      return;
    }

    if (!selectedChild || !children.some(c => c.id === selectedChild)) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const child = children.find(c => c.id === selectedChild) || children[0];

  useEffect(() => {
    const mapCategory = (category: string): { label: string; emoji: string } => {
      const categoryMap: Record<string, { label: string; emoji: string }> = {
        TECH: { label: 'Tecnología', emoji: '💻' },
        SCHOOL_SUPPLIES: { label: 'Útiles', emoji: '📚' },
        SPORTS: { label: 'Deportes', emoji: '⚽' },
        ENTERTAINMENT: { label: 'Entretenimiento', emoji: '🎮' },
        GIFT_CARDS: { label: 'Gift Cards', emoji: '🎁' },
        EXPERIENCES: { label: 'Experiencias', emoji: '🎫' }
      };
      return categoryMap[category] || { label: category, emoji: '🎁' };
    };

    const loadRewardsState = async () => {
      setProductsLoading(true);
      try {
        const [marketProducts, prefs, topupTotal] = await Promise.all([
          rewardsService.getMarketplaceProducts(),
          rewardsService.getParentRewardsPreferences(parentId),
          rewardsService.getFamilyPointsTopupTotal(parentId)
        ]);

        if (marketProducts.length > 0) {
          const mapped: RewardProduct[] = marketProducts.map((item) => {
            const categoryInfo = mapCategory(String(item.category));
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              category: categoryInfo.label,
              categoryEmoji: categoryInfo.emoji,
              pointsCost: item.pointsCost,
              imageEmoji: item.imageUrl || '🎁',
              stock: item.currentStock,
              popularityScore: item.popularityScore,
              isHealthConcern: false
            };
          });

          setProducts(mapped);
        }

        setStudentPurchasesEnabled(prefs.studentPurchasesEnabled);
        setUseFamilyPool(prefs.useFamilyPool);
        setPurchasedPoints(topupTotal);
      } catch {
        // Keep default/fallback data in UI.
      } finally {
        setProductsLoading(false);
      }
    };

    void loadRewardsState();
  }, [parentId]);

  const familyPoints = useMemo(
    () => children.reduce((sum, kid) => sum + kid.points, 0) + purchasedPoints,
    [children, purchasedPoints],
  );

  const availablePoints = useFamilyPool ? familyPoints : (child?.points || 0);

  useEffect(() => {
    const routeState = location.state as { openPointsTopUp?: boolean } | null;
    if (routeState?.openPointsTopUp) {
      setPointsTopupOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHealth = !showHealthOnly || p.isHealthConcern;
      return matchesCategory && matchesSearch && matchesHealth && p.stock > 0;
    }).sort((a, b) => b.popularityScore - a.popularityScore);
  }, [products, selectedCategory, searchTerm, showHealthOnly]);

  const healthConcernCount = products.filter(r => r.isHealthConcern).length;

  if (studentsLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Cargando estudiantes...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <ParentNoStudentsState
        title="Premios Disponibles"
        description="Vincula al menos un estudiante para consultar y canjear recompensas."
      />
    );
  }

  if (!child) return null;

  const handleBuyPoints = async () => {
    const parsed = Number(topupPoints);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Monto invalido', 'Ingresa una cantidad valida de puntos.');
      return;
    }

    try {
      await rewardsService.recordFamilyPointsTopup({
        parentId,
        pointsAmount: parsed,
        note: 'Recarga manual desde portal de padres'
      });
      setPurchasedPoints(prev => prev + parsed);
      setPointsTopupOpen(false);
      toast.success('Puntos acreditados', `Se agregaron ${parsed} puntos a la bolsa familiar.`);
    } catch {
      toast.error('No se pudo acreditar', 'Intenta nuevamente en unos segundos.');
    }
  };

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) {
      toast.error('Sugerencia vacia', 'Escribe un producto para recomendar al marketplace.');
      return;
    }

    try {
      await rewardsService.submitMarketplaceSuggestion({
        parentId,
        parentName,
        category: suggestionCategory,
        suggestion: suggestionText.trim()
      });

      toast.success('Sugerencia enviada', `Se envio la recomendacion en categoria ${suggestionCategory}.`);
      setSuggestionText('');
    } catch {
      toast.error('No se pudo enviar', 'Intenta nuevamente en unos segundos.');
    }
  };

  const handleToggleStudentPurchases = async () => {
    const next = !studentPurchasesEnabled;
    setStudentPurchasesEnabled(next);
    try {
      await rewardsService.saveParentRewardsPreferences(parentId, {
        studentPurchasesEnabled: next,
        useFamilyPool
      });
    } catch {
      // Keep UI state and allow retry on next toggle.
    }
  };

  const handleToggleFamilyPool = async () => {
    const next = !useFamilyPool;
    setUseFamilyPool(next);
    try {
      await rewardsService.saveParentRewardsPreferences(parentId, {
        studentPurchasesEnabled,
        useFamilyPool: next
      });
    } catch {
      // Keep UI state and allow retry on next toggle.
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg md:rounded-2xl">
              <Star size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Premios Disponibles</h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Catálogo de recompensas canjeables con puntos</p>
            </div>
          </div>

          {/* Child Selector + Points */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                  selectedChild === c.id
                    ? 'border-indigo-400 bg-indigo-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-indigo-200'
                }`}
              >
                <span className="text-2xl">{c.photo}</span>
                <div className="text-left">
                  <p className="font-black text-sm text-slate-800">{c.name}</p>
                  <div className="flex items-center gap-1 text-indigo-600 mt-0.5">
                    <Zap size={12} />
                    <span className="font-black text-xs">{c.points} pts</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar premio..."
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowHealthOnly(!showHealthOnly)}
              className={`p-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                showHealthOnly
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle size={16} /> Alertas Alimentarias ({healthConcernCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Points Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">
              {useFamilyPool ? 'Bolsa Familiar Global' : `Puntos de ${child.name}`}
            </p>
            <p className="text-3xl md:text-4xl font-black mt-1">{availablePoints} pts</p>
            {useFamilyPool && (
              <p className="text-[11px] text-indigo-100 mt-1">
                {children.length} alumno(s) incluidos, sin restriccion por escuela
              </p>
            )}
          </div>
          <Zap size={48} className="text-yellow-300 opacity-50" />
        </div>

        {/* Family points mode */}
        <div className="parent-card border border-indigo-100 bg-indigo-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">Modo de Compra con Puntos</p>
              <p className="text-xs text-slate-500 mt-1">
                Puedes unificar puntos de toda la familia para canjear productos con una sola escala global.
                Si faltan puntos, puedes comprarlos desde aqui mismo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFamilyPool}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  useFamilyPool ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {useFamilyPool ? 'Usando Bolsa Familiar' : 'Usar Solo Alumno'}
              </button>
              <button
                onClick={() => setPointsTopupOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
              >
                Comprar Puntos
              </button>
            </div>
          </div>
        </div>

        <div className="parent-card border border-emerald-100 bg-emerald-50/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Permiso de compra para alumnos
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Los alumnos solo pueden comprar si este permiso esta habilitado por padres de familia.
              </p>
            </div>
            <button
              onClick={handleToggleStudentPurchases}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                studentPurchasesEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {studentPurchasesEnabled ? 'Compras Habilitadas' : 'Compras Bloqueadas'}
            </button>
          </div>
        </div>

        {/* Health concern alert */}
        {healthConcernCount > 0 && (
          <div className="parent-alert parent-alert--warning flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-slate-800">Premios con alerta alimentaria</p>
              <p className="text-xs text-slate-500 mt-1">
                {healthConcernCount} premio(s) contienen productos que podrían conflictuar con las restricciones alimenticias que configuraste.
                Están marcados con ⚠️ para que los identifiques fácilmente.
              </p>
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="parent-card text-center py-12">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-black text-slate-400 text-lg">No hay premios disponibles</p>
            <p className="text-xs text-slate-400 mt-2">Cambia los filtros para ver más opciones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const canAfford = availablePoints >= product.pointsCost;
              const canRedeem = canAfford && studentPurchasesEnabled;

              return (
                <div
                  key={product.id}
                  className={`parent-card overflow-hidden hover:-translate-y-1 transition-all ${
                    product.isHealthConcern ? 'ring-2 ring-amber-200' : ''
                  }`}
                >
                  {/* Product image area */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50 -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-4 p-6 md:p-8 text-center text-5xl md:text-6xl relative">
                    {product.imageEmoji?.startsWith('data:') || product.imageEmoji?.startsWith('http') ? (
                      <img
                        src={product.imageEmoji}
                        alt={product.name}
                        className="h-24 w-24 md:h-28 md:w-28 rounded-xl object-cover mx-auto"
                      />
                    ) : (
                      product.imageEmoji
                    )}
                    {product.isHealthConcern && (
                      <span className="absolute top-3 right-3 bg-amber-100 text-amber-600 p-1.5 rounded-lg">
                        <AlertTriangle size={16} />
                      </span>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-black text-slate-400 bg-white/80 px-2 py-1 rounded-lg">
                      {product.categoryEmoji} {product.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{product.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    </div>

                    {/* Stock & Popularity */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-600">{product.stock} disponibles</span>
                      <span className="text-slate-400">⭐ {product.popularityScore}% popular</span>
                    </div>

                    {/* Points cost */}
                    <div className={`rounded-lg p-3 flex items-center justify-between ${
                      canAfford ? 'bg-indigo-50' : 'bg-red-50'
                    }`}>
                      <span className="text-slate-600 font-bold text-xs">Costo:</span>
                      <div className={`flex items-center gap-1 font-black text-sm ${
                        canAfford ? 'text-indigo-600' : 'text-red-500'
                      }`}>
                        <Zap size={14} />
                        {product.pointsCost} pts
                      </div>
                    </div>

                    {/* Health warning */}
                    {product.isHealthConcern && product.healthNote && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-2">
                        <AlertTriangle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-amber-700">{product.healthNote}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className={`text-center py-2 rounded-lg text-xs font-black ${
                      canRedeem
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {canRedeem
                        ? useFamilyPool
                          ? `✓ La bolsa familiar puede canjear este premio`
                          : `✓ ${child.name} puede canjear este premio`
                        : !studentPurchasesEnabled
                          ? 'Compras deshabilitadas por padres'
                          : `Faltan ${Math.max(0, product.pointsCost - availablePoints)} pts`
                      }
                    </div>

                    {!canAfford && (
                      <button
                        onClick={() => {
                          setPointsTopupOpen(true);
                          const missing = Math.max(0, product.pointsCost - availablePoints);
                          setTopupPoints(String(Math.max(50, Math.ceil(missing / 50) * 50)));
                          setTopupPreset(null);
                        }}
                        className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                      >
                        Comprar Puntos Faltantes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <div className="parent-card bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-indigo-500" />
            <p className="font-black text-slate-800 text-sm">¿Cómo funcionan los puntos?</p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            <li>Los puntos se pueden canjear en el Marketplace de Recompensas desde la app del estudiante</li>
            <li>Como padre, puedes ver qué premios están disponibles y si alguno contradice las restricciones que configuraste</li>
            <li>Los premios marcados con ⚠️ contienen productos que podrían afectar la alimentación de tus hijos</li>
            <li>Si tienes dudas, consulta la sección de <strong>Límites</strong> para ajustar restricciones</li>
            <li>La <strong>bolsa familiar</strong> permite sumar puntos de todos los alumnos sin depender del colegio</li>
            <li>Si faltan puntos para un canje, puedes comprarlos con recarga directa</li>
            <li>Los alumnos compran solo cuando el permiso parental esta habilitado</li>
          </ul>
        </div>

        <div className="parent-card border border-sky-100 bg-sky-50/40 space-y-3">
          <p className="text-sm font-black text-slate-900">Sugerir productos al Marketplace</p>
          <p className="text-xs text-slate-500">Como familia puedes recomendar productos para que Admin los evalúe.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={suggestionCategory}
              onChange={e => setSuggestionCategory(e.target.value)}
              className="p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <input
              value={suggestionText}
              onChange={e => setSuggestionText(e.target.value)}
              placeholder="Ej. Kit de robotica para secundaria"
              className="sm:col-span-2 p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700"
            />
          </div>
          <button
            onClick={handleSendSuggestion}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
          >
            <Send size={14} /> Enviar Sugerencia
          </button>
        </div>
      </div>

      {pointsTopupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900">Comprar Puntos</h3>
              <button onClick={() => setPointsTopupOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Selecciona un paquete o escribe una cantidad personalizada.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[50, 250, 500, 1000].map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    setTopupPreset(preset);
                    setTopupPoints(String(preset));
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    topupPreset === preset
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset} pts
                </button>
              ))}
            </div>

            <label htmlFor="topup-points" className="text-xs font-black text-slate-500 uppercase tracking-widest">Puntos a comprar</label>
            <input
              id="topup-points"
              type="number"
              min={1}
              value={topupPoints}
              onChange={e => {
                setTopupPreset(null);
                setTopupPoints(e.target.value);
              }}
              className="w-full mt-2 p-3 rounded-xl border border-slate-200 font-black text-slate-700"
            />

            <button
              onClick={handleBuyPoints}
              className="w-full mt-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
            >
              Confirmar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
