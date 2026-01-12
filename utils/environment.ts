// utils/environment.ts

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  env: Environment;
  appName: string;
  apiUrl: string;
  wsUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  useMockData: boolean;
  stripePublicKey?: string;
  features: {
    payments: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  debug: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// Obtener el ambiente actual
export const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.VITE_APP_ENV as Environment;
  return env || 'development';
};

// Verificar si estamos en cada ambiente
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

// Configuración del ambiente actual
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  
  return {
    env,
    appName: import.meta.env.VITE_APP_NAME || 'MeCard Platform',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    
    features: {
      payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true'
    },
    
    debug: {
      enabled: import.meta.env.VITE_DEBUG_MODE === 'true',
      logLevel: (import.meta.env.VITE_LOG_LEVEL || 'info') as any
    }
  };
};

// Logger condicional según ambiente
class EnvironmentLogger {
  private config = getEnvironmentConfig();
  
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    if (!this.config.debug.enabled) return level === 'error';
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.config.debug.logLevel];
  }
  
  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(`[${this.config.env.toUpperCase()}] [DEBUG]`, ...args);
    }
  }
  
  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(`[${this.config.env.toUpperCase()}] [INFO]`, ...args);
    }
  }
  
  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.config.env.toUpperCase()}] [WARN]`, ...args);
    }
  }
  
  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[${this.config.env.toUpperCase()}] [ERROR]`, ...args);
    }
  }
  
  // Logging especial para ambientes no productivos
  staging(...args: any[]) {
    if (isStaging()) {
      console.log(`[STAGING TEST]`, ...args);
    }
  }
}

export const logger = new EnvironmentLogger();

// Banner de ambiente en consola
export const displayEnvironmentBanner = () => {
  const config = getEnvironmentConfig();
  const emoji = {
    development: '🔧',
    staging: '🧪',
    production: '🚀'
  };
  
  console.log(`
╔════════════════════════════════════════════════╗
║  ${emoji[config.env]} ${config.appName.padEnd(42)} ║
║  Environment: ${config.env.toUpperCase().padEnd(34)} ║
║  Mock Data:   ${String(config.useMockData).padEnd(34)} ║
║  Debug Mode:  ${String(config.debug.enabled).padEnd(34)} ║
╚════════════════════════════════════════════════╝
  `);
  
  if (isStaging()) {
    console.warn('⚠️  STAGING ENVIRONMENT - For testing purposes only');
  }
  
  if (isProduction()) {
    console.log('✅ PRODUCTION ENVIRONMENT - Live mode active');
  }
};

// Feature flag helper
export const useFeature = (feature: keyof EnvironmentConfig['features']): boolean => {
  const config = getEnvironmentConfig();
  return config.features[feature];
};

// API URL helper
export const getApiUrl = (endpoint: string): string => {
  const config = getEnvironmentConfig();
  return `${config.apiUrl}${endpoint}`;
};

// Validar configuración al inicio
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  
  // Validaciones para staging y production
  if (!isDevelopment()) {
    if (!config.supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required in staging/production');
    }
    if (!config.supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required in staging/production');
    }
    if (config.features.payments && !config.stripePublicKey) {
      errors.push('VITE_STRIPE_PUBLIC_KEY is required when payments are enabled');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Export default config
export default getEnvironmentConfig();