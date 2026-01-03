
import { InventoryItem, InventoryMovement, MovementType, Product } from '../types';

export class InventoryService {
  private static STORAGE_KEY = 'mecard_inventory_v1';
  private static MOVEMENTS_KEY = 'mecard_movements_v1';

  static getInventory(): InventoryItem[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static getMovements(): InventoryMovement[] {
    const saved = localStorage.getItem(this.MOVEMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static recordMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>) {
    const movements = this.getMovements();
    const newMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(this.MOVEMENTS_KEY, JSON.stringify([newMovement, ...movements]));
  }

  static updateStock(productId: string, unitId: string, quantityChange: number, type: MovementType, reason?: string) {
    const inventory = this.getInventory();
    const itemIndex = inventory.findIndex(i => i.productId === productId && i.unitId === unitId);
    
    let currentItem: InventoryItem;

    if (itemIndex === -1) {
      currentItem = {
        productId,
        unitId,
        currentStock: quantityChange,
        minStock: 10,
        unitCost: 0
      };
      inventory.push(currentItem);
    } else {
      currentItem = inventory[itemIndex];
      currentItem.currentStock += quantityChange;
    }

    this.recordMovement({
      inventoryItemId: `${productId}_${unitId}`,
      type,
      quantity: quantityChange,
      stockAfter: currentItem.currentStock,
      reason
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inventory));
    return currentItem;
  }

  static checkLowStock(unitId: string): InventoryItem[] {
    return this.getInventory().filter(i => i.unitId === unitId && i.currentStock <= i.minStock);
  }
}
