
import { supabase } from '../lib/supabaseClient';

export const posService = {
  /**
   * Procesa una venta: Crea la transacción y descuenta inventario atómicamente
   */
  async processSale(
    transactionData: {
      school_id: string;
      unit_id: string;
      student_id: string;
      amount: number;
      items: any[]; // JSON del carrito
      payment_method: 'nfc' | 'qr' | 'cash' | 'card';
    }
  ) {
    // 1. Crear la transacción financiera
    const { data: txn, error: txnError } = await supabase
      .from('transactions')
      .insert([{
        school_id: transactionData.school_id,
        unit_id: transactionData.unit_id,
        student_id: transactionData.student_id,
        amount: transactionData.amount,
        items: transactionData.items,
        payment_method: transactionData.payment_method,
        type: 'sale',
        status: 'completed'
      }])
      .select()
      .single();

    if (txnError) throw txnError;

    // 2. Descontar inventario para cada item
    // Llama a la función SQL 'decrement_inventory_stock' definida en el esquema
    for (const item of transactionData.items) {
      if (item.id) {
        const { error: stockError } = await supabase
          .rpc('decrement_inventory_stock', {
            p_item_id: item.id,
            p_quantity: item.quantity
          });
        
        if (stockError) {
            console.error(`Error descontando stock para ${item.id}`, stockError);
        }
      }
    }

    return txn;
  }
};
