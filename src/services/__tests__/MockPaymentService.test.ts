import { beforeEach, describe, expect, it, vi } from "vitest";
import MockPaymentService from "../MockPaymentService";
import { CLABEService } from "../clabeService";
import type { CartOrder, DepositRequest } from "../types";

// Always generate a valid CLABE programmatically so we rely on the real algorithm
const VALID_CLABE = CLABEService.generateStudentCLABE("001", "0001");
const INVALID_CLABE = (() => {
  const valid = CLABEService.generateStudentCLABE("001", "0002");
  const lastDigit = valid[17];
  const wrongVerifier = String((parseInt(lastDigit, 10) + 1) % 10);
  return valid.slice(0, 17) + wrongVerifier;
})();

const makeOrder = (overrides: Partial<CartOrder> = {}): CartOrder => ({
  studentId: "student_001",
  schoolId: "mx_01",
  items: [
    {
      id: "item_1",
      name: "Wrap de Pollo",
      price: 45,
      category: "HOT_MEALS",
      quantity: 1,
    },
  ],
  total: 45,
  clabeFrom: VALID_CLABE,
  timestamp: new Date(),
  ...overrides,
});

describe("MockPaymentService", () => {
  let service: MockPaymentService;

  beforeEach(() => {
    localStorage.clear();
    service = new MockPaymentService(0); // 0ms delay so tests are fast
    vi.restoreAllMocks();
  });

  // ====================================================================
  // processTransaction
  // ====================================================================
  describe("processTransaction()", () => {
    it("returns failed status when student has insufficient balance", async () => {
      service.setStudentBalanceDirect("student_001", 10);
      const result = await service.processTransaction(makeOrder({ total: 50 }));

      expect(result.status).toBe("failed");
      expect(result.message).toMatch(/insuficiente/i);
      // Balance must not change on failure
      expect(result.newBalance).toBe(10);
      expect(result.previousBalance).toBe(10);
    });

    it("returns failed status when CLABE is invalid", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5); // would succeed without invalid CLABE
      service.setStudentBalanceDirect("student_001", 200);
      const result = await service.processTransaction(
        makeOrder({ clabeFrom: INVALID_CLABE })
      );

      expect(result.status).toBe("failed");
      expect(result.message).toMatch(/CLABE/i);
    });

    it("deducts exact purchase amount from balance on success", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5); // force success
      service.setStudentBalanceDirect("student_001", 100);

      const result = await service.processTransaction(makeOrder({ total: 45 }));

      expect(result.status).toBe("completed");
      expect(result.previousBalance).toBe(100);
      expect(result.newBalance).toBe(55);
    });

    it("does not modify balance on random processing failure", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.05); // force random failure
      service.setStudentBalanceDirect("student_001", 100);

      const result = await service.processTransaction(makeOrder({ total: 45 }));

      expect(result.status).toBe("failed");
      const balance = await service.getBalance("student_001");
      expect(balance).toBe(100);
    });

    it("generates a 14-character SPEI reference on success", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const result = await service.processTransaction(makeOrder());

      expect(result.speiReference).toBeDefined();
      expect(result.speiReference).toHaveLength(14);
    });

    it("assigns a unique transaction ID on each call", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      service.setStudentBalanceDirect("student_001", 500);

      const r1 = await service.processTransaction(makeOrder({ total: 10 }));
      const r2 = await service.processTransaction(makeOrder({ total: 10 }));

      expect(r1.transactionId).not.toBe(r2.transactionId);
    });

    it("uses the default balance (150.50) when no balance was explicitly set", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      // No explicit balance set — default is 150.50
      const result = await service.processTransaction(makeOrder({ total: 50 }));

      expect(result.status).toBe("completed");
      expect(result.previousBalance).toBe(150.5);
      expect(result.newBalance).toBe(100.5);
    });
  });

  // ====================================================================
  // createDeposit
  // ====================================================================
  describe("createDeposit()", () => {
    it("adds the deposited amount to the student balance", async () => {
      service.setStudentBalanceDirect("student_001", 100);

      const request: DepositRequest = {
        parentId: "parent_001",
        studentId: "student_001",
        amount: 200,
        paymentMethod: "card",
      };
      const result = await service.createDeposit(request);

      expect(result.status).toBe("completed");
      expect(result.previousBalance).toBe(100);
      expect(result.newBalance).toBe(300);
    });

    it("throws an error when deposit amount is zero", async () => {
      const request: DepositRequest = {
        parentId: "parent_001",
        studentId: "student_001",
        amount: 0,
        paymentMethod: "card",
      };

      await expect(service.createDeposit(request)).rejects.toThrow(
        /mayor a 0/i
      );
    });

    it("throws an error when deposit amount is negative", async () => {
      const request: DepositRequest = {
        parentId: "parent_001",
        studentId: "student_001",
        amount: -50,
        paymentMethod: "transfer",
      };

      await expect(service.createDeposit(request)).rejects.toThrow(
        /mayor a 0/i
      );
    });

    it("returns a deposit ID and transaction ID", async () => {
      const request: DepositRequest = {
        parentId: "parent_001",
        studentId: "student_001",
        amount: 100,
        paymentMethod: "card",
      };
      const result = await service.createDeposit(request);

      expect(result.depositId).toBeDefined();
      expect(result.transactionId).toBeDefined();
    });
  });

  // ====================================================================
  // refundTransaction
  // ====================================================================
  describe("refundTransaction()", () => {
    it("restores the student balance to its pre-purchase level", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5); // force sale success
      service.setStudentBalanceDirect("student_001", 100);

      const saleResult = await service.processTransaction(
        makeOrder({ total: 45 })
      );
      expect(saleResult.status).toBe("completed");

      const refundResult = await service.refundTransaction(
        saleResult.transactionId,
        "Error del operador"
      );

      expect(refundResult.status).toBe("completed");
      const finalBalance = await service.getBalance("student_001");
      expect(finalBalance).toBe(100);
    });

    it("throws when the transaction ID does not exist", async () => {
      await expect(
        service.refundTransaction("nonexistent_txn", "test")
      ).rejects.toThrow(/no encontrada/i);
    });

    it("throws when trying to refund a deposit (not a sale)", async () => {
      // Create a deposit first
      const depositResult = await service.createDeposit({
        parentId: "parent_001",
        studentId: "student_001",
        amount: 100,
        paymentMethod: "card",
      });

      await expect(
        service.refundTransaction(depositResult.transactionId, "test")
      ).rejects.toThrow(/reembolsadas/i);
    });
  });

  // ====================================================================
  // getTransactionHistory
  // ====================================================================
  describe("getTransactionHistory()", () => {
    it("returns an empty array for a student with no transactions", async () => {
      const history = await service.getTransactionHistory("unknown_student");
      expect(history).toEqual([]);
    });

    it("returns only transactions belonging to the requested student", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      service.setStudentBalanceDirect("student_001", 500);
      service.setStudentBalanceDirect("student_002", 500);

      await service.processTransaction(
        makeOrder({ studentId: "student_001", total: 10 })
      );
      await service.processTransaction(
        makeOrder({ studentId: "student_002", total: 20 })
      );

      const history = await service.getTransactionHistory("student_001");
      expect(history).toHaveLength(1);
    });

    it("respects the limit parameter", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      service.setStudentBalanceDirect("student_001", 500);

      // Create 5 transactions
      for (let i = 0; i < 5; i++) {
        await service.processTransaction(makeOrder({ total: 5 }));
      }

      const history = await service.getTransactionHistory("student_001", 3);
      expect(history.length).toBeLessThanOrEqual(3);
    });
  });

  // ====================================================================
  // getBalance
  // ====================================================================
  describe("getBalance()", () => {
    it("reflects balance changes after a successful purchase", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      service.setStudentBalanceDirect("student_001", 100);
      await service.processTransaction(makeOrder({ total: 30 }));

      const balance = await service.getBalance("student_001");
      expect(balance).toBe(70);
    });

    it("reflects balance changes after a deposit", async () => {
      service.setStudentBalanceDirect("student_001", 50);
      await service.createDeposit({
        parentId: "parent_001",
        studentId: "student_001",
        amount: 150,
        paymentMethod: "card",
      });

      const balance = await service.getBalance("student_001");
      expect(balance).toBe(200);
    });
  });
});
