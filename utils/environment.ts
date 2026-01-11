// utils/environment.ts

// Función para detectar el ambiente actual
export const getEnvironment = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) return 'development';
  if (hostname.includes('staging')) return 'staging';
  if (hostname.includes('mecard.io')) return 'production'; // Asumiendo dominio de producción
  return 'development';
};

// Configuración centralizada
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    supabaseUrl: 'https://dev.supabase.co',
    supabaseKey: 'DEV_SUPABASE_KEY',
    featureFlags: {
      payments: true,
      analytics: true,
      notifications: true,
    },
  },
  staging: {
    apiBaseUrl: 'https://staging.mecard.io/api',
    supabaseUrl: 'https://staging.supabase.co',
    supabaseKey: 'STAGING_SUPABASE_KEY',
    featureFlags: {
      payments: true,
      analytics: true,
      notifications: false,
    },
  },
  production: {
    apiBaseUrl: 'https://mecard.io/api',
    supabaseUrl: 'https://prod.supabase.co',
    supabaseKey: 'PROD_SUPABASE_KEY',
    featureFlags: {
      payments: true,
      analytics: false,
      notifications: false,
    },
  },
};

export const currentEnv = getEnvironment();
export const currentConfig = config[currentEnv];

// Logger condicional
export const logger = {
  log: (...args: any[]) => {
    if (currentEnv !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (currentEnv !== 'production') {
      console.error(...args);
    }
    // Aquí se podría integrar un servicio de logging de errores para producción
  },
};

// Health checks
export const runHealthChecks = () => {
  logger.log('Running health checks for', currentEnv);
  if (!currentConfig.supabaseUrl || !currentConfig.supabaseKey) {
    logger.error('Supabase config is missing!');
    return false;
  }
  logger.log('All health checks passed.');
  return true;
};
