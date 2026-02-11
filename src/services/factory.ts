/**
 * SERVICE FACTORY
 * Factory pattern para crear instancias de servicios (mock o reales)
 * Permite cambiar entre mock y servicios reales sin tocar componentes
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import {
  ServiceFactory,
  ServiceFactoryConfig,
  PaymentServiceInterface,
  InventoryServiceInterface,
  SettlementServiceInterface,
} from './types';
import MockPaymentService from './MockPaymentService';
import MockInventoryService from './MockInventoryService';
import MockSettlementService from './MockSettlementService';

/**
 * Crea una instancia del ServiceFactory con la configuración especificada
 * @param config - Configuración del factory (useMock, mockDelay, etc.)
 * @returns ServiceFactory con los servicios apropiados
 */
export function createServiceFactory(config: ServiceFactoryConfig): ServiceFactory {
  const { useMock = true, mockDelay = 1000, storageKey = 'mecard_services' } =
    config;

  let paymentService: PaymentServiceInterface;
  let inventoryService: InventoryServiceInterface;
  let settlementService: SettlementServiceInterface;

  if (useMock) {
    // Use mock services for development/testing
    paymentService = new MockPaymentService(mockDelay);
    inventoryService = new MockInventoryService(Math.floor(mockDelay / 2));
    settlementService = new MockSettlementService(mockDelay);
  } else {
    // TODO: Real services will be implemented here
    // For now, fall back to mock
    paymentService = new MockPaymentService(mockDelay);
    inventoryService = new MockInventoryService(Math.floor(mockDelay / 2));
    settlementService = new MockSettlementService(mockDelay);
  }

  return {
    paymentService,
    inventoryService,
    settlementService,
  };
}

/**
 * Detecta la configuración desde variables de entorno
 * @returns ServiceFactoryConfig basada en env variables
 */
export function getServiceFactoryConfigFromEnv(): ServiceFactoryConfig {
  // Check for REACT_APP_USE_REAL_SERVICES (from .env files)
  const useRealFromEnv =
    typeof process !== 'undefined' && process.env.REACT_APP_USE_REAL_SERVICES === 'true';

  // Check for VITE_USE_REAL_SERVICES (from Vite import.meta.env)
  let useRealFromVite = false;
  try {
    const meta = import.meta as any;
    useRealFromVite = meta.env && meta.env.VITE_USE_REAL_SERVICES === 'true';
  } catch (e) {
    // import.meta not available
  }

  const useReal = useRealFromEnv || useRealFromVite;

  // Get mock delay from environment
  let mockDelay = 1000; // Default
  if (typeof process !== 'undefined' && process.env.REACT_APP_MOCK_DELAY) {
    mockDelay = parseInt(process.env.REACT_APP_MOCK_DELAY, 10);
  } else {
    try {
      const meta = import.meta as any;
      if (meta.env && meta.env.VITE_MOCK_DELAY) {
        mockDelay = parseInt(meta.env.VITE_MOCK_DELAY, 10);
      }
    } catch (e) {
      // import.meta not available
    }
  }

  return {
    useMock: !useReal,
    mockDelay,
  };
}

// Singleton instance
let factoryInstance: ServiceFactory | null = null;

/**
 * Obtiene la instancia singleton del factory
 * Inicializa si no existe
 * @returns ServiceFactory global
 */
export function getServiceFactory(): ServiceFactory {
  if (!factoryInstance) {
    const config = getServiceFactoryConfigFromEnv();
    factoryInstance = createServiceFactory(config);
  }
  return factoryInstance;
}

/**
 * Reinicializa la instancia singleton (útil para testing)
 * @param config - Nueva configuración
 */
export function resetServiceFactory(
  config: Partial<ServiceFactoryConfig> = {}
): ServiceFactory {
  const currentConfig = getServiceFactoryConfigFromEnv();
  const newConfig = { ...currentConfig, ...config };
  factoryInstance = createServiceFactory(newConfig);
  return factoryInstance;
}

export default createServiceFactory;
