import { createClient } from "@supabase/supabase-js";

// Variables de entorno (Vite las inyecta en build)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Verifica si Supabase está configurado correctamente
 */
export const isSupabaseConfigured =
  SUPABASE_URL !== "" &&
  SUPABASE_URL !== "https://your-project-url.supabase.co" &&
  SUPABASE_ANON_KEY !== "" &&
  SUPABASE_ANON_KEY !== "your-anon-key";

// Fallback seguro para evitar crash en build
const finalUrl = isSupabaseConfigured
  ? SUPABASE_URL
  : "https://placeholder-project.supabase.co";

const finalKey = isSupabaseConfigured
  ? SUPABASE_ANON_KEY
  : "placeholder-key";

/**
 * ✅ CLIENTE ÚNICO DE SUPABASE
 * ⚠️ NO duplicar este export en ningún lugar del archivo
 */
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Tipado base (opcional pero correcto)
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          school_id: string | null;
          student_id: string | null;
          grade: string | null;
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
