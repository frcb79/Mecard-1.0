import { supabaseClient } from './supabaseClient';

/**
 * Parent Deposit Service
 * Maneja depósitos de padres a las billeteras de sus hijos
 */

export interface DepositRequest {
  parentUserId: string;
  studentId: bigint;
  amount: number;
  schoolId: bigint;
  paymentMethod?: string;
  notes?: string;
}

export interface Deposit {
  id: string;
  parentId: string;
  amount: number;
        paymentMethodId,
        status: 'COMPLETED',
        depositDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/deposits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          parent_id: parentId,
          amount,
          payment_method_id: paymentMethodId,
          school_id: schoolId,
          status: 'PENDING',
          deposit_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deposit');
      }

      const deposit = await response.json();
      return mapDepositFromDb(deposit);
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  },

  /**
   * Get all deposits for a parent
   */
  async getParentDeposits(parentId: string): Promise<Deposit[]> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return [];
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/deposits?parent_id=eq.${parentId}&order_by=deposit_date.desc`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch deposits');
      }

      const deposits = await response.json();
      return deposits.map(mapDepositFromDb);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      return [];
    }
  },

  /**
   * Get deposit by ID
   */
  async getDepositById(depositId: string): Promise<Deposit | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/deposits?id=eq.${depositId}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch deposit');
      }

      const deposits = await response.json();
      return deposits.length > 0 ? mapDepositFromDb(deposits[0]) : null;
    } catch (error) {
      console.error('Error fetching deposit:', error);
      return null;
    }
  },

  /**
   * Update deposit status (e.g., when payment completes)
   */
  async updateDepositStatus(
    depositId: string,
    status: 'COMPLETED' | 'FAILED' | 'CANCELLED',
    speiReference?: string,
    failureReason?: string
  ): Promise<Deposit | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'COMPLETED') {
        updateData.completed_date = new Date().toISOString();
        if (speiReference) {
          updateData.spei_reference = speiReference;
        }
      }

      if (status === 'FAILED' && failureReason) {
        updateData.failure_reason = failureReason;
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/deposits?id=eq.${depositId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update deposit');
      }

      const deposits = await response.json();
      return deposits.length > 0 ? mapDepositFromDb(deposits[0]) : null;
    } catch (error) {
      console.error('Error updating deposit:', error);
      return null;
    }
  },

  /**
   * Get payment methods for a parent
   */
  async getPaymentMethods(parentId: string): Promise<PaymentMethod[]> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return [];
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_methods?parent_id=eq.${parentId}&order_by=is_default.desc`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const methods = await response.json();
      return methods.map(mapPaymentMethodFromDb);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  /**
   * Add a new payment method
   */
  async addPaymentMethod(
    parentId: string,
    type: 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_ACCOUNT',
    last4: string,
    expiryMonth?: number,
    expiryYear?: number
  ): Promise<PaymentMethod | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        id: `pm_${Date.now()}`,
        parentId,
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_methods`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            parent_id: parentId,
            type,
            last4,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            is_default: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      const method = await response.json();
      return mapPaymentMethodFromDb(method);
    } catch (error) {
      console.error('Error adding payment method:', error);
      return null;
    }
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return true;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_methods?id=eq.${paymentMethodId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  },
};

// Helper functions to map database responses to TypeScript types
function mapDepositFromDb(dbDeposit: any): Deposit {
  return {
    id: dbDeposit.id,
    parentId: dbDeposit.parent_id,
    amount: dbDeposit.amount,
    paymentMethodId: dbDeposit.payment_method_id,
    status: dbDeposit.status,
    depositDate: dbDeposit.deposit_date,
    completedDate: dbDeposit.completed_date,
    speiReference: dbDeposit.spei_reference,
    failureReason: dbDeposit.failure_reason,
    createdAt: dbDeposit.created_at,
    updatedAt: dbDeposit.updated_at,
  };
}

function mapPaymentMethodFromDb(dbMethod: any): PaymentMethod {
  return {
    id: dbMethod.id,
    parentId: dbMethod.parent_id,
    type: dbMethod.type,
    last4: dbMethod.last4,
    expiryMonth: dbMethod.expiry_month,
    expiryYear: dbMethod.expiry_year,
    isDefault: dbMethod.is_default,
    createdAt: dbMethod.created_at,
  };
}
