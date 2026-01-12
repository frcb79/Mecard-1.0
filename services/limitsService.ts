import { SpendingLimit, Category } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const limitsService = {
  /**
   * Get spending limits for a specific student (set by parent)
   */
  async getStudentLimits(parentId: string, studentId: string): Promise<SpendingLimit | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/spending_limits?parent_id=eq.${parentId}&student_id=eq.${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch spending limits');
      }

      const limits = await response.json();
      return limits.length > 0 ? mapLimitFromDb(limits[0]) : null;
    } catch (error) {
      console.error('Error fetching spending limits:', error);
      return null;
    }
  },

  /**
   * Get all spending limits for a parent's children
   */
  async getParentLimits(parentId: string): Promise<SpendingLimit[]> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return [];
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/spending_limits?parent_id=eq.${parentId}&order_by=student_id.asc`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch spending limits');
      }

      const limits = await response.json();
      return limits.map(mapLimitFromDb);
    } catch (error) {
      console.error('Error fetching spending limits:', error);
      return [];
    }
  },

  /**
   * Create or update spending limits for a student
   */
  async setStudentLimits(
    parentId: string,
    studentId: string,
    schoolId: string,
    dailyLimit: number,
    weeklyLimit: number,
    monthlyLimit: number,
    restrictedCategories: Category[] = [],
    restrictedProducts: string[] = []
  ): Promise<SpendingLimit | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        id: `limit_${Date.now()}`,
        parentId,
        studentId,
        dailyLimit,
        weeklyLimit,
        monthlyLimit,
        restrictedCategories,
        restrictedProducts,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      // First check if limit exists
      const existingLimit = await this.getStudentLimits(parentId, studentId);

      const body = {
        parent_id: parentId,
        student_id: studentId,
        school_id: schoolId,
        daily_limit: dailyLimit,
        weekly_limit: weeklyLimit,
        monthly_limit: monthlyLimit,
        restricted_categories: restrictedCategories,
        restricted_products: restrictedProducts,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      let response;
      if (existingLimit) {
        // Update existing
        response = await fetch(
          `${SUPABASE_URL}/rest/v1/spending_limits?id=eq.${existingLimit.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(body),
          }
        );
      } else {
        // Create new
        response = await fetch(`${SUPABASE_URL}/rest/v1/spending_limits`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to set spending limits');
      }

      const limits = await response.json();
      return limits.length > 0 ? mapLimitFromDb(limits[0]) : null;
    } catch (error) {
      console.error('Error setting spending limits:', error);
      return null;
    }
  },

  /**
   * Toggle a spending limit on/off
   */
  async toggleLimitActive(limitId: string, isActive: boolean): Promise<boolean> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return true;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/spending_limits?id=eq.${limitId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error toggling limit:', error);
      return false;
    }
  },

  /**
   * Check if student has exceeded daily limit
   */
  async checkDailyLimitExceeded(
    parentId: string,
    studentId: string,
    amountToSpend: number
  ): Promise<{ exceeded: boolean; remaining: number }> {
    const limit = await this.getStudentLimits(parentId, studentId);

    if (!limit || !limit.isActive) {
      return { exceeded: false, remaining: Infinity };
    }

    // TODO: In production, fetch actual spent amount from transactions table
    // For now, return conservative estimate
    const spent = 0; // Mock value
    const remaining = Math.max(0, limit.dailyLimit - spent);

    return {
      exceeded: spent + amountToSpend > limit.dailyLimit,
      remaining,
    };
  },

  /**
   * Check if category is restricted
   */
  async isCategoryRestricted(
    parentId: string,
    studentId: string,
    category: Category
  ): Promise<boolean> {
    const limit = await this.getStudentLimits(parentId, studentId);

    if (!limit || !limit.isActive) {
      return false;
    }

    return limit.restrictedCategories.includes(category);
  },

  /**
   * Check if product is restricted
   */
  async isProductRestricted(
    parentId: string,
    studentId: string,
    productId: string
  ): Promise<boolean> {
    const limit = await this.getStudentLimits(parentId, studentId);

    if (!limit || !limit.isActive) {
      return false;
    }

    return limit.restrictedProducts.includes(productId);
  },
};

// Helper function to map database responses
function mapLimitFromDb(dbLimit: any): SpendingLimit {
  return {
    id: dbLimit.id,
    parentId: dbLimit.parent_id,
    studentId: dbLimit.student_id,
    dailyLimit: dbLimit.daily_limit,
    weeklyLimit: dbLimit.weekly_limit,
    monthlyLimit: dbLimit.monthly_limit,
    restrictedCategories: dbLimit.restricted_categories || [],
    restrictedProducts: dbLimit.restricted_products || [],
    isActive: dbLimit.is_active,
    createdAt: dbLimit.created_at,
    updatedAt: dbLimit.updated_at,
  };
}
