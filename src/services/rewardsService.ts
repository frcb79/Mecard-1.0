/**
 * MeCard Rewards Service
 * Gestiona la lógica de puntos, tiers, canjes y transacciones de rewards
 */

import {
  StudentRewardsPoints,
  SchoolRewardsConfig,
  PointsTransaction,
  PointsTransactionType,
  RewardsTier,
  MarketplaceProduct,
  StudentRedemption,
  POSTransactionWithRewards,
  RedemptionStatus
} from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export interface MarketplaceSuggestion {
  id: string;
  parentId: string;
  parentName?: string;
  category: string;
  suggestion: string;
  status: 'NEW' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ParentRewardsPreferences {
  parentId: string;
  studentPurchasesEnabled: boolean;
  useFamilyPool: boolean;
  updatedAt: string;
}

interface FamilyPointsTopup {
  id: string;
  parentId: string;
  pointsAmount: number;
  source: 'MANUAL_TOPUP';
  note?: string;
  createdAt: string;
}

interface CreateMarketplaceProductInput {
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  stockQuantity: number;
  currentStock?: number;
  imageUrl?: string;
  featured?: boolean;
  available?: boolean;
  schoolId?: string;
  popularityScore?: number;
}

const STORAGE_KEYS = {
  products: 'mecard_marketplace_products',
  suggestions: 'mecard_marketplace_suggestions',
  parentPrefs: 'mecard_parent_rewards_preferences',
  topups: 'mecard_family_points_topups'
} as const;

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures to avoid blocking UI flows.
  }
};

const toMarketplaceProduct = (row: any): MarketplaceProduct => ({
  id: String(row.id),
  name: String(row.name),
  description: String(row.description || ''),
  category: row.category as any,
  pointsCost: Number(row.points_cost || 0),
  stockQuantity: Number(row.stock_quantity || 0),
  currentStock: Number(row.current_stock || 0),
  imageUrl: row.image_url || undefined,
  featured: Boolean(row.featured),
  available: Boolean(row.available),
  schoolId: row.school_id || undefined,
  popularityScore: Number(row.popularity_score || 0),
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
});

const nowIso = () => new Date().toISOString();

const getLocalProducts = (): MarketplaceProduct[] =>
  readStorage<MarketplaceProduct[]>(STORAGE_KEYS.products, []);

const setLocalProducts = (products: MarketplaceProduct[]) => {
  writeStorage(STORAGE_KEYS.products, products);
};

const getLocalSuggestions = (): MarketplaceSuggestion[] =>
  readStorage<MarketplaceSuggestion[]>(STORAGE_KEYS.suggestions, []);

const setLocalSuggestions = (suggestions: MarketplaceSuggestion[]) => {
  writeStorage(STORAGE_KEYS.suggestions, suggestions);
};

const getLocalParentPrefs = (): ParentRewardsPreferences[] =>
  readStorage<ParentRewardsPreferences[]>(STORAGE_KEYS.parentPrefs, []);

const setLocalParentPrefs = (prefs: ParentRewardsPreferences[]) => {
  writeStorage(STORAGE_KEYS.parentPrefs, prefs);
};

const getLocalTopups = (): FamilyPointsTopup[] =>
  readStorage<FamilyPointsTopup[]>(STORAGE_KEYS.topups, []);

const setLocalTopups = (topups: FamilyPointsTopup[]) => {
  writeStorage(STORAGE_KEYS.topups, topups);
};

export const getMarketplaceProducts = async (
  schoolId?: string,
  featured?: boolean
): Promise<MarketplaceProduct[]> => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('marketplace_products')
        .select('*')
        .eq('available', true)
        .order('popularity_score', { ascending: false });

      if (featured) {
        query = query.eq('featured', true);
      }

      if (schoolId) {
        query = query.or(`school_id.is.null,school_id.eq.${schoolId}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const products = data.map(toMarketplaceProduct);
        if (products.length > 0) return products;
      }
    } catch {
      // Fall back to local/mock data when table/policy is not available.
    }
  }

  const localProducts = getLocalProducts();
  if (localProducts.length > 0) {
    return localProducts
      .filter((p) => (!featured || p.featured) && (!schoolId || !p.schoolId || p.schoolId === schoolId))
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }

  return mockGetMarketplaceProducts(schoolId, featured);
};

export const createMarketplaceProduct = async (
  payload: CreateMarketplaceProductInput
): Promise<MarketplaceProduct> => {
  const product: MarketplaceProduct = {
    id: `mkp_${Date.now()}`,
    name: payload.name,
    description: payload.description,
    category: payload.category as any,
    pointsCost: payload.pointsCost,
    stockQuantity: payload.stockQuantity,
    currentStock: payload.currentStock ?? payload.stockQuantity,
    imageUrl: payload.imageUrl,
    featured: payload.featured ?? false,
    available: payload.available ?? true,
    schoolId: payload.schoolId,
    popularityScore: payload.popularityScore ?? 50,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .insert({
          name: payload.name,
          description: payload.description,
          category: payload.category,
          points_cost: payload.pointsCost,
          stock_quantity: payload.stockQuantity,
          current_stock: payload.currentStock ?? payload.stockQuantity,
          image_url: payload.imageUrl,
          featured: payload.featured ?? false,
          available: payload.available ?? true,
          school_id: payload.schoolId,
          popularity_score: payload.popularityScore ?? 50
        })
        .select('*')
        .single();

      if (!error && data) {
        return toMarketplaceProduct(data);
      }
    } catch {
      // Keep local fallback below.
    }
  }

  const current = getLocalProducts();
  setLocalProducts([product, ...current]);
  return product;
};

export const submitMarketplaceSuggestion = async (input: {
  parentId: string;
  parentName?: string;
  category: string;
  suggestion: string;
}): Promise<MarketplaceSuggestion> => {
  const suggestion: MarketplaceSuggestion = {
    id: `sug_${Date.now()}`,
    parentId: input.parentId,
    parentName: input.parentName,
    category: input.category,
    suggestion: input.suggestion,
    status: 'NEW',
    createdAt: nowIso()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('marketplace_suggestions')
        .insert({
          parent_id: input.parentId,
          parent_name: input.parentName || null,
          category: input.category,
          suggestion: input.suggestion,
          status: 'NEW'
        })
        .select('*')
        .single();

      if (!error && data) {
        return {
          id: String(data.id),
          parentId: String(data.parent_id),
          parentName: data.parent_name || undefined,
          category: String(data.category),
          suggestion: String(data.suggestion),
          status: data.status,
          createdAt: data.created_at || nowIso()
        };
      }
    } catch {
      // Keep local fallback below.
    }
  }

  const current = getLocalSuggestions();
  setLocalSuggestions([suggestion, ...current]);
  return suggestion;
};

export const getMarketplaceSuggestions = async (): Promise<MarketplaceSuggestion[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('marketplace_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          id: String(item.id),
          parentId: String(item.parent_id),
          parentName: item.parent_name || undefined,
          category: String(item.category),
          suggestion: String(item.suggestion),
          status: item.status,
          createdAt: item.created_at || nowIso()
        }));
      }
    } catch {
      // Keep local fallback below.
    }
  }

  return getLocalSuggestions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getParentRewardsPreferences = async (
  parentId: string
): Promise<ParentRewardsPreferences> => {
  const fallback: ParentRewardsPreferences = {
    parentId,
    studentPurchasesEnabled: true,
    useFamilyPool: true,
    updatedAt: nowIso()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('parent_rewards_preferences')
        .select('*')
        .eq('parent_id', parentId)
        .single();

      if (!error && data) {
        return {
          parentId: String(data.parent_id),
          studentPurchasesEnabled: Boolean(data.student_purchases_enabled),
          useFamilyPool: Boolean(data.use_family_pool),
          updatedAt: data.updated_at || nowIso()
        };
      }
    } catch {
      // Keep local fallback below.
    }
  }

  const local = getLocalParentPrefs().find((item) => item.parentId === parentId);
  return local || fallback;
};

export const saveParentRewardsPreferences = async (
  parentId: string,
  patch: Partial<Omit<ParentRewardsPreferences, 'parentId' | 'updatedAt'>>
): Promise<ParentRewardsPreferences> => {
  const current = await getParentRewardsPreferences(parentId);
  const merged: ParentRewardsPreferences = {
    ...current,
    ...patch,
    parentId,
    updatedAt: nowIso()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('parent_rewards_preferences')
        .upsert({
          parent_id: parentId,
          student_purchases_enabled: merged.studentPurchasesEnabled,
          use_family_pool: merged.useFamilyPool,
          updated_at: nowIso()
        }, { onConflict: 'parent_id' })
        .select('*')
        .single();

      if (!error && data) {
        return {
          parentId: String(data.parent_id),
          studentPurchasesEnabled: Boolean(data.student_purchases_enabled),
          useFamilyPool: Boolean(data.use_family_pool),
          updatedAt: data.updated_at || nowIso()
        };
      }
    } catch {
      // Keep local fallback below.
    }
  }

  const all = getLocalParentPrefs().filter((item) => item.parentId !== parentId);
  setLocalParentPrefs([merged, ...all]);
  return merged;
};

export const recordFamilyPointsTopup = async (input: {
  parentId: string;
  pointsAmount: number;
  note?: string;
}): Promise<FamilyPointsTopup> => {
  const tx: FamilyPointsTopup = {
    id: `topup_${Date.now()}`,
    parentId: input.parentId,
    pointsAmount: input.pointsAmount,
    source: 'MANUAL_TOPUP',
    note: input.note,
    createdAt: nowIso()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('family_points_topups')
        .insert({
          parent_id: input.parentId,
          points_amount: input.pointsAmount,
          source: 'MANUAL_TOPUP',
          note: input.note || null
        })
        .select('*')
        .single();

      if (!error && data) {
        return {
          id: String(data.id),
          parentId: String(data.parent_id),
          pointsAmount: Number(data.points_amount || 0),
          source: 'MANUAL_TOPUP',
          note: data.note || undefined,
          createdAt: data.created_at || nowIso()
        };
      }
    } catch {
      // Keep local fallback below.
    }
  }

  const all = getLocalTopups();
  setLocalTopups([tx, ...all]);
  return tx;
};

export const getFamilyPointsTopupTotal = async (parentId: string): Promise<number> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('family_points_topups')
        .select('points_amount')
        .eq('parent_id', parentId);

      if (!error && data) {
        return data.reduce((sum: number, row: any) => sum + Number(row.points_amount || 0), 0);
      }
    } catch {
      // Keep local fallback below.
    }
  }

  return getLocalTopups()
    .filter((item) => item.parentId === parentId)
    .reduce((sum, item) => sum + item.pointsAmount, 0);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calcula los puntos ganados a partir de una compra en POS
 * Formula: (monto_base × markup_porcentaje × puntos_por_peso)
 */
export const calculatePointsFromPurchase = (
  baseAmount: number,
  config: SchoolRewardsConfig
): { markupAmount: number; pointsEarned: number } => {
  const markupAmount = baseAmount * (config.markupPercentage / 100);
  const pointsEarned = Math.floor(markupAmount * config.pointsPerPeso);

  return { markupAmount, pointsEarned };
};

/**
 * Determina el tier basado en puntos acumulados
 */
export const calculateTierFromPoints = (
  earnedPoints: number,
  thresholds: SchoolRewardsConfig['tierThresholds']
): RewardsTier => {
  if (earnedPoints >= thresholds.platinum) return RewardsTier.PLATINUM;
  if (earnedPoints >= thresholds.gold) return RewardsTier.GOLD;
  if (earnedPoints >= thresholds.silver) return RewardsTier.SILVER;
  return RewardsTier.BRONZE;
};

/**
 * Calcula el progreso hacia el siguiente tier
 */
export const calculateProgressToNextTier = (
  currentPoints: number,
  currentTier: RewardsTier,
  thresholds: SchoolRewardsConfig['tierThresholds']
): { nextTier: RewardsTier | null; pointsNeeded: number; progressPercent: number } => {
  const tierProgression = [
    { tier: RewardsTier.BRONZE, threshold: 0 },
    { tier: RewardsTier.SILVER, threshold: thresholds.silver },
    { tier: RewardsTier.GOLD, threshold: thresholds.gold },
    { tier: RewardsTier.PLATINUM, threshold: thresholds.platinum }
  ];

  const currentIndex = tierProgression.findIndex(t => t.tier === currentTier);
  if (currentIndex === -1 || currentIndex === tierProgression.length - 1) {
    return { nextTier: null, pointsNeeded: 0, progressPercent: 100 };
  }

  const nextTierLevel = tierProgression[currentIndex + 1];
  const pointsNeeded = Math.max(0, nextTierLevel.threshold - currentPoints);
  const currentThreshold = tierProgression[currentIndex].threshold;
  const tierRange = nextTierLevel.threshold - currentThreshold;
  const progressInRange = currentPoints - currentThreshold;
  const progressPercent = Math.min(100, (progressInRange / tierRange) * 100);

  return {
    nextTier: nextTierLevel.tier,
    pointsNeeded,
    progressPercent
  };
};

/**
 * Genera descripción de transacción de puntos
 */
export const generatePointsTransactionDescription = (
  type: PointsTransactionType,
  metadata?: Record<string, any>
): string => {
  switch (type) {
    case PointsTransactionType.EARN:
      return `Compra en ${metadata?.category || 'Cafetería'} - ${metadata?.description || 'Transacción'}`;
    case PointsTransactionType.REDEEM:
      return `Canje: ${metadata?.productName || 'Producto del Marketplace'}`;
    case PointsTransactionType.EXPIRE:
      return `Expiración de puntos - Fin de ciclo ${metadata?.cycleYear || 'escolar'}`;
    case PointsTransactionType.ADJUST:
      return `Ajuste de puntos${metadata?.reason ? `: ${metadata.reason}` : ''}`;
    default:
      return 'Transacción de puntos';
  }
};

/**
 * Obtiene información visual del tier
 */
export const getTierInfo = (tier: RewardsTier) => {
  const tiers = {
    [RewardsTier.BRONZE]: {
      color: 'bg-orange-100 text-orange-700',
      icon: '🥉',
      label: 'Bronze',
      bonus: '0%'
    },
    [RewardsTier.SILVER]: {
      color: 'bg-gray-100 text-gray-700',
      icon: '🥈',
      label: 'Silver',
      bonus: '5%'
    },
    [RewardsTier.GOLD]: {
      color: 'bg-yellow-100 text-yellow-700',
      icon: '🥇',
      label: 'Gold',
      bonus: '10%'
    },
    [RewardsTier.PLATINUM]: {
      color: 'bg-purple-100 text-purple-700',
      icon: '💎',
      label: 'Platinum',
      bonus: '15%'
    }
  };

  return tiers[tier];
};

/**
 * Valida si un estudiante puede hacer un canje
 */
export const validateRedemption = (
  studentPoints: StudentRewardsPoints,
  product: MarketplaceProduct
): { valid: boolean; reason?: string } => {
  if (!product.available) {
    return { valid: false, reason: 'Producto no disponible' };
  }

  if (product.currentStock <= 0) {
    return { valid: false, reason: 'Producto agotado' };
  }

  if (studentPoints.totalPoints < product.pointsCost) {
    return {
      valid: false,
      reason: `Necesitas ${product.pointsCost - studentPoints.totalPoints} puntos más`
    };
  }

  return { valid: true };
};

/**
 * Calcula la próxima expiración de puntos
 */
export const getNextExpirationDate = (cycleEndDate: string): Date => {
  return new Date(cycleEndDate);
};

/**
 * Formatea puntos para visualización
 */
export const formatPoints = (points: number): string => {
  return points.toLocaleString('es-MX');
};

/**
 * Calcula el multiplicador de puntos por tier
 */
export const getPointsMultiplier = (tier: RewardsTier): number => {
  const multipliers = {
    [RewardsTier.BRONZE]: 1.0,
    [RewardsTier.SILVER]: 1.05,
    [RewardsTier.GOLD]: 1.1,
    [RewardsTier.PLATINUM]: 1.15
  };

  return multipliers[tier];
};

// ============================================
// MOCK SERVICE FUNCTIONS (para desarrollo)
// ============================================

/**
 * MOCK: Obtiene configuración de rewards de una escuela
 */
export const mockGetSchoolRewardsConfig = async (
  schoolId: string
): Promise<SchoolRewardsConfig> => {
  return {
    id: `config_${schoolId}`,
    schoolId,
    markupPercentage: 10,
    pointsPerPeso: 10,
    enabled: true,
    cycleStartDate: '2025-08-01',
    cycleEndDate: '2026-06-30',
    tierThresholds: {
      silver: 1000,
      gold: 3000,
      platinum: 7000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * MOCK: Obtiene puntos de rewards de un estudiante
 */
export const mockGetStudentRewardsPoints = async (
  studentId: string,
  schoolId: string
): Promise<StudentRewardsPoints> => {
  const earnedPoints = 2450;
  const config = await mockGetSchoolRewardsConfig(schoolId);
  const tier = calculateTierFromPoints(earnedPoints, config.tierThresholds);

  return {
    studentId,
    schoolId,
    totalPoints: 2450,
    earnedThisCycle: earnedPoints,
    redeemedThisCycle: 3220,
    tier,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * MOCK: Historial de transacciones de puntos
 */
export const mockGetPointsTransactionHistory = async (
  studentId: string,
  limit: number = 10
): Promise<PointsTransaction[]> => {
  return [
    {
      id: 'tx_1',
      studentId,
      schoolId: 'school_1',
      type: PointsTransactionType.EARN,
      pointsAmount: 45,
      referenceId: 'pos_tx_456',
      description: 'Compra en Cafetería - Sandwich',
      createdAt: new Date('2026-02-10T10:30:00').toISOString()
    },
    {
      id: 'tx_2',
      studentId,
      schoolId: 'school_1',
      type: PointsTransactionType.REDEEM,
      pointsAmount: -1800,
      referenceId: 'red_123',
      description: 'Canje: Mochila Escolar Premium',
      createdAt: new Date('2026-02-08T14:20:00').toISOString()
    },
    {
      id: 'tx_3',
      studentId,
      schoolId: 'school_1',
      type: PointsTransactionType.EARN,
      pointsAmount: 120,
      referenceId: 'pos_tx_789',
      description: 'Compra en Papelería',
      createdAt: new Date('2026-02-05T09:15:00').toISOString()
    }
  ];
};

/**
 * MOCK: Marketplace products
 */
export const mockGetMarketplaceProducts = async (
  schoolId?: string,
  featured?: boolean
): Promise<MarketplaceProduct[]> => {
  const products: MarketplaceProduct[] = [
    {
      id: 'prod_1',
      name: 'Audífonos Bluetooth',
      description: 'Audífonos inalámbricos con cancelación de ruido',
      category: 'TECH' as any,
      pointsCost: 2500,
      stockQuantity: 15,
      currentStock: 12,
      imageUrl: '🎧',
      featured: true,
      available: true,
      popularityScore: 95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      name: 'Mochila Escolar Premium',
      description: 'Mochila resistente con compartimento para laptop',
      category: 'SCHOOL_SUPPLIES' as any,
      pointsCost: 1800,
      stockQuantity: 20,
      currentStock: 18,
      imageUrl: '🎒',
      featured: true,
      available: true,
      popularityScore: 88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      name: 'Balón de Fútbol Profesional',
      description: 'Balón oficial tamaño 5',
      category: 'SPORTS' as any,
      pointsCost: 1200,
      stockQuantity: 10,
      currentStock: 8,
      imageUrl: '⚽',
      featured: false,
      available: true,
      popularityScore: 82,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      name: 'Gift Card Amazon $500',
      description: 'Tarjeta de regalo Amazon por $500 MXN',
      category: 'GIFT_CARDS' as any,
      pointsCost: 5000,
      stockQuantity: 50,
      currentStock: 45,
      imageUrl: '🎁',
      featured: true,
      available: true,
      popularityScore: 98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_5',
      name: 'Smartwatch Deportivo',
      description: 'Reloj inteligente con monitor de actividad',
      category: 'TECH' as any,
      pointsCost: 4200,
      stockQuantity: 8,
      currentStock: 5,
      imageUrl: '⌚',
      featured: true,
      available: true,
      popularityScore: 92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_6',
      name: 'Set de Arte Profesional',
      description: 'Kit completo de pintura y dibujo',
      category: 'SCHOOL_SUPPLIES' as any,
      pointsCost: 950,
      stockQuantity: 25,
      currentStock: 22,
      imageUrl: '🎨',
      featured: false,
      available: true,
      popularityScore: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_7',
      name: 'Entrada Cine 2x1',
      description: 'Dos entradas para cualquier película',
      category: 'EXPERIENCES' as any,
      pointsCost: 800,
      stockQuantity: 100,
      currentStock: 95,
      imageUrl: '🎬',
      featured: false,
      available: true,
      popularityScore: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_8',
      name: 'Consola Nintendo Switch',
      description: 'Consola de videojuegos portátil',
      category: 'ENTERTAINMENT' as any,
      pointsCost: 8500,
      stockQuantity: 3,
      currentStock: 2,
      imageUrl: '🎮',
      featured: true,
      available: true,
      popularityScore: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return products.filter(
    p => (!featured || p.featured) && (!schoolId || !p.schoolId || p.schoolId === schoolId)
  );
};

/**
 * MOCK: Procesa un canje de rewards
 */
export const mockProcessRedemption = async (
  studentId: string,
  productId: string,
  pointsSpent: number
): Promise<StudentRedemption> => {
  const products = await mockGetMarketplaceProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  return {
    id: `red_${Date.now()}`,
    studentId,
    schoolId: 'school_1',
    product,
    pointsSpent,
    status: RedemptionStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// ============================================
// EXPORT PUBLIC API
// ============================================

export const rewardsService = {
  // Calculations
  calculatePointsFromPurchase,
  calculateTierFromPoints,
  calculateProgressToNextTier,
  getTierInfo,
  getPointsMultiplier,
  validateRedemption,
  getNextExpirationDate,
  formatPoints,
  generatePointsTransactionDescription,

  // Mock API (replace with real Supabase calls later)
  mockGetSchoolRewardsConfig,
  mockGetStudentRewardsPoints,
  mockGetPointsTransactionHistory,
  mockGetMarketplaceProducts,
  mockProcessRedemption,

  // Real/fallback API
  getMarketplaceProducts,
  createMarketplaceProduct,
  submitMarketplaceSuggestion,
  getMarketplaceSuggestions,
  getParentRewardsPreferences,
  saveParentRewardsPreferences,
  recordFamilyPointsTopup,
  getFamilyPointsTopupTotal
};
