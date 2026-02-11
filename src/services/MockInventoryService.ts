/**
 * MOCK INVENTORY SERVICE
 * Gestiona stock de productos de forma local
 * Usa localStorage para persistencia
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import {
  InventoryServiceInterface,
  InventoryItem,
  StockMovement,
} from './types';
import { PRODUCTS } from '../constants';

interface StoredInventory {
  [productId: string]: {
    stock: number;
    movements: StockMovement[];
  };
}

export class MockInventoryService implements InventoryServiceInterface {
  private storageKey = 'mecard_inventory';
  private mockDelay: number;

  constructor(mockDelay: number = 500) {
    this.mockDelay = mockDelay;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      const initialInventory: StoredInventory = {};

      // Initialize all products with a default stock
      PRODUCTS.forEach((product) => {
        initialInventory[product.id] = {
          stock: Math.floor(Math.random() * 100) + 20, // 20-120 units
          movements: [
            {
              productId: product.id,
              type: 'restock',
              quantity: 100,
              timestamp: new Date(),
              reference: 'INIT',
            },
          ],
        };
      });

      localStorage.setItem(this.storageKey, JSON.stringify(initialInventory));
    }
  }

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getInventory(): StoredInventory {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  private saveInventory(inventory: StoredInventory): void {
    localStorage.setItem(this.storageKey, JSON.stringify(inventory));
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await this.delay();

    const inventory = this.getInventory();

    if (!inventory[productId]) {
      throw new Error(`Producto ${productId} no encontrado`);
    }

    if (inventory[productId].stock < quantity) {
      throw new Error(
        `Stock insuficiente. Disponible: ${inventory[productId].stock}, solicitado: ${quantity}`
      );
    }

    inventory[productId].stock -= quantity;

    // Record movement
    const movement: StockMovement = {
      productId,
      type: 'sale',
      quantity: -quantity,
      timestamp: new Date(),
      reference: `TXN_${Date.now()}`,
    };

    inventory[productId].movements.push(movement);

    this.saveInventory(inventory);
  }

  async getStock(productId: string): Promise<number> {
    await this.delay();

    const inventory = this.getInventory();

    if (!inventory[productId]) {
      throw new Error(`Producto ${productId} no encontrado`);
    }

    return inventory[productId].stock;
  }

  async checkLowStock(unitId: string): Promise<InventoryItem[]> {
    await this.delay();

    const inventory = this.getInventory();
    const lowStockItems: InventoryItem[] = [];
    const minimumThreshold = 10; // Alert when stock < 10

    Object.entries(inventory).forEach(([productId, data]) => {
      const product = PRODUCTS.find((p) => p.id === productId);

      // Filter by unitId if provided
      if (unitId && product?.unitId !== unitId) {
        return;
      }

      if (data.stock < minimumThreshold) {
        lowStockItems.push({
          productId,
          currentStock: data.stock,
          minimumStock: minimumThreshold,
          lastUpdated: new Date(),
          movements: data.movements.slice(-5), // Last 5 movements
        });
      }
    });

    return lowStockItems;
  }

  async recordMovement(movement: StockMovement): Promise<void> {
    await this.delay();

    const inventory = this.getInventory();

    if (!inventory[movement.productId]) {
      throw new Error(`Producto ${movement.productId} no encontrado`);
    }

    // Apply movement to stock
    if (movement.type === 'sale') {
      inventory[movement.productId].stock -= Math.abs(movement.quantity);
    } else if (movement.type === 'restock') {
      inventory[movement.productId].stock += movement.quantity;
    } else if (movement.type === 'adjustment') {
      inventory[movement.productId].stock += movement.quantity; // Can be positive or negative
    } else if (movement.type === 'return') {
      inventory[movement.productId].stock += movement.quantity;
    }

    // Ensure stock doesn't go negative
    if (inventory[movement.productId].stock < 0) {
      inventory[movement.productId].stock = 0;
    }

    // Record the movement
    inventory[movement.productId].movements.push(movement);

    this.saveInventory(inventory);
  }

  async getMovementHistory(
    productId: string
  ): Promise<StockMovement[]> {
    await this.delay();

    const inventory = this.getInventory();

    if (!inventory[productId]) {
      throw new Error(`Producto ${productId} no encontrado`);
    }

    return inventory[productId].movements;
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    await this.delay();

    const inventory = this.getInventory();

    if (!inventory[productId]) {
      throw new Error(`Producto ${productId} no encontrado`);
    }

    inventory[productId].stock += quantity;

    // Record movement
    const movement: StockMovement = {
      productId,
      type: 'restock',
      quantity,
      timestamp: new Date(),
      reference: `RESTOCK_${Date.now()}`,
    };

    inventory[productId].movements.push(movement);

    this.saveInventory(inventory);
  }

  // Utility methods for debugging
  getAllInventory(): StoredInventory {
    return this.getInventory();
  }

  clearAllInventory(): void {
    this.initializeStorage(); // Reinitialize to defaults
  }

  setStockDirect(productId: string, stock: number): void {
    const inventory = this.getInventory();
    if (inventory[productId]) {
      inventory[productId].stock = Math.max(0, stock);
      this.saveInventory(inventory);
    }
  }
}

export default MockInventoryService;
