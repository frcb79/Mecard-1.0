import { FinancialProfile, SavingsGoal } from '../types';

/**
 * FinancialService
 * Handles student wallet operations: savings goals, money-to-points exchange, POS purchases
 * All percentages are configurable per school via businessModel
 */
export class FinancialService {
  
  /**
   * Create a savings goal (locks money from available balance)
   */
  static async createSavingsGoal(
    profile: FinancialProfile,
    name: string,
    amount: number,
    lockUntilDate: string
  ): Promise<FinancialProfile> {
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
    profile: FinancialProfile,
    goalId: string
  ): Promise<FinancialProfile> {
    const goal = profile.savingsGoals.find(g => g.id === goalId);
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
