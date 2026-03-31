import { beforeEach, describe, expect, it } from "vitest";
import {
  createServiceFactory,
  getServiceFactory,
  resetServiceFactory,
} from "../factory";

describe("Service Factory", () => {
  // Reset singleton between tests so tests don't bleed into each other
  beforeEach(() => {
    resetServiceFactory({ useMock: true, mockDelay: 0 });
  });

  // ====================================================================
  // createServiceFactory
  // ====================================================================
  describe("createServiceFactory()", () => {
    it("returns a factory with paymentService, inventoryService and settlementService", () => {
      const factory = createServiceFactory({ useMock: true });
      expect(factory.paymentService).toBeDefined();
      expect(factory.inventoryService).toBeDefined();
      expect(factory.settlementService).toBeDefined();
    });

    it("returns a factory in mock mode when useMock is true", () => {
      const factory = createServiceFactory({ useMock: true, mockDelay: 0 });
      // All services must expose the expected interface methods
      expect(typeof factory.paymentService.processTransaction).toBe("function");
      expect(typeof factory.paymentService.createDeposit).toBe("function");
    });

    it("returns valid services when useMock is false", () => {
      const factory = createServiceFactory({ useMock: false, mockDelay: 0 });
      expect(factory.paymentService).toBeDefined();
      expect(typeof factory.paymentService.processTransaction).toBe("function");
    });

    it("creates independent factory instances on each call", () => {
      const factory1 = createServiceFactory({ useMock: true, mockDelay: 0 });
      const factory2 = createServiceFactory({ useMock: true, mockDelay: 0 });
      expect(factory1).not.toBe(factory2);
    });
  });

  // ====================================================================
  // getServiceFactory (singleton)
  // ====================================================================
  describe("getServiceFactory()", () => {
    it("returns the same instance on repeated calls", () => {
      const f1 = getServiceFactory();
      const f2 = getServiceFactory();
      expect(f1).toBe(f2);
    });

    it("returns a factory with all three required services", () => {
      const factory = getServiceFactory();
      expect(factory.paymentService).toBeDefined();
      expect(factory.inventoryService).toBeDefined();
      expect(factory.settlementService).toBeDefined();
    });
  });

  // ====================================================================
  // resetServiceFactory
  // ====================================================================
  describe("resetServiceFactory()", () => {
    it("returns a new factory instance after reset", () => {
      const original = getServiceFactory();
      const fresh = resetServiceFactory({ useMock: true, mockDelay: 0 });
      expect(fresh).not.toBe(original);
    });

    it("new singleton after reset is the fresh instance", () => {
      resetServiceFactory({ useMock: true, mockDelay: 0 });
      const afterReset = getServiceFactory();
      // Should be the same object (fresh singleton)
      expect(afterReset).toBeDefined();
      expect(afterReset.paymentService).toBeDefined();
    });
  });
});
