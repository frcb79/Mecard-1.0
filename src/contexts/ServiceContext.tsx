/**
 * SERVICE CONTEXT & PROVIDER
 * Proporciona los servicios inyectados a todos los componentes
 * Permite usar servicios sin prop drilling
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  ServiceFactory,
  ServiceFactoryConfig,
  PaymentServiceInterface,
  InventoryServiceInterface,
  SettlementServiceInterface,
} from '../services/types';
import { createServiceFactory, getServiceFactoryConfigFromEnv } from '../services/factory';

// ========== CONTEXT TYPE ==========

interface ServiceContextValue extends ServiceFactory {
  isLoading: boolean;
  error: Error | null;
}

const ServiceContext = createContext<ServiceContextValue | undefined>(
  undefined
);

// ========== PROVIDER COMPONENT ==========

interface ServiceProviderProps {
  children: React.ReactNode;
  config?: Partial<ServiceFactoryConfig>;
}

/**
 * ServiceProvider - Envuelve la app para inyectar servicios
 * Debe estar dentro de <BrowserRouter> pero antes de componentes que usan servicios
 * 
 * Uso:
 * <BrowserRouter>
 *   <ServiceProvider>
 *     <App />
 *   </ServiceProvider>
 * </BrowserRouter>
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  config: overrideConfig,
}) => {
  const value = useMemo<ServiceContextValue>(() => {
    try {
      const envConfig = getServiceFactoryConfigFromEnv();
      const finalConfig = { ...envConfig, ...overrideConfig };
      const factory = createServiceFactory(finalConfig);

      return {
        ...factory,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error creating service factory:', error);
      return {
        paymentService: null as any,
        inventoryService: null as any,
        settlementService: null as any,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }, [overrideConfig]);

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

ServiceProvider.displayName = 'ServiceProvider';

// ========== HOOKS ==========

/**
 * useServices - Hook para acceder a todos los servicios
 * @returns Objeto con paymentService, inventoryService, settlementService
 */
export function useServices(): ServiceFactory {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useServices debe usarse dentro de <ServiceProvider>');
  }

  if (context.error) {
    throw context.error;
  }

  return {
    paymentService: context.paymentService,
    inventoryService: context.inventoryService,
    settlementService: context.settlementService,
  };
}

/**
 * usePaymentService - Hook para acceder al servicio de pagos
 * @returns PaymentServiceInterface
 */
export function usePaymentService(): PaymentServiceInterface {
  const { paymentService } = useServices();
  return paymentService;
}

/**
 * useInventoryService - Hook para acceder al servicio de inventario
 * @returns InventoryServiceInterface
 */
export function useInventoryService(): InventoryServiceInterface {
  const { inventoryService } = useServices();
  return inventoryService;
}

/**
 * useSettlementService - Hook para acceder al servicio de settlements
 * @returns SettlementServiceInterface
 */
export function useSettlementService(): SettlementServiceInterface {
  const { settlementService } = useServices();
  return settlementService;
}

export default ServiceProvider;
