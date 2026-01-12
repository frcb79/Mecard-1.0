import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { financialService } from '../services/financialService';
import { parentDepositService } from '../services/parentDepositService';
import { spendingLimitsService } from '../services/spendingLimitsService';
import { alertingService } from '../services/alertingService';
import { reportingService } from '../services/reportingService';

/**
 * Test suite for backend services
 * Run with: npm run test
 */

describe('FinancialService', () => {
  const testSchoolId = BigInt(1);
  const testStudentId = BigInt(100);
  const testParentId = 'test-parent-uuid';

  describe('getStudentBalance', () => {
    it('should return student balance', async () => {
      const balance = await financialService.getStudentBalance(testStudentId, testSchoolId);
      expect(balance).toBeDefined();
      if (balance) {
        expect(balance.studentId).toBe(testStudentId);
        expect(balance.balance).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return null for non-existent student', async () => {
      const balance = await financialService.getStudentBalance(BigInt(99999), testSchoolId);
      expect(balance).toBeNull();
    });
  });

  describe('getParentFinancialSummary', () => {
    it('should return comprehensive parent summary', async () => {
      const summary = await financialService.getParentFinancialSummary(testParentId, testSchoolId);
      expect(summary).toBeDefined();
      if (summary) {
        expect(summary.studentCount).toBeGreaterThanOrEqual(0);
        expect(summary.totalBalance).toBeGreaterThanOrEqual(0);
        expect(summary.totalSpent).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('ParentDepositService', () => {
  const testSchoolId = BigInt(1);
  const testStudentId = BigInt(100);
  const testParentId = 'test-parent-uuid';

  describe('validateDeposit', () => {
    it('should reject negative amounts', async () => {
      const result = await parentDepositService.validateDeposit({
        parentUserId: testParentId,
        studentId: testStudentId,
        amount: -100,
        schoolId: testSchoolId,
      });
      expect(result.valid).toBe(false);
    });

    it('should reject zero amount', async () => {
      const result = await parentDepositService.validateDeposit({
        parentUserId: testParentId,
        studentId: testStudentId,
        amount: 0,
        schoolId: testSchoolId,
      });
      expect(result.valid).toBe(false);
    });

    it('should reject amounts over limit', async () => {
      const result = await parentDepositService.validateDeposit({
        parentUserId: testParentId,
        studentId: testStudentId,
        amount: 15000,
        schoolId: testSchoolId,
      });
      expect(result.valid).toBe(false);
    });

    it('should accept valid amounts', async () => {
      const result = await parentDepositService.validateDeposit({
        parentUserId: testParentId,
        studentId: testStudentId,
        amount: 100,
        schoolId: testSchoolId,
      });
      // Result depends on parent-student relationship existing
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });
});

describe('SpendingLimitsService', () => {
  const testSchoolId = BigInt(1);
  const testStudentId = BigInt(100);

  describe('getOrCreateLimit', () => {
    it('should return or create spending limit', async () => {
      const limit = await spendingLimitsService.getOrCreateLimit(testStudentId, testSchoolId);
      expect(limit).toBeDefined();
      if (limit) {
        expect(limit.dailyLimit).toBeGreaterThan(0);
        expect(limit.monthlyLimit).toBeGreaterThan(0);
      }
    });
  });

  describe('getSpendingStatus', () => {
    it('should return current spending status', async () => {
      const status = await spendingLimitsService.getSpendingStatus(testStudentId, testSchoolId);
      expect(status).toBeDefined();
      if (status) {
        expect(status.dailySpent).toBeGreaterThanOrEqual(0);
        expect(status.dailyLimit).toBeGreaterThan(0);
        expect(status.dailyPercentage).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('canMakePurchase', () => {
    it('should validate purchase eligibility', async () => {
      const can = await spendingLimitsService.canMakePurchase(testStudentId, testSchoolId, 10);
      expect(typeof can).toBe('boolean');
    });

    it('should reject purchase above limit', async () => {
      const can = await spendingLimitsService.canMakePurchase(testStudentId, testSchoolId, 999999);
      expect(can).toBe(false);
    });
  });
});

describe('AlertingService', () => {
  const testSchoolId = BigInt(1);
  const testStudentId = BigInt(100);
  const testParentId = 'test-parent-uuid';

  describe('getUnreadAlerts', () => {
    it('should return unread alerts for parent', async () => {
      const alerts = await alertingService.getUnreadAlerts(testParentId, testSchoolId);
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('createAlert', () => {
    it('should create alert with valid data', async () => {
      const alertId = await alertingService.createAlert({
        parentUserId: testParentId,
        studentId: testStudentId,
        schoolId: testSchoolId,
        type: 'high_spending',
        title: 'Test Alert',
        message: 'This is a test alert',
        severity: 'medium',
        isRead: false,
      });
      expect(alertId).toBeDefined();
    });
  });
});

describe('ReportingService', () => {
  const testSchoolId = BigInt(1);
  const testStudentId = BigInt(100);

  describe('getSchoolReport', () => {
    it('should return comprehensive school report', async () => {
      const report = await reportingService.getSchoolReport(testSchoolId, 30);
      expect(report).toBeDefined();
      if (report) {
        expect(report.studentCount).toBeGreaterThanOrEqual(0);
        expect(report.totalTransactions).toBeGreaterThanOrEqual(0);
        expect(report.totalRevenue).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(report.topProducts)).toBe(true);
        expect(Array.isArray(report.topOperatingUnits)).toBe(true);
      }
    });
  });

  describe('getStudentTransactionReport', () => {
    it('should return student transaction report', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const report = await reportingService.getStudentTransactionReport(
        testStudentId,
        testSchoolId,
        startDate,
        endDate
      );
      expect(report).toBeDefined();
      if (report) {
        expect(report.totalTransactions).toBeGreaterThanOrEqual(0);
        expect(report.totalAmount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
