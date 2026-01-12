import { supabaseClient } from './supabaseClient';

/**
 * FinancialService
 * Maneja operaciones de billeteras, saldos y transacciones
 * Integración con Supabase RLS
 */
export interface StudentBalance {
  studentId: bigint;
  balance: number;
  lockedBalance?: number;
  totalPoints?: number;
  schoolId: bigint;
}

export interface TransactionRecord {
  id: bigint;
  studentId: bigint;
  amount: number;
  type: 'deposit' | 'purchase' | 'refund' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  productId?: bigint;
  operatingUnitId?: bigint;
  referenceId?: string;
  createdAt: string;
}

export class FinancialService {
  /**
   * Obtiene el balance actual de un estudiante
   */
  static async getStudentBalance(studentId: bigint, schoolId: bigint): Promise<StudentBalance | null> {
    try {
      const { data, error } = await supabaseClient
        .from('financial_profiles')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }

      return {
        studentId: data.student_id,
        balance: parseFloat(data.balance),
        lockedBalance: data.locked_balance ? parseFloat(data.locked_balance) : 0,
        totalPoints: data.total_points || 0,
        schoolId: data.school_id,
      };
    } catch (err) {
      console.error('Error in getStudentBalance:', err);
      return null;
    }
  }

  /**
   * Obtiene balances de múltiples estudiantes (por padres)
   */
  static async getStudentBalancesByParent(parentUserId: string, schoolId: bigint): Promise<StudentBalance[]> {
    try {
      // 1. Obtener estudiantes del padre
      const { data: links } = await supabaseClient
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_user_id', parentUserId)
        .eq('school_id', schoolId);

      if (!links || links.length === 0) {
        return [];
      }

      const studentIds = links.map((link) => link.student_id);

      // 2. Obtener balances de esos estudiantes
      const { data, error } = await supabaseClient
        .from('financial_profiles')
        .select('*')
        .in('student_id', studentIds)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error fetching parent balances:', error);
        return [];
      }

      return (data || []).map((profile) => ({
        studentId: profile.student_id,
        balance: parseFloat(profile.balance),
        lockedBalance: profile.locked_balance ? parseFloat(profile.locked_balance) : 0,
        totalPoints: profile.total_points || 0,
        schoolId: profile.school_id,
      }));
    } catch (err) {
      console.error('Error in getStudentBalancesByParent:', err);
      return [];
    }
  }

  /**
   * Obtiene el historial de transacciones de un estudiante
   */
  static async getStudentTransactionHistory(
    studentId: bigint,
    schoolId: bigint,
    limit: number = 50,
    offset: number = 0
  ): Promise<TransactionRecord[]> {
    try {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select(
          `
          id, student_id, amount, type, status, product_id, 
          operating_unit_id, reference_id, created_at
        `
        )
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return (data || []).map((txn) => ({
        id: txn.id,
        studentId: txn.student_id,
        amount: parseFloat(txn.amount),
        type: txn.type,
        status: txn.status,
        productId: txn.product_id,
        operatingUnitId: txn.operating_unit_id,
        referenceId: txn.reference_id,
        createdAt: txn.created_at,
      }));
    } catch (err) {
      console.error('Error in getStudentTransactionHistory:', err);
      return [];
    }
  }

  /**
   * Create a savings goal (locks money from available balance)
   */
  static async createSavingsGoal(
    profile: any,
    name: string,
    amount: number,
    lockUntilDate: string
  ): Promise<any> {
    if (profile.wallet.availableBalance < amount) {
      throw new Error('Fondos insuficientes en saldo disponible para apartar esta cantidad.');
    }

    profile.wallet.availableBalance -= amount;
    profile.wallet.lockedBalance += amount;

    profile.savingsGoals.push({
      id: `goal_${Date.now()}`,
      name,
      targetAmount: amount,
      currentAmount: amount,
      isLocked: true,
      releaseDate: lockUntilDate,
      status: 'active'
    });

    profile.updatedAt = new Date().toISOString();
    return profile;
  }

  /**
   * Complete/release a savings goal (unlock money)
   */
  static async releaseSavingsGoal(
    profile: any,
    goalId: string
  ): Promise<any> {
    const goal = profile.savingsGoals.find((g: any) => g.id === goalId);
    if (!goal) {
      throw new Error('Meta de ahorro no encontrada.');
    }

    if (goal.status !== 'active') {
      throw new Error('Esta meta no puede ser liberada.');
    }

    profile.wallet.lockedBalance -= goal.currentAmount;
    profile.wallet.availableBalance += goal.currentAmount;
    goal.status = 'completed';
    goal.isLocked = false;

    profile.updatedAt = new Date().toISOString();
    return profile;
  }

  /**
   * Exchange money for points
   * Used for gamification: student can convert available money to points for marketplace
   */
  static async exchangeMoneyForPoints(
    profile: FinancialProfile,
    amount: number,
    exchangeRate: number
  ): Promise<FinancialProfile> {
    if (profile.wallet.availableBalance < amount) {
      throw new Error('Fondos insuficientes para realizar el canje.');
    }

    profile.wallet.availableBalance -= amount;
    profile.wallet.points += Math.floor(amount * exchangeRate);

    profile.updatedAt = new Date().toISOString();
    return profile;
  }

  /**
   * Process POS purchase with dynamic markup and incentives
   * Markup is applied to base price, portion goes to POS operator incentive
   * 
   * @param basePrice - Original menu/product price
   * @param posMarkupPercent - School-configured markup (e.g., 15)
   * @param posOperatorIncentivePercent - % of markup that goes to POS operator (e.g., 20)
   * @param pointsExchangeRate - Points awarded per currency unit (e.g., 10 points per unit)
   */
  static async processPosPurchase(
    profile: FinancialProfile,
    basePrice: number,
    posMarkupPercent: number,
    posOperatorIncentivePercent: number,
    pointsExchangeRate: number
  ): Promise<{
    success: boolean;
    finalPrice: number;
    pointsEarned: number;
    posCommissionEarned: number;
    platformRevenueShare: number;
    remainingBalance: number;
  }> {
    const markupFraction = posMarkupPercent / 100;
    const incentiveFraction = posOperatorIncentivePercent / 100;

    const finalPrice = basePrice * (1 + markupFraction);
    const profitMargin = finalPrice - basePrice;
    const posCommission = profitMargin * incentiveFraction;
    const platformRevenueShare = profitMargin - posCommission;
    const pointsToAward = Math.floor(finalPrice * pointsExchangeRate);

    if (profile.wallet.availableBalance < finalPrice) {
      throw new Error('Saldo insuficiente para realizar la compra.');
    }

    profile.wallet.availableBalance -= finalPrice;
    profile.wallet.points += pointsToAward;
    profile.updatedAt = new Date().toISOString();

    return {
      success: true,
      finalPrice,
      pointsEarned: pointsToAward,
      posCommissionEarned: posCommission,
      platformRevenueShare,
      remainingBalance: profile.wallet.availableBalance
    };
  }

  /**
   * Initialize a new FinancialProfile for a student
   */
  static createEmptyProfile(studentId: string, schoolId: string): FinancialProfile {
    const now = new Date().toISOString();
    return {
      studentId,
      schoolId,
      wallet: {
        availableBalance: 0,
        lockedBalance: 0,
        points: 0
      },
      savingsGoals: [],
      createdAt: now,
      updatedAt: now
    };
  }
}
