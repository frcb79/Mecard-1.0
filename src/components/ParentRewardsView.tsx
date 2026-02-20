import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Search, Filter, Star, Package, Gift,
  AlertTriangle, Info, Eye, ShoppingBag, Tag
} from 'lucide-react';
import { useToast } from './ui/Toast';

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

// ===== MOCK DATA =====

const MOCK_CHILDREN = [
  { id: '2024001', name: 'Santiago González', photo: '👦', grade: '4° Primaria', points: 450 },
  { id: '2024002', name: 'Ana García', photo: '👧', grade: '2° Primaria', points: 320 },
];

const MOCK_REWARDS: RewardProduct[] = [
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
  const toast = useToast();

  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showHealthOnly, setShowHealthOnly] = useState(false);

  const child = MOCK_CHILDREN.find(c => c.id === selectedChild)!;

  const filteredProducts = useMemo(() => {
    return MOCK_REWARDS.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHealth = !showHealthOnly || p.isHealthConcern;
      return matchesCategory && matchesSearch && matchesHealth && p.stock > 0;
    }).sort((a, b) => b.popularityScore - a.popularityScore);
  }, [selectedCategory, searchTerm, showHealthOnly]);

  const healthConcernCount = MOCK_REWARDS.filter(r => r.isHealthConcern).length;

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
            {MOCK_CHILDREN.map(c => (
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
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Puntos de {child.name}</p>
            <p className="text-3xl md:text-4xl font-black mt-1">{child.points} pts</p>
          </div>
          <Zap size={48} className="text-yellow-300 opacity-50" />
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
              const canAfford = child.points >= product.pointsCost;

              return (
                <div
                  key={product.id}
                  className={`parent-card overflow-hidden hover:-translate-y-1 transition-all ${
                    product.isHealthConcern ? 'ring-2 ring-amber-200' : ''
                  }`}
                >
                  {/* Product image area */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50 -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-4 p-6 md:p-8 text-center text-5xl md:text-6xl relative">
                    {product.imageEmoji}
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
                      canAfford
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {canAfford
                        ? `✓ ${child.name} puede canjear este premio`
                        : `Faltan ${product.pointsCost - child.points} pts`
                      }
                    </div>
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
            <li>Los alumnos ganan puntos por buen comportamiento, asistencia y logros académicos</li>
            <li>Los puntos se pueden canjear en el Marketplace de Recompensas desde la app del estudiante</li>
            <li>Como padre, puedes ver qué premios están disponibles y si alguno contradice las restricciones que configuraste</li>
            <li>Los premios marcados con ⚠️ contienen productos que podrían afectar la alimentación de tus hijos</li>
            <li>Si tienes dudas, consulta la sección de <strong>Límites</strong> para ajustar restricciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
