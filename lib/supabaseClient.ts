// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentConfig, logger, isDevelopment } from '../utils/environment';

const config = getEnvironmentConfig();

// Verificar si Supabase está configurado
export const isSupabaseConfigured = 
  !!config.supabaseUrl && 
  !!config.supabaseAnonKey && 
  !config.useMockData;

// Cliente de Supabase (solo si está configurado)
let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage,
          storageKey: `mecard-auth-${config.env}`
        },
        global: {
          headers: {
            'x-mecard-env': config.env
          }
        },
        db: {
          schema: config.env === 'production' ? 'public' : config.env
        }
      }
    );
    
    logger.info('Supabase client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Supabase client:', error);
  }
} else {
  if (isDevelopment()) {
    logger.info('Running in MOCK mode - Supabase disabled');
  } else {
    logger.warn('Supabase not configured properly for', config.env);
  }
}

export const supabase = supabaseInstance!;

// Helper para verificar conexión
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) {
    logger.warn('Supabase not configured');
    return false;
  }
  
  try {
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Supabase connection check failed:', error);
      return false;
    }
    
    logger.info('Supabase connection OK');
    return true;
  } catch (error) {
    logger.error('Supabase connection error:', error);
    return false;
  }
};

// API Helpers
export const supabaseAPI = {
  async getSchools() {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async getStudents(schoolId?: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    let query = supabase.from('students').select('*');
    if (schoolId) query = query.eq('school_id', schoolId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async createStudent(student: any) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('students').insert([student]).select().single();
    if (error) throw error;
    logger.info('Student created:', data.id);
    return data;
  },
  
  async updateStudent(id: string, updates: any) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
    if (error) throw error;
    logger.info('Student updated:', data.id);
    return data;
  },
  
  async getTransactions(filters?: { studentId?: string; schoolId?: string }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    let query = supabase.from('transactions').select('*');
    if (filters?.studentId) query = query.eq('student_id', filters.studentId);
    if (filters?.schoolId) query = query.eq('school_id', filters.schoolId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async createTransaction(transaction: any) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('transactions').insert([transaction]).select().single();
    if (error) throw error;
    logger.info('Transaction created:', data.id);
    return data;
  }
};

export default supabase;