/**
 * MOCK PAYMENT SERVICE
 * Simula transacciones, depósitos y dispersiones
 * Usa localStorage para persistencia
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import {
  PaymentServiceInterface,
  CartOrder,
  TransactionResult,
  DepositRequest,
  DepositResult,
  Disbursement,
} from './types';
import { CLABEService } from './clabeService';

interface StoredTransaction extends TransactionResult {
  cartOrder?: CartOrder;
  type: 'sale' | 'deposit' | 'disbursement' | 'refund';
  studentId?: string;
  parentId?: string;
  recipientId?: string;
}

export class MockPaymentService implements PaymentServiceInterface {
  private storageKey = 'mecard_transactions';
  private balanceKey = 'mecard_balances';
  private mockDelay: number;

  constructor(mockDelay: number = 1000) {
    this.mockDelay = mockDelay;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.balanceKey)) {
      localStorage.setItem(this.balanceKey, JSON.stringify({}));
    }
  }

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSPEIReference(): string {
    // Format: CVE (Clave de Transferencia) = 18 digits
    // Pattern: YYMMDD + sequential numbers
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const seq = Math.random().toString().slice(2, 10).padStart(8, '0');
    return `${yy}${mm}${dd}${seq}`;
  }

  private getStoredTransactions(): StoredTransaction[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveTransaction(txn: StoredTransaction): void {
    const transactions = this.getStoredTransactions();
    transactions.push(txn);
    localStorage.setItem(this.storageKey, JSON.stringify(transactions));
  }

  private getStudentBalance(studentId: string): number {
    const balances = JSON.parse(
      localStorage.getItem(this.balanceKey) || '{}'
    ) as Record<string, number>;
    return balances[studentId] || 150.5; // Default mock balance
  }

  private setStudentBalance(studentId: string, balance: number): void {
    const balances = JSON.parse(
      localStorage.getItem(this.balanceKey) || '{}'
    ) as Record<string, number>;
    balances[studentId] = balance;
    localStorage.setItem(this.balanceKey, JSON.stringify(balances));
  }

  async processTransaction(order: CartOrder): Promise<TransactionResult> {
    await this.delay();

    const currentBalance = this.getStudentBalance(order.studentId);

    // Check if student has enough balance
    if (currentBalance < order.total) {
      return {
        transactionId: this.generateTransactionId(),
        status: 'failed',
        timestamp: new Date(),
        message: `Saldo insuficiente. Necesita $${order.total}, tiene $${currentBalance.toFixed(2)}`,
        previousBalance: currentBalance,
        newBalance: currentBalance,
      };
    }

    // Validate CLABE
    if (!this.validateCLABE(order.clabeFrom)) {
      return {
        transactionId: this.generateTransactionId(),
        status: 'failed',
        timestamp: new Date(),
        message: 'CLABE del estudiante inválida',
        previousBalance: currentBalance,
        newBalance: currentBalance,
      };
    }

    // Simular éxito/fracaso (90% éxito)
    const success = Math.random() > 0.1;

    if (!success) {
      return {
        transactionId: this.generateTransactionId(),
        status: 'failed',
        timestamp: new Date(),
        message: 'Error de procesamiento en SPEI (simulado)',
        previousBalance: currentBalance,
        newBalance: currentBalance,
      };
    }

    // Process successful transaction
    const transactionId = this.generateTransactionId();
    const newBalance = currentBalance - order.total;

    const result: TransactionResult = {
      transactionId,
      status: 'completed',
      speiReference: this.generateSPEIReference(),
      timestamp: new Date(),
      previousBalance: currentBalance,
      newBalance,
      message: 'Transacción completada exitosamente',
    };

    // Update balance
    this.setStudentBalance(order.studentId, newBalance);

    // Store transaction
    const txn: StoredTransaction = {
      ...result,
      type: 'sale',
      studentId: order.studentId,
      cartOrder: order,
    };
    this.saveTransaction(txn);

    return result;
  }

  async createDeposit(request: DepositRequest): Promise<DepositResult> {
    await this.delay();

    // Validate amount
    if (request.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    const currentBalance = this.getStudentBalance(request.studentId);
    const newBalance = currentBalance + request.amount;

    const depositId = `DEP_${Date.now()}`;
    const transactionId = this.generateTransactionId();

    const result: DepositResult = {
      depositId,
      transactionId,
      status: 'completed',
      speiReference: this.generateSPEIReference(),
      timestamp: new Date(),
      previousBalance: currentBalance,
      newBalance,
      message: `Depósito de $${request.amount.toFixed(2)} completado`,
    };

    // Update balance
    this.setStudentBalance(request.studentId, newBalance);

    // Store transaction
    const txn: StoredTransaction = {
      ...result,
      type: 'deposit',
      parentId: request.parentId,
      studentId: request.studentId,
      cartOrder: {
        studentId: request.studentId,
        schoolId: '', // Empty since it's a direct deposit
        items: [
          {
            id: request.studentId,
            name: `Depósito vía ${request.paymentMethod}`,
            price: request.amount,
            category: 'deposits',
            quantity: 1,
          },
        ],
        total: request.amount,
        clabeFrom: '', // Not applicable
        timestamp: new Date(),
      },
    };
    this.saveTransaction(txn);

    return result;
  }

  async executeDisbursement(
    disbursement: Partial<Disbursement>
  ): Promise<Disbursement> {
    await this.delay();

    if (!disbursement.recipientCLABE) {
      throw new Error('recipientCLABE es requerido');
    }

    if (!this.validateCLABE(disbursement.recipientCLABE)) {
      throw new Error('recipientCLABE inválida');
    }

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    const result: Disbursement = {
      id: disbursement.id || `DISB_${Date.now()}`,
      recipientId: disbursement.recipientId || '',
      recipientName: disbursement.recipientName || 'Escuela',
      recipientCLABE: disbursement.recipientCLABE,
      amount: disbursement.amount || 0,
      status: success ? 'completed' : 'failed',
      speiReference: success ? this.generateSPEIReference() : undefined,
      createdAt: new Date(),
      completedAt: success ? new Date() : undefined,
      errorMessage: success ? undefined : 'Error en transferencia SPEI',
    };

    // Store disbursement
    const txn: StoredTransaction = {
      transactionId: result.id,
      status: result.status === 'completed' ? 'completed' : 'failed',
      speiReference: result.speiReference,
      timestamp: result.createdAt,
      type: 'disbursement',
      recipientId: result.recipientId,
      message: success
        ? `Dispersión a ${result.recipientName} completada`
        : 'Error en dispersión',
    };
    this.saveTransaction(txn);

    return result;
  }

  async refundTransaction(
    transactionId: string,
    reason: string
  ): Promise<TransactionResult> {
    await this.delay();

    const transactions = this.getStoredTransactions();
    const originalTxn = transactions.find((t) => t.transactionId === transactionId);

    if (!originalTxn || !originalTxn.studentId) {
      throw new Error('Transacción no encontrada');
    }

    if (originalTxn.type !== 'sale') {
      throw new Error('Solo las compras pueden ser reembolsadas');
    }

    if (!originalTxn.cartOrder) {
      throw new Error('Información de compra incompleta para reembolso');
    }

    const studentId = originalTxn.studentId;
    const currentBalance = this.getStudentBalance(studentId);
    const refundAmount = originalTxn.cartOrder.total;
    const newBalance = currentBalance + refundAmount;

    const result: TransactionResult = {
      transactionId: `REF_${Date.now()}`,
      status: 'completed',
      speiReference: this.generateSPEIReference(),
      timestamp: new Date(),
      previousBalance: currentBalance,
      newBalance,
      message: `Reembolso de $${refundAmount.toFixed(2)} procesado. Razón: ${reason}`,
    };

    this.setStudentBalance(studentId, newBalance);

    const txn: StoredTransaction = {
      ...result,
      type: 'refund',
      studentId,
      cartOrder: originalTxn.cartOrder,
    };
    this.saveTransaction(txn);

    return result;
  }

  validateCLABE(clabe: string): boolean {
    return CLABEService.validate(clabe);
  }

  async getTransactionHistory(
    studentId: string,
    limit: number = 50
  ): Promise<TransactionResult[]> {
    const transactions = this.getStoredTransactions();
    return transactions
      .filter(
        (t) =>
          t.studentId === studentId &&
          (t.type === 'sale' || t.type === 'deposit' || t.type === 'refund')
      )
      .slice(-limit)
      .map((t) => ({
        transactionId: t.transactionId,
        status: t.status,
        speiReference: t.speiReference,
        timestamp: new Date(t.timestamp),
        message: t.message,
        previousBalance: t.previousBalance,
        newBalance: t.newBalance,
      }));
  }

  async getBalance(studentId: string): Promise<number> {
    return this.getStudentBalance(studentId);
  }

  // Utility methods for debugging
  getAllTransactions(): StoredTransaction[] {
    return this.getStoredTransactions();
  }

  clearAllTransactions(): void {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
    localStorage.setItem(this.balanceKey, JSON.stringify({}));
  }

  setStudentBalanceDirect(studentId: string, balance: number): void {
    this.setStudentBalance(studentId, balance);
  }

  getStudentBalanceDirect(studentId: string): number {
    return this.getStudentBalance(studentId);
  }
}

export default MockPaymentService;
