import {
  InventoryServiceInterface,
  InventoryItem,
  StockMovement,
} from './types';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';

export class SupabaseInventoryService implements InventoryServiceInterface {
  async decrementStock(productId: string, quantity: number): Promise<void> {
    if (!productId || quantity <= 0) {
      throw new Error('Parámetros inválidos para decrementStock');
    }

    const { data, error } = await supabase.rpc('decrement_inventory_stock', {
      p_item_id: productId,
      p_quantity: quantity,
    });

    if (error) {
      throw new Error(`Error decrementando stock: ${error.message}`);
    }

    if (data !== true) {
      throw new Error('Stock insuficiente o producto inexistente');
    }
  }

  async getStock(productId: string): Promise<number> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error) {
      throw new Error(`No se pudo obtener stock: ${error.message}`);
    }

    return Number(data.stock ?? 0);
  }

  async checkLowStock(unitId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, stock, min_stock, updated_at')
      .eq('unit_id', unitId)
      .neq('status', 'discontinued');

    if (error) {
      throw new Error(`No se pudo consultar low stock: ${error.message}`);
    }

    return (data || [])
      .filter((row) => Number(row.stock ?? 0) <= Number(row.min_stock ?? 0))
      .map((row) => ({
        productId: row.id,
        currentStock: Number(row.stock ?? 0),
        minimumStock: Number(row.min_stock ?? 0),
        lastUpdated: new Date(row.updated_at ?? new Date().toISOString()),
      }));
  }

  async recordMovement(movement: StockMovement): Promise<void> {
    logger.info('inventory.supabase', 'recordMovement not persisted yet', {
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reference: movement.reference,
    });
  }

  async getMovementHistory(_productId: string): Promise<StockMovement[]> {
    return [];
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    if (!productId || quantity <= 0) {
      throw new Error('Parámetros inválidos para incrementStock');
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .select('stock')
      .eq('id', productId)
      .single();

    if (error) {
      throw new Error(`No se pudo cargar stock actual: ${error.message}`);
    }

    const nextStock = Number(data.stock ?? 0) + quantity;
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        stock: nextStock,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      throw new Error(`No se pudo incrementar stock: ${updateError.message}`);
    }
  }
}

export default SupabaseInventoryService;