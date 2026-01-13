
import { createClient } from '@supabase/supabase-js';

// Use process.env as shimmed in vite.config.ts to avoid TS error on import.meta.env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * isSupabaseConfigured
 * Verifica si las credenciales son reales.
 */
export const isSupabaseConfigured = 
  SUPABASE_URL !== '' && 
  SUPABASE_URL !== 'https://your-project-url.supabase.co' && 
  SUPABASE_ANON_KEY !== '' && 
  SUPABASE_ANON_KEY !== 'your-anon-key';

// Inicialización segura
const finalUrl = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder-project.supabase.co';
const finalKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          school_id: string;
          student_id: string;
          grade: string;
          balance: number;
          created_at: string;
        };
        Insert: any;
        Update: any;
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number;
          image_url: string;
          calories: number | null;
          unit_id: string;
          status: string;
          created_at: string;
        };
        Insert: any;
        Update: any;
      };
      transactions: {
        Row: {
          id: string;
          school_id: string;
          unit_id: string;
          student_id: string;
          amount: number;
          items: any;
          payment_method: string;
          type: string;
          status: string;
          created_at: string;
        };
        Insert: any;
        Update: any;
      };
    };
  };
};
