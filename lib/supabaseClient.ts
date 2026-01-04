
import { createClient } from '@supabase/supabase-js';

// Access variables safely from the environment
// We use fallback empty strings to prevent the client from crashing on init
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/**
 * isSupabaseConfigured
 * Checks if the environment has been provided with real Supabase credentials.
 * This prevents "NetworkError" by allowing the app to skip fetching and use demo data.
 */
export const isSupabaseConfigured = 
  SUPABASE_URL !== '' && 
  SUPABASE_URL !== 'https://your-project-url.supabase.co' && 
  SUPABASE_ANON_KEY !== '' && 
  SUPABASE_ANON_KEY !== 'your-anon-key';

// Initialize with placeholders if not configured to satisfy the singleton pattern
export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co', 
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key'
);

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