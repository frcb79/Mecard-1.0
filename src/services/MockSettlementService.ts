/**
 * MOCK SETTLEMENT SERVICE
 * Calcula dispersiones por período
 * Agrupa transacciones por destino (escuela/unidad)
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import {
  SettlementServiceInterface,
  Settlement,
  Disbursement,
  SettlementGenerationRequest,
  TransactionResult,
} from './types';
import { MOCK_SCHOOLS, MOCK_UNITS } from '../constants';

interface StoredSettlement {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  totalTransactions: number;
  createdAt: string;
  completedAt?: string;
  disbursements: StoredDisbursement[];
}

interface StoredDisbursement {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientCLABE: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  speiReference?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export class MockSettlementService implements SettlementServiceInterface {
  private storageKey = 'mecard_settlements';
  private mockDelay: number;

  constructor(mockDelay: number = 1000) {
    this.mockDelay = mockDelay;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadSettlementsFromStorage(): StoredSettlement[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveSettlements(settlements: StoredSettlement[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(settlements));
  }

  private generateSettlementId(): string {
    return `SETL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private parseStoredSettlement(stored: StoredSettlement): Settlement {
    return {
      id: stored.id,
      status: stored.status,
      periodStart: new Date(stored.periodStart),
      periodEnd: new Date(stored.periodEnd),
      totalAmount: stored.totalAmount,
      totalTransactions: stored.totalTransactions,
      createdAt: new Date(stored.createdAt),
      completedAt: stored.completedAt ? new Date(stored.completedAt) : undefined,
      disbursements: stored.disbursements.map((d) => ({
        id: d.id,
        recipientId: d.recipientId,
        recipientName: d.recipientName,
        recipientCLABE: d.recipientCLABE,
        amount: d.amount,
        status: d.status,
        speiReference: d.speiReference,
        createdAt: new Date(d.createdAt),
        completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
        errorMessage: d.errorMessage,
      })),
    };
  }

  async generateSettlement(
    request: SettlementGenerationRequest
  ): Promise<Settlement> {
    await this.delay();

    const settlementId = this.generateSettlementId();
    const disbursements: Disbursement[] = [];

    // Calculate gross revenue from actual transaction amounts
    const grossRevenue = request.transactions.reduce(
      (sum, txn) => sum + Math.abs(txn.amount ?? 0),
      0
    );

    // MeCard platform fee: 4.5% (matches SettlementService.calculate)
    const PLATFORM_FEE_RATE = 0.045;
    const platformFee = grossRevenue * PLATFORM_FEE_RATE;
    const netAfterPlatform = grossRevenue - platformFee;

    // Split net amount among schools with valid CLABEs
    const eligibleSchools = MOCK_SCHOOLS.filter((s) => s.settlementCLABE);

    if (eligibleSchools.length > 0) {
      // Distribute proportionally (equal split among eligible schools for mock)
      const perSchool = Math.round((netAfterPlatform / eligibleSchools.length) * 100) / 100;

      eligibleSchools.forEach((school) => {
        disbursements.push({
          id: `DISB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipientId: school.id,
          recipientName: school.name,
          recipientCLABE: school.settlementCLABE,
          amount: perSchool,
          status: 'pending',
          createdAt: new Date(),
        });
      });
    } else if (MOCK_UNITS.length > 0) {
      // Fallback: disburse to first unit
      const unit = MOCK_UNITS[0];
      disbursements.push({
        id: `DISB_${Date.now()}`,
        recipientId: unit.id,
        recipientName: unit.name,
        recipientCLABE: unit.vendorCLABE || '646180000000000000',
        amount: Math.round(netAfterPlatform * 100) / 100,
        status: 'pending',
        createdAt: new Date(),
      });
    }

    const settlement: Settlement = {
      id: settlementId,
      periodStart: request.period.start,
      periodEnd: request.period.end,
      totalTransactions: request.transactions.length,
      totalAmount: Math.round(grossRevenue * 100) / 100,
      disbursements,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store settlement
    const stored: StoredSettlement = {
      id: settlement.id,
      status: settlement.status,
      periodStart: settlement.periodStart.toISOString(),
      periodEnd: settlement.periodEnd.toISOString(),
      totalAmount: settlement.totalAmount,
      totalTransactions: settlement.totalTransactions,
      createdAt: settlement.createdAt.toISOString(),
      disbursements: disbursements.map((d) => ({
        id: d.id,
        recipientId: d.recipientId,
        recipientName: d.recipientName,
        recipientCLABE: d.recipientCLABE,
        amount: d.amount,
        status: d.status,
        speiReference: d.speiReference,
        createdAt: d.createdAt.toISOString(),
        completedAt: d.completedAt?.toISOString(),
        errorMessage: d.errorMessage,
      })),
    };

    const settlements = this.loadSettlementsFromStorage();
    settlements.push(stored);
    this.saveSettlements(settlements);

    return settlement;
  }

  async getSettlements(filters?: {
    schoolId?: string;
    unitId?: string;
    status?: Settlement['status'];
  }): Promise<Settlement[]> {
    await this.delay();

    const stored = this.loadSettlementsFromStorage();
    let result = stored.map((s) => this.parseStoredSettlement(s));

    if (filters?.schoolId) {
      result = result.filter((s) =>
        s.disbursements.some((d) => d.recipientId === filters.schoolId)
      );
    }

    if (filters?.unitId) {
      result = result.filter((s) =>
        s.disbursements.some((d) => d.recipientId === filters.unitId)
      );
    }

    if (filters?.status) {
      result = result.filter((s) => s.status === filters.status);
    }

    return result;
  }

  async getSettlement(settlementId: string): Promise<Settlement> {
    await this.delay();

    const stored = this.loadSettlementsFromStorage();
    const found = stored.find((s) => s.id === settlementId);

    if (!found) {
      throw new Error(`Settlement ${settlementId} no encontrado`);
    }

    return this.parseStoredSettlement(found);
  }

  async recordDisbursement(disbursement: Disbursement): Promise<void> {
    await this.delay();

    const stored = this.loadSettlementsFromStorage();
    const settlement = stored.find((s) =>
      s.disbursements.some((d) => d.id === disbursement.id)
    );

    if (!settlement) {
      throw new Error(
        `Settlement para disbursement ${disbursement.id} no encontrado`
      );
    }

    const disbursementIndex = settlement.disbursements.findIndex(
      (d) => d.id === disbursement.id
    );

    if (disbursementIndex >= 0) {
      settlement.disbursements[disbursementIndex] = {
        id: disbursement.id,
        recipientId: disbursement.recipientId,
        recipientName: disbursement.recipientName,
        recipientCLABE: disbursement.recipientCLABE,
        amount: disbursement.amount,
        status: disbursement.status,
        speiReference: disbursement.speiReference,
        createdAt: disbursement.createdAt.toISOString(),
        completedAt: disbursement.completedAt
          ? disbursement.completedAt.toISOString()
          : undefined,
        errorMessage: disbursement.errorMessage,
      };

      // Check if all disbursements are completed
      const allCompleted = settlement.disbursements.every(
        (d) => d.status === 'completed'
      );

      if (allCompleted) {
        settlement.status = 'completed';
        settlement.completedAt = new Date().toISOString();
      }

      this.saveSettlements(stored);
    }
  }

  async getSettlementStatus(
    settlementId: string
  ): Promise<Settlement['status']> {
    await this.delay();

    const settlement = await this.getSettlement(settlementId);
    return settlement.status;
  }

  // Utility methods for debugging
  getAllSettlements(): StoredSettlement[] {
    return this.loadSettlementsFromStorage();
  }

  clearAllSettlements(): void {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
  }
}

export default MockSettlementService;
