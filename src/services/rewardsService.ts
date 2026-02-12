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
  mockProcessRedemption
};
