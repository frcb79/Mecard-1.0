
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

// These would normally be in process.env
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
