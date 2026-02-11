/**
 * SERVICE TYPES & INTERFACES
 * Contratos para todos los servicios (mock y reales)
 * Permite implementar diferentes adapters sin cambios en componentes
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

// ========== TRANSACTION TYPES ==========

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  imageUrl?: string;
}

export interface CartOrder {
  studentId: string;
  schoolId: string;
  items: CartItem[];
  total: number;
  clabeFrom: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TransactionResult {
  transactionId: string;
  status: 'completed' | 'failed' | 'pending';
  speiReference?: string;
  timestamp: Date;
  message?: string;
  previousBalance?: number;
  newBalance?: number;
}

export interface DepositRequest {
  parentId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'card' | 'transfer' | 'wallet';
  reference?: string;
}

export interface DepositResult extends TransactionResult {
  depositId: string;
}

// ========== INVENTORY TYPES ==========

export interface InventoryItem {
  productId: string;
  currentStock: number;
  minimumStock: number;
  lastUpdated: Date;
  movements?: StockMovement[];
}

export interface StockMovement {
  productId: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantity: number;
  timestamp: Date;
  reference?: string; // transactionId o settlementId
}

// ========== SETTLEMENT TYPES ==========

export interface Disbursement {
  id: string;
  recipientId: string; // schoolId or unitId
  recipientName: string;
  recipientCLABE: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  speiReference?: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface Settlement {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  totalTransactions: number;
  totalAmount: number;
  disbursements: Disbursement[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface SettlementGenerationRequest {
  period: {
    start: Date;
    end: Date;
  };
  transactions: TransactionResult[]; // All transactions in period
  schoolId?: string;
  unitId?: string;
}

// ========== SERVICE INTERFACES ==========

export interface PaymentServiceInterface {
  /**
   * Procesa una transacción de compra (estudiante paga por productos)
   */
  processTransaction(order: CartOrder): Promise<TransactionResult>;

  /**
   * Procesa un depósito (padre deposita dinero a estudiante)
   */
  createDeposit(request: DepositRequest): Promise<DepositResult>;

  /**
   * Ejecuta una dispersión (escuela recibe dinero tras settlement)
   */
  executeDisbursement(
    disbursement: Partial<Disbursement>
  ): Promise<Disbursement>;

  /**
   * Revierte una transacción (devolución de dinero)
   */
  refundTransaction(
    transactionId: string,
    reason: string
  ): Promise<TransactionResult>;

  /**
   * Valida una CLABE (formato y checksum)
   */
  validateCLABE(clabe: string): boolean;

  /**
   * Obtiene el historial de transacciones de un estudiante
   */
  getTransactionHistory(
    studentId: string,
    limit?: number
  ): Promise<TransactionResult[]>;

  /**
   * Obtiene el saldo actual de un estudiante
   */
  getBalance(studentId: string): Promise<number>;
}

export interface InventoryServiceInterface {
  /**
   * Decrementa el stock de un producto (después de una compra)
   */
  decrementStock(productId: string, quantity: number): Promise<void>;

  /**
   * Obtiene el stock actual de un producto
   */
  getStock(productId: string): Promise<number>;

  /**
   * Identifica productos con stock bajo
   */
  checkLowStock(unitId: string): Promise<InventoryItem[]>;

  /**
   * Registra un movimiento de inventario manual
   */
  recordMovement(movement: StockMovement): Promise<void>;

  /**
   * Obtiene el historial de movimientos de un producto
   */
  getMovementHistory(productId: string): Promise<StockMovement[]>;

  /**
   * Incrementa el stock (restock)
   */
  incrementStock(productId: string, quantity: number): Promise<void>;
}

export interface SettlementServiceInterface {
  /**
   * Calcula los settlements por período
   * Agrupa transacciones por destino (escuela/unidad)
   */
  generateSettlement(
    request: SettlementGenerationRequest
  ): Promise<Settlement>;

  /**
   * Obtiene settlements previos
   */
  getSettlements(
    filters?: {
      schoolId?: string;
      unitId?: string;
      status?: Settlement['status'];
    }
  ): Promise<Settlement[]>;

  /**
   * Obtiene un settlement específico
   */
  getSettlement(settlementId: string): Promise<Settlement>;

  /**
   * Registra una dispersión completada
   */
  recordDisbursement(disbursement: Disbursement): Promise<void>;

  /**
   * Obtiene el estado actual de un settlement
   */
  getSettlementStatus(settlementId: string): Promise<Settlement['status']>;
}

// ========== FACTORY TYPE ==========

export interface ServiceFactory {
  paymentService: PaymentServiceInterface;
  inventoryService: InventoryServiceInterface;
  settlementService: SettlementServiceInterface;
}

export interface ServiceFactoryConfig {
  useMock: boolean; // true = MockServices, false = Real services
  mockDelay?: number; // milliseconds (default 1000)
  storageKey?: string; // localStorage key for mock data
}
