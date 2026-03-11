
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const posService = {
  /**
   * Procesa una venta de forma ATOMICA
   * 
   * SECURITY FIX (CRIT-001):
   * - Uses process_pos_sale_atomic() function to ensure balance deduction and transaction creation happen together
   * - Prevents double-spend attacks
   * - Implements idempotency to prevent duplicate processing
   * 
   * Workflow:
   * 1. Validate amount is positive
   * 2. Check idempotency key (prevent duplicate charges)
   * 3. Lock student record and verify sufficient balance
   * 4. Deduct balance atomically
   * 5. Create transaction record in same transaction
   * 6. Return balance after sale
   */
  async processSale(
    transactionData: {
      school_id: string;
      unit_id: string;
      student_id: string;
      amount: number;
      items: any[]; // JSON del carrito
      payment_method: 'nfc' | 'qr' | 'cash' | 'card';
      idempotency_key?: string; // For preventing duplicate charges
    }
  ) {
    // 1. Validate amount
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 2. Generate idempotency key if not provided
    const idempotencyKey = transactionData.idempotency_key || uuidv4();

    // 3. Call atomic POS sale function
    const { data: result, error } = await supabase
      .rpc('process_pos_sale_atomic', {
        p_school_id: transactionData.school_id,
        p_unit_id: transactionData.unit_id,
        p_student_id: transactionData.student_id,
        p_amount: transactionData.amount,
        p_items: transactionData.items,
        p_payment_method: transactionData.payment_method,
        p_idempotency_key: idempotencyKey
      });

    if (error) {
      throw new Error(`POS sale failed: ${error.message}`);
    }

    if (!result.success) {
      throw new Error(`POS sale error: ${result.error}`);
    }

    // 4. If this is a duplicate request (idempotent), log it but don't fail
    if (result.reason === 'idempotent-duplicate') {
      console.warn('Duplicate POS sale request detected:', idempotencyKey);
      return {
        id: result.transaction_id,
        balance_after: result.balance_after,
        is_duplicate: true
      };
    }

    return {
      id: result.transaction_id,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      amount: result.amount,
      is_duplicate: false
    };
  }
};
